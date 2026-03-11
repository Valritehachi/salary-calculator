'use client';
import { useState } from 'react';

const stateTaxRates: { [key: string]: number } = {
  'Florida': 0,
  'Texas': 0,
  'Nevada': 0,
  'Washington': 0,
  'Tennessee': 0,
  'California': 8.0,
  'New York': 6.85,
  'Illinois': 4.95,
  'Pennsylvania': 3.07,
  'Ohio': 2.85,
};

const filingStatuses = ['Single', 'Married Filing Jointly', 'Head of Household'];

function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number): string {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return ["M", start.x, start.y, "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y, "L", x, y, "Z"].join(" ");
}

function polarToCartesian(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg - 90) * Math.PI / 180;
  return {
    x: Math.round((cx + r * Math.cos(rad)) * 1000) / 1000,
    y: Math.round((cy + r * Math.sin(rad)) * 1000) / 1000,
  };
}

function getLabelPosition(cx: number, cy: number, r: number, deg: number) {
  return polarToCartesian(cx, cy, r, deg);
}

function calculateFederalTax(salary: number, status: string): number {
  let tax = 0;
  let remaining = salary;
  const brackets = status === 'Single' ? [
    { min: 0, max: 11000, rate: 0.10 },
    { min: 11000, max: 44725, rate: 0.12 },
    { min: 44725, max: 95375, rate: 0.22 },
    { min: 95375, max: 182100, rate: 0.24 },
    { min: 182100, max: 231250, rate: 0.32 },
    { min: 231250, max: 578125, rate: 0.35 },
    { min: 578125, max: Infinity, rate: 0.37 },
  ] : status === 'Married Filing Jointly' ? [
    { min: 0, max: 22000, rate: 0.10 },
    { min: 22000, max: 89450, rate: 0.12 },
    { min: 89450, max: 190750, rate: 0.22 },
    { min: 190750, max: 364200, rate: 0.24 },
    { min: 364200, max: 462500, rate: 0.32 },
    { min: 462500, max: 693750, rate: 0.35 },
    { min: 693750, max: Infinity, rate: 0.37 },
  ] : [
    { min: 0, max: 15700, rate: 0.10 },
    { min: 15700, max: 59850, rate: 0.12 },
    { min: 59850, max: 96850, rate: 0.22 },
    { min: 96850, max: 182100, rate: 0.24 },
    { min: 182100, max: 231250, rate: 0.32 },
    { min: 231250, max: 578125, rate: 0.35 },
    { min: 578125, max: Infinity, rate: 0.37 },
  ];
  for (const bracket of brackets) {
    if (remaining > 0) {
      const taxable = Math.min(remaining, bracket.max - bracket.min);
      tax += taxable * bracket.rate;
      remaining -= taxable;
    }
  }
  return tax;
}


