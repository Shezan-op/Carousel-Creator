# Changelog

All notable changes to Carousel Creator are documented here.

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
