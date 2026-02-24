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
    body?: string;
}

export interface CarouselData {
    theme: Theme;
    slides: Slide[];
}
