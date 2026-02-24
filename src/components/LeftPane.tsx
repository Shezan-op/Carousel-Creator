import React, { useState, useRef, useEffect } from 'react';
import type { CarouselData } from '../types';
import { Sparkles, Code, Settings, ListTree, RotateCcw } from 'lucide-react';

const MAX_SLIDES = 50;

/** Extracts raw JSON from a string that may be wrapped in markdown code fences */
const extractJSON = (raw: string): string => {
    const trimmed = raw.trim();
    // If the response is wrapped in ```json ... ``` or ``` ... ```, extract the inner content
    const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) return fenceMatch[1].trim();
    // Fallback: extract from first { to last }
    const first = trimmed.indexOf('{');
    const last = trimmed.lastIndexOf('}');
    if (first !== -1 && last !== -1 && last > first) return trimmed.slice(first, last + 1);
    return trimmed;
};

/** Strips API keys from error messages to prevent DOM leakage */
const sanitizeError = (msg: string): string => {
    return msg.replace(/sk-or-v1-[a-zA-Z0-9]+/g, 'sk-or-***REDACTED***');
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
    backgroundImage: string | null;
    setBackgroundImage: (val: string | null) => void;
    fontFamily: string;
    setFontFamily: (val: string) => void;
    activeTemplate: string;
    setActiveTemplate: (val: string) => void;
    previewScale: number;
    setPreviewScale: (val: number) => void;
}

