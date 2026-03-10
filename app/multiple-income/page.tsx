'use client';

import { useState } from 'react';

interface Income { id: string; source: string; amount: number; }

const stateTaxRates: { [key: string]: number } = {
  'Florida': 0, 'Texas': 0, 'Nevada': 0, 'Washington': 0, 'Tennessee': 0,
  'California': 8.0, 'New York': 6.85, 'Illinois': 4.95, 'Pennsylvania': 3.07, 'Ohio': 2.85,
};

const filingStatuses = ['Single', 'Married Filing Jointly', 'Head of Household'];

function calculateFederalTax(salary: number, status: string): number {
  let tax = 0, remaining = salary;
  const brackets = status === 'Single' ? [
    { min: 0, max: 11000, rate: 0.10 }, { min: 11000, max: 44725, rate: 0.12 },
    { min: 44725, max: 95375, rate: 0.22 }, { min: 95375, max: 182100, rate: 0.24 },
    { min: 182100, max: 231250, rate: 0.32 }, { min: 231250, max: 578125, rate: 0.35 },
    { min: 578125, max: Infinity, rate: 0.37 },
  ] : status === 'Married Filing Jointly' ? [
    { min: 0, max: 22000, rate: 0.10 }, { min: 22000, max: 89450, rate: 0.12 },
    { min: 89450, max: 190750, rate: 0.22 }, { min: 190750, max: 364200, rate: 0.24 },
    { min: 364200, max: 462500, rate: 0.32 }, { min: 462500, max: 693750, rate: 0.35 },
    { min: 693750, max: Infinity, rate: 0.37 },
  ] : [
    { min: 0, max: 15700, rate: 0.10 }, { min: 15700, max: 59850, rate: 0.12 },
    { min: 59850, max: 96850, rate: 0.22 }, { min: 96850, max: 182100, rate: 0.24 },
    { min: 182100, max: 231250, rate: 0.32 }, { min: 231250, max: 578125, rate: 0.35 },
    { min: 578125, max: Infinity, rate: 0.37 },
  ];
  for (const b of brackets) {
    if (remaining > 0) { const t = Math.min(remaining, b.max - b.min); tax += t * b.rate; remaining -= t; }
  }
  return tax;
}

function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const SOURCE_COLORS = ['#06b6d4', '#6366f1', '#22c55e', '#f59e0b', '#ec4899', '#f97316', '#8b5cf6', '#3b82f6'];

function polarToCartesian(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg - 90) * Math.PI / 180;
  return {
    x: Math.round((cx + r * Math.cos(rad)) * 1000) / 1000,
    y: Math.round((cy + r * Math.sin(rad)) * 1000) / 1000,
  };
}
function describeArc(x: number, y: number, r: number, start: number, end: number) {
  const s = polarToCartesian(x, y, r, end);
  const e = polarToCartesian(x, y, r, start);
  return [`M`, s.x, s.y, `A`, r, r, 0, end - start <= 180 ? 0 : 1, 0, e.x, e.y, `L`, x, y, `Z`].join(' ');
}

