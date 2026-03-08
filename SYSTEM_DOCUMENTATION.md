# 📖 How to Use Carousel Architect — The Complete Guide

Welcome to Carousel Architect! This guide walks you through **every single feature** in plain language. Whether you're a LinkedIn creator, social media manager, or agency owner — you'll be making beautiful carousels in under 2 minutes.

---

## Table of Contents

1. [Your First Carousel (Quick Start)](#1-your-first-carousel-quick-start)
2. [Setting Up Your Profile](#2-setting-up-your-profile)
3. [Writing Content with the Bulk Compiler](#3-writing-content-with-the-bulk-compiler)
4. [Formatting Text (Markdown)](#4-formatting-text-markdown)
5. [Adding Images to Slides](#5-adding-images-to-slides)
6. [Choosing Your Visual Template](#6-choosing-your-visual-template)
7. [Customizing Colors (Brand Palette)](#7-customizing-colors-brand-palette)
8. [Theme Invert (Dark ↔ Light)](#8-theme-invert-dark--light)
9. [Adding a Brand Watermark](#9-adding-a-brand-watermark)
10. [Changing the Aspect Ratio (Portrait vs Square)](#10-changing-the-aspect-ratio-portrait-vs-square)
11. [The Progress Bar](#11-the-progress-bar)
12. [Preview on Social Media](#12-preview-on-social-media)
13. [The Asset Gallery (Image Locker)](#13-the-asset-gallery-image-locker)
14. [Fine-Tuning with the Focus Modal](#14-fine-tuning-with-the-focus-modal)
15. [Undo & Redo](#15-undo--redo)
16. [Slide Reordering (Drag & Drop)](#16-slide-reordering-drag--drop)
17. [Saving & Loading Projects](#17-saving--loading-projects)
18. [Brand Presets (Agency Mode)](#18-brand-presets-agency-mode)
19. [Backup & Restore (.carousel Files)](#19-backup--restore-carousel-files)
20. [Exporting Your Carousel](#20-exporting-your-carousel)
21. [JSON Editing (Advanced)](#21-json-editing-advanced)
22. [Tips & Tricks](#22-tips--tricks)
23. [Mobile & Responsive Design](#23-mobile--responsive-design)
24. [FAQ](#24-faq)

---

## 1. Your First Carousel (Quick Start)

Here's the fastest path from zero to a finished carousel:

1. **Open the app** → [https://mycarouselcreator.vercel.app/](https://mycarouselcreator.vercel.app/)
2. **Immediate Start** → No splash screens or intros.
3. **Type in the Bulk Editor** (left panel):

```
/h/ Why Remote Work is Here to Stay
/sh/ 5 Data-Backed Reasons

Remote work isn't a trend — it's the new default.
Here are 5 reasons why it's not going away.

/h/ 1. Productivity is Higher
Studies show *remote workers* are 13% more productive than office workers.

/h/ 2. Cost Savings
Companies save an average of **$11,000 per year** per remote employee.
```

1. **Watch the preview** update on the right panel in real-time.
2. **Click "Download PDF"** at the top of the right panel.
3. **Done!** Your carousel is saved as a multi-page PDF ready for LinkedIn.

---

## 2. Setting Up Your Profile

Your identity appears on the footer of every slide. This is how your audience knows who made the carousel.

### Where to Find It

Look in the left panel. Scroll to the **Setup** section (it's the area with "My Profile" fields).

### What You Can Set

| Setting | What It Does | Example |
| :--- | :--- | :--- |
| **Name** | Your display name on every slide footer | `Jane Doe` |
| **Handle** | Your social handle shown below your name | `@janedoe` |
| **Avatar** | A small profile picture on each slide | Upload any square image |

### How the Avatar Works

- Click the upload area and select a photo.
- The app automatically compresses it to 256px width.
- It's stored as a base64 string in your browser — never uploaded anywhere.
- To remove it, click the trash icon next to the avatar preview.

### Show/Hide the Profile

There's a toggle to show or hide the entire footer (name + handle + avatar). If you want clean slides without branding, just turn it off.

---

## 3. Writing Content with the Bulk Compiler

The Bulk Compiler is the heart of Carousel Architect. It's a smart text parser that turns plain text into structured slides.

### Where to Find It

It's the large text area in the left panel. You'll see two modes at the top: **Raw** and **Visual**. Start with **Raw** (the default).

### The Basic Rules

**Rule 1: `/h/` creates a headline.**

```
/h/ This Is My Headline
```

The text after `/h/` becomes the big, bold title at the top of the slide.

**Rule 2: `/sh/` creates a subtitle.**

```
/sh/ A Supporting Line of Text
```

This appears smaller, below the headline.

**Rule 3: Plain text becomes the body.**

```
This is regular body text.
It can span multiple lines.
Each line stays in the same slide.
```

**Rule 4: A blank line creates a new slide.**

```
/h/ Slide One Title
This is slide one body.

/h/ Slide Two Title
This is slide two body.
```

The blank line between " This is slide one body." and "/h/ Slide Two Title" tells the compiler: "Start a new slide here."

### A Complete Example

```
/h/ The Future of AI
/sh/ What Every Business Leader Needs to Know

AI is no longer science fiction.
It's here, and it's changing everything.

/h/ 1. AI Saves Time
Companies using AI report *40% faster* workflows.

/h/ 2. AI Cuts Costs
The average ROI on AI projects is **$3.50 for every $1 spent**.

/h/ 3. AI Improves Quality
Error rates drop by __30%__ when AI assists human decision-making.

/h/ Ready to Start?
/sh/ Visit our website to learn more
The future belongs to those who act _now_.
```

This creates a 5-slide carousel with headlines, subtitles, body text, and formatted accents.

---

## 4. Formatting Text (Markdown)

Carousel Architect supports a lightweight markdown syntax for styling your text. These work inside headlines, subtitles, and body text.

| What You Type | What It Does | What It Looks Like |
| :--- | :--- | :--- |
| `*highlighted*` | Accent highlight | Colored text (Minimal), block background (Brutalist), blue link (Tweet) |
| `**bold text**` | Bold | **Heavy weight text** |
| `_italic text_` | Italic | *Slanted text* |
| `__underlined__` | Underline | Text with a line beneath |

### Combining Styles

You can nest styles together:

- `**_bold and italic_**` → Bold italic text
- `*__highlighted and underlined__*` → Highlighted with underline
- `**__bold and underlined__**` → Bold with underline

### Important Notes

- The `*highlight*` style changes appearance based on which template you're using. In "Minimal," it's colored text. In "Brutalist," it adds a colored block behind the text. In "Tweet," it turns blue like a link.
- Markdown works in headlines, subtitles, and body text equally.

---

## 5. Adding Images to Slides

There are three ways to add images to your carousels:

### Method 1: Drag and Drop (Easiest)

1. Find an image file on your computer.
2. Drag it directly onto the Bulk Editor text area.
3. The app automatically:
   - Compresses the image for performance.
   - Adds it to your Asset Gallery.
   - Inserts a tag like `[img:bg_7f2x1]` at your cursor position.
4. The image appears inline in your slide.

### Method 2: Asset Gallery Upload

1. Scroll to the **Asset Gallery** section in the left panel.
2. Click **"+ Upload Images"** and select one or more images.
3. Click any image thumbnail to copy its `[img:ID]` tag.
4. Paste the tag wherever you want the image to appear in your Bulk text.

### Method 3: Per-Slide Background Image

1. Tap on a slide in the preview to open the Focus Modal.
2. Switch to the **Bg** tab.
3. Upload an image — it becomes the full background of that specific slide.
4. Use the tag parameter: `/h, bg:ID/ Headline` to set it via text.

---

## 6. Choosing Your Visual Template

Templates control the visual style of your slides. Your content stays the same — only the look changes.

### Available Templates

| Template | Style | Best For |
| :--- | :--- | :--- |
| **Minimal** | Clean, modern, subtle | Professional LinkedIn content |
| **Tweet** | Simulates a Twitter/X post | Viral-style engagement content |
| **Brutalist** | Heavy, bold, high-contrast | Attention-grabbing statements |
| **Highlight** | Dynamic color accents | Emphasis-heavy content |

### How to Switch

Go to the **Typography & Motifs** section in the left panel. You'll see four buttons — click any of them to switch instantly. The preview updates in real-time.

### Export Bonus

When you export as **ZIP**, you get your carousel rendered in **all three main templates** automatically — organized into separate folders. This gives you multiple versions to test on different platforms.

---

## 7. Customizing Colors (Brand Palette)

### Preset Palettes

In the **Brand Palette** section, you'll find preset color schemes:

| Palette | Background | Text | Accent |
| :--- | :--- | :--- |
| **Midnight** | Dark blue-black | White | Amber |
| **Cyberpunk** | Deep purple | Neon green | Pink |
| **Nord** | Dark navy | Light gray | Cyan |
| **Dracula** | Dark charcoal | Light pink | Purple |
| ...and more! | | | |

Click any preset to instantly apply it to all your slides.

### Custom Colors

Below the presets, you'll find three color inputs:

- **BG** — The background color of every slide
- **TEXT** — The primary text color
- **ACCENT** — The highlight/accent color used for `*highlighted*` text, progress bars, and decorative elements

Type any valid hex code (e.g., `#FF5733`) and the preview updates instantly.

---

## 8. Theme Invert (Dark ↔ Light)

Sometimes you want to see what your carousel looks like with reversed colors — dark text on a light background, or vice versa.

### How to Use It

1. Go to the **Brand Palette** section in the left panel.
2. Click the **"Invert Theme (Dark/Light)"** button.
3. The background and text colors swap instantly.

That's it. One click toggles between dark mode and light mode. Your accent color stays the same.

### When to Use It

- You've designed a dark carousel and want to quickly check if a light version looks better.
- A client asks for "the same carousel but in light mode."
- You want to A/B test dark vs. light versions for engagement.

---

## 9. Adding a Brand Watermark

A watermark is a small logo that appears on the top-right corner of every single slide. It's perfect for agencies, brands, and creators who want consistent branding.

### How to Add One

1. Go to the **Brand Palette** section in the left panel.
2. Find the **"Watermark Logo"** area.
3. Click the upload button and select your logo image.
4. The logo appears immediately on every slide in the preview.

### How It Works Behind the Scenes

- Your logo is auto-compressed to a maximum width of 300px.
- It's displayed at 80% opacity so it doesn't distract from your content.
- It's positioned at the top-right corner of every slide, 48px from the edges.
- Maximum display size: 150px wide × 60px tall.
- The watermark is stored in IndexedDB — it survives browser refreshes.

### How to Remove It

Click the **trash icon** next to the watermark preview to remove it. All slides update instantly.

### Does It Appear in Exports?

**Yes.** The watermark is rendered directly on the slide canvas, so it appears in both PDF and ZIP exports.

---

## 10. Changing the Aspect Ratio (Portrait vs Square)

Different social media platforms prefer different image sizes. Carousel Architect supports two formats:

### Available Formats

| Format | Dimensions | Best For |
| :--- | :--- | :--- |
| **Vertical (4:5)** | 1080 × 1350 px | LinkedIn carousels, Instagram feed posts |
| **Square (1:1)** | 1080 × 1080 px | Twitter/X posts, LinkedIn square posts, universal sharing |

### How to Switch

1. Go to the **Design Settings** section in the left panel (click the gear icon to expand it).
2. Find the **"Global Aspect Ratio"** control.
3. Click **"Vertical (4:5)"** or **"Square (1:1)"**.
4. The entire preview updates instantly — every slide resizes.

### What Happens Under the Hood

- The canvas width stays at 1080px.
- Only the height changes: 1350px for portrait, 1080px for square.
- All scaling math recalculates automatically — no stretching, no warping.
- Exports (PDF and ZIP) use the correct dimensions.
- Your preference is saved to your browser and remembered next time.

---

## 11. The Progress Bar

A progress bar shows viewers how far they are through your carousel. It fills up proportionally with each slide.

### Options

| Setting | Effect |
| :--- | :--- |
| **Off** | No progress bar (default) |
| **Top** | A thin colored bar at the very top of each slide |
| **Bottom** | A thin colored bar at the very bottom of each slide |

### How to Enable

1. Go to **Design Settings** in the left panel.
2. Find **"Progress Bar Axis"**.
3. Click **Top** or **Bottom**.

### How It Works

- On Slide 1 of 10, the bar fills 10% of the slide width.
- On Slide 5 of 10, it fills 50%.
- On Slide 10 of 10, it fills 100%.
- The bar uses your **accent color** for seamless branding.
- It appears in exports.

---

## 12. Preview on Social Media

Want to see exactly how your carousel will look inside a LinkedIn or Instagram feed? The Sandbox wraps your carousel in a simulated social media post.

### Options

| Mode | What It Shows |
| :--- | :--- |
| **Off** | Raw slide preview, no frame (default) |
| **LinkedIn** | Your carousel inside a LinkedIn post with profile info, reactions, and engagement UI |
| **Instagram** | Your carousel inside an Instagram post with like, comment, share, and save icons |

### How to Enable

1. Go to **Design Settings** in the left panel.
2. Find **"Preview on Social Media"**.
3. Click **LinkedIn** or **Instagram**.

### Why Use It

- See if your text is readable at the size LinkedIn/Instagram displays it.
- Check if your colors and contrast work well inside the feed.
- Share a realistic preview with clients before finalizing.

---

## 13. The Asset Gallery (Image Locker)

The Asset Gallery is a persistent library of images you've uploaded. Images stay saved even after you close the browser.

### How to Upload

1. Open the **Asset Gallery** section in the left panel.
2. Click **"+ Upload Images"**.
3. Select one or more images from your computer.
4. They appear as thumbnails in a grid.

### How to Use an Image in a Slide

1. Click on any image thumbnail in the gallery.
2. The tag `[img:ID]` is automatically copied to your clipboard.
3. Paste it into your Bulk text wherever you want the image to appear.

### How to Delete an Image

Hover over an image thumbnail and click the **✕** button that appears in the corner.

### Storage

Images are stored in IndexedDB (not localStorage), so they don't count toward the 5MB browser limit. You can store dozens of high-resolution images without issues.

---

## 14. Fine-Tuning with the Focus Modal

The Focus Modal gives you per-slide precision controls. It's like a mini-Figma for each slide.

### How to Open It

- **Desktop**: Click on any slide in the preview panel.
- **Mobile**: Tap on any slide.

### What You Can Do

#### Size Tab

Control the font size of each text element on the selected slide:

- **Heading Size** — The main headline (default: 120px)
- **Subheading Size** — The subtitle or section header (default: 60px)
- **Body Size** — The body paragraph text (default: 40px)

Use the **+** and **−** buttons, or type an exact number.

#### Fonts Tab

Override fonts for this specific slide:

- Type any valid [Google Font](https://fonts.google.com) name.
- Changes apply only to the current slide.

#### Align Tab

- **Horizontal**: Left, Center, or Right text alignment.
- **Vertical (Y-Offset)**: Shift the entire text block up or down. Use the **↑** and **↓** buttons for 10px increments, or type an exact value.

#### Bg Tab

Upload a background image for this specific slide:

- This overrides the global background color for this slide only.
- Click the upload area and select an image.
- The image fills the entire slide as a cover background.
- Click the trash icon to remove it.

### Closing the Modal

Click **"Done"** in the top-right corner.

---

## 15. Undo & Redo

Carousel Architect has a built-in time-travel engine for your text.

### Keyboard Shortcuts

- **Ctrl + Z** (Windows) / **Cmd + Z** (Mac) → Undo
- **Ctrl + Shift + Z** (Windows) / **Cmd + Shift + Z** (Mac) → Redo

### How It Works

- Every time you pause typing for 500 milliseconds, the app saves a snapshot of your text.
- Up to 50 snapshots are kept in memory.
- Undo steps backward through your history. Redo steps forward.
- If you undo several steps and then type new text, the "future" history is discarded (just like in any text editor).

---

## 16. Slide Reordering (Drag & Drop)

### Desktop

1. Switch to **Grid** view mode (the grid icon at the top of the preview panel).
2. Click and drag any slide to reorder it.
3. Drop it in the desired position.
4. The bulk text and slide order update automatically.

### Mobile

In Grid view, each slide has **← Shift** and **→ Shift** buttons:

- **← Shift** moves the slide one position to the left.
- **→ Shift** moves the slide one position to the right.

---

## 17. Saving & Loading Projects

### Save a Project

1. Open the **My Saved Slides** section in the left panel.
2. Click **"+ New Snapshot"**.
3. Enter a name for your project.
4. Your entire workspace (text, theme, settings) is saved locally.

### Load a Project

Click any saved project name to restore it. The app loads everything — text, colors, fonts, and settings.

### Delete a Project

Hover over a saved project and click the trash icon.

---

## 18. Brand Presets (Agency Mode)

If you manage multiple brands or clients, Brand Presets let you save and switch between different branding configs.

### What Gets Saved

- Font choices (heading, subheading, body)
- Color scheme (background, text, accent)
- Profile info (name, handle, avatar)

### How to Save a Preset

1. Set up your fonts, colors, and identity for a specific brand.
2. Scroll to the **Brand Presets** section.
3. Click **"+ Save Current"**.
4. Give it a name (e.g., "Client: Acme Corp").

### How to Load a Preset

Click the preset name. Everything switches instantly — fonts, colors, identity.

---

## 19. Backup & Restore (.carousel Files)

### Export a Backup

1. Go to **My Saved Slides**.
2. Click the **code icon** (next to "+ New Snapshot").
3. A `.carousel` file downloads to your computer.
4. This file contains **everything**: your text, theme, and all uploaded images.

### Import a Backup

1. Go to **My Saved Slides**.
2. Click **"↑ Import .carousel File"**.
3. Select a `.carousel` file from your computer.
4. Your entire workspace is restored.

### When to Use This

- **Backups**: Save a copy of your work before making big changes.
- **Device Transfer**: Move your project from one computer to another.
- **Team Sharing**: Send a `.carousel` file to a colleague.
- **Client Delivery**: Package up finished work for handoff.

---

## 20. Exporting Your Carousel

Two export options are available at the top of the right panel:

### 📄 Download PDF (LinkedIn)

- Generates a multi-page PDF at 1080 × 1350px (or 1080 × 1080px if Square is selected).
- Optimized for LinkedIn document posts.
- JPEG quality: 90%.
- One click, one file.

### 📦 Download ZIP (X / Instagram)

- The **Content Pack Engine** renders your carousel in **all 3 main templates** automatically.
- Packages them into organized subfolders: `/minimal/`, `/tweet/`, `/brutalist/`.
- Each folder contains individually numbered JPEGs.
- Great for testing which template performs best on each platform.

- Everything is free, local, and private.

### What Gets Included in Exports

- All text, formatting, and template styling.
- Background images (global and per-slide).
- Brand watermark (if set).
- Progress bars (if enabled).
- Slide numbers and navigation arrows are **excluded** — they're for preview only.

---

## 21. JSON Editing (Advanced)

For power users, the **JSON** tab gives you direct access to the raw slide data.

### Example Structure

```json
{
  "theme": {
    "background": "#09090B",
    "text": "#FFFFFF",
    "accent": "#F59E0B"
  },
  "slides": [
    {
      "slide_number": 1,
      "type": "title",
      "headline": "My Title",
      "subheadline": "My Subtitle",
      "heading_size": 110,
      "subheading_size": 45
    }
  ]
}
```

Paste valid JSON and click **Apply** to render slides instantly.

---

## 22. Tips & Tricks

| Tip | Description |
| :--- | :--- |
| **Preview Scale** | Use the "Viewport Zoom" slider to fit the canvas to your screen |
| **Canvas Grain** | Add subtle noise texture with the "Canvas Grain" slider for a premium paper-like feel |
| **Slide Navigation** | Click any slide in the preview to open the Focus Modal |
| **Quick Reorder** | Use Grid view + drag-and-drop (desktop) or Shift buttons (mobile) |
| **Background Image** | Upload via Design Settings → Background Style (global) or Focus Modal → Bg (per-slide) |
| **Copy Image Tag** | Click any image in the Asset Gallery to copy its embed tag |
| **Template Testing** | Export as ZIP to get your carousel in all templates at once |
| **Font Discovery** | Visit [fonts.google.com](https://fonts.google.com) to find font names, then type them in the Fonts section |
| **Safe Zones** | Enable the "Safe Zone" toggle to see the content-safe area on each slide |
| **Slide Numbers** | Enable the "Slide Numbers" toggle to see page numbers during editing (hidden in exports) |

---

## 23. Mobile & Responsive Design

Carousel Architect is built as a **PWA (Progressive Web App)**, meaning it works perfectly on phones, tablets, and desktops.

### Mobile-Specific Shortcuts

- **Grid Rescue**: If the preview looks small, switch to **Grid Mode**. We use a rigid CSS Grid that ensures you can see and manage slides even on small screens.
- **Tapping Slides**: On mobile, tapping any slide in the preview gallery instantly opens the **Focus Modal** for full-screen editing.
- **Shift Buttons**: Instead of dragging on touchscreens (which can be flaky), use the "Shift Left" and "Shift Right" buttons on each slide to reorder them.

### Pixel-Perfect Geometry

We use a **Rigid Canvas** architecture. Slides are always rendered at their native 1080px resolution internally. The "Preview Scale" slider simply zooms the camera out. This ensures that what you see on your phone is exactly what gets exported in the PDF.

---

## 24. FAQ

### Q: Where is my data stored?

**A:** Everything is stored locally in your browser using localStorage and IndexedDB. Nothing is ever uploaded to a server. If you clear your browser data, your projects will be lost — so use the `.carousel` backup feature.

### Q: Can I use this on mobile?

**A:** Yes! The app is fully responsive. On mobile, the left panel becomes a scrollable single column, and you can tap slides to open the Focus Modal.

### Q: What if my carousel has too many slides?

**A:** The app supports up to 50 slides. The export engine processes them sequentially to prevent memory issues.

### Q: Can I use my own fonts?

**A:** Yes — any font available on [Google Fonts](https://fonts.google.com). Type the exact font name in the Fonts fields.

### Q: Is it really free?

**A:** Yes. The tool is open source (MIT license). The only limitation is export count in the Community Edition, which can be unlocked with an email.

### Q: Can I use this for commercial work?

**A:** Absolutely. The MIT license allows commercial use. Many agencies use it for client work.

---

*Built for speed. Built for creators.* 🚀
