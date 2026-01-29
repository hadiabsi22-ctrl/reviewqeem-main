// Vercel Serverless Function
// هذا الملف يعمل كـ entry point لـ Vercel

// تعيين VERCEL environment variable قبل تحميل server
// مهم جداً: يجب تعيين NODE_ENV قبل تحميل server.js
process.env.VERCEL = 'true';
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
}

// التأكد من أن NODE_ENV معرّف قبل تحميل server
console.log('🔧 Vercel Environment:', {
  VERCEL: process.env.VERCEL,
  NODE_ENV: process.env.NODE_ENV
});

// تحميل السيرفر
const app = require('../server');

// Vercel يتوقع handler function
// Express app هو بالفعل handler function
module.exports = app;
