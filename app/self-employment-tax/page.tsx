'use client';

import { useState } from 'react';

const stateTaxRates: { [key: string]: number } = {
  'Florida': 0, 'Texas': 0, 'Nevada': 0, 'Washington': 0, 'Tennessee': 0,
  'California': 8.0, 'New York': 6.85, 'Illinois': 4.95, 'Pennsylvania': 3.07, 'Ohio': 2.85,
};

const filingStatuses = ['Single', 'Married Filing Jointly', 'Head of Household'];

function calculateFederalTax(income: number, status: string, seDeduction: number): number {
  const adjusted = income - seDeduction;
  let tax = 0, remaining = adjusted;
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

export default function SelfEmploymentTax() {
  const [income, setIncome] = useState<number>(50000);
  const [state, setState] = useState<string>('Florida');
  const [status, setStatus] = useState<string>('Single');

  const seBase = income * 0.9235;
  const seTax = seBase * 0.153;
  const seDeduction = seTax * 0.5;
  const federalTax = calculateFederalTax(income, status, seDeduction);
  const stateTax = (income * stateTaxRates[state]) / 100;
  const totalTax = federalTax + stateTax + seTax;
  const takeHome = income - totalTax;
  const effectiveRate = income > 0 ? (totalTax / income) * 100 : 0;
  const quarterlyEst = totalTax / 4;

  const breakdown = [
    { label: 'Self-Employment Tax', sublabel: '15.3% of 92.35% net earnings', value: seTax, color: '#8b5cf6', bg: 'bg-purple-50', border: 'border-purple-100', textColor: 'text-purple-600' },
    { label: 'Federal Income Tax', sublabel: `After SE deduction of $${fmt(seDeduction)}`, value: federalTax, color: '#ef4444', bg: 'bg-red-50', border: 'border-red-100', textColor: 'text-red-600' },
    { label: 'State Tax', sublabel: `${stateTaxRates[state]}% — ${state}`, value: stateTax, color: '#f59e0b', bg: 'bg-amber-50', border: 'border-amber-100', textColor: 'text-amber-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <header className="border-b border-indigo-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0H8" />
            </svg>
          </div>
          <span className="text-lg font-bold text-gray-900">Self-Employment Tax</span>
          <a href="/" className="ml-auto text-sm text-gray-600 hover:text-indigo-600 transition-colors">← All Calculators</a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            Self-Employment{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">Tax</span>
          </h1>
          <p className="text-gray-600">For freelancers, gig workers, and independent contractors.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Inputs */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
            <h2 className="text-lg font-semibold text-gray-900">Your Income Details</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Annual Net Self-Employment Income</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input
                  type="number"
                  value={income}
                  onChange={(e) => setIncome(Number(e.target.value))}
                  className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">After business expenses, before taxes</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900"
              >
                {Object.keys(stateTaxRates).map((s) => (
                  <option key={s} value={s}>{s} {stateTaxRates[s] === 0 ? '(no income tax)' : `(${stateTaxRates[s]}%)`}</option>
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
                      status === s ? 'bg-indigo-50 border-indigo-400 text-indigo-700' : 'border-gray-200 text-gray-700 hover:border-indigo-200'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Quarterly reminder */}
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
              <div className="text-xs font-semibold text-amber-700 mb-1">Quarterly Estimated Taxes</div>
              <div className="text-2xl font-bold text-amber-600">${fmt(quarterlyEst)}</div>
              <div className="text-xs text-gray-600 mt-1">Due Apr 15 · Jun 15 · Sep 15 · Jan 15</div>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-4">
            {/* Take-home hero */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="text-sm text-indigo-200 mb-1">Annual take-home income</div>
              <div className="text-4xl font-extrabold">${fmt(takeHome)}</div>
              <div className="flex gap-4 mt-4 text-sm">
                <div>
                  <div className="text-indigo-200">Monthly</div>
                  <div className="font-bold">${fmt(takeHome / 12)}</div>
                </div>
                <div>
                  <div className="text-indigo-200">Effective rate</div>
                  <div className="font-bold">{effectiveRate.toFixed(1)}%</div>
                </div>
                <div>
                  <div className="text-indigo-200">Total tax</div>
                  <div className="font-bold">${fmt(totalTax)}</div>
                </div>
              </div>
            </div>

            {/* Tax breakdown cards */}
            {breakdown.map((b) => (
              <div key={b.label} className={`${b.bg} border ${b.border} rounded-2xl p-4 flex items-center justify-between`}>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{b.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{b.sublabel}</div>
                </div>
                <div className={`text-xl font-bold ${b.textColor}`}>${fmt(b.value)}</div>
              </div>
            ))}

            {/* Visual bar */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="text-sm font-semibold text-gray-700 mb-3">Where your income goes</div>
              <div className="flex rounded-xl overflow-hidden h-6 mb-3">
                <div style={{ width: `${income > 0 ? (takeHome / income) * 100 : 0}%`, background: '#22c55e' }} title={`Take-home: ${fmt(takeHome)}`} />
                {breakdown.map((b) => (
                  <div key={b.label} style={{ width: `${income > 0 ? (b.value / income) * 100 : 0}%`, background: b.color }} title={`${b.label}: ${fmt(b.value)}`} />
                ))}
              </div>
              <div className="flex flex-wrap gap-3 text-xs">
                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-500 inline-block" />Take-Home {income > 0 ? ((takeHome / income) * 100).toFixed(0) : 0}%</div>
                {breakdown.map((b) => (
                  <div key={b.label} className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full inline-block" style={{ background: b.color }} />
                    {b.label.split(' ')[0]} {income > 0 ? ((b.value / income) * 100).toFixed(0) : 0}%
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-sm text-gray-700">
              <span className="font-semibold text-indigo-700">Note: </span>
              Consult a tax professional for personalized advice. SE tax deduction and brackets are simplified.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
