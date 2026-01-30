// ==================== Sanitize Utilities (TypeScript) ====================

/**
 * تنظيف HTML من المحتوى الضار
 * يعمل على السيرفر والمتصفح
 */
export function sanitizeHTML(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  // على السيرفر، نستخدم jsdom
  if (typeof window === 'undefined') {
    try {
      // Dynamic require للعمل على السيرفر فقط
      const { JSDOM } = require('jsdom');
      const createDOMPurify = require('dompurify');
      const window = new JSDOM('').window;
      const DOMPurify = createDOMPurify(window as any);

      return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: [
          'p',
          'br',
          'strong',
          'b',
          'em',
          'i',
          'u',
          'h1',
          'h2',
          'h3',
          'h4',
          'h5',
          'h6',
          'ul',
          'ol',
          'li',
          'a',
          'img',
          'blockquote',
          'code',
          'pre',
        ],
        ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'style'],
        ALLOW_DATA_ATTR: false,
      });
    } catch (error) {
      console.error('Error sanitizing HTML on server:', error);
      // Fallback: إزالة الوسوم الخطيرة فقط
      return html.replace(/<script[^>]*>.*?<\/script>/gi, '');
    }
  }

  // في المتصفح، نستخدم dompurify مباشرة
  try {
    // Dynamic import للعميل فقط
    const DOMPurify = require('dompurify');
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        'p',
        'br',
        'strong',
        'b',
        'em',
        'i',
        'u',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'ul',
        'ol',
        'li',
        'a',
        'img',
        'blockquote',
        'code',
        'pre',
      ],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'style'],
      ALLOW_DATA_ATTR: false,
    });
  } catch (error) {
    console.error('Error sanitizing HTML on client:', error);
    // Fallback: إزالة الوسوم الخطيرة فقط
    return html.replace(/<script[^>]*>.*?<\/script>/gi, '');
  }
}

/**
 * تنظيف نص عادي من HTML
 */
export function sanitizeText(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  // إزالة جميع وسوم HTML
  return text.replace(/<[^>]+>/g, '').trim();
}

/**
 * تنظيف URL
 */
export function sanitizeURL(url: string): string {
  if (!url || typeof url !== 'string') {
    return '';
  }

  // التحقق من أن URL آمن
  try {
    const parsed = new URL(url);
    // السماح فقط بـ http و https
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return '';
    }
    return url;
  } catch {
    return '';
  }
}
