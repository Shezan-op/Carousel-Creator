# 📜 Changelog

All notable changes to **Carousel Creator** are documented here.  
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [1.3.0] - 2026-04-26

### Added

- **Complete Documentation Overhaul**: Rewrote all documentation from the ground up with full depth and accuracy.
- **README.md v3**: Comprehensive 600-line README covering what the tool is, who it's for, why it was built, features, what to/not to expect, quick start, full syntax reference, architecture diagrams, tech stack table, security model, Custom GPT integration, full FAQ, and contributing guide.
- **TECH_STACK.md v2**: Full developer documentation including parser algorithm walkthrough, two-tier persistence architecture, export pipeline details, PWA/Workbox strategy, multi-font engine explanation, and contributing guidelines.
- **HOW_TO_USE.md v2**: Step-by-step guide covering 7 complete steps from opening the app to saving/exporting, with pro tips and a troubleshooting section.
- **SYNTAX_CHEATSHEET.md v2**: Complete syntax reference with all tags, config options, inline styles, image embedding, quick templates, and a print-friendly card.
- **SYSTEM_BRAIN.md v2**: Seven-phase plain-English walkthrough of the full system lifecycle — from typing to downloading.
- **SYSTEM_DOCUMENTATION.md v2**: Clean, table-based documentation hub for both creators and developers.

---

## [1.2.0] - 2026-03-10

### Added

- **Detailed System Documentation**: Launched initial documentation suite in the `/docs` folder.
- **SYSTEM_BRAIN.md**: A plain-English explanation of the system's internal logic.
- **HOW_TO_USE.md**: A simple, step-by-step guide for new users.
- **TECH_STACK.md**: Technical documentation explaining the engineering choices.
- **SYNTAX_CHEATSHEET.md**: Quick reference guide for all markup tags and configuration overrides.
- **Documentation Hub**: Updated `SYSTEM_DOCUMENTATION.md` to act as a central navigation point.

### Changed

- **README.md**: Overhauled to be more professional and comprehensive, including architecture diagrams and feature highlights.

---

## [1.1.0] - 2026-03-09

### Added

- **PWA Support**: Made the tool fully installable as a Progressive Web App.
- **Mobile Optimization**: Resolved RAM spikes during export on mobile browsers using sequential (not parallel) image capture.
- **Brand Watermark**: Added support for global brand watermarks on all slides.
- **Saved Projects Backup**: Added the ability to export/import `.carousel` files.

---

## [1.0.0] - 2026-03-01

### Added

- **Initial Launch**: First version of Carousel Architect.
- **Bullet-Proof Export**: High-res PDF and ZIP exports via `html-to-image`, `jsPDF`, and `JSZip`.
- **Multiple Templates**: Minimal, Tweet, and Brutalist styles.
- **Local Storage**: IndexedDB integration via `localforage` for full offline persistence.

---

*Built with ❤️ by [Shezan Ahmed](https://github.com/Shezan-op)*
