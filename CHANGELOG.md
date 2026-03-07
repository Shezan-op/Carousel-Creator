# Changelog

All notable changes to Carousel Creator are documented here.

---

## [2.3.0] — 2026-03-08

### ✨ Added

- **Enterprise Infrastructure Upgrade**: Migrated heavy data payloads (`inlineImages`, `savedProjects`, `brandPresets`, and `bulkText`) from synchronous `localStorage` to asynchronous IndexedDB via `localforage`. This prevents UI blocking during large state saves and bypasses the 5MB `localStorage` limit.
- **Project Backup system (.carousel)**: Users can now export their entire workspace (text, theme, and images) as a portable `.carousel` file for backups or sharing across devices.
- **Local Project Save Slots**: Implement multiple project save slots within the app, allowing users to switch between different carousel drafts instantly.
- **Agency Brand Presets**: Save and load multiple brand identities (fonts, colors, author info) to rapidly switch between client designs.
- **Native Drag-and-Drop Image Injection**: Simply drop images onto the Bulk Editor to automatically compress them and inject a generated `[img:id]` tag at the cursor position.

### 🔧 Fixed

- **Bulletproof Export Engine**: The export pipeline now processes slides sequentially with memory clearing and forced UI refreshes between captures. This resolves "Out of Memory" crashes on mobile and during large 10+ slide exports.
- **Tally Form Logic**: Fixed a recurring popup issue where the export gate would reappear even after form completion by hardening the `postMessage` synchronization.
- **Font Licensing & Stability**: Added explicit `await document.fonts.ready` calls before export to ensure custom Google Fonts are fully rendered in the final assets.

---

## [2.2.0] — 2026-03-07

### ✨ Added

- **Per-Slide Background Images**: Users can now set unique background images for individual slides via the "Bg" tab in the Focus Modal. These overrides the global background.
- **Mobile Grid Shift Buttons**: Added "Move Left" and "Move Right" buttons to slides in Grid View for easier reordering on mobile devices.

### 🔧 Fixed

- **Export Ghosting**: Slide counters, swipe arrows, and safe-zone overlays are now correctly ignored during export using `data-html2canvas-ignore`, ensuring a clean JPEG/PDF.
- **Tally Export Gate persistence**: Resolved an issue where the export unlock (form submission) was not persisting between exports. Implemented a robust `postMessage` event listener and added a `localStorage` fallback check on window focus/visibility change.
- **Tally UI Polish**: Set `transparentBackground: true` for all Tally popups to match the app's dark theme.
- **Vercel Build Warnings**: Fixed TypeScript typing errors and ESLint warnings in `CarouselPreview.tsx` and `App.tsx` related to unused props and incorrect event types.
- **Drag-and-Drop Optimization**: Cleaned up `useMemo` dependencies and wrapped reordering logic in `useCallback` to prevent unnecessary slide list re-renders.

---

## [2.1.0] — 2026-03-01

### 🔧 Fixed

- **Typography Mapping Bug**: Unified `subheading_size` to control both H2 (subheadline) and H3 (section header) across all templates. Previously, `subheadline_size` and `subheading_size` were decoupled, causing the `sh_s` tuner to only affect H3.
- **Body Text Mutation**: The Visual Tuner no longer converts untagged body text into headline text. Config-only changes now inject a neutral `/config/` tag that preserves original content.
- **Duplicate Tuner Controls**: Removed the redundant "Section" (`sb_s`) slider that shadowed the "Subhead" (`sh_s`) slider — both wrote to the same property.
- **React Import**: Fixed missing `React` import in `NetflixIntro.tsx` that caused `React.FC` type resolution failure.

### 🎨 Changed

- **Hex Color Pickers**: Replaced native `<input type="color">` (which rendered OS-level RGB sliders) with custom text inputs that strictly accept and display hex codes (e.g., `#FAFAFA`).
- **Global Slider Removal**: Removed redundant "Master Sliders" from the design panel. Per-slide tuning via the Visual Tuner is now the single source of truth.

### 🗑 Removed

- `sectionSize` global state (dead code — no UI controlled it after slider removal)
- `subheadline_size` from active use (deprecated; kept in type for backwards compatibility)

---

## [2.0.5] — 2026-02-28

### ✨ Added

- **Bulk Compiler Overhaul**: Replaced fragile regex parser with stable `.startsWith()` string-matching logic, then upgraded to a robust regex parser with combined option support (`/h, s:120, a:center/`).
- **Visual Tuner Engine**: In-context sliders for Headline, Subhead, Body size, and Y-Offset per slide.
- **Config Injection**: `updateSlideConfig()` utility reliably injects/updates key:value pairs in bulk text without duplicating keys.

### 🔧 Fixed

- **Textarea Clipping**: Increased parent padding to fix scrollbar being cut off.
- **Tab Jumping**: Typography/Design controls moved to a permanently visible panel below text areas.

---

## [2.0.0] — 2026-02-24

### ✨ Added

- **ZIP Content Pack Engine**: One-click export renders all 3 templates into organized ZIP folders.
- **Mobile Responsive Scaling**: Dynamic `transform: scale()` canvas fitting for mobile.
- **Creator Identity Persistence**: Avatar, name, handle, and font saved to `localStorage` as base64.
- **Netflix-style Intro Animation**: Cinematic splash screen on first load.
- **Lead Capture Modal**: Email gate after 5 daily exports, with rate limiting and inline error handling.

### 🎨 Changed

- **Template Engine Rebuild**: Minimal, Tweet, and Brutalist templates fully rewritten with precise styling.
- **Safe Zone Enforcement**: 108px padding on all sides for content-safe exports.
- **Font Engine**: Google Fonts fetch string now requests both normal and italic axes for all weights.

### 🔐 Security

- **Defensive Storage**: `localStorage` parsers guard against `NaN` for counters.
- **API Safety**: OpenRouter payload validates `choices[0].message` before parsing.
- **CORS Prevention**: All images converted to base64 data URLs on ingestion.
- **Input Caps**: Text capped at 10,000 chars, slides capped at 50.

---

## [1.0.0] — 2026-02-23

### ✨ Initial Release

- React 19 + Vite + TypeScript foundation
- Minimal template with single-slide rendering
- Basic PDF export via `html-to-image` + `jsPDF`
- OpenRouter AI integration (BYOK)
- Theme preset system (4 initial palettes)
- Tailwind CSS 4.0 styling
