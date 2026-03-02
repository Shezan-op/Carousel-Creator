import React, { useState, useEffect } from 'react';
import type { CarouselData, Slide } from '../types';
import {
    Sparkles, Code, Settings, ListTree, RotateCcw,
    Trash2, Loader2, Heart, Palette, Type, Layout, User,
    Zap, Image as ImageIcon, CheckCircle2
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
    bulkText: string;
    setBulkText: (val: string) => void;
    compileBulkText: (text: string) => void;
    injectOverride: (index: number, tag: string, key: string, value: string | number) => void;
    getOverride: (index: number, key: string, def: number) => number;
    setFocusedSlideIndex: (index: number | null) => void;
}

const LeftPane: React.FC<Props> = (props) => {
    const {
        setCarouselData, openRouterKey, setOpenRouterKey, authorName, setAuthorName, authorHandle, setAuthorHandle,
        authorAvatar, setAuthorAvatar, fontFamily, setFontFamily, activeTemplate, setActiveTemplate,
        previewScale, setPreviewScale, customTheme, applyCustomTheme, showProfile, setShowProfile,
        footerLayout, setFooterLayout, textAlign, setTextAlign,
        noiseOpacity, setNoiseOpacity, customBgImage, setCustomBgImage,
        bulkText, setBulkText, compileBulkText
    } = props;

    const [activeTab, setActiveTab] = useState<'auto' | 'bulk' | 'json' | 'setup'>('bulk');
    const [jsonInput, setJsonInput] = useState('');
    const [rawInput, setRawInput] = useState('');
    // bulkText is now a prop
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiModel, setAiModel] = useState<'free' | 'pro'>('free');
    const [error, setError] = useState<string | null>(null);
    const [showGuide, setShowGuide] = useState(false);

    // Auto-clear errors after 5 seconds
    useEffect(() => {
        if (error) {
            const t = setTimeout(() => setError(null), 5000);
            return () => clearTimeout(t);
        }
    }, [error]);

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

    const applyFormatting = (prefix: string, suffix: string) => {
        const textarea = document.getElementById('bulk-textarea') as HTMLTextAreaElement;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = bulkText.substring(start, end);

        const newText = bulkText.substring(0, start) + prefix + selectedText + suffix + bulkText.substring(end);

        setBulkText(newText);
        // refocus the textarea after state updates
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + prefix.length, end + prefix.length);
        }, 0);
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


    return (
        <div className="flex flex-col h-full lg:h-screen bg-zinc-950 border-r border-white/10 select-none overflow-hidden">
            {/* Header Area — Fixed */}
            <div className="p-6 pb-0 shrink-0">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/5 p-1.5 flex items-center justify-center shadow-2xl">
                            <img src="/Logo.png" className="w-full h-full object-contain" alt="Carousel Creator Logo" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black tracking-tighter font-display bg-gradient-to-br from-white to-zinc-500 bg-clip-text text-transparent">
                                CAROUSEL <span className="text-zinc-600 font-light italic">CREATOR</span>
                            </h1>
                            <p className="text-[9px] text-zinc-500 uppercase tracking-[0.3em] font-bold">Fast. Clean. Professional.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scrollable Middle Section */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 flex flex-col gap-6">
                {/* ── PREMIUM TABS ── */}
                <div className="flex p-1.5 bg-zinc-950/80 rounded-2xl border border-white/5 shadow-inner shrink-0">
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
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setBulkText("/h, s: 120, a: center/ **SaaS Builder** Guide\n/sh/ How to go from 0 to _10k MRR_ in 90 days\n\n/h/ The *Hard* Truth\nBuilding is the easy part. \nDistribution is where most founders fail.\nYou need a system, not just a product.\n\n/sh, sh_s: 60, a: right/ Why Carousels?\n/body, b_s: 40/ 1. High engagement\n2. Easy to digest\n3. Perfect for **educational** content.\n\n/h, s: 90, a: center/ Want the **Blueprint**?\n/sh/ I'm launching the full guide next week.\nFollow for the _early access_ link.")}
                                            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-400 border border-white/5 px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all"
                                        >
                                            Example
                                        </button>
                                        <button onClick={() => { setBulkText(''); setCarouselData(null); }} className="bg-zinc-800 hover:bg-red-500/20 text-zinc-300 hover:text-red-400 border border-white/10 px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1">
                                            Clear
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mb-2">
                                    {/* Markdown Formatting Toolbar */}
                                    <div className="flex items-center gap-1 bg-zinc-900 border border-white/10 rounded-md p-1">
                                        <button onClick={() => applyFormatting('**', '**')} className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 rounded font-bold transition-colors" title="Bold (**)">&nbsp;B&nbsp;</button>
                                        <button onClick={() => applyFormatting('_', '_')} className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 rounded italic transition-colors" title="Italic (_)">I</button>
                                        <button onClick={() => applyFormatting('__', '__')} className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 rounded underline transition-colors" title="Underline (__)">U</button>
                                        <button onClick={() => applyFormatting('*', '*')} className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors" title="Highlight (*)">🖍️</button>
                                    </div>
                                </div>

                                <textarea
                                    id="bulk-textarea"
                                    value={bulkText}
                                    onChange={(e) => { setBulkText(e.target.value); compileBulkText(e.target.value); }}
                                    placeholder={`/h/ My Headline\n/sh/ My Subheading\nBody text goes here\n\n/h/ Slide 2 Headline\nMore body text`}
                                    rows={14}
                                    className="w-full bg-zinc-900 border border-white/10 rounded-xl p-4 text-sm text-zinc-300 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all resize-none relative z-10 box-border"
                                />
                            </div>

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
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-4 pb-24">

                        {/* 1. CREATOR PROFILE */}
                        <details className="group border border-white/10 bg-zinc-900/50 rounded-xl overflow-hidden">
                            <summary className="flex items-center justify-between p-4 cursor-pointer select-none bg-zinc-900 hover:bg-zinc-800 transition-colors">
                                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2"><User size={12} /> Creator Manuscript</span>
                                <span className="text-zinc-500 group-open:rotate-180 transition-transform duration-200 text-[10px]">▼</span>
                            </summary>
                            <div className="p-6 space-y-6 border-t border-white/5">
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
                        </details>

                        {/* 2. BRAND PALETTE */}
                        <details className="group border border-white/10 bg-zinc-900/50 rounded-xl overflow-hidden" open>
                            <summary className="flex items-center justify-between p-4 cursor-pointer select-none bg-zinc-900 hover:bg-zinc-800 transition-colors">
                                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2"><Palette size={12} /> 🎨 Brand Palette</span>
                                <span className="text-zinc-500 group-open:rotate-180 transition-transform duration-200 text-[10px]">▼</span>
                            </summary>
                            <div className="p-6 space-y-6 border-t border-white/5">
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
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/pal:flex flex-col items-start bg-zinc-950 border border-white/10 rounded-lg px-3 py-2 shadow-2xl z-50 whitespace-nowrap">
                                                <span className="text-[8px] text-zinc-500 font-mono">BG: {p.bg}</span>
                                                <span className="text-[8px] text-zinc-500 font-mono">TXT: {p.text}</span>
                                                <span className="text-[8px] font-mono" style={{ color: p.accent }}>ACC: {p.accent}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
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
                            </div>
                        </details>

                        {/* 3. TYPOGRAPHY & LAYOUT */}
                        <details className="group border border-white/10 bg-zinc-900/50 rounded-xl overflow-hidden">
                            <summary className="flex items-center justify-between p-4 cursor-pointer select-none bg-zinc-900 hover:bg-zinc-800 transition-colors">
                                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2"><Type size={12} /> Typography & Motifs</span>
                                <span className="text-zinc-500 group-open:rotate-180 transition-transform duration-200 text-[10px]">▼</span>
                            </summary>
                            <div className="p-6 space-y-6 border-t border-white/5">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-bold text-zinc-600 tracking-widest pl-1">Global Typeface</label>
                                        <select
                                            className="w-full bg-black/60 border border-white/5 rounded-xl p-4 text-xs font-bold text-zinc-300 outline-none focus:ring-1 focus:ring-white/20 appearance-none shadow-inner"
                                            value={fontFamily} onChange={(e) => setFontFamily(e.target.value)}
                                        >
                                            {['Outfit', 'Inter', 'Montserrat', 'Playfair Display', 'Space Grotesk', 'Bebas Neue'].map(f => <option key={f} value={f}>{f}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-blue-400 tracking-[0.3em] flex items-center gap-2">
                                            <Layout size={12} /> Visual Motifs
                                        </label>
                                        <div className="grid grid-cols-2 gap-2">
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
                                    <div className="space-y-2">
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
                                </div>
                            </div>
                        </details>

                        {/* 4. ADVANCED PHYSICS */}
                        <details className="group border border-white/10 bg-zinc-900/50 rounded-xl overflow-hidden">
                            <summary className="flex items-center justify-between p-4 cursor-pointer select-none bg-zinc-900 hover:bg-zinc-800 transition-colors">
                                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2"><Settings size={12} /> ⚙️ Advanced Settings</span>
                                <span className="text-zinc-500 group-open:rotate-180 transition-transform duration-200 text-[10px]">▼</span>
                            </summary>
                            <div className="p-6 space-y-6 border-t border-white/5">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4 p-5 bg-black/20 rounded-2xl border border-white/5">
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
                            </div>
                        </details>

                        <button
                            onClick={() => { setCarouselData(null); setBulkText(''); setRawInput(''); setJsonInput(''); }}
                            className="w-full py-4 border border-white/5 bg-zinc-900 rounded-2xl flex items-center justify-center gap-2 text-zinc-600 hover:text-red-400 hover:bg-red-500/5 hover:border-red-500/20 transition-all font-black text-[10px] uppercase tracking-[0.3em]"
                        >
                            <RotateCcw size={12} /> Purge Everything
                        </button>
                    </div>
                )}
            </div>

            {/* Error Message Area */}
            {error && (
                <div
                    onClick={() => setError(null)}
                    className="mx-6 mb-4 bg-red-500/5 border border-red-500/20 text-red-500 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 cursor-pointer hover:bg-red-500/10 transition-all"
                >
                    <Trash2 size={12} /> {error}
                </div>
            )}

            {/* SLEEK COMPACT FOOTER FOOTER */}
            <div className="shrink-0 p-6 border-t border-white/10 flex flex-col gap-4">
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-zinc-400">SA</span>
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-zinc-200">Shezan Ahmed</p>
                            <p className="text-[9px] text-zinc-500 uppercase tracking-widest">Lead Product Architect</p>
                        </div>
                    </div>
                    <a href="https://www.linkedin.com/in/shezanahmed29/" target="_blank" rel="noreferrer" className="text-[10px] py-1.5 px-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-all font-bold uppercase tracking-wider">FOLLOW</a>
                </div>

                <button onClick={() => setShowGuide(true)} className="w-full text-xs text-zinc-500 hover:text-white transition-colors text-center">
                    📖 View Documentation & Guide
                </button>
            </div>

            {/* MODALS (Render outside main flow but inside component) */}
            {showGuide && (
                <div className="fixed inset-0 z-[9999] bg-zinc-950/95 backdrop-blur-sm flex items-center justify-center p-6 overflow-y-auto">
                    <div className="max-w-2xl w-full bg-zinc-900 border border-white/10 rounded-2xl p-8 relative">
                        <button onClick={() => setShowGuide(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-white">✕</button>
                        <h2 className="text-2xl font-bold mb-6 text-white uppercase tracking-tighter">Architect's Guide</h2>
                        <div className="space-y-4 text-sm text-zinc-300 leading-relaxed">
                            <p><strong>Bulk Workflow:</strong> Use shorthand tags to architect your narrative at lightspeed.</p>
                            <div className="bg-black/40 p-4 rounded-xl border border-white/5 space-y-2 font-mono text-[11px]">
                                <p className="text-blue-400">/h, s:120/ Global Headline</p>
                                <p className="text-blue-400">/sh, sh_s:60/ Subheading logic </p>
                                <p className="text-zinc-500">Standard body text flows naturally.</p>
                                <p className="text-zinc-600">Double Enter = New Slide</p>
                            </div>
                            <p><strong>Pro Tip:</strong> Click any slide in the preview to enter <strong>Focus Mode</strong> for precise micro-tuning of font sizes and alignment.</p>
                            <p><strong>Nesting Support:</strong> You can now nest markdown: <code>**BOLD __AND UNDERLINED__**</code> works flawlessly.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeftPane;
