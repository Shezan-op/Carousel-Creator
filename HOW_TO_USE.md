# 📖 How to Use Carousel Creator

This guide covers every feature in the app, from first launch to final export. Total time to your first carousel: **under 2 minutes**.

---

## 1. Set Up Your Creator Identity

Navigate to the **Setup** tab (gear icon).

| Setting | What It Does |
|---------|-------------|
| **Name & Handle** | Displayed on the slide footer (e.g., "Jane Doe" / "@janedoe") |
| **Avatar** | Upload a square image — it's compressed to 256px and stored as base64 in your browser |
| **Character Foundry** | Independently select Google Fonts for **Headlines**, **Subheads**, and **Body**. Type any valid font name from [fonts.google.com](https://fonts.google.com). |
| **Template** | Switch between Minimal, Tweet, and Brutalist visual styles |
| **Footer Layout** | Position your branding badge: Left, Center, or Right |
| **Profile Toggle** | Show or hide the avatar/handle on slides |

> **💡 Tip:** All settings persist in `localStorage`. Close the browser, come back tomorrow — everything is exactly as you left it.

---

## 2. Write Content with the Bulk Compiler

Navigate to the **Bulk** tab (the default tab).

### Basic Syntax

```
/h/ Your Headline Here
/sh/ An optional subtitle
Body text goes here without any prefix.
More body text on the next line.

/h/ This Starts Slide 2
Because there was a blank line above.
Body for slide 2.
```

### Rules

- **`/h/`** → Headline (large, bold, H1)
- **`/sh/`** → Subheadline on slide 1 (H2) or Section Header on content slides (H3)
- **No prefix** → Body text (automatically collected)
- **Blank line** → Creates a new slide

### Inline Formatting

- `*highlight*` → Accent color (template-aware: colored text in Minimal, background block in Brutalist, link-blue in Tweet)
- `**bold**` → Extra heavy weight
- `_italic_` → Italic emphasis
- `__underline__` → CSS-based underline

### Per-Slide Overrides

Add tuning parameters directly inside the tags:

```
/h, s:120, a:center/ A Bigger, Centered Headline
/sh, sh_s:60/ A Larger Subtitle
```

| Parameter | Effect | Example |
|-----------|--------|---------|
| `s:120` | Headline font size (px) | `/h, s:120/ Big` |
| `sh_s:60` | Subheading font size (px) | `/sh, sh_s:60/ Sized` |
| `b_s:40` | Body font size (px) | `/h, b_s:40/ Title` |
| `a:center` | Text alignment | `/h, a:center/ Centered` |
| `y:50` | Vertical offset (px) | `/h, y:50/ Shifted` |

---

Below the text area (on desktop) or by tapping a slide (on mobile), you'll access the **Focus Modal / Visual Tuner**. This provides precision controls:

- **Numerical Sizing** — Tap the size values and type exact pixels for H1, H2/H3, and Body.
- **Character Foundry** — Type Google font names to see them live on the current slide.
- **Horizontal Alignment** — Toggle Left, Center, or Right text alignment.
- **Y-Offset (Vertical position)** — Shift the entire text block up or down in 10px increments.

> **How it works:** Moving these controls automatically handles the complex tag-based syntax (e.g., `/h, s:120, a:center, y:-20/`) in your bulk text. No manual typing needed.

---

## 4. Customize Your Color Palette

In the **Setup** tab, scroll to the **Chromatic DNA** section.

### Preset Palettes

Click any preset button (Midnight, Cyberpunk, Nord, Dracula, etc.) to instantly apply a curated color scheme.

### Custom Hex Colors

Below the presets, three text fields let you enter exact hex codes:

- **BG** — Slide background color
- **TEXT** — Primary text color
- **ACCENT** — Highlight and accent color

> **Format:** Standard 7-character hex codes (e.g., `#FAFAFA`). The color swatch updates in real-time as you type.

---

## 5. AI-Powered Generation (Optional)

Navigate to the **Auto** tab (sparkles icon).

1. **Enter your OpenRouter API Key** — stored locally, never sent to our servers
2. **Select a model** — Free tier models like `google/gemini-2.0-flash-lite-preview-02-05:free` work well
3. **Paste your raw content** — blog posts, LinkedIn drafts, brain dumps, anything
4. **Click Generate** — the AI structures your text into optimized carousel slides with hooks and highlights

> **Privacy:** This is a BYOK (Bring Your Own Key) system. Your API key and content go directly from your browser to OpenRouter. We never see them.

---

## 6. Export Your Carousel

Two export options are available at the bottom of the right panel:

### 📄 Download PDF (LinkedIn)

- Generates a multi-page PDF at 1080×1350px per page
- Optimized for LinkedIn document posts
- JPEG quality: 90%

### 📦 Download ZIP (X / Instagram)

- The **Content Pack Engine** renders your carousel in **all 3 templates** automatically
- Packages them into organized folders: `/minimal/`, `/tweet/`, `/brutalist/`
- Each folder contains individually numbered JPEGs

> **Export Limits:** 5 free exports per day. Enter your email to unlock unlimited lifetime exports while in Beta.

---

## 7. Manual JSON Editing

Navigate to the **JSON** tab for direct access to the raw slide data structure:

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

## Keyboard Shortcuts & Tips

| Tip | Description |
|-----|-------------|
| **Preview Scale** | Use the zoom slider in Setup to fit the canvas to your screen |
| **Slide Navigation** | Click any slide in the preview to select it for tuning |
| **Delete Slides** | Hover over a slide and click the trash icon |
| **Reorder Slides** | Hover and use the up/down arrows |
| **Background Image** | Upload via Setup → Background. It renders as an absolute layer behind all text |
| **Noise Texture** | Adjust the noise opacity slider for cinematic grain (0-100%) |

---

*Built for speed. Built for creators.* 🚀
