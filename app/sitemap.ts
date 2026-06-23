import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bikoldictionary.app';

  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/browse`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/learn`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/flashcards`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/frequency-list`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
  ];

  // Dynamic word routes — include both Root and legacy Word tables
  try {
    const wordRoutes: MetadataRoute.Sitemap = [];
    const seenBikol = new Set<string>();

    // Fetch from both tables in parallel
    const [words, roots] = await Promise.all([
      prisma.word.findMany({
        select: { bikol: true },
        orderBy: { bikol: 'asc' },
        take: 5000,
      }),
      prisma.root.findMany({
        select: { bikol: true },
        orderBy: { bikol: 'asc' },
        take: 5000,
      }).catch(() => []),
    ]);

    for (const entry of [...words, ...roots]) {
      const { bikol } = entry;
      if (bikol && !seenBikol.has(bikol)) {
        seenBikol.add(bikol);
        wordRoutes.push({ url: `${baseUrl}/word/${encodeURIComponent(bikol)}`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.5 });
      }
    }

    return [...staticRoutes, ...wordRoutes];
  } catch {
    return staticRoutes;
  }
}
