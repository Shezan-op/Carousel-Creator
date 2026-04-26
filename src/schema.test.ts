import { describe, it, expect } from 'vitest';
import { projectFileSchema, themeSchema } from './schema';

describe('Security Validation: Project File Schema', () => {

  it('should accept valid hex, rgb, and rgba colors', () => {
    const validColors = ['#FFF', '#FAFAFA', 'rgb(0,0,0)', 'rgba(255, 255, 255, 0.5)'];
    validColors.forEach(color => {
      const result = themeSchema.safeParse({
        background: '#000',
        text: '#FFF',
        accent: color
      });
      expect(result.success).toBe(true);
    });
  });

  it('should reject malicious accentColor payloads (XSS/Attribute Injection)', () => {
    const maliciousPayloads = [
      '"> <img src=x onerror=alert(1)>',
      'red; background: url("http://evil.com")',
      '#000; color: red',
      'javascript:alert(1)'
    ];

    maliciousPayloads.forEach(payload => {
      const result = projectFileSchema.safeParse({
        bulkText: 'Test Content',
        theme: {
          background: '#000',
          text: '#FFF',
          accent: payload
        }
      });

      expect(result.success).toBe(false);
    });
  });

  it('should reject missing required fields', () => {
    const invalid = {
      theme: { background: '#000', text: '#FFF', accent: '#F00' }
      // bulkText missing
    };
    const result = projectFileSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('should accept a complete valid project object', () => {
    const validProject = {
      version: "1.0",
      bulkText: "Slide 1\n\nSlide 2",
      theme: {
        background: "#09090B",
        text: "#FFFFFF",
        accent: "#3B82F6"
      },
      inlineImages: {
        "img1": "data:image/png;base64,..."
      }
    };
    const result = projectFileSchema.safeParse(validProject);
    expect(result.success).toBe(true);
  });

});
