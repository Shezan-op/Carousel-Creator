# 📜 Syntax Cheatsheet — Complete Reference

> Every tag, option, and inline style supported by Carousel Creator.

---

## Slide Separators

```
Leave a blank line (press Enter twice) between paragraphs to start a new slide.
```

**Example — 2 slides:**
```
/h/ First Slide Title

This is already a different slide.
```

---

## Content Tags

Place these at the **very start of a line**. Everything after the closing `/` becomes the content.

| Tag | Role | Default Size |
|---|---|---|
| `/h/` | Headline — the biggest text on the slide | 120px |
| `/sh/` | Subheading — supporting text below the headline | 60px |
| `/config/` | Config-only line — no visible content | — |
| *(no tag)* | Body text — normal paragraph copy | 40px |

```
/h/ This is a Headline
/sh/ This is a Subheading
This is body text — no tag needed.
```

---

## Config Options

Combine options with any tag using commas. Options go **inside** the slashes.

**Syntax**: `/tag, option1:value1, option2:value2/ Content here`

| Option | Description | Type | Example |
|---|---|---|---|
| `s:` | Headline font size in px | integer | `/h, s:160/ Giant Title` |
| `sh_s:` | Subheading font size in px | integer | `/sh, sh_s:80/ Big Sub` |
| `b_s:` | Body text font size in px | integer | `/config, b_s:55/` |
| `a:` | Text alignment for this slide | `left` `center` `right` | `/h, a:center/ Centered` |
| `y:` | Vertical offset in px (positive = down, negative = up) | integer | `/h, y:-100/ Moved Up` |
| `bg:` | Slide background image ID | string | `/h, bg:img_abc123/` |

### Combining multiple options

```
/h, s:150, a:center, y:-50/ Perfectly Positioned Headline
/sh, sh_s:70/ This subheading is larger than usual
/config, b_s:60/
All the body text on this slide will be 60px.
```

### Config-only slide (no visible text from the tag line)

Use `/config/` when you want to change body size or other settings without adding a headline:

```
/config, b_s:50/
This body text will render at 50px.
No headline, no subheading — just large body copy.
```

---

## Inline Text Styling

Use these **inside** your content anywhere — in headlines, subheadings, or body text.

| Effect | Syntax | Notes |
|---|---|---|
| **Bold** | `**word**` | Font weight 900 |
| *Highlighted (accent color)* | `*word*` | Uses your theme's accent color |
| *Italic* | `_word_` | Standard italic |
| Underline | `__word__` | Underline with 4px offset |
| New line (within same slide) | Press Enter once | Stays on the same slide |
| New slide | Press Enter twice | Starts a fresh slide |

### Template-specific highlight behavior

- **Minimal / Tweet**: `*word*` renders the word in the accent **color**
- **Brutalist**: `*word*` renders the word with the accent color as a **background** (like a highlighter pen)

### Examples

```
/h/ The **3 Rules** of *Growth*

/sh/ __Consistency__ beats _talent_ every single time.

Bullet 1 — Start before you're ready
Bullet 2 — Ship *fast*, iterate faster
Bullet 3 — **Your network = your net worth**
```

---

## Inline Images

First upload an image in the **Images** section of the app — you'll receive an ID (e.g., `img_x7a2bc`).

Then embed it anywhere in your text:

```
[img:img_x7a2bc]
```

Images render as full-width blocks with rounded corners and a drop shadow, centered within the text flow.

---

## Slide Background Images

To set a background image for a specific slide:

1. Upload an image via the **Images** section (or the per-slide Bg tab in the Tuner)
2. Copy the image ID
3. Add `bg:` to the slide's headline config tag

```
/h, bg:img_x7a2bc/ Title on a Custom Background
/sh/ The image fills the entire slide behind the text
```

---

## Quick Templates

### Cover Slide (with custom sizing)
```
/h, s:160, a:center/ The Title of Your Carousel
/sh, a:center/ A compelling subheadline goes here
```

### Statistic / Impact Slide
```
/h, s:200, a:center/ *73%*
/sh, sh_s:65, a:center/ of creators post carousels weekly
/config, b_s:45/
Source: Content Marketing Institute 2025
```

### Listicle Body Slide
```
/h/ 5 Things Nobody Tells You

**1.** Starting is the hardest part
**2.** Done beats perfect
**3.** *Consistency* compounds
**4.** Your audience teaches you what to make
**5.** The best time to post was yesterday
```

### CTA / Final Slide
```
/h, a:center/ Found this useful?

/sh, a:center/ Follow for more like this.
/sh, a:center/ Drop a 🔥 in the comments.
```

---

## Cheatsheet Card (Print-Friendly)

```
TAGS            /h/ Headline · /sh/ Subheading · /config/ Settings only

OPTIONS         s:px · sh_s:px · b_s:px · a:left|center|right · y:px · bg:id

INLINE          **bold** · *highlight* · _italic_ · __underline__

IMAGES          [img:your_id]

SLIDES          blank line = new slide
```
