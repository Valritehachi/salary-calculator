import { MetadataRoute } from 'next';

const BASE = 'https://salary-calculate.com';

const SALARY_AMOUNTS = [
  25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95,
  100, 110, 120, 125, 130, 140, 150, 175, 200, 250, 300,
];

const STATE_SLUGS = [
  'california', 'new-york', 'illinois', 'pennsylvania', 'ohio',
  'texas', 'florida', 'nevada', 'washington', 'tennessee',
];

const COMPARISON_PAIRS: [number, number][] = [
  [40, 50], [40, 60], [50, 60], [50, 75], [60, 70], [60, 80], [65, 80],
  [70, 80], [70, 90], [70, 100], [75, 100], [80, 90], [80, 100], [80, 120],
  [90, 100], [90, 120], [100, 120], [100, 125], [100, 150], [110, 130],
  [120, 150], [120, 175], [125, 150], [150, 200], [150, 250], [200, 250],
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  // Core pages
  entries.push(
    { url: BASE, lastModified: now, changeFrequency: 'monthly', priority: 1.0 },
    { url: `${BASE}/after-tax`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/salary-to-hourly`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/self-employment-tax`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/cost-of-living`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/job-offer-comparison`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/multiple-income`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/raise-calculator`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/paycheck-totals`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
  );

  // Salary after-tax — national (e.g. /80k-salary-after-tax)
  for (const amt of SALARY_AMOUNTS) {
    entries.push({
      url: `${BASE}/${amt}k-salary-after-tax`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.85,
    });
  }

  // Salary after-tax — by state (e.g. /80k-salary-after-tax-california)
  for (const amt of SALARY_AMOUNTS) {
    for (const state of STATE_SLUGS) {
      entries.push({
        url: `${BASE}/${amt}k-salary-after-tax-${state}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.8,
      });
    }
  }

  // Salary to hourly (e.g. /80k-salary-to-hourly)
  for (const amt of SALARY_AMOUNTS) {
    entries.push({
      url: `${BASE}/${amt}k-salary-to-hourly`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.75,
    });
  }

  // Salary comparisons (e.g. /80k-vs-100k-salary)
  for (const [a, b] of COMPARISON_PAIRS) {
    entries.push({
      url: `${BASE}/${a}k-vs-${b}k-salary`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    });
  }

  return entries;
}
