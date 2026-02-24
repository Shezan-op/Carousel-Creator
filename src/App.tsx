import { useState, useEffect } from 'react';
import LeftPane from './components/LeftPane';
import CarouselPreview from './components/CarouselPreview';
import type { CarouselData } from './types';
import { Instagram, Twitter, Linkedin, Github } from 'lucide-react';

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

  useEffect(() => {
    localStorage.setItem('previewScale', previewScale.toString());
  }, [previewScale]);

  useEffect(() => {
    localStorage.setItem('openRouterKey', openRouterKey);
  }, [openRouterKey]);

  useEffect(() => {
    localStorage.setItem('authorName', authorName);
    localStorage.setItem('authorHandle', authorHandle);
  }, [authorName, authorHandle]);

  useEffect(() => {
    if (authorAvatar) {
      localStorage.setItem('creatorAvatar', authorAvatar);
    } else {
      localStorage.removeItem('creatorAvatar');
    }
  }, [authorAvatar]);

  useEffect(() => {
    localStorage.setItem('carouselFont', fontFamily);
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
    link.href = `https://fonts.googleapis.com/css2?family=${formattedFont}:wght@400;600;700;900&display=swap`;
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
    <div className="flex flex-col md:flex-row h-screen w-full overflow-hidden bg-zinc-950 text-zinc-50 font-sans">

      {/* LEFT PANE — CONTROLS */}
      <div className="w-full md:w-[450px] lg:w-[500px] h-1/2 md:h-full overflow-y-auto border-b md:border-b-0 md:border-r border-white/10 bg-zinc-950 p-6 flex flex-col gap-6 shrink-0 z-10 relative custom-scrollbar">
        <h1 className="text-2xl font-bold tracking-tight mb-4">Carousel Creator</h1>

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
        />

        {/* THE PRODUCTION FOOTER */}
        <div className="mt-auto pt-6 border-t border-white/10 flex flex-col gap-4 text-xs text-zinc-500">
          <p>
            Built by <span className="text-zinc-300 font-medium">Shezan</span> — Founder @{' '}
            <a
              href="https://www.linkedin.com/company/lead-linked/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 hover:underline transition-colors"
            >
              LeadLinked
            </a>
          </p>

          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-zinc-300 transition-colors">FAQ</a>
            <a href="#" className="hover:text-zinc-300 transition-colors">Privacy</a>
            <a href="#" className="hover:text-zinc-300 transition-colors">Terms</a>
          </div>

          <div className="flex items-center gap-4">
            {[
              { Icon: Instagram, href: 'https://www.instagram.com/shortclipz.shezan/' },
              { Icon: Twitter, href: 'https://x.com/UShezan4' },
              { Icon: Linkedin, href: 'https://www.linkedin.com/in/shezanahmed29/' },
              { Icon: Github, href: 'https://github.com/Shezan-op' },
            ].map(({ Icon, href }, i) => (
              <a
                key={i}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-500 hover:text-white transition-all transform hover:scale-110"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANE — PREVIEW CANVAS */}
      <div
        className="flex-1 h-1/2 md:h-full bg-zinc-900/50 relative overflow-hidden flex flex-col items-center justify-center p-4 md:p-8"
        style={{
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      >
        <CarouselPreview
          data={carouselData}
          authorName={authorName}
          authorHandle={authorHandle}
          authorAvatar={authorAvatar}
          backgroundImage={backgroundImage}
          fontFamily={fontFamily}
          activeTemplate={activeTemplate}
          onDeleteSlide={deleteSlide}
          onMoveSlide={moveSlide}
          previewScale={previewScale}
        />
      </div>
    </div>
  );
}

export default App;
