import React, { useState, useEffect } from 'react';
import type { CarouselData, Slide } from '../types';
import {
    Sparkles, Code, Settings, ListTree, RotateCcw,
    Trash2, Loader2, Heart, AlignLeft, AlignCenter,
    AlignRight, Palette, Type, Layout, User,
    Layers, Zap, Image as ImageIcon, CheckCircle2
} from 'lucide-react';

const MAX_SLIDES = 50;
const AVATAR_MAX_PX = 256;
const AVATAR_JPEG_QUALITY = 0.7;

const compressImage = (file: File, maxWidth = AVATAR_MAX_PX): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
            URL.revokeObjectURL(url);
            const canvas = document.createElement('canvas');
            const scale = Math.min(1, maxWidth / img.width);
            canvas.width = Math.round(img.width * scale);
            canvas.height = Math.round(img.height * scale);
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject(new Error('Canvas context unavailable'));
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/jpeg', AVATAR_JPEG_QUALITY));
        };
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image decode failed')); };
        img.src = url;
    });
};

const safeLocalStorageSet = (key: string, value: string): boolean => {
    try {
        localStorage.setItem(key, value);
        return true;
    } catch {
        return false;
    }
};

const extractJSON = (raw: string): string => {
    const trimmed = raw.trim();
    const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) return fenceMatch[1].trim();
    const first = trimmed.indexOf('{');
    const last = trimmed.lastIndexOf('}');
    if (first !== -1 && last !== -1 && last > first) return trimmed.slice(first, last + 1);
    return trimmed;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sanitizeCarouselData = (data: any): CarouselData | null => {
    if (!data || !Array.isArray(data.slides)) return null;
    const validTypes: Slide['type'][] = ['title', 'content', 'cta'];
    return {
        theme: {
            background: typeof data.theme?.background === 'string' ? data.theme.background.slice(0, 50) : '#09090B',
            text: typeof data.theme?.text === 'string' ? data.theme.text.slice(0, 50) : '#FFFFFF',
            accent: typeof data.theme?.accent === 'string' ? data.theme.accent.slice(0, 50) : '#3B82F6',
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        slides: data.slides.slice(0, MAX_SLIDES).map((s: any, i: number) => ({
            slide_number: i + 1,
            type: validTypes.includes(s.type) ? s.type : 'content',
            headline: (s.headline as string) || undefined,
            subheadline: (s.subheadline as string) || undefined,
            subheading: (s.subheading as string) || undefined,
            body: (s.body as string) || undefined,
            heading_size: (s.heading_size as number) || undefined,
            subheading_size: (s.subheading_size as number) || (s.subheadline_size as number) || undefined,
            body_size: (s.body_size as number) || undefined,
            text_align: (s.text_align as Slide['text_align']) || undefined,
            y_offset: (s.y_offset as number) || undefined,
        }))
    };
};

interface Props {
    setCarouselData: React.Dispatch<React.SetStateAction<CarouselData | null>>;
    openRouterKey: string;
    setOpenRouterKey: (val: string) => void;
    authorName: string;
    setAuthorName: (val: string) => void;
    authorHandle: string;
    setAuthorHandle: (val: string) => void;
    authorAvatar: string | null;
    setAuthorAvatar: (val: string | null) => void;
    fontFamily: string;
    setFontFamily: (val: string) => void;
    activeTemplate: string;
    setActiveTemplate: (val: string) => void;
    previewScale: number;
    setPreviewScale: (val: number) => void;
    customTheme: { background: string; text: string; accent: string };
    applyCustomTheme: (key: string, value: string) => void;
    showProfile: boolean;
    setShowProfile: (val: boolean) => void;
    footerLayout: string;
    setFooterLayout: (val: string) => void;
    textAlign: string;
    setTextAlign: (val: string) => void;
    noiseOpacity: number;
    setNoiseOpacity: (val: number) => void;
    customBgImage: string | null;
    setCustomBgImage: (val: string | null) => void;
    activePreviewSlideIndex: number;
}

const LeftPane: React.FC<Props> = (props) => {
    const {
        setCarouselData, openRouterKey, setOpenRouterKey, authorName, setAuthorName, authorHandle, setAuthorHandle,
        authorAvatar, setAuthorAvatar, fontFamily, setFontFamily, activeTemplate, setActiveTemplate,
        previewScale, setPreviewScale, customTheme, applyCustomTheme, showProfile, setShowProfile,
        footerLayout, setFooterLayout, textAlign, setTextAlign,
        noiseOpacity, setNoiseOpacity, customBgImage, setCustomBgImage, activePreviewSlideIndex
    } = props;

    const [activeTab, setActiveTab] = useState<'auto' | 'bulk' | 'json' | 'setup'>('bulk');
    const [jsonInput, setJsonInput] = useState('');
    const [rawInput, setRawInput] = useState('');
    const [bulkText, setBulkText] = useState(() => localStorage.getItem('lastBulkText') || '');
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiModel, setAiModel] = useState<'free' | 'pro'>('free');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        try { localStorage.setItem('lastBulkText', bulkText); } catch { /* quota */ }
    }, [bulkText]);

    // CRITICAL FIX: Compile any saved bulk text on first render so slides appear immediately
    useEffect(() => {
        if (bulkText.trim()) {
            compileBulkText(bulkText);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Auto-clear errors after 5 seconds
    useEffect(() => {
        if (error) {
            const t = setTimeout(() => setError(null), 5000);
            return () => clearTimeout(t);
        }
    }, [error]);

    // ── BULLETPROOF REGEX PARSER ──────────────────────────────────────────────
    // Handles combined options like /h, s:120, a:center/ or /sh, b_s:40/ cleanly.
    const compileBulkText = (text: string) => {
        const rawSlides = text.split(/\n\s*\n/).filter(s => s.trim());

        const slides = rawSlides.map((rawSlide, index) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const slideObj: any = {
                slide_number: index + 1,
                type: index === 0 ? 'title' : 'content'
            };

            const lines = rawSlide.split('\n').filter(l => l.trim());
            const bodyLines: string[] = [];

            lines.forEach(line => {
                // Matches lines starting with /something/ and captures the config and the content
                const match = line.match(/^\/([^/]+)\/\s*(.*)$/);

                if (match) {
                    const configString = match[1].toLowerCase(); // e.g., "h", "h, s:120", "sh, a:center"
                    const content = match[2];

                    const parts = configString.split(',').map(p => p.trim());
                    const type = parts[0]; // "h" or "sh"

                    // Extract parameters
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const options: any = {};
                    parts.slice(1).forEach(opt => {
                        const [k, v] = opt.split(':').map(x => x?.trim());
                        if (!k || !v) return;
                        if (k === 's') options.heading_size = parseInt(v);
                        if (k === 'sh_s') options.subheading_size = parseInt(v);
                        if (k === 'sb_s') options.subheading_size = parseInt(v);
                        if (k === 'b_s') options.body_size = parseInt(v);
                        if (k === 'y') options.y_offset = parseInt(v);
                        if (k === 'a') options.text_align = v;
                    });

                    // Assign to proper layer based ONLY on "h" or "sh"
                    if (type === 'h') {
                        slideObj.headline = content;
                        Object.assign(slideObj, options);
                    } else if (type === 'sh') {
                        // Use subheadline for slide 1 (title), subheading for others
                        if (slideObj.type === 'title') slideObj.subheadline = content;
                        else slideObj.subheading = content;
                        Object.assign(slideObj, options);
                    } else {
                        // If they typed something invalid like /body/, strip the tag and treat as body
                        bodyLines.push(content);
                    }
                } else {
                    // No /tags/, this is standard body text
                    bodyLines.push(line);
                }
            });

            if (bodyLines.length > 0) slideObj.body = bodyLines.join('\n');
            return slideObj as Slide;
        });

        if (slides.length > 0) {
            setCarouselData(prev => ({
                theme: prev?.theme || { background: '#09090B', text: '#FAFAFA', accent: '#F59E0B' },
                slides: slides
            }));
        } else {
            setCarouselData(null);
        }
    };

    // ── ROBUST CONFIG UPDATER ─────────────────────────────────────────────────
    // Updates or injects a single key:value into the config tag of the active slide's
    // heading line (/h/ or /sh/). Prevents key duplication on repeated calls.
    const updateSlideConfig = (targetBlock: string, key: string, value: string | number): string => {
        const lines = targetBlock.split(/\r?\n/);

        // Find the first tagged line — heading takes priority, then subheading
        const tagLineIndex = lines.findIndex(l => /^\/([^/]+)\//.test(l.trim()));

        if (tagLineIndex !== -1) {
            const line = lines[tagLineIndex].trim();
            const match = line.match(/^\/([^/]+)\/\s*(.*)$/);
            if (match) {
                const configBody = match[1]; // everything inside the slashes
                const content = match[2];
                const parts = configBody.split(',').map(s => s.trim());
                const tag = parts[0]; // "h" or "sh"

                // Remove existing occurrence of this key to prevent duplication
                const filteredOptions = parts.slice(1).filter(o => !o.startsWith(`${key}:`));
                filteredOptions.push(`${key}:${value}`);

                lines[tagLineIndex] = `/${[tag, ...filteredOptions].join(', ')}/ ${content}`;
            }
        } else {
            // No tagged line found — inject a new /h/ tag on the first non-empty line
            const firstContentLine = lines.findIndex(l => l.trim().length > 0);
            if (firstContentLine !== -1) {
                lines[firstContentLine] = `/h, ${key}:${value}/ ${lines[firstContentLine].trim()}`;
            } else {
                lines.push(`/h, ${key}:${value}/ `);
            }
        }

        return lines.join('\n');
    };

    const injectOverride = (key: string, value: string | number) => {
        const contentBlocks = bulkText.split(/\n\s*\n/).filter(b => b.trim().length > 0);
        if (activePreviewSlideIndex >= contentBlocks.length) return;

        const updatedBlock = updateSlideConfig(contentBlocks[activePreviewSlideIndex], key, value);
        contentBlocks[activePreviewSlideIndex] = updatedBlock;

        const newText = contentBlocks.join('\n\n');
        setBulkText(newText);
        compileBulkText(newText);
    };

    const getOverride = (key: string, def: number): number => {
        const contentBlocks = bulkText.split(/\n\s*\n/).filter(b => b.trim().length > 0);
        const block = contentBlocks[activePreviewSlideIndex];
        if (!block) return def;
        const match = block.match(/^\/([^/]+)\//m);
        if (!match) return def;
        const options = match[1].split(',').map(s => s.trim());
        const found = options.find(o => o.startsWith(`${key}:`));
        if (found) {
            const v = parseInt(found.split(':')[1]);
            return isNaN(v) ? def : v;
        }
        return def;
    };

    const generateNarrative = async () => {
        if (!openRouterKey || !rawInput) return setError('Key and prompt required');
        setIsGenerating(true);
        setError(null);
        try {
            const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${openRouterKey.trim()}`,
                    'HTTP-Referer': window.location.origin,
                    'X-Title': 'Carousel Creator'
                },
                body: JSON.stringify({
                    model: aiModel === 'free' ? "arcee-ai/trinity-large-preview:free" : "anthropic/claude-3.5-sonnet",
                    messages: [
                        { role: 'system', content: 'You are a LinkedIn Viral Ghostwriter. Convert raw text into a high-retention carousel JSON object with slides array including headline, subheadline, and body fields. Divide slides with double line breaks.' },
                        { role: 'user', content: rawInput }
                    ],
                    response_format: { type: 'json_object' }
                })
            });
            const data = await resp.json();
            const content = data.choices[0].message.content;
            const parsed = JSON.parse(extractJSON(content));
            const sanitized = sanitizeCarouselData(parsed);
            if (sanitized) {
                setCarouselData(sanitized);
                setJsonInput(JSON.stringify(sanitized, null, 2));
                setActiveTab('json');
            }
        } catch { setError('AI Generation failed'); }
        finally { setIsGenerating(false); }
    };

    const palettes = [
        { name: 'Night', bg: '#0A0A0B', text: '#FFFFFF', accent: '#3B82F6' },
        { name: 'Ghost', bg: '#FFFFFF', text: '#111111', accent: '#6366F1' },
        { name: 'Flame', bg: '#0F0F0F', text: '#FFFFFF', accent: '#EF4444' },
        { name: 'Mint', bg: '#050505', text: '#F0FDF4', accent: '#22C55E' },
        { name: 'Royal', bg: '#101018', text: '#FAF9FF', accent: '#C084FC' },
        { name: 'Gold', bg: '#0C0A08', text: '#FFF8E7', accent: '#D4AF37' },
        { name: 'Ocean', bg: '#03111A', text: '#E0F2FE', accent: '#0EA5E9' },
        { name: 'Rose', bg: '#110608', text: '#FFF1F2', accent: '#F43F5E' },
        { name: 'Lime', bg: '#071207', text: '#F7FEE7', accent: '#84CC16' },
        { name: 'Amber', bg: '#120E04', text: '#FFFBEB', accent: '#F59E0B' },
        { name: 'Slate', bg: '#1E293B', text: '#F8FAFC', accent: '#94A3B8' },
        { name: 'Neon', bg: '#000000', text: '#00FF88', accent: '#00FF88' },
    ];

    // Hardcoded sensible defaults for the per-slide tuner (mirrors CarouselPreview fallbacks)
    const DEFAULT_HEADING_SIZE = 110;
    const DEFAULT_SUBHEADING_SIZE = 45;
    const DEFAULT_BODY_SIZE = 35;
    const DEFAULT_Y_OFFSET = 0;

    return (
        <div className="flex flex-col h-full gap-6 select-none">
            {/* ── PREMIUM TABS ── */}
            <div className="flex p-1.5 bg-zinc-950/80 rounded-2xl border border-white/5 shadow-inner">
                {[
                    { id: 'auto', icon: Sparkles, label: 'Auto' },
                    { id: 'bulk', icon: ListTree, label: 'Bulk' },
                    { id: 'json', icon: Code, label: 'JSON' },
                    { id: 'setup', icon: Settings, label: 'Setup' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as 'auto' | 'bulk' | 'json' | 'setup')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${activeTab === tab.id ? 'bg-white text-black shadow-2xl scale-[1.02]' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        <tab.icon size={12} strokeWidth={3} />
                        <span className="hidden lg:inline">{tab.label}</span>
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 flex flex-col gap-6">

                {activeTab === 'auto' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-6">
                        <div className="rounded-[24px] p-6 space-y-6 bg-white/[0.02] border border-white/[0.04]">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-2">
                                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">Manifestation Prompt</label>
                                    <button onClick={() => setRawInput('')} className="bg-zinc-800 hover:bg-red-500/20 text-zinc-300 hover:text-red-400 border border-white/10 px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1">
                                        <Trash2 size={10} /> Clear
                                    </button>
                                </div>
                                <textarea
                                    className="w-full bg-zinc-900 border border-white/10 rounded-xl p-4 text-sm text-zinc-300 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all resize-none relative z-10 box-border"
                                    placeholder="Explain your core idea... the AI will handle the hook, the flow, and the CTA."
                                    value={rawInput}
                                    onChange={(e) => setRawInput(e.target.value)}
                                />
                            </div>
                            <div className="space-y-4 pt-4 border-t border-white/5">
                                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] ml-2">Engine Intelligence</label>
                                <div className="grid grid-cols-2 gap-2 p-1 bg-black/40 rounded-2xl border border-white/5">
                                    <button
                                        onClick={() => setAiModel('free')}
                                        className={`py-3 text-[9px] font-black uppercase rounded-xl transition-all ${aiModel === 'free' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-600 hover:text-zinc-400'}`}
                                    >
                                        Trinity (Free)
                                    </button>
                                    <button
                                        onClick={() => setAiModel('pro')}
                                        className={`py-3 text-[9px] font-black uppercase rounded-xl transition-all ${aiModel === 'pro' ? 'bg-zinc-800 text-blue-400 shadow-lg' : 'text-zinc-600 hover:text-zinc-400'}`}
                                    >
                                        Claude 3.5 (Pro)
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] ml-2">OpenRouter API Key</label>
                                <input
                                    type="password"
                                    className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-xs focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-white"
                                    placeholder="sk-or-v1-..."
                                    value={openRouterKey}
                                    onChange={(e) => setOpenRouterKey(e.target.value)}
                                />
                            </div>
                            <button
                                onClick={generateNarrative}
                                disabled={isGenerating}
                                className="w-full py-5 bg-white text-black rounded-[24px] font-black text-xs uppercase tracking-[0.3em] hover:scale-[1.02] active:scale-95 transition-all duration-700 flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(255,255,255,0.1)]"
                            >
                                {isGenerating ? <Loader2 className="animate-spin" size={16} /> : <Zap size={14} fill="currentColor" />}
                                {isGenerating ? 'ARCHITECTING...' : 'MANIFEST NARRATIVE'}
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'bulk' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-6">
                        <div className="rounded-[24px] p-6 space-y-6 bg-white/[0.02] border border-white/[0.04]">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-2">
                                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">Bulk Content Engine</label>
                                    <button onClick={() => { setBulkText(''); setCarouselData(null); }} className="bg-zinc-800 hover:bg-red-500/20 text-zinc-300 hover:text-red-400 border border-white/10 px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1">
                                        <Trash2 size={10} /> Clear
                                    </button>
                                </div>
                                <textarea
                                    value={bulkText}
                                    onChange={(e) => { setBulkText(e.target.value); compileBulkText(e.target.value); }}
                                    placeholder={`/h/ My Headline\n/sh/ My Subheading\nBody text goes here\n\n/h/ Slide 2 Headline\nMore body text`}
                                    rows={14}
                                    className="w-full bg-zinc-900 border border-white/10 rounded-xl p-4 text-sm text-zinc-300 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all resize-none relative z-10 box-border"
                                />
                            </div>

                            {bulkText && (
                                <div className="p-6 bg-white/[0.02] border border-white/5 rounded-[28px] space-y-6 group">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                            <span className="text-[10px] font-black uppercase text-blue-400 tracking-widest">SLIDE {activePreviewSlideIndex + 1} TUNER</span>
                                        </div>
                                        <div className="flex gap-1.5">
                                            {['left', 'center', 'right'].map(a => {
                                                const currentAlign = bulkText.split(/\n\s*\n/).filter(b => b.trim().length > 0)[activePreviewSlideIndex]?.match(/a:(\w+)/)?.[1];
                                                return (
                                                    <button key={a} onClick={() => injectOverride('a', a)} className={`p-1 transition-colors ${currentAlign === a ? 'text-blue-400' : 'text-zinc-600 hover:text-white'}`}>
                                                        {a === 'left' && <AlignLeft size={14} />}
                                                        {a === 'center' && <AlignCenter size={14} />}
                                                        {a === 'right' && <AlignRight size={14} />}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                        {[
                                            { label: 'Headline', key: 's', def: DEFAULT_HEADING_SIZE },
                                            { label: 'Subhead', key: 'sh_s', def: DEFAULT_SUBHEADING_SIZE },
                                            { label: 'Section', key: 'sb_s', def: 38 },
                                            { label: 'Body', key: 'b_s', def: DEFAULT_BODY_SIZE },
                                            { label: 'Y-Offset', key: 'y', def: DEFAULT_Y_OFFSET }
                                        ].map(s => (
                                            <div key={s.key} className="space-y-1">
                                                <div className="flex justify-between text-[8px] font-black tracking-widest text-zinc-600 uppercase">
                                                    <span>{s.label}</span>
                                                    <span>{getOverride(s.key, s.def)}px</span>
                                                </div>
                                                <input
                                                    type="range" min={s.key === 'y' ? -500 : 12} max={s.key === 'y' ? 500 : 250}
                                                    value={getOverride(s.key, s.def)}
                                                    onChange={(e) => injectOverride(s.key, Number(e.target.value))}
                                                    className="w-full h-1 bg-zinc-900 rounded-full appearance-none cursor-pointer accent-white"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'json' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-6">
                        <div className="rounded-[24px] p-6 space-y-6 bg-white/[0.02] border border-white/[0.04]">
                            <div className="flex justify-between items-center px-4">
                                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">Raw JSON State</label>
                                <button onClick={() => setJsonInput('')} className="bg-zinc-800 hover:bg-red-500/20 text-zinc-300 hover:text-red-400 border border-white/10 px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1">
                                    <Trash2 size={10} /> Clear
                                </button>
                            </div>
                            <textarea
                                value={jsonInput}
                                onChange={(e) => setJsonInput(e.target.value)}
                                rows={20}
                                className="w-full bg-zinc-900 border border-white/10 rounded-xl p-4 text-sm text-zinc-300 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all resize-none relative z-10 box-border font-mono"
                                spellCheck={false}
                            />
                            <div className="flex gap-4">
                                <button
                                    onClick={() => {
                                        setError(null);
                                        try {
                                            const p = JSON.parse(extractJSON(jsonInput));
                                            const s = sanitizeCarouselData(p);
                                            if (s) {
                                                setCarouselData(s);
                                            } else {
                                                setError('Invalid carousel structure — needs slides array');
                                            }
                                        } catch { setError('Invalid JSON — check syntax'); }
                                    }}
                                    className="flex-1 py-4 bg-zinc-800 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-zinc-700 transition-all font-sans"
                                >
                                    SYNCHRONIZE STATE
                                </button>
                                <button onClick={() => { navigator.clipboard.writeText(jsonInput); }} className="p-4 bg-zinc-900 rounded-2xl hover:bg-zinc-800 text-zinc-500 hover:text-white transition-all shadow-lg">
                                    <Heart size={16} fill={jsonInput ? 'white' : 'transparent'} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'setup' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8 pb-24">
                        <div className="rounded-[24px] p-6 space-y-6 bg-white/[0.02] border border-white/[0.04]">
                            <h3 className="flex items-center gap-2 text-[10px] font-black uppercase text-blue-400 tracking-[0.3em]">
                                <User size={12} /> Creator Manuscript
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[9px] uppercase font-bold text-zinc-600 tracking-widest pl-1">Name</label>
                                    <input className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-xs text-white focus:ring-1 focus:ring-white/20" value={authorName} onChange={(e) => setAuthorName(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] uppercase font-bold text-zinc-600 tracking-widest pl-1">Handle / ID</label>
                                    <input className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-xs text-white focus:ring-1 focus:ring-white/20" value={authorHandle} onChange={(e) => setAuthorHandle(e.target.value)} />
                                </div>
                            </div>
                            <div className="flex items-center gap-6 p-5 bg-black/20 rounded-2xl border border-white/5">
                                <div className="relative group shrink-0">
                                    <div className="w-14 h-14 rounded-full border border-white/10 bg-zinc-900 overflow-hidden shadow-2xl">
                                        {authorAvatar && <img src={authorAvatar} className="w-full h-full object-cover" alt="Profile" />}
                                    </div>
                                    <input type="file" accept="image/*" onChange={async (e) => {
                                        const f = e.target.files?.[0];
                                        if (f) {
                                            const c = await compressImage(f);
                                            setAuthorAvatar(c);
                                            safeLocalStorageSet('creatorAvatar', c);
                                        }
                                    }} className="absolute inset-0 opacity-0 cursor-pointer" />
                                </div>
                                <div className="flex-1 flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase text-white tracking-widest">Profile Visibility</p>
                                        <p className="text-[8px] text-zinc-600 font-bold leading-tight">Toggle brand watermark.</p>
                                    </div>
                                    <button
                                        onClick={() => setShowProfile(!showProfile)}
                                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${showProfile ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'bg-zinc-900 text-zinc-600 border border-white/5'}`}
                                    >
                                        <CheckCircle2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-[24px] p-6 space-y-6 bg-white/[0.02] border border-white/[0.04]">
                            <h3 className="flex items-center gap-2 text-[10px] font-black uppercase text-blue-400 tracking-[0.3em]">
                                <Type size={12} /> Typography Foundry
                            </h3>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold text-zinc-600 tracking-widest pl-1">Global Typeface</label>
                                    <select
                                        className="w-full bg-black/60 border border-white/5 rounded-xl p-4 text-xs font-bold text-zinc-300 outline-none focus:ring-1 focus:ring-white/20 appearance-none shadow-inner"
                                        value={fontFamily} onChange={(e) => setFontFamily(e.target.value)}
                                    >
                                        {['Outfit', 'Inter', 'Montserrat', 'Playfair Display', 'Space Grotesk', 'Bebas Neue'].map(f => <option key={f} value={f}>{f}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-[24px] p-6 space-y-6 bg-white/[0.02] border border-white/[0.04]">
                            <h3 className="flex items-center gap-2 text-[10px] font-black uppercase text-blue-400 tracking-[0.3em]">
                                <Palette size={12} /> Chromatic DNA
                            </h3>

                            <div className="flex flex-wrap gap-2 mb-6">
                                {palettes.map(p => (
                                    <button
                                        key={p.name}
                                        onClick={() => {
                                            applyCustomTheme('background', p.bg);
                                            applyCustomTheme('text', p.text);
                                            applyCustomTheme('accent', p.accent);
                                        }}
                                        className="group/pal relative px-3 py-2 rounded-xl border border-white/5 bg-zinc-900/50 hover:bg-zinc-800 hover:border-white/15 text-[9px] font-black uppercase tracking-widest flex items-center gap-2.5 transition-all"
                                    >
                                        <div className="flex -space-x-0.5">
                                            <div className="w-3 h-3 rounded-full border border-black/30" style={{ background: p.bg }} />
                                            <div className="w-3 h-3 rounded-full border border-black/30" style={{ background: p.text }} />
                                            <div className="w-3 h-3 rounded-full border border-black/30" style={{ background: p.accent }} />
                                        </div>
                                        <span className="text-zinc-400 group-hover/pal:text-white transition-colors">{p.name}</span>
                                        {/* Hex tooltip on hover */}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/pal:flex flex-col items-start bg-zinc-950 border border-white/10 rounded-lg px-3 py-2 shadow-2xl z-50 whitespace-nowrap">
                                            <span className="text-[8px] text-zinc-500 font-mono">BG: {p.bg}</span>
                                            <span className="text-[8px] text-zinc-500 font-mono">TXT: {p.text}</span>
                                            <span className="text-[8px] font-mono" style={{ color: p.accent }}>ACC: {p.accent}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* ── CUSTOM COLOR PICKERS: Strictly bound to hex strings ── */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest pl-1 text-center">BG</p>
                                    <div className="flex items-center gap-2 bg-black/60 border border-white/10 rounded-xl p-2 w-full transition-colors focus-within:border-white/30">
                                        <div className="w-6 h-6 rounded-full border border-black/50 shrink-0 shadow-inner" style={{ background: customTheme.background }} />
                                        <input
                                            type="text"
                                            value={customTheme.background}
                                            onChange={(e) => applyCustomTheme('background', e.target.value)}
                                            className="bg-transparent text-[10px] font-mono text-zinc-300 w-full outline-none uppercase"
                                            placeholder="#HEX"
                                            maxLength={7}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest pl-1 text-center">TEXT</p>
                                    <div className="flex items-center gap-2 bg-black/60 border border-white/10 rounded-xl p-2 w-full transition-colors focus-within:border-white/30">
                                        <div className="w-6 h-6 rounded-full border border-black/50 shrink-0 shadow-inner" style={{ background: customTheme.text }} />
                                        <input
                                            type="text"
                                            value={customTheme.text}
                                            onChange={(e) => applyCustomTheme('text', e.target.value)}
                                            className="bg-transparent text-[10px] font-mono text-zinc-300 w-full outline-none uppercase"
                                            placeholder="#HEX"
                                            maxLength={7}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest pl-1 text-center">ACCENT</p>
                                    <div className="flex items-center gap-2 bg-black/60 border border-white/10 rounded-xl p-2 w-full transition-colors focus-within:border-white/30">
                                        <div className="w-6 h-6 rounded-full border border-black/50 shrink-0 shadow-inner" style={{ background: customTheme.accent }} />
                                        <input
                                            type="text"
                                            value={customTheme.accent}
                                            onChange={(e) => applyCustomTheme('accent', e.target.value)}
                                            className="bg-transparent text-[10px] font-mono text-zinc-300 w-full outline-none uppercase"
                                            placeholder="#HEX"
                                            maxLength={7}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-5 bg-black/20 rounded-2xl border border-white/5 mt-4">
                                <div className="relative group shrink-0">
                                    <div className="w-10 h-10 rounded-xl border border-white/10 bg-zinc-900 flex items-center justify-center overflow-hidden shadow-inner">
                                        {customBgImage ? <img src={customBgImage} className="w-full h-full object-cover" alt="Background" /> : <ImageIcon size={18} className="text-zinc-700" />}
                                    </div>
                                    <input type="file" accept="image/*" onChange={async (e) => {
                                        const f = e.target.files?.[0];
                                        if (f) {
                                            const c = await compressImage(f, 1080);
                                            setCustomBgImage(c);
                                            safeLocalStorageSet('customBgImage', c);
                                        }
                                    }} className="absolute inset-0 opacity-0 cursor-pointer" />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <p className="text-[10px] font-black uppercase text-white tracking-widest">Atmospheric Backdrop</p>
                                    <p className="text-[8px] text-zinc-600 font-bold leading-tight">Apply a textured backdrop.</p>
                                </div>
                                {customBgImage && (
                                    <button onClick={() => { setCustomBgImage(null); }} className="text-zinc-600 hover:text-red-400 transition-colors">
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="rounded-[24px] p-6 space-y-6 bg-white/[0.02] border border-white/[0.04]">
                            <h3 className="flex items-center gap-2 text-[10px] font-black uppercase text-blue-400 tracking-[0.3em]">
                                <Layout size={12} /> Visual Motifs
                            </h3>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                                {['minimal', 'tweet', 'brutalist', 'highlight'].map(t => (
                                    <button
                                        key={t} onClick={() => setActiveTemplate(t)}
                                        className={`py-3 text-[9px] font-black uppercase tracking-widest rounded-xl border transition-all ${activeTemplate === t ? 'bg-white text-black border-white shadow-2xl' : 'bg-transparent text-zinc-600 border-white/5 hover:border-white/20'}`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-[24px] p-6 space-y-6 bg-white/[0.02] border border-white/[0.04]">
                            <h3 className="flex items-center gap-2 text-[10px] font-black uppercase text-blue-400 tracking-[0.3em]">
                                <Layers size={12} /> Geometric Physics
                            </h3>
                            <div className="grid grid-cols-1 gap-6">
                                {[
                                    { label: 'Canvas Grain', val: noiseOpacity, set: setNoiseOpacity, min: 0, max: 25, unit: '%' },
                                    { label: 'Viewport Zoom', val: Math.round(previewScale * 100), set: (v: number) => setPreviewScale(v / 100), min: 10, max: 100, unit: '%' }
                                ].map(g => (
                                    <div key={g.label} className="space-y-3">
                                        <div className="flex justify-between items-center text-[9px] font-black text-zinc-600 uppercase tracking-widest px-1">
                                            <span>{g.label}</span>
                                            <span className="text-zinc-400 font-mono">{g.val}{g.unit}</span>
                                        </div>
                                        <input type="range" min={g.min} max={g.max} value={g.val} onChange={(e) => g.set(Number(e.target.value))} className="w-full h-1 bg-zinc-900 rounded-full appearance-none accent-white cursor-pointer" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-[24px] p-6 space-y-4 bg-white/[0.02] border border-white/[0.04]">
                            <label className="text-[9px] uppercase font-bold text-zinc-600 tracking-widest pl-1">Alignment / Footer</label>
                            <div className="flex gap-1 bg-black/40 p-1 rounded-2xl border border-white/5">
                                {['left', 'center', 'right'].map(a => (
                                    <button
                                        key={a} onClick={() => { setTextAlign(a); setFooterLayout(a); }}
                                        className={`flex-1 py-2 text-[9px] font-black uppercase rounded-lg transition-all ${textAlign === a && footerLayout === a ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-700 hover:text-zinc-400'}`}
                                    >
                                        {a}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => { setCarouselData(null); setBulkText(''); setRawInput(''); setJsonInput(''); }}
                            className="w-full py-4 border border-white/5 bg-zinc-900 rounded-2xl flex items-center justify-center gap-2 text-zinc-600 hover:text-red-400 hover:bg-red-500/5 hover:border-red-500/20 transition-all font-black text-[10px] uppercase tracking-[0.3em]"
                        >
                            <RotateCcw size={12} /> Purge Everything
                        </button>
                    </div>
                )}

            </div>

            {
                error && (
                    <div
                        onClick={() => setError(null)}
                        className="bg-red-500/5 border border-red-500/20 text-red-500 p-4 rounded-3xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 cursor-pointer hover:bg-red-500/10 transition-all"
                    >
                        <Trash2 size={12} /> {error}
                    </div>
                )
            }
        </div >
    );
};

export default LeftPane;
