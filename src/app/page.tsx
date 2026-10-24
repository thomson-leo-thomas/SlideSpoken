import type { Metadata } from "next";
import Link from "next/link";
import { DM_Sans, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { EvidenceExample } from "@/components/landing/EvidenceExample";
import { HeroDemo } from "@/components/landing/HeroDemo";
import { DEMO_PATH, REPO_URL, SITE_URL, VIDEO_URL } from "@/lib/config";

const display = Instrument_Serif({ weight: "400", subsets: ["latin"], variable: "--nf-display" });
const body = DM_Sans({ subsets: ["latin"], variable: "--nf-body" });
const code = JetBrains_Mono({ subsets: ["latin"], variable: "--nf-code", preload: false });

const TITLE = "Slidespoken | Speak. Your slides build themselves.";
const DESCRIPTION = "Slidespoken builds your slides while you speak, in English, Malayalam or Hindi, using only the words you said.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Slidespoken",
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Slidespoken: Say it. See it." }],
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: ["/og.png"] },
};

const STEPS = [
  { n: "01", title: "Listen", text: "Your voice is recorded in 5-second chunks. Recording never stops." },
  { n: "02", title: "Understand", text: "Each chunk is turned into text, then into one slide, in the background." },
  { n: "03", title: "Show", text: "The slide appears about 3 seconds behind you and stays up at least 3 seconds." },
];

const GROUNDED = [
  "Every bullet is checked against your transcript before it is shown.",
  "Unclear speech makes no slide, instead of a guess.",
  "Names and terms stay exactly as you said them.",
];

const MILESTONES = [
  { id: "M1", text: "Microphone recording, transcription, live transcript and language selector" },
  { id: "M2", text: "Slide generation with validation, slide rendering and animations" },
  { id: "M3", text: "Voice commands and a fallback slide when generation fails" },
  { id: "Polish", text: "Topic themes, translation, live captions and grounded slides" },
];

const container = "mx-auto w-full max-w-[1100px] px-5 sm:px-8";
const label = "font-code text-[11px] uppercase tracking-[0.14em] text-muted";
const primaryButton =
  "inline-flex items-center justify-center bg-ink px-5 py-3 text-[15px] font-medium text-paper transition-opacity hover:opacity-85";
const textLink = "underline decoration-gold decoration-2 underline-offset-[6px] transition-colors hover:text-gold-dark";

