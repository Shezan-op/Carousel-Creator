import { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import LeftPane from './components/LeftPane';
import CarouselPreview from './components/CarouselPreview';
import NetflixIntro from './components/NetflixIntro';
import type { CarouselData } from './types';

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

  // Design & Typography Engine State
  const [headingSize, setHeadingSize] = useState(() => Number(localStorage.getItem('headingSize')) || 78);
  const [subheadingSize, setSubheadingSize] = useState(() => Number(localStorage.getItem('subheadingSize')) || 44);
  const [bodySize, setBodySize] = useState(() => Number(localStorage.getItem('bodySize')) || 30);
  const [sectionSize, setSectionSize] = useState(() => Number(localStorage.getItem('sectionSize')) || 38);
  const [textAlign, setTextAlign] = useState(() => localStorage.getItem('textAlign') || 'left');
  const [textYOffset, setTextYOffset] = useState(() => Number(localStorage.getItem('textYOffset')) || 0);
  const [noiseOpacity, setNoiseOpacity] = useState(() => Number(localStorage.getItem('noiseOpacity')) || 5);
  const [customBgImage, setCustomBgImage] = useState<string | null>(() => localStorage.getItem('customBgImage'));

  // Initialize Custom Theme from local storage or default fallbacks
  const [customTheme, setCustomTheme] = useState({
    background: localStorage.getItem('custom_background') || '#09090B',
    text: localStorage.getItem('custom_text') || '#FFFFFF',
    accent: localStorage.getItem('custom_accent') || '#F59E0B'
  });

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

  // Persist Design & Typography Engine state
  useEffect(() => {
    try {
      localStorage.setItem('headingSize', headingSize.toString());
      localStorage.setItem('subheadingSize', subheadingSize.toString());
      localStorage.setItem('bodySize', bodySize.toString());
      localStorage.setItem('sectionSize', sectionSize.toString());
      localStorage.setItem('textAlign', textAlign);
      localStorage.setItem('textYOffset', textYOffset.toString());
      localStorage.setItem('noiseOpacity', noiseOpacity.toString());
      if (customBgImage) {
        localStorage.setItem('customBgImage', customBgImage);
      } else {
        localStorage.removeItem('customBgImage');
      }
    } catch { /* quota */ }
  }, [headingSize, subheadingSize, bodySize, sectionSize, textAlign, textYOffset, noiseOpacity, customBgImage]);

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

      {/* LEFT PANE — THE CONTROL CENTER */}
      <div className="w-full lg:w-[480px] lg:h-full flex flex-col gap-5 relative z-10 glass rounded-[32px] p-5 lg:p-7 shadow-2xl premium-shadow">

        <div className="flex flex-col gap-1 shrink-0">
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

        {/* MAIN CONTROLS — scroll is FLUSH with the surface, no inset */}
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
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
            headingSize={headingSize}
            setHeadingSize={setHeadingSize}
            subheadingSize={subheadingSize}
            setSubheadingSize={setSubheadingSize}
            bodySize={bodySize}
            setBodySize={setBodySize}
            sectionSize={sectionSize}
            setSectionSize={setSectionSize}
            textAlign={textAlign}
            setTextAlign={setTextAlign}
            textYOffset={textYOffset}
            setTextYOffset={setTextYOffset}
            noiseOpacity={noiseOpacity}
            setNoiseOpacity={setNoiseOpacity}
            customBgImage={customBgImage}
            setCustomBgImage={setCustomBgImage}
            activePreviewSlideIndex={activePreviewSlideIndex}
          />
        </div>

        {/* MINIMALIST FOOTER */}
        <div className="shrink-0 pt-6 border-t border-white/5 flex flex-col gap-4">
          <div className="flex flex-wrap gap-4 text-[9px] font-black uppercase text-zinc-500 tracking-widest">
            <a href="/README.md" target="_blank" className="hover:text-white transition-colors">README</a>
            <a href="/HOW_TO_USE.md" target="_blank" className="hover:text-white transition-colors">GUIDE</a>
            <a href="/Brutalist Carousel.pdf" target="_blank" className="hover:text-white transition-colors">BRUTALIST</a>
            <a href="/Minimal Carousel.pdf" target="_blank" className="hover:text-white transition-colors">MINIMAL</a>
            <a href="/Tweet Carousel.pdf" target="_blank" className="hover:text-white transition-colors">TWEET</a>
          </div>
          <p className="text-[10px] text-zinc-600 font-bold">V2.0.4 PRODUCTION READY • PREMIUM 🚀</p>
        </div>
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center">
              <span className="text-[10px]">SA</span>
            </div>
            <div>
              <p className="text-[11px] font-bold text-zinc-200">Shezan Ahmed</p>
              <p className="text-[9px] text-zinc-500">Lead Product Architect</p>
            </div>
          </div>
          <a href="https://www.linkedin.com/in/shezanahmed29/" target="_blank" rel="noreferrer" className="text-[10px] py-1.5 px-3 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors">FOLLOW</a>
        </div>
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
            headingSize={headingSize}
            subheadingSize={subheadingSize}
            sectionSize={sectionSize}
            bodySize={bodySize}
            textAlign={textAlign}
            textYOffset={textYOffset}
            noiseOpacity={noiseOpacity}
            customBgImage={customBgImage}
            setActivePreviewSlideIndex={setActivePreviewSlideIndex}
            activePreviewSlideIndex={activePreviewSlideIndex}
          />
        </div>
      </div>

      <Analytics />
      <SpeedInsights />
    </div >
  );
}

export default App;
