import React, { useEffect, useMemo } from 'react';
import { Loader2, ArrowRight, Heart, MessageCircle, Repeat2, Check, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import type { CarouselData } from '../types';
import ExportControls from './ExportControls';

interface Props {
    data: CarouselData | null;
    authorName: string;
    authorHandle: string;
    authorAvatar: string | null;
    fontFamily: string;
    activeTemplate: string;
    setActiveTemplate: (template: string) => void;
    previewScale: number;
    showProfile: boolean;
    footerLayout: string;
    onDeleteSlide?: (index: number) => void;
    onMoveSlide?: (index: number, direction: 'up' | 'down') => void;
    // Design & Typography Engine
    headingSize: number;
    subheadingSize: number;
    sectionSize: number;
    bodySize: number;
    textAlign: string;
    textYOffset: number;
    noiseOpacity: number;
    customBgImage: string | null;
    setActivePreviewSlideIndex: (index: number) => void;
    activePreviewSlideIndex: number;
}

const renderHighlightedText = (text: string, templateType: string, accentColor: string) => {
    if (!text) return null;

    // SEC: Defense-in-depth — cap input length to prevent ReDoS or DOM explosion
    const safeText = text.length > 10_000 ? text.slice(0, 10_000) : text;

    // Regex matches **bold**, _italic_, and *highlight*
    const parts = safeText.split(/(\*\*.*?\*\*|_.*?_|\*.*?\*)/g);

    return parts.map((part, i) => {
        // 1. Bold: **text**
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} style={{ fontWeight: '900' }}>{part.slice(2, -2)}</strong>;
        }
        // 2. Italic: _text_
        if (part.startsWith('_') && part.endsWith('_')) {
            return <em key={i} style={{ fontStyle: 'italic' }}>{part.slice(1, -1)}</em>;
        }
        // 3. The Highlight Engine: *text*
        if (part.startsWith('*') && part.endsWith('*')) {
            const cleanText = part.slice(1, -1);
            if (templateType === 'brutalist') {
                return <span key={i} style={{ backgroundColor: accentColor, color: '#000', padding: '0 16px', display: 'inline-block', transform: 'translateY(-4px)' }}>{cleanText}</span>;
            }
            if (templateType === 'tweet') {
                return <span key={i} style={{ color: accentColor }}>{cleanText}</span>;
            }
            // Default Minimal
            return <span key={i} style={{ color: accentColor, fontWeight: '900' }}>{cleanText}</span>;
        }
        // Standard text
        return <span key={i}>{part}</span>;
    });
};

