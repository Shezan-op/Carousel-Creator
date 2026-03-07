import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Loader2, ArrowRight, Heart, MessageCircle, Repeat2, Check } from 'lucide-react';
import type { CarouselData } from '../types';
import ExportControls from './ExportControls';
import { renderHighlightedText } from '../utils';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Props {
    data: CarouselData | null;
    authorName: string;
    authorHandle: string;
    authorAvatar: string | null;
    headingFont: string;
    subheadingFont: string;
    bodyFont: string;
    activeTemplate: string;
    setActiveTemplate: (template: string) => void;
    previewScale: number;
    showProfile: boolean;
    footerLayout: string;
    // onDeleteSlide and onMoveSlide are managed via dnd reordering now
    // Retained global states
    textAlign: string;
    noiseOpacity: number;
    customBgImage: string | null;
    setActivePreviewSlideIndex: (index: number) => void;
    isUnlocked: boolean;
    hasGivenFeedback: boolean;
    setFocusedSlideIndex: (index: number | null) => void;
    showSafeZones: boolean;
    showSlideNumbers: boolean;
    inlineImages: Record<string, string>;
    previewMode: 'stack' | 'carousel' | 'grid';
    setPreviewMode: (mode: 'stack' | 'carousel' | 'grid') => void;
    bulkText: string;
    setBulkText: (text: string) => void;
}

interface SortableSlideProps {
    id: string;
    effectiveScale: number;
    previewMode: 'stack' | 'carousel' | 'grid';
    children: React.ReactNode;
}

const SortableSlide: React.FC<SortableSlideProps> = ({ id, effectiveScale, previewMode, children }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: id.toString() });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 1,
        opacity: isDragging ? 0.8 : 1,
        width: `${1080 * effectiveScale}px`,
        height: `${1350 * effectiveScale}px`,
        position: 'relative' as const,
        overflow: 'hidden',
        cursor: previewMode === 'grid' ? 'grab' : 'default',
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...(previewMode === 'grid' ? attributes : {})}
            {...(previewMode === 'grid' ? listeners : {})}
            className={`shrink-0 shadow-2xl shadow-black/50 rounded-2xl bg-zinc-900 ${previewMode === 'carousel' ? 'snap-center mx-4' : ''}`}
        >
            {children}

            {/* Drag Overlay Indicator */}
            {previewMode === 'grid' && (
                <div className="absolute inset-0 z-50 hover:bg-white/5 transition-colors flex items-start justify-end p-4 pointer-events-none">
                    <div className="bg-black/50 backdrop-blur text-white text-[10px] px-2 py-1 rounded border border-white/10">
                        DRAG TO MOVE
                    </div>
                </div>
            )}
        </div>
    );
};


const CarouselPreview: React.FC<Props> = ({
    data, authorName, authorHandle, authorAvatar, headingFont, subheadingFont, bodyFont,
    activeTemplate, setActiveTemplate, previewScale, showProfile, footerLayout,
    textAlign, noiseOpacity, customBgImage,
    setActivePreviewSlideIndex,
    isUnlocked, hasGivenFeedback, setFocusedSlideIndex,
    showSafeZones, showSlideNumbers,
    inlineImages, previewMode, setPreviewMode,
    bulkText, setBulkText
}) => {
    const [isMobile, setIsMobile] = React.useState(window.innerWidth < 1024);
    const [overflowingSlides, setOverflowingSlides] = useState<number[]>([]);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleShiftSlide = useCallback((currentIndex: number, direction: 'left' | 'right') => {
        const rawSlides = bulkText.split(/\n\s*\n/).filter((s: string) => s.trim());
        const targetIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;

        if (targetIndex >= 0 && targetIndex < rawSlides.length) {
            const reorderedSlides = [...rawSlides];
            const temp = reorderedSlides[currentIndex];
            reorderedSlides[currentIndex] = reorderedSlides[targetIndex];
            reorderedSlides[targetIndex] = temp;
            setBulkText(reorderedSlides.join('\n\n'));
        }
    }, [bulkText, setBulkText]);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = parseInt(active.id as string);
        const newIndex = parseInt(over.id as string);

        // Reorder the physical text blocks
        const rawSlides = bulkText.split(/\n\s*\n/).filter((s: string) => s.trim());

        if (oldIndex >= 0 && oldIndex < rawSlides.length && newIndex >= 0 && newIndex < rawSlides.length) {
            const reorderedSlides = arrayMove(rawSlides, oldIndex, newIndex);
            setBulkText(reorderedSlides.join('\n\n'));
        }
    };

    useEffect(() => {
        // Wait for fonts and DOM to settle
        const timer = setTimeout(() => {
            const nodes = document.querySelectorAll('.content-measurement-node');
            const overflowing: number[] = [];

            nodes.forEach((node, index) => {
                // 1134px is our strict Safe Zone max height (1350 - 216 padding)
                if (node.scrollHeight > 1134) {
                    overflowing.push(index);
                }
            });

            setOverflowingSlides(overflowing);
        }, 300); // 300ms debounce

        return () => clearTimeout(timer);
    }, [data, activeTemplate]); // Trigger on data or template changes

    React.useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Mobile forces scale to fit screen width (minus padding). Desktop uses the zoom slider.
    const effectiveScale = isMobile ? (window.innerWidth - 64) / 1080 : previewScale;

    useEffect(() => {
        const uniqueFonts = Array.from(new Set([headingFont, subheadingFont, bodyFont])).filter(Boolean);
        if (uniqueFonts.length === 0) return;

        const fontFamilies = uniqueFonts.map(font =>
            `family=${font.replace(/\s+/g, '+')}:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600;1,700;1,800;1,900`
        ).join('&');

        const fontUrl = `https://fonts.googleapis.com/css2?${fontFamilies}&display=swap`;
        const linkId = 'google-font-injection';
        let link = document.getElementById(linkId) as HTMLLinkElement;

        if (!link) {
            link = document.createElement('link');
            link.id = linkId;
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        }

        if (link.href !== fontUrl) {
            link.href = fontUrl;
        }
    }, [headingFont, subheadingFont, bodyFont]);

    // RULES OF HOOKS: useMemo must be called unconditionally, before any early returns.
    const accentColor = data?.theme.accent || '#3B82F6';

    // PERF: The entire slide DOM tree is memoized. It only recomputes when slide content,
    // theme, author branding, template, or callbacks change — NOT on raw text keystrokes.
    const slideElements = useMemo(() => {
        if (!data) return null;
        return data.slides.map((slide, index) => {
            const renderScale = previewMode === 'grid' ? 0.15 : effectiveScale;
            // Stable engagement numbers for the tweet template
            const likes = 200 + (index * 13) % 500;
            const retweets = 20 + (index * 7) % 50;
            const comments = 50 + (index * 3) % 100;

            return (
                <SortableSlide
                    key={index}
                    id={index.toString()}
                    effectiveScale={renderScale}
                    previewMode={previewMode}
                >
                    /* THE RIGID CANVAS: Always 1080x1350, absolutely positioned to prevent DOM flow warp */
                    <div
                        className="slide-export-node"
                        onClick={() => {
                            setActivePreviewSlideIndex(index);
                            setFocusedSlideIndex(index);
                        }}
                        style={{
                            width: '1080px',
                            height: '1350px',
                            transform: `scale(${renderScale})`,
                            transformOrigin: 'top left',
                            backgroundColor: data.theme.background,
                            color: data.theme.text,
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
                            backgroundPosition: 'center',
                            cursor: 'pointer'
                        }}
                    >
                        {/* LAYER 0: CUSTOM BACKGROUND TEMPLATE */}
                        {slide.bg_image && inlineImages[slide.bg_image] ? (
                            <div style={{
                                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0,
                                backgroundImage: `url(${inlineImages[slide.bg_image]})`, backgroundSize: 'cover', backgroundPosition: 'center'
                            }} />
                        ) : customBgImage && (
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
                                <div className="content-measurement-node" style={{
                                    position: 'relative',
                                    zIndex: 10,
                                    width: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transform: `translateY(${slide.y_offset || 0}px)`,
                                    textAlign: (slide.text_align || textAlign) as React.CSSProperties['textAlign'],
                                    alignItems: (slide.text_align || textAlign) === 'center' ? 'center' : (slide.text_align || textAlign) === 'right' ? 'flex-end' : 'flex-start',
                                    marginBottom: '160px'
                                }}>
                                    {/* 1. THE HEADLINE LAYER */}
                                    {slide.headline && (
                                        <h1 style={{
                                            fontFamily: `"${headingFont}", sans-serif`,
                                            fontSize: `${slide.heading_size || 110}px`,
                                            fontWeight: '900',
                                            lineHeight: '1.1',
                                            marginBottom: '20px',
                                            color: 'inherit'
                                        }}>
                                            {renderHighlightedText(slide.headline, activeTemplate, data.theme.accent, inlineImages)}
                                        </h1>
                                    )}

                                    {/* SUBHEADLINE (Slide 1 Subtitle - maps to H2) */}
                                    {slide.subheadline && (
                                        <h2 style={{
                                            fontFamily: `"${subheadingFont}", sans-serif`,
                                            fontSize: `${slide.subheading_size || 45}px`,
                                            fontWeight: '600',
                                            opacity: 0.8,
                                            marginTop: '16px',
                                            lineHeight: '1.2'
                                        }}>
                                            {renderHighlightedText(slide.subheadline, activeTemplate, data.theme.accent, inlineImages)}
                                        </h2>
                                    )}

                                    {/* SUBHEADING (Body Slide Section Title - maps to H3) */}
                                    {slide.subheading && (
                                        <h3 style={{
                                            fontFamily: `"${subheadingFont}", sans-serif`,
                                            fontSize: `${slide.subheading_size || 45}px`,
                                            fontWeight: '700',
                                            marginTop: '24px',
                                            marginBottom: '12px',
                                            color: data.theme.accent
                                        }}>
                                            {renderHighlightedText(slide.subheading, activeTemplate, data.theme.accent, inlineImages)}
                                        </h3>
                                    )}

                                    {/* 4. THE BODY LAYER */}
                                    {slide.body && (
                                        <p style={{
                                            fontFamily: `"${bodyFont}", sans-serif`,
                                            fontSize: `${slide.body_size || 35}px`,
                                            fontWeight: '500',
                                            lineHeight: '1.4',
                                            whiteSpace: 'pre-wrap'
                                        }}>
                                            {renderHighlightedText(slide.body, activeTemplate, data.theme.accent, inlineImages)}
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
                                                <span style={{ fontFamily: `"${bodyFont}", sans-serif`, fontSize: '40px', fontWeight: '600', opacity: 0.9 }}>{authorHandle || '@creator'}</span>
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
                                <div className="content-measurement-node" style={{
                                    position: 'relative',
                                    zIndex: 10,
                                    width: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transform: `translateY(${slide.y_offset || 0}px)`,
                                    textAlign: (slide.text_align || textAlign) as React.CSSProperties['textAlign'],
                                    alignItems: (slide.text_align || textAlign) === 'center' ? 'center' : (slide.text_align || textAlign) === 'right' ? 'flex-end' : 'flex-start',
                                    marginBottom: '160px'
                                }}>
                                    {/* 1. THE HEADLINE LAYER */}
                                    {slide.headline && (
                                        <h1 style={{
                                            fontFamily: `"${headingFont}", sans-serif`,
                                            fontSize: `${slide.heading_size || 110}px`,
                                            fontWeight: '900',
                                            lineHeight: '1.15',
                                            marginBottom: '20px',
                                            letterSpacing: '-1px',
                                            color: 'inherit'
                                        }}>
                                            {renderHighlightedText(slide.headline, activeTemplate, data.theme.accent, inlineImages)}
                                        </h1>
                                    )}

                                    {/* SUBHEADLINE (Slide 1 Subtitle - maps to H2) */}
                                    {slide.subheadline && (
                                        <h2 style={{
                                            fontFamily: `"${subheadingFont}", sans-serif`,
                                            fontSize: `${slide.subheading_size || 45}px`,
                                            fontWeight: '600',
                                            opacity: 0.8,
                                            marginTop: '16px',
                                            lineHeight: '1.2'
                                        }}>
                                            {renderHighlightedText(slide.subheadline, activeTemplate, data.theme.accent, inlineImages)}
                                        </h2>
                                    )}

                                    {/* SUBHEADING (Body Slide Section Title - maps to H3) */}
                                    {slide.subheading && (
                                        <h3 style={{
                                            fontSize: `${slide.subheading_size || 45}px`,
                                            fontWeight: '700',
                                            marginTop: '24px',
                                            marginBottom: '12px',
                                            color: data.theme.accent
                                        }}>
                                            {renderHighlightedText(slide.subheading, activeTemplate, data.theme.accent, inlineImages)}
                                        </h3>
                                    )}

                                    {/* 4. THE BODY LAYER */}
                                    {slide.body && (
                                        <p style={{
                                            fontFamily: `"${bodyFont}", sans-serif`,
                                            fontSize: `${slide.body_size || 35}px`,
                                            fontWeight: '500',
                                            lineHeight: '1.35',
                                            whiteSpace: 'pre-wrap'
                                        }}>
                                            {renderHighlightedText(slide.body, activeTemplate, data.theme.accent, inlineImages)}
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
                                                <div style={{ display: 'flex', flexDirection: 'column', fontFamily: `"${bodyFont}", sans-serif` }}>
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
                            <div className="content-measurement-node" style={{
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
                                transform: `translateY(${slide.y_offset || 0}px)`,
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
                                        <div style={{ flex: 1, fontFamily: `"${bodyFont}", sans-serif` }}>
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
                                        <div style={{ fontFamily: `"${headingFont}", sans-serif`, fontSize: `${slide.heading_size || 110}px`, fontWeight: '800', lineHeight: '1.2' }}>
                                            {renderHighlightedText(slide.headline, activeTemplate, data.theme.accent, inlineImages)}
                                        </div>
                                    )}
                                    {slide.subheadline && (
                                        <div style={{ fontFamily: `"${subheadingFont}", sans-serif`, fontSize: `${slide.subheading_size || 45}px`, fontWeight: '600', opacity: 0.8 }}>
                                            {renderHighlightedText(slide.subheadline, activeTemplate, data.theme.accent, inlineImages)}
                                        </div>
                                    )}
                                    {slide.subheading && (
                                        <div style={{ fontFamily: `"${subheadingFont}", sans-serif`, fontSize: `${slide.subheading_size || 45}px`, fontWeight: '700', color: data.theme.accent, marginBottom: '4px' }}>
                                            {renderHighlightedText(slide.subheading, activeTemplate, data.theme.accent, inlineImages)}
                                        </div>
                                    )}
                                    {slide.body && (
                                        <div style={{ fontFamily: `"${bodyFont}", sans-serif`, fontSize: `${slide.body_size || 35}px`, fontWeight: '400', lineHeight: '1.4', whiteSpace: 'pre-wrap' }}>
                                            {renderHighlightedText(slide.body, activeTemplate, data.theme.accent, inlineImages)}
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
                                <div className="content-measurement-node" style={{
                                    position: 'relative',
                                    zIndex: 10,
                                    width: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transform: `translateY(${slide.y_offset || 0}px)`,
                                    textAlign: (slide.text_align || textAlign) as React.CSSProperties['textAlign'],
                                    alignItems: (slide.text_align || textAlign) === 'center' ? 'center' : (slide.text_align || textAlign) === 'right' ? 'flex-end' : 'flex-start'
                                }}>
                                    {/* 1. THE HEADLINE LAYER */}
                                    {slide.headline && (
                                        <h1 style={{
                                            fontFamily: `"${headingFont}", sans-serif`,
                                            fontSize: `${slide.heading_size || 110}px`,
                                            fontWeight: '900',
                                            lineHeight: '0.95',
                                            textTransform: 'uppercase',
                                            marginBottom: '20px',
                                            color: 'inherit'
                                        }}>
                                            {renderHighlightedText(slide.headline, activeTemplate, data.theme.accent, inlineImages)}
                                        </h1>
                                    )}

                                    {/* SUBHEADLINE (Slide 1 Subtitle - maps to H2) */}
                                    {slide.subheadline && (
                                        <h2 style={{
                                            fontFamily: `"${subheadingFont}", sans-serif`,
                                            fontSize: `${slide.subheading_size || 45}px`,
                                            fontWeight: '600',
                                            opacity: 0.8,
                                            marginTop: '16px',
                                            lineHeight: '1.2'
                                        }}>
                                            {renderHighlightedText(slide.subheadline, activeTemplate, data.theme.accent, inlineImages)}
                                        </h2>
                                    )}

                                    {/* SUBHEADING (Body Slide Section Title - maps to H3) */}
                                    {slide.subheading && (
                                        <h3 style={{
                                            fontFamily: `"${subheadingFont}", sans-serif`,
                                            fontSize: `${slide.subheading_size || 45}px`,
                                            fontWeight: '900',
                                            marginBottom: '15px',
                                            lineHeight: '1',
                                            textTransform: 'uppercase',
                                            color: data.theme.accent
                                        }}>
                                            {renderHighlightedText(slide.subheading, activeTemplate, data.theme.accent, inlineImages)}
                                        </h3>
                                    )}

                                    {/* 4. THE BODY LAYER */}
                                    {slide.body && (
                                        <p style={{
                                            fontFamily: `"${bodyFont}", sans-serif`,
                                            fontSize: `${slide.body_size || 35}px`,
                                            fontWeight: '900',
                                            lineHeight: '0.95',
                                            textTransform: 'uppercase',
                                            whiteSpace: 'pre-wrap'
                                        }}>
                                            {renderHighlightedText(slide.body, activeTemplate, data.theme.accent, inlineImages)}
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

                        {/* SLIDE COUNTERS & ARROWS (Ignored during export) */}
                        {showSlideNumbers && (
                            <div data-html2canvas-ignore="true">
                                <div style={{ position: 'absolute', bottom: '40px', left: '108px', fontSize: '24px', fontWeight: '600', color: data.theme.text, opacity: 0.5, zIndex: 20 }}>
                                    {index + 1} / {data.slides.length}
                                </div>
                                {index < data.slides.length - 1 && (
                                    <div style={{ position: 'absolute', top: '50%', right: '40px', transform: 'translateY(-50%)', fontSize: '40px', color: data.theme.text, opacity: 0.3, zIndex: 20 }}>
                                        →
                                    </div>
                                )}
                            </div>
                        )}

                        {/* SAFE ZONE OVERLAY (Ignored during export) */}
                        {showSafeZones && (
                            <div data-html2canvas-ignore="true" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, pointerEvents: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                {/* Top Header UI (Instagram/LinkedIn) */}
                                <div style={{ height: '150px', backgroundColor: 'rgba(239, 68, 68, 0.2)', borderBottom: '2px dashed rgba(239, 68, 68, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <span style={{ color: '#ef4444', fontSize: '24px', fontWeight: 'bold' }}>DANGER: APP HEADER UI</span>
                                </div>

                                {/* Right Side Engagement UI (Instagram Reels/Posts) */}
                                <div style={{ position: 'absolute', right: 0, bottom: '250px', width: '120px', height: '400px', backgroundColor: 'rgba(239, 68, 68, 0.2)', borderLeft: '2px dashed rgba(239, 68, 68, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <span style={{ color: '#ef4444', fontSize: '24px', fontWeight: 'bold', transform: 'rotate(-90deg)' }}>LIKES UI</span>
                                </div>

                                {/* Bottom Caption UI */}
                                <div style={{ height: '250px', backgroundColor: 'rgba(239, 68, 68, 0.2)', borderTop: '2px dashed rgba(239, 68, 68, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <span style={{ color: '#ef4444', fontSize: '24px', fontWeight: 'bold' }}>DANGER: CAPTION & COMMENTS UI</span>
                                </div>
                            </div>
                        )}
                        {overflowingSlides.includes(index) && (
                            <div
                                className="absolute top-4 right-4 z-50 bg-red-600/90 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1 animate-pulse"
                                data-html2canvas-ignore="true"
                            >
                                <span>⚠️</span> TEXT OVERFLOW
                            </div>
                        )}

                        {/* MOBILE GRID SHIFT BUTTONS */}
                        {previewMode === 'grid' && (
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 flex gap-4 bg-zinc-950/80 backdrop-blur-md p-2 rounded-full border border-white/20" data-html2canvas-ignore="true">
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleShiftSlide(index, 'left'); }}
                                    disabled={index === 0}
                                    className="w-10 h-10 flex items-center justify-center bg-zinc-800 rounded-full text-white hover:bg-zinc-700 disabled:opacity-30 disabled:hover:bg-zinc-800 transition-colors"
                                >
                                    ←
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleShiftSlide(index, 'right'); }}
                                    disabled={index === data.slides.length - 1}
                                    className="w-10 h-10 flex items-center justify-center bg-zinc-800 rounded-full text-white hover:bg-zinc-700 disabled:opacity-30 disabled:hover:bg-zinc-800 transition-colors"
                                >
                                    →
                                </button>
                            </div>
                        )}
                    </div>
                </SortableSlide>
            );
        });
    }, [
        data, accentColor, activeTemplate,
        authorName, authorHandle, authorAvatar, showProfile, footerLayout,
        headingFont, subheadingFont, bodyFont, effectiveScale,
        textAlign, noiseOpacity, customBgImage,
        setActivePreviewSlideIndex, setFocusedSlideIndex,
        showSafeZones, showSlideNumbers, previewMode, inlineImages, overflowingSlides, handleShiftSlide
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
        <div className="w-full h-full flex flex-col items-center bg-zinc-900/50 relative">
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex bg-zinc-900 border border-white/10 rounded-full p-1 shadow-xl">
                <button onClick={() => setPreviewMode('stack')} className={`px-4 py-1.5 text-xs font-bold rounded-full transition-colors ${previewMode === 'stack' ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>Stack</button>
                <button onClick={() => setPreviewMode('carousel')} className={`px-4 py-1.5 text-xs font-bold rounded-full transition-colors ${previewMode === 'carousel' ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>Swipe</button>
                <button onClick={() => setPreviewMode('grid')} className={`px-4 py-1.5 text-xs font-bold rounded-full transition-colors ${previewMode === 'grid' ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>Grid</button>
            </div>

            <div className="w-full max-w-[450px] mb-6 sticky top-0 z-20 pt-4 bg-zinc-900/80 backdrop-blur-md pb-4 px-4 border-b border-white/5 mt-16">
                {data && (
                    <ExportControls
                        data={data}
                        activeTemplate={activeTemplate}
                        setActiveTemplate={setActiveTemplate}
                        isUnlocked={isUnlocked}
                        hasGivenFeedback={hasGivenFeedback}
                    />
                )}
            </div>

            {/* THE MAIN SCROLLING WRAPPER */}
            <div className={`w-full h-full overflow-auto custom-scrollbar flex ${previewMode === 'carousel' ? 'flex-row snap-x snap-mandatory gap-8 px-12 items-center justify-start' :
                previewMode === 'grid' ? 'flex-row flex-wrap items-start justify-center p-8 gap-8 content-start' :
                    'flex-col items-center justify-start p-8 gap-12 pb-24'
                }`}>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={(data?.slides || []).map((_, i) => i.toString())} strategy={rectSortingStrategy}>
                        {slideElements}
                    </SortableContext>
                </DndContext>
            </div>
        </div>
    );
};

export default CarouselPreview;
