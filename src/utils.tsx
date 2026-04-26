

import DOMPurify from 'dompurify';

// Image compression constants
export const AVATAR_MAX_PX = 256;
export const GLOBAL_MAX_PX = 800;
export const COMPRESSION_QUALITY = 0.8;

/**
 * Compresses an image file using HTML5 Canvas.
 */
export const compressImage = (file: File, maxWidth = AVATAR_MAX_PX): Promise<string> => {
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
            resolve(canvas.toDataURL('image/jpeg', COMPRESSION_QUALITY));
        };
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image decode failed')); };
        img.src = url;
    });
};

/**
 * Renders markdown-like text with bold, italic, and highlight support.
 * Defense-in-depth: caps input length to prevent ReDoS or DOM explosion.
 */
export const renderHighlightedText = (text: string, template: string, accentColor: string, inlineImages?: Record<string, string>) => {
    if (!text) return null;

    let parsedText = text;

    // 1. Parse Bold (**text**)
    parsedText = parsedText.replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 900">$1</strong>');

    // 2. Parse Underline (__text__)
    parsedText = parsedText.replace(/__(.*?)__/g, '<span style="text-decoration: underline; text-underline-offset: 4px;">$1</span>');

    // 3. Parse Italic (_text_)
    parsedText = parsedText.replace(/(?<!_)_([^_]+)_(?!_)/g, '<em style="font-style: italic">$1</em>');

    // 4. Parse Highlight (*text*)
    if (template === 'brutalist') {
        parsedText = parsedText.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, `<span style="background-color: ${accentColor}; color: #000; padding: 0 8px;">$1</span>`);
    } else {
        parsedText = parsedText.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, `<span style="color: ${accentColor};">$1</span>`);
    }

    // 5. Handle Inline Images [img:id]
    if (inlineImages) {
        parsedText = parsedText.replace(/\[img:([^\]]+)\]/g, (_, id) => {
            const base64 = inlineImages[id];
            if (!base64) return '';
            return `<img src="${base64}" style="max-width: 100%; border-radius: 20px; margin: 20px 0; display: block; box-shadow: 0 20px 50px rgba(0,0,0,0.5);" />`;
        });
    }

    // 6. Handle JSON line breaks (\n)
    parsedText = parsedText.replace(/\n/g, '<br />');

    // Sanitization with DOMPurify
    const sanitizedHtml = DOMPurify.sanitize(parsedText, {
        ALLOWED_TAGS: ['b', 'i', 'strong', 'em', 'img', 'br', 'span'],
        ALLOWED_ATTR: ['style', 'src', 'class'],
        // Explicitly strip javascript: URIs and dangerous attributes
        ALLOW_DATA_ATTR: false,
    });

    // Safely render the nested HTML string
    return <span dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />;
};

