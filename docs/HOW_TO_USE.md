# 📖 How to Use — Step-by-Step Guide

> Your complete walkthrough from zero to a published carousel. No design experience required.

---

## Before You Start

Open the app: **[mycarouselcreator.vercel.app](https://mycarouselcreator.vercel.app/)**

No account. No login. No loading screen. You're already in.

The interface has two panes:
- **Left Pane** — your control panel (write, design, brand, export)
- **Right Pane** — the live carousel preview (updates as you type)

---

## Step 1 — Write Your Content

Click inside the large text editor on the left pane.

### The core rule:
> **One blank line = one new slide.**

```
This is slide 1.

This is slide 2.

This is slide 3.
```

Press Enter **once** for a new line within the same slide.  
Press Enter **twice** to start a new slide.

### Add structure with tags:

```
/h/ Your Big Headline

/sh/ A supporting subheading

This is normal body text beneath the subheading.
```

- `/h/` → Big, bold headline
- `/sh/` → Medium subheading
- No tag → Body paragraph text

That's the minimum you need to know. Everything else is optional.

---

## Step 2 — Style Your Text Inline

You can add formatting inside any text without leaving the keyboard:

| What you type | What it looks like |
|---|---|
| `**word**` | **Bold text** |
| `*word*` | Highlighted in your accent color |
| `_word_` | *Italic text* |
| `__word__` | Underlined text |

```
/h/ **3 Rules** for *Faster* Growth

Bullet one — consistency __always__ wins
Bullet two — ship _early_, improve later
```

---

## Step 3 — Choose a Template & Colors

Click the **Design** tab in the left pane.

### Templates
- **Minimal** — Clean, typographic. Works for any niche.
- **Tweet** — Tight, conversational. Great for opinion content.
- **Brutalist** — High-contrast, bold. Perfect for impact statements.

### Colors
Customize **background**, **text**, and **accent** colors to match your brand. The accent color is used for highlighted (`*word*`) text.

### Fonts
Type any **Google Font** name in the font fields:
- Heading Font (for `/h/` lines)
- Subheading Font (for `/sh/` lines)
- Body Font (for untagged text)

Popular choices: `Inter`, `Playfair Display`, `Oswald`, `Montserrat`, `Lora`, `Space Grotesk`

---

## Step 4 — Set Up Your Brand

Click the **Brand** tab.

- **Upload your photo or logo** — appears in the footer of every slide
- **Your name** — displayed in the footer
- **Your @handle** — displayed next to your name
- **Footer position** — left, center, or right aligned

### Save as a Brand Preset
If you use the same branding across multiple carousels, save it:
1. Set up your colors, fonts, and profile
2. Click **Save Preset** → give it a name
3. Load it instantly on any future carousel

---

## Step 5 — Fine-Tune Individual Slides

Click any slide in the preview to open the **Slide Tuner**. Here you can adjust:

- **Size** — independently change headline, subheading, and body font sizes using `+` / `−` buttons or type a number
- **Fonts** — override fonts for this specific slide
- **Align** — left, center, or right align the text block
- **Vertical Position** — move the text block up or down (Y-offset)
- **Background** — upload a custom image for just this slide

All changes write back into the text source automatically.

---

## Step 6 — Export Your Carousel

Once you're happy with the result:

| Button | Best for | Format |
|---|---|---|
| **Download PDF** | LinkedIn carousel posts | Multi-page PDF |
| **Download ZIP** | Instagram / X posts | Folder of JPEGs |

**Keyboard shortcut**: `Ctrl + Enter` (Windows) / `Cmd + Enter` (Mac) — instantly downloads the ZIP.

> 📌 **LinkedIn Upload Tip**: Go to "Create a Post" → click the image icon → select "Document" → upload the PDF. LinkedIn will render it as a swipeable carousel automatically.

---

## Step 7 — Save Your Work

### Auto-save
The app automatically saves your current text to IndexedDB. When you reopen the browser, your last session is restored.

### Manual Save (Projects)
Click the **Projects** tab → **Save Project** → give it a name.  
You can save unlimited projects locally.

### Export Backup File
To transfer work between devices or create a permanent backup:
**Projects** tab → **Export `.carousel` file**

This saves a portable JSON file containing your text, theme, and all images. Import it on any device.

---

## Pro Tips

### Paste from a document
You can paste content directly from Google Docs, Notion, or any text editor. Then add tags at the start of lines to structure it.

### Use the AI GPT
The [Carousel Bulk Converter GPT](https://chatgpt.com/g/g-67ce242099cc8191bc31289196b01f92-carousel-bulk-converter) generates pre-formatted text with the correct tag syntax. Paste the output directly into the editor.

### Preview modes
In the top right of the preview pane, switch between:
- **Stack** — vertical scroll of all slides
- **Carousel** — swipeable horizontal preview
- **Grid** — thumbnail overview of all slides

### Aspect ratio
Change between **Portrait (4:5)** for LinkedIn and **Square (1:1)** for Instagram in the Design tab. The export resolution adjusts automatically (1080×1350 or 1080×1080).

### Add a progress bar
In the Design tab, enable a **Progress Bar** (top or bottom) to show swipe progress — a common pattern for LinkedIn carousels.

### Brand watermark
Upload a small logo PNG in the Design tab → **Watermark** section. It will appear semi-transparently in the top-right corner of every exported slide.

---

## Troubleshooting

**Preview not updating?**  
Click inside the text editor and type a space. The preview re-renders on every keystroke.

**Fonts not loading?**  
Check your internet connection. Google Fonts requires a network request on first use. Once loaded, they are cached for offline use.

**Export failed / browser froze?**  
Very long carousels (20+ slides with many images) can be heavy on mobile browsers. Try reducing image count or using a desktop browser.

**Lost my work?**  
If you cleared your browser storage, your data is gone unless you have a `.carousel` backup file. Going forward, export backups regularly.

---

You're ready. Go make something worth sharing. 🚀
