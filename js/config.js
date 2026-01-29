// الإعدادات العامة
// API_BASE يعمل تلقائياً مع Vercel والمحلي
const getApiBaseUrl = () => {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    return isLocal ? 'http://127.0.0.1:8093/api' : '/api';
};

const API_CONFIG = {
    BASE_URL: getApiBaseUrl(),
    REVIEWS: '/reviews',
    GAMES: '/games'
};

