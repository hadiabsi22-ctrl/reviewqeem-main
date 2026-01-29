// Vercel Serverless Function
// هذا الملف يعمل كـ entry point لـ Vercel

// تعيين VERCEL environment variable قبل تحميل server
process.env.VERCEL = 'true';
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// تحميل السيرفر
const app = require('../server');

// Vercel يتوقع handler function
// Express app هو بالفعل handler function
module.exports = app;
