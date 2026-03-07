<p align="center">
  <img src="./public/Logo.png" alt="Carousel Creator Logo" width="80" />
</p>

<h1 align="center">Carousel Creator</h1>

<p align="center">
  <strong>Transform raw text into viral social media carousels in seconds.</strong><br/>
  100% serverless. Privacy-first. Built for modern creators.
</p>

<p align="center">
  <a href="https://carousel-creator-kohl.vercel.app/" target="_blank">🚀 Live Demo</a> &nbsp;·&nbsp;
  <a href="./HOW_TO_USE.md">📖 How to Use</a> &nbsp;·&nbsp;
  <a href="./WALKTHROUGH.md">🎯 60-Second Walkthrough</a> &nbsp;·&nbsp;
  <a href="./CONTRIBUTING.md">🤝 Contributing</a>
</p>

---

## What is Carousel Creator?

Carousel Creator is a **high-performance, browser-based design tool** that converts raw text into pixel-perfect LinkedIn, Instagram, and Twitter/X carousels — no Canva, no Figma, no design skills required.

Everything runs **entirely in your browser**. Your data never leaves your device. There are no servers, no accounts, no cloud uploads. You type text, pick your style, and download beautiful carousels in seconds.

It was built from the ground up as a **React 19 + TypeScript** single-page application with a custom **Bulk Compiler**, a **Triple-Layer Markdown Engine**, and a **Multi-Template Export Pipeline** that generates print-ready assets in one click.

---

## ✨ Feature Highlights

### 🎨 Four Professional Visual Motifs

| Minimal | Faux Tweet | Brutalist | Highlight |
|---------|-----------|-----------|-----------|
| Clean, modern typography with subtle accent colors | Simulates a viral X/Twitter post with engagement metrics | Heavy uppercase type with high-contrast block accents | Bold accent highlights with dynamic color emphasis |

Switch between templates in one click. Your content stays the same — only the visual presentation changes.

### ⚡ The Bulk Compiler & Drag-and-Drop Image Injector

Write naturally, get structured slides. The compiler uses a simple tag-based syntax:

- **Native Drag-and-Drop**: Drop any image file directly onto the text editor to inject it into your carousel instantly at the cursor position.
- **Tag-based Syntax**:

```
/h/ Your Headline Here
/sh/ A subtitle or section header
Body text flows naturally without any tags.

/h/ Slide 2 Title
More body content for slide 2.
```

A blank line (double Enter) creates a new slide. Per-slide overrides are inline: `/h, s:120, a:center/ Big Title`.

### 🖋 Multi-Font Nested Markdown Engine

Format your text with familiar syntax that works across all templates:

- `*highlight*` → Template-aware accent (colored text in Minimal, background block in Brutalist, link-blue in Tweet)
- `**bold**` → Extra-heavy weight
- `_italic_` → Italic emphasis
- `__underline__` → Clean CSS-based underline
- **Nesting**: Combine styles freely — `**_bold italic_**`, `*__highlighted underline__*`
- **Character Foundry**: Independently select any Google Font for **Headlines**, **Subheadings**, and **Body text**. The font engine dedupes and batches font requests for fast loading.

### 📐 Format Switcher (Portrait & Square)

Switch between two professional aspect ratios with one click:

| Format | Dimensions | Best For |
|--------|-----------|----------|
| **Vertical (4:5)** | 1080 × 1350px | LinkedIn carousels, Instagram posts |
| **Square (1:1)** | 1080 × 1080px | Twitter/X posts, universal sharing |

The scaling math dynamically recalculates so your canvas never warps or stretches — it just works.

### 🔃 1-Click Theme Invert

Instantly swap your background and text colors to toggle between dark and light modes. Located in the **Brand Palette** section. One click → your entire carousel flips. Perfect for testing which version looks better before exporting.

### 🏷️ Global Brand Watermark

Upload your logo or brand mark once, and it appears on **every single slide** automatically in the top-right corner.

- Logos are auto-compressed to 300px max width for performance.
- Displayed at 80% opacity so it doesn't overpower your content.
- Persisted to IndexedDB — your watermark survives browser refreshes.
- Easily remove it with one click when you don't need it.

### 📊 Dynamic Progress Bar

Add a visual progress indicator to your slides so viewers know how far along they are:

