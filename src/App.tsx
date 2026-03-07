import { useState, useEffect, useCallback } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import localforage from 'localforage';
import LeftPane from './components/LeftPane';
import CarouselPreview from './components/CarouselPreview';
import NetflixIntro from './components/NetflixIntro';
import type { CarouselData, Slide, BrandPreset, SavedProject } from './types';
import { renderHighlightedText } from './utils';

localforage.config({
  name: 'CarouselCreator',
  storeName: 'carousel_db'
});

function App() {
  const [carouselData, setCarouselData] = useState<CarouselData | null>(null);
  const [inlineImages, setInlineImages] = useState<Record<string, string>>({});
  const [isDbLoaded, setIsDbLoaded] = useState(false);


  useEffect(() => {
    if (isDbLoaded) localforage.setItem('carousel_inline_images', inlineImages);
  }, [inlineImages, isDbLoaded]);

  const [previewMode, setPreviewMode] = useState<'stack' | 'carousel' | 'grid'>('stack');
  const [openRouterKey, setOpenRouterKey] = useState(() => localStorage.getItem('openRouterKey') || '');

  // Persistent Branding State
  const [authorName, setAuthorName] = useState(() => localStorage.getItem('authorName') || 'Creator Name');
  const [authorHandle, setAuthorHandle] = useState(() => localStorage.getItem('authorHandle') || '@creator');
  const [authorAvatar, setAuthorAvatar] = useState<string | null>(() => localStorage.getItem('creatorAvatar'));
  const [activePreviewSlideIndex, setActivePreviewSlideIndex] = useState(0);

  // Multi-Font Engine: per-element font states
  const [headingFont, setHeadingFont] = useState(() => localStorage.getItem('heading_font') || 'Inter');
  const [subheadingFont, setSubheadingFont] = useState(() => localStorage.getItem('subheading_font') || 'Inter');
  const [bodyFont, setBodyFont] = useState(() => localStorage.getItem('body_font') || 'Inter');
  const [activeTemplate, setActiveTemplate] = useState('minimal');
  const [previewScale, setPreviewScale] = useState(() => Number(localStorage.getItem('previewScale')) || 0.35);

  // Retained global states
  const [textAlign, setTextAlign] = useState(() => localStorage.getItem('textAlign') || 'left');
  const [noiseOpacity, setNoiseOpacity] = useState(() => Number(localStorage.getItem('noiseOpacity')) || 5);
  const [customBgImage, setCustomBgImage] = useState<string | null>(() => localStorage.getItem('customBgImage'));

  const [isUnlocked, setIsUnlocked] = useState(() => localStorage.getItem('carousel_unlocked') === 'true');
  const [hasGivenFeedback, setHasGivenFeedback] = useState(() => localStorage.getItem('has_given_feedback') === 'true');
  const [showSafeZones, setShowSafeZones] = useState(() => localStorage.getItem('showSafeZones') === 'true');
  const [showSlideNumbers, setShowSlideNumbers] = useState(() => localStorage.getItem('showSlideNumbers') !== 'false');

  // Listen for Tally form submissions — robust handler
  useEffect(() => {
    const handleTallyMessage = (e: MessageEvent) => {
      // Tally can send data as a string OR a plain object
      let parsed: Record<string, unknown> | null = null;

      if (typeof e.data === 'string') {
        // Quick-exit: if the string doesn't mention Tally at all, ignore
        if (!e.data.includes('Tally')) return;
        try { parsed = JSON.parse(e.data); } catch { return; }
      } else if (typeof e.data === 'object' && e.data !== null) {
        parsed = e.data as Record<string, unknown>;
      }

      if (!parsed) return;

      // Tally uses "event" or "eventId" depending on widget version
      const eventName = (parsed.event || parsed.eventId || '') as string;
      if (!eventName.includes('FormSubmitted')) return;

      // formId can live at parsed.payload.formId OR parsed.formId
      const payload = (parsed.payload || parsed) as Record<string, unknown>;
      const formId = (payload.formId || '') as string;

      if (formId === 'MeA7bM') {
        // Lead Capture Form — unlock exports forever
        localStorage.setItem('carousel_unlocked', 'true');
        setIsUnlocked(true);
      } else if (formId === 'zxK1DR') {
        // Feedback Form
        localStorage.setItem('has_given_feedback', 'true');
        setHasGivenFeedback(true);
      }
    };

    window.addEventListener('message', handleTallyMessage);
    return () => window.removeEventListener('message', handleTallyMessage);
  }, []);

  // Fallback: If Tally's postMessage was missed (adblocker, iframe sandbox, etc.),
  // re-check localStorage whenever the window regains focus (e.g., after popup closes)
  useEffect(() => {
    const recheckUnlock = () => {
      if (!isUnlocked && localStorage.getItem('carousel_unlocked') === 'true') {
        setIsUnlocked(true);
      }
      if (!hasGivenFeedback && localStorage.getItem('has_given_feedback') === 'true') {
        setHasGivenFeedback(true);
      }
    };
    window.addEventListener('focus', recheckUnlock);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) recheckUnlock(); });
    return () => {
      window.removeEventListener('focus', recheckUnlock);
    };
  }, [isUnlocked, hasGivenFeedback]);

  const [customTheme, setCustomTheme] = useState({
    background: localStorage.getItem('custom_background') || '#09090B',
    text: localStorage.getItem('custom_text') || '#FFFFFF',
    accent: localStorage.getItem('custom_accent') || '#F59E0B'
  });

  const [bulkText, setBulkText] = useState('');
  const [focusedSlideIndex, setFocusedSlideIndex] = useState<number | null>(null);
  const [tunerTab, setTunerTab] = useState<'size' | 'font' | 'align' | 'bg'>('size');

  const [brandPresets, setBrandPresets] = useState<BrandPreset[]>([]);
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);

  useEffect(() => {
    if (isDbLoaded) localforage.setItem('carousel_brand_presets', brandPresets);
  }, [brandPresets, isDbLoaded]);

  useEffect(() => {
    if (isDbLoaded) localforage.setItem('carousel_saved_projects', savedProjects);
  }, [savedProjects, isDbLoaded]);

  useEffect(() => {
    if (isDbLoaded) localforage.setItem('lastBulkText', bulkText);
  }, [bulkText, isDbLoaded]);

  // Compiler logic moved from LeftPane
  const compileBulkText = useCallback((text: string) => {
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
        const match = line.match(/^\/([^/]+)\/\s*(.*)$/);
        if (match) {
          const configString = match[1].toLowerCase();
          const content = match[2];
          const parts = configString.split(',').map(p => p.trim());
          const type = parts[0];
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const options: any = {};
          parts.slice(1).forEach(opt => {
            const [k, v] = opt.split(':').map(x => x?.trim());
            if (!k || !v) return;
            if (k === 's') options.heading_size = parseInt(v);
            if (k === 'sh_s') options.subheading_size = parseInt(v);
            if (k === 'b_s') options.body_size = parseInt(v);
            if (k === 'y') options.y_offset = parseInt(v);
            if (k === 'a') options.text_align = v;
            if (k === 'bg') options.bg_image = v;
          });

          if (type === 'h') {
            slideObj.headline = content;
            Object.assign(slideObj, options);
          } else if (type === 'sh') {
            if (slideObj.type === 'title') slideObj.subheadline = content;
            else slideObj.subheading = content;
            Object.assign(slideObj, options);
          } else if (type === 'config') {
            Object.assign(slideObj, options);
          } else {
            if (content) bodyLines.push(content);
          }
        } else {
          bodyLines.push(line);
        }
      });
      if (bodyLines.length > 0) slideObj.body = bodyLines.join('\n');
      return slideObj as Slide;
    });

    if (slides.length > 0) {
      setCarouselData(prev => ({
        theme: prev?.theme || customTheme || { background: '#09090B', text: '#FAFAFA', accent: '#F59E0B' },
        slides: slides
      }));
    } else {
      setCarouselData(null);
    }
  }, [customTheme]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedImages = await localforage.getItem<Record<string, string>>('carousel_inline_images');
        if (savedImages) setInlineImages(savedImages);

        const savedProj = await localforage.getItem<SavedProject[]>('carousel_saved_projects');
        if (savedProj) setSavedProjects(savedProj);

        const savedPresets = await localforage.getItem<BrandPreset[]>('carousel_brand_presets');
        if (savedPresets) setBrandPresets(savedPresets);

        const lastText = await localforage.getItem<string>('lastBulkText');
        if (lastText) {
          setBulkText(lastText);
          compileBulkText(lastText);
        }
      } catch (error) {
        console.error("IndexedDB Load Failed", error);
      } finally {
        setIsDbLoaded(true);
      }
    };
    loadData();
  }, [compileBulkText]);

  const updateSlideConfig = (targetBlock: string, tag: string, key: string, value: string | number): string => {
    const lines = targetBlock.split(/\r?\n/);
    const tagLineIndex = lines.findIndex(l => {
      const trimmed = l.trim();
      return trimmed.startsWith(`/${tag}/`) || trimmed.startsWith(`/${tag},`);
    });

    if (tagLineIndex !== -1) {
      const line = lines[tagLineIndex].trim();
      const configBodyMatch = line.match(/^\/([^/]+)\/\s*(.*)$/);
      if (configBodyMatch) {
        const configBody = configBodyMatch[1];
        const content = configBodyMatch[2];
        const parts = configBody.split(',').map(s => s.trim());
        const filteredOptions = parts.slice(1).filter(o => !o.startsWith(`${key}:`));
        filteredOptions.push(`${key}:${value}`);
        lines[tagLineIndex] = `/${[tag, ...filteredOptions].join(', ')}/ ${content}`;
      }
    } else {
      const firstContentLine = lines.findIndex(l => l.trim().length > 0);
      if (firstContentLine !== -1) {
        lines.splice(firstContentLine, 0, `/${tag}, ${key}:${value}/`);
      } else {
        lines.push(`/${tag}, ${key}:${value}/`);
      }
    }
    return lines.join('\n');
  };

  const injectOverride = (index: number, tag: string, key: string, value: string | number) => {
    const contentBlocks = bulkText.split(/\n\s*\n/).filter(b => b.trim().length > 0);
    if (index >= contentBlocks.length) return;
    const updatedBlock = updateSlideConfig(contentBlocks[index], tag, key, value);
    contentBlocks[index] = updatedBlock;
    const newText = contentBlocks.join('\n\n');
    setBulkText(newText);
    compileBulkText(newText);
  };

  const getOverride = (index: number, key: string, def: number): number => {
    const contentBlocks = bulkText.split(/\n\s*\n/).filter(b => b.trim().length > 0);
    const block = contentBlocks[index];
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

  // The Override Function
  const applyCustomTheme = (key: string, value: string) => {
    const newTheme = { ...customTheme, [key]: value };
    setCustomTheme(newTheme);
    try { localStorage.setItem(`custom_${key}`, value); } catch { /* quota */ }

    // If a carousel is actively rendered, force the new color instantly
    if (carouselData) {
      setCarouselData({
        ...carouselData,
        theme: { ...carouselData.theme, [key]: value }
      });
    }
  };

  const [showProfile, setShowProfile] = useState(() => {
    const saved = localStorage.getItem('showProfile');
    return saved !== null ? saved === 'true' : true;
  });

  // Update local storage when toggled
  useEffect(() => {
    try { localStorage.setItem('showProfile', showProfile.toString()); } catch { /* quota */ }
  }, [showProfile]);

  const [footerLayout, setFooterLayout] = useState(() => {
    return localStorage.getItem('footerLayout') || 'left';
  });

  // Save to local storage on change
  useEffect(() => {
    try { localStorage.setItem('footerLayout', footerLayout); } catch { /* quota */ }
  }, [footerLayout]);

  useEffect(() => {
    try { localStorage.setItem('previewScale', previewScale.toString()); } catch { /* quota */ }
  }, [previewScale]);

  // Persist remaining global states
  useEffect(() => {
    try {
      localStorage.setItem('textAlign', textAlign);
      localStorage.setItem('noiseOpacity', noiseOpacity.toString());
      if (customBgImage) {
        localStorage.setItem('customBgImage', customBgImage);
      } else {
        localStorage.removeItem('customBgImage');
      }
    } catch { /* quota */ }
  }, [textAlign, noiseOpacity, customBgImage]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Export Shortcut: Cmd/Ctrl + Enter
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('btn-export-zip')?.click();
      }

      // 2. Modal Navigation: Left/Right Arrows
      if (focusedSlideIndex !== null && carouselData?.slides) {
        if (e.key === 'ArrowRight') {
          setFocusedSlideIndex(prev => Math.min((prev || 0) + 1, carouselData.slides.length - 1));
        }
        if (e.key === 'ArrowLeft') {
          setFocusedSlideIndex(prev => Math.max((prev || 0) - 1, 0));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedSlideIndex, carouselData]);

  useEffect(() => {
    try {
      localStorage.setItem('showSafeZones', showSafeZones.toString());
      localStorage.setItem('showSlideNumbers', showSlideNumbers.toString());
    } catch { /* quota */ }
  }, [showSafeZones, showSlideNumbers]);

  useEffect(() => {
    try { localStorage.setItem('openRouterKey', openRouterKey); } catch { /* quota */ }
  }, [openRouterKey]);

  useEffect(() => {
    try {
      localStorage.setItem('authorName', authorName);
      localStorage.setItem('authorHandle', authorHandle);
    } catch { /* quota */ }
  }, [authorName, authorHandle]);

  useEffect(() => {
    try {
      if (authorAvatar) {
        localStorage.setItem('creatorAvatar', authorAvatar);
      } else {
        localStorage.removeItem('creatorAvatar');
      }
    } catch (e) {
      console.error('[SEC] Failed to persist avatar to localStorage — quota likely exceeded.', e);
    }
  }, [authorAvatar]);

  // Multi-Font Engine: Deduped Google Fonts Injector
  useEffect(() => {
    const uniqueFonts = Array.from(new Set([headingFont, subheadingFont, bodyFont])).filter(Boolean);
    if (uniqueFonts.length === 0) return;

    const fontFamilies = uniqueFonts.map(font =>
      `family=${font.replace(/ /g, '+')}:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600;1,700;1,800;1,900`
    ).join('&');

    const fontUrl = `https://fonts.googleapis.com/css2?${fontFamilies}&display=swap`;

    let link = document.getElementById('dynamic-google-fonts') as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.id = 'dynamic-google-fonts';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }

    if (link.href !== fontUrl) {
      link.href = fontUrl;
    }

    try {
      localStorage.setItem('heading_font', headingFont);
      localStorage.setItem('subheading_font', subheadingFont);
      localStorage.setItem('body_font', bodyFont);
    } catch { /* quota */ }
  }, [headingFont, subheadingFont, bodyFont]);
  if (!isDbLoaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-950 text-white font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
          <div className="text-xs font-bold tracking-widest uppercase opacity-50">Loading Engine...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen lg:h-screen bg-[#000000] text-[#F3F4F6] selection:bg-blue-500/30 font-sans antialiased flex flex-col lg:flex-row p-4 lg:p-6 gap-6 lg:overflow-hidden">
      <NetflixIntro />

      {/* THE LEFT PANE (Control Center) */}
      <div className="w-full lg:w-[480px] h-full relative z-10 glass rounded-[32px] overflow-hidden shadow-2xl premium-shadow">
        <LeftPane
          carouselData={carouselData}
          setCarouselData={setCarouselData}
          openRouterKey={openRouterKey}
          setOpenRouterKey={setOpenRouterKey}
          authorName={authorName}
          setAuthorName={setAuthorName}
          authorHandle={authorHandle}
          setAuthorHandle={setAuthorHandle}
          authorAvatar={authorAvatar}
          setAuthorAvatar={setAuthorAvatar}
          headingFont={headingFont}
          setHeadingFont={setHeadingFont}
          subheadingFont={subheadingFont}
          setSubheadingFont={setSubheadingFont}
          bodyFont={bodyFont}
          setBodyFont={setBodyFont}
          activeTemplate={activeTemplate}
          setActiveTemplate={setActiveTemplate}
          previewScale={previewScale}
          setPreviewScale={setPreviewScale}
          customTheme={customTheme}
          applyCustomTheme={applyCustomTheme}
          showProfile={showProfile}
          setShowProfile={setShowProfile}
          footerLayout={footerLayout}
          setFooterLayout={setFooterLayout}
          textAlign={textAlign}
          setTextAlign={setTextAlign}
          noiseOpacity={noiseOpacity}
          setNoiseOpacity={setNoiseOpacity}
          customBgImage={customBgImage}
          setCustomBgImage={setCustomBgImage}
          activePreviewSlideIndex={activePreviewSlideIndex}
          bulkText={bulkText}
          setBulkText={setBulkText}
          compileBulkText={compileBulkText}
          injectOverride={injectOverride}
          getOverride={getOverride}
          setFocusedSlideIndex={setFocusedSlideIndex}
          setInlineImages={setInlineImages}
          showSafeZones={showSafeZones}
          setShowSafeZones={setShowSafeZones}
          showSlideNumbers={showSlideNumbers}
          setShowSlideNumbers={setShowSlideNumbers}
          brandPresets={brandPresets}
          setBrandPresets={setBrandPresets}
          savedProjects={savedProjects}
          setSavedProjects={setSavedProjects}
          inlineImages={inlineImages}
          creatorAvatar={authorAvatar}
          setCreatorAvatar={setAuthorAvatar}
        />
      </div>

      {/* RIGHT PANE — THE GALLERY PREVIEW */}
      <div className="flex-1 overflow-hidden relative glass rounded-[32px] p-2 lg:p-4 flex flex-col shadow-2xl">
        {/* Subtle Background textures to pop the slides */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_50%_0%,_#3b82f633_0%,_transparent_50%)]" />

        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar relative z-10 flex flex-col items-center py-8 lg:py-16">
          <CarouselPreview
            data={carouselData}
            authorName={authorName}
            authorHandle={authorHandle}
            authorAvatar={authorAvatar}
            headingFont={headingFont}
            subheadingFont={subheadingFont}
            bodyFont={bodyFont}
            activeTemplate={activeTemplate}
            setActiveTemplate={setActiveTemplate}
            previewScale={previewScale}
            showProfile={showProfile}
            footerLayout={footerLayout}
            textAlign={textAlign}
            noiseOpacity={noiseOpacity}
            customBgImage={customBgImage}
            setActivePreviewSlideIndex={setActivePreviewSlideIndex}
            isUnlocked={isUnlocked}
            hasGivenFeedback={hasGivenFeedback}
            setFocusedSlideIndex={setFocusedSlideIndex}
            showSafeZones={showSafeZones}
            showSlideNumbers={showSlideNumbers}
            inlineImages={inlineImages}
            previewMode={previewMode}
            setPreviewMode={setPreviewMode}
            bulkText={bulkText}
            setBulkText={setBulkText}
          />
        </div>
      </div>

      {focusedSlideIndex !== null && carouselData && (
        <div className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-sm flex justify-center">
          {/* Phone-sized container constraint for desktop */}
          <div className="w-full max-w-md bg-zinc-950 h-full flex flex-col shadow-2xl relative animate-in slide-in-from-bottom-4 duration-200">

            {/* TOP NAVIGATION */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
              <div className="text-white font-bold text-xs tracking-widest uppercase">
                Editing Slide {focusedSlideIndex + 1}
              </div>
              <button
                onClick={() => setFocusedSlideIndex(null)}
                className="px-4 py-1.5 bg-white text-black text-xs font-bold rounded-full hover:bg-zinc-200 transition-colors"
              >
                Done
              </button>
            </div>

            {/* THE SLIDE PREVIEW AREA */}
            <div className="flex-1 w-full relative overflow-hidden bg-zinc-950 min-h-[35vh]">

              {/* BULLETPROOF CENTERING & SCALING */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1080px] h-[1350px] scale-[0.22] sm:scale-[0.28] md:scale-[0.35] origin-center pointer-events-none flex items-center justify-center">

                <div
                  className="slide-export-node shadow-2xl relative overflow-hidden"
                  style={{
                    width: '1080px',
                    height: '1350px',
                    backgroundColor: carouselData.theme.background,
                    color: carouselData.theme.text,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    padding: '80px'
                  }}
                >
                  <div style={{
                    textAlign: carouselData.slides[focusedSlideIndex].text_align || 'left',
                    transform: `translateY(${carouselData.slides[focusedSlideIndex].y_offset || 0}px)`
                  }}>
                    {carouselData.slides[focusedSlideIndex].headline && (
                      <h1 style={{
                        fontFamily: `"${headingFont}", sans-serif`,
                        fontSize: `${carouselData.slides[focusedSlideIndex].heading_size || 120}px`,
                        fontWeight: '900',
                        lineHeight: '1.1',
                        marginBottom: '40px'
                      }}>
                        {renderHighlightedText(carouselData.slides[focusedSlideIndex].headline || '', activeTemplate, carouselData.theme.accent, inlineImages)}
                      </h1>
                    )}
                    {(carouselData.slides[focusedSlideIndex].subheadline || carouselData.slides[focusedSlideIndex].subheading) && (
                      <h2 style={{
                        fontFamily: `"${subheadingFont}", sans-serif`,
                        fontSize: `${carouselData.slides[focusedSlideIndex].subheading_size || 60}px`,
                        fontWeight: '500',
                        opacity: 0.8,
                        marginBottom: '40px'
                      }}>
                        {renderHighlightedText(carouselData.slides[focusedSlideIndex].subheadline || carouselData.slides[focusedSlideIndex].subheading || '', activeTemplate, carouselData.theme.accent, inlineImages)}
                      </h2>
                    )}
                    {carouselData.slides[focusedSlideIndex].body && (
                      <div style={{
                        fontFamily: `"${bodyFont}", sans-serif`,
                        fontSize: `${carouselData.slides[focusedSlideIndex].body_size || 40}px`,
                        lineHeight: '1.4',
                        opacity: 0.9,
                        whiteSpace: 'pre-line'
                      }}>
                        {renderHighlightedText(carouselData.slides[focusedSlideIndex].body || '', activeTemplate, carouselData.theme.accent, inlineImages)}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* THE BOTTOM DRAWER */}
            <div className="shrink-0 bg-zinc-900 rounded-t-3xl border-t border-white/10 p-6 shadow-2xl max-h-[45vh] overflow-y-auto custom-scrollbar">

              {/* TABS */}
              <div className="flex items-center justify-center gap-8 mb-6 border-b border-white/5 pb-4 sticky top-0 bg-zinc-900 z-10">
                <button onClick={() => setTunerTab('size')} className={`text-xs font-bold uppercase tracking-widest transition-colors ${tunerTab === 'size' ? 'text-blue-400' : 'text-zinc-500 hover:text-zinc-300'}`}>Size</button>
                <button onClick={() => setTunerTab('font')} className={`text-xs font-bold uppercase tracking-widest transition-colors ${tunerTab === 'font' ? 'text-blue-400' : 'text-zinc-500 hover:text-zinc-300'}`}>Fonts</button>
                <button onClick={() => setTunerTab('align')} className={`text-xs font-bold uppercase tracking-widest transition-colors ${tunerTab === 'align' ? 'text-blue-400' : 'text-zinc-500 hover:text-zinc-300'}`}>Align</button>
                <button onClick={() => setTunerTab('bg')} className={`text-xs font-bold uppercase tracking-widest transition-colors ${tunerTab === 'bg' ? 'text-blue-400' : 'text-zinc-500 hover:text-zinc-300'}`}>Bg</button>
              </div>

              {/* TAB CONTENTS */}
              <div className="min-h-[150px]">
                {(() => {
                  const activeSlide = carouselData.slides[focusedSlideIndex];
                  const currentHeadingSize = activeSlide.heading_size || 120;
                  const currentSubheadSize = activeSlide.subheading_size || 60;
                  const currentBodySize = activeSlide.body_size || 40;
                  const currentAlign = activeSlide.text_align || 'left';
                  const currentYOffset = activeSlide.y_offset || 0;

                  const updateSlideConfig = (tag: string, key: string, value: string | number) =>
                    injectOverride(focusedSlideIndex, tag, key, value);

                  return (
                    <>
                      {tunerTab === 'size' && (
                        <div className="flex flex-col gap-3">
                          {/* HEADING TUNER */}
                          <div className="flex items-center justify-between bg-zinc-800/50 p-3 rounded-xl border border-white/5">
                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Headline</span>
                            <div className="flex items-center gap-2">
                              <button onClick={() => injectOverride(focusedSlideIndex, 'h', 's', currentHeadingSize - 1)} className="w-8 h-8 flex items-center justify-center bg-zinc-700 hover:bg-zinc-600 rounded-full text-white font-bold transition-colors">-</button>
                              <input
                                type="number"
                                value={currentHeadingSize}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value);
                                  if (!isNaN(val)) injectOverride(focusedSlideIndex, 'h', 's', val);
                                }}
                                className="w-14 bg-zinc-950 border border-white/10 rounded text-center text-sm font-mono text-white py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 [&::-webkit-inner-spin-button]:appearance-none appearance-none"
                              />
                              <button onClick={() => injectOverride(focusedSlideIndex, 'h', 's', currentHeadingSize + 1)} className="w-8 h-8 flex items-center justify-center bg-zinc-700 hover:bg-zinc-600 rounded-full text-white font-bold transition-colors">+</button>
                            </div>
                          </div>

                          {/* SUBHEADING TUNER */}
                          <div className="flex items-center justify-between bg-zinc-800/50 p-3 rounded-xl border border-white/5">
                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Subhead</span>
                            <div className="flex items-center gap-2">
                              <button onClick={() => injectOverride(focusedSlideIndex, 'sh', 'sh_s', currentSubheadSize - 1)} className="w-8 h-8 flex items-center justify-center bg-zinc-700 hover:bg-zinc-600 rounded-full text-white font-bold transition-colors">-</button>
                              <input
                                type="number"
                                value={currentSubheadSize}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value);
                                  if (!isNaN(val)) injectOverride(focusedSlideIndex, 'sh', 'sh_s', val);
                                }}
                                className="w-14 bg-zinc-950 border border-white/10 rounded text-center text-sm font-mono text-white py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 [&::-webkit-inner-spin-button]:appearance-none appearance-none"
                              />
                              <button onClick={() => injectOverride(focusedSlideIndex, 'sh', 'sh_s', currentSubheadSize + 1)} className="w-8 h-8 flex items-center justify-center bg-zinc-700 hover:bg-zinc-600 rounded-full text-white font-bold transition-colors">+</button>
                            </div>
                          </div>

                          {/* BODY TUNER */}
                          <div className="flex items-center justify-between bg-zinc-800/50 p-3 rounded-xl border border-white/5">
                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Body</span>
                            <div className="flex items-center gap-2">
                              <button onClick={() => injectOverride(focusedSlideIndex, 'config', 'b_s', currentBodySize - 1)} className="w-8 h-8 flex items-center justify-center bg-zinc-700 hover:bg-zinc-600 rounded-full text-white font-bold transition-colors">-</button>
                              <input
                                type="number"
                                value={currentBodySize}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value);
                                  if (!isNaN(val)) injectOverride(focusedSlideIndex, 'config', 'b_s', val);
                                }}
                                className="w-14 bg-zinc-950 border border-white/10 rounded text-center text-sm font-mono text-white py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 [&::-webkit-inner-spin-button]:appearance-none appearance-none"
                              />
                              <button onClick={() => injectOverride(focusedSlideIndex, 'config', 'b_s', currentBodySize + 1)} className="w-8 h-8 flex items-center justify-center bg-zinc-700 hover:bg-zinc-600 rounded-full text-white font-bold transition-colors">+</button>
                            </div>
                          </div>
                        </div>
                      )}

                      {tunerTab === 'bg' && (
                        <div className="flex flex-col gap-3">
                          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Slide Background</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                const base64 = event.target?.result as string;
                                const imgId = 'bg_' + Math.random().toString(36).substring(2, 9);
                                setInlineImages(prev => ({ ...prev, [imgId]: base64 }));
                                // Inject the bg: tag into the active slide
                                updateSlideConfig('h', 'bg', imgId);
                              };
                              reader.readAsDataURL(file);
                            }}
                            className="w-full text-xs text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-600/20 file:text-blue-400 hover:file:bg-blue-600/30"
                          />
                          <button
                            onClick={() => updateSlideConfig('h', 'bg', '')} // Remove the bg tag
                            className="text-xs text-red-400 hover:text-red-300 mt-2 text-left"
                          >
                            Remove Custom Background
                          </button>
                        </div>
                      )}

                      {tunerTab === 'font' && (
                        <div className="flex flex-col gap-4">

                          <div className="flex items-center justify-between bg-zinc-800/50 p-3 rounded-xl border border-white/5">
                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest w-24">Heading</span>
                            <input
                              type="text"
                              value={headingFont}
                              onChange={(e) => setHeadingFont(e.target.value)}
                              placeholder="e.g. Playfair Display"
                              className="flex-1 bg-zinc-950 border border-white/10 rounded-lg text-sm text-white px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>

                          <div className="flex items-center justify-between bg-zinc-800/50 p-3 rounded-xl border border-white/5">
                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest w-24">Subhead</span>
                            <input
                              type="text"
                              value={subheadingFont}
                              onChange={(e) => setSubheadingFont(e.target.value)}
                              placeholder="e.g. Montserrat"
                              className="flex-1 bg-zinc-950 border border-white/10 rounded-lg text-sm text-white px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>

                          <div className="flex items-center justify-between bg-zinc-800/50 p-3 rounded-xl border border-white/5">
                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest w-24">Body</span>
                            <input
                              type="text"
                              value={bodyFont}
                              onChange={(e) => setBodyFont(e.target.value)}
                              placeholder="e.g. Inter"
                              className="flex-1 bg-zinc-950 border border-white/10 rounded-lg text-sm text-white px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>

                          <p className="text-[10px] text-zinc-500 text-center mt-2">Type any Google Font name perfectly (e.g., "Oswald", "Lora").</p>
                        </div>
                      )}

                      {tunerTab === 'align' && (
                        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-200">

                          {/* TEXT ALIGNMENT SEGMENTED CONTROL */}
                          <div className="flex flex-col gap-3">
                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest text-center">Horizontal Alignment</span>
                            <div className="flex bg-zinc-950 border border-white/10 rounded-xl p-1">
                              <button
                                onClick={() => updateSlideConfig('h', 'a', 'left')}
                                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${currentAlign === 'left' ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300'}`}
                              >
                                Left
                              </button>
                              <button
                                onClick={() => updateSlideConfig('h', 'a', 'center')}
                                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${currentAlign === 'center' ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300'}`}
                              >
                                Center
                              </button>
                              <button
                                onClick={() => updateSlideConfig('h', 'a', 'right')}
                                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${currentAlign === 'right' ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300'}`}
                              >
                                Right
                              </button>
                            </div>
                          </div>

                          {/* VERTICAL POSITION TUNER (Y-OFFSET) */}
                          <div className="flex items-center justify-between bg-zinc-800/50 p-3 rounded-xl border border-white/5 mt-2">
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Vertical Position</span>
                              <span className="text-[10px] text-zinc-500">Move block up/down</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {/* Note: We use 10px increments for Y-offset because 1px is too slow for vertical movement */}
                              <button onClick={() => updateSlideConfig('h', 'y', currentYOffset - 10)} className="w-8 h-8 flex items-center justify-center bg-zinc-700 hover:bg-zinc-600 rounded-full text-white font-bold transition-colors">-</button>
                              <input
                                type="number"
                                value={currentYOffset}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value);
                                  if (!isNaN(val)) updateSlideConfig('h', 'y', val);
                                }}
                                className="w-14 bg-zinc-950 border border-white/10 rounded text-center text-sm font-mono text-white py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 [&::-webkit-inner-spin-button]:appearance-none appearance-none"
                              />
                              <button onClick={() => updateSlideConfig('h', 'y', currentYOffset + 10)} className="w-8 h-8 flex items-center justify-center bg-zinc-700 hover:bg-zinc-600 rounded-full text-white font-bold transition-colors">+</button>
                            </div>
                          </div>

                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      <Analytics />
      <SpeedInsights />
    </div>
  );
}

export default App;
