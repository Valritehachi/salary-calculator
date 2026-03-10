'use client';

import { useState, useId } from 'react';

interface Check {
  id: string;
  label: string;
  amount: string;
}

function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#8b5cf6', '#f97316', '#10b981', '#3b82f6'];

export default function PaycheckTotals() {
  const uid = useId();
  const [checks, setChecks] = useState<Check[]>([
    { id: '1', label: 'Paycheck 1', amount: '' },
    { id: '2', label: 'Paycheck 2', amount: '' },
  ]);

  const addCheck = () => {
    setChecks((prev) => [
      ...prev,
      { id: Date.now().toString(), label: `Paycheck ${prev.length + 1}`, amount: '' },
    ]);
  };

  const removeCheck = (id: string) => {
    setChecks((prev) => prev.filter((c) => c.id !== id));
  };

  const updateCheck = (id: string, field: 'label' | 'amount', value: string) => {
    setChecks((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  const amounts = checks.map((c) => parseFloat(c.amount) || 0);
  const total = amounts.reduce((a, b) => a + b, 0);
  const count = amounts.filter((a) => a > 0).length;
  const avg = count > 0 ? total / count : 0;
  const max = count > 0 ? Math.max(...amounts.filter((a) => a > 0)) : 0;

  // Bar chart data
  const maxAmt = max || 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b border-indigo-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <span className="text-lg font-bold text-gray-900">Paycheck Totals</span>
          <a href="/" className="ml-auto text-sm text-gray-500 hover:text-teal-600 transition-colors">← All Calculators</a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            Paycheck{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-cyan-600">Totals</span>
          </h1>
          <p className="text-gray-600">Add all your paychecks or income sources and instantly see your combined total.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Input list */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Your Checks</h2>
                <button
                  onClick={addCheck}
                  className="flex items-center gap-1.5 text-sm font-medium text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Check
                </button>
              </div>

              <div className="space-y-3">
                {checks.map((check, i) => (
                  <div key={check.id} className="flex items-center gap-2 group">
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ background: COLORS[i % COLORS.length] }}
                    />
                    <input
                      type="text"
                      value={check.label}
                      onChange={(e) => updateCheck(check.id, 'label', e.target.value)}
                      className="flex-1 min-w-0 px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
                      placeholder="Label"
                    />
                    <div className="relative w-36 flex-shrink-0">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                      <input
                        type="number"
                        value={check.amount}
                        onChange={(e) => updateCheck(check.id, 'amount', e.target.value)}
                        className="w-full pl-6 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    {checks.length > 1 && (
                      <button
                        onClick={() => removeCheck(check.id)}
                        className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={addCheck}
                className="mt-4 w-full py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-teal-300 hover:text-teal-500 transition-all"
              >
                + Add another check
              </button>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="text-xs text-gray-500 mb-1">Total</div>
                <div className="text-2xl font-bold text-teal-600">${fmt(total)}</div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="text-xs text-gray-500 mb-1">Average per Check</div>
                <div className="text-2xl font-bold text-indigo-600">${fmt(avg)}</div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="text-xs text-gray-500 mb-1">Checks Entered</div>
                <div className="text-2xl font-bold text-gray-800">{count}</div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="text-xs text-gray-500 mb-1">Largest Check</div>
                <div className="text-2xl font-bold text-amber-600">${fmt(max)}</div>
              </div>
            </div>
          </div>

          {/* Right: Visualization */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Visual Breakdown</h2>

            {total === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <svg className="w-16 h-16 mb-3 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="text-sm">Enter check amounts to see a chart</p>
              </div>
            ) : (
              <>
                {/* Stacked bar showing proportions */}
                <div className="mb-6">
                  <div className="text-xs text-gray-500 mb-2">Proportion of total</div>
                  <div className="flex rounded-xl overflow-hidden h-8">
                    {checks.map((c, i) => {
                      const amt = parseFloat(c.amount) || 0;
                      const pct = total > 0 ? (amt / total) * 100 : 0;
                      if (pct === 0) return null;
                      return (
                        <div
                          key={c.id}
                          style={{ width: `${pct}%`, background: COLORS[i % COLORS.length] }}
                          title={`${c.label}: $${fmt(amt)} (${pct.toFixed(1)}%)`}
                          className="transition-all duration-500"
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Bar chart */}
                <div className="mb-6">
                  <div className="text-xs text-gray-500 mb-3">Amount per check</div>
                  <div className="space-y-2.5">
                    {checks.map((c, i) => {
                      const amt = parseFloat(c.amount) || 0;
                      const pct = (amt / maxAmt) * 100;
                      return (
                        <div key={c.id} className="flex items-center gap-3">
                          <div className="w-24 text-xs text-gray-600 truncate flex-shrink-0 text-right">{c.label}</div>
                          <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                              style={{ width: `${pct}%`, background: COLORS[i % COLORS.length], minWidth: amt > 0 ? '1rem' : '0' }}
                            >
                              {pct > 20 && (
                                <span className="text-white text-xs font-semibold">${fmt(amt)}</span>
                              )}
                            </div>
                          </div>
                          {pct <= 20 && amt > 0 && (
                            <span className="text-xs font-semibold text-gray-700 flex-shrink-0">${fmt(amt)}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Legend */}
                <div className="border-t border-gray-100 pt-4 space-y-2">
                  {checks.map((c, i) => {
                    const amt = parseFloat(c.amount) || 0;
                    if (amt === 0) return null;
                    const pct = total > 0 ? (amt / total) * 100 : 0;
                    return (
                      <div key={c.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                          <span className="text-gray-600">{c.label}</span>
                        </div>
                        <div className="flex items-center gap-3 text-right">
                          <span className="text-gray-400 text-xs">{pct.toFixed(1)}%</span>
                          <span className="font-semibold text-gray-900 w-24">${fmt(amt)}</span>
                        </div>
                      </div>
                    );
                  })}
                  <div className="flex items-center justify-between text-sm border-t border-gray-100 pt-2 mt-1">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-bold text-teal-600 text-base">${fmt(total)}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