const CarouselPreview: React.FC<Props> = ({
    data, authorName, authorHandle, authorAvatar, fontFamily,
    activeTemplate, setActiveTemplate, onDeleteSlide, onMoveSlide, previewScale, showProfile, footerLayout,
    headingSize, subheadingSize, sectionSize, bodySize, textAlign, textYOffset, noiseOpacity, customBgImage,
    activePreviewSlideIndex, setActivePreviewSlideIndex
}) => {
    const [isMobile, setIsMobile] = React.useState(window.innerWidth < 1024);

    React.useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Mobile forces scale to fit screen width (minus padding). Desktop uses the zoom slider.
    const effectiveScale = isMobile ? (window.innerWidth - 64) / 1080 : previewScale;

    useEffect(() => {
        if (!fontFamily) return;
        const formattedName = fontFamily.replace(/\s+/g, '+');
        const linkId = 'google-font-injection';
        let link = document.getElementById(linkId) as HTMLLinkElement;

        if (!link) {
            link = document.createElement('link');
            link.id = linkId;
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        }

        link.href = `https://fonts.googleapis.com/css2?family=${formattedName}:ital,wght@0,400;0,600;0,700;0,800;0,900;1,400;1,600;1,700;1,800;1,900&display=swap`;
    }, [fontFamily]);

    // RULES OF HOOKS: useMemo must be called unconditionally, before any early returns.
    const accentColor = data?.theme.accent || '#3B82F6';

    // PERF: The entire slide DOM tree is memoized. It only recomputes when slide content,
    // theme, author branding, template, or callbacks change — NOT on raw text keystrokes.
    const slideElements = useMemo(() => {
        if (!data) return null;
        return data.slides.map((slide, index) => {
            // Stable engagement numbers for the tweet template
            const likes = 200 + (index * 13) % 500;
            const retweets = 20 + (index * 7) % 50;
            const comments = 50 + (index * 3) % 100;

            return (
                /* THE SCALER WRAPPER: Physically resizes the DOM block so Flexbox and Scrollbars work */
                <div
                    key={index}
                    style={{
                        width: `${1080 * effectiveScale}px`,
                        height: `${1350 * effectiveScale}px`,
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                    className={`shrink-0 shadow-2xl shadow-black/50 rounded-2xl bg-zinc-900 group cursor-pointer transition-all duration-300 ${activePreviewSlideIndex === index ? 'ring-4 ring-blue-500 ring-offset-4 ring-offset-zinc-950 scale-[1.02]' : 'hover:scale-[1.01]'}`}
                    onClick={() => setActivePreviewSlideIndex(index)}
                >
                    {/* SLIDE CONTROLS (Hover only) */}
                    <div className="absolute -left-12 top-0 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-30">
                        <button
                            onClick={() => onMoveSlide?.(index, 'up')}
                            className="p-2 bg-zinc-900 border border-white/10 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
                            title="Move Up"
                        >
                            <ChevronUp size={16} />
                        </button>
                        <button
                            onClick={() => onMoveSlide?.(index, 'down')}
                            className="p-2 bg-zinc-900 border border-white/10 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
                            title="Move Down"
                        >
                            <ChevronDown size={16} />
                        </button>
                        <button
                            onClick={() => onDeleteSlide?.(index)}
                            className="p-2 bg-zinc-900 border border-red-500/20 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all mt-4"
                            title="Delete Slide"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>

                    /* THE RIGID CANVAS: Always 1080x1350, absolutely positioned to prevent DOM flow warp */
                    <div
                        className="slide-export-node"
                        style={{
                            width: '1080px',
                            height: '1350px',
                            transform: `scale(${effectiveScale})`,
                            transformOrigin: 'top left',
                            backgroundColor: data.theme.background,
                            color: data.theme.text,
                            fontFamily: fontFamily || 'Inter',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            /* THE SAFE ZONE MATH: 1080 - 864 = 216 / 2 = 108px padding */
                            padding: '108px',
                            boxSizing: 'border-box',
                            overflow: 'hidden',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}
                    >
                        {/* LAYER 0: CUSTOM BACKGROUND TEMPLATE */}
                        {customBgImage && (
                            <div style={{
                                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0,
                                backgroundImage: `url(${customBgImage})`, backgroundSize: 'cover', backgroundPosition: 'center'
                            }} />
                        )}
                        {/* THE MINIMALIST PROGRESS BAR */}
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            height: '8px',
                            backgroundColor: accentColor,
                            width: `${(slide.slide_number / data.slides.length) * 100}%`,
                            zIndex: 10
                        }} />



                        {/* LAYER 1: THE NOISE OVERLAY */}
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            opacity: noiseOpacity / 100,
                            mixBlendMode: 'overlay',
                            pointerEvents: 'none',
                            backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")',
                            zIndex: 1
                        }} />

                        {/* ═══════════════════════════════════════════════ */}
                        {/* TEMPLATE: MINIMAL (Default)                    */}
                        {/* ═══════════════════════════════════════════════ */}
                        {activeTemplate === 'minimal' && (
                            <>
                                {/* LAYER 2: TEXT CONTENT WRAPPER */}
                                <div style={{
                                    position: 'relative',
                                    zIndex: 10,
                                    width: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transform: `translateY(${slide.y_offset ?? textYOffset}px)`,
                                    textAlign: (slide.text_align || textAlign) as React.CSSProperties['textAlign'],
                                    alignItems: (slide.text_align || textAlign) === 'center' ? 'center' : (slide.text_align || textAlign) === 'right' ? 'flex-end' : 'flex-start',
                                    marginBottom: '160px'
                                }}>
                                    {/* 1. THE HEADLINE LAYER */}
                                    {slide.headline && (
                                        <h1 style={{
                                            fontSize: `${slide.heading_size || headingSize}px`,
                                            fontWeight: '900',
                                            lineHeight: '1.1',
                                            marginBottom: '20px',
                                            color: 'inherit'
                                        }}>
                                            {renderHighlightedText(slide.headline, activeTemplate, data.theme.accent)}
                                        </h1>
                                    )}

                                    {/* 2. THE SUBHEADLINE LAYER */}
                                    {slide.subheadline && (
                                        <h2 style={{
                                            fontSize: `${slide.subheadline_size || subheadingSize}px`,
                                            fontWeight: '600',
                                            opacity: 0.8,
                                            marginBottom: '40px',
                                            lineHeight: '1.2'
                                        }}>
                                            {renderHighlightedText(slide.subheadline, activeTemplate, data.theme.accent)}
                                        </h2>
                                    )}

                                    {/* 3. THE SECTION HEADER LAYER (/h3/ in Bulk) */}
                                    {slide.subheading && (
                                        <h3 style={{
                                            fontSize: `${slide.subheading_size || sectionSize}px`,
                                            fontWeight: '800',
                                            marginBottom: '15px',
                                            lineHeight: '1.2',
                                            color: data.theme.accent
                                        }}>
                                            {renderHighlightedText(slide.subheading, activeTemplate, data.theme.accent)}
                                        </h3>
                                    )}

                                    {/* 4. THE BODY LAYER */}
                                    {slide.body && (
                                        <p style={{
                                            fontSize: `${slide.body_size || bodySize}px`,
                                            fontWeight: '500',
                                            lineHeight: '1.4',
                                            whiteSpace: 'pre-wrap'
                                        }}>
                                            {renderHighlightedText(slide.body, activeTemplate, data.theme.accent)}
                                        </p>
                                    )}
                                </div>

                                {/* ABSOLUTE FOOTER */}
                                <div style={{
                                    position: 'absolute',
                                    bottom: '80px',
                                    left: '108px',
                                    right: '108px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    zIndex: 10
                                }}>
                                    {/* Left spacer for centering balance */}
                                    {footerLayout === 'center' && <div style={{ width: '80px' }}></div>}

                                    {/* Creator Profile */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '24px',
                                        flex: footerLayout === 'center' ? 'none' : '1',
                                        justifyContent: footerLayout === 'right' ? 'flex-end' : footerLayout === 'center' ? 'center' : 'flex-start',
                                        marginRight: footerLayout === 'right' ? '40px' : '0'
                                    }}>
                                        {showProfile && (
                                            <>
                                                {authorAvatar ? (
                                                    <img src={authorAvatar} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)' }}></div>
                                                )}
                                                <span style={{ fontSize: '40px', fontWeight: '600', opacity: 0.9 }}>{authorHandle || '@creator'}</span>
                                            </>
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '30px', order: footerLayout === 'right' ? -1 : 1 }}>
                                        {slide.slide_number === 1 && footerLayout !== 'right' && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', opacity: 0.6, fontWeight: 'bold' }}>
                                                <span style={{ fontSize: '35px' }}>SWIPE</span>
                                                <ArrowRight size={40} strokeWidth={3} />
                                            </div>
                                        )}
                                        <div style={{
                                            width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)',
                                            display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '35px', fontWeight: 'bold',
                                            border: '1px solid rgba(255,255,255,0.1)'
                                        }}>
                                            {slide.slide_number}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* ═══════════════════════════════════════════════ */}
                        {/* TEMPLATE: HIGHLIGHT (Marker-style underline)   */}
                        {/* ═══════════════════════════════════════════════ */}
                        {activeTemplate === 'highlight' && (
                            <>
                                {/* LAYER 2: TEXT CONTENT WRAPPER */}
                                <div style={{
                                    position: 'relative',
                                    zIndex: 10,
                                    width: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transform: `translateY(${slide.y_offset ?? textYOffset}px)`,
                                    textAlign: (slide.text_align || textAlign) as React.CSSProperties['textAlign'],
                                    alignItems: (slide.text_align || textAlign) === 'center' ? 'center' : (slide.text_align || textAlign) === 'right' ? 'flex-end' : 'flex-start',
                                    marginBottom: '160px'
                                }}>
                                    {/* 1. THE HEADLINE LAYER */}
                                    {slide.headline && (
                                        <h1 style={{
                                            fontSize: `${slide.heading_size || headingSize}px`,
                                            fontWeight: '900',
                                            lineHeight: '1.15',
                                            marginBottom: '20px',
                                            letterSpacing: '-1px',
                                            color: 'inherit'
                                        }}>
                                            {renderHighlightedText(slide.headline, activeTemplate, data.theme.accent)}
                                        </h1>
                                    )}

                                    {/* 2. THE SUBHEADLINE LAYER */}
                                    {slide.subheadline && (
                                        <h2 style={{
                                            fontSize: `${slide.subheadline_size || subheadingSize}px`,
                                            fontWeight: '600',
                                            opacity: 0.8,
                                            marginBottom: '40px',
                                            lineHeight: '1.2'
                                        }}>
                                            {renderHighlightedText(slide.subheadline, activeTemplate, data.theme.accent)}
                                        </h2>
                                    )}

                                    {/* 3. THE SECTION HEADER LAYER */}
                                    {slide.subheading && (
                                        <h3 style={{
                                            fontSize: `${slide.subheading_size || sectionSize}px`,
                                            fontWeight: '800',
                                            marginBottom: '15px',
                                            lineHeight: '1.2',
                                            color: data.theme.accent
                                        }}>
                                            {renderHighlightedText(slide.subheading, activeTemplate, data.theme.accent)}
                                        </h3>
                                    )}

                                    {/* 4. THE BODY LAYER */}
                                    {slide.body && (
                                        <p style={{
                                            fontSize: `${slide.body_size || bodySize}px`,
                                            fontWeight: '500',
                                            lineHeight: '1.35',
                                            whiteSpace: 'pre-wrap'
                                        }}>
                                            {renderHighlightedText(slide.body, activeTemplate, data.theme.accent)}
                                        </p>
                                    )}
                                </div>

                                {/* ABSOLUTE FOOTER */}
                                <div style={{
                                    position: 'absolute',
                                    bottom: '80px',
                                    left: '108px',
                                    right: '108px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    zIndex: 10
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                                        {showProfile && (
                                            <>
                                                <div style={{
                                                    width: '80px',
                                                    height: '80px',
                                                    borderRadius: '50%',
                                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                                    overflow: 'hidden',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    border: '1px solid rgba(255,255,255,0.1)'
                                                }}>
                                                    {authorAvatar ? <img src={authorAvatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{ fontSize: '32px', fontWeight: '800' }}>{authorName}</span>
                                                    <span style={{ fontSize: '28px', fontWeight: '600', opacity: 0.6 }}>{authorHandle}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <div style={{
                                        width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)',
                                        display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '35px', fontWeight: 'bold',
                                        border: '1px solid rgba(255,255,255,0.1)'
                                    }}>
                                        {slide.slide_number}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* ═══════════════════════════════════════════════ */}
                        {/* TEMPLATE: FAUX TWEET (Justin Welsh Style)      */}
                        {/* ═══════════════════════════════════════════════ */}
                        {activeTemplate === 'tweet' && (
                            <div style={{
                                border: '2px solid rgba(255,255,255,0.1)',
                                background: 'rgba(255,255,255,0.05)',
                                borderRadius: '30px',
                                padding: '60px',
                                width: '90%',
                                alignSelf: 'center',
                                zIndex: 10,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '40px',
                                transform: `translateY(${slide.y_offset ?? textYOffset}px)`,
                                textAlign: (slide.text_align || textAlign) as React.CSSProperties['textAlign']
                            }}>
                                {/* Tweet Header */}
                                {showProfile && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                                        <div style={{
                                            width: '100px',
                                            height: '100px',
                                            borderRadius: '50%',
                                            overflow: 'hidden',
                                            border: '2px solid rgba(255,255,255,0.1)',
                                            flexShrink: 0,
                                            backgroundColor: 'rgba(255,255,255,0.1)'
                                        }}>
                                            {authorAvatar && <img src={authorAvatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <span style={{ fontSize: '50px', fontWeight: '800' }}>{authorName}</span>
                                                <div style={{
                                                    backgroundColor: '#1D9BF0',
                                                    borderRadius: '50%',
                                                    width: '36px',
                                                    height: '36px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    flexShrink: 0
                                                }}>
                                                    <Check size={22} color="#fff" strokeWidth={4} />
                                                </div>
                                            </div>
                                            <span style={{ fontSize: '40px', opacity: 0.6 }}>{authorHandle}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Tweet Body */}
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '12px',
                                    textAlign: (slide.text_align || textAlign) as React.CSSProperties['textAlign']
                                }}>
                                    {slide.headline && (
                                        <div style={{ fontSize: `${slide.heading_size || headingSize}px`, fontWeight: '800', lineHeight: '1.2' }}>
                                            {renderHighlightedText(slide.headline, activeTemplate, data.theme.accent)}
                                        </div>
                                    )}
                                    {slide.subheadline && (
                                        <div style={{ fontSize: `${slide.subheadline_size || subheadingSize}px`, fontWeight: '600', opacity: 0.8 }}>
                                            {renderHighlightedText(slide.subheadline, activeTemplate, data.theme.accent)}
                                        </div>
                                    )}
                                    {slide.subheading && (
                                        <div style={{ fontSize: `${slide.subheading_size || sectionSize}px`, fontWeight: '700', color: data.theme.accent, marginBottom: '4px' }}>
                                            {renderHighlightedText(slide.subheading, activeTemplate, data.theme.accent)}
                                        </div>
                                    )}
                                    {slide.body && (
                                        <div style={{ fontSize: `${slide.body_size || bodySize}px`, fontWeight: '400', lineHeight: '1.4', whiteSpace: 'pre-wrap' }}>
                                            {renderHighlightedText(slide.body, activeTemplate, data.theme.accent)}
                                        </div>
                                    )}
                                </div>

                                {/* Tweet Metrics Footer */}
                                <div style={{ display: 'flex', gap: '80px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '40px', opacity: 0.6 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <MessageCircle size={40} />
                                        <span style={{ fontSize: '30px' }}>{comments}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <Repeat2 size={40} />
                                        <span style={{ fontSize: '30px' }}>{retweets}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <Heart size={40} />
                                        <span style={{ fontSize: '30px' }}>{likes >= 1000 ? `${(likes / 1000).toFixed(1)}k` : likes}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ═══════════════════════════════════════════════ */}
                        {/* TEMPLATE: BRUTALIST (Magazine Style)            */}
                        {/* ═══════════════════════════════════════════════ */}
                        {activeTemplate === 'brutalist' && (
                            <>
                                {/* LAYER 2: TEXT CONTENT WRAPPER */}
                                <div style={{
                                    position: 'relative',
                                    zIndex: 10,
                                    width: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transform: `translateY(${slide.y_offset ?? textYOffset}px)`,
                                    textAlign: (slide.text_align || textAlign) as React.CSSProperties['textAlign'],
                                    alignItems: (slide.text_align || textAlign) === 'center' ? 'center' : (slide.text_align || textAlign) === 'right' ? 'flex-end' : 'flex-start'
                                }}>
                                    {/* 1. THE HEADLINE LAYER */}
                                    {slide.headline && (
                                        <h1 style={{
                                            fontSize: `${slide.heading_size || headingSize}px`,
                                            fontWeight: '900',
                                            lineHeight: '0.95',
                                            textTransform: 'uppercase',
                                            marginBottom: '20px',
                                            color: 'inherit'
                                        }}>
                                            {renderHighlightedText(slide.headline, activeTemplate, data.theme.accent)}
                                        </h1>
                                    )}

                                    {/* 2. THE SUBHEADLINE LAYER */}
                                    {slide.subheadline && (
                                        <h2 style={{
                                            fontSize: `${slide.subheadline_size || subheadingSize}px`,
                                            fontWeight: '600',
                                            opacity: 0.8,
                                            marginBottom: '40px',
                                            lineHeight: '1.2'
                                        }}>
                                            {renderHighlightedText(slide.subheadline, activeTemplate, data.theme.accent)}
                                        </h2>
                                    )}

                                    {/* 3. THE SECTION HEADER LAYER */}
                                    {slide.subheading && (
                                        <h3 style={{
                                            fontSize: `${slide.subheading_size || sectionSize}px`,
                                            fontWeight: '900',
                                            marginBottom: '15px',
                                            lineHeight: '1',
                                            textTransform: 'uppercase',
                                            color: data.theme.accent
                                        }}>
                                            {renderHighlightedText(slide.subheading, activeTemplate, data.theme.accent)}
                                        </h3>
                                    )}

                                    {/* 4. THE BODY LAYER */}
                                    {slide.body && (
                                        <p style={{
                                            fontSize: `${slide.body_size || bodySize}px`,
                                            fontWeight: '900',
                                            lineHeight: '0.95',
                                            textTransform: 'uppercase',
                                            whiteSpace: 'pre-wrap'
                                        }}>
                                            {renderHighlightedText(slide.body, activeTemplate, data.theme.accent)}
                                        </p>
                                    )}
                                </div>

                                {/* BRUTALIST FOOTER */}
                                <div style={{
                                    position: 'absolute',
                                    bottom: '80px',
                                    left: '108px',
                                    right: '108px',
                                    borderTop: `8px solid ${accentColor}`,
                                    paddingTop: '20px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    zIndex: 10,
                                    fontWeight: '900',
                                    fontSize: '35px',
                                    textTransform: 'uppercase'
                                }}>
                                    <span>{showProfile ? authorHandle : ''}</span>
                                    <span>SLIDE {slide.slide_number} / {data.slides.length}</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            );
        });
    }, [
        data, accentColor, activeTemplate,
        authorName, authorHandle, authorAvatar, showProfile, footerLayout,
        fontFamily, effectiveScale,
        onDeleteSlide, onMoveSlide,
        headingSize, subheadingSize, sectionSize, bodySize, textAlign, textYOffset, noiseOpacity, customBgImage,
        activePreviewSlideIndex, setActivePreviewSlideIndex
    ]);

    if (!data) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-6">
                <div className="relative">
                    <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full" />
                    <div className="relative w-24 h-24 border border-white/10 bg-zinc-900/50 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                        <Loader2 className="w-10 h-10 text-zinc-400 animate-[spin_3s_linear_infinite]" />
                    </div>
                </div>
                <div className="text-center space-y-2">
                    <p className="text-xl font-medium text-zinc-200">Waiting for content</p>
                    <p className="text-sm text-zinc-500 max-w-[240px]">Paste your JSON or use the AI generator to start creating your carousel</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col items-center bg-zinc-900/50">
            <div className="w-full max-w-[450px] mb-6 sticky top-0 z-20 pt-4 bg-zinc-900/80 backdrop-blur-md pb-4 px-4 border-b border-white/5">
                {data && (
                    <ExportControls
                        data={data}
                        activeTemplate={activeTemplate}
                        setActiveTemplate={setActiveTemplate}
                    />
                )}
            </div>

            <div className="w-full h-full overflow-auto flex items-start justify-center p-8 custom-scrollbar">
                <div className="flex flex-col gap-12 pb-24">
                    {slideElements}
                </div>
            </div>
        </div>
    );
};

export default CarouselPreview;
