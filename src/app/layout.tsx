import type { Metadata } from "next";
import { Inter, Noto_Sans_Devanagari, Noto_Sans_Malayalam } from "next/font/google";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const malayalam = Noto_Sans_Malayalam({ variable: "--font-malayalam", subsets: ["malayalam"] });
const devanagari = Noto_Sans_Devanagari({ variable: "--font-devanagari", subsets: ["devanagari"] });

export const metadata: Metadata = {
  title: "Slidespoken",
  description: "Speak in English, Malayalam or Hindi and watch slides appear live.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${malayalam.variable} ${devanagari.variable}`}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
