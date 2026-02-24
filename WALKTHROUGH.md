# Carousel AI Creator - User Guide

This application allows you to transform any text or raw JSON into professional-grade social media carousels (1080x1350px).

## Getting Started

1. **Configure API Key**: Go to the **AI Generator** tab and enter your OpenRouter API key.
2. **Setup Branding**: Go to the **Settings** tab to upload your profile picture and set your social media handle.
3. **Generate**:
   - Paste a LinkedIn post, article, or raw text into the AI Generator input.
   - Click **Generate Carousel**.
   - The AI will automatically structure your content into Title, Content, and CTA slides with a balanced theme.
4. **Export**: Click the **Download PDF** button at the top of the preview pane to save your high-resolution carousel.

## JSON Schema (For Manual Control)

If you prefer to manually edit the layout, use the **Manual JSON** tab with the following structure:

```json
{
  "theme": {
    "background": "#000000",
    "text": "#ffffff"
  },
  "slides": [
    {
      "slide_number": 1,
      "type": "title",
      "headline": "Massive Title",
      "subheadline": "Catchy subheadline"
    },
    {
      "slide_number": 2,
      "type": "content",
      "body": "Your main value proposition here..."
    },
    {
      "slide_number": 3,
      "type": "cta",
      "body": "Join the community today!"
    }
  ]
}
```

## Technical Details

- **Aspect Ratio**: 4:5 (Professional standard for carousels).
- **Export Resolution**: 3x Pixel Ratio for crystal clear text on mobile.
- **Privacy**: API keys and avatar images are handled entirely in the browser (localStorage and Object URLs).
