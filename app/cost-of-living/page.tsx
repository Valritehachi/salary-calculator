'use client';

import { useState } from 'react';

const cities: { [key: string]: { index: number; emoji: string } } = {
  'New York':      { index: 120, emoji: '🗽' },
  'San Francisco': { index: 150, emoji: '🌉' },
  'Los Angeles':   { index: 110, emoji: '🌴' },
  'Seattle':       { index: 130, emoji: '⛵' },
  'Chicago':       { index: 100, emoji: '🏙' },
  'Philadelphia':  { index: 105, emoji: '🔔' },
  'Denver':        { index: 105, emoji: '🏔' },
  'Miami':         { index: 95,  emoji: '🌊' },
  'Houston':       { index: 90,  emoji: '🤠' },
  'Phoenix':       { index: 85,  emoji: '☀️' },
};

function fmt(n: number) {
  return Math.round(n).toLocaleString('en-US');
}

export default function CostOfLiving() {
  const [salary, setSalary] = useState<number>(80000);
  const [fromCity, setFromCity] = useState<string>('Miami');
  const [toCity, setToCity] = useState<string>('San Francisco');

  const fromIndex = cities[fromCity].index;
  const toIndex = cities[toCity].index;
  const equivalent = salary * (toIndex / fromIndex);
  const diff = equivalent - salary;
  const diffPct = ((toIndex - fromIndex) / fromIndex) * 100;
  const moreOrLess = diff > 0 ? 'more' : 'less';
  const cityNames = Object.keys(cities);

  // Bar chart: all cities normalized
  const allIndices = Object.values(cities).map(c => c.index);
  const maxIndex = Math.max(...allIndices);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <header className="border-b border-indigo-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <span className="text-lg font-bold text-gray-900">Cost of Living</span>
          <a href="/" className="ml-auto text-sm text-gray-600 hover:text-purple-600 transition-colors">← All Calculators</a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            Cost of{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-fuchsia-600">Living</span>
          </h1>
          <p className="text-gray-600">See what your salary is really worth in another city.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Inputs */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
              <h2 className="text-lg font-semibold text-gray-900">Your Details</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Salary</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="number"
                    value={salary}
                    onChange={(e) => setSalary(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current City</label>
                  <select
                    value={fromCity}
                    onChange={(e) => setFromCity(e.target.value)}
                    className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 text-sm"
                  >
                    {cityNames.map((c) => <option key={c} value={c}>{cities[c].emoji} {c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target City</label>
                  <select
                    value={toCity}
                    onChange={(e) => setToCity(e.target.value)}
                    className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 text-sm"
                  >
                    {cityNames.map((c) => <option key={c} value={c}>{cities[c].emoji} {c}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Result card */}
            <div className="bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="text-sm text-purple-200 mb-3">Equivalent salary in {toCity}</div>
              <div className="text-4xl font-extrabold">${fmt(equivalent)}</div>
              <div className={`mt-3 text-sm font-medium ${diff > 0 ? 'text-red-200' : 'text-green-200'}`}>
                {diff > 0 ? '▲' : '▼'} ${fmt(Math.abs(diff))} {moreOrLess} ({Math.abs(diffPct).toFixed(1)}% {diff > 0 ? 'higher' : 'lower'} cost)
              </div>
              <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-purple-200">{cities[fromCity].emoji} {fromCity} index</div>
                  <div className="font-bold text-lg">{fromIndex}</div>
                </div>
                <div>
                  <div className="text-purple-200">{cities[toCity].emoji} {toCity} index</div>
                  <div className="font-bold text-lg">{toIndex}</div>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-100 rounded-xl p-3 text-xs text-gray-600">
              Based on cost-of-living indices (Chicago = 100 baseline). Actual costs may vary.
            </div>
          </div>

          {/* City comparison chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-5">City Cost Index Comparison</h2>
            <div className="space-y-3">
              {cityNames
                .sort((a, b) => cities[b].index - cities[a].index)
                .map((city) => {
                  const idx = cities[city].index;
                  const pct = (idx / maxIndex) * 100;
                  const isFrom = city === fromCity;
                  const isTo = city === toCity;
                  return (
                    <div key={city} className="flex items-center gap-3">
                      <div className="w-28 text-sm text-gray-700 flex-shrink-0 flex items-center gap-1">
                        <span>{cities[city].emoji}</span>
                        <span className="truncate">{city}</span>
                      </div>
                      <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                          style={{
                            width: `${pct}%`,
                            background: isFrom ? '#8b5cf6' : isTo ? '#d946ef' : '#c4b5fd',
                          }}
                        >
                          {pct > 30 && (
                            <span className="text-white text-xs font-semibold">{idx}</span>
                          )}
                        </div>
                      </div>
                      {pct <= 30 && (
                        <span className="text-xs font-semibold text-gray-700 w-8">{idx}</span>
                      )}
                      {(isFrom || isTo) && (
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${isFrom ? 'bg-purple-100 text-purple-700' : 'bg-fuchsia-100 text-fuchsia-700'}`}>
                          {isFrom ? 'From' : 'To'}
                        </span>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
        {/* SEO Content */}
        <div className="mt-12 border-t border-gray-100 pt-8 pb-4">
          <div className="max-w-3xl mx-auto space-y-3 text-xs text-gray-600 leading-relaxed">
            <p>Moving to a new city? Use this cost of living calculator to find out what salary you need in your destination city to maintain the same purchasing power. Compare cities like New York, San Francisco, Los Angeles, Chicago, Miami, Houston, Seattle, Denver, and Phoenix.</p>
            <p>Cost of living indices factor in housing, groceries, transportation, utilities, and healthcare. A $100,000 salary in Miami is equivalent to roughly $158,000 in San Francisco. Houston and Phoenix offer the lowest costs among major US cities, while San Francisco and New York are the most expensive.</p>
            <p>Common searches: cost of living calculator · city salary comparison · salary equivalent by city · how much do I need to earn in New York · San Francisco cost of living salary · relocating salary calculator · compare cost of living · purchasing power calculator · cost of living index US cities · is it cheaper to live in Houston than LA</p>
          </div>
        </div>
      </main>
    </div>
  );
}
