import { MetadataRoute } from 'next';
import { ReviewLocal } from '@/lib/models/ReviewLocal';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://reviewqeem.online';
  
  // الصفحات الثابتة
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/reviews`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/theories`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // المراجعات المنشورة
  let reviewPages: MetadataRoute.Sitemap = [];
  try {
    const reviews = await ReviewLocal.find({ status: 'published' });
    reviewPages = reviews.map((review) => {
      const reviewObj = review.toObject();
      const slug = reviewObj.slug || reviewObj.id || reviewObj._id;
      return {
        url: `${baseUrl}/reviews/${slug}`,
        lastModified: reviewObj.updatedAt ? new Date(reviewObj.updatedAt) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: reviewObj.featured ? 0.9 : 0.8,
      };
    });
  } catch (error) {
    console.error('Error fetching reviews for sitemap:', error);
  }

  return [...staticPages, ...reviewPages];
}
