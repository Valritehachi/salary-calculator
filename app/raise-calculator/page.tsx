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
        <div className="mt-8 pt-6 border-t border-gray-100 space-y-3 text-xs text-gray-600 leading-relaxed">
          <p>Use this salary raise calculator to find out exactly how much more money you'll earn after a raise. Enter your current salary and raise percentage to instantly see your new annual salary, extra monthly income, and total yearly increase.</p>
          <p>Whether you've received a merit increase, cost of living adjustment (COLA), or promotion, this tool helps you understand the real dollar impact. A 5% raise on a $75,000 salary equals $3,750 more per year — or about $312 extra per month before taxes.</p>
          <p>Common searches: raise calculator · salary increase calculator · how much is a 5% raise · pay raise calculator · merit increase · cost of living raise · promotion salary calculator · percentage raise calculator · annual raise calculator · how much will I make after a raise</p>
        </div>
      </div>
    </div>
  );
}