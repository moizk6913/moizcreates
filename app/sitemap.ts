import { MetadataRoute } from 'next';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://moizcreates.com';

  // Static routes
  const routes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/canvas`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/playground`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  try {
    // Dynamic Published Projects
    const projects = await db.projects.getPublished();
    projects.forEach((proj) => {
      routes.push({
        url: `${baseUrl}/canvas?folder=${proj.slug}`,
        lastModified: new Date(proj.updatedAt || proj.createdAt),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    });

    // Dynamic Published Blog Essays
    const posts = await db.blog.getAll(false);
    posts.forEach((post) => {
      routes.push({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: new Date(post.updatedAt || post.createdAt),
        changeFrequency: 'monthly',
        priority: 0.7,
      });
    });
  } catch (err) {
    console.warn('[Sitemap] Failed to load dynamic database entries:', err);
  }

  return routes;
}
