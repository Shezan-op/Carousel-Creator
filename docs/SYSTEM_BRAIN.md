# 🧠 The System Brain — How Carousel Creator Works

> A plain-English walkthrough of what happens between the moment you type and the moment you download.

---

## The 30-Second Version

You write text with simple tags → the app reads the tags → the app draws slides → you download.

No server. No cloud. No waiting. Everything happens inside your browser.

---

## Phase 1 — You Write, The App Listens

The left pane has a text editor. The moment you type a single character, the app begins processing.

There is no "Compile" button. There is no "Refresh" button. It is always watching.

```
You type: /h/ The Power of Consistency

The app thinks:
  → "I see a /h/ tag"
  → "This line is a Headline"
  → "The content is: The Power of Consistency"
  → "Draw this as a large, bold text block"

Preview updates: [instantly]
```

---

## Phase 2 — The Big Splitter

Your text is treated as a sequence of **slides** separated by blank lines.

```
This is slide 1.

This is slide 2. (I started a new paragraph)

This is slide 3.
```

The app scans your text looking for double line-breaks (`\n\n`). Every chunk between blank lines becomes exactly one slide. No limit on how many slides you can create.

---

## Phase 3 — The Tag Detective

Inside each slide's chunk of text, the app looks for lines that start with a slash pattern like `/h/` or `/sh/`.

These are **instruction lines** — they tell the app how to format the text.

| What the app sees | What it means |
|---|---|
| `/h/ Your Headline` | "Make this the big headline" |
| `/sh/ Subheading text` | "Make this a smaller supporting line" |
| `/h, s:150/ Bigger Headline` | "Headline at 150px instead of default" |
| `/config, b_s:55/` | "Make all body text on this slide 55px" |
| Any line without a tag | "This is body paragraph text" |

The options inside the tag (like `s:150` or `a:center`) are parsed as key-value pairs. These modify how this particular slide is drawn — without affecting any other slide.

---

## Phase 4 — The Artist Paints

With the slide structure understood, the app renders everything into visible slides.

It applies:
- Your chosen **background color** (or image)
- Your chosen **text color**
- Your chosen **accent color** (used for highlighted text)
- Your chosen **fonts** (separate fonts for headline, subheading, body)
- Your **author profile** (name, handle, photo in the footer)
- Any **per-slide overrides** (size, alignment, vertical position)

This render is **live** — change a color and all slides update instantly. Change a font and all slides re-render in that font within milliseconds.

---

## Phase 5 — The Text Stylist

Inside the body of each slide, the app also parses **inline styling** — small formatting codes embedded directly in the text.

```
**word**  → Bold
*word*    → Highlighted in accent color
_word_    → Italic
__word__  → Underlined
[img:id]  → Embedded image
```

This runs through a custom text-rendering function that converts these codes into safe HTML, then sanitizes the result with DOMPurify (a security library) before displaying it.

This means even if someone typed something malicious into the text field, it cannot execute — it will be stripped before rendering.

---

## Phase 6 — The Memory Box

The app doesn't have a cloud account system. It has something better for a local tool: **your browser's own storage**.

Everything is saved directly in your browser using two mechanisms:

**IndexedDB** (for large data like images and project history):
- Your last open text — restored automatically when you revisit
- All saved projects — stored indefinitely unless you clear browser data
- All uploaded images (stored as Base64 strings)
- All brand presets

**LocalStorage** (for small, fast settings):
- Your name and handle
- Your font choices
- Your theme colors
- Display preferences

Nothing leaves your device. The Vercel server only serves the app files (HTML, JavaScript, CSS). After that, everything happens locally.

---

## Phase 7 — The Export Camera

When you click Download, the app runs a four-step process:

**Step 1 — Build hidden slides**
The app creates invisible, full-resolution versions of each slide (1080px wide) outside the visible area of your screen.

**Step 2 — Photograph each slide**
Using a library called `html-to-image`, the app takes a high-quality screenshot of each hidden slide, one at a time. It does this *one-by-one*, not all at once — this prevents the browser from running out of memory on phones.

**Step 3 — Bundle the images**
- For **LinkedIn (PDF)**: the JPEG images are stapled into a multi-page PDF using `jsPDF`
- For **Instagram/X (ZIP)**: the JPEG images are compressed into a ZIP folder using `JSZip`

**Step 4 — Trigger the download**
The final file is handed to `file-saver` which triggers your browser's native download dialog.

The entire process happens on your device. No image data is ever uploaded anywhere.

---

## The Offline Super Power

Carousel Creator is a **Progressive Web App (PWA)**. This means:

1. The first time you visit, the app installs a Service Worker in your browser
2. The Service Worker caches all app files and Google Fonts
3. On every subsequent visit — even with no internet — the app loads from cache

You can create, edit, and export carousels on a plane, in a café with no WiFi, or anywhere else. The only thing that requires internet is loading a **new Google Font** you've never used before.

---

## Summary Map

```
You Type
   ↓
Tag Parser reads /h/, /sh/, /config/ tags
   ↓
Slide[] array is built (one per blank line)
   ↓
React renders CarouselPreview in real time
   ↓
All data saved to IndexedDB automatically
   ↓
[When you click Download]
   ↓
Hidden export nodes render at 1080px
   ↓
html-to-image captures each slide (sequential)
   ↓
jsPDF or JSZip bundles the images
   ↓
file-saver triggers browser download
   ↓
Your file. Your device. Done.
```
