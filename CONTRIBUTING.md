# Contributing to Carousel Creator

Thank you for your interest in contributing! This document outlines how to get started.

---

## 🚀 Quick Start

```bash
git clone https://github.com/Shezan-op/Carousel-Creator.git
cd Carousel-Creator
npm install
npm run dev
```

## 📁 Project Structure

```
src/
├── App.tsx                 # Root shell, global state management
├── types.ts                # Shared TypeScript interfaces
├── components/
│   ├── LeftPane.tsx         # Bulk compiler, AI tab, tuner, setup controls
│   ├── CarouselPreview.tsx  # Multi-template renderer + export DOM nodes
│   ├── ExportControls.tsx   # PDF/ZIP export + lead capture
│   └── NetflixIntro.tsx     # Splash screen animation
```

## 🧪 Development Workflow

1. **Branch** from `main`
2. **Make changes** in `src/`
3. **Build** to verify: `npm run build` (TypeScript + ESLint + Vite)
4. **Test visually** — paste sample bulk text, switch templates, try exports
5. **Commit** with conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`
6. **Push** and open a Pull Request

## 🔒 Code Standards

- **TypeScript**: Strict mode. No `any` without `eslint-disable` + justification comment.
- **Styling**: Tailwind CSS utilities only. No inline `style={{}}` except inside `CarouselPreview.tsx` (which requires inline styles for `html-to-image` capture).
- **State**: Prefer `localStorage` persistence for user-facing settings. Wrap all `localStorage` calls in try/catch.
- **Naming**: camelCase for variables/functions, PascalCase for components, UPPER_SNAKE for constants.

## 📐 Architecture Rules

- **The Rigid Canvas**: DOM nodes inside `.slide-export-node` must always be exactly 1080×1350px. Never use responsive units inside export nodes.
- **Safe Zone**: 108px padding on all sides. Text must not exceed the 864×1134px safe area.
- **Template Parity**: Any rendering change must be applied to **all 3 templates** (Minimal, Highlight/default, Tweet, Brutalist).
- **Background Integrity**: Any new background effects (like Noise or Per-Slide images) must be rendered as absolute layers *behind* the text content but *inside* the scale-wrapper.
- **Export Safety**: Any UI element (buttons, arrows, numbers) that should not appear in the final JPEG must have the `data-html2canvas-ignore="true"` attribute.
- **Backwards Compatibility**: Never remove a field from `types.ts` without adding a deprecated alias and migration path in the sanitizer.

## 🐛 Reporting Issues

Open a GitHub Issue with:

1. What you expected to happen
2. What actually happened
3. Browser + OS version
4. Screenshot or screen recording if visual

---

*Thank you for helping make Carousel Creator better!*
