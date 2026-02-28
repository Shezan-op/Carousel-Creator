import React, { useState } from 'react';
import { Loader2, FileArchive, FileText } from 'lucide-react';
import type { CarouselData } from '../types';
import { toJpeg } from 'html-to-image';
import jsPDF from 'jspdf';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface Props {
    data: CarouselData;
    activeTemplate: string;
    setActiveTemplate: (template: string) => void;
}

const ExportControls: React.FC<Props> = ({ data, activeTemplate, setActiveTemplate }) => {
    const [exportType, setExportType] = useState<'pdf' | 'zip' | null>(null);
    const [showLeadModal, setShowLeadModal] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const checkExportLimit = () => {
        // 1. Check if already unlocked
        const isUnlocked = localStorage.getItem('carousel_unlocked') === 'true';
        if (isUnlocked) return true;

        // 2. Check today's usage
        // SEC: Use UTC date to prevent timezone-manipulation bypass
        const today = new Date().toISOString().slice(0, 10);
        const lastExportDate = localStorage.getItem('carousel_export_date');
        let exportCount = parseInt(localStorage.getItem('carousel_export_count') || '0', 10);
        if (isNaN(exportCount)) exportCount = 0;

        // Reset count if it's a new day
        if (lastExportDate !== today) {
            exportCount = 0;
            localStorage.setItem('carousel_export_date', today);
        }

        // 3. Block if limit reached
        if (exportCount >= 5) {
            setShowLeadModal(true);
            return false;
        }

        // 4. Allow export and increment
        localStorage.setItem('carousel_export_count', (exportCount + 1).toString());
        return true;
    };

    const exportToPDF = async () => {
        if (!checkExportLimit()) return;
        // FONT EXPORT SAFETY: Wait for all fonts to load before capturing
        await document.fonts.ready;

        setExportType('pdf');
        try {
            const slideNodes = Array.from(document.querySelectorAll('.slide-export-node')) as HTMLElement[];
            if (slideNodes.length === 0) return;

            const pdf = new jsPDF({
                compress: true,
                orientation: 'portrait',
                unit: 'px',
                format: [1080, 1350]
            });

            for (let i = 0; i < slideNodes.length; i++) {
                const node = slideNodes[i];

                // Capture as JPEG; pixelRatio:1 ensures we stay at the natural 1080x1350
                let dataUrl: string | null = await toJpeg(node, {
                    quality: 0.90,
                    pixelRatio: 1,
                    style: { transform: 'scale(1)', transformOrigin: 'top left', margin: '0' }
                });

                if (i !== 0) pdf.addPage([1080, 1350], 'portrait');
                pdf.addImage(dataUrl, 'JPEG', 0, 0, 1080, 1350, `slide_${i}`, 'FAST');

                // PERF: Immediately null the dataUrl so GC can reclaim ~2-4MB before the next iteration
                dataUrl = null;
            }

            pdf.save('carousel.pdf');
        } catch {
            console.error('Export Error: PDF generation failed.');
            alert('Failed to export PDF.');
        } finally {
            setExportType(null);
        }
    };

    const exportToZip = async () => {
        if (!checkExportLimit()) return;
        setExportType('zip');
        const originalTemplate = activeTemplate;

        try {
            await document.fonts.ready;
            const zip = new JSZip();
            const templates = ['minimal', 'tweet', 'brutalist'];

            // Loop through each template
            for (const tpl of templates) {
                setActiveTemplate(tpl); // Change the UI

                // CRITICAL: Wait 500ms for React to reconcile the DOM and CSS to apply
                await new Promise(resolve => setTimeout(resolve, 500));

                const slideNodes = document.querySelectorAll('.slide-export-node');
                const folder = zip.folder(tpl); // Create a subfolder in the ZIP

                for (let i = 0; i < slideNodes.length; i++) {
                    const node = slideNodes[i] as HTMLElement;

                    // Force natural capture size
                    const dataUrl = await toJpeg(node, {
                        quality: 0.90,
                        pixelRatio: 1,
                        style: { transform: 'scale(1)', transformOrigin: 'top left', margin: '0' }
                    });

                    const response = await fetch(dataUrl);
                    const blob = await response.blob();
                    folder?.file(`slide-${i + 1}.jpg`, blob);
                }
            }

            // Generate and download
            const content = await zip.generateAsync({ type: 'blob' });
            saveAs(content, `Carousel_Content_Pack_${data.slides.length}.zip`);

        } catch (error) {
            console.error("ZIP Export failed", error);
            alert('ZIP Export failed. Please try again.');
        } finally {
            // STABILITY: Always revert the template, even on error
            setActiveTemplate(originalTemplate);
            setExportType(null);
        }
    };

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userEmail) return;
        setSubmitError(null);

        // SEC: Basic email format validation (client-side deterrent)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userEmail)) {
            setSubmitError('Please enter a valid email address.');
            return;
        }

        // SEC: Client-side rate limiter — 30s cooldown between submissions
        const RATE_LIMIT_KEY = 'email_submit_ts';
        const RATE_LIMIT_MS = 30_000;
        const lastSubmit = parseInt(localStorage.getItem(RATE_LIMIT_KEY) || '0', 10);
        if (Date.now() - lastSubmit < RATE_LIMIT_MS) {
            setSubmitError('Please wait a moment before submitting again.');
            return;
        }

        setIsSubmitting(true);
        try {
            const GOOGLE_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL
                || 'https://script.google.com/macros/s/AKfycbzSTejTd1NMUnWwF6NAK8Mmq6EmxNmddflmAaBG2dWORSeZ-HAO_TvTKjtihRkzU-LnCg/exec';

            localStorage.setItem(RATE_LIMIT_KEY, Date.now().toString());

            await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors', // Critical for Google Apps Script
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ email: userEmail.trim() })
            });

            // SUCCESS: Unlock the app permanently
            localStorage.setItem('carousel_unlocked', 'true');
            setShowLeadModal(false);

        } catch {
            console.error('Failed to save lead');
            // FAIL: Do NOT unlock — show inline error in modal
            setSubmitError('Failed to save. Please check your connection and try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const isExporting = exportType !== null;

    return (
        <>
            <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
                <button
                    onClick={exportToPDF}
                    disabled={isExporting}
                    className="flex-1 bg-white text-black font-bold rounded-xl px-4 py-3 hover:bg-zinc-200 transition-colors disabled:opacity-50 flex justify-center items-center"
                >
                    {exportType === 'pdf' ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <FileText className="w-4 h-4 mr-2" />
                    )}
                    <span>Download PDF (LinkedIn)</span>
                </button>
                <button
                    onClick={exportToZip}
                    disabled={isExporting}
                    className="flex-1 bg-transparent border border-white/10 hover:bg-white/5 disabled:bg-zinc-800/20 disabled:text-zinc-500 text-zinc-100 font-bold rounded-xl px-4 py-3 transition-all active:scale-[0.98] flex justify-center items-center"
                >
                    {exportType === 'zip' ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <FileArchive className="w-4 h-4 mr-2" />
                    )}
                    <span>Download ZIP (X / Instagram)</span>
                </button>
            </div>

            {showLeadModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 pointer-events-auto">
                    <div className="bg-zinc-950 border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl relative flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-6">
                            <span className="text-blue-500 text-3xl">🚀</span>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">You're crushing it.</h2>
                        <p className="text-zinc-400 mb-8 leading-relaxed">
                            You've reached your limit of 5 free exports for today. Enter your email to unlock <strong className="text-white">unlimited lifetime exports</strong> for free while we're in Beta.
                        </p>

                        <form onSubmit={handleEmailSubmit} className="w-full flex flex-col gap-4">
                            <input
                                type="email"
                                required
                                placeholder="founder@startup.com"
                                value={userEmail}
                                onChange={(e) => { setUserEmail(e.target.value); setSubmitError(null); }}
                                className="w-full bg-zinc-900 border border-white/10 rounded-xl p-4 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                            />
                            {submitError && (
                                <p className="text-red-400 text-xs font-medium bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{submitError}</p>
                            )}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-white text-black font-bold rounded-xl px-4 py-4 hover:bg-zinc-200 transition-colors disabled:opacity-50 flex justify-center items-center"
                            >
                                {isSubmitting ? 'Unlocking...' : 'Unlock Unlimited Exports'}
                            </button>
                        </form>
                        <button
                            onClick={() => setShowLeadModal(false)}
                            className="mt-6 text-xs text-zinc-500 hover:text-white transition-colors"
                        >
                            I'll just wait until tomorrow
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default ExportControls;
