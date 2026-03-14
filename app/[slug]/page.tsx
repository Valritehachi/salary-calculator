import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';

// ─── State data ───────────────────────────────────────────────────────────────

const STATE_DATA: Record<string, { name: string; rate: number }> = {
  california: { name: 'California', rate: 8.0 },
  'new-york': { name: 'New York', rate: 6.85 },
  illinois: { name: 'Illinois', rate: 4.95 },
  pennsylvania: { name: 'Pennsylvania', rate: 3.07 },
  ohio: { name: 'Ohio', rate: 2.85 },
  texas: { name: 'Texas', rate: 0 },
  florida: { name: 'Florida', rate: 0 },
  nevada: { name: 'Nevada', rate: 0 },
  washington: { name: 'Washington', rate: 0 },
  tennessee: { name: 'Tennessee', rate: 0 },
};

const SALARY_AMOUNTS = [
  25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95,
  100, 110, 120, 125, 130, 140, 150, 175, 200, 250, 300,
];

const COMPARISON_PAIRS: [number, number][] = [
  [40, 50], [40, 60], [50, 60], [50, 75], [60, 70], [60, 80], [65, 80],
  [70, 80], [70, 90], [70, 100], [75, 100], [80, 90], [80, 100], [80, 120],
  [90, 100], [90, 120], [100, 120], [100, 125], [100, 150], [110, 130],
  [120, 150], [120, 175], [125, 150], [150, 200], [150, 250], [200, 250],
];

// ─── Tax math ─────────────────────────────────────────────────────────────────

function calculateFederalTax(salary: number): number {
  const brackets = [
    { max: 11000, rate: 0.10 },
    { max: 44725, rate: 0.12 },
    { max: 95375, rate: 0.22 },
    { max: 182100, rate: 0.24 },
    { max: 231250, rate: 0.32 },
    { max: 578125, rate: 0.35 },
    { max: Infinity, rate: 0.37 },
  ];
  let tax = 0;
  let prev = 0;
  for (const b of brackets) {
    if (salary <= prev) break;
    tax += (Math.min(salary, b.max) - prev) * b.rate;
    prev = b.max;
  }
  return tax;
}

interface TaxBreakdown {
  gross: number;
  federal: number;
  state: number;
  fica: number;
  totalTax: number;
  takeHome: number;
  effectiveRate: number;
  monthly: number;
  biweekly: number;
  weekly: number;
  hourly: number;
}

function calcBreakdown(salary: number, stateRate: number): TaxBreakdown {
  const federal = calculateFederalTax(salary);
  const state = salary * stateRate / 100;
  const fica = Math.min(salary, 160200) * 0.0765;
  const totalTax = federal + state + fica;
  const takeHome = salary - totalTax;
  return {
    gross: salary, federal, state, fica, totalTax, takeHome,
    effectiveRate: (totalTax / salary) * 100,
    monthly: takeHome / 12,
    biweekly: takeHome / 26,
    weekly: takeHome / 52,
    hourly: takeHome / 2080,
  };
}

// ─── Formatting ───────────────────────────────────────────────────────────────

function fmt(n: number) {
  return '$' + Math.round(n).toLocaleString('en-US');
}

function fmtDec(n: number) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtPct(n: number) {
  return n.toFixed(1) + '%';
}

function salaryLabel(salary: number) {
  if (salary >= 100000) return 'a six-figure income, above the US median household income (~$75k). Strong in most cities.';
  if (salary >= 75000) return 'above the US median household income (~$75k). Solid in most US cities.';
  if (salary >= 50000) return 'near the US median individual income. Comfortable in lower cost-of-living areas.';
  return 'below the US median. Livability depends heavily on your location and expenses.';
}

// ─── Slug parsing ─────────────────────────────────────────────────────────────

type PageDef =
  | { kind: 'after-tax'; salary: number; stateSlug: string | null }
  | { kind: 'to-hourly'; salary: number }
  | { kind: 'comparison'; salary1: number; salary2: number };

function parseSlug(slug: string): PageDef | null {
  const cmpMatch = slug.match(/^(\d+)k-vs-(\d+)k-salary$/);
  if (cmpMatch) {
    const s1 = parseInt(cmpMatch[1]);
    const s2 = parseInt(cmpMatch[2]);
    if (COMPARISON_PAIRS.some(([a, b]) => a === s1 && b === s2))
      return { kind: 'comparison', salary1: s1 * 1000, salary2: s2 * 1000 };
    return null;
  }

  const hourlyMatch = slug.match(/^(\d+)k-salary-to-hourly$/);
  if (hourlyMatch) {
    const amt = parseInt(hourlyMatch[1]);
    if (SALARY_AMOUNTS.includes(amt)) return { kind: 'to-hourly', salary: amt * 1000 };
    return null;
  }

  const stateMatch = slug.match(/^(\d+)k-salary-after-tax-(.+)$/);
  if (stateMatch) {
    const amt = parseInt(stateMatch[1]);
    const stateSlug = stateMatch[2];
    if (SALARY_AMOUNTS.includes(amt) && stateSlug in STATE_DATA)
      return { kind: 'after-tax', salary: amt * 1000, stateSlug };
    return null;
  }

  const natMatch = slug.match(/^(\d+)k-salary-after-tax$/);
  if (natMatch) {
    const amt = parseInt(natMatch[1]);
    if (SALARY_AMOUNTS.includes(amt)) return { kind: 'after-tax', salary: amt * 1000, stateSlug: null };
    return null;
  }

  return null;
}

// ─── Static params ────────────────────────────────────────────────────────────

export function generateStaticParams() {
  const slugs: { slug: string }[] = [];
  for (const amt of SALARY_AMOUNTS) {
    slugs.push({ slug: `${amt}k-salary-after-tax` });
    slugs.push({ slug: `${amt}k-salary-to-hourly` });
    for (const stateSlug of Object.keys(STATE_DATA))
      slugs.push({ slug: `${amt}k-salary-after-tax-${stateSlug}` });
  }
  for (const [a, b] of COMPARISON_PAIRS)
    slugs.push({ slug: `${a}k-vs-${b}k-salary` });
  return slugs;
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const parsed = parseSlug(slug);
  if (!parsed) return {};

  if (parsed.kind === 'after-tax') {
    const { salary, stateSlug } = parsed;
    const k = salary / 1000;
    if (stateSlug) {
      const st = STATE_DATA[stateSlug];
      return {
        title: `$${k}k Salary After Tax in ${st.name} (2025) — Take-Home Pay`,
        description: `How much is a $${k},000 salary after taxes in ${st.name}? See your exact take-home pay, monthly income, and tax breakdown.`,
        alternates: { canonical: `https://salary-calculate.com/${slug}` },
      };
    }
    return {
      title: `$${k}k Salary After Tax (2025) — Take-Home Pay Calculator`,
      description: `How much is $${k},000 a year after taxes? See your take-home pay, monthly income, federal tax, FICA, and effective tax rate.`,
      alternates: { canonical: `https://salary-calculate.com/${slug}` },
    };
  }

  if (parsed.kind === 'to-hourly') {
    const k = parsed.salary / 1000;
    return {
      title: `$${k}k a Year Is How Much an Hour? — Salary to Hourly`,
      description: `Convert a $${k},000 annual salary to an hourly wage. See your hourly, daily, weekly, bi-weekly, and monthly pay breakdown.`,
      alternates: { canonical: `https://salary-calculate.com/${slug}` },
    };
  }

  const k1 = parsed.salary1 / 1000;
  const k2 = parsed.salary2 / 1000;
  return {
    title: `$${k1}k vs $${k2}k Salary — After-Tax Comparison (2025)`,
    description: `Compare $${k1},000 vs $${k2},000 salary after taxes. See the real difference in take-home pay, monthly income, and effective tax rates.`,
    alternates: { canonical: `https://salary-calculate.com/${slug}` },
  };
}

