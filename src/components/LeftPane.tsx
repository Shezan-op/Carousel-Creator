import React, { useState, useEffect, useCallback } from 'react';
import type { CarouselData, Slide, BrandPreset, SavedProject } from '../types';
import {
    Sparkles, Code, Settings, ListTree, RotateCcw,
    Trash2, Loader2, Heart, Palette, Type, Layout, User,
    Zap, Image as ImageIcon, CheckCircle2, Upload
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
    headingFont: string;
    setHeadingFont: (val: string) => void;
    subheadingFont: string;
    setSubheadingFont: (val: string) => void;
    bodyFont: string;
    setBodyFont: (val: string) => void;
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
    showSafeZones: boolean;
    setShowSafeZones: (val: boolean) => void;
    showSlideNumbers: boolean;
    setShowSlideNumbers: (val: boolean) => void;
    setInlineImages: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    carouselData: CarouselData | null;
    brandPresets: BrandPreset[];
    setBrandPresets: React.Dispatch<React.SetStateAction<BrandPreset[]>>;
    savedProjects: SavedProject[];
    setSavedProjects: React.Dispatch<React.SetStateAction<SavedProject[]>>;
    inlineImages: Record<string, string>;
    creatorAvatar: string | null;
    setCreatorAvatar: (val: string | null) => void;
    progressBar: 'none' | 'top' | 'bottom';
    setProgressBar: (val: 'none' | 'top' | 'bottom') => void;
    sandboxMode: 'none' | 'linkedin' | 'instagram';
    setSandboxMode: (val: 'none' | 'linkedin' | 'instagram') => void;
    aspectRatio: 'portrait' | 'square';
    setAspectRatio: (val: 'portrait' | 'square') => void;
    brandWatermark: string | null;
    setBrandWatermark: (val: string | null) => void;
}

