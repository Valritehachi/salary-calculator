'use client';

import { useState } from 'react';

function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function SalaryToHourly() {
  const [salary, setSalary] = useState<number>(60000);
  const [hoursPerWeek, setHoursPerWeek] = useState<number>(40);
  const [weeksPerYear, setWeeksPerYear] = useState<number>(52);
  const [ptoDays, setPtoDays] = useState<number>(10);

  const effectiveWeeks = weeksPerYear - ptoDays / 5;
  const totalHours = effectiveWeeks * hoursPerWeek;
  const hourlyWage = totalHours > 0 ? salary / totalHours : 0;
  const dailyWage = hourlyWage * (hoursPerWeek / 5);
  const weeklyWage = hourlyWage * hoursPerWeek;
  const monthlySalary = salary / 12;
  const biWeekly = salary / 26;

  const rates = [
    { label: 'Per Hour', value: hourlyWage, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', icon: '⏱' },
    { label: 'Per Day', value: dailyWage, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100', icon: '📅' },
    { label: 'Per Week', value: weeklyWage, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100', icon: '🗓' },
    { label: 'Bi-Weekly', value: biWeekly, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', icon: '💵' },
    { label: 'Per Month', value: monthlySalary, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', icon: '📆' },
    { label: 'Per Year', value: salary, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100', icon: '🏦' },
  ];

  const maxBar = Math.max(...rates.map(r => r.value));

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50">
      <header className="border-b border-indigo-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-lg font-bold text-gray-900">Salary to Hourly</span>
          <a href="/" className="ml-auto text-sm text-gray-600 hover:text-blue-600 transition-colors">← All Calculators</a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            Salary to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600">Hourly</span>
          </h1>
          <p className="text-gray-600">Find out exactly what you earn at every time scale.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Inputs */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
            <h2 className="text-lg font-semibold text-gray-900">Your Work Details</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Annual Salary</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
                <input
                  type="number"
                  value={salary}
                  onChange={(e) => setSalary(Number(e.target.value))}
                  className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hours per Week <span className="text-blue-500 font-semibold">{hoursPerWeek}h</span>
              </label>
              <input
                type="range"
                min={1} max={80} value={hoursPerWeek}
                onChange={(e) => setHoursPerWeek(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1"><span>1h</span><span>80h</span></div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weeks per Year <span className="text-blue-500 font-semibold">{weeksPerYear}wk</span>
              </label>
              <input
                type="range"
                min={1} max={52} value={weeksPerYear}
                onChange={(e) => setWeeksPerYear(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1"><span>1wk</span><span>52wk</span></div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PTO Days <span className="text-blue-500 font-semibold">{ptoDays}d</span>
              </label>
              <input
                type="range"
                min={0} max={30} value={ptoDays}
                onChange={(e) => setPtoDays(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1"><span>0d</span><span>30d</span></div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-gray-700">
              <span className="font-semibold text-blue-700">Effective hours/year: </span>
              {totalHours.toLocaleString()} hrs
              ({effectiveWeeks.toFixed(1)} weeks × {hoursPerWeek}h)
            </div>
          </div>

          {/* Results */}
          <div className="space-y-4">
            {/* Hero rate */}
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="text-sm font-medium text-blue-100 mb-1">Your effective hourly rate</div>
              <div className="text-5xl font-extrabold">${fmt(hourlyWage)}<span className="text-2xl font-normal text-blue-200">/hr</span></div>
              <div className="text-blue-200 text-sm mt-2">Based on {totalHours.toLocaleString()} working hours/year</div>
            </div>

            {/* Rate grid */}
            <div className="grid grid-cols-2 gap-3">
              {rates.slice(1).map((r) => (
                <div key={r.label} className={`${r.bg} border ${r.border} rounded-xl p-4`}>
                  <div className="text-xs text-gray-500 mb-1">{r.label}</div>
                  <div className={`text-xl font-bold ${r.color}`}>${fmt(r.value)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bar visualization */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-5">Earnings at a Glance</h2>
          <div className="space-y-3">
            {rates.map((r) => (
              <div key={r.label} className="flex items-center gap-4">
                <div className="w-20 text-sm text-gray-600 text-right flex-shrink-0">{r.label}</div>
                <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                  <div
                    className="h-full rounded-full flex items-center justify-end pr-3 transition-all duration-500"
                    style={{
                      width: `${Math.max((r.value / maxBar) * 100, 2)}%`,
                      background: `var(--tw-gradient-stops)`,
                      backgroundColor: r.color.replace('text-', '').includes('blue') ? '#3b82f6'
                        : r.color.includes('green') ? '#22c55e'
                        : r.color.includes('purple') ? '#a855f7'
                        : r.color.includes('amber') ? '#f59e0b'
                        : r.color.includes('rose') ? '#f43f5e'
                        : '#6366f1'
                    }}
                  >
                    {(r.value / maxBar) > 0.25 && (
                      <span className="text-white text-xs font-semibold">${fmt(r.value)}</span>
                    )}
                  </div>
                </div>
                {(r.value / maxBar) <= 0.25 && (
                  <span className="text-sm font-semibold text-gray-700 w-24 flex-shrink-0">${fmt(r.value)}</span>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-8 border-t border-gray-100 pt-6 pb-8">
          <div className="max-w-3xl mx-auto space-y-2">
            {[
              { q: 'Why does my hourly rate change with PTO days?', a: 'Paid days off reduce your actual working hours while keeping your annual pay the same — so each hour you work is worth more.' },
              { q: 'Salaried vs hourly — which is better?', a: 'Salary offers stability; hourly gives you overtime pay. Compare them using your actual weekly hours — a $70k salary at 50 hrs/week is only $26.92/hr.' },
            ].map(({ q, a }) => (
              <p key={q} className="text-sm text-gray-500"><span className="font-medium text-gray-700">{q}</span>{' '}{a}</p>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
