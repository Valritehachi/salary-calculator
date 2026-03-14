'use client';

import { useState } from 'react';

export default function RaiseCalculator() {
  const [currentSalary, setCurrentSalary] = useState<number>(75000);
  const [raisePercent, setRaisePercent] = useState<number>(5);

  const raiseAmount = currentSalary * (raisePercent / 100);
  const newSalary = currentSalary + raiseAmount;
  const extraMonthly = raiseAmount / 12;
  const extraYearly = raiseAmount;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Raise Calculator</h1>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Current Salary ($)</label>
            <input
              type="number"
              value={currentSalary}
              onChange={(e) => setCurrentSalary(Number(e.target.value))}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Raise (%)</label>
            <input
              type="number"
              value={raisePercent}
              onChange={(e) => setRaisePercent(Number(e.target.value))}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <div className="mt-8 space-y-2">
          <p className="text-lg font-semibold">Results:</p>
          <p>New Salary: ${newSalary.toLocaleString()}</p>
          <p>Extra Monthly: ${extraMonthly.toFixed(2)}</p>
          <p>Extra Yearly: ${extraYearly.toFixed(2)}</p>
        </div>
        <a href="/" className="mt-6 inline-block text-blue-600 hover:text-blue-800">Back to Home</a>
        <div className="mt-8 pt-6 border-t border-gray-100 space-y-2">
          {[
            { q: 'How much of a raise do I actually keep?', a: 'Typically 65–75% after taxes. A $5,000 raise will net roughly $3,250–$3,750 depending on your bracket and state.' },
            { q: "What's a good raise to ask for?", a: "3–5% is typical for a cost-of-living adjustment. A promotion or competing offer warrants 10–20%. Always anchor to market data, not just inflation." },
          ].map(({ q, a }) => (
            <p key={q} className="text-sm text-gray-500"><span className="font-medium text-gray-700">{q}</span>{' '}{a}</p>
          ))}
        </div>
      </div>
    </div>
  );
}