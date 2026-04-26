# 🛠️ The Engine Room — Technical Documentation

> For developers who want to understand the architecture, modify the codebase, or contribute.

---

## Stack at a Glance

| Layer | Technology | Version |
|---|---|---|
| Framework | React | 19 |
| Language | TypeScript | 5.9 |
| Build Tool | Vite | 7 |
| Styling | Tailwind CSS | 4.0 |
| State Management | React `useState` / `useCallback` | — |
| Persistence | `localforage` (IndexedDB) | 1.10 |
| Image Rendering | `html-to-image` | 1.11 |
| PDF Generation | `jsPDF` | 4.2 |
| ZIP Generation | `JSZip` | 3.10 |
| Drag & Drop | `dnd-kit` | 6.3 |
| XSS Sanitization | DOMPurify | 3.3 |
| Schema Validation | Zod | 4.3 |
| PWA | `vite-plugin-pwa` (Workbox) | 1.2 |
| Hosting | Vercel | — |

---

## File Structure

```
src/
├── App.tsx                  # Root: state management + compileBulkText parser
├── types.ts                 # Core TypeScript interfaces (Slide, CarouselData, etc.)
├── schema.ts                # Zod validation schemas for saved data
├── utils.tsx                # renderHighlightedText + image compression
├── main.tsx                 # App entry point
├── index.css                # Global styles + Tailwind config
└── components/
    ├── LeftPane.tsx         # All control panels (103KB — the control center)
    ├── CarouselPreview.tsx  # Real-time preview gallery (63KB)
    └── ExportControls.tsx   # PDF & ZIP export pipeline (7KB)
```

---

## 1. The Parser (`compileBulkText`)

**Location**: `src/App.tsx`

The core parsing function transforms raw text into a typed `CarouselData` object.

### Algorithm

```
Input: bulkText (string)
         │
         ├─ Split by /\n\s*\n/ → one block per slide
         │
         └─ For each block:
               ├─ Split by \n → individual lines
               │
               └─ For each line:
                     ├─ Match /^\/([^/]+)\/\s*(.*)$/
                     │    group1 = tag+options  e.g. "h, s:140, a:center"
                     │    group2 = content text e.g. "Big Title Here"
                     │
                     ├─ Split group1 by ","
                     │    parts[0] = tag type  ("h", "sh", "config")
                     │    parts[1..n] = key:value option pairs
                     │
                     ├─ Parse options into Slide fields:
                     │    s:    → heading_size
                     │    sh_s: → subheading_size
                     │    b_s:  → body_size
                     │    y:    → y_offset
                     │    a:    → text_align
                     │    bg:   → bg_image
                     │
                     └─ Non-tagged lines → bodyLines[]

Output: CarouselData { theme: Theme, slides: Slide[] }
```

### Why text-as-source-of-truth?

Config overrides (size, alignment, etc.) are written directly **back** into the raw `bulkText` string via `injectOverride()`. This means the text file is always the canonical state — the parser can reconstruct the full carousel from text alone, which enables the `.carousel` export format.

---

## 2. The Renderer (`renderHighlightedText`)

**Location**: `src/utils.tsx`

Processes inline markdown-like syntax and returns sanitized JSX.

### Processing Order (matters — runs sequentially)

```
1. **bold**   →  <strong style="font-weight:900">
2. __under__  →  <span style="text-decoration:underline">
3. _italic_   →  <em style="font-style:italic">
4. *color*    →  <span style="color:{accentColor}">
              OR <span style="background:{accentColor}; color:#000"> (brutalist)
5. [img:id]   →  <img src="{base64}">
6. \n         →  <br />
```

**Security**: All output runs through `DOMPurify.sanitize()` with a strict allowlist before being rendered via `dangerouslySetInnerHTML`.

---

## 3. Persistence Architecture

### Two-tier storage

**IndexedDB** (via `localforage`) — for large objects:
- `carousel_inline_images` — all Base64 images, keyed by random ID
- `carousel_saved_projects` — array of `SavedProject` objects
- `carousel_brand_presets` — array of `BrandPreset` objects
- `carousel_watermark` — global brand watermark Base64
- `lastBulkText` — the current editor content

**localStorage** — for small, fast-access settings:
- `authorName`, `authorHandle`, `creatorAvatar`
- `heading_font`, `subheading_font`, `body_font`
- `custom_background`, `custom_text`, `custom_accent`
- `carousel_aspect_ratio`, `textAlign`, `noiseOpacity`
- `showProfile`, `footerLayout`, `showSafeZones`, `showSlideNumbers`
- `previewScale`

### Schema Validation on Load

All IndexedDB data is validated through Zod schemas on load:
```typescript
const validated = z.array(savedProjectSchema).safeParse(rawSavedProj);
if (validated.success) setSavedProjects(validated.data);
```
Corrupt or tampered data is silently ignored rather than crashing the app.

---

## 4. Export Pipeline

### Sequential Rendering Strategy

The export system uses **sequential** (not parallel) image capture to manage mobile RAM:

```typescript
// Pseudo-code for export loop
for (const slideNode of exportNodes) {
  const jpeg = await htmlToImage.toJpeg(slideNode, { quality: 0.95, pixelRatio: 2 });
  images.push(jpeg);
  // Next iteration starts only after previous resolves
}
```

Parallelizing this would cause RAM spikes and browser crashes on mobile devices.

### Resolution

Slides are always rendered at **1080px wide** with height determined by aspect ratio:
- Portrait (4:5): `1080 × 1350px`
- Square (1:1): `1080 × 1080px`

The hidden export nodes are rendered at full resolution, while the preview scales them down using CSS `transform: scale()`.

---

## 5. PWA & Offline Strategy

**Configuration**: `vite.config.ts`

The app uses **Workbox** via `vite-plugin-pwa`:

- **App assets** (JS/CSS/HTML/images): `CacheFirst` — cached at install time, served offline
- **Google Fonts CSS**: `CacheFirst`, 1-year expiration — cached after first font load
- **Google Fonts files** (gstatic): `CacheFirst`, 1-year expiration — fonts work offline after first use

The service worker auto-updates (`registerType: 'autoUpdate'`) and immediately claims all clients (`skipWaiting: true`, `clientsClaim: true`).

---

## 6. Multi-Font Engine

Three independent font states control each text layer:

```typescript
const [headingFont, setHeadingFont] = useState('Inter');
const [subheadingFont, setSubheadingFont] = useState('Inter');
const [bodyFont, setBodyFont] = useState('Inter');
```

A `useEffect` deduplicates the selected fonts and injects a single `<link>` tag to Google Fonts:

```
https://fonts.googleapis.com/css2?family=Inter:ital,wght@...&family=Playfair+Display:...&display=swap
```

Only unique fonts are requested — if all three use `Inter`, only one API call is made.

---

## 7. Key Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl/Cmd + Enter` | Export ZIP immediately |
| `Arrow Left` / `Arrow Right` | Navigate slides in the per-slide tuner modal |

---

## 8. Contributing Guidelines

1. Run `npm run lint` before every commit
2. Run `npx vitest` to confirm unit tests pass (`src/schema.test.ts`)
3. The `App.tsx` component is intentionally large (799 lines) — it is the centralized state manager. Do not split it without understanding all prop dependencies first.
4. When adding new persistence, prefer IndexedDB (via `localforage`) for anything over ~4KB.
5. Any text rendered as HTML must pass through `renderHighlightedText` which enforces DOMPurify sanitization.

---

Happy coding! 🚀