export default function Home() {
  return (
    <div className={`landing ${display.variable} ${body.variable} ${code.variable} min-h-dvh bg-paper font-body text-ink`}>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:bg-ink focus:px-3 focus:py-2 focus:text-paper">
        Skip to content
      </a>

      <header className={`${container} flex items-center justify-between gap-4 py-5`}>
        <Link href="/" className="font-display text-[26px] leading-none">
          Slidespoken
        </Link>
        <nav aria-label="Main" className="flex items-center gap-6 text-[15px]">
          <a href="#how" className="hidden hover:text-gold-dark sm:inline">
            How it works
          </a>
          <a href="#grounded" className="hidden hover:text-gold-dark sm:inline">
            Grounded
          </a>
          <a href={REPO_URL} className="hidden hover:text-gold-dark sm:inline">
            GitHub
          </a>
          <Link href={DEMO_PATH} className={`${primaryButton} px-4 py-2 text-[14px]`}>
            Try the demo
          </Link>
        </nav>
      </header>

      <main id="main">
        {/* Hero */}
        <section className={`${container} pb-16 pt-10 sm:pb-24 sm:pt-16`}>
          <p className={`${label} flex items-center gap-3`}>
            <span className="h-px w-8 bg-gold" aria-hidden />
            Devin Hacks Kochi
          </p>
          <h1 className="mt-6 font-display text-[64px] leading-[0.95] tracking-[-0.01em] sm:text-[96px] lg:text-[120px]">
            Say it. See it.
          </h1>
          <p className="mt-6 max-w-[34rem] text-[18px] leading-relaxed text-ink/80 sm:text-[20px]">
            Slidespoken builds your slides while you speak, in English, Malayalam or Hindi, using only the words you said.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            <Link href={DEMO_PATH} className={primaryButton}>
              Try the live demo
            </Link>
            {VIDEO_URL && (
              <a href={VIDEO_URL} className={`text-[15px] ${textLink}`}>
                Watch the 2-minute video
              </a>
            )}
            <a href={REPO_URL} className={`text-[15px] ${textLink}`}>
              View on GitHub
            </a>
          </div>

          <div className="mt-14 grid gap-10 sm:mt-20 lg:grid-cols-[1fr_200px] lg:gap-12">
            <HeroDemo />
            <div className="flex gap-10 lg:flex-col lg:gap-8 lg:pt-4">
              <p lang="ml" className="m-0 flex flex-col font-body">
                <span className="text-[44px] leading-tight sm:text-[52px]">പറയൂ</span>
                <span lang="en" className={label}>
                  Speak
                </span>
              </p>
              <p lang="hi" className="m-0 flex flex-col font-body">
                <span className="text-[44px] leading-tight sm:text-[52px]">बोलिए</span>
                <span lang="en" className={label}>
                  Speak
                </span>
              </p>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" aria-labelledby="how-title" className="border-t border-ink/15">
          <div className={`${container} py-16 sm:py-24`}>
            <h2 id="how-title" className="font-display text-[44px] leading-none sm:text-[56px]">
              How it works
            </h2>
            <ol className="m-0 mt-12 grid list-none gap-10 p-0 sm:grid-cols-3 sm:gap-8">
              {STEPS.map((s) => (
                <li key={s.n} className="border-t border-ink/15 pt-6 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
                  <p aria-hidden className="m-0 font-display text-[72px] leading-none text-ink/85">
                    {s.n}
                  </p>
                  <h3 className="mt-4 text-[18px] font-semibold">{s.title}</h3>
                  <p className="mt-2 text-[16px] leading-relaxed text-ink/80">{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Grounded */}
        <section id="grounded" aria-labelledby="grounded-title" className="border-t border-ink/15">
          <div className={`${container} py-16 sm:py-28`}>
            <p className={`${label} flex items-center gap-3`}>
              <span className="h-px w-8 bg-gold" aria-hidden />
              Grounded, not invented
            </p>
            <h2 id="grounded-title" className="mt-6 max-w-[14ch] font-display text-[52px] leading-[0.95] sm:text-[80px]">
              Your words. Nothing added.
            </h2>
            <p className="mt-6 max-w-[36rem] text-[18px] leading-relaxed text-ink/80 sm:text-[20px]">
              Most AI slide tools add statistics, names and extras you never said. Slidespoken is built to refuse that.
            </p>
            <div className="mt-12">
              <EvidenceExample />
            </div>
            <ul className="m-0 mt-12 grid list-none gap-6 p-0 sm:grid-cols-3 sm:gap-8">
              {GROUNDED.map((g) => (
                <li key={g} className="border-t border-ink/15 pt-4 text-[17px] leading-relaxed">
                  {g}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Languages */}
        <section aria-labelledby="lang-title" className="border-t border-ink/15">
          <div className={`${container} py-16 sm:py-24`}>
            <h2 id="lang-title" className="font-display text-[44px] leading-none sm:text-[56px]">
              Speak in your own language.
            </h2>
            <ul className="m-0 mt-10 list-none p-0 text-[48px] leading-[1.25] sm:text-[72px]">
              <li lang="en" className="font-display">
                English
              </li>
              <li lang="ml" className="sm:pl-[12%]">
                മലയാളം
              </li>
              <li lang="hi" className="sm:pl-[24%]">
                हिन्दी
              </li>
            </ul>
            <p className="mt-10 max-w-[40rem] text-[16px] leading-relaxed text-muted">
              Malayalam and Hindi transcription can be less accurate than English. Slides show your words as transcribed, never corrected.
            </p>
          </div>
        </section>

        {/* Built with Devin */}
        <section aria-labelledby="devin-title" className="border-t border-ink/15">
          <div className={`${container} grid gap-10 py-16 sm:py-24 lg:grid-cols-[1fr_1fr] lg:gap-16`}>
            <div>
              <h2 id="devin-title" className="font-display text-[44px] leading-none sm:text-[56px]">
                Built milestone by milestone with Devin.
              </h2>
              <p className="mt-6 max-w-[32rem] text-[17px] leading-relaxed text-ink/80">
                Guided by an AGENTS.md rulebook, reviewed milestone by milestone, with tests and a build before every push.
              </p>
              <p className="mt-6">
                <a href={`${REPO_URL}/commits/main`} className={`text-[15px] ${textLink}`}>
                  See the commit history
                </a>
              </p>
            </div>
            <ol className="m-0 list-none border-l border-ink/20 p-0">
              {MILESTONES.map((m) => (
                <li key={m.id} className="relative pb-7 pl-7 last:pb-0">
                  <span aria-hidden className="absolute -left-[5px] top-[7px] h-[9px] w-[9px] bg-gold" />
                  <p className="m-0 flex items-baseline gap-3">
                    <span className="font-code text-[13px]">{m.id}</span>
                    <span className={label}>Done</span>
                  </p>
                  <p className="mt-1 text-[16px] leading-relaxed text-ink/80">{m.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Final call to action */}
        <section aria-labelledby="cta-title" className="border-t border-ink/15">
          <div className={`${container} py-20 sm:py-28`}>
            <h2 id="cta-title" className="font-display text-[56px] leading-none sm:text-[88px]">
              Give it a try.
            </h2>
            <div className="mt-8 flex flex-col items-start gap-4">
              <Link href={DEMO_PATH} className={primaryButton}>
                Open Slidespoken
              </Link>
              <p className="m-0 text-[15px] text-muted">Works best in Chrome. Allow microphone access when asked.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-ink/15">
        <div className={`${container} flex flex-col gap-6 py-10 text-[14px] text-muted sm:flex-row sm:items-start sm:justify-between`}>
          <p className="m-0 max-w-[36rem] leading-relaxed">
            Slidespoken by Team SenseStreet. Thomson Leo Thomas, Viswajyothi College of Engineering and Technology, Ernakulam.
          </p>
          <nav aria-label="Footer" className="flex gap-6">
            <a href={REPO_URL} className="hover:text-ink">
              GitHub
            </a>
            <Link href={DEMO_PATH} className="hover:text-ink">
              Demo
            </Link>
            {VIDEO_URL && (
              <a href={VIDEO_URL} className="hover:text-ink">
                Video
              </a>
            )}
          </nav>
        </div>
      </footer>
    </div>
  );
}
