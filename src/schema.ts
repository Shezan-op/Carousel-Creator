import { z } from 'zod';

/**
 * Regex for Hex, RGB, and RGBA validation.
 * Supports: #FFF, #FFFFFF, rgb(255, 255, 255), rgba(255, 255, 255, 0.5)
 */
const colorRegex = /^#([A-Fa-f0-9]{3}){1,2}$|^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$|^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(0|1|0\.\d+)\s*\)$/;

export const themeSchema = z.object({
  background: z.string(),
  text: z.string(),
  accent: z.string().regex(colorRegex, "Invalid accent color format. Must be Hex, RGB, or RGBA."),
});

export const slideSchema = z.object({
  slide_number: z.number(),
  type: z.enum(['title', 'content', 'cta']),
  headline: z.string().optional(),
  subheadline: z.string().optional(),
  subheading: z.string().optional(),
  body: z.string().optional(),
  heading_size: z.number().optional(),
  subheading_size: z.number().optional(),
  subheadline_size: z.number().optional(),
  body_size: z.number().optional(),
  text_align: z.enum(['left', 'center', 'right']).optional(),
  y_offset: z.number().optional(),
  bg_image: z.string().optional(),
});

export const carouselDataSchema = z.object({
  theme: themeSchema,
  slides: z.array(slideSchema),
});

export const savedProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  date: z.string(),
  bulkText: z.string(),
  theme: themeSchema,
  inlineImages: z.record(z.string(), z.string()),
});

export const brandPresetSchema = z.object({
  id: z.string(),
  name: z.string(),
  theme: themeSchema,
  fonts: z.object({ heading: z.string(), subheading: z.string(), body: z.string() }),
  author: z.object({ name: z.string(), handle: z.string(), avatar: z.string().optional() }),
});

export const projectFileSchema = z.object({
  version: z.string().optional(),
  bulkText: z.string(),
  theme: themeSchema,
  inlineImages: z.record(z.string(), z.string()).optional(),
});

