import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const baseUrl = (envUrl && !envUrl.includes('moizkhan')) ? envUrl : 'https://moizcreates.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