export default function MultipleIncome() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [source, setSource] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [state, setState] = useState('Florida');
  const [status, setStatus] = useState('Single');
  const [chartView, setChartView] = useState<'tax' | 'sources'>('tax');

  const addIncome = () => {
    if (source.trim() && amount > 0) {
      setIncomes([...incomes, { id: Date.now().toString(), source: source.trim(), amount }]);
      setSource('');
      setAmount(0);
    }
  };

  const removeIncome = (id: string) => setIncomes(incomes.filter(i => i.id !== id));

  const totalYearly = incomes.reduce((s, i) => s + i.amount, 0);
  const ficaTax = Math.min(totalYearly, 160200) * 0.0765;
  const federalTax = calculateFederalTax(totalYearly, status);
  const stateTax = (totalYearly * stateTaxRates[state]) / 100;
  const totalTax = federalTax + stateTax + ficaTax;
  const takeHome = totalYearly - totalTax;
  const effectiveRate = totalYearly > 0 ? (totalTax / totalYearly) * 100 : 0;

  // Donut chart for tax breakdown
  const taxSegments = [
    { label: 'Take-Home', value: takeHome, color: '#22c55e' },
    { label: 'Federal', value: federalTax, color: '#ef4444' },
    { label: 'State', value: stateTax, color: '#f59e0b' },
    { label: 'FICA', value: ficaTax, color: '#6366f1' },
  ];

  let cumAngle = 0;
  const taxPaths = taxSegments.map((s) => {
    const pct = totalYearly > 0 ? (s.value / totalYearly) * 100 : 0;
    const angle = (pct / 100) * 360;
    const path = angle >= 359.9
      ? `M90,90 m-70,0 a70,70 0 1,0 140,0 a70,70 0 1,0 -140,0`
      : describeArc(90, 90, 70, cumAngle, cumAngle + angle);
    const labelAngle = cumAngle + angle / 2;
    const labelPos = polarToCartesian(90, 90, 48, labelAngle);
    cumAngle += angle;
    return { ...s, pct, path, labelPos, angle };
  });

  // Donut for income sources
  let cumAngle2 = 0;
  const sourcePaths = incomes.map((inc, i) => {
    const pct = totalYearly > 0 ? (inc.amount / totalYearly) * 100 : 0;
    const angle = (pct / 100) * 360;
    const color = SOURCE_COLORS[i % SOURCE_COLORS.length];
    const path = angle >= 359.9
      ? `M90,90 m-70,0 a70,70 0 1,0 140,0 a70,70 0 1,0 -140,0`
      : describeArc(90, 90, 70, cumAngle2, cumAngle2 + angle);
    const labelAngle = cumAngle2 + angle / 2;
    const labelPos = polarToCartesian(90, 90, 48, labelAngle);
    cumAngle2 += angle;
    return { ...inc, pct, path, labelPos, angle, color };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <header className="border-b border-indigo-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-lg font-bold text-gray-900">Multiple Income</span>
          <a href="/" className="ml-auto text-sm text-gray-600 hover:text-cyan-600 transition-colors">← All Calculators</a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            Multiple{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-teal-600">Income Sources</span>
          </h1>
          <p className="text-gray-600">Combine all your income streams and see your total tax picture.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column: add income + settings */}
          <div className="space-y-5">
            {/* Add income card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Add Income Source</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source Name</label>
                <input
                  type="text"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addIncome()}
                  placeholder="e.g. Main Job, Freelance"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Annual Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="number"
                    value={amount || ''}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    onKeyDown={(e) => e.key === 'Enter' && addIncome()}
                    placeholder="0"
                    className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-gray-900"
                  />
                </div>
              </div>
              <button
                onClick={addIncome}
                disabled={!source.trim() || amount <= 0}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-teal-600 text-white font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              >
                + Add Source
              </button>
            </div>

            {/* Tax settings */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Tax Settings</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-gray-900"
                >
                  {Object.keys(stateTaxRates).map((s) => (
                    <option key={s} value={s}>{s} {stateTaxRates[s] === 0 ? '(no tax)' : `(${stateTaxRates[s]}%)`}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filing Status</label>
                <div className="space-y-2">
                  {filingStatuses.map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatus(s)}
                      className={`w-full px-4 py-2.5 rounded-xl text-sm font-medium text-left border transition-all ${
                        status === s ? 'bg-cyan-50 border-cyan-400 text-cyan-700' : 'border-gray-200 text-gray-700 hover:border-cyan-200'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Middle: income sources list + results */}
          <div className="space-y-5">
            {/* Income sources list */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Income Sources</h2>
              {incomes.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-gray-400">
                  <svg className="w-12 h-12 text-gray-200 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                  </svg>
                  <p className="text-sm">Add your first income source</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {incomes.map((inc, i) => {
                    const pct = totalYearly > 0 ? ((inc.amount / totalYearly) * 100).toFixed(1) : '0';
                    return (
                      <div key={inc.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl group">
                        <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: SOURCE_COLORS[i % SOURCE_COLORS.length] }} />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 text-sm truncate">{inc.source}</div>
                          <div className="text-xs text-gray-500">${inc.amount.toLocaleString()}/yr · {pct}%</div>
                        </div>
                        <button
                          onClick={() => removeIncome(inc.id)}
                          className="text-gray-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Results */}
            {incomes.length > 0 && (
              <>
                {/* Hero take-home */}
                <div className="bg-gradient-to-br from-cyan-500 to-teal-600 rounded-2xl p-5 text-white shadow-lg">
                  <div className="text-sm text-cyan-100 mb-1">Annual Take-Home</div>
                  <div className="text-4xl font-extrabold">${fmt(takeHome)}</div>
                  <div className="grid grid-cols-3 gap-3 mt-4 text-sm">
                    <div>
                      <div className="text-cyan-200 text-xs">Monthly</div>
                      <div className="font-bold">${fmt(takeHome / 12)}</div>
                    </div>
                    <div>
                      <div className="text-cyan-200 text-xs">Effective rate</div>
                      <div className="font-bold">{effectiveRate.toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className="text-cyan-200 text-xs">Gross total</div>
                      <div className="font-bold">${fmt(totalYearly)}</div>
                    </div>
                  </div>
                </div>

                {/* Tax detail tiles */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Federal Tax', value: federalTax, bg: 'bg-red-50', border: 'border-red-100', text: 'text-red-600' },
                    { label: 'State Tax', value: stateTax, bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-600' },
                    { label: 'FICA', value: ficaTax, bg: 'bg-indigo-50', border: 'border-indigo-100', text: 'text-indigo-600' },
                    { label: 'Total Tax', value: totalTax, bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700' },
                  ].map((t) => (
                    <div key={t.label} className={`${t.bg} border ${t.border} rounded-xl p-3`}>
                      <div className="text-xs text-gray-600 mb-1">{t.label}</div>
                      <div className={`text-lg font-bold ${t.text}`}>${fmt(t.value)}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Right: charts */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">Breakdown</h2>
              {incomes.length > 0 && (
                <div className="bg-gray-100 p-1 rounded-lg flex gap-1">
                  <button
                    onClick={() => setChartView('tax')}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${chartView === 'tax' ? 'bg-white shadow text-gray-900' : 'text-gray-600'}`}
                  >
                    Tax Split
                  </button>
                  <button
                    onClick={() => setChartView('sources')}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${chartView === 'sources' ? 'bg-white shadow text-gray-900' : 'text-gray-600'}`}
                  >
                    Sources
                  </button>
                </div>
              )}
            </div>

            {incomes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-300">
                <svg className="w-16 h-16 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
                <p className="text-sm text-gray-400">Chart will appear here</p>
              </div>
            ) : chartView === 'tax' ? (
              <div className="flex flex-col items-center">
                <svg width="180" height="180" viewBox="0 0 180 180">
                  {taxPaths.map((s) =>
                    s.angle > 0.5 ? (
                      <path key={s.label} d={s.path} fill={s.color} stroke="white" strokeWidth={2.5} />
                    ) : null
                  )}
                  <circle cx="90" cy="90" r="40" fill="white" />
                  <text x="90" y="86" textAnchor="middle" style={{ fontSize: 9, fill: '#6b7280' }}>Take-Home</text>
                  <text x="90" y="100" textAnchor="middle" style={{ fontSize: 12, fontWeight: 700, fill: '#22c55e' }}>
                    {totalYearly > 0 ? `${((takeHome / totalYearly) * 100).toFixed(0)}%` : '—'}
                  </text>
                  {taxPaths.map((s) =>
                    s.pct > 7 ? (
                      <text key={s.label + '-l'} x={s.labelPos.x} y={s.labelPos.y} textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 9, fontWeight: 700, fill: 'white' }}>
                        {s.pct.toFixed(0)}%
                      </text>
                    ) : null
                  )}
                </svg>
                <div className="w-full space-y-2 mt-3">
                  {taxSegments.map((s) => (
                    <div key={s.label} className="flex items-center gap-2 text-sm">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                      <span className="text-gray-600 flex-1">{s.label}</span>
                      <span className="font-semibold text-gray-900">${fmt(s.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <svg width="180" height="180" viewBox="0 0 180 180">
                  {sourcePaths.map((s) =>
                    s.angle > 0.5 ? (
                      <path key={s.id} d={s.path} fill={s.color} stroke="white" strokeWidth={2.5} />
                    ) : null
                  )}
                  <circle cx="90" cy="90" r="40" fill="white" />
                  <text x="90" y="86" textAnchor="middle" style={{ fontSize: 9, fill: '#6b7280' }}>Sources</text>
                  <text x="90" y="100" textAnchor="middle" style={{ fontSize: 11, fontWeight: 700, fill: '#06b6d4' }}>
                    {incomes.length}
                  </text>
                </svg>
                <div className="w-full space-y-2 mt-3">
                  {incomes.map((inc, i) => {
                    const pct = totalYearly > 0 ? (inc.amount / totalYearly) * 100 : 0;
                    return (
                      <div key={inc.id} className="flex items-center gap-2 text-sm">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: SOURCE_COLORS[i % SOURCE_COLORS.length] }} />
                        <span className="text-gray-600 flex-1 truncate">{inc.source}</span>
                        <span className="text-gray-400 text-xs">{pct.toFixed(0)}%</span>
                        <span className="font-semibold text-gray-900">${inc.amount.toLocaleString()}</span>
                      </div>
                    );
                  })}
                  <div className="flex items-center justify-between border-t border-gray-100 pt-2 mt-1 text-sm font-semibold">
                    <span className="text-gray-900">Total</span>
                    <span className="text-cyan-600">${fmt(totalYearly)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Stacked bar */}
            {incomes.length > 0 && (
              <div className="mt-5 pt-4 border-t border-gray-100">
                <div className="text-xs text-gray-500 mb-2">Income vs taxes</div>
                <div className="flex rounded-lg overflow-hidden h-5">
                  <div style={{ width: `${totalYearly > 0 ? (takeHome / totalYearly) * 100 : 0}%`, background: '#22c55e' }} />
                  <div style={{ width: `${totalYearly > 0 ? (federalTax / totalYearly) * 100 : 0}%`, background: '#ef4444' }} />
                  <div style={{ width: `${totalYearly > 0 ? (stateTax / totalYearly) * 100 : 0}%`, background: '#f59e0b' }} />
                  <div style={{ width: `${totalYearly > 0 ? (ficaTax / totalYearly) * 100 : 0}%`, background: '#6366f1' }} />
                </div>
              </div>
            )}
          </div>
        </div>
        {/* SEO Content */}
        <div className="mt-12 border-t border-gray-100 pt-8 pb-4">
          <div className="max-w-3xl mx-auto space-y-3 text-xs text-gray-600 leading-relaxed">
            <p>Have more than one job, a side hustle, or multiple income streams? This calculator combines all your income sources — salary, freelance work, rental income, investments — and calculates the total federal tax, state tax, and FICA on your combined earnings.</p>
            <p>Having multiple income sources can push you into a higher tax bracket. This tool shows your combined effective tax rate, total annual take-home, and a visual breakdown of where your money goes. Use it to plan quarterly estimated taxes or understand the true cost of picking up extra work.</p>
            <p>Common searches: multiple income streams calculator · dual income tax calculator · two jobs tax calculator · side hustle income tax · combined household income · second job tax withholding · total income tax calculator · how much tax on multiple jobs · freelance plus full time job taxes · passive income tax calculator</p>
          </div>
        </div>
      </main>
    </div>
  );
}
