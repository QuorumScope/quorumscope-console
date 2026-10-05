import type { MetadataRoute } from 'next';

// No public production site exists yet, so no crawler is invited. Change this when one does.
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: '*', disallow: '/' } };
}
