import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Slidespoken demo",
  description: "Speak in English, Malayalam or Hindi and watch slides appear live.",
};

export default function DemoLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
