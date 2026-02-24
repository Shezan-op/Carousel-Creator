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
    backgroundImage: string | null;
    activeTemplate: string;
    previewScale: number;
    onDeleteSlide?: (index: number) => void;
    onMoveSlide?: (index: number, direction: 'up' | 'down') => void;
}

const renderHighlightedText = (text: string, templateType: string, accentColor: string) => {
    if (!text) return null;
    const parts = text.split(/(\*[^*]+\*)/g);

    return parts.map((part, i) => {
        if (part.startsWith('*') && part.endsWith('*')) {
            const cleanText = part.slice(1, -1);

            if (templateType === 'brutalist') {
                return <span key={i} style={{ backgroundColor: accentColor, color: '#000', padding: '0 16px', display: 'inline-block', transform: 'translateY(-4px)' }}>{cleanText}</span>;
            }
            if (templateType === 'tweet') {
                return <span key={i} style={{ color: accentColor }}>{cleanText}</span>;
            }
            // Default Minimal Layout
            return <span key={i} style={{ color: accentColor, fontWeight: '900' }}>{cleanText}</span>;
        }
        return <span key={i}>{part}</span>;
    });
};

const CarouselPreview: React.FC<Props> = ({
    data, authorName, authorHandle, authorAvatar, fontFamily, backgroundImage,
    activeTemplate, onDeleteSlide, onMoveSlide, previewScale
}) => {
    const [scale, setScale] = React.useState(0.35);

    React.useEffect(() => {
        const updateScale = () => {
            const screenWidth = window.innerWidth;
            if (screenWidth < 768) {
                // Mobile: Scale to fit screen width minus padding
                setScale((screenWidth - 40) / 1080);
            } else {
                // Desktop: Use the user-defined previewScale
                setScale(previewScale);
            }
        };
        updateScale();
        window.addEventListener('resize', updateScale);
        return () => window.removeEventListener('resize', updateScale);
    }, [previewScale]);

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

        link.href = `https://fonts.googleapis.com/css2?family=${formattedName}:wght@400;600;800;900&display=swap`;
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
                <div key={index} className="flex justify-center w-full shrink-0 group relative">
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

                    {/* THE SCALE WRAPPER: Visual-only. Handles scaling + decorative rounding/shadow. NEVER captured by export. */}
                    <div
                        className="slide-wrapper rounded-[40px] shadow-[0_64px_128px_-24px_rgba(0,0,0,0.8)] overflow-hidden"
                        style={{
                            transform: `scale(${scale})`,
                            transformOrigin: 'top center',
                            height: `${1350 * scale}px`
                        }}
                    >
                        {/* THE RIGID CANVAS: Always 1080x1350, sharp corners, flat rectangle. This is the ONLY node captured by html-to-image. */}
                        <div
                            className="slide-export-node"
                            style={{
                                width: '1080px',
                                height: '1350px',
                                backgroundColor: data.theme.background,
                                color: data.theme.text,
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                padding: '120px',
                                boxSizing: 'border-box',
                                overflow: 'hidden',
                                fontFamily: fontFamily,
                                backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                            }}
                        >
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

                            {/* BACKGROUND OVERLAY FOR READABILITY */}
                            {backgroundImage && (
                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.8))', zIndex: 1 }} />
                            )}

                            {/* CINEMATIC SVG NOISE */}
                            <div style={{
                                position: 'absolute',
                                inset: 0,
                                opacity: 0.04,
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
                                    <div style={{
                                        marginBottom: '160px',
                                        textAlign: (slide.type === 'title' || slide.type === 'cta') ? 'center' : 'left',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: (slide.type === 'title' || slide.type === 'cta') ? 'center' : 'flex-start',
                                        position: 'relative',
                                        zIndex: 2
                                    }}>
                                        {slide.type === 'title' && (
                                            <>
                                                <h1 style={{ fontSize: '110px', fontWeight: '900', lineHeight: '1.1', margin: '0 0 40px 0', letterSpacing: '-2px' }}>
                                                    {renderHighlightedText(slide.headline || '', activeTemplate, accentColor)}
                                                </h1>
                                                {slide.subheadline && (
                                                    <h2 style={{ fontSize: '60px', fontWeight: '500', opacity: 0.8, margin: 0 }}>
                                                        {renderHighlightedText(slide.subheadline || '', activeTemplate, accentColor)}
                                                    </h2>
                                                )}
                                            </>
                                        )}

                                        {(slide.type === 'content' || slide.type === 'cta') && (
                                            <p style={{ fontSize: '75px', fontWeight: '700', lineHeight: '1.3', margin: 0, whiteSpace: 'pre-wrap' }}>
                                                {renderHighlightedText(slide.body || '', activeTemplate, accentColor)}
                                            </p>
                                        )}
                                    </div>

                                    {/* ABSOLUTE FOOTER */}
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '80px',
                                        left: '120px',
                                        right: '120px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        zIndex: 2
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
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
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                                            {slide.slide_number === 1 && (
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
                                    <div style={{
                                        marginBottom: '160px',
                                        textAlign: (slide.type === 'title' || slide.type === 'cta') ? 'center' : 'left',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: (slide.type === 'title' || slide.type === 'cta') ? 'center' : 'flex-start',
                                        position: 'relative',
                                        zIndex: 2
                                    }}>
                                        {slide.type === 'title' && (
                                            <>
                                                <h1 style={{ fontSize: '100px', fontWeight: '900', lineHeight: '1.15', margin: '0 0 40px 0', letterSpacing: '-1px' }}>
                                                    {renderHighlightedText(slide.headline || '', activeTemplate, accentColor)}
                                                </h1>
                                                {slide.subheadline && (
                                                    <h2 style={{ fontSize: '55px', fontWeight: '500', opacity: 0.8, margin: 0 }}>
                                                        {renderHighlightedText(slide.subheadline || '', activeTemplate, accentColor)}
                                                    </h2>
                                                )}
                                            </>
                                        )}

                                        {(slide.type === 'content' || slide.type === 'cta') && (
                                            <p style={{ fontSize: '70px', fontWeight: '700', lineHeight: '1.35', margin: 0, whiteSpace: 'pre-wrap' }}>
                                                {renderHighlightedText(slide.body || '', activeTemplate, accentColor)}
                                            </p>
                                        )}
                                    </div>

                                    {/* ABSOLUTE FOOTER */}
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '80px',
                                        left: '120px',
                                        right: '120px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        zIndex: 2
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
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
                                    zIndex: 2,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '40px'
                                }}>
                                    {/* Tweet Header */}
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

                                    {/* Tweet Body */}
                                    <div style={{ fontSize: '65px', fontWeight: '500', lineHeight: '1.4', textAlign: 'left' }}>
                                        {renderHighlightedText(slide.headline || slide.body || slide.subheadline || '', activeTemplate, accentColor)}
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
                                    <div style={{
                                        zIndex: 2,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '40px',
                                        width: '100%'
                                    }}>
                                        {slide.type === 'title' && (
                                            <h1 style={{
                                                fontSize: '120px',
                                                fontWeight: '900',
                                                lineHeight: '0.95',
                                                textTransform: 'uppercase',
                                                margin: 0,
                                                textAlign: 'left'
                                            }}>
                                                {renderHighlightedText(slide.headline || '', activeTemplate, accentColor)}
                                            </h1>
                                        )}

                                        {(slide.type === 'content' || slide.type === 'cta') && (
                                            <p style={{
                                                fontSize: '80px',
                                                fontWeight: '900',
                                                lineHeight: '0.95',
                                                textTransform: 'uppercase',
                                                margin: 0,
                                                textAlign: 'left'
                                            }}>
                                                {renderHighlightedText(slide.body || '', activeTemplate, accentColor)}
                                            </p>
                                        )}
                                    </div>

                                    {/* BRUTALIST FOOTER */}
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '80px',
                                        left: '120px',
                                        right: '120px',
                                        borderTop: `8px solid ${accentColor}`,
                                        paddingTop: '20px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        zIndex: 2,
                                        fontWeight: '900',
                                        fontSize: '35px',
                                        textTransform: 'uppercase'
                                    }}>
                                        <span>{authorHandle}</span>
                                        <span>SLIDE {slide.slide_number} / {data.slides.length}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            );
        });
    }, [
        data, accentColor, activeTemplate,
        authorName, authorHandle, authorAvatar,
        backgroundImage, fontFamily, scale,
        onDeleteSlide, onMoveSlide
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
        <div className="w-full h-full flex flex-col items-center overflow-y-auto custom-scrollbar">
            <div className="w-full max-w-[450px] mb-6 sticky top-0 z-20 pt-4 bg-zinc-900/80 backdrop-blur-md pb-4 px-4 border-b border-white/5">
                <ExportControls data={data} />
            </div>

            <div className="preview-scale-wrapper flex flex-col gap-8 md:gap-12 items-center w-full px-4 pb-20 no-scrollbar">
                {slideElements}
            </div>
        </div>
    );
};

export default CarouselPreview;
