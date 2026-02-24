import { useState, useEffect } from 'react';
import LeftPane from './components/LeftPane';
import CarouselPreview from './components/CarouselPreview';
import type { CarouselData } from './types';

function App() {
  const [carouselData, setCarouselData] = useState<CarouselData | null>(null);
  const [openRouterKey, setOpenRouterKey] = useState(() => localStorage.getItem('openRouterKey') || '');

  // Persistent Branding State
  const [authorName, setAuthorName] = useState(() => localStorage.getItem('authorName') || 'Creator Name');
  const [authorHandle, setAuthorHandle] = useState(() => localStorage.getItem('authorHandle') || '@creator');
  const [authorAvatar, setAuthorAvatar] = useState<string | null>(() => localStorage.getItem('creatorAvatar'));

  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [fontFamily, setFontFamily] = useState(() => localStorage.getItem('carouselFont') || 'Inter');
  const [activeTemplate, setActiveTemplate] = useState('minimal');
  const [previewScale, setPreviewScale] = useState(() => Number(localStorage.getItem('previewScale')) || 0.35);

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
    <div className="flex flex-col lg:flex-row min-h-screen lg:h-screen w-full bg-zinc-950 text-zinc-50 font-sans lg:overflow-hidden">

      {/* LEFT PANE — CONTROLS */}
      <div className="w-full lg:w-[450px] xl:w-[500px] h-auto lg:h-full lg:overflow-y-auto border-b lg:border-b-0 lg:border-r border-white/10 bg-zinc-950 p-6 flex flex-col gap-6 shrink-0 z-10 relative custom-scrollbar">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-zinc-900 border border-white/10 flex-shrink-0">
            <img src="/Logo.png" alt="Carousel Creator Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Carousel Creator</h1>
        </div>

        {/* Tab Controls, Inputs, and Settings */}
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
          backgroundImage={backgroundImage}
          setBackgroundImage={setBackgroundImage}
          fontFamily={fontFamily}
          setFontFamily={setFontFamily}
          activeTemplate={activeTemplate}
          setActiveTemplate={setActiveTemplate}
          previewScale={previewScale}
          setPreviewScale={setPreviewScale}
          carouselData={carouselData}
          customTheme={customTheme}
          applyCustomTheme={applyCustomTheme}
          showProfile={showProfile}
          setShowProfile={setShowProfile}
          footerLayout={footerLayout}
          setFooterLayout={setFooterLayout}
        />

        {/* THE PRODUCTION FOOTER */}
        <div className="mt-auto pt-6 border-t border-white/10 flex flex-col gap-6 text-xs text-zinc-500">
          {/* Documentation Links */}
          <div className="flex flex-col gap-2">
            <span className="font-semibold text-zinc-400 uppercase tracking-wider text-[10px]">Core Documentation</span>
            <div className="flex flex-wrap gap-3">
              <a href="https://github.com/Shezan-op/Carousel-Creator/blob/main/HOW_TO_USE.md" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">📖 How To Use Guide</a>
              <a href="https://github.com/Shezan-op/Carousel-Creator/blob/main/README.md" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">💻 GitHub Repo</a>
            </div>
          </div>

          {/* Example Results */}
          <div className="flex flex-col gap-2">
            <span className="font-semibold text-zinc-400 uppercase tracking-wider text-[10px]">Example Outputs</span>
            <div className="flex flex-wrap gap-3">
              <a href="/Minimal%20Carousel.pdf" target="_blank" className="hover:text-blue-400 transition-colors flex items-center gap-1">📄 Minimal</a>
              <a href="/Tweet%20Carousel.pdf" target="_blank" className="hover:text-blue-400 transition-colors flex items-center gap-1">📄 Tweet</a>
              <a href="/Brutalist%20Carousel.pdf" target="_blank" className="hover:text-blue-400 transition-colors flex items-center gap-1">📄 Brutalist</a>
            </div>
          </div>

          {/* Credits */}
          <div className="pt-4 border-t border-white/5 flex justify-between items-center">
            <p>Built by <a href="https://www.linkedin.com/company/lead-linked/" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline font-medium">Shezan @LeadLinked</a></p>
            <div className="flex gap-3">
              <a href="https://x.com/UShezan4" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">X</a>
              <a href="https://www.linkedin.com/in/shezanahmed29/" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">IN</a>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE — PREVIEW CANVAS */}
      <div className="flex-1 h-[85vh] lg:h-full overflow-y-auto bg-zinc-900/50 relative flex flex-col custom-scrollbar">
        <CarouselPreview
          data={carouselData}
          authorName={authorName}
          authorHandle={authorHandle}
          authorAvatar={authorAvatar}
          backgroundImage={backgroundImage}
          fontFamily={fontFamily}
          activeTemplate={activeTemplate}
          setActiveTemplate={setActiveTemplate}
          onDeleteSlide={deleteSlide}
          onMoveSlide={moveSlide}
          previewScale={previewScale}
          showProfile={showProfile}
          footerLayout={footerLayout}
        />
      </div>
    </div>
  );
}

export default App;
