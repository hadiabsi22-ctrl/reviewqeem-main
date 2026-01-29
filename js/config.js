// الإعدادات العامة
// API_BASE يعمل تلقائياً مع Vercel والمحلي
const API_CONFIG = {
    BASE_URL: (window.location.origin || 'http://localhost:8093') + '/api',
    REVIEWS: '/reviews',
    GAMES: '/games'
};

