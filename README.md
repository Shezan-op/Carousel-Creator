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
  <a href="./WALKTHROUGH.md">🎯 60-Second Walkthrough</a>
</p>

---

## What is Carousel Creator?

Carousel Creator is a **high-performance, browser-based design tool** that converts raw text into pixel-perfect LinkedIn and Instagram carousels — no Canva, no Figma, no design skills required.

It was built from the ground up as a **React 19 + TypeScript** single-page application with a custom **Bulk Compiler**, a **Triple-Layer Markdown Engine**, and a **Multi-Template Export Pipeline** that generates print-ready assets in one click.

---

## ✨ Feature Highlights

### 🎨 Three Professional Templates

| Minimal | Faux Tweet | Brutalist |
|---------|-----------|-----------|
| Clean, modern typography with accent highlights | Simulates a viral X/Twitter post with engagement metrics | Heavy uppercase type with high-contrast block accents |

### ⚡ The Bulk Compiler & Image Injector

Write naturally, get structured slides. The compiler uses a tag-based syntax:

- **Native Image Support**: Drop any image onto the Bulk Editor to inject it into your carousel instantly at the cursor position.
- **Tag-based Syntax**:

```
/h/ Your Headline Here
/sh/ A subtitle or section header
Body text flows naturally without any tags.

/h/ Slide 2 Title
More body content for slide 2.
```

Double-enter creates a new slide. Per-slide overrides are inline: `/h, s:120, a:center/ Big Title`.

### 🖋 Multi-Font Markdown Engine

- `*highlight*` → Template-aware accent (color in Minimal, block in Brutalist, link-blue in Tweet)
- `**bold**` → Extra-heavy weight
- `_italic_` → Italic emphasis
- `__underline__` → Clean CSS-based underline
- **Character Foundry**: Independently select any Google Font for **Headlines**, **Subheadings**, and **Body text**. Optimized deduped injection ensures fast loading.

### 📁 Agency Workflow & Portability

- **Saved Project Slots**: Save multiple drafts locally and switch between them instantly.
- **Brand Presets**: Store unique combinations of fonts, colors, and author data for different clients.
- **Project Backup (.carousel)**: Export your entire workspace into a single portable file to keep backups or move your work between browsers.

### 📱 Focus Modal (Mobile Editor)

A Figma-inspired mobile workspace that allows for per-slide precision tuning:

- **Numerical Sizing**: Type exact pixel values for every primary text element.
- **Segmented Alignment**: Toggle Horizontal alignment (Left/Center/Right) instantly.
- **Vertical Drafting**: Micro-tune the Y-axis position with 10px increments.
- **Live Font Preview**: Type the name of any Google Font and see it render instantly in the focus preview.
- **Per-Slide Backgrounds**: Upload unique high-res background images for specific slides via the "Bg" tab.

### 🖼 Professional Media Support

- **Per-Slide BG**: Individual slides can override the global background with unique images.
- **Export Ghosting Fix**: UI elements like slide numbers and arrows are automatically stripped from exports for a clean, pixel-perfect finish.
- **Grid View Reordering**: Mobile-optimized "Shift Left/Right" buttons allow for easy slide reordering without complex drag-and-drop on small screens.

### 🔒 Enterprise Infrastructure

- **Async Persistence**: Uses **IndexedDB (via localforage)** for heavy data (images, projects, presets), bypassing the 5MB `localStorage` limit and preventing UI lock-ups.
- **BYOK Architecture**: Your OpenRouter API key is stored locally, never transmitted to us.
- **Stable Export Engine**: Processes slides sequentially with memory clearing to handle large 10+ slide carousels on low-end devices.

---

## 🏗 Architecture & Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | React 19 + TypeScript | Type-safe component architecture |
| **Storage** | IndexedDB + localforage | High-capacity async local persistence |
| **Build** | Vite 7 | Sub-second HMR, optimized production bundles |
| **Styling** | Tailwind CSS 4.0 | Utility-first responsive design |
| **Export: PDF** | `html-to-image` + `jsPDF` | Sequential capture loop → multi-page PDF |
| **Export: ZIP** | `html-to-image` + `JSZip` | Multi-template batch render → ZIP archive |
| **AI** | OpenRouter API | Optional text-to-carousel generation (BYOK) |
| **Analytics** | Vercel Analytics | Production performance monitoring |

### Key Engineering Decisions

- **Rigid Canvas (1080×1350)**: All slides render at a fixed 4:5 aspect ratio inside a `transform: scale()` wrapper. The DOM node is always 1080×1350px — scaling is purely visual. This guarantees pixel-perfect exports regardless of viewport size.
- **Safe Zone Padding**: 108px padding on all sides constrains text to an 864×1134px safe zone, preventing content from being cropped on any platform.
- **Sequential Capture**: The export engine captures one slide at a time with a 500ms delay between pages. This ensures React reconciliation is complete and prevents browser crashes due to memory spikes during heavy DOM-to-Image conversions.
- **Multi-Font Orchestrator**: Uses custom logic to merge multiple font requests into a single Google Fonts API call with full weight support (400-900 + italics), minimizing layout shift.
- **Nested Markdown Parser**: A sequential HTML injector that allows for complex formatting combinations (e.g., ****bold + italic + underline****).

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
├── App.tsx                    # Root shell, global state, layout
├── main.tsx                   # React DOM entry point
├── types.ts                   # TypeScript interfaces (Slide, Theme, CarouselData)
├── index.css                  # Global styles, Tailwind imports, custom scrollbar
├── components/
│   ├── LeftPane.tsx            # Bulk compiler, AI generator, tuner controls, setup
│   ├── CarouselPreview.tsx     # Multi-template slide renderer, export nodes
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
| Double newline | New slide | *(blank line between blocks)* |

---

## 🔐 Security Model

- **Lead Capture**: `localStorage.setItem('carousel_unlocked', 'true')` is strictly inside the `try` block after a successful API call. Network failures refuse the unlock token.
- **Rate Limiting**: 30-second cooldown between email submissions (client-side).
- **Input Sanitization**: Text inputs capped at 10,000 characters to prevent ReDoS. Slide count capped at 50.
- **API Key Handling**: OpenRouter key stored as a password input, persisted only to local `localStorage`.
- **CORS Safety**: All images (avatar, background) are converted to base64 data URLs on ingestion, preventing tainted canvas errors during export.

---

## 📈 SEO & Discovery

`LinkedIn Carousel Generator` · `Instagram Carousel Maker` · `Free AI Carousel Tool` · `Open Source Content Creation` · `1080x1350 Social Media Design` · `React Carousel Export` · `Bulk Text to Carousel` · `Professional Slide Generator`

---

## 📄 License

MIT — free for personal and commercial use.

---

<p align="center">
  Built with 🧠 by <a href="https://www.linkedin.com/in/shezanahmed29/" target="_blank"><strong>Shezan Ahmed</strong></a> · Founder @ <a href="https://www.linkedin.com/company/lead-linked/" target="_blank">LeadLinked</a>
</p>
