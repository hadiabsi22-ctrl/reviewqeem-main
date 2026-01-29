// Vercel Serverless Function
// هذا الملف يعمل كـ entry point لـ Vercel

const app = require('../server');

// Vercel يتوقع export default handler
module.exports = app;
