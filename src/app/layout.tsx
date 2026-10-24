import type { Metadata } from "next";
import { Inter, Noto_Sans_Devanagari, Noto_Sans_Malayalam, Outfit, Playfair_Display, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const outfit = Outfit({ variable: "--font-outfit", subsets: ["latin"] });
const grotesk = Space_Grotesk({ variable: "--font-grotesk", subsets: ["latin"] });
const serif = Playfair_Display({ variable: "--font-serif", subsets: ["latin"] });
const malayalam = Noto_Sans_Malayalam({ variable: "--font-malayalam", subsets: ["malayalam"] });
const devanagari = Noto_Sans_Devanagari({ variable: "--font-devanagari", subsets: ["devanagari"] });

export const metadata: Metadata = {
  title: "Slidespoken",
  description: "Speak in English, Malayalam or Hindi and watch slides appear live.",
};

const fontVars = [inter, outfit, grotesk, serif, malayalam, devanagari].map((f) => f.variable).join(" ");

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`dark ${fontVars}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
