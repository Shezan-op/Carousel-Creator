# 📋 Changelog — Carousel Creator

All notable changes to this project are documented here.

---

## [v3.0.0] — 2026-03-08 — "Final Shot" Release

### ✨ New Features

- **Format Switcher**: Choose between Vertical (4:5, 1080×1350) and Square (1:1, 1080×1080) aspect ratios with one click
- **1-Click Theme Invert**: Instantly swap background and text colors to toggle dark/light mode
- **Global Brand Watermark**: Upload a logo that appears on every slide — persisted to IndexedDB
- **Dynamic Progress Bar**: Visual progress indicator (Top/Bottom/Off) that fills proportionally per slide
- **Social Feed Sandbox**: Preview carousels inside simulated LinkedIn or Instagram feed frames
- **Asset Gallery**: Persistent image library with upload, click-to-copy tags, and delete functionality
- **Undo/Redo Engine**: Time-travel through text edits with Ctrl+Z / Ctrl+Shift+Z
- **Visual Builder**: Slide-by-slide visual editing mode alongside the raw text editor
- **Per-Slide Background Images**: Upload unique backgrounds for individual slides via Focus Modal
- **Highlight Template**: Fourth visual motif with dynamic accent emphasis

### 🔧 Infrastructure

- Migrated heavy storage (images, projects, presets, watermark) from localStorage to IndexedDB via `localforage`
- Added `.carousel` file backup and restore system for project portability
- Export engine processes slides sequentially with memory cleanup for stability
- Export ghosting fix: UI overlays (slide numbers, arrows) hidden from PDF/ZIP output
- **Responsive Geometry Patch**: Fixed Flexbox "canvas squish" by enforcing strict minimum dimensions on slide wrappers
- **Sandbox Scaling Refactor**: Completely rebuilt LinkedIn/Instagram feed previews with scale-aware CSS for pixel-perfect mobile viewing
- **Mobile Grid Rescue**: Enforced CSS Grid for the grid preview mode to ensure high-performance slide management on touch devices
- **Premium Marketing Payload**: Replaced default example with a 10-slide high-fidelity tutorial showcasing advanced motifs and markdown
- **UI Polish**: Fixed tagline wrapping on the Netflix-style intro for mobile viewports
- Aspect ratio dynamically recalculates canvas height without stretching

### 📖 Documentation

- Complete rewrite of README.md, HOW_TO_USE.md, WALKTHROUGH.md, CONTRIBUTING.md
- Every feature documented with plain-language explanations and examples

---

## [v2.0.0] — 2026-03-04 — "Agency Workflow" Release

### ✨ New Features

- **Brand Presets**: Save multiple combinations of fonts, colors, and author identity
- **Project Save Slots**: Store up to 50 carousel drafts in the browser
- **Drag-and-Drop Image Injection**: Drop images onto the Bulk Editor to embed them
- **Focus Modal**: Figma-inspired per-slide editing with size, font, alignment, and Y-offset controls

### 🔧 Improvements

- Inline image compression for performance
- Sequential export engine for stability on large carousels
- Mobile-optimized shift buttons for slide reordering
- Multi-font Google Fonts orchestrator with deduplication

---

## [v1.0.0] — 2026-02-28 — Initial Release

### ✨ Features

- Bulk Compiler with tag-based syntax (/h/, /sh/, plain text)
- Three templates: Minimal, Tweet, Brutalist
- Nested Markdown engine (*highlight*, **bold**, *italic*, **underline**)
- PDF and ZIP export with multi-template rendering
- AI-powered generation via OpenRouter (BYOK)
- Custom color palettes with preset themes
- Google Fonts integration for headline, subheading, and body text
- Creator identity (name, handle, avatar) on slide footers
- Responsive design for desktop and mobile
- Privacy-first: all data stays in the browser

---

*View the [full documentation](./README.md) for details.*
