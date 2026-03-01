import { useState, useEffect } from 'react';

const NetflixIntro: React.FC = () => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setVisible(false), 2800);
        return () => clearTimeout(timer);
    }, []);

    if (!visible) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center pointer-events-none"
            style={{ animation: 'introFadeOut 0.8s ease-out 2s forwards' }}>
            <div className="relative flex flex-col items-center px-8">
                <div className="w-20 h-20 mb-5 rounded-2xl bg-zinc-900/50 p-3.5"
                    style={{ animation: 'introZoomIn 0.8s ease-out forwards' }}>
                    <img src="/Logo.png" className="w-full h-full object-contain" alt="Logo"
                        style={{ animation: 'introPulse 1.5s ease-in-out infinite' }} />
                </div>
                <div className="overflow-visible pr-2"
                    style={{ animation: 'introSlideUp 0.8s ease-out 0.2s both' }}>
                    <span className="text-3xl sm:text-4xl font-black tracking-tight text-white whitespace-nowrap">
                        CAROUSEL{' '}
                    </span>
                    <span className="text-3xl sm:text-4xl font-light italic text-zinc-400 whitespace-nowrap">
                        CREATOR
                    </span>
                </div>
                <p className="mt-3 text-[10px] uppercase tracking-[0.4em] text-zinc-600 font-bold"
                    style={{ animation: 'introSlideUp 0.6s ease-out 0.5s both' }}>
                    Make your carousels fast and clean
                </p>
                <div className="mt-6 w-48 h-[2px] bg-zinc-900 rounded-full overflow-hidden"
                    style={{ animation: 'introSlideUp 0.5s ease-out 0.7s both' }}>
                    <div className="h-full bg-white rounded-full"
                        style={{ animation: 'introProgress 1.8s ease-out 0.8s forwards', width: 0 }} />
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes introFadeOut {
                    to { opacity: 0; visibility: hidden; }
                }
                @keyframes introZoomIn {
                    from { transform: scale(0.8); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                @keyframes introSlideUp {
                    from { transform: translateY(12px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes introProgress {
                    to { width: 100%; }
                }
                @keyframes introPulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.6; }
                }
            `}} />
        </div>
    );
};

export default NetflixIntro;
