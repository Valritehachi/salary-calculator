import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Salary Calculator — After-Tax, Hourly, Self-Employment & More",
  description: "Free salary calculators: after-tax income, salary to hourly, self-employment tax, cost of living comparison, job offer comparison, and more.",
  keywords: "salary calculator, after tax calculator, take home pay, self employment tax, cost of living calculator, job offer comparison",
  metadataBase: new URL('https://salary-calculate.com'),
  verification: {
    google: 'AG4VlUgCu_q5JSqRBit4kKxmaYWogQII26SeudO8Ahg',
  },
  openGraph: {
    title: "Salary Calculator — After-Tax, Hourly, Self-Employment & More",
    description: "Free salary calculators to figure out your take-home pay, compare job offers, and plan your finances.",
    type: "website",
    url: "https://salary-calculate.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
