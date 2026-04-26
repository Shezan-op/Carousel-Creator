# 🎠 Carousel Creator

> **The 100% free, local-first carousel engine for professional creators.**  
> No servers. No subscriptions. No watermarks. No tracking. Just raw creative power — in your browser.

[![Live App](https://img.shields.io/badge/🚀_Live_App-mycarouselcreator.vercel.app-brightgreen?style=for-the-badge)](https://mycarouselcreator.vercel.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Built with React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![PWA Ready](https://img.shields.io/badge/PWA-Offline_Ready-5A0FC8?style=for-the-badge)](https://web.dev/progressive-web-apps/)

---

## 📖 Table of Contents

- [What is Carousel Creator?](#-what-is-carousel-creator)
- [Who Is This For?](#-who-is-this-for)
- [Why It Was Built](#-why-it-was-built)
- [Features](#-features)
- [What to Expect](#-what-to-expect)
- [What NOT to Expect](#-what-not-to-expect)
- [Quick Start (5 Minutes)](#-quick-start-5-minutes)
- [The Syntax: Your Secret Language](#-the-syntax-your-secret-language)
- [Architecture & How It Works](#-architecture--how-it-works)
- [Tech Stack](#-tech-stack)
- [Running Locally](#-running-locally)
- [Security Model](#-security-model)
- [Custom GPT Integration](#-custom-gpt-integration)
- [Documentation Index](#-documentation-index)
- [FAQ](#-faq)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 What is Carousel Creator?

**Carousel Creator** is a browser-based, zero-server tool that transforms plain text into polished, export-ready social media carousels — the kind that stop the scroll on LinkedIn, Instagram, and X (Twitter).

You write. It designs. You download. No drag-and-drop. No endless template browsing. No monthly fee.

Think of it as a **professional design studio that lives entirely inside your browser** — and works even when you're offline on a plane.

```
You type text with simple tags  →  The engine compiles slides  →  You download PDF or ZIP
```

The key insight: **text is faster than design tools.** A creator who can type can produce a carousel in 2 minutes that would take 20 minutes in Canva.

---

## 🎯 Who Is This For?

| Creator Type | Use Case |
|---|---|
| **LinkedIn Personal Brands** | Thought leadership carousels, how-to guides, storytelling posts |
| **Content Marketers** | Multi-platform social media content at scale |
| **Educators & Coaches** | Step-by-step lesson carousels, frameworks, checklists |
| **Startup Founders** | Fundraising teasers, product announcements, case studies |
| **Freelancers & Agencies** | Client deliverables for carousel content strategy |
| **Journalists & Newsletters** | Visual summaries of longer-form content |
| **AI-powered creators** | Works natively with Custom GPT for bulk carousel generation |

**You do NOT need to be a designer.** You need to be able to type.

---

## 💡 Why It Was Built

The creator economy has a design bottleneck. Every serious creator knows they *should* be posting carousels — they get 3–5× more reach than single images on LinkedIn. But the tools are either:

- **Too slow** (Canva takes 20+ minutes per carousel)
- **Too expensive** (premium design tools with monthly subs)
- **Too cloud-dependent** (your data lives on someone else's server)
- **Too feature-bloated** (you need one thing: formatted slides)

Carousel Creator was built to solve all four problems at once. It's **text-first**, **local-first**, **free forever**, and **ruthlessly focused** on one job: turning ideas into downloadable carousels as fast as humanly possible.

---

## ✨ Features

### Core Engine
- **Tag-Based Syntax** — Use `/h/`, `/sh/`, and config tags to structure slides from plain text
- **Real-Time Preview** — Every keystroke instantly renders the carousel preview
- **Auto-Chunking** — Double-Enter to start a new slide. That's it.
- **Multi-Font Engine** — Set separate fonts for headlines, subheadings, and body text
- **1500+ Google Fonts** — Type any font name and it loads instantly

### Design & Customization
- **3 Built-in Templates** — Minimal, Tweet, and Brutalist styles
- **Custom Color Theme** — Full control over background, text, and accent colors
- **Per-Slide Overrides** — Change size, font, alignment, or background on individual slides
- **Portrait (4:5) & Square (1:1)** — Two aspect ratios for LinkedIn vs. Instagram
- **Custom Background Images** — Global or per-slide image backgrounds
- **Noise Texture Overlay** — Subtle grain for a premium paper-like feel
- **Brand Watermark** — Global logo watermark on every exported slide
- **Progress Bar** — Optional top or bottom swipe-progress indicator

### Branding System
- **Author Profile Footer** — Name, handle, and avatar on every slide
- **Brand Presets** — Save complete brand kits (colors + fonts + profile) and reuse them
- **Footer Layout Options** — Left, center, or right-aligned branding footer

### Content Tools
- **Inline Text Styling** — Bold (`**text**`), italic (`_text_`), underline (`__text__`), highlight (`*text*`)
- **Inline Images** — Embed uploaded images mid-slide with `[img:id]`
- **Slide Numbers Toggle** — Show or hide slide numbers globally
- **Safe Zone Overlay** — Visual guides to keep content inside platform safe areas
- **Drag-and-Drop Reorder** — Rearrange slides with a drag handle
- **Per-Slide Tuner** — Visual size/alignment/font editor per slide (no typing required)

### Export & Persistence
- **PDF Export** — Multi-page PDF optimized for LinkedIn carousel uploads
- **ZIP Export** — Folder of high-res JPEGs for Instagram/X posting
- **Keyboard Shortcut** — `Ctrl/Cmd + Enter` to instantly export ZIP
- **Saved Projects** — Save unlimited projects locally in IndexedDB
- **Brand Presets** — Save and load full brand configurations
- **`.carousel` File Format** — Export/import projects as portable JSON backup files
- **Offline Mode** — Full PWA — works with zero internet connection after first load
- **Installable** — Add to home screen on mobile or desktop like a native app

### AI Integration
- **Custom GPT Ready** — Pair with the [Carousel Bulk Converter GPT](https://chatgpt.com/g/g-67ce242099cc8191bc31289196b01f92-carousel-bulk-converter) to generate formatted text for batch import
- **Sandbox Preview Modes** — Preview how slides look in a LinkedIn or Instagram-style frame

---

## ✅ What to Expect

- **Instant results** — Type → Preview appears in real time, no loading spinner
- **High-quality exports** — Slides render at 1080×1350px (portrait) or 1080×1080px (square) — platform-native resolution
- **Complete privacy** — Your content never leaves your device. Zero telemetry on your content.
- **Offline operation** — After the first visit, the entire app works without WiFi
- **Persistent sessions** — Close the tab and reopen — your work is exactly where you left it
- **No account required** — Open the URL, start making carousels
- **Free, always** — No freemium tier, no credit system, no paywall

---

## ❌ What NOT to Expect

- **Collaborative editing** — This is a single-user, local-first tool. There is no real-time collaboration or shared projects.
- **Cloud backup** — Your projects live in your browser's IndexedDB. Clearing browser data will erase them unless you export `.carousel` files.
- **AI-generated designs** — The design engine is rule-based. It doesn't use AI to create layouts. You control everything.
- **Advanced image editing** — You can add images, but there's no crop, filter, or image manipulation. Use a photo editor first.
- **Animations or video** — Exports are static images/PDF only. No GIF or video output.
- **Cross-device sync** — Projects saved on your laptop won't appear on your phone. Export `.carousel` files to transfer.
- **Drag-and-drop layout builder** — This is intentionally text-first. Layout is controlled by tags, not a WYSIWYG canvas.

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Open the App
Go to **[mycarouselcreator.vercel.app](https://mycarouselcreator.vercel.app/)** — no signup needed.

### Step 2: Write Your First Carousel
Paste this into the text editor on the left:

```
/h/ 5 Lessons I Learned the Hard Way

/sh/ Most people figure this out too late.

This took me 3 years and 2 failed projects.

Here's what I wish someone had told me earlier.

/h/ Lesson 1: Start before you're ready

/sh/ Waiting for "perfect conditions" is procrastination in disguise.

Done is better than perfect.
Ship the first version. Iterate from feedback.

/h/ Lesson 2: Your network IS your net worth

/sh/ But not the way you think.

It's not about who you know.
It's about who knows *what you can do*.
```

### Step 3: Pick a Style
Click the **Design** tab → choose a template → adjust colors.

### Step 4: Add Your Branding
Go to the **Brand** tab → upload your photo → type your name and handle.

### Step 5: Download
Click **Download ZIP** for Instagram/X or **Download PDF** for LinkedIn.

That's it. Your carousel is ready to post. 🎉

---

## 📜 The Syntax: Your Secret Language

### Slide Separators
```
Every blank line (double Enter) = a new slide
```

### Content Tags (start of a line)

| Tag | Effect | Example |
|---|---|---|
| `/h/` | Headline (large, bold) | `/h/ The Big Idea` |
| `/sh/` | Subheading (medium) | `/sh/ Here's why this matters` |
| *(nothing)* | Body text | `This is the supporting detail.` |
| `/config/` | Settings-only line (no visible text) | `/config, b_s:50/` |

### Per-Slide Config Options (combine with any tag)

| Option | Description | Example |
|---|---|---|
| `s:` | Headline font size (px) | `/h, s:140/ Giant Title` |
| `sh_s:` | Subheading font size (px) | `/sh, sh_s:70/ Big Subhead` |
| `b_s:` | Body font size (px) | `/config, b_s:55/` |
| `a:` | Text alignment | `/h, a:center/ Centered` |
| `y:` | Vertical offset (px, can be negative) | `/h, y:-80/ Moved Up` |
| `bg:` | Background image ID | `/h, bg:img_abc123/ Title Slide` |

### Inline Text Styling

| Style | Markdown | Result |
|---|---|---|
| **Bold** | `**word**` | Heavy weight text |
| *Highlight/Color* | `*word*` | Accent color text |
| *Italic* | `_word_` | Italic text |
| Underline | `__word__` | Underlined text |

### Inline Images
```
[img:your_image_id]
```
Upload an image in the **Images** section first to get its ID.

---

## 🏗️ Architecture & How It Works

Carousel Creator is a **pure client-side PWA** — there is no backend, no database server, no API calls for content. Everything happens in the browser.

### Data Flow Diagram

```
User Text Input (Bulk Editor)
         │
         ▼
  ┌─────────────────────────────┐
  │   compileBulkText()         │
  │   Regex-based Parser        │
  │   (App.tsx)                 │
  │                             │
  │  1. Split by \n\s*\n        │
  │  2. Match /tag, opts/ lines │
  │  3. Build Slide[] objects   │
  └────────────┬────────────────┘
               │  CarouselData { theme, slides[] }
               ▼
  ┌─────────────────────────────┐
  │   React State Engine        │
  │   (useState / useCallback)  │
  │                             │
  │  Merges with:               │
  │  • customTheme              │
  │  • author branding          │
  │  • font selections          │
  └────────────┬────────────────┘
               │
       ┌───────┴────────┐
       ▼                ▼
  CarouselPreview    IndexedDB
  (Real-time DOM)    (localforage)
       │
       ▼ (on export)
  slide-export-node containers
  (hidden high-res DOM nodes)
       │
  ┌────┴─────────────────┐
  │   html-to-image      │
  │   (JPEG captures)    │
  └────┬─────────────────┘
       │
  ┌────┴───────┬──────────────┐
  ▼            ▼              ▼
jsPDF         JSZip        file-saver
(LinkedIn    (Instagram/   (Download)
  PDF)          X ZIP)
```

### The Parser (`compileBulkText`)

The heart of the engine. It uses a single regex to parse each line:

```
/^\/([^/]+)\/\s*(.*)$/
```

- Group 1: the tag string (e.g., `h, s:140, a:center`)
- Group 2: the visible content after the closing `/`

Config options are extracted by splitting on `,` then parsing `key:value` pairs. This means the text file itself is the source of truth — the parser can always reconstruct the slide from the raw text.

### The Renderer (`renderHighlightedText`)

Converts inline markdown syntax into sanitized HTML:

1. `**bold**` → `<strong>`
2. `__underline__` → `<span style="text-decoration: underline">`
3. `_italic_` → `<em>`
4. `*highlight*` → `<span style="color: accentColor">`
5. `[img:id]` → `<img src="base64Data">`
6. `\n` → `<br />`

All output is passed through **DOMPurify** before being rendered via `dangerouslySetInnerHTML` — preventing XSS from user-controlled text.

### The Persistence Layer

| Data Type | Storage | Notes |
|---|---|---|
| Last open text | IndexedDB | Restored on every page load |
| Saved projects | IndexedDB | Survives browser restarts |
| Inline images (Base64) | IndexedDB | Up to browser storage limits |
| Brand presets | IndexedDB | Multi-preset support |
| Brand watermark | IndexedDB | Global logo image |
| Author name/handle | localStorage | Quick-access settings |
| Font selections | localStorage | Per-element font choices |
| Theme colors | localStorage | Background/text/accent |
| Aspect ratio | localStorage | Portrait vs square |

### The Export Pipeline

The export system uses a two-phase approach to avoid browser crashes on mobile:

1. **Phase 1 — Render**: A hidden set of `slide-export-node` DOM elements is rendered off-screen at full 1080px resolution using the same React components as the preview.
2. **Phase 2 — Sequential Capture**: Each slide is captured one-by-one using `html-to-image`. Capturing is *sequential*, not parallel — this is critical for mobile RAM management.
3. **Phase 3 — Bundle**: Captured JPEGs are bundled by `jsPDF` (PDF) or `JSZip` (ZIP) and downloaded via `file-saver`.

---

## 🛠️ Tech Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Framework** | React | 19 | UI rendering & component model |
| **Language** | TypeScript | 5.9 | Type safety & IDE support |
| **Build Tool** | Vite | 7 | Dev server & production bundler |
| **Styling** | Tailwind CSS | 4.0 | Utility-first styling |
| **Persistence** | localforage | 1.10 | IndexedDB abstraction for large objects |
| **Image Capture** | html-to-image | 1.11 | High-fidelity DOM-to-JPEG conversion |
| **PDF Generation** | jsPDF | 4.2 | Client-side multi-page PDF bundling |
| **ZIP Generation** | JSZip | 3.10 | Client-side ZIP file creation |
| **File Download** | file-saver | 2.0 | Cross-browser file download trigger |
| **Drag & Drop** | dnd-kit | 6.3 | Accessible slide drag-and-drop reordering |
| **Security** | DOMPurify | 3.3 | XSS prevention for rendered HTML |
| **Validation** | Zod | 4.3 | Runtime schema validation for imported files |
| **Icons** | Lucide React | 0.575 | Icon library |
| **PWA** | vite-plugin-pwa | 1.2 | Service worker + offline caching |
| **Fonts** | Google Fonts API | — | Dynamic font injection (1500+ fonts) |
| **Hosting** | Vercel | — | Edge-deployed static hosting |
| **Analytics** | Vercel Analytics | — | Anonymous page view tracking only |

---

## 🏃 Running Locally

```bash
# 1. Clone the repository
git clone https://github.com/Shezan-op/Carousel-Creator.git
cd Carousel-Creator

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev

# 4. Open in your browser
# → http://localhost:5173
```

### Other Commands

```bash
# Type-check + build production bundle
npm run build

# Preview production build locally
npm run preview

# Run ESLint
npm run lint

# Run unit tests (Vitest)
npx vitest
```

### Environment Notes

- **Node.js 18+** is required (the project uses ES Modules)
- No `.env` variables are required for local development — the app is fully client-side
- The `.env.local` file in the repo is for Vercel deployment config only

---

## 🔒 Security Model

Since this app renders user-typed text as HTML, security is taken seriously:

### XSS Prevention
All text rendered via `dangerouslySetInnerHTML` first passes through **DOMPurify** with a strict allowlist:
```
ALLOWED_TAGS: ['b', 'i', 'strong', 'em', 'img', 'br', 'span']
ALLOWED_ATTR: ['style', 'src', 'class']
ALLOW_DATA_ATTR: false
```

### Schema Validation on Import
When loading `.carousel` project files, all data is validated through **Zod schemas** before being applied to state. Malformed or tampered files are rejected silently.

### Trust Boundaries

| Surface | Risk Level | Mitigation |
|---|---|---|
| Bulk text editor | Medium | DOMPurify sanitization before render |
| `.carousel` file import | Medium | Zod schema validation on load |
| `[img:id]` inline images | Low | Base64 from user's own uploads only |
| IndexedDB data | Low | Local-only; sanitized before re-render |
| Google Fonts API | Low | External CSS fetched over HTTPS |

> **Note**: Clearing your browser cache/storage will **permanently delete** all locally saved projects and images unless you have exported `.carousel` backup files.

---

## 🤖 Custom GPT Integration

Carousel Creator pairs with a purpose-built **Custom GPT** to supercharge your content pipeline.

**GPT Link**: [Carousel Bulk Converter](https://chatgpt.com/g/g-67ce242099cc8191bc31289196b01f92-carousel-bulk-converter)

### How it works

1. Give the GPT your topic, tone, and number of slides
2. The GPT outputs pre-formatted text using the correct tag syntax (`/h/`, `/sh/`, etc.)
3. Paste the output directly into the Carousel Creator bulk editor
4. Preview renders instantly — download and post

This workflow lets you go from **idea → published carousel in under 5 minutes**, even for complex, multi-slide educational content.

---

## 📚 Documentation Index

| Document | Audience | Description |
|---|---|---|
| **[README](./README.md)** | Everyone | You are here — complete project overview |
| **[System Brain](./docs/SYSTEM_BRAIN.md)** | All users | Plain-English explanation of how the engine works |
| **[How to Use](./docs/HOW_TO_USE.md)** | New creators | Step-by-step guide to making your first carousel |
| **[Syntax Cheatsheet](./docs/SYNTAX_CHEATSHEET.md)** | Power users | Complete reference for all tags and inline styles |
| **[Tech Stack](./docs/TECH_STACK.md)** | Developers | Engineering deep-dive into the code architecture |
| **[System Architecture Blueprint](./SYSTEM_ARCHITECTURE_BLUEPRINT.md)** | Developers | Full data flow and trust boundary analysis |
| **[Documentation Hub](./SYSTEM_DOCUMENTATION.md)** | Everyone | Central navigation for all guides |
| **[Changelog](./CHANGELOG.md)** | Everyone | Version history and release notes |

---

## ❓ FAQ

**Q: Is this really free forever?**  
A: Yes. There are no premium tiers, no credits, no "export limit". The code is open source. Run it yourself if you want complete independence.

**Q: Where is my data stored?**  
A: Entirely in your browser's IndexedDB (via `localforage`). Nothing is ever sent to a server. The Vercel hosting is static — it serves HTML/JS/CSS files only.

**Q: What happens if I clear my browser cache?**  
A: Your locally saved projects and images will be erased. Export `.carousel` backup files regularly to prevent data loss.

**Q: Can I use this on my phone?**  
A: Yes. The app is a PWA and is mobile-responsive. You can also "Add to Home Screen" to install it like a native app. Export quality is identical across devices.

**Q: Does it work offline?**  
A: Yes, after the first page load. The Service Worker caches all app assets. Google Fonts are also cached after first use.

**Q: Can I use my own fonts?**  
A: The app integrates with **Google Fonts** — type any valid Google Font name (e.g., `Playfair Display`, `Oswald`) and it loads instantly. Custom local fonts are not currently supported.

**Q: What's the export resolution?**  
A: `1080×1350px` for portrait (4:5 ratio, LinkedIn-native) and `1080×1080px` for square (1:1 ratio, Instagram-native). These are the exact platform specifications.

**Q: How do I back up my projects?**  
A: In the Projects panel, use the **Export** button to save a `.carousel` file. This JSON file contains your text, theme, and all embedded images. Import it on any device.

**Q: Can multiple people collaborate on the same carousel?**  
A: Not currently. This is a single-user, local-first tool. Share `.carousel` files to hand off work between creators.

**Q: Is there a slide limit?**  
A: No hard limit. Practically, 15–20 slides is the sweet spot for social media carousels. Very long carousels may slow down export on low-end mobile devices.

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. **Fork** the repository
2. Create a feature branch: `git checkout -b feature/your-idea`
3. Make your changes (see the [Tech Stack docs](./docs/TECH_STACK.md) for codebase orientation)
4. Run `npm run lint` and `npx vitest` before committing
5. Open a **Pull Request** with a clear description of what changed and why

### Key Files to Know

| File | Role |
|---|---|
| `src/App.tsx` | Central state management & the `compileBulkText` parser |
| `src/components/LeftPane.tsx` | All control panels (text editor, design, brand, export) |
| `src/components/CarouselPreview.tsx` | The real-time slide preview gallery |
| `src/components/ExportControls.tsx` | PDF & ZIP export pipeline |
| `src/utils.tsx` | `renderHighlightedText` & image compression utilities |
| `src/types.ts` | Core TypeScript interfaces (`Slide`, `CarouselData`, etc.) |
| `src/schema.ts` | Zod validation schemas for all persistent data |

---

## 📄 License

MIT License — free to use, modify, and distribute. See [LICENSE](./LICENSE) for details.

---

<div align="center">

**Built with ❤️ for the Creator Economy**

[Shezan Ahmed](https://github.com/Shezan-op) · [Live App](https://mycarouselcreator.vercel.app/) · [Report a Bug](https://github.com/Shezan-op/Carousel-Creator/issues)

*If this tool saved you time, a ⭐ on the repo means a lot.*

</div>
