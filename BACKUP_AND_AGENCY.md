# 📁 Project Backups & Agency Workflow

Carousel Creator is now a professional-grade tool for creators and agencies. This guide explains how to manage multiple projects and maintain brand consistency across different clients.

---

## 💾 Saving & Loading Projects

You no longer have to rely on a single working session. You can now save your progress into dedicated slots.

### Creating a Save Slot

1. Open the **📁 Saved Projects** section in the left pane.
2. Click **+ Save Current Project**.
3. Give your project a recognizable name.
4. Your project state (Bulk text, chosen theme, and all uploaded images) is now securely stored in **IndexedDB**.

### Switching Projects

1. Click the **Load** button next to any saved project.
2. **Note:** This will overwrite your current active editor. Always save your current work before loading a different project!

---

## 🏢 Agency Brand Presets

If you create content for multiple brands or clients, **Brand Presets** will save you hours of manual setup.

### How to use Brand Presets

1. Go to the **Setup** tab.
2. Configure your identity: **Name**, **Handle**, **Avatar**, and **Character Foundry** (Fonts).
3. Scroll down to **Brand Presets** and click **+ Save Current**.
4. To apply a client’s branding later, just click their name in the presets list.

**What's saved in a preset?**

- Author Name & Handle
- Author Avatar (Base64)
- Palettes (BG, Text, Accent colors)
- Fonts (Heading, Subhead, Body)

---

## 🔄 Portable Backups (.carousel)

Local storage is great, but what if you want to switch computers or keep a safety copy?

### Exporting a Backup

1. Click **↓ Backup (.carousel)**.
2. A unique file containing your entire workspace will be downloaded.
3. This file includes **full-resolution base64 images**, so you never lose your uploaded assets.

### Importing a Backup

1. Click **↑ Load File**.
2. Select your `.carousel` file.
3. The app will reconstruct your project exactly as it was when you backed it up.

---

## 🛠 Engineering Details (For the Curious)

- **Storage**: We use `localforage` to tap into **IndexedDB**. This allows us to store hundreds of megabytes of image data without hitting the 5MB browser limit.
- **Async Logic**: Saving happens in the background, ensuring the UI stays smooth even with 20+ slides and custom backgrounds.
- **Portability**: The `.carousel` file is a UTF-8 JSON blob. You can open it in any text editor to peer into the structure.

---

*Build faster. Scale your content. Stay organized.* 🚀
