import type { Metadata } from "next";
import { IBM_Plex_Mono, Newsreader } from "next/font/google";

import "./globals.css";

const display = Newsreader({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Backbrief — Understand what your coding agent changed",
  description:
    "Turn an agent session and its diff into a grounded handoff and a three-question reverse brief.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${mono.variable}`}>{children}</body>
    </html>
  );
}
