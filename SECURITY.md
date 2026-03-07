# Security & Privacy Policy

Carousel Creator is built as a **100% Client-Side / Serverless** application. This means your data never leaves your browser unless you explicitly trigger an external API.

## 🔒 Privacy-First Architecture

- **No Database**: We do not store your carousels, text, or profile information on any server. Everything is stored in your browser's `localStorage`.
- **Local Images**: Your avatar and background images are converted to **Base64 data URLs** and stored locally. They are never uploaded to a cloud bucket.
- **BYOK (Bring Your Own Key)**: AI features require an OpenRouter API key. This key is stored in your browser's persistent storage and is only used to make requests directly to `openrouter.ai`.

## 🛡 Security Models

### 1. API Key Safety

- The OpenRouter API key is treated as a sensitive credential.
- It is never logged to the console or transmitted to any third-party analytics.
- It is stored as a standard string in `localStorage`.

### 2. Export Integrity

- We use `html-to-image` for canvas rendering. To prevent CORS "tainted canvas" errors, all user-provided images are base64-encoded on ingestion.
- This ensures that exports remain high-fidelity and secure from external script injection.

### 3. Lead Capture Logic

- Our optional email-unlock feature uses a simple Google Apps Script relay.
- Your email is only used to unlock the Beta features and provide you with product updates.

## 🐛 Vulnerability Reporting

If you find a security vulnerability, please do not open a public issue. Instead, contact the maintainer directly:

- **Maintainer**: Shezan Ahmed
- **LinkedIn**: [shezanahmed29](https://www.linkedin.com/in/shezanahmed29/)

---

*Your content is your business. We just provide the tools to make it look great.* 🚀
