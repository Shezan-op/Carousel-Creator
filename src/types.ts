export interface Theme {
    background: string;
    text: string;
    accent: string;
}

export interface Slide {
    slide_number: number;
    type: 'title' | 'content' | 'cta';
    headline?: string;
    subheadline?: string;
    subheading?: string;
    body?: string;
    // Size Overrides (per-slide)
    heading_size?: number;      // h1
    subheading_size?: number;   // h2 (subheadline) & h3 (subheading) — unified control
    /** @deprecated Use subheading_size instead. Kept for backwards compatibility with existing slide data. */
    subheadline_size?: number;
    body_size?: number;         // body
    text_align?: 'left' | 'center' | 'right';
    y_offset?: number;
    bg_image?: string;
}

export interface CarouselData {
    theme: Theme;
    slides: Slide[];
}

export interface BrandPreset {
    id: string;
    name: string;
    theme: Theme;
    fonts: { heading: string; subheading: string; body: string };
    author: { name: string; handle: string; avatar: string };
}

export interface SavedProject {
    id: string;
    name: string;
    date: string;
    bulkText: string;
    theme: Theme;
    inlineImages: Record<string, string>;
}
