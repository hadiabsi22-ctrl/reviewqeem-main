import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://reviewqeem.online';
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/management-station/',
          '/api/',
          '/admin/',
          '/data/',
          '/node_modules/',
          '/*.json$',
          '/*.js$',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
