import { getServerSideSitemap, ISitemapField } from 'next-sitemap';
import { isSanityConfigured, sanityClient } from '@/lib/sanityClient';

interface SitemapProduct {
  slug: string;
  _updatedAt: string;
}

export async function GET() {
  const query = `*[_type == "product"]{ "slug": slug.current, _updatedAt }`;
  const products = isSanityConfigured ? await sanityClient.fetch<SitemapProduct[]>(query) : [];

  const fields: ISitemapField[] = products.map((product) => ({
    loc: `${process.env.NEXT_PUBLIC_SITE_URL}/product/${product.slug}`,
    lastmod: product._updatedAt,
    changefreq: 'weekly',
    priority: 0.8,
  }));

  // Add static pages
  fields.push(
    {
      loc: `${process.env.NEXT_PUBLIC_SITE_URL}/`,
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
      priority: 1.0,
    },
    {
      loc: `${process.env.NEXT_PUBLIC_SITE_URL}/ready-to-wear`,
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
      priority: 0.9,
    },
    {
      loc: `${process.env.NEXT_PUBLIC_SITE_URL}/bridal`,
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
      priority: 0.9,
    }
  );

  return getServerSideSitemap(fields);
}
