# 🔐 Security Policy — Carousel Creator

## Overview

Carousel Creator is a **100% client-side application**. There are no servers, no databases, no user accounts, and no cloud storage. All data processing happens entirely within your web browser.

This document explains how your data is handled and what security measures are in place.

---

## Data Storage

### Where Your Data Lives

| Data Type | Storage Method | Location |
|-----------|---------------|----------|
| Text content (bulk text) | IndexedDB via `localforage` | Your browser |
| Uploaded images | IndexedDB via `localforage` | Your browser |
| Brand watermark | IndexedDB via `localforage` | Your browser |
| Saved projects | IndexedDB via `localforage` | Your browser |
| Brand presets | IndexedDB via `localforage` | Your browser |
| Color preferences | `localStorage` | Your browser |
| Font preferences | `localStorage` | Your browser |
| Aspect ratio | `localStorage` | Your browser |
| Creator identity | `localStorage` | Your browser |
| OpenRouter API key | `localStorage` | Your browser |

**Nothing is ever sent to a server** (with one optional exception — see AI Generation below).

### Data Persistence

- Data persists until you clear your browser data or use the "Atomic Purge" reset button.
- IndexedDB data survives browser restarts and system reboots.
- Use the `.carousel` backup feature to save your work to a file for safekeeping.

---

## AI Generation (Optional)

If you choose to use the AI-powered generation feature:

1. You provide your own **OpenRouter API key** (BYOK — Bring Your Own Key).
2. Your key is stored in `localStorage` on your device. It is never sent to our infrastructure.
3. When you click "Generate," your text prompt is sent **directly from your browser to the OpenRouter API**. We do not proxy, log, or intercept this request.
4. The response (generated carousel text) is received directly by your browser.

**We have zero visibility into your API key, your prompts, or your AI-generated content.**

---

## Export Security

### PDF and ZIP Exports

- Exports are generated entirely in your browser using `html-to-image`, `jsPDF`, and `JSZip`.
- No export data is sent to any server.
- Exported files are downloaded directly to your device.

### Lead Capture (Email)

- When you enter your email to unlock unlimited exports, the email is sent to a Google Apps Script endpoint.
- This is the **only network request** the app makes (besides Google Fonts and the optional AI API).
- The email is used solely for product updates and is never shared with third parties.

---

## Client-Side Security Measures

### Input Sanitization

- Text input is capped at **10,000 characters** to prevent excessive memory usage.
- Slide count is capped at **50 slides** to prevent browser memory exhaustion.
- Image uploads are compressed before storage to prevent IndexedDB bloat.

### API Key Handling

- Your OpenRouter API key is displayed as a password field (masked by default).
- It is stored only in `localStorage` — never transmitted to any server we operate.
- If you clear your browser data, the key is deleted.

### Image Handling

- All uploaded images are immediately converted to **base64 data URLs**.
- This prevents CORS (Cross-Origin Resource Sharing) errors during canvas-to-image export.
- Images are compressed client-side before storage.

### Export Integrity

- The export engine strips all UI overlay elements (slide numbers, navigation arrows, safe zone guides) before capturing.
- This ensures exported images contain only your carousel content — no editor artifacts.

### Rate Limiting

- Email submission has a **30-second cooldown** (client-side) to prevent abuse.
- Export count is tracked in `localStorage` with server-side verification disabled (beta period).

---

## What We Don't Do

- ❌ We don't track your keystrokes or text content.
- ❌ We don't send your images to any server.
- ❌ We don't store your data in a cloud database.
- ❌ We don't use cookies for tracking.
- ❌ We don't have user accounts or passwords.
- ❌ We don't sell or share any data with third parties.

---

## Third-Party Services

| Service | Purpose | Data Sent |
|---------|---------|----------|
| **Google Fonts** | Font loading | Font names only (standard browser request) |
| **Vercel Analytics** | Anonymous page view counting | No personal data |
| **OpenRouter** (optional) | AI text generation | Your prompt text (direct browser→API, BYOK) |
| **Google Apps Script** (optional) | Email collection for export unlock | Your email address only |

---

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

1. **Email**: Contact the maintainer via LinkedIn DM at [linkedin.com/in/shezanahmed29](https://www.linkedin.com/in/shezanahmed29/)
2. **GitHub**: Open a private security advisory on the repository

Please do not open a public issue for security vulnerabilities.

---

## Clearing Your Data

To remove all Carousel Creator data from your browser:

1. Open your browser's Developer Tools (F12 or Ctrl+Shift+I).
2. Go to the **Application** tab.
3. Under **Storage**, click **Clear site data**.
4. This removes all localStorage, IndexedDB, and cached data.

Alternatively, use the **"Atomic Purge"** button in the app to reset the current session.

---

*Your privacy is our priority. Your data stays on your device.*
