# Carousel Creator 🎠

A 100% serverless, client-side React application that converts raw text into stunning, high-resolution social media carousels. Built for speed, privacy, and zero-friction content creation.

![Carousel Creator Preview](/public/Logo.png)

## Why I Built This

Creators spend hours wrestling with heavy design tools (Canva, Figma) just to format simple text. I wanted a tool where I could dump raw text, apply a theme, and instantly export a `1080x1350` PDF ready for LinkedIn or Instagram.

Most AI tools charge $30/month for this. I built it for free using a Bring-Your-Own-Key (BYOK) architecture.

## The Architecture

* **Frontend:** React 19 + Vite + TypeScript
* **Styling:** Tailwind CSS 4.0
* **Export Engine:** `html-to-image` + `jsPDF` + `JSZip`
* **Backend:** Absolutely none. 100% Client-side.
* **AI Engine:** OpenRouter API (BYOK - Your key stays in your browser's local storage).

## Features

* **The Rigid Canvas:** Mathematical scaling ensures your exports are always crisp `1080x1350` resolution, regardless of your screen size.
* **The Highlight Engine:** Wrap words in `*asterisks*` to automatically render them as high-contrast background blocks or marker highlights.
* **Content Pack Export:** Clicking "Download ZIP" automatically loops through all 3 templates (Minimal, Tweet, Brutalist) and packages them into organized folders so you have variations for different platforms.
* **Privacy First:** Your API keys and content never leave your browser.

## Running Locally

1. Clone the repo: `git clone https://github.com/Shezan-op/Carousel-Creator.git`
2. Install dependencies: `npm install`
3. Run the dev server: `npm run dev`

---
*Built by [Shezan - Founder @LeadLinked](https://www.linkedin.com/company/lead-linked/)*
