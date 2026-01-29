const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

/**
 * تنظيف HTML من المحتوى الضار
 */
function sanitizeHTML(html) {
  if (!html || typeof html !== 'string') {
    return '';
  }
  
  // تنظيف HTML مع السماح ببعض الوسوم الآمنة
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'code', 'pre'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'style'],
    ALLOW_DATA_ATTR: false
  });
}

/**
 * تنظيف نص عادي من HTML
 */
function sanitizeText(text) {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  // إزالة جميع وسوم HTML
  return text.replace(/<[^>]+>/g, '').trim();
}

/**
 * تنظيف URL
 */
function sanitizeURL(url) {
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

module.exports = {
  sanitizeHTML,
  sanitizeText,
  sanitizeURL
};