function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function AfterTax() {
  const [salary, setSalary] = useState<number>(85000);
  const [state, setState] = useState<string>('Florida');
  const [status, setStatus] = useState<string>('Single');
  const [dependents, setDependents] = useState<number>(0);
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');

  const federalTax = calculateFederalTax(salary, status);
  const stateTax = (salary * stateTaxRates[state]) / 100;
  const ficaTax = Math.min(salary, 160200) * 0.0765;
  const totalTax = federalTax + stateTax + ficaTax;
  const takeHome = salary - totalTax;
  const effectiveRate = salary > 0 ? (totalTax / salary) * 100 : 0;

  const segments = [
    { label: 'Take-Home', value: takeHome, color: '#22c55e', pct: salary > 0 ? (takeHome / salary) * 100 : 0 },
    { label: 'Federal Tax', value: federalTax, color: '#ef4444', pct: salary > 0 ? (federalTax / salary) * 100 : 0 },
    { label: 'State Tax', value: stateTax, color: '#f59e0b', pct: salary > 0 ? (stateTax / salary) * 100 : 0 },
    { label: 'FICA', value: ficaTax, color: '#6366f1', pct: salary > 0 ? (ficaTax / salary) * 100 : 0 },
  ];

  // Build pie paths
  let cumAngle = 0;
  const piePaths = segments.map((s) => {
    const angle = (s.pct / 100) * 360;
    const path = angle >= 360
      ? `M150,150 m-100,0 a100,100 0 1,0 200,0 a100,100 0 1,0 -200,0`
      : describeArc(150, 150, 100, cumAngle, cumAngle + angle);
    const labelAngle = cumAngle + angle / 2;
    const labelPos = getLabelPosition(150, 150, 68, labelAngle);
    cumAngle += angle;
    return { ...s, path, labelPos, angle };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b border-indigo-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-3">
          <a href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-gray-900 group-hover:text-green-600 transition-colors">After Tax Calculator</span>
          </a>
          <span className="ml-auto text-sm text-gray-500">
            <a href="/" className="hover:text-green-600 transition-colors">← All Calculators</a>
          </span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        {/* Page title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            After-Tax{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-600">Income</span>
          </h1>
          <p className="text-gray-600">See your real take-home pay after all taxes.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Inputs + Results */}
          <div className="space-y-6">
            {/* Inputs Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
              <h2 className="text-lg font-semibold text-gray-900">Your Details</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Annual Salary</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
                  <input
                    type="number"
                    value={salary}
                    onChange={(e) => setSalary(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900"
                    placeholder="85000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900"
                >
                  {Object.keys(stateTaxRates).map((s) => (
                    <option key={s} value={s}>{s} {stateTaxRates[s] === 0 ? '(no income tax)' : `(${stateTaxRates[s]}%)`}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Filing Status</label>
                <div className="grid grid-cols-1 gap-2">
                  {filingStatuses.map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatus(s)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-medium text-left border transition-all ${
                        status === s
                          ? 'bg-green-50 border-green-400 text-green-700'
                          : 'border-gray-200 text-gray-700 hover:border-green-200'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dependents</label>
                <input
                  type="number"
                  value={dependents}
                  min={0}
                  onChange={(e) => setDependents(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900"
                />
              </div>
            </div>

            {/* Results Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Results</h2>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                  <div className="text-xs text-gray-600 mb-1">Annual Take-Home</div>
                  <div className="text-xl font-bold text-green-600">${fmt(takeHome)}</div>
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <div className="text-xs text-gray-600 mb-1">Monthly Take-Home</div>
                  <div className="text-xl font-bold text-blue-600">${fmt(takeHome / 12)}</div>
                </div>
                <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                  <div className="text-xs text-gray-600 mb-1">Bi-Weekly Paycheck</div>
                  <div className="text-xl font-bold text-purple-600">${fmt(takeHome / 26)}</div>
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                  <div className="text-xs text-gray-600 mb-1">Effective Tax Rate</div>
                  <div className="text-xl font-bold text-amber-600">{effectiveRate.toFixed(1)}%</div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-3">
                {[
                  { label: 'Federal Tax', value: federalTax, color: 'text-red-600' },
                  { label: 'State Tax', value: stateTax, color: 'text-amber-600' },
                  { label: 'FICA (SS + Medicare)', value: ficaTax, color: 'text-indigo-600' },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">{row.label}</span>
                    <span className={`font-semibold ${row.color}`}>${fmt(row.value)}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center border-t border-gray-100 pt-3">
                  <span className="font-semibold text-gray-900">Total Taxes</span>
                  <span className="text-lg font-bold text-red-600">${fmt(totalTax)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Breakdown</h2>
              <div className="bg-gray-100 p-1 rounded-lg flex gap-1">
                {(['pie', 'bar'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setChartType(t)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      chartType === t ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {t === 'pie' ? 'Donut' : 'Bar'}
                  </button>
                ))}
              </div>
            </div>

            {chartType === 'pie' ? (
              <div className="flex flex-col items-center">
                <svg width="300" height="300" viewBox="0 0 300 300">
                  {piePaths.map((s) =>
                    s.angle > 0.5 ? (
                      <path key={s.label} d={s.path} fill={s.color} stroke="white" strokeWidth={3} />
                    ) : null
                  )}
                  <circle cx="150" cy="150" r="58" fill="white" />
                  <text x="150" y="143" textAnchor="middle" style={{ fontSize: 11, fill: '#6b7280' }}>Take-Home</text>
                  <text x="150" y="162" textAnchor="middle" style={{ fontSize: 15, fontWeight: 700, fill: '#22c55e' }}>
                    {effectiveRate > 0 ? `${(100 - effectiveRate).toFixed(1)}%` : '—'}
                  </text>
                  {piePaths.map((s) =>
                    s.pct > 6 ? (
                      <text
                        key={s.label + '-lbl'}
                        x={s.labelPos.x}
                        y={s.labelPos.y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        style={{ fontSize: 10, fontWeight: 700, fill: 'white' }}
                      >
                        {s.pct.toFixed(0)}%
                      </text>
                    ) : null
                  )}
                </svg>
                <div className="grid grid-cols-2 gap-3 w-full mt-2">
                  {segments.map((s) => (
                    <div key={s.label} className="flex items-center gap-2 text-sm">
                      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: s.color }} />
                      <span className="text-gray-600">{s.label}</span>
                      <span className="ml-auto font-semibold text-gray-900">{s.pct.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <svg width="340" height="280" viewBox="0 0 340 280">
                  {/* Grid */}
                  {[0, 25, 50, 75, 100].map((pct) => {
                    const y = 230 - (pct / 100) * 180;
                    return (
                      <g key={pct}>
                        <line x1="40" y1={y} x2="320" y2={y} stroke="#f3f4f6" strokeWidth={1} />
                        <text x="32" y={y + 4} textAnchor="end" style={{ fontSize: 10, fill: '#9ca3af' }}>{pct}%</text>
                      </g>
                    );
                  })}
                  {segments.map((s, i) => {
                    const barW = 44;
                    const gap = 20;
                    const x = 56 + i * (barW + gap);
                    const barH = (s.pct / 100) * 180;
                    const y = 230 - barH;
                    return (
                      <g key={s.label}>
                        <rect x={x} y={y} width={barW} height={barH} rx={6} fill={s.color} />
                        <text x={x + barW / 2} y={y - 6} textAnchor="middle" style={{ fontSize: 10, fontWeight: 700, fill: '#374151' }}>
                          {s.pct.toFixed(1)}%
                        </text>
                        <text x={x + barW / 2} y={248} textAnchor="middle" style={{ fontSize: 9, fill: '#6b7280' }}>
                          {s.label.split(' ')[0]}
                        </text>
                      </g>
                    );
                  })}
                </svg>
                <div className="grid grid-cols-2 gap-3 w-full mt-1">
                  {segments.map((s) => (
                    <div key={s.label} className="flex items-center gap-2 text-sm">
                      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: s.color }} />
                      <span className="text-gray-600">{s.label}</span>
                      <span className="ml-auto font-semibold text-gray-900">${fmt(s.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tax bracket indicator */}
            <div className="mt-6 bg-indigo-50 border border-indigo-100 rounded-xl p-4">
              <div className="text-xs font-semibold text-indigo-700 mb-1">Marginal Tax Bracket</div>
              <div className="text-sm text-gray-700">
                {salary <= 11000 ? '10%' : salary <= 44725 ? '12%' : salary <= 95375 ? '22%' : salary <= 182100 ? '24%' : salary <= 231250 ? '32%' : salary <= 578125 ? '35%' : '37%'} federal bracket &nbsp;·&nbsp; {stateTaxRates[state]}% state rate
              </div>
            </div>
          </div>
        </div>
        {/* SEO Content */}
        <div className="mt-12 border-t border-gray-100 pt-8 pb-4">
          <div className="max-w-3xl mx-auto space-y-3 text-xs text-gray-600 leading-relaxed">
            <p>Use our free after-tax income calculator to instantly see your real take-home pay after federal income tax, state income tax, and FICA deductions (Social Security and Medicare). Enter your annual salary, filing status, and state to get an accurate net income estimate.</p>
            <p>This paycheck calculator covers all major tax categories: federal tax brackets (10%, 12%, 22%, 24%, 32%, 35%, 37%), state income tax rates, Social Security tax (6.2%), and Medicare tax (1.45%). The effective tax rate shown reflects your average rate across all income — not just your marginal bracket.</p>
            <p>Common searches: after tax calculator · take home pay calculator · net income calculator · salary after taxes · paycheck calculator · income tax calculator · federal tax calculator · gross to net pay · W-4 withholding calculator · biweekly paycheck calculator · how much is taken out of my paycheck · marginal vs effective tax rate · 2024 tax brackets</p>
          </div>
        </div>
      </main>
    </div>
  );
}
