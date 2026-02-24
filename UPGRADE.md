# ARCHITECTURE PATCH: PHASE 2 - THEMATIC POLISH

Do not break existing local storage or layout logic.

## 1. 1-CLICK THEME PRESETS

1. Update the `Theme` type in `types.ts` to `{ background: string, text: string, accent: string }`.
2. In the Left Pane Controls, add a "Theme Presets" section with 4 buttons.
3. Hardcode these presets:
   - Minimal: `{ background: '#09090B', text: '#FFFFFF', accent: '#3B82F6' }`
   - Cyberpunk: `{ background: '#000000', text: '#FFFFFF', accent: '#39FF14' }`
   - Brutalist: `{ background: '#FF3366', text: '#000000', accent: '#000000' }`
   - Midnight: `{ background: '#0F172A', text: '#F8FAFC', accent: '#F59E0B' }`
4. When a user clicks a button, update `carouselData.theme`.

## 2. CINEMATIC SVG NOISE

We want to add texture to the background of the rigid canvas.

## 3. THE KEYWORD HIGHLIGHTER UTILITY

## ARCHITECTURE PATCH: PHASE 3 - MEDIA & FONTS

WARNING: The font injection engine must be built flawlessly or the export engine will capture default browser fonts.

## 1. CUSTOM BACKGROUND IMAGES

## 2. GOOGLE FONT INJECTION ENGINE

## Phase 4: Template Engine (COMPLETE)

- [x] **Multi-Layout Switcher**: Add a "Template" toggle in settings ('minimal', 'tweet', 'brutalist').
- [x] **'Tweet' Layout**: Renders slide as a faux-X post with author info, border-box, and stats.
- [x] **'Brutalist' Layout**: Massive uppercase text, high-contrast block highlights, minimalist footer.
- [x] **Stable Preview**: Fix impurity warnings by basing random stats on deterministic slide indices.

## Phase 5: Native In-App AI Engine (COMPLETE)

- [x] **OpenRouter Integration**: Native Text-to-JSON generator using Claude 3.5 Sonnet.
- [x] **Structured Output**: Use `json_object` response format for guaranteed validity.
- [x] **Branding Persistence**: Ensure API key and author settings persist across reloads.
- [x] **Optimized Prompting**: Extract hooks and apply `*asterisks*` for the highlight engine automatically.

## Phase 6: Production Shell & Optimization (COMPLETE)

- [x] **Mobile Responsive Scaling**: Dynamic `transform: scale()` for small screens.
- [x] **Premium Footer**: Comprehensive brand footer with social links and company info.
- [x] **Custom GPT Fallback**: Integrated referral link for users without API keys.
- [x] **PWA Support**: Installed and configured `vite-plugin-pwa` for offline/installable use.

## Phase 7: Advanced Controls & Polish (COMPLETE)

- [x] **Slide Deletion & Reordering**: Added hover controls to delete or move slides up/down.
- [x] **Bulk Import**: Added a 'Bulk' tab for instant newline-to-slide conversion.
- [x] **Theme Presets Expansion**: Added 'Solarized', 'Nord', 'Dracula', 'Forest', and 'Royal' palettes.
- [x] **Canvas Zoom**: Dedicated slider in Setup for manual workspace scaling.

## Phase 8: Mobile UX & Responsive Flow (COMPLETE)

- [x] **Responsive Document Flow**: Switched from a 'locked body' architecture to a natural document flow for mobile devices.
- [x] **Native Scrolling**: Removed global `overflow-hidden` to allow standard browser scrolling on iOS/Android.
- [x] **Fluid Shell**: Implemented `lg:` prefixes to separate desktop (locked 100vh) and mobile (natural stack) behaviors.
- [x] **Unlocked Preview**: Carousel canvas viewport now allows horizontal inspection (recommended: `overflow-x: auto` and `overflow-y: hidden` with `touch-action: pan-x` to preserve carousel swipe navigation).
- [x] **SEO Optimization**: Updated documentation and metadata for better search visibility.

## 3. IMPLEMENT THE SWITCH STATEMENT

Inside `.slide-export-node`, replace the direct rendering of the text/footer with a switch statement based on `activeTemplate`:

**Case 'minimal':** - Use the existing centered text and pinned footer layout.

**Case 'tweet':**

- Create a container simulating a massive Faux Tweet.
- Center it vertically. Add a subtle border and background `rgba(255,255,255,0.05)`.
- Top of tweet: Display `authorAvatar` (120x120px), `authorName`, `authorHandle`, and a small CSS-drawn "Verified Checkmark" using `accentColor`.
- Middle: Render the slide text left-aligned, size `65px`.
- Bottom: Add fake engagement metrics (Comments, Retweets, Likes) using random static numbers or `lucide-react` icons.

**Case 'brutalist':**

- Remove standard alignment. Text should be massive, tight `lineHeight: 0.9`, uppercase, and heavy `fontWeight: 900`.
- Font sizes should be `130px` for titles and `90px` for body.
- The footer should not use the gray circle. It should be a minimalist line separator with text: `AUTHOR HANDLE` on the left, and `SLIDE X / Y` on the right.
