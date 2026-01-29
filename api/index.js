// Vercel Serverless Function
// هذا الملف يعمل كـ entry point لـ Vercel

// تعيين VERCEL environment variable
process.env.VERCEL = 'true';

// تحميل السيرفر
const app = require('../server');

// Vercel يتوقع handler function
module.exports = (req, res) => {
  return app(req, res);
};
