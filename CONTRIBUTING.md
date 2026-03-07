# 🤝 Contributing to Carousel Creator

Thank you for your interest in contributing! This guide explains how to set up the project, make changes, and submit your work.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Project Structure](#project-structure)
3. [How to Make Changes](#how-to-make-changes)
4. [Coding Standards](#coding-standards)
5. [Testing Your Changes](#testing-your-changes)
6. [Submitting a Pull Request](#submitting-a-pull-request)
7. [Feature Ideas We'd Love](#feature-ideas-wed-love)
8. [Bug Reports](#bug-reports)
9. [Code of Conduct](#code-of-conduct)

---

## Getting Started

### Prerequisites

- **Node.js 18+** and **npm** installed on your machine
- **Git** installed
- A code editor (VS Code recommended)

### Setup

```bash
# 1. Fork the repo on GitHub
# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/Carousel-Creator.git
cd Carousel-Creator

# 3. Install dependencies
npm install

# 4. Start the dev server
npm run dev
```

The app runs at `http://localhost:5173` with hot reload enabled.

### Verify Everything Works

```bash
# Run a production build to check for TypeScript errors
npm run build
```

If this completes without errors, you're ready to go.

---

## Project Structure

```
src/
├── App.tsx                    # The main file. Global state, persistence, layout.
│                              # This is where useState hooks, localforage calls,
│                              # and the overall app shell live.
│
├── main.tsx                   # React DOM entry point. You rarely need to touch this.
│
├── types.ts                   # TypeScript interfaces: Slide, Theme, CarouselData.
│                              # If you add a new property to slides, add it here first.
│
├── utils.ts                   # Shared utilities: markdown parser, image compression,
│                              # highlighted text renderer.
│
├── index.css                  # Global CSS: Tailwind imports, custom scrollbar styles,
│                              # animation keyframes.
│
├── components/
│   ├── LeftPane.tsx            # The entire left sidebar. Contains:
│   │                          #   - Bulk Compiler (text editor)
│   │                          #   - AI Generator
│   │                          #   - Visual Builder
│   │                          #   - Brand Palette (colors, theme invert, watermark)
│   │                          #   - Typography & Motifs
│   │                          #   - Asset Gallery
│   │                          #   - Saved Projects (Manuscript Vault)
│   │                          #   - Hyper-parameters (aspect ratio, progress bar, etc.)
│   │                          #   - Brand Presets
│   │
│   ├── CarouselPreview.tsx     # The right panel. Renders all slides. Contains:
│   │                          #   - SortableSlide component (drag-and-drop wrapper)
│   │                          #   - All 4 template renderers (minimal, tweet, brutalist, highlight)
│   │                          #   - Progress bar rendering
│   │                          #   - Watermark rendering
│   │                          #   - Social feed sandbox frames
│   │                          #   - Export node markup (.slide-export-node)
│   │
│   ├── ExportControls.tsx      # PDF and ZIP export logic. Contains:
│   │                          #   - exportToPDF function (html-to-image → jsPDF)
│   │                          #   - exportToZip function (multi-template batch render)
│   │                          #   - Export count tracking and unlock logic
│   │
│   └── NetflixIntro.tsx        # Animated splash screen on first load.
│
public/
├── Logo.png                   # App logo used in the header and README
├── manifest.json              # PWA manifest for installability
└── *.pdf                      # Sample exported carousels for README
```

### Key Patterns to Know

- **State flows down**: `App.tsx` holds all global state. It passes values and setters as props to `LeftPane.tsx` and `CarouselPreview.tsx`.
- **Persistence**: Heavy data (images, projects) goes to IndexedDB via `localforage`. Light preferences go to `localStorage`.
- **Export nodes**: Every slide has a `.slide-export-node` class. The export engine finds these in the DOM and converts them to images.
- **Scaling**: Slides are always 1080px wide. The `transform: scale()` wrapper makes them fit on screen. Exports capture the full-size 1080px node.

---

## How to Make Changes

### Adding a New Feature

1. **Define the data**: If your feature needs new data, add the TypeScript interface to `types.ts`.
2. **Add state**: Add `useState` in `App.tsx` for global state, or in the component for local state.
3. **Add persistence**: Use `localStorage` for simple values, `localforage` for heavy data.
4. **Add UI**: LeftPane controls go in `LeftPane.tsx`. Preview changes go in `CarouselPreview.tsx`.
5. **Pass props**: Thread new state from `App.tsx` → child components via props.
6. **Test the build**: Run `npm run build` to catch TypeScript errors.

### Modifying a Template

Templates are defined inside `CarouselPreview.tsx` as conditional rendering blocks:

```tsx
{activeTemplate === 'minimal' && (
    // Template JSX here
)}
```

Each template has its own section. Modify the JSX/styles within the relevant block.

### Adding a New Template

1. Add a new button in `LeftPane.tsx` under the template selector:

   ```tsx
   {['minimal', 'tweet', 'brutalist', 'highlight', 'your_new_template'].map(t => (
   ```

2. Add a new rendering block in `CarouselPreview.tsx`:

   ```tsx
   {activeTemplate === 'your_new_template' && (
       // Your template JSX
   )}
   ```

3. Add it to the ZIP export loop in `ExportControls.tsx` if you want it included in exports.

---

## Coding Standards

### TypeScript

- Use strict types. Avoid `any` unless absolutely necessary.
- All component props must have an interface.
- Use `'portrait' | 'square'` style union types for options, not enums.

### Styling

- Use **Tailwind CSS** utility classes for all styling.
- Follow the existing design language: dark backgrounds, rounded corners, subtle borders.
- Use the existing class patterns as reference (e.g., `text-[10px] font-black uppercase tracking-widest`).

### Components

- Keep components focused. If a section gets too large, consider extracting it.
- State that only one component uses should be local to that component.
- State shared between components should live in `App.tsx`.

### Naming

- Use descriptive names: `handleWatermarkUpload`, not `handleUpload`.
- File names use PascalCase: `CarouselPreview.tsx`.
- CSS classes follow Tailwind conventions.

---

## Testing Your Changes

### Manual Testing Checklist

Before submitting a PR, verify:

- [ ] `npm run build` passes with zero errors
- [ ] All 4 templates render correctly
- [ ] PDF export works and includes your changes
- [ ] ZIP export works and includes your changes
- [ ] Mobile layout isn't broken (resize your browser to ~400px width)
- [ ] Focus Modal opens and closes properly
- [ ] Data persists after browser refresh
- [ ] No console errors in the browser DevTools

### Quick Build Check

```bash
npm run build
```

This runs TypeScript type-checking and Vite bundling. If it passes, your code is likely correct.

---

## Submitting a Pull Request

1. **Create a branch** for your changes:

   ```bash
   git checkout -b feature/my-new-feature
   ```

2. **Make your changes** and verify with `npm run build`.

3. **Commit with a clear message**:

   ```bash
   git add .
   git commit -m "feat: add gradient background support to slides"
   ```

4. **Push to your fork**:

   ```bash
   git push origin feature/my-new-feature
   ```

5. **Open a PR** on GitHub against the `main` branch.

### PR Title Format

- `feat: add [thing]` — New features
- `fix: resolve [issue]` — Bug fixes
- `docs: update [what]` — Documentation changes
- `refactor: improve [what]` — Code improvements without new features

---

## Feature Ideas We'd Love

If you're looking for something to work on, here are features we'd love to see:

- [ ] New visual templates (e.g., Gradient, Neon, Corporate)
- [ ] Animated slide transitions for video export
- [ ] Multi-language support (i18n)
- [ ] Custom font file upload (beyond Google Fonts)
- [ ] Keyboard shortcuts guide overlay
- [ ] Slide thumbnail filmstrip navigation
- [ ] Custom watermark positioning (corners, center)
- [ ] Template preview thumbnails in the selector

---

## Bug Reports

Found a bug? **[Open an issue](https://github.com/Shezan-op/Carousel-Creator/issues)** with:

1. **What happened** — Describe the bug clearly.
2. **What you expected** — What should have happened instead.
3. **Steps to reproduce** — How can we trigger the bug.
4. **Browser/OS** — e.g., Chrome 120 on Windows 11.
5. **Screenshot** — If it's a visual issue, include a screenshot.

---

## Code of Conduct

- Be respectful, constructive, and professional.
- Every contribution, no matter how small, is valued.
- We're building a tool for creators — let's create a welcoming community.

---

*Thank you for making Carousel Creator better!* 🚀