const LeftPane: React.FC<Props> = ({
    setCarouselData, openRouterKey, setOpenRouterKey, authorName, setAuthorName, authorHandle, setAuthorHandle, authorAvatar, setAuthorAvatar,
    backgroundImage, setBackgroundImage, fontFamily, setFontFamily, activeTemplate, setActiveTemplate,
    previewScale, setPreviewScale
}) => {
    const [activeTab, setActiveTab] = useState<'auto' | 'json' | 'setup' | 'bulk'>('auto');
    const [jsonInput, setJsonInput] = useState('');
    const [rawInput, setRawInput] = useState('');
    const [bulkText, setBulkText] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // PERF: AbortController ref — cancels in-flight API fetch on unmount or manual reset
    const abortControllerRef = useRef<AbortController | null>(null);

    // PERF: Track the current backgroundImage object URL so we can revoke it before creating a new one
    const backgroundUrlRef = useRef<string | null>(null);

    // Cleanup: abort any pending fetch and revoke any byte URL when component unmounts
    useEffect(() => {
        return () => {
            abortControllerRef.current?.abort();
            if (backgroundUrlRef.current) URL.revokeObjectURL(backgroundUrlRef.current);
        };
    }, []);

    const handleJsonChange = (val: string) => {
        setJsonInput(val);
        try {
            if (val.trim()) {
                const parsed = JSON.parse(extractJSON(val));
                if (parsed.slides?.length > MAX_SLIDES) {
                    parsed.slides = parsed.slides.slice(0, MAX_SLIDES);
                    setError(`Warning: Capped at ${MAX_SLIDES} slides to prevent browser crash.`);
                } else {
                    setError(null);
                }
                setCarouselData(parsed);
            }
        } catch {
            setError('Invalid JSON format');
        }
    };

    const generateCarousel = async () => {
        if (!openRouterKey) {
            setError('Please provide an OpenRouter API key');
            return;
        }
        if (!rawInput.trim()) {
            setError('Please provide some text to generate from');
            return;
        }

        abortControllerRef.current?.abort();
        const controller = new AbortController();
        abortControllerRef.current = controller;

        setIsGenerating(true);
        setError(null);

        try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${openRouterKey}`,
                    'HTTP-Referer': window.location.origin,
                    'X-Title': 'Carousel Creator'
                },
                body: JSON.stringify({
                    model: 'anthropic/claude-3.5-sonnet',
                    response_format: { type: 'json_object' },
                    messages: [
                        {
                            role: 'system',
                            content: `You are an elite, top-1% ghostwriter for LinkedIn and X (Twitter) creators. 
Your job is to take raw, unstructured brain-dumps and convert them into a highly engaging, high-retention carousel JSON object.

COPYWRITING RULES:
1. SLIDE 1 (THE HOOK): Never use generic titles. Extract the most aggressive, contrarian, or high-value claim from the text. 
2. SLIDES 2-N (THE BODY): ONE core idea per slide. Maximum 15 words per slide. Keep it extremely punchy. Use short sentences. 
3. FINAL SLIDE (THE CTA): Always end with a Call To Action (e.g., "Follow for more systems", "Repost to save a life").

THE HIGHLIGHT ENGINE (CRITICAL REQUIREMENT):
The frontend app parses text wrapped in *asterisks* and converts it into massive, high-contrast visual blocks or marker highlights depending on the user's template.
You MUST identify the single most important word, metric, or phrase in EVERY slide and wrap it in asterisks.
- BAD: "People spend 12 hours making slides."
- GOOD: "People spend *12 hours* making slides."
- BAD: "The move you are most scared to make."
- GOOD: "The move you are *most scared* to make."

OUTPUT SCHEMA:
You must output ONLY raw, valid JSON. No markdown wrappers. No conversational text.
{
  "theme": { "background": "#09090B", "text": "#FAFAFA", "accent": "#F59E0B" },
  "slides": [
    { "slide_number": 1, "type": "title", "headline": "The *Punchy* Hook", "subheadline": "Optional context" },
    { "slide_number": 2, "type": "content", "body": "One *core idea* per slide." },
    { "slide_number": 3, "type": "cta", "body": "Follow for more *insights*." }
  ]
}`
                        },
                        {
                            role: 'user',
                            content: rawInput
                        }
                    ]
                })
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error?.message || `API Error: ${response.statusText}`);
            }

            const result = await response.json();
            const content = result.choices[0].message.content;
            const parsed = JSON.parse(extractJSON(content));
            if (parsed.slides?.length > MAX_SLIDES) {
                parsed.slides = parsed.slides.slice(0, MAX_SLIDES);
            }
            setCarouselData(parsed);
            setJsonInput(JSON.stringify(parsed, null, 2));
        } catch (e: unknown) {
            if (e instanceof Error && e.name === 'AbortError') return;
            const raw = e instanceof Error ? e.message : 'Failed to generate carousel';
            setError(sanitizeError(raw));
        } finally {
            setIsGenerating(false);
        }
    };

    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setAuthorAvatar(base64);
                localStorage.setItem('creatorAvatar', base64);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (backgroundUrlRef.current) {
                URL.revokeObjectURL(backgroundUrlRef.current);
            }
            const url = URL.createObjectURL(file);
            backgroundUrlRef.current = url;
            setBackgroundImage(url);
        }
    };

    return (
        <div className="flex flex-col h-full gap-6">

            {/* ── TAB SWITCHER ── */}
            <div className="flex bg-[#18181B] p-1 rounded-xl border border-white/5">
                <button
                    onClick={() => setActiveTab('auto')}
                    className={`flex-1 flex items-center justify-center py-2 px-2 rounded-lg transition-all text-[10px] font-semibold ${activeTab === 'auto' ? 'bg-[#27272A] text-white shadow-sm border border-white/5' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    <Sparkles className="w-3 h-3 mr-1.5" /> Auto
                </button>
                <button
                    onClick={() => setActiveTab('bulk')}
                    className={`flex-1 flex items-center justify-center py-2 px-2 rounded-lg transition-all text-[10px] font-semibold ${activeTab === 'bulk' ? 'bg-[#27272A] text-white shadow-sm border border-white/5' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    <ListTree className="w-3 h-3 mr-1.5" /> Bulk
                </button>
                <button
                    onClick={() => setActiveTab('json')}
                    className={`flex-1 flex items-center justify-center py-2 px-2 rounded-lg transition-all text-[10px] font-semibold ${activeTab === 'json' ? 'bg-[#27272A] text-white shadow-sm border border-white/5' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    <Code className="w-3 h-3 mr-1.5" /> JSON
                </button>
                <button
                    onClick={() => setActiveTab('setup')}
                    className={`flex-1 flex items-center justify-center py-2 px-2 rounded-lg transition-all text-[10px] font-semibold ${activeTab === 'setup' ? 'bg-[#27272A] text-white shadow-sm border border-white/5' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    <Settings className="w-3 h-3 mr-1.5" /> Setup
                </button>
            </div>

            {/* ── TAB CONTENT AREA ── */}
            <div className="flex-1 overflow-y-auto pr-1 no-scrollbar flex flex-col gap-6">

                {/* ─── JSON TAB ─── */}
                {activeTab === 'json' && (
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Paste JSON</label>
                        <textarea
                            className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all text-white h-[300px] font-mono resize-none"
                            placeholder="Paste your generated JSON here..."
                            value={jsonInput}
                            onChange={(e) => handleJsonChange(e.target.value)}
                        />
                    </div>
                )}

                {/* ─── AUTO TAB ─── */}
                {activeTab === 'auto' && (
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">OpenRouter API Key</label>
                                {openRouterKey && <span className="text-[9px] font-bold text-green-500/80 bg-green-500/5 px-2 py-0.5 rounded-full border border-green-500/10">Active</span>}
                            </div>
                            <input
                                type="password"
                                className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all text-white"
                                placeholder="sk-or-v1-..."
                                value={openRouterKey}
                                onChange={(e) => setOpenRouterKey(e.target.value)}
                            />
                            <p className="text-[10px] text-zinc-500">Stored locally in browser. Never sent to our servers.</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Raw Content</label>
                            <textarea
                                className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all text-white h-[200px] resize-none"
                                placeholder="Paste your rough draft, tweet thread, or notes here..."
                                value={rawInput}
                                onChange={(e) => setRawInput(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={generateCarousel}
                            disabled={isGenerating}
                            className="w-full bg-white text-black font-bold rounded-xl px-4 py-3 hover:bg-zinc-200 transition-colors disabled:opacity-50 flex justify-center items-center"
                        >
                            {isGenerating ? 'Generating...' : 'Auto-Generate Carousel'}
                        </button>
                    </div>
                )}

                {/* ─── BULK TAB ─── */}
                {activeTab === 'bulk' && (
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Bulk Slide Import</label>
                            <textarea
                                value={bulkText}
                                onChange={(e) => setBulkText(e.target.value)}
                                placeholder="Enter each slide content on a new line..."
                                rows={12}
                                className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all text-white resize-none placeholder:text-zinc-600 leading-relaxed"
                            />
                            <p className="text-[10px] text-zinc-500 italic">Each line will become one 'Content' slide.</p>
                        </div>
                        <button
                            onClick={() => {
                                const allLines = bulkText.split('\n').filter(l => l.trim());
                                if (allLines.length === 0) {
                                    setError('Please enter some text');
                                    return;
                                }
                                const lines = allLines.slice(0, MAX_SLIDES);
                                const newData: CarouselData = {
                                    theme: { background: '#09090B', text: '#FFFFFF', accent: '#3B82F6' },
                                    slides: lines.map((line, i) => ({
                                        slide_number: i + 1,
                                        type: 'content',
                                        headline: line.length > 40 ? line.substring(0, 40) + '...' : line,
                                        body: line
                                    }))
                                };
                                setCarouselData(newData);
                                setJsonInput(JSON.stringify(newData, null, 2));
                                setError(null);
                            }}
                            className="w-full bg-green-600 text-white font-semibold py-3 rounded-xl flex items-center justify-center transition-all hover:bg-green-500 active:scale-[0.99] shadow-lg shadow-green-900/20"
                        >
                            <ListTree className="w-4 h-4 mr-2" />
                            <span>Quick Convert</span>
                        </button>
                    </div>
                )}

                {/* ─── SETUP TAB (BRANDING & TEMPLATES) ─── */}
                {activeTab === 'setup' && (
                    <div className="flex flex-col gap-4">

                        {/* THE TEMPLATE SELECTOR (Layouts) */}
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Layout Template</label>
                            <div className="grid grid-cols-3 gap-2">
                                {['minimal', 'tweet', 'brutalist'].map((tpl) => (
                                    <button
                                        key={tpl}
                                        onClick={() => setActiveTemplate(tpl)}
                                        className={`py-2 px-3 rounded-lg text-xs font-medium capitalize border transition-all ${activeTemplate === tpl ? 'bg-white text-black border-white' : 'bg-zinc-900 border-white/10 text-zinc-400 hover:bg-zinc-800'}`}
                                    >
                                        {tpl}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* CREATOR PROFILE SECTION */}
                        <div className="pt-6 border-t border-white/5 flex flex-col gap-6">
                            <div className="flex flex-col gap-1">
                                <h3 className="text-xs font-bold text-white uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-md inline-block w-fit">Creator Profile (Saved Locally)</h3>
                                <p className="text-[10px] text-zinc-500 pl-1">Your identity reflects across all templates.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Author Name</label>
                                    <input
                                        type="text"
                                        value={authorName}
                                        onChange={(e) => setAuthorName(e.target.value)}
                                        className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all text-white"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Author Handle</label>
                                    <input
                                        type="text"
                                        value={authorHandle}
                                        onChange={(e) => setAuthorHandle(e.target.value)}
                                        className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all text-white"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Google Font Name</label>
                                <input
                                    type="text"
                                    value={fontFamily}
                                    onChange={(e) => setFontFamily(e.target.value)}
                                    placeholder="e.g., Playfair Display, Space Grotesk"
                                    className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all text-white"
                                />
                            </div>

                            <div className="flex items-center space-x-4 p-4 bg-[#18181B] border border-white/5 rounded-xl">
                                <div className="relative group">
                                    <div className="w-16 h-16 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center overflow-hidden">
                                        {authorAvatar ? <img src={authorAvatar} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900" />}
                                    </div>
                                    <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full">
                                        <span className="text-[8px] font-bold uppercase">Upload</span>
                                        <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                                    </label>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xs font-semibold text-white">Avatar Image</h3>
                                    <p className="text-[10px] text-zinc-500">Persists in local storage.</p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Preview Zoom</label>
                                    <span className="text-[10px] font-mono text-zinc-400">{Math.round(previewScale * 100)}%</span>
                                </div>
                                <input
                                    type="range" min="0.1" max="0.8" step="0.01" value={previewScale}
                                    onChange={(e) => setPreviewScale(parseFloat(e.target.value))}
                                    className="w-full accent-white"
                                />
                            </div>

                            <div className="flex items-center space-x-4 p-4 bg-[#18181B] border border-white/5 rounded-xl">
                                <div className="relative group">
                                    <div className="w-16 h-16 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center overflow-hidden">
                                        {backgroundImage ? <img src={backgroundImage} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900" />}
                                    </div>
                                    <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-lg">
                                        <span className="text-[8px] font-bold uppercase">Upload</span>
                                        <input type="file" accept="image/*" onChange={handleBackgroundUpload} className="hidden" />
                                    </label>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xs font-semibold text-white">Background Texture</h3>
                                    <p className="text-[10px] text-zinc-500">Overlays entire carousel slides.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── CURATED PALETTES — visible on ALL tabs ── */}
                <div className="flex flex-col gap-3 pt-4 border-t border-white/5">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Curated Palettes</label>
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { name: 'Minimal', background: '#09090B', text: '#FFFFFF', accent: '#3B82F6' },
                            { name: 'Cyberpunk', background: '#000000', text: '#FFFFFF', accent: '#39FF14' },
                            { name: 'Brutalist', background: '#FF3366', text: '#000000', accent: '#000000' },
                            { name: 'Midnight', background: '#0F172A', text: '#F8FAFC', accent: '#F59E0B' },
                            { name: 'Solarized', background: '#FDF6E3', text: '#073642', accent: '#268BD2' },
                            { name: 'Nord', background: '#2E3440', text: '#ECEFF4', accent: '#88C0D0' },
                            { name: 'Dracula', background: '#282A36', text: '#F8F8F2', accent: '#BD93F9' },
                            { name: 'Forest', background: '#064E3B', text: '#ECFDF5', accent: '#10B981' },
                            { name: 'Royal', background: '#1E1B4B', text: '#EEF2FF', accent: '#818CF8' }
                        ].map((p) => (
                            <button
                                key={p.name}
                                onClick={() => {
                                    setCarouselData(prev => prev ? { ...prev, theme: { ...p } } : {
                                        theme: { ...p },
                                        slides: [{ slide_number: 1, type: 'title', headline: 'New Design' }]
                                    });
                                }}
                                className="flex flex-col items-center justify-center bg-[#18181B] border border-white/5 p-2 rounded-lg hover:bg-[#27272A] transition-all group active:scale-[0.98]"
                            >
                                <div className="flex -space-x-1 mb-2">
                                    <div className="w-4 h-4 rounded-full border border-white/10 shadow-sm" style={{ backgroundColor: p.background }} />
                                    <div className="w-4 h-4 rounded-full border border-white/10 shadow-sm" style={{ backgroundColor: p.accent }} />
                                </div>
                                <span className="text-[8px] font-bold uppercase tracking-tighter text-zinc-500 group-hover:text-zinc-200">{p.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

            </div>

            {/* ── EMERGENCY RESET BUTTON ── */}
            <button
                onClick={() => {
                    setCarouselData(null);
                    setJsonInput('');
                    setRawInput('');
                    setBulkText('');
                    setError(null);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-white/5 bg-zinc-900/50 text-zinc-500 hover:text-red-400 hover:border-red-500/20 hover:bg-red-500/5 transition-all text-[10px] font-bold uppercase tracking-widest shrink-0"
            >
                <RotateCcw className="w-3 h-3" />
                Reset Canvas
            </button>

            {/* ── ERROR BANNER ── */}
            {error && (
                <div className="bg-red-500/5 border border-red-500/20 text-red-400 p-4 rounded-lg text-[11px] font-medium flex items-center shrink-0">
                    <div className="w-1 h-1 rounded-full bg-red-400 mr-3 shrink-0" />
                    {error}
                </div>
            )}
        </div>
    );
};

export default LeftPane;
