import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://salary-calculate.com';

  return [
    { url: base, lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },
    { url: `${base}/after-tax`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/salary-to-hourly`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/self-employment-tax`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/cost-of-living`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/job-offer-comparison`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/multiple-income`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/raise-calculator`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/paycheck-totals`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
  ];
}
