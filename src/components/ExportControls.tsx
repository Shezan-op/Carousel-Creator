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
    isUnlocked: boolean;
    hasGivenFeedback: boolean;
}

const ExportControls: React.FC<Props> = ({ data, activeTemplate, setActiveTemplate, isUnlocked, hasGivenFeedback }) => {
    const [exportType, setExportType] = useState<'pdf' | 'zip' | null>(null);

    const exportToPDF = async () => {
        const currentCount = parseInt(localStorage.getItem('carousel_export_count') || '0', 10);
        // Double-check: React state might lag behind localStorage if Tally just fired
        const effectivelyUnlocked = isUnlocked || localStorage.getItem('carousel_unlocked') === 'true';
        if (currentCount >= 3 && !effectivelyUnlocked) {
            // @ts-expect-error - Tally from global script
            if (window.Tally) window.Tally.openPopup('MeA7bM', {
                layout: 'modal',
                hideTitle: true,
                transparentBackground: true,
                formEventsForwarding: true
            });
            return; // Block the export
        }

        // FONT EXPORT SAFETY: Wait for all fonts to load before capturing
        await document.fonts.ready;

        setExportType('pdf');
        try {
            // Force UI to stack mode temporarily if needed, wait for render
            await new Promise(resolve => setTimeout(resolve, 500));

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
                const scale = 1080 / node.offsetWidth;

                // Process ONE slide completely before moving to the next
                const dataUrl: string | null = await toJpeg(node, {
                    quality: 0.90,
                    pixelRatio: scale,
                    style: { transform: 'none', margin: '0' } // Reset transforms for capture
                });

                if (i !== 0) pdf.addPage([1080, 1350], 'portrait');
                pdf.addImage(dataUrl, 'JPEG', 0, 0, 1080, 1350, `slide_${i}`, 'FAST');

                // Explicitly clear memory to prevent RAM spike
                // @ts-ignore
                node.style.transform = '';
            }

            pdf.save('carousel.pdf');

            // 1. Increment Count
            let updatedCount = parseInt(localStorage.getItem('carousel_export_count') || '0', 10);
            if (isNaN(updatedCount)) updatedCount = 0;
            updatedCount += 1;
            localStorage.setItem('carousel_export_count', updatedCount.toString());

            // 2. The Feedback Loop (Ask on 1st export if not given)
            if (updatedCount === 1 && !hasGivenFeedback) {
                // @ts-expect-error - Tally from global script
                if (window.Tally) window.Tally.openPopup('zxK1DR', {
                    layout: 'modal',
                    hideTitle: true,
                    transparentBackground: true,
                    formEventsForwarding: true
                });
            }
        } catch {
            console.error('Export Error: PDF generation failed.');
            alert('Failed to export PDF.');
        } finally {
            setExportType(null);
        }
    };

    const exportToZip = async () => {
        const currentCount = parseInt(localStorage.getItem('carousel_export_count') || '0', 10);
        // Double-check: React state might lag behind localStorage if Tally just fired
        const effectivelyUnlocked = isUnlocked || localStorage.getItem('carousel_unlocked') === 'true';
        if (currentCount >= 3 && !effectivelyUnlocked) {
            // @ts-expect-error - Tally from global script
            if (window.Tally) window.Tally.openPopup('MeA7bM', {
                layout: 'modal',
                hideTitle: true,
                transparentBackground: true,
                formEventsForwarding: true
            });
            return; // Block the export
        }

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
                    const scale = 1080 / node.offsetWidth;

                    // Process ONE slide completely before moving to the next
                    const dataUrl = await toJpeg(node, {
                        quality: 0.90,
                        pixelRatio: scale,
                        style: { transform: 'none', margin: '0' } // Reset transforms for capture
                    });

                    const response = await fetch(dataUrl);
                    const blob = await response.blob();
                    folder?.file(`slide-${i + 1}.jpg`, blob);

                    // Explicitly clear memory to prevent RAM spike
                    // @ts-ignore
                    node.style.transform = '';
                }
            }

            // Generate and download
            const content = await zip.generateAsync({ type: 'blob' });
            saveAs(content, `Carousel_Content_Pack_${data.slides.length}.zip`);

            // 1. Increment Count
            let updatedCount = parseInt(localStorage.getItem('carousel_export_count') || '0', 10);
            if (isNaN(updatedCount)) updatedCount = 0;
            updatedCount += 1;
            localStorage.setItem('carousel_export_count', updatedCount.toString());

            // 2. The Feedback Loop (Ask on 1st export if not given)
            if (updatedCount === 1 && !hasGivenFeedback) {
                // @ts-expect-error - Tally from global script
                if (window.Tally) window.Tally.openPopup('zxK1DR', { layout: 'modal', autoClose: 0, formEventsForwarding: true });
            }

        } catch (error) {
            console.error("ZIP Export failed", error);
            alert('ZIP Export failed. Please try again.');
        } finally {
            // STABILITY: Always revert the template, even on error
            setActiveTemplate(originalTemplate);
            setExportType(null);
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
                    id="btn-export-zip"
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
        </>
    );
};

export default ExportControls;
