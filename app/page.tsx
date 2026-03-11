"use client";
import { useEffect, useState } from "react";

const DONUT_DATA = [
  { label: "Take-Home Pay", value: 58, color: "#22c55e" },
  { label: "Federal Tax", value: 22, color: "#f59e0b" },
  { label: "State Tax", value: 8, color: "#f97316" },
  { label: "FICA", value: 12, color: "#6366f1" },
];

function DonutChart() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const duration = 1200;
    const raf = () => {
      const p = Math.min((Date.now() - start) / duration, 1);
      setProgress(p);
      if (p < 1) requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }, []);

  const cx = 100, cy = 100, r = 70;
  const circumference = 2 * Math.PI * r;
  let cumulative = 0;

  const segments = DONUT_DATA.map((d) => {
    const dash = (d.value / 100) * circumference * progress;
    const gap = circumference - dash;
    const offset = -cumulative * circumference / 100 * progress - circumference * 0.25;
    cumulative += d.value;
    return { ...d, dash, gap, offset };
  });

  return (
    <div className="relative flex flex-col items-center">
      <svg width={200} height={200} viewBox="0 0 200 200">
        {segments.map((s, i) => (
          <circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={s.color}
            strokeWidth={28}
            strokeDasharray={`${s.dash} ${s.gap}`}
            strokeDashoffset={s.offset}
            style={{ transition: "stroke-dasharray 0.05s" }}
          />
        ))}
        <circle cx={cx} cy={cy} r={56} fill="white" />
        <text x={cx} y={cy - 8} textAnchor="middle" className="text-xs" fill="#111827" style={{ fontSize: 11, fontWeight: 600 }}>$80k salary</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fill="#22c55e" style={{ fontSize: 13, fontWeight: 700 }}>$58k</text>
        <text x={cx} y={cy + 24} textAnchor="middle" fill="#6b7280" style={{ fontSize: 9 }}>take-home</text>
      </svg>
      <div className="flex flex-wrap justify-center gap-3 mt-2">
        {DONUT_DATA.map((d) => (
          <div key={d.label} className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className="inline-block w-3 h-3 rounded-full" style={{ background: d.color }} />
            {d.label} <span className="font-semibold text-gray-800">{d.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnimatedNumber({ target, prefix = "", suffix = "" }: { target: number; prefix?: string; suffix?: string }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const duration = 1400;
    const raf = () => {
      const p = Math.min((Date.now() - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(ease * target));
      if (p < 1) requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }, [target]);
  return <span>{prefix}{val.toLocaleString()}{suffix}</span>;
}

const CALCULATORS = [
  { href: "/salary-to-hourly", color: "blue", hover: "hover:border-blue-400", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", title: "Salary to Hourly", desc: "Convert annual salary to hourly, daily, or weekly rates. Example: $60,000/year = $28.85/hour.", grad: "from-blue-500 to-blue-600" },
  { href: "/after-tax", color: "green", hover: "hover:border-green-400", icon: "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z", title: "After Tax Calculator", desc: "Calculate take-home pay after federal and state taxes.", grad: "from-green-500 to-emerald-600" },
  { href: "/self-employment-tax", color: "indigo", hover: "hover:border-indigo-400", icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0H8", title: "Self-Employment Tax", desc: "Calculate self-employment tax (15.3%) plus income tax for freelancers.", grad: "from-indigo-500 to-purple-600" },
  { href: "/paycheck-totals", color: "teal", hover: "hover:border-teal-400", icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z", title: "Paycheck Totals", desc: "Add multiple paychecks or income sources and see your combined total with a visual breakdown.", grad: "from-teal-500 to-cyan-600" },
  { href: "/multiple-income", color: "cyan", hover: "hover:border-cyan-400", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", title: "Multiple Income", desc: "Aggregate multiple income sources with combined tax calculations.", grad: "from-cyan-500 to-teal-600" },
  { href: "/cost-of-living", color: "purple", hover: "hover:border-purple-400", icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z", title: "Cost of Living", desc: "Compare salaries across cities. $70k in NYC = $85k equivalent in Austin.", grad: "from-purple-500 to-fuchsia-600" },
  { href: "/job-offer-comparison", color: "rose", hover: "hover:border-rose-400", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2", title: "Job Offer Comparison", desc: "Compare multiple job offers side-by-side with total compensation analysis.", grad: "from-rose-500 to-red-600" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b border-indigo-100 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V7m0 1v8m0 0v1" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Salary Calculator</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="text-center mb-6">
          <h2 className="text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Discovervvv Your Salary's{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
              True Value
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Comprehensive calculators to understand your earnings, taxes, and financial picture.
          </p>
        </div>

        {/* Visualization Hero Card */}
        <div className="bg-white border border-indigo-100 shadow-xl rounded-2xl p-8 mb-12 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-shrink-0">
            <DonutChart />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">See Where Your Money Goes</h3>
            <p className="text-gray-600 mb-6">On an $80,000 salary, taxes take a significant cut. Our calculators help you understand the full picture.</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                <div className="text-2xl font-bold text-green-600">
                  <AnimatedNumber target={58000} prefix="$" />
                </div>
                <div className="text-sm text-gray-600">Average take-home</div>
              </div>
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                <div className="text-2xl font-bold text-amber-600">
                  <AnimatedNumber target={22000} prefix="$" />
                </div>
                <div className="text-sm text-gray-600">Paid in taxes</div>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <div className="text-2xl font-bold text-blue-600">
                  <AnimatedNumber target={28} prefix="$" suffix="/hr" />
                </div>
                <div className="text-sm text-gray-600">Effective hourly rate</div>
              </div>
              <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                <div className="text-2xl font-bold text-purple-600">
                  <AnimatedNumber target={27} suffix="%" />
                </div>
                <div className="text-sm text-gray-600">Effective tax rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Calculator Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CALCULATORS.map((c) => (
            <a
              key={c.href}
              href={c.href}
              className={`group relative overflow-hidden bg-white border border-gray-100 rounded-2xl p-6 hover:border-indigo-200 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl shadow-sm`}
            >
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${c.grad}`} />
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${c.grad} mb-4 shadow-md`}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={c.icon} />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">{c.title}</h3>
              <p className="text-sm text-gray-600">{c.desc}</p>
              <div className="mt-4 flex items-center text-xs font-medium text-indigo-500 group-hover:text-indigo-600">
                Open calculator
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </a>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 pb-6">
          <div className="border-t border-gray-200 pt-8 text-center">
            <p className="text-sm text-gray-500">Free salary and tax calculators for employees, freelancers, and job seekers. Calculate your real take-home pay after federal tax, state tax, and FICA — or compare job offers, convert your salary to hourly, and see what your income is worth in another city.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
