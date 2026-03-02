import { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import LeftPane from './components/LeftPane';
import CarouselPreview from './components/CarouselPreview';
import NetflixIntro from './components/NetflixIntro';
import type { CarouselData, Slide } from './types';
import { AlignLeft, AlignCenter, AlignRight, Type } from 'lucide-react';
import { renderHighlightedText } from './utils';

function App() {
  const [carouselData, setCarouselData] = useState<CarouselData | null>(null);
  const [openRouterKey, setOpenRouterKey] = useState(() => localStorage.getItem('openRouterKey') || '');

  // Persistent Branding State
  const [authorName, setAuthorName] = useState(() => localStorage.getItem('authorName') || 'Creator Name');
  const [authorHandle, setAuthorHandle] = useState(() => localStorage.getItem('authorHandle') || '@creator');
  const [authorAvatar, setAuthorAvatar] = useState<string | null>(() => localStorage.getItem('creatorAvatar'));
  const [activePreviewSlideIndex, setActivePreviewSlideIndex] = useState(0);

  const [fontFamily, setFontFamily] = useState(() => localStorage.getItem('carouselFont') || 'Inter');
  const [activeTemplate, setActiveTemplate] = useState('minimal');
  const [previewScale, setPreviewScale] = useState(() => Number(localStorage.getItem('previewScale')) || 0.35);

  // Retained global states
  const [textAlign, setTextAlign] = useState(() => localStorage.getItem('textAlign') || 'left');
  const [noiseOpacity, setNoiseOpacity] = useState(() => Number(localStorage.getItem('noiseOpacity')) || 5);
  const [customBgImage, setCustomBgImage] = useState<string | null>(() => localStorage.getItem('customBgImage'));

  const [isUnlocked, setIsUnlocked] = useState(() => localStorage.getItem('carousel_unlocked') === 'true');
  const [hasGivenFeedback, setHasGivenFeedback] = useState(() => localStorage.getItem('has_given_feedback') === 'true');

  // Listen for Tally form submissions
  useEffect(() => {
    const handleTallyMessage = (e: MessageEvent) => {
      if (typeof e.data === 'string' && e.data.includes('Tally.FormSubmitted')) {
        try {
          const data = JSON.parse(e.data);
          if (data.eventId === 'Tally.FormSubmitted') {
            if (data.payload.formId === 'MeA7bM') { // Lead Capture Form
              localStorage.setItem('carousel_unlocked', 'true');
              setIsUnlocked(true);
              // Note: Tally auto-closes this after 3000ms based on our config
            } else if (data.payload.formId === 'zxK1DR') { // Feedback Form
              localStorage.setItem('has_given_feedback', 'true');
              setHasGivenFeedback(true);
            }
          }
        } catch (err) { console.error("Tally parse error", err); }
      }
    };
    window.addEventListener('message', handleTallyMessage);
    return () => window.removeEventListener('message', handleTallyMessage);
  }, []);

  const [customTheme, setCustomTheme] = useState({
    background: localStorage.getItem('custom_background') || '#09090B',
    text: localStorage.getItem('custom_text') || '#FFFFFF',
    accent: localStorage.getItem('custom_accent') || '#F59E0B'
  });

  const [bulkText, setBulkText] = useState(() => localStorage.getItem('lastBulkText') || '');
  const [focusedSlideIndex, setFocusedSlideIndex] = useState<number | null>(null);
  const [tunerTab, setTunerTab] = useState<'size' | 'font' | 'align'>('size');

  useEffect(() => {
    try { localStorage.setItem('lastBulkText', bulkText); } catch { /* quota */ }
  }, [bulkText]);

  // Compiler logic moved from LeftPane
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
      setCarouselData({
        theme: customTheme,
        slides: slides
      });
    } else {
      setCarouselData(null);
    }
  };

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

  useEffect(() => {
    try { localStorage.setItem('carouselFont', fontFamily); } catch { /* quota */ }
  }, [fontFamily]);

  useEffect(() => {
    if (!fontFamily) return;
    const formattedFont = fontFamily.replace(/ /g, '+');
    const linkId = 'dynamic-google-font';
    let link = document.getElementById(linkId) as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    link.href = `https://fonts.googleapis.com/css2?family=${formattedFont}:ital,wght@0,400;0,600;0,700;0,900;1,400;1,600;1,700;1,900&display=swap`;
  }, [fontFamily]);

  const deleteSlide = (index: number) => {
    if (!carouselData) return;
    const newSlides = carouselData.slides.filter((_, i) => i !== index);
    setCarouselData({ ...carouselData, slides: newSlides });
  };

  const moveSlide = (index: number, direction: 'up' | 'down') => {
    if (!carouselData) return;
    const newSlides = [...carouselData.slides];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSlides.length) return;

    [newSlides[index], newSlides[targetIndex]] = [newSlides[targetIndex], newSlides[index]];
    setCarouselData({ ...carouselData, slides: newSlides });
  };

  return (
    <div className="min-h-screen lg:h-screen bg-[#000000] text-[#F3F4F6] selection:bg-blue-500/30 font-sans antialiased flex flex-col lg:flex-row p-4 lg:p-6 gap-6 lg:overflow-hidden">
      <NetflixIntro />

      {/* THE LEFT PANE (Control Center) */}
      <div className="w-full lg:w-[480px] h-full relative z-10 glass rounded-[32px] overflow-hidden shadow-2xl premium-shadow">
        <LeftPane
          setCarouselData={setCarouselData}
          openRouterKey={openRouterKey}
          setOpenRouterKey={setOpenRouterKey}
          authorName={authorName}
          setAuthorName={setAuthorName}
          authorHandle={authorHandle}
          setAuthorHandle={setAuthorHandle}
          authorAvatar={authorAvatar}
          setAuthorAvatar={setAuthorAvatar}
          fontFamily={fontFamily}
          setFontFamily={setFontFamily}
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
            fontFamily={fontFamily}
            activeTemplate={activeTemplate}
            setActiveTemplate={setActiveTemplate}
            onDeleteSlide={deleteSlide}
            onMoveSlide={moveSlide}
            previewScale={previewScale}
            showProfile={showProfile}
            footerLayout={footerLayout}
            textAlign={textAlign}
            noiseOpacity={noiseOpacity}
            customBgImage={customBgImage}
            setActivePreviewSlideIndex={setActivePreviewSlideIndex}
            activePreviewSlideIndex={activePreviewSlideIndex}
            isUnlocked={isUnlocked}
            hasGivenFeedback={hasGivenFeedback}
            setFocusedSlideIndex={setFocusedSlideIndex}
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
                    padding: '80px',
                    fontFamily: fontFamily,
                    justifyContent: 'center',
                    textAlign: carouselData.slides[focusedSlideIndex].text_align || 'left'
                  }}
                >
                  {carouselData.slides[focusedSlideIndex].headline && (
                    <h1 style={{
                      fontSize: `${carouselData.slides[focusedSlideIndex].heading_size || 120}px`,
                      fontWeight: '900',
                      lineHeight: '1.1',
                      marginBottom: '40px'
                    }}>
                      {renderHighlightedText(carouselData.slides[focusedSlideIndex].headline || '', activeTemplate, carouselData.theme.accent)}
                    </h1>
                  )}
                  {(carouselData.slides[focusedSlideIndex].subheadline || carouselData.slides[focusedSlideIndex].subheading) && (
                    <h2 style={{
                      fontSize: `${carouselData.slides[focusedSlideIndex].subheading_size || 60}px`,
                      fontWeight: '500',
                      opacity: 0.8,
                      marginBottom: '40px'
                    }}>
                      {renderHighlightedText(carouselData.slides[focusedSlideIndex].subheadline || carouselData.slides[focusedSlideIndex].subheading || '', activeTemplate, carouselData.theme.accent)}
                    </h2>
                  )}
                  {carouselData.slides[focusedSlideIndex].body && (
                    <div style={{
                      fontSize: `${carouselData.slides[focusedSlideIndex].body_size || 40}px`,
                      lineHeight: '1.4',
                      opacity: 0.9,
                      whiteSpace: 'pre-line'
                    }}>
                      {renderHighlightedText(carouselData.slides[focusedSlideIndex].body || '', activeTemplate, carouselData.theme.accent)}
                    </div>
                  )}
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
              </div>

              {/* TAB CONTENTS */}
              <div className="min-h-[150px]">
                {(() => {
                  const activeSlide = carouselData.slides[focusedSlideIndex];
                  const currentHeadingSize = activeSlide.heading_size || 120;
                  const currentSubheadSize = activeSlide.subheading_size || 60;
                  const currentBodySize = activeSlide.body_size || 40;

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

                      {tunerTab === 'font' && (
                        <div className="flex flex-col gap-4">
                          <p className="text-xs text-zinc-500 text-center mb-2 font-medium">Coming Soon: Character Foundry</p>
                          <div className="grid grid-cols-3 gap-2">
                            {['Headline', 'Subhead', 'Body'].map(f => (
                              <div key={f} className="bg-zinc-800/50 border border-white/10 p-4 rounded-2xl text-[10px] text-zinc-500 flex flex-col items-center gap-2 opacity-50 grayscale">
                                <Type size={18} /> {f}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {tunerTab === 'align' && (
                        <div className="flex flex-col gap-4">
                          <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest text-center block">Alignment Tuning</label>
                          <div className="flex justify-center gap-4">
                            {[
                              { id: 'left', icon: AlignLeft },
                              { id: 'center', icon: AlignCenter },
                              { id: 'right', icon: AlignRight }
                            ].map(a => (
                              <button
                                key={a.id}
                                onClick={() => injectOverride(focusedSlideIndex, 'config', 'a', a.id)}
                                className={`w-14 h-14 rounded-2xl border flex items-center justify-center transition-all ${activeSlide.text_align === a.id ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-zinc-800 border-white/5 text-zinc-500'}`}
                              >
                                <a.icon size={24} />
                              </button>
                            ))}
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
