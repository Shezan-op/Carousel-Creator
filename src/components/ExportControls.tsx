import React, { useState } from 'react';
import { Loader2, FileArchive, FileText } from 'lucide-react';
import type { CarouselData } from '../types';
import { toJpeg } from 'html-to-image';
import jsPDF from 'jspdf';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface Props {
    data: CarouselData;
}

const ExportControls: React.FC<Props> = ({ data }) => {
    const [exportType, setExportType] = useState<'pdf' | 'zip' | null>(null);

    const base64ToBlob = (base64: string, type: string) => {
        const binStr = atob(base64.split(',')[1]);
        const len = binStr.length;
        const arr = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            arr[i] = binStr.charCodeAt(i);
        }
        return new Blob([arr], { type });
    };

    const exportToPDF = async () => {
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
        // FONT EXPORT SAFETY: Wait for all fonts to load before capturing
        await document.fonts.ready;

        setExportType('zip');
        try {
            const slideNodes = Array.from(document.querySelectorAll('.slide-export-node')) as HTMLElement[];
            if (slideNodes.length === 0) return;

            const zip = new JSZip();

            for (let i = 0; i < slideNodes.length; i++) {
                const node = slideNodes[i];

                let imgData: string | null = await toJpeg(node, {
                    quality: 0.90,
                    pixelRatio: 1,
                    style: { transform: 'scale(1)', transformOrigin: 'top left', margin: '0' }
                });
                const imageBlob = base64ToBlob(imgData, 'image/jpeg');
                zip.file(`slide-${i + 1}.jpg`, imageBlob);

                // PERF: Null the dataUrl immediately so GC can reclaim memory before next slide
                imgData = null;
            }

            let content: Blob | null = await zip.generateAsync({ type: 'blob' });
            saveAs(content, `carousel-social-${data.slides.length}.zip`);

            // MEMORY LEAK FIX: Force garbage collection of the zip Blob to prevent
            // browser crashes on mobile devices with limited memory
            content = null;
        } catch {
            console.error('Export Error: ZIP generation failed.');
            alert('Failed to export ZIP.');
        } finally {
            setExportType(null);
        }
    };

    const isExporting = exportType !== null;

    return (
        <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
            <button
                onClick={exportToPDF}
                disabled={isExporting}
                className="flex-1 bg-white text-black hover:bg-zinc-200 disabled:bg-zinc-800 disabled:text-zinc-500 font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center transition-all shadow-sm active:scale-[0.98]"
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
                className="flex-1 bg-transparent border border-white/10 hover:bg-white/5 disabled:bg-zinc-800/20 disabled:text-zinc-500 text-zinc-100 font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center transition-all active:scale-[0.98]"
            >
                {exportType === 'zip' ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                    <FileArchive className="w-4 h-4 mr-2" />
                )}
                <span>Download ZIP (X / Instagram)</span>
            </button>
        </div>
    );
};

export default ExportControls;
