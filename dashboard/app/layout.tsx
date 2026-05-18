import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
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
  title: "Canar Fuel Tanker Monitor | Sudan IoT Dashboard",
  description:
    "Live monitoring of 6 fuel tankers across Sudan. React + Next.js rebuild of a 2023 industrial IoT system originally built on Node-RED + ThingsBoard for Canar.",
  authors: [{ name: "Babakr Hussain" }],
  keywords: ["IoT", "Node-RED", "ThingsBoard", "fuel monitoring", "Sudan", "telemetry"],
  openGraph: {
    title: "Canar Fuel Tanker Monitor",
    description:
      "Live fuel tanker monitoring across 6 sites in Sudan. Rebuild of a 2023 industrial IoT system.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-canar-bg">
        <header className="bg-white border-b border-zinc-200 shadow-sm">
          <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="size-9 rounded-md bg-canar-blue flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="size-5 text-white" fill="currentColor">
                  <path d="M12 2C8 2 5 5 5 9c0 5.5 7 13 7 13s7-7.5 7-13c0-4-3-7-7-7zm0 10a3 3 0 110-6 3 3 0 010 6z" />
                </svg>
              </div>
              <div>
                <div className="text-base font-semibold text-zinc-900 leading-tight">Canar Fuel Tanker Monitor</div>
                <div className="text-xs text-zinc-500 leading-tight">Sudan deployment — Rebuild v1.0</div>
              </div>
            </Link>
            <nav className="flex items-center gap-1 text-sm">
              <Link href="/" className="px-3 py-1.5 rounded-md hover:bg-zinc-100 text-zinc-700 font-medium">
                Overview
              </Link>
              <Link href="/about" className="px-3 py-1.5 rounded-md hover:bg-zinc-100 text-zinc-700 font-medium">
                About
              </Link>
              <a
                href="https://github.com/bekoblast/fuel-tanker-monitor"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-md hover:bg-zinc-100 text-zinc-500"
              >
                Source
              </a>
            </nav>
          </div>
        </header>
        <main className="flex-1 max-w-[1600px] w-full mx-auto px-6 py-6">
          {children}
        </main>
        <footer className="border-t border-zinc-200 bg-white">
          <div className="max-w-[1600px] mx-auto px-6 py-3 text-xs text-zinc-500 flex items-center justify-between flex-wrap gap-2">
            <span>
              Rebuild of the 2023 Canar fuel monitoring system &middot; Khartoum / Omdurman / Port Sudan / Wad Madani / Kassala.
            </span>
            <span className="font-mono text-zinc-400">Node-RED &rarr; WebSocket &rarr; React</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