// ─── Shared ───────────────────────────────────────────────────────────────────

function BackLink() {
  return (
    <Link href="/" className="text-white/70 hover:text-white text-sm mb-4 inline-block">
      ← All Calculators
    </Link>
  );
}

function InlineNote({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="space-y-2 pt-2">
      {items.map(({ q, a }) => (
        <p key={q} className="text-sm text-gray-500">
          <span className="font-medium text-gray-700">{q}</span>{' '}{a}
        </p>
      ))}
    </div>
  );
}

// ─── After-tax page ───────────────────────────────────────────────────────────

function AfterTaxPage({ salary, stateSlug }: { salary: number; stateSlug: string | null }) {
  const stateData = stateSlug ? STATE_DATA[stateSlug] : null;
  const stateRate = stateData?.rate ?? 4.5;
  const stateName = stateData?.name ?? null;
  const k = salary / 1000;
  const t = calcBreakdown(salary, stateRate);

  const marginalBracket =
    salary <= 11000 ? '10%' : salary <= 44725 ? '12%' : salary <= 95375 ? '22%'
    : salary <= 182100 ? '24%' : salary <= 231250 ? '32%' : salary <= 578125 ? '35%' : '37%';

  const inlineNotes = [
    {
      q: `Is $${k}k a good salary?`,
      a: salaryLabel(salary),
    },
    stateData && stateData.rate > 0 ? {
      q: `How does ${stateName} compare to no-tax states?`,
      a: `The ${stateData.rate}% state tax costs ${fmt(t.state)}/year. In Texas or Florida you'd keep that — ${fmt(t.state / 12)} more per month.`,
    } : stateData && stateData.rate === 0 ? {
      q: `Why does ${stateName} have higher take-home?`,
      a: `${stateName} has no state income tax. vs California (8%), you save ${fmt(calcBreakdown(salary, 8).state)}/year.`,
    } : {
      q: 'What federal bracket does this fall in?',
      a: `At $${k}k you're in the ${marginalBracket} marginal bracket, but your effective rate is ${fmtPct(t.effectiveRate)} since lower income is taxed at lower rates.`,
    },
  ].filter(Boolean) as { q: string; a: string }[];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <BackLink />
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {stateName ? `$${k}k Salary After Tax in ${stateName}` : `$${k}k Salary After Tax`}
          </h1>
          <p className="text-blue-100 text-lg">
            See your take-home pay, tax breakdown, and monthly income for a {fmt(salary)} salary{stateName ? ` in ${stateName}` : ''}.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* Key numbers */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Annual Take-Home', value: fmt(t.takeHome) },
            { label: 'Monthly Take-Home', value: fmt(t.monthly) },
            { label: 'Bi-Weekly', value: fmt(t.biweekly) },
            { label: 'Effective Tax Rate', value: fmtPct(t.effectiveRate) },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
              <div className="text-2xl font-bold text-blue-700">{value}</div>
              <div className="text-xs text-gray-500 mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Tax breakdown */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Tax Breakdown</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="pb-2 font-medium">Tax Type</th>
                <th className="pb-2 font-medium text-right">Amount</th>
                <th className="pb-2 font-medium text-right">% of Gross</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <tr>
                <td className="py-2.5 text-gray-700">Gross Salary</td>
                <td className="py-2.5 text-right font-medium text-gray-900">{fmt(salary)}</td>
                <td className="py-2.5 text-right text-gray-500">100%</td>
              </tr>
              <tr>
                <td className="py-2.5 text-gray-700">− Federal Income Tax</td>
                <td className="py-2.5 text-right text-red-500">−{fmt(t.federal)}</td>
                <td className="py-2.5 text-right text-gray-500">{fmtPct(t.federal / salary * 100)}</td>
              </tr>
              <tr>
                <td className="py-2.5 text-gray-700">− {stateName ? `${stateName} State Tax` : 'State Tax (est. avg)'}</td>
                <td className="py-2.5 text-right text-red-500">−{fmt(t.state)}</td>
                <td className="py-2.5 text-right text-gray-500">{fmtPct(t.state / salary * 100)}</td>
              </tr>
              <tr>
                <td className="py-2.5 text-gray-700">− FICA (SS + Medicare)</td>
                <td className="py-2.5 text-right text-red-500">−{fmt(t.fica)}</td>
                <td className="py-2.5 text-right text-gray-500">{fmtPct(t.fica / salary * 100)}</td>
              </tr>
              <tr className="bg-blue-50">
                <td className="py-3 font-semibold text-gray-900 pl-2 rounded-bl-lg">Take-Home Pay</td>
                <td className="py-3 text-right font-bold text-blue-700">{fmt(t.takeHome)}</td>
                <td className="py-3 text-right text-blue-600 font-medium rounded-br-lg pr-2">{fmtPct(100 - t.effectiveRate)}</td>
              </tr>
            </tbody>
          </table>
          {!stateName && (
            <p className="text-xs text-gray-400 mt-3">* State tax estimated using a blended average rate. Select your state below for an exact figure.</p>
          )}
        </div>

        {/* Pay schedule */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Pay Schedule</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="pb-2 font-medium">Period</th>
                <th className="pb-2 font-medium text-right">Gross</th>
                <th className="pb-2 font-medium text-right">After Tax</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[
                { label: 'Annual', gross: salary, net: t.takeHome },
                { label: 'Monthly', gross: salary / 12, net: t.monthly },
                { label: 'Bi-Weekly', gross: salary / 26, net: t.biweekly },
                { label: 'Weekly', gross: salary / 52, net: t.weekly },
                { label: 'Daily (5-day week)', gross: salary / 260, net: t.takeHome / 260 },
                { label: 'Hourly (40 hrs/wk)', gross: salary / 2080, net: t.hourly },
              ].map(row => (
                <tr key={row.label}>
                  <td className="py-2.5 text-gray-700">{row.label}</td>
                  <td className="py-2.5 text-right text-gray-400">{fmtDec(row.gross)}</td>
                  <td className="py-2.5 text-right font-medium text-gray-900">{fmtDec(row.net)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* State selector */}
        {!stateName && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6">
            <h2 className="text-base font-semibold text-indigo-900 mb-1">See your exact state take-home</h2>
            <p className="text-sm text-indigo-700 mb-4">
              Florida and Texas have 0% state income tax. California taxes up to 8%. Pick your state:
            </p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(STATE_DATA).map(([s, d]) => (
                <Link key={s} href={`/${k}k-salary-after-tax-${s}`}
                  className="px-3 py-1.5 bg-white border border-indigo-200 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors">
                  {d.name} {d.rate === 0 ? '(no tax)' : `(${d.rate}%)`}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* State comparison table */}
        {stateName && stateData && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Compare to Other States</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="pb-2 font-medium">State</th>
                  <th className="pb-2 font-medium text-right">State Rate</th>
                  <th className="pb-2 font-medium text-right">Annual Take-Home</th>
                  <th className="pb-2 font-medium text-right">vs {stateName}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {Object.entries(STATE_DATA)
                  .sort((a, b) => b[1].rate - a[1].rate)
                  .map(([s, d]) => {
                    const comp = calcBreakdown(salary, d.rate);
                    const diff = comp.takeHome - t.takeHome;
                    const isCurrent = s === stateSlug;
                    return (
                      <tr key={s} className={isCurrent ? 'bg-blue-50 font-semibold' : ''}>
                        <td className="py-2.5 text-gray-700">
                          {isCurrent ? `${d.name} ★` : (
                            <Link href={`/${k}k-salary-after-tax-${s}`} className="text-blue-600 hover:underline">{d.name}</Link>
                          )}
                        </td>
                        <td className="py-2.5 text-right text-gray-500">{d.rate === 0 ? 'None' : `${d.rate}%`}</td>
                        <td className="py-2.5 text-right text-gray-900">{fmt(comp.takeHome)}</td>
                        <td className={`py-2.5 text-right ${isCurrent ? 'text-gray-400' : diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                          {isCurrent ? '—' : diff > 0 ? `+${fmt(diff)}` : fmt(diff)}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}

        {/* CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white text-center">
          <h2 className="text-xl font-bold mb-2">Customize Your Calculation</h2>
          <p className="text-blue-100 mb-4 text-sm">Adjust filing status, add deductions, or compare job offers.</p>
          <Link href="/after-tax" className="inline-block bg-white text-blue-700 font-semibold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors">
            Open Full Calculator →
          </Link>
        </div>

        {/* Related + inline notes */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div className="flex flex-wrap gap-2">
            {SALARY_AMOUNTS.filter(a => a !== k && Math.abs(a - k) <= 20).slice(0, 5).map(a => (
              <Link key={a} href={stateSlug ? `/${a}k-salary-after-tax-${stateSlug}` : `/${a}k-salary-after-tax`}
                className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
                ${a}k after tax{stateName ? ` in ${stateName}` : ''}
              </Link>
            ))}
            <Link href={`/${k}k-salary-to-hourly`}
              className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors">
              ${k}k to hourly
            </Link>
            {COMPARISON_PAIRS.filter(([a, b]) => a === k || b === k).slice(0, 2).map(([a, b]) => (
              <Link key={`${a}-${b}`} href={`/${a}k-vs-${b}k-salary`}
                className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors">
                ${a}k vs ${b}k
              </Link>
            ))}
          </div>
          <InlineNote items={inlineNotes} />
        </div>

      </div>
    </div>
  );
}

// ─── Salary-to-hourly page ────────────────────────────────────────────────────

function SalaryToHourlyPage({ salary }: { salary: number }) {
  const k = salary / 1000;
  const takeHomeNoState = calcBreakdown(salary, 0).takeHome;
  const afterTaxHourly = takeHomeNoState / 2080;

  const rows = [
    { label: 'Hourly (40 hrs/week)', value: salary / 2080 },
    { label: 'Hourly (37.5 hrs/week)', value: salary / 1950 },
    { label: 'Daily (8 hrs)', value: salary / 260 },
    { label: 'Weekly', value: salary / 52 },
    { label: 'Bi-Weekly', value: salary / 26 },
    { label: 'Semi-Monthly', value: salary / 24 },
    { label: 'Monthly', value: salary / 12 },
    { label: 'Annual', value: salary },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-green-600 to-teal-700 text-white px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <BackLink />
          <h1 className="text-3xl md:text-4xl font-bold mb-2">${k}k a Year Is How Much an Hour?</h1>
          <p className="text-green-100 text-lg">
            {fmt(salary)}/year = <strong>{fmtDec(salary / 2080)}/hr</strong> gross · <strong>{fmtDec(afterTaxHourly)}/hr</strong> after federal tax
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* Key callout */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 text-center">
            <div className="text-3xl font-bold text-green-700">{fmtDec(salary / 2080)}</div>
            <div className="text-sm text-gray-500 mt-1">Per Hour (gross, 40 hrs/wk)</div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 text-center">
            <div className="text-3xl font-bold text-teal-700">{fmtDec(afterTaxHourly)}</div>
            <div className="text-sm text-gray-500 mt-1">Per Hour (after federal tax)</div>
          </div>
        </div>

        {/* Rate table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Full Pay Breakdown</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="pb-2 font-medium">Pay Period</th>
                <th className="pb-2 font-medium text-right">Gross Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.map(row => (
                <tr key={row.label}>
                  <td className="py-2.5 text-gray-700">{row.label}</td>
                  <td className="py-2.5 text-right font-medium text-gray-900">{fmtDec(row.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl p-6 text-white text-center">
          <h2 className="text-xl font-bold mb-2">Want the after-tax hourly rate?</h2>
          <p className="text-green-100 mb-4 text-sm">See what {fmt(salary)}/year means after federal, state, and FICA taxes.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href={`/${k}k-salary-after-tax`} className="inline-block bg-white text-green-700 font-semibold px-6 py-3 rounded-xl hover:bg-green-50 transition-colors">
              See After-Tax Breakdown →
            </Link>
            <Link href="/salary-to-hourly" className="inline-block bg-green-700 text-white font-semibold px-6 py-3 rounded-xl hover:bg-green-800 transition-colors border border-green-500">
              Full Hourly Calculator →
            </Link>
          </div>
        </div>

        {/* Related + inline notes */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div className="flex flex-wrap gap-2">
            {SALARY_AMOUNTS.filter(a => a !== k && Math.abs(a - k) <= 25).slice(0, 6).map(a => (
              <Link key={a} href={`/${a}k-salary-to-hourly`}
                className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors">
                ${a}k to hourly
              </Link>
            ))}
            <Link href={`/${k}k-salary-after-tax`}
              className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
              ${k}k after tax
            </Link>
          </div>
          <InlineNote items={[
            {
              q: `Is $${k}k a good salary?`,
              a: salaryLabel(salary),
            },
            {
              q: 'How is this calculated?',
              a: `${fmt(salary)} ÷ 2,080 hours (52 weeks × 40 hrs). Your after-tax hourly of ${fmtDec(afterTaxHourly)} uses federal tax only — state taxes will reduce it further.`,
            },
          ]} />
        </div>

      </div>
    </div>
  );
}

// ─── Comparison page ──────────────────────────────────────────────────────────

function ComparisonPage({ salary1, salary2 }: { salary1: number; salary2: number }) {
  const k1 = salary1 / 1000;
  const k2 = salary2 / 1000;
  const t1 = calcBreakdown(salary1, 0);
  const t2 = calcBreakdown(salary2, 0);
  const diffAnnual = t2.takeHome - t1.takeHome;
  const diffMonthly = diffAnnual / 12;
  const diffPct = (diffAnnual / t1.takeHome) * 100;
  const extraTax = (t2.federal + t2.fica) - (t1.federal + t1.fica);
  const keepRate = (diffAnnual / (salary2 - salary1)) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-purple-600 to-pink-600 text-white px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <BackLink />
          <h1 className="text-3xl md:text-4xl font-bold mb-2">${k1}k vs ${k2}k Salary</h1>
          <p className="text-purple-100 text-lg">
            Compare take-home pay, monthly income, and effective tax rates side by side.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* Side-by-side */}
        <div className="grid grid-cols-2 gap-4">
          {([
            { label: `$${k1}k Salary`, t: t1, colorClass: 'text-purple-600' },
            { label: `$${k2}k Salary`, t: t2, colorClass: 'text-pink-600' },
          ] as const).map(({ label, t, colorClass }) => (
            <div key={label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className={`text-xs font-semibold uppercase tracking-wide ${colorClass} mb-3`}>{label}</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Annual take-home</span>
                  <span className="font-bold text-gray-900">{fmt(t.takeHome)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Monthly</span>
                  <span className="font-medium text-gray-800">{fmt(t.monthly)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Bi-weekly</span>
                  <span className="font-medium text-gray-800">{fmt(t.biweekly)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-100 pt-2 mt-2">
                  <span className="text-gray-500">Effective rate</span>
                  <span className="font-medium text-red-500">{fmtPct(t.effectiveRate)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Difference */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">The Real Difference (After Tax)</h2>
          <div className="grid grid-cols-3 gap-4 text-center mb-4">
            <div>
              <div className="text-2xl font-bold text-green-600">+{fmt(diffAnnual)}</div>
              <div className="text-xs text-gray-500 mt-1">More per year</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">+{fmt(diffMonthly)}</div>
              <div className="text-xs text-gray-500 mt-1">More per month</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">+{diffPct.toFixed(1)}%</div>
              <div className="text-xs text-gray-500 mt-1">Take-home increase</div>
            </div>
          </div>
          <p className="text-xs text-gray-400">
            * Federal taxes only (Single filer). Use our{' '}
            <Link href="/job-offer-comparison" className="text-purple-600 hover:underline">job offer comparison calculator</Link>{' '}
            to factor in your state.
          </p>
        </div>

        {/* Full breakdown */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Full Breakdown</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="pb-2 font-medium"></th>
                <th className="pb-2 font-medium text-right">${k1}k</th>
                <th className="pb-2 font-medium text-right">${k2}k</th>
                <th className="pb-2 font-medium text-right">Difference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[
                { label: 'Gross Salary', v1: t1.gross, v2: t2.gross },
                { label: 'Federal Tax', v1: t1.federal, v2: t2.federal },
                { label: 'FICA', v1: t1.fica, v2: t2.fica },
                { label: 'Annual Take-Home', v1: t1.takeHome, v2: t2.takeHome, bold: true },
                { label: 'Monthly Take-Home', v1: t1.monthly, v2: t2.monthly },
                { label: 'Bi-Weekly Take-Home', v1: t1.biweekly, v2: t2.biweekly },
                { label: 'Hourly (after tax)', v1: t1.hourly, v2: t2.hourly },
              ].map(row => (
                <tr key={row.label} className={row.bold ? 'bg-gray-50 font-semibold' : ''}>
                  <td className="py-2.5 text-gray-700">{row.label}</td>
                  <td className="py-2.5 text-right text-gray-700">{fmt(row.v1)}</td>
                  <td className="py-2.5 text-right text-gray-700">{fmt(row.v2)}</td>
                  <td className="py-2.5 text-right text-green-600">+{fmt(row.v2 - row.v1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white text-center">
          <h2 className="text-xl font-bold mb-2">Comparing real job offers?</h2>
          <p className="text-purple-100 mb-4 text-sm">Add state taxes, benefits, and multiple offers side by side.</p>
          <Link href="/job-offer-comparison" className="inline-block bg-white text-purple-700 font-semibold px-6 py-3 rounded-xl hover:bg-purple-50 transition-colors">
            Compare Job Offers →
          </Link>
        </div>

        {/* Related + inline notes */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div className="flex flex-wrap gap-2">
            {COMPARISON_PAIRS
              .filter(([a, b]) => (a === k1 || b === k2 || a === k2 || b === k1) && !(a === k1 && b === k2))
              .slice(0, 5)
              .map(([a, b]) => (
                <Link key={`${a}-${b}`} href={`/${a}k-vs-${b}k-salary`}
                  className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors">
                  ${a}k vs ${b}k
                </Link>
              ))}
            <Link href={`/${k1}k-salary-after-tax`} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
              ${k1}k after tax
            </Link>
            <Link href={`/${k2}k-salary-after-tax`} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
              ${k2}k after tax
            </Link>
          </div>
          <InlineNote items={[
            {
              q: `Is the jump from $${k1}k to $${k2}k worth it?`,
              a: `You keep ${fmtPct(keepRate)} of the raise — ${fmt(diffAnnual)}/year more after tax. The other ${fmt(extraTax)} goes to federal taxes.`,
            },
            {
              q: `What's the monthly difference?`,
              a: `${fmt(t1.monthly)}/month vs ${fmt(t2.monthly)}/month — a ${fmt(diffMonthly)} difference after federal tax.`,
            },
          ]} />
        </div>

      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const parsed = parseSlug(slug);
  if (!parsed) notFound();

  if (parsed.kind === 'after-tax')
    return <AfterTaxPage salary={parsed.salary} stateSlug={parsed.stateSlug} />;
  if (parsed.kind === 'to-hourly')
    return <SalaryToHourlyPage salary={parsed.salary} />;
  if (parsed.kind === 'comparison')
    return <ComparisonPage salary1={parsed.salary1} salary2={parsed.salary2} />;

  notFound();
}
