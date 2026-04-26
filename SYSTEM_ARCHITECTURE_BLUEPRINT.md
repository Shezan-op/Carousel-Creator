# System Architecture & Data Flow: Carousel Creator

## 1. HIGH-LEVEL BREAKDOWN
**Carousel Creator** (internally "Carousel Architect") is a high-performance, local-first web application designed to generate multi-slide social media carousels. Its core mechanic revolves around a **Markdown-inspired tag-based syntax** that allows users to rapidly prototype designs without drag-and-drop manual alignment.

The application operates as a **Pure Client-Side PWA**, requiring no backend for core functionality. It leverages high-quality DOM-to-Image rendering to produce professional assets for LinkedIn, Instagram, and X (formerly Twitter).

## 2. TECH STACK
| Layer | Technology |
|-------|------------|
| **Core Framework** | React 19 + TypeScript (Vite) |
| **Styling** | Tailwind CSS 4.0 |
| **State Management** | React Context/State Hooks (Centralized in `App.tsx`) |
| **Persistence Layer** | `localforage` (IndexedDB) & `localStorage` |
| **Vector/Icons** | Lucide React |
| **PWA Support** | `vite-plugin-pwa` (Service Workers + Offline Caching) |
| **Deployment** | Vercel (Client-side only) |

## 3. DATA FLOW & STATE MAP
The system follows a synchronous, one-way data flow for content generation:

1.  **Input Phase**: Users provide data through the **Bulk Text Editor** (Kebab-case tags like `/h/`, `/sh/`) or the **Visual Builder** form.
2.  **Compilation Phase**: The `compileBulkText` function (Regex-based parser) in `App.tsx` transforms raw text into a structured `CarouselData` object containing `Theme` and `Slide[]`.
3.  **Refactor/Injection Layer**: Specific slide modifications (size, font, alignment) are "injected" back into the raw text string to maintain the text-as-source-of-truth model.
4.  **Reconciliation & Rendering**:
    *   The `CarouselPreview` component maps the `carouselData` to a series of `node` elements.
    *   `renderHighlightedText` (Utility) parses inline styles (bold, italic, images) and injects them into the slide DOM via `dangerouslySetInnerHTML`.
5.  **Persistence Layer**: 
    *   **Large Objects** (Base64 images, saved projects) are serialized into **IndexedDB** via `localforage`.
    *   **Configuration** (Author name, last used font, theme) is stored in **LocalStorage**.
6.  **Export Pipeline**:
    *   The UI switches to hidden/high-resolution `slide-export-node` containers.
    *   `html-to-image` captures these nodes as high-DPI JPEGs.
    *   `jsPDF` (for LinkedIn) or `JSZip` (for X/Instagram) bundles the images into the final download artifact.

## 4. EXTERNAL DEPENDENCIES
*   **`html-to-image`**: Core rendering engine for converting HTML/CSS into high-resolution images.
*   **`jspdf`**: Generates multi-page PDF documents for LinkedIn carousel uploads.
*   **`jszip`**: Compresses generated slide images into a single `.zip` file.
*   **`localforage`**: Provides a robust abstraction for IndexedDB, allowing for the storage of multi-megabyte image data and project history offline.
*   **`dnd-kit`**: Handles the drag-and-drop sorting of slides in the visual list.
*   **Google Fonts API**: Dynamic injection of CSS stylesheets to support 1500+ fonts on the fly.

## 5. TRUST BOUNDARIES
As a client-side application, trust boundaries are localized to the user's browser environment:

*   **User Text Input (High-Risk)**: The text editor accepts raw input which is parsed and rendered as HTML. The `dangerouslySetInnerHTML` function in `utils.tsx` is the primary sink for untrusted data.
*   **Project/File Imports (High-Risk)**: The `.carousel` file import feature parses user-uploaded JSON directly into the application state without full schema validation beyond basic structure checks.
*   **Base64 Image Injection**: The `[img:id]` syntax allows arbitrary Base64 strings (stored in IndexedDB) to be rendered as `<img>` tags.
*   **LocalStorage/IndexedDB**: While local, data stored here is persistent and could be a target for persistent XSS if the input is not sanitized before being saved and later re-rendered.
*   **Google Fonts Service**: Represents an external boundary where CSS is fetched and executed in the global scope.
