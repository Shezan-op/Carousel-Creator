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
    subheadline_size?: number;  // h2
    subheading_size?: number;   // h3
    body_size?: number;         // body
    text_align?: 'left' | 'center' | 'right';
    y_offset?: number;
}

export interface CarouselData {
    theme: Theme;
    slides: Slide[];
}
