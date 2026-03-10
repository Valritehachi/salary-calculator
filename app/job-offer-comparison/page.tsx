'use client';

import { useState } from 'react';

const stateTaxRates: { [key: string]: number } = {
  'Florida': 0, 'Texas': 0, 'Nevada': 0, 'Washington': 0, 'Tennessee': 0,
  'California': 8.0, 'New York': 6.85, 'Illinois': 4.95, 'Pennsylvania': 3.07, 'Ohio': 2.85,
};

function calculateFederalTax(salary: number): number {
  let tax = 0, remaining = salary;
  const brackets = [
    { min: 0, max: 11000, rate: 0.10 }, { min: 11000, max: 44725, rate: 0.12 },
    { min: 44725, max: 95375, rate: 0.22 }, { min: 95375, max: 182100, rate: 0.24 },
    { min: 182100, max: 231250, rate: 0.32 }, { min: 231250, max: 578125, rate: 0.35 },
    { min: 578125, max: Infinity, rate: 0.37 },
  ];
  for (const b of brackets) {
    if (remaining > 0) { const t = Math.min(remaining, b.max - b.min); tax += t * b.rate; remaining -= t; }
  }
  return tax;
}

function fmt(n: number) {
  return Math.round(n).toLocaleString('en-US');
}

const CARD_COLORS = [
  { grad: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', bar: '#3b82f6' },
  { grad: 'from-rose-500 to-red-600', bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', bar: '#f43f5e' },
  { grad: 'from-green-500 to-emerald-600', bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', bar: '#22c55e' },
  { grad: 'from-amber-500 to-orange-500', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', bar: '#f59e0b' },
  { grad: 'from-purple-500 to-fuchsia-600', bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', bar: '#a855f7' },
];

interface Offer { name: string; salary: number; state: string; }

export default function JobOfferComparison() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [name, setName] = useState('');
  const [salary, setSalary] = useState<number>(0);
  const [state, setState] = useState('Florida');

  const addOffer = () => {
    if (name.trim() && salary > 0) {
      setOffers([...offers, { name: name.trim(), salary, state }]);
      setName('');
      setSalary(0);
    }
  };

  const removeOffer = (i: number) => setOffers(offers.filter((_, idx) => idx !== i));

  const computed = offers.map((o) => {
    const fed = calculateFederalTax(o.salary);
    const st = (o.salary * (stateTaxRates[o.state] ?? 0)) / 100;
    const fica = Math.min(o.salary, 160200) * 0.0765;
    const totalTax = fed + st + fica;
    const afterTax = o.salary - totalTax;
    const effectiveRate = o.salary > 0 ? (totalTax / o.salary) * 100 : 0;
    return { ...o, fed, st, fica, totalTax, afterTax, effectiveRate };
  });

  const maxAfterTax = computed.length > 0 ? Math.max(...computed.map(c => c.afterTax)) : 1;
  const best = computed.length > 0 ? computed.reduce((a, b) => a.afterTax > b.afterTax ? a : b) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-rose-50">
      <header className="border-b border-indigo-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2" />
            </svg>
          </div>
          <span className="text-lg font-bold text-gray-900">Job Offer Comparison</span>
          <a href="/" className="ml-auto text-sm text-gray-600 hover:text-rose-600 transition-colors">← All Calculators</a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            Job Offer{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-red-600">Comparison</span>
          </h1>
          <p className="text-gray-600">Compare offers side-by-side to find which pays the most after taxes.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add offer form */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4 h-fit">
            <h2 className="text-lg font-semibold text-gray-900">Add an Offer</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Title / Company</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addOffer()}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all text-gray-900"
                placeholder="e.g. Google — SWE"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Annual Salary</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input
                  type="number"
                  value={salary || ''}
                  onChange={(e) => setSalary(Number(e.target.value))}
                  onKeyDown={(e) => e.key === 'Enter' && addOffer()}
                  className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all text-gray-900"
                  placeholder="120000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all text-gray-900"
              >
                {Object.keys(stateTaxRates).map((s) => (
                  <option key={s} value={s}>{s} {stateTaxRates[s] === 0 ? '(no tax)' : `(${stateTaxRates[s]}%)`}</option>
                ))}
              </select>
            </div>

            <button
              onClick={addOffer}
              disabled={!name.trim() || salary <= 0}
              className="w-full py-3 bg-gradient-to-r from-rose-500 to-red-600 text-white font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              + Add Offer
            </button>

            {offers.length === 0 && (
              <p className="text-xs text-gray-400 text-center">Add at least two offers to compare</p>
            )}
          </div>

          {/* Offers */}
          <div className="lg:col-span-2 space-y-5">
            {computed.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 flex flex-col items-center text-center text-gray-400">
                <svg className="w-14 h-14 text-gray-200 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm">Add your first job offer to get started</p>
              </div>
            ) : (
              <>
                {/* Bar chart */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="text-sm font-semibold text-gray-700 mb-4">After-Tax Income Comparison</div>
                  <div className="space-y-3">
                    {computed.map((o, i) => {
                      const pct = (o.afterTax / maxAfterTax) * 100;
                      const color = CARD_COLORS[i % CARD_COLORS.length];
                      const isBest = o.name === best?.name;
                      return (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-28 text-xs text-gray-700 truncate flex-shrink-0">{o.name}</div>
                          <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                            <div
                              className="h-full rounded-full flex items-center justify-end pr-3 transition-all duration-500"
                              style={{ width: `${pct}%`, background: color.bar }}
                            >
                              {pct > 35 && <span className="text-white text-xs font-semibold">${fmt(o.afterTax)}</span>}
                            </div>
                          </div>
                          {pct <= 35 && <span className="text-xs font-semibold text-gray-700 w-20 flex-shrink-0">${fmt(o.afterTax)}</span>}
                          {isBest && <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full flex-shrink-0">Best</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Offer cards */}
                {computed.map((o, i) => {
                  const color = CARD_COLORS[i % CARD_COLORS.length];
                  const isBest = o.name === best?.name;
                  return (
                    <div key={i} className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${isBest ? 'border-green-300 ring-2 ring-green-200' : 'border-gray-100'}`}>
                      <div className={`bg-gradient-to-r ${color.grad} p-4 flex items-center justify-between`}>
                        <div>
                          <div className="font-bold text-white text-lg">{o.name}</div>
                          <div className="text-white/80 text-sm">{o.state}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-white/80 text-xs">Gross</div>
                          <div className="text-white font-bold text-lg">${fmt(o.salary)}</div>
                        </div>
                        {isBest && (
                          <span className="ml-3 bg-white/20 text-white text-xs font-semibold px-2 py-1 rounded-full">⭐ Best</span>
                        )}
                      </div>
                      <div className="p-4 grid grid-cols-3 gap-3">
                        <div className="text-center">
                          <div className="text-xs text-gray-500">After-Tax</div>
                          <div className="font-bold text-green-600">${fmt(o.afterTax)}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-500">Total Tax</div>
                          <div className="font-bold text-red-500">${fmt(o.totalTax)}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-500">Eff. Rate</div>
                          <div className="font-bold text-amber-600">{o.effectiveRate.toFixed(1)}%</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-500">Federal</div>
                          <div className="font-semibold text-gray-700">${fmt(o.fed)}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-500">State</div>
                          <div className="font-semibold text-gray-700">${fmt(o.st)}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-500">Monthly</div>
                          <div className="font-semibold text-gray-700">${fmt(o.afterTax / 12)}</div>
                        </div>
                      </div>
                      <div className="px-4 pb-3 flex justify-end">
                        <button onClick={() => removeOffer(i)} className="text-xs text-gray-400 hover:text-red-500 transition-colors">Remove</button>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