| Position | Effect |
|----------|--------|
| **Off** | No progress bar (default) |
| **Top** | Colored bar at the top of each slide |
| **Bottom** | Colored bar at the bottom of each slide |

The bar's width grows proportionally with each slide (Slide 3 of 10 = 30% width). Uses your accent color for seamless branding.

### 📱 Social Feed Sandbox

Preview how your carousel will look inside real social media feeds:

- **LinkedIn Sandbox** — Wraps your carousel in a simulated LinkedIn post with profile info, reactions, and engagement UI.
- **Instagram Sandbox** — Shows your carousel inside an Instagram-style frame with like/comment icons.
- **Off** — Raw preview with no frame (default).

### 🖼 Asset Gallery (Image Locker)

A persistent gallery of your uploaded images. Upload once, use across all projects:

- Upload multiple images at once.
- Click any image to copy its `[img:ID]` tag to your clipboard.
- Paste the tag into your bulk text to embed the image in any slide.
- Images are stored in IndexedDB, so they survive browser refreshes.
- Delete images you no longer need with one click.

### 📁 Agency Workflow & Portability

- **Saved Project Slots**: Save up to 50 individual carousel drafts in your browser. Switch between them instantly.
- **Brand Presets**: Store unique combinations of fonts, colors, and author data for different clients. One click to swap branding.
- **Project Backup (.carousel)**: Export your entire workspace (text, theme, images) into a single portable `.carousel` file. Load it back on any device.
- **Auto-Sync**: Your last active project is always restored on refresh using IndexedDB.

### 📱 Focus Modal (Mobile Editor)

A Figma-inspired mobile workspace for per-slide precision tuning:

- **Numerical Sizing**: Type exact pixel values for every text element (H1, H2/H3, Body).
- **Segmented Alignment**: Toggle Horizontal alignment (Left/Center/Right) instantly.
- **Vertical Drafting**: Micro-tune the Y-axis position with 10px increments.
- **Live Font Preview**: Type any Google Font name and see it render instantly.
- **Per-Slide Backgrounds**: Upload unique background images for individual slides.

### ⏪ Undo / Redo (Time-Travel Engine)

Made a mistake? Use `Ctrl+Z` (undo) and `Ctrl+Shift+Z` (redo) to navigate through your text editing history. The engine saves snapshots every time you pause typing for 500ms. History is capped at 50 states to prevent memory bloat.

### 🔒 Enterprise Infrastructure

- **Async Persistence**: Uses **IndexedDB (via localforage)** for heavy data (images, projects, presets), bypassing the 5MB `localStorage` limit.
- **BYOK Architecture**: Your OpenRouter API key is stored locally, never transmitted to anyone.
- **Stable Export Engine**: Processes slides sequentially with memory clearing to handle large 10+ slide carousels on low-end devices.
- **Export Ghosting Fix**: UI elements like slide numbers, arrows, and safe zone guides are automatically stripped from exports.

---

## 🏗 Architecture & Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | React 19 + TypeScript | Type-safe component architecture |
| **Storage** | IndexedDB + localforage | High-capacity async local persistence |
| **Build** | Vite 7 | Sub-second HMR, optimized production bundles |
| **Styling** | Tailwind CSS 4.0 | Utility-first responsive design |
| **DnD** | @dnd-kit | Drag-and-drop slide reordering |
| **Export: PDF** | `html-to-image` + `jsPDF` | Sequential capture → multi-page PDF |
| **Export: ZIP** | `html-to-image` + `JSZip` | Multi-template batch render → ZIP archive |
| **AI** | OpenRouter API | Optional text-to-carousel generation (BYOK) |
| **Analytics** | Vercel Analytics + Speed Insights | Production performance monitoring |

### Key Engineering Decisions

- **Rigid Canvas**: All slides render at a fixed 1080px width with dynamic height (1350px for portrait, 1080px for square) inside a `transform: scale()` wrapper. The DOM node is always full-size — scaling is purely visual. This guarantees pixel-perfect exports regardless of viewport.
- **Safe Zone Padding**: 108px padding on all sides constrains text to an 864px-wide safe zone, preventing content from being cropped on any platform.
- **Sequential Capture**: The export engine captures one slide at a time with a 500ms delay between pages. This ensures React DOM reconciliation is complete and prevents browser crashes.
- **Multi-Font Orchestrator**: Merges multiple font requests into a single Google Fonts API call with full weight support (400-900 + italics), minimizing layout shift.
- **Nested Markdown Parser**: A sequential HTML injector that allows complex formatting combinations.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm

