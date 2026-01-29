const fs = require('fs');
const path = require('path');
const ReviewLocal = require('../models/ReviewLocal');

/**
 * Generate sitemap.xml dynamically from all published reviews
 */
async function generateSitemap() {
  try {
    const baseUrl = process.env.SITE_URL || 'http://127.0.0.1:8093';
    const reviews = await ReviewLocal.find({ 'data.status': 'published' });
    
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Homepage -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Reviews List -->
  <url>
    <loc>${baseUrl}/reviews-list.html</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  
  <!-- Static Pages -->
  <url>
    <loc>${baseUrl}/about.html</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/contact.html</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/faq.html</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  
  <!-- Reviews -->
`;

    reviews.forEach(review => {
      const reviewData = review.data || review;
      const reviewId = reviewData._id || reviewData.id;
      // Generate slug if not exists
      let slug = reviewData.slug;
      if (!slug && reviewData.title) {
        slug = reviewData.title
          .toLowerCase()
          .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
          .replace(/^-+|-+$/g, '');
      }
      if (!slug) slug = reviewId;
      
      const lastmod = reviewData.updatedAt 
        ? new Date(reviewData.updatedAt).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];
      
      // Use clean URL (SEO-friendly)
      sitemap += `  <url>
    <loc>${baseUrl}/review/${slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
    });

    sitemap += `</urlset>`;

    // Write sitemap to public directory
    const sitemapPath = path.join(__dirname, '..', 'sitemap.xml');
    fs.writeFileSync(sitemapPath, sitemap, 'utf8');
    
    console.log(`✅ تم إنشاء sitemap.xml بنجاح (${reviews.length} مراجعة)`);
    return sitemap;
  } catch (error) {
    console.error('❌ خطأ في إنشاء sitemap.xml:', error);
    throw error;
  }
}

module.exports = { generateSitemap };