const LeftPane: React.FC<Props> = (props) => {
    const {
        setCarouselData, openRouterKey, setOpenRouterKey, authorName, setAuthorName, authorHandle, setAuthorHandle,
        authorAvatar, setAuthorAvatar, headingFont, setHeadingFont, subheadingFont, setSubheadingFont,
        bodyFont, setBodyFont, activeTemplate, setActiveTemplate,
        previewScale, setPreviewScale, customTheme, applyCustomTheme, showProfile, setShowProfile,
        footerLayout, setFooterLayout, textAlign, setTextAlign,
        noiseOpacity, setNoiseOpacity, customBgImage, setCustomBgImage,
        bulkText, setBulkText, compileBulkText,
        showSafeZones, setShowSafeZones, showSlideNumbers, setShowSlideNumbers,
        setInlineImages, carouselData,
        brandPresets, setBrandPresets, savedProjects, setSavedProjects,
        inlineImages, creatorAvatar, setCreatorAvatar,
        progressBar, setProgressBar, sandboxMode, setSandboxMode,
        aspectRatio, setAspectRatio, brandWatermark, setBrandWatermark
    } = props;

    // 1-Click Theme Invert Handler: Dark/Light switch
    const handleInvertTheme = () => {
        const currentBg = carouselData?.theme.background || customTheme.background;
        const currentText = carouselData?.theme.text || customTheme.text;

        applyCustomTheme('background', currentText);
        applyCustomTheme('text', currentBg);

        // Persistent update for custom themes
        localStorage.setItem('custom_background', currentText);
        localStorage.setItem('custom_text', currentBg);
    };

    // Global Brand Watermark Handler: Upload and compression
    const handleWatermarkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 300; // Efficient watermark size
                const scale = MAX_WIDTH / img.width;
                canvas.width = MAX_WIDTH;
                canvas.height = img.height * scale;

                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

                const compressed = canvas.toDataURL('image/webp', 0.8);
                setBrandWatermark(compressed);
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    const [isDragging, setIsDragging] = useState(false);
    const [activeTab, setActiveTab] = useState<'auto' | 'bulk' | 'json' | 'setup'>('bulk');
    const [jsonInput, setJsonInput] = useState('');
    const [rawInput, setRawInput] = useState('');
    // bulkText is now a prop
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiModel, setAiModel] = useState<'free' | 'pro'>('free');
    const [error, setError] = useState<string | null>(null);
    const [showGuide, setShowGuide] = useState(false);

    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    const bulkTextRef = React.useRef(bulkText);
    useEffect(() => { bulkTextRef.current = bulkText; }, [bulkText]);

    // Phase 2: Time-Travel Engine
    const [history, setHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState<number>(-1);
    const [editorMode, setEditorMode] = useState<'raw' | 'visual'>('raw');

    const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 800;
                    const scaleSize = MAX_WIDTH / img.width;
                    canvas.width = MAX_WIDTH;
                    canvas.height = img.height * scaleSize;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

                    const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
                    const imgId = 'img_' + Math.random().toString(36).substring(2, 9);

                    setInlineImages((prev: Record<string, string>) => ({ ...prev, [imgId]: compressedBase64 }));
                };
                img.src = event.target?.result as string;
            };
            reader.readAsDataURL(file);
        });
    };

    const deleteGalleryImage = (id: string) => {
        setInlineImages((prev: Record<string, string>) => {
            const next = { ...prev };
            delete next[id];
            return next;
        });
    };

    // Debounced History Saver
    useEffect(() => {
        const timer = setTimeout(() => {
            if (bulkText && (historyIndex === -1 || bulkText !== history[historyIndex])) {
                const newHistory = history.slice(0, historyIndex + 1);
                newHistory.push(bulkText);
                if (newHistory.length > 50) newHistory.shift();
                setHistory(newHistory);
                setHistoryIndex(newHistory.length - 1);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [bulkText, history, historyIndex]);

    const handleUndo = useCallback(() => {
        if (historyIndex > 0) {
            const prevText = history[historyIndex - 1];
            setHistoryIndex(historyIndex - 1);
            setBulkText(prevText);
            compileBulkText(prevText);
        }
    }, [history, historyIndex, setBulkText, compileBulkText]);

    const handleRedo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            const nextText = history[historyIndex + 1];
            setHistoryIndex(historyIndex + 1);
            setBulkText(nextText);
            compileBulkText(nextText);
        }
    }, [history, historyIndex, setBulkText, compileBulkText]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const isZ = e.key.toLowerCase() === 'z';
            const isY = e.key.toLowerCase() === 'y';
            const ctrlOrMeta = e.ctrlKey || e.metaKey;

            if (ctrlOrMeta && isZ) {
                if (e.shiftKey) {
                    e.preventDefault();
                    handleRedo();
                } else {
                    e.preventDefault();
                    handleUndo();
                }
            }
            if (ctrlOrMeta && isY) {
                e.preventDefault();
                handleRedo();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleUndo, handleRedo]);

    // Reverse Compiler
    const reverseCompileSlidesToText = (slides: Slide[]) => {
        const newBulkText = slides.map(slide => {
            let slideText = '';

            const buildConfig = () => {
                const config = [];
                if (slide.heading_size) config.push(`s: ${slide.heading_size}`);
                if (slide.subheading_size) config.push(`sh_s: ${slide.subheading_size}`);
                if (slide.body_size) config.push(`b_s: ${slide.body_size}`);
                if (slide.text_align) config.push(`a: ${slide.text_align}`);
                if (slide.y_offset) config.push(`y: ${slide.y_offset}`);
                if (slide.bg_image) config.push(`bg: ${slide.bg_image}`);
                return config.length > 0 ? `, ${config.join(', ')}` : '';
            };

            const configStr = buildConfig();

            if (slide.headline) {
                slideText += `/h${configStr}/ ${slide.headline}\n`;
            } else if (configStr) {
                slideText += `/config${configStr}/\n`;
            }

            if (slide.subheadline) slideText += `/sh/ ${slide.subheadline}\n`;
            if (slide.subheading) slideText += `/sh/ ${slide.subheading}\n`;
            if (slide.body) slideText += `${slide.body}\n`;

            return slideText.trim();
        }).join('\n\n');

        setBulkText(newBulkText);
    };

    const handleThemeChange = (key: 'background' | 'text' | 'accent', value: string) => {
        setCarouselData(prev => {
            if (!prev) return prev;
            const newTheme = { ...prev.theme, [key]: value };
            // Persist to localStorage so it survives reloads
            localStorage.setItem(`custom_${key}`, value);
            return { ...prev, theme: newTheme };
        });
        // Keep customTheme synchronized in parent
        applyCustomTheme(key, value);
    };

    const handleImageDrop = useCallback(async (e: React.DragEvent<HTMLTextAreaElement>) => {
        const files = Array.from(e.dataTransfer.files);
        const imageFiles = files.filter(f => f.type.startsWith('image/'));

        if (imageFiles.length === 0) return;

        // Use the ref to get the absolute latest text without triggering re-renders of the effect
        let currentText = bulkTextRef.current;
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        let insertionOffset = 0;

        for (const file of imageFiles) {
            try {
                const id = Math.random().toString(36).substring(2, 9);
                const compressed = await compressImage(file, 1080);

                setInlineImages(prev => ({ ...prev, [id]: compressed }));

                const tag = `\n[img:${id}]\n`;
                currentText = currentText.substring(0, start + insertionOffset) + tag + currentText.substring(end + insertionOffset);
                insertionOffset += tag.length;
            } catch {
                setError('Failed to process image');
            }
        }

        setBulkText(currentText);
        // Small delay to ensure state is flushed before compile
        setTimeout(() => compileBulkText(currentText), 10);
    }, [setInlineImages, setBulkText, compileBulkText]);

    // native drag and drop listeners
    useEffect(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const handleDragOver = (e: DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(true);
        };

        const handleDragLeave = (e: DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);
        };

        const handleDropLocal = (e: DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);

            // Re-use the existing async logic, but pass the event
            handleImageDrop(e as unknown as React.DragEvent<HTMLTextAreaElement>);
        };

        textarea.addEventListener('dragover', handleDragOver);
        textarea.addEventListener('dragleave', handleDragLeave);
        textarea.addEventListener('drop', handleDropLocal);

        return () => {
            textarea.removeEventListener('dragover', handleDragOver);
            textarea.removeEventListener('dragleave', handleDragLeave);
            textarea.removeEventListener('drop', handleDropLocal);
        };
    }, [activeTab, handleImageDrop]);

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

    const handleAutoFormat = () => {
        if (!bulkText.trim()) return;

        // 1. Clean the text (remove existing double breaks to reset formatting)
        const cleanText = bulkText.replace(/\n\s*\n/g, ' ').replace(/\s+/g, ' ').trim();

        // 2. Split into sentences (basic regex for punctuation)
        const sentences = cleanText.match(/[^.!?]+[.!?]*/g) || [cleanText];

        const maxWordsPerSlide = 25;
        const newSlides: string[] = [];
        let currentSlide = "";
        let currentWordCount = 0;

        sentences.forEach((sentence) => {
            const sentenceWordCount = sentence.trim().split(/\s+/).length;

            // If adding this sentence pushes us over the limit, save the current slide and start a new one
            if (currentWordCount + sentenceWordCount > maxWordsPerSlide && currentWordCount > 0) {
                newSlides.push(currentSlide.trim());
                currentSlide = sentence + " ";
                currentWordCount = sentenceWordCount;
            } else {
                currentSlide += sentence + " ";
                currentWordCount += sentenceWordCount;
            }
        });

        // Push the last remaining slide
        if (currentSlide.trim()) {
            newSlides.push(currentSlide.trim());
        }

        // 3. Format the slides with our Bulk Syntax
        const formattedText = newSlides.map((slideText, index) => {
            if (index === 0) {
                return `/h/ ${slideText}`; // Force the first chunk to be a headline
            }
            return slideText; // The rest is standard body text
        }).join('\n\n');

        // 4. Update the state and trigger the compiler
        setBulkText(formattedText);
        compileBulkText(formattedText);
    };

    const handleSaveBrandPreset = () => {
        if (!carouselData) return;
        const name = prompt("Enter a name for this Brand Preset (e.g., 'Client A'):");
        if (!name) return;

        const newPreset: BrandPreset = {
            id: Date.now().toString(),
            name,
            theme: carouselData.theme,
            fonts: { heading: headingFont, subheading: subheadingFont, body: bodyFont },
            author: { name: authorName, handle: authorHandle, avatar: creatorAvatar || '' }
        };
        setBrandPresets(prev => [newPreset, ...prev]);
    };

    const handleLoadBrandPreset = (preset: BrandPreset) => {
        setCarouselData(prev => prev ? { ...prev, theme: preset.theme } : null);
        setHeadingFont(preset.fonts.heading);
        setSubheadingFont(preset.fonts.subheading);
        setBodyFont(preset.fonts.body);
        setAuthorName(preset.author.name);
        setAuthorHandle(preset.author.handle);
        setCreatorAvatar(preset.author.avatar);

        // Ensure localStorage is updated for the individual items so they persist on refresh
        localStorage.setItem('custom_background', preset.theme.background);
        localStorage.setItem('custom_text', preset.theme.text);
        localStorage.setItem('custom_accent', preset.theme.accent);
        localStorage.setItem('heading_font', preset.fonts.heading);
        localStorage.setItem('subheading_font', preset.fonts.subheading);
        localStorage.setItem('body_font', preset.fonts.body);
        localStorage.setItem('authorName', preset.author.name);
        localStorage.setItem('authorHandle', preset.author.handle);
        if (preset.author.avatar) localStorage.setItem('creatorAvatar', preset.author.avatar);
    };

    const handleSaveProject = () => {
        if (!carouselData) return;
        const name = prompt("Enter a name for this Project:");
        if (!name) return;

        const newProject: SavedProject = {
            id: Date.now().toString(),
            name,
            date: new Date().toLocaleDateString(),
            bulkText: bulkText,
            theme: carouselData.theme,
            inlineImages: inlineImages
        };
        setSavedProjects(prev => [newProject, ...prev]);
    };

    const handleLoadProject = (project: SavedProject) => {
        if (confirm(`Load project "${project.name}"? Unsaved changes in your current editor will be lost.`)) {
            setBulkText(project.bulkText);
            setCarouselData(prev => prev ? { ...prev, theme: project.theme } : { theme: project.theme, slides: [] });
            setInlineImages(project.inlineImages);
            // Force the compiler to run on the loaded text
            compileBulkText(project.bulkText);
        }
    };

    const exportProjectFile = () => {
        const projectData = {
            version: "1.0",
            bulkText,
            theme: carouselData?.theme,
            inlineImages
        };
        const blob = new Blob([JSON.stringify(projectData)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `project-${new Date().toISOString().split('T')[0]}.carousel`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const importProjectFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target?.result as string);
                if (data.bulkText && data.theme) {
                    setBulkText(data.bulkText);
                    setCarouselData(prev => ({ ...prev!, slides: prev?.slides || [], theme: data.theme }));
                    if (data.inlineImages) setInlineImages(data.inlineImages);
                    alert("Project loaded successfully!");
                } else {
                    alert("Invalid .carousel file.");
                }
            } catch {
                alert("Failed to parse file.");
            }
        };
        reader.readAsText(file);
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
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black active:scale-[0.98] transition-all duration-200 uppercase tracking-widest ${activeTab === tab.id ? 'bg-white text-black shadow-2xl scale-[1.02] border border-white/10' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            <tab.icon size={12} strokeWidth={3} />
                            <span className="hidden lg:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {activeTab === 'auto' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-6">
                        <div className="p-6 space-y-6 bg-gradient-to-b from-zinc-900 to-zinc-950 rounded-[24px] border border-white/5 shadow-sm">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-2">
                                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">Manifestation Prompt</label>
                                    <button onClick={() => setRawInput('')} className="bg-zinc-800 hover:bg-red-500/20 text-zinc-300 hover:text-red-400 border border-white/10 px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1 active:scale-[0.98]">
                                        <Trash2 size={10} /> Clear
                                    </button>
                                </div>
                                <textarea
                                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all resize-none relative z-10 box-border"
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
                                        className={`py-3 text-[9px] font-black active:scale-[0.98] uppercase rounded-xl transition-all ${aiModel === 'free' ? 'bg-zinc-800 text-white shadow-lg border border-white/5' : 'text-zinc-600 hover:text-zinc-400'}`}
                                    >
                                        Trinity (Free)
                                    </button>
                                    <button
                                        onClick={() => setAiModel('pro')}
                                        className={`py-3 text-[9px] font-black active:scale-[0.98] uppercase rounded-xl transition-all ${aiModel === 'pro' ? 'bg-zinc-800 text-blue-400 shadow-lg border border-white/5' : 'text-zinc-600 hover:text-zinc-400'}`}
                                    >
                                        Claude 3.5 (Pro)
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] ml-2">OpenRouter API Key</label>
                                <input
                                    type="password"
                                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all text-white"
                                    placeholder="sk-or-v1-..."
                                    value={openRouterKey}
                                    onChange={(e) => setOpenRouterKey(e.target.value)}
                                />
                            </div>
                            <button
                                onClick={generateNarrative}
                                disabled={isGenerating}
                                className="w-full py-5 bg-white text-black active:scale-[0.98] transition-all duration-200 shadow-md border border-white/10 rounded-[24px] font-black text-xs uppercase tracking-[0.3em] hover:bg-zinc-200 flex items-center justify-center gap-3"
                            >
                                {isGenerating ? <Loader2 className="animate-spin" size={16} /> : <Zap size={14} fill="currentColor" />}
                                {isGenerating ? 'ARCHITECTING...' : 'MANIFEST NARRATIVE'}
                            </button>
                        </div>
                    </div>
                )}
                {activeTab === 'bulk' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-6">
                        <div className="p-6 space-y-6 bg-gradient-to-b from-zinc-900 to-zinc-950 rounded-[24px] border border-white/5 shadow-sm">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-2">
                                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">Bulk Content Engine</label>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setBulkText("/h, s: 120, a: center/ **SaaS Builder** Guide\n/sh/ How to go from 0 to _10k MRR_ in 90 days\n\n/h/ The *Hard* Truth\nBuilding is the easy part. \nDistribution is where most founders fail.\nYou need a system, not just a product.\n\n/sh, sh_s: 60, a: right/ Why Carousels?\n/body, b_s: 40/ 1. High engagement\n2. Easy to digest\n3. Perfect for **educational** content.\n\n/h, s: 90, a: center/ Want the **Blueprint**?\n/sh/ I'm launching the full guide next week.\nFollow for the _early access_ link.")}
                                            className="bg-zinc-800 hover:bg-zinc-700 active:scale-[0.98] text-zinc-400 border border-white/5 px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all"
                                        >
                                            Example
                                        </button>
                                        <button
                                            onClick={handleAutoFormat}
                                            className="bg-purple-600/20 hover:bg-purple-600/40 active:scale-[0.98] text-purple-400 border border-purple-500/30 px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1"
                                            title="Automatically split long text into slides"
                                        >
                                            <span>✨ Auto-Split</span>
                                        </button>
                                        <button onClick={() => { setBulkText(''); setCarouselData(null); }} className="bg-zinc-800 hover:bg-red-500/20 active:scale-[0.98] text-zinc-300 hover:text-red-400 border border-white/10 px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1">
                                            Clear
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mb-2">
                                    {/* View Toggle */}
                                    <div className="flex items-center bg-zinc-950 border border-white/5 rounded-lg p-1 mb-2 w-full lg:w-48 shadow-inner">
                                        <button
                                            onClick={() => setEditorMode('raw')}
                                            className={`flex-1 py-1.5 text-[10px] font-black active:scale-[0.98] uppercase tracking-widest rounded-md transition-all ${editorMode === 'raw' ? 'bg-zinc-800 text-white shadow-xl border border-white/5' : 'text-zinc-500 hover:text-white'}`}
                                        >
                                            Raw
                                        </button>
                                        <button
                                            onClick={() => setEditorMode('visual')}
                                            className={`flex-1 py-1.5 text-[10px] font-black active:scale-[0.98] uppercase tracking-widest rounded-md transition-all ${editorMode === 'visual' ? 'bg-zinc-800 text-white shadow-xl border border-white/5' : 'text-zinc-500 hover:text-white'}`}
                                        >
                                            Visual
                                        </button>
                                    </div>

                                    {/* Markdown Formatting Toolbar */}
                                    {editorMode === 'raw' && (
                                        <div className="flex items-center gap-1 bg-zinc-950 border border-white/5 rounded-md p-1 mb-2 shadow-inner">
                                            <button onClick={() => applyFormatting('**', '**')} className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 rounded font-bold transition-colors" title="Bold (**)">&nbsp;B&nbsp;</button>
                                            <button onClick={() => applyFormatting('_', '_')} className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 rounded italic transition-colors" title="Italic (_)">I</button>
                                            <button onClick={() => applyFormatting('__', '__')} className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 rounded underline transition-colors" title="Underline (__)">U</button>
                                            <button onClick={() => applyFormatting('*', '*')} className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors" title="Highlight (*)">🖍️</button>
                                            <div className="w-px h-4 bg-white/10 mx-1" />
                                            <button onClick={handleUndo} disabled={historyIndex <= 0} className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 rounded disabled:opacity-30" title="Undo (Ctrl+Z)"><RotateCcw size={12} /></button>
                                        </div>
                                    )}
                                </div>

                                {editorMode === 'raw' ? (
                                    <div className="relative group/textarea">
                                        <textarea
                                            ref={textareaRef}
                                            id="bulk-textarea"
                                            value={bulkText}
                                            onChange={(e) => { setBulkText(e.target.value); compileBulkText(e.target.value); }}
                                            placeholder={`/h/ My Headline\n/sh/ My Subheading\nBody text goes here\n\n/h/ Slide 2 Headline\nMore body text`}
                                            rows={14}
                                            className={`w-full bg-zinc-900/50 border ${isDragging ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-zinc-800 shadow-inner'} rounded-xl p-4 text-sm text-zinc-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all resize-none relative z-10 box-border`}
                                        />
                                        {/* UPDATE PREVIEW BUTTON */}
                                        <div className="mt-4 flex flex-col gap-2">
                                            <button
                                                onClick={() => compileBulkText(bulkText)}
                                                className="w-full py-4 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] transition-all duration-200 shadow-md border border-white/10 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-2"
                                            >
                                                <Zap size={14} fill="currentColor" />
                                                <span>Update Preview</span>
                                            </button>
                                            <p className="text-[10px] text-zinc-500 text-center">
                                                Tip: Use double line-breaks to instantly create new slides.
                                            </p>
                                        </div>
                                        {isDragging && (
                                            <div className="absolute inset-0 z-20 bg-blue-500/10 backdrop-blur-[2px] rounded-xl flex items-center justify-center pointer-events-none border-2 border-dashed border-blue-500/50">
                                                <div className="bg-zinc-900 px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 border border-blue-500/30">
                                                    <ImageIcon size={14} className="text-blue-400" />
                                                    <span className="text-xs font-bold text-blue-400 tracking-widest uppercase">Injecting Image</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                                        {carouselData && carouselData.slides.map((slide, index) => (
                                            <div key={index} className="bg-zinc-900/50 border border-white/10 rounded-xl p-4 flex flex-col gap-3 group relative">
                                                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Slide {index + 1}</span>
                                                    <button
                                                        onClick={() => {
                                                            const newSlides = carouselData.slides.filter((_, i) => i !== index);
                                                            const newData = { ...carouselData, slides: newSlides };
                                                            setCarouselData(newData);
                                                            reverseCompileSlidesToText(newSlides);
                                                        }}
                                                        className="text-red-500/50 hover:text-red-400 text-[10px] font-bold uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>

                                                {/* Headline Input */}
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-tighter">Headline</label>
                                                    <input
                                                        type="text"
                                                        value={slide.headline || ''}
                                                        onChange={(e) => {
                                                            const newSlides = [...carouselData.slides];
                                                            newSlides[index] = { ...newSlides[index], headline: e.target.value };
                                                            setCarouselData({ ...carouselData, slides: newSlides });
                                                            reverseCompileSlidesToText(newSlides);
                                                        }}
                                                        className="w-full bg-black/40 border border-white/5 rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                                        placeholder="e.g. The Ultimate Hook"
                                                    />
                                                </div>

                                                {/* Subheadline/Subheading Input */}
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-tighter">{index === 0 ? 'Subheadline' : 'Subheading'}</label>
                                                    <input
                                                        type="text"
                                                        value={index === 0 ? (slide.subheadline || '') : (slide.subheading || '')}
                                                        onChange={(e) => {
                                                            const newSlides = [...carouselData.slides];
                                                            if (index === 0) newSlides[index] = { ...newSlides[index], subheadline: e.target.value };
                                                            else newSlides[index] = { ...newSlides[index], subheading: e.target.value };
                                                            setCarouselData({ ...carouselData, slides: newSlides });
                                                            reverseCompileSlidesToText(newSlides);
                                                        }}
                                                        className="w-full bg-black/40 border border-white/5 rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                                    />
                                                </div>

                                                {/* Body Textarea */}
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-tighter">Body Content (Max 500 chars)</label>
                                                    <textarea
                                                        maxLength={500}
                                                        rows={3}
                                                        value={slide.body || ''}
                                                        onChange={(e) => {
                                                            const newSlides = [...carouselData.slides];
                                                            newSlides[index] = { ...newSlides[index], body: e.target.value };
                                                            setCarouselData({ ...carouselData, slides: newSlides });
                                                            reverseCompileSlidesToText(newSlides);
                                                        }}
                                                        className="w-full bg-black/40 border border-white/5 rounded-lg p-2.5 text-sm text-zinc-300 focus:ring-1 focus:ring-blue-500 outline-none resize-none custom-scrollbar transition-all"
                                                    />
                                                </div>
                                            </div>
                                        ))}

                                        <button
                                            onClick={() => {
                                                const baseSlides = carouselData?.slides || [];
                                                const newSlides = [...baseSlides, { slide_number: baseSlides.length + 1, type: 'content' as const }];
                                                if (carouselData) {
                                                    setCarouselData({ ...carouselData, slides: newSlides });
                                                } else {
                                                    setCarouselData({ theme: customTheme, slides: newSlides });
                                                }
                                                reverseCompileSlidesToText(newSlides);
                                            }}
                                            className="w-full py-4 border-2 border-dashed border-white/5 bg-white/[0.01] rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:border-white/20 hover:text-white hover:bg-white/[0.03] transition-all"
                                        >
                                            + Add New Slide
                                        </button>
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                )}

                {activeTab === 'json' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-6">
                        <div className="p-6 space-y-6 bg-gradient-to-b from-zinc-900 to-zinc-950 rounded-[24px] border border-white/5 shadow-sm">
                            <div className="flex justify-between items-center px-4">
                                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">Raw JSON State</label>
                                <button onClick={() => setJsonInput('')} className="bg-zinc-800 hover:bg-red-500/20 active:scale-[0.98] text-zinc-300 hover:text-red-400 border border-white/10 px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1">
                                    <Trash2 size={10} /> Clear
                                </button>
                            </div>
                            <textarea
                                value={jsonInput}
                                onChange={(e) => setJsonInput(e.target.value)}
                                rows={20}
                                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all resize-none relative z-10 box-border font-mono shadow-inner"
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
                                    className="flex-1 py-4 bg-zinc-800 text-white rounded-2xl font-black text-[10px] active:scale-[0.98] uppercase tracking-widest hover:bg-zinc-700 transition-all border border-white/5 shadow-md"
                                >
                                    SYNCHRONIZE STATE
                                </button>
                                <button onClick={() => { navigator.clipboard.writeText(jsonInput); }} className="p-4 bg-zinc-900 rounded-2xl hover:bg-zinc-800 active:scale-[0.98] text-zinc-500 hover:text-white transition-all shadow-lg border border-white/5">
                                    <Heart size={16} fill={jsonInput ? 'white' : 'transparent'} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'setup' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-4 pb-24">

                        {/* 1. CREATOR PROFILE */}
                        <details className="group border border-white/5 bg-gradient-to-b from-zinc-900 to-zinc-950 rounded-xl overflow-hidden shadow-sm">
                            <summary className="flex items-center justify-between p-4 cursor-pointer select-none hover:bg-zinc-800/50 transition-colors">
                                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2"><User size={12} /> Creator Manuscript</span>
                                <span className="text-zinc-500 group-open:rotate-180 transition-transform duration-200 text-[10px]">▼</span>
                            </summary>
                            <div className="p-6 space-y-6 border-t border-white/5 bg-zinc-950/20">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[9px] uppercase font-bold text-zinc-600 tracking-widest pl-1">Name</label>
                                        <input className="w-full bg-black/40 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all" value={authorName} onChange={(e) => setAuthorName(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] uppercase font-bold text-zinc-600 tracking-widest pl-1">Handle / ID</label>
                                        <input className="w-full bg-black/40 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all" value={authorHandle} onChange={(e) => setAuthorHandle(e.target.value)} />
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
                                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-[0.98] ${showProfile ? 'bg-blue-600 border border-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'bg-zinc-900 text-zinc-600 border border-white/5'}`}
                                        >
                                            <CheckCircle2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                {/* UX OVERLAY TOGGLES */}
                                <div className="flex flex-col gap-3 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-zinc-400">Show IG/LinkedIn Safe Zones</span>
                                        <button onClick={() => setShowSafeZones(!showSafeZones)} className={`w-10 h-5 rounded-full transition-colors relative flex items-center px-1 ${showSafeZones ? 'bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.3)]' : 'bg-zinc-700'}`}>
                                            <div className={`w-3 h-3 rounded-full bg-white transition-transform ${showSafeZones ? 'translate-x-5' : 'translate-x-0'}`} />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-zinc-400">Show Slide Counters (1/8)</span>
                                        <button onClick={() => setShowSlideNumbers(!showSlideNumbers)} className={`w-10 h-5 rounded-full transition-colors relative flex items-center px-1 ${showSlideNumbers ? 'bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.3)]' : 'bg-zinc-700'}`}>
                                            <div className={`w-3 h-3 rounded-full bg-white transition-transform ${showSlideNumbers ? 'translate-x-5' : 'translate-x-0'}`} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </details>

                        <details className="group border border-white/5 bg-gradient-to-b from-zinc-900 to-zinc-950 rounded-xl overflow-hidden shadow-sm" open>
                            <summary className="flex items-center justify-between p-4 cursor-pointer select-none hover:bg-zinc-800/50 transition-colors">
                                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2"><Palette size={12} /> 🎨 Brand Palette</span>
                                <span className="text-zinc-500 group-open:rotate-180 transition-transform duration-200 text-[10px]">▼</span>
                            </summary>
                            <div className="p-6 space-y-6 border-t border-white/5 bg-zinc-950/20">
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {palettes.map(p => (
                                        <button
                                            key={p.name}
                                            onClick={() => {
                                                applyCustomTheme('background', p.bg);
                                                applyCustomTheme('text', p.text);
                                                applyCustomTheme('accent', p.accent);
                                            }}
                                            className="group/pal relative px-3 py-2 rounded-xl border border-white/5 bg-zinc-900/50 hover:bg-zinc-800 hover:border-white/15 text-[9px] font-black uppercase tracking-widest flex items-center gap-2.5 transition-all active:scale-[0.98]"
                                        >
                                            <div className="flex -space-x-0.5">
                                                <div className="w-3 h-3 rounded-full border border-black/30 shadow-sm" style={{ background: p.bg }} />
                                                <div className="w-3 h-3 rounded-full border border-black/30 shadow-sm" style={{ background: p.text }} />
                                                <div className="w-3 h-3 rounded-full border border-black/30 shadow-sm" style={{ background: p.accent }} />
                                            </div>
                                            <span className="text-zinc-400 group-hover/pal:text-white transition-colors">{p.name}</span>
                                        </button>
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest text-center">BG</p>
                                        <div className="flex items-center gap-2 bg-black/60 border border-zinc-800 rounded-xl p-2 w-full transition-colors focus-within:border-blue-500/50">
                                            <div className="w-6 h-6 rounded-full border border-black/50 shrink-0 shadow-inner" style={{ background: carouselData?.theme.background || customTheme.background }} />
                                            <input
                                                type="text"
                                                value={carouselData?.theme.background || customTheme.background}
                                                onChange={(e) => handleThemeChange('background', e.target.value)}
                                                className="bg-transparent text-[10px] font-mono text-zinc-300 w-full outline-none uppercase"
                                                placeholder="#HEX"
                                                maxLength={7}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest text-center">TEXT</p>
                                        <div className="flex items-center gap-2 bg-black/60 border border-zinc-800 rounded-xl p-2 w-full transition-colors focus-within:border-blue-500/50">
                                            <div className="w-6 h-6 rounded-full border border-black/50 shrink-0 shadow-inner" style={{ background: carouselData?.theme.text || customTheme.text }} />
                                            <input
                                                type="text"
                                                value={carouselData?.theme.text || customTheme.text}
                                                onChange={(e) => handleThemeChange('text', e.target.value)}
                                                className="bg-transparent text-[10px] font-mono text-zinc-300 w-full outline-none uppercase"
                                                placeholder="#HEX"
                                                maxLength={7}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest text-center">ACCENT</p>
                                        <div className="flex items-center gap-2 bg-black/60 border border-zinc-800 rounded-xl p-2 w-full transition-colors focus-within:border-blue-500/50">
                                            <div className="w-6 h-6 rounded-full border border-black/50 shrink-0 shadow-inner" style={{ background: carouselData?.theme.accent || customTheme.accent }} />
                                            <input
                                                type="text"
                                                value={carouselData?.theme.accent || customTheme.accent}
                                                onChange={(e) => handleThemeChange('accent', e.target.value)}
                                                className="bg-transparent text-[10px] font-mono text-zinc-300 w-full outline-none uppercase"
                                                placeholder="#HEX"
                                                maxLength={7}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* 1-CLICK THEME INVERT */}
                                <button
                                    onClick={handleInvertTheme}
                                    className="w-full py-4 bg-zinc-900 border border-white/5 hover:border-blue-500/30 rounded-2xl flex items-center justify-center gap-3 transition-all group active:scale-[0.98] shadow-xl"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white to-zinc-400 flex items-center justify-center shadow-lg group-hover:rotate-180 transition-transform duration-500">
                                        <div className="w-4 h-4 rounded-full bg-black border-2 border-white/20" />
                                    </div>
                                    <div className="flex flex-col items-start leading-tight">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white">Invert Theme</span>
                                        <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-tighter">Swap Dark/Light Modes</span>
                                    </div>
                                </button>

                                {/* GLOBAL BRAND WATERMARK */}
                                <div className="space-y-3 pt-6 border-t border-white/5">
                                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block px-1">Global Watermark Logo</label>
                                    <div className="bg-black/40 border border-zinc-800 rounded-2xl p-4 flex items-center gap-4 transition-all hover:bg-black/60">
                                        <div className="w-16 h-16 rounded-xl border-2 border-dashed border-zinc-800 flex items-center justify-center overflow-hidden bg-zinc-900 relative group/wm">
                                            {brandWatermark ? (
                                                <>
                                                    <img src={brandWatermark} className="w-full h-full object-contain" alt="Watermark" />
                                                    <button
                                                        onClick={() => setBrandWatermark(null)}
                                                        className="absolute inset-0 bg-black/60 opacity-0 group-hover/wm:opacity-100 flex items-center justify-center transition-opacity"
                                                    >
                                                        <Trash2 size={16} className="text-red-400" />
                                                    </button>
                                                </>
                                            ) : (
                                                <Upload size={20} className="text-zinc-600" />
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <p className="text-[9px] font-bold text-zinc-500 leading-relaxed uppercase">Overlay your logo on every slide automatically.</p>
                                            <label className="inline-block px-4 py-1.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-full text-[9px] font-black uppercase tracking-widest cursor-pointer transition-all">
                                                Select Logo
                                                <input type="file" className="hidden" accept="image/*" onChange={handleWatermarkUpload} />
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 pt-6 border-t border-white/10">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">🏢 Brand Presets</span>
                                        <button onClick={handleSaveBrandPreset} className="text-[10px] bg-white/10 hover:bg-white text-black active:scale-[0.98] px-3 py-1.5 rounded-full transition-all font-black border border-white/10 uppercase tracking-widest">
                                            + Save Current
                                        </button>
                                    </div>
                                    {brandPresets.length === 0 ? (
                                        <p className="text-[10px] text-zinc-500">No presets saved yet.</p>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-2">
                                            {brandPresets.map(preset => (
                                                <div key={preset.id} className="flex items-center justify-between bg-zinc-950 border border-white/5 p-2 rounded-lg group/item">
                                                    <button onClick={() => handleLoadBrandPreset(preset)} className="text-xs text-zinc-400 group-hover/item:text-white transition-colors flex-1 text-left font-bold uppercase tracking-tight">
                                                        {preset.name}
                                                    </button>
                                                    <button onClick={() => setBrandPresets(prev => prev.filter(p => p.id !== preset.id))} className="text-zinc-600 hover:text-red-400 p-1.5 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </details>

                        {/* 3. TYPOGRAPHY & LAYOUT */}
                        <details className="group border border-white/5 bg-gradient-to-b from-zinc-900 to-zinc-950 rounded-xl overflow-hidden shadow-sm">
                            <summary className="flex items-center justify-between p-4 cursor-pointer select-none hover:bg-zinc-800/50 transition-colors">
                                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2"><Type size={12} /> Typography & Motifs</span>
                                <span className="text-zinc-500 group-open:rotate-180 transition-transform duration-200 text-[10px]">▼</span>
                            </summary>
                            <div className="p-6 space-y-6 border-t border-white/5 bg-zinc-950/20">
                                <div className="space-y-4">
                                    <label className="text-[10px] uppercase font-black text-zinc-600 tracking-[0.2em] block mb-2 px-1">Character Foundry</label>
                                    <div className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-zinc-800">
                                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest w-20">Heading</span>
                                        <input
                                            type="text"
                                            value={headingFont}
                                            onChange={(e) => setHeadingFont(e.target.value)}
                                            placeholder="e.g. Playfair Display"
                                            className="flex-1 bg-zinc-950 border border-white/5 rounded-lg text-xs text-white px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500/50"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-zinc-800">
                                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest w-20">Subhead</span>
                                        <input
                                            type="text"
                                            value={subheadingFont}
                                            onChange={(e) => setSubheadingFont(e.target.value)}
                                            placeholder="e.g. Montserrat"
                                            className="flex-1 bg-zinc-950 border border-white/5 rounded-lg text-xs text-white px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500/50"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-zinc-800">
                                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest w-20">Body</span>
                                        <input
                                            type="text"
                                            value={bodyFont}
                                            onChange={(e) => setBodyFont(e.target.value)}
                                            placeholder="e.g. Inter"
                                            className="flex-1 bg-zinc-950 border border-white/5 rounded-lg text-xs text-white px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500/50"
                                        />
                                    </div>
                                    <p className="text-[9px] text-zinc-600 text-center uppercase tracking-widest font-black">Type any Google Font name exactly.</p>
                                    <div className="space-y-3 pt-4 border-t border-white/5">
                                        <label className="text-[10px] font-black uppercase text-blue-400 tracking-[0.3em] flex items-center gap-2">
                                            <Layout size={12} /> Visual Motifs
                                        </label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {['minimal', 'tweet', 'brutalist', 'highlight'].map(t => (
                                                <button
                                                    key={t} onClick={() => setActiveTemplate(t)}
                                                    className={`py-3 text-[9px] font-black uppercase active:scale-[0.98] tracking-widest rounded-xl border transition-all ${activeTemplate === t ? 'bg-white text-black border-white shadow-2xl scale-[1.02]' : 'bg-transparent text-zinc-500 border-white/5 hover:border-white/15'}`}
                                                >
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-3 pt-4 border-t border-white/5">
                                        <label className="text-[10px] uppercase font-black text-zinc-600 tracking-[0.2em] px-1">Alignment / Footer</label>
                                        <div className="flex gap-1 bg-black/40 p-1 rounded-2xl border border-zinc-800">
                                            {['left', 'center', 'right'].map(a => (
                                                <button
                                                    key={a} onClick={() => { setTextAlign(a); setFooterLayout(a); }}
                                                    className={`flex-1 py-2 text-[9px] font-black active:scale-[0.98] uppercase rounded-lg transition-all ${textAlign === a && footerLayout === a ? 'bg-zinc-800 text-white shadow-lg border border-white/10' : 'text-zinc-600 hover:text-zinc-400'}`}
                                                >
                                                    {a}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </details>

                        {/* 4. ASSET GALLERY */}
                        <details className="group border border-white/5 bg-gradient-to-b from-zinc-900 to-zinc-950 rounded-xl overflow-hidden shadow-sm">
                            <summary className="flex items-center justify-between p-4 cursor-pointer select-none hover:bg-zinc-800/50 transition-colors">
                                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">🖼️ Asset Gallery</span>
                                <span className="text-zinc-500 group-open:rotate-180 transition-transform duration-200 text-[10px]">▼</span>
                            </summary>
                            <div className="p-6 border-t border-white/5 bg-zinc-950/20">
                                <label className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 active:scale-[0.98] transition-all duration-200 text-white text-xs font-black uppercase tracking-[0.2em] rounded-xl border border-white/10 shadow-md flex items-center justify-center cursor-pointer mb-6">
                                    + Upload Images
                                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryUpload} />
                                </label>

                                {Object.keys(inlineImages).length === 0 ? (
                                    <div className="py-8 bg-black/20 border border-dashed border-white/5 rounded-2xl flex flex-col items-center gap-3">
                                        <ImageIcon size={24} className="text-zinc-800" />
                                        <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest text-center">Empty Vault</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-3 gap-3 max-h-[250px] overflow-y-auto custom-scrollbar pr-1">
                                        {Object.entries(inlineImages).map(([id, base64]) => (
                                            <div
                                                key={id}
                                                className="relative group/img cursor-pointer aspect-square rounded-xl overflow-hidden border border-white/5 bg-black/40 shadow-inner"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(`[img:${id}]`);
                                                }}
                                                title="Click to copy tag"
                                            >
                                                <img src={base64 as string} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                <div className="absolute inset-0 bg-blue-600/60 backdrop-blur-sm opacity-0 group-hover/img:opacity-100 flex flex-col items-center justify-center text-[10px] text-white font-black uppercase tracking-widest transition-all duration-300">
                                                    <Code size={16} className="mb-1" />
                                                    TAG
                                                </div>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); deleteGalleryImage(id); }}
                                                    className="absolute top-2 right-2 bg-red-600 text-white rounded-lg w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover/img:opacity-100 transition-all hover:bg-red-500 shadow-xl border border-white/20"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </details>

                        {/* 5. SAVED PROJECTS */}
                        <details className="group border border-white/5 bg-gradient-to-b from-zinc-900 to-zinc-950 rounded-xl overflow-hidden shadow-sm">
                            <summary className="flex items-center justify-between p-4 cursor-pointer select-none hover:bg-zinc-800/50 transition-colors">
                                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">💾 Manuscript Vault</span>
                                <span className="text-zinc-500 group-open:rotate-180 transition-transform duration-200 text-[10px]">▼</span>
                            </summary>
                            <div className="p-6 border-t border-white/5 bg-zinc-950/20">
                                <div className="flex gap-2 mb-6">
                                    <button onClick={handleSaveProject} className="flex-1 py-4 bg-zinc-800 hover:bg-zinc-700 active:scale-[0.98] transition-all duration-200 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl border border-white/10 shadow-md">
                                        + New Snapshot
                                    </button>
                                    <button onClick={exportProjectFile} className="px-4 bg-zinc-900 hover:bg-zinc-800 active:scale-[0.98] text-blue-400 rounded-xl border border-white/5 shadow-lg" title="Export .carousel file">
                                        <Code size={16} />
                                    </button>
                                </div>

                                {savedProjects.length === 0 ? (
                                    <div className="py-8 bg-black/20 border border-dashed border-white/5 rounded-2xl flex flex-col items-center gap-3">
                                        <ListTree size={24} className="text-zinc-800" />
                                        <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest text-center">No snapshots</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-2">
                                        {savedProjects.map(project => (
                                            <div key={project.id} className="flex items-center justify-between bg-zinc-950 border border-white/5 p-3 rounded-xl group/item shadow-inner">
                                                <div className="flex-1">
                                                    <button onClick={() => handleLoadProject(project)} className="text-xs font-black uppercase tracking-tight text-zinc-400 group-hover/item:text-white transition-colors text-left block">
                                                        {project.name}
                                                    </button>
                                                    <span className="text-[8px] text-zinc-600 font-bold uppercase">{project.date}</span>
                                                </div>
                                                <button onClick={() => setSavedProjects(prev => prev.filter(p => p.id !== project.id))} className="text-zinc-600 hover:text-red-400 p-2 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="mt-6 pt-6 border-t border-white/5">
                                    <label className="w-full py-3 bg-zinc-900/50 hover:bg-zinc-800 active:scale-[0.98] transition-all duration-200 text-zinc-500 hover:text-zinc-300 text-[10px] font-black uppercase tracking-widest rounded-xl border border-white/5 text-center cursor-pointer flex items-center justify-center gap-2">
                                        ↑ Import .carousel File
                                        <input type="file" accept=".carousel,.json" className="hidden" onChange={importProjectFile} />
                                    </label>
                                </div>
                            </div>
                        </details>

                        {/* 6. ADVANCED SETTINGS */}
                        <details className="group border border-white/5 bg-gradient-to-b from-zinc-900 to-zinc-950 rounded-xl overflow-hidden shadow-sm">
                            <summary className="flex items-center justify-between p-4 cursor-pointer select-none hover:bg-zinc-800/50 transition-colors">
                                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2"><Settings size={12} /> Hyper-parameters</span>
                                <span className="text-zinc-500 group-open:rotate-180 transition-transform duration-200 text-[10px]">▼</span>
                            </summary>
                            <div className="p-6 space-y-6 border-t border-white/5 bg-zinc-950/20">
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

                                    {/* PROGRESS BAR CONTROL */}
                                    <div className="flex flex-col gap-3 pt-4 border-t border-white/5">
                                        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">Progress Bar Axis</span>
                                        <div className="flex bg-black/40 border border-zinc-800 rounded-2xl p-1 shadow-inner">
                                            {['none', 'top', 'bottom'].map((mode) => (
                                                <button
                                                    key={mode}
                                                    onClick={() => setProgressBar(mode as 'none' | 'top' | 'bottom')}
                                                    className={`flex-1 py-2 text-[10px] font-black uppercase active:scale-[0.98] rounded-xl transition-all ${progressBar === mode ? 'bg-zinc-800 text-white shadow-lg border border-white/10' : 'text-zinc-500 hover:text-zinc-400'}`}
                                                >
                                                    {mode}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* SOCIAL SANDBOX CONTROL */}
                                    <div className="flex flex-col gap-3 border-t border-white/5 pt-4">
                                        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">Feed Sandbox Environment</span>
                                        <div className="flex bg-black/40 border border-zinc-800 rounded-2xl p-1 shadow-inner">
                                            {['none', 'linkedin', 'instagram'].map((mode) => (
                                                <button
                                                    key={mode}
                                                    onClick={() => setSandboxMode(mode as 'none' | 'linkedin' | 'instagram')}
                                                    className={`flex-1 py-2 text-[10px] font-black uppercase active:scale-[0.98] rounded-xl transition-all ${sandboxMode === mode ? 'bg-blue-600 text-white shadow-lg border border-white/10' : 'text-zinc-500 hover:text-zinc-400'}`}
                                                >
                                                    {mode === 'none' ? 'Off' : mode}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3 border-t border-white/5 pt-4">
                                        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">Global Aspect Ratio</span>
                                        <div className="flex bg-black/40 border border-zinc-800 rounded-2xl p-1 shadow-inner">
                                            {(['portrait', 'square'] as const).map(ratio => (
                                                <button
                                                    key={ratio}
                                                    onClick={() => setAspectRatio(ratio)}
                                                    className={`flex-1 py-2 text-[10px] font-black active:scale-[0.98] uppercase rounded-xl transition-all ${aspectRatio === ratio ? 'bg-blue-600 text-white shadow-lg border border-white/10' : 'text-zinc-500 hover:text-zinc-400'}`}
                                                >
                                                    {ratio === 'portrait' ? 'Vertical (4:5)' : 'Square (1:1)'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </details>

                        <button
                            onClick={() => { setCarouselData(null); setBulkText(''); setRawInput(''); setJsonInput(''); }}
                            className="w-full py-4 border border-white/5 bg-zinc-900 hover:bg-red-500/10 active:scale-[0.98] rounded-2xl flex items-center justify-center gap-2 text-zinc-600 hover:text-red-400 transition-all font-black text-[10px] uppercase tracking-[0.3em] shadow-md"
                        >
                            <RotateCcw size={12} /> Atomic Purge (Full Reset)
                        </button>
                    </div>
                )
                }
            </div >

            {/* Error Message Area */}
            {
                error && (
                    <div
                        onClick={() => setError(null)}
                        className="mx-6 mb-6 bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl animate-in fade-in zoom-in-95 duration-300 flex items-center justify-center gap-3 cursor-pointer hover:bg-red-500/15 transition-all shadow-lg"
                    >
                        <Trash2 size={14} className="opacity-60" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{error}</span>
                    </div>
                )
            }

            {/* SLEEK COMPACT FOOTER FOOTER */}
            <div className="shrink-0 p-6 border-t border-white/5 bg-zinc-950 flex flex-col gap-4">
                <div className="p-4 rounded-[20px] bg-white/[0.03] border border-white/5 flex items-center justify-between shadow-inner">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-950 border border-white/10 flex items-center justify-center shadow-lg">
                            <span className="text-[10px] font-black text-white">SA</span>
                        </div>
                        <div>
                            <p className="text-[11px] font-black text-white tracking-tight">Shezan Ahmed</p>
                            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Lead Product Architect</p>
                        </div>
                    </div>
                    <a href="https://www.linkedin.com/in/shezanahmed29/" target="_blank" rel="noreferrer" className="text-[9px] py-2 px-4 bg-white text-black active:scale-[0.95] rounded-full transition-all font-black uppercase tracking-widest shadow-md">FOLLOW</a>
                </div>

                <button onClick={() => setShowGuide(true)} className="w-full text-[10px] font-bold text-zinc-600 hover:text-white transition-colors text-center uppercase tracking-widest flex items-center justify-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-zinc-800" />
                    System Documentation & Guides
                    <div className="w-1 h-1 rounded-full bg-zinc-800" />
                </button>
            </div>

            {/* MODALS */}
            {
                showGuide && (
                    <div className="fixed inset-0 z-[9999] bg-zinc-950/90 backdrop-blur-xl animate-in fade-in duration-300 flex items-center justify-center p-6 overflow-y-auto">
                        <div className="max-w-2xl w-full bg-zinc-900/50 border border-white/10 rounded-[32px] p-10 relative shadow-2xl backdrop-blur-2xl">
                            <button onClick={() => setShowGuide(false)} className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-zinc-800/50 text-zinc-400 hover:text-white transition-all active:scale-90">✕</button>
                            <div className="space-y-8">
                                <div>
                                    <h2 className="text-3xl font-black mb-2 text-white uppercase tracking-tighter">Architect's Guide</h2>
                                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Carousel Creator v2.4 Enterprise</p>
                                </div>
                                <div className="space-y-6 text-sm text-zinc-300 leading-relaxed font-medium">
                                    <div className="space-y-2">
                                        <p className="text-white font-black uppercase text-[10px] tracking-widest">Bulk Workflow</p>
                                        <p>Use shorthand tags to architect your narrative at lightspeed.</p>
                                        <div className="bg-black/60 p-5 rounded-2xl border border-white/5 space-y-2 font-mono text-[11px] shadow-inner text-zinc-400">
                                            <p className="text-blue-400">/h, s:120/ Headline Module</p>
                                            <p className="text-purple-400">/sh, sh_s:60/ Subheading logic</p>
                                            <p className="text-zinc-500">Body text flows naturally between modules.</p>
                                            <p className="text-zinc-600 font-bold">Double Enter = New Slide</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-white font-black uppercase text-[10px] tracking-widest">The Focus Engine</p>
                                        <p>Click any slide in the preview to enter <strong>Focus Mode</strong>. This provides an isolated environment for micro-tuning typography, layout, and assets per-slide.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-white font-black uppercase text-[10px] tracking-widest">Asset Management</p>
                                        <p>Drop images into the editor to instantly store them in the <strong>Asset Locker</strong>. Use the generated <code>[img:id]</code> tags anywhere in your text-based workflow.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowGuide(false)}
                                    className="w-full py-4 bg-white text-black active:scale-[0.98] font-black text-xs uppercase tracking-[0.2em] rounded-2xl transition-all"
                                >
                                    ACKNOWLEDGE & CONTINUE
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default LeftPane;