### Local Development

```bash
git clone https://github.com/Shezan-op/Carousel-Creator.git
cd Carousel-Creator
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

### Production Build

```bash
npm run build    # TypeScript check + Vite production bundle
npm run preview  # Preview the production build locally
```

### Deploy to Vercel

```bash
# Option 1: CLI
npx vercel --prod

# Option 2: Git-based (recommended)
# Push to main → Vercel auto-deploys
git push origin main
```

### Environment Variables (Optional)

| Variable | Purpose |
|----------|---------|
| `VITE_GOOGLE_SCRIPT_URL` | Google Apps Script endpoint for lead capture |

---

## 📁 Project Structure

```
src/
├── App.tsx                    # Root shell, global state, persistence layer
├── main.tsx                   # React DOM entry point
├── types.ts                   # TypeScript interfaces (Slide, Theme, CarouselData)
├── utils.ts                   # Shared utilities (markdown parser, image compression)
├── index.css                  # Global styles, Tailwind imports, custom scrollbar
├── components/
│   ├── LeftPane.tsx            # Bulk compiler, AI generator, tuner controls, setup
│   ├── CarouselPreview.tsx     # Multi-template slide renderer, export nodes, DnD
│   ├── ExportControls.tsx      # PDF/ZIP export engine, lead capture modal
│   └── NetflixIntro.tsx        # Animated splash screen
public/
├── Logo.png                   # App logo
├── manifest.json              # PWA manifest
└── *.pdf                      # Sample exported carousels
```

---

## 🧪 Bulk Compiler Syntax Reference

| Syntax | Effect | Example |
|--------|--------|---------|
| `/h/ text` | Headline (H1) | `/h/ Why AI Matters` |
| `/sh/ text` | Subheadline (H2) or Section Header (H3) | `/sh/ The 5 Key Trends` |
| Plain text | Body paragraph | `AI is transforming every industry.` |
| `/h, s:120/` | Headline with custom size | `/h, s:120/ BIG TITLE` |
| `/sh, sh_s:60/` | Subhead with custom size | `/sh, sh_s:60/ Sized Subtitle` |
| `/h, a:center/` | Text alignment override | `/h, a:center/ Centered` |
| `/h, y:50/` | Y-offset (vertical shift) | `/h, y:50/ Shifted Down` |
| `/h, bg:ID/` | Per-slide background image | `/h, bg:bg_7f2x1/ Custom BG` |
| `*text*` | Highlight accent | `This is *important*` |
| `**text**` | Bold | `This is **critical**` |
| `_text_` | Italic | `This is _emphasized_` |
| `__text__` | Underline | `This is __underlined__` |
| `[img:ID]` | Inline image | `[img:bg_7f2x1]` |
| Double newline | New slide | *(blank line between blocks)* |

---

## 🔐 Security Model

- **Zero Server Architecture**: No backend. All data stays in your browser's local storage and IndexedDB.
- **Lead Capture**: `localStorage.setItem('carousel_unlocked', 'true')` is strictly inside the `try` block after a successful API call. Network failures refuse the unlock token.
- **Rate Limiting**: 30-second cooldown between email submissions (client-side).
- **Input Sanitization**: Text inputs capped at 10,000 characters. Slide count capped at 50.
- **API Key Handling**: OpenRouter key stored as a password input, persisted only to local `localStorage`.
- **CORS Safety**: All images are converted to base64 data URLs on ingestion, preventing tainted canvas errors during export.

---

## 📈 SEO & Discovery

`LinkedIn Carousel Generator` · `Instagram Carousel Maker` · `Twitter/X Square Carousel` · `Free AI Carousel Tool` · `Open Source Content Creation` · `1080x1350 Social Media Design` · `React Carousel Export` · `Bulk Text to Carousel` · `Professional Slide Generator` · `Brand Watermark Carousel`

---

## 📄 License

MIT — free for personal and commercial use.

---

<p align="center">
  Built with 🧠 by <a href="https://www.linkedin.com/in/shezanahmed29/" target="_blank"><strong>Shezan Ahmed</strong></a> · Founder @ <a href="https://www.linkedin.com/company/lead-linked/" target="_blank">LeadLinked</a>
</p>
