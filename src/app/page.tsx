import Link from "next/link";
import { FeatureCard } from "@/components/feature-card";
import { Hero } from "@/components/hero";
import { SectionHeading } from "@/components/section-heading";
import { LanguageCard } from "@/components/language-card";
import { LANGUAGES } from "@/lib/sign-data";

const features = [
  {
    title: "One translator for three languages",
    description: "Switch between ASL, WSL, and ISL without changing apps or rebuilding the interface.",
    icon: "◇",
  },
  {
    title: "Browser-first interaction",
    description: "Use camera, text, and dictionary flows from a responsive web app designed for classrooms and public services.",
    icon: "◌",
  },
  {
    title: "Model-ready structure",
    description: "The UI separates language data, inference hooks, and sign entries so trained models can be added cleanly.",
    icon: "△",
  },
  {
    title: "Original accessibility copy",
    description: "Branding, wording, and layout are written for this project rather than copied from another sign-language site.",
    icon: "□",
  },
];

const steps = [
  ["Choose a language", "Select ASL, WSL, or ISL before starting a translation or dictionary lookup."],
  ["Capture a gesture", "Open the camera workspace and frame the signer in a well-lit area."],
  ["Run inference", "Connect a trained model to map hand landmarks to signs."],
  ["Share the result", "Convert predictions to text, speech, or saved conversation history."],
];

export default function Home() {
  return (
    <>
      <Hero />

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Built for accessibility"
            title="A shared workspace for multiple sign languages"
            description="SignBridge is designed for multilingual sign-language workflows while keeping the product identity, copy, and interface original."
          />

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-emerald-100 bg-white/90 p-8 shadow-sm dark:border-emerald-900/40 dark:bg-slate-900/80">
            <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
              <div className="max-w-3xl">
                <p className="text-sm font-black uppercase tracking-[0.24em] text-teal-700 dark:text-teal-300">
                  Language library
                </p>
                <h2 className="mt-3 text-4xl font-black tracking-tight text-slate-950 dark:text-white sm:text-5xl">
                  ASL, WSL, and ISL starter sets
                </h2>
                <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-400">
                  Browse starter signs, common phrases, and regional notes for each supported language.
                </p>
              </div>
              <Link href="/languages" className="rounded-full bg-teal-700 px-6 py-3 text-sm font-black text-white transition hover:bg-teal-600 dark:bg-teal-500 dark:text-slate-950 dark:hover:bg-teal-400">
                Open language library
              </Link>
            </div>

            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              {LANGUAGES.map((language) => (
                <LanguageCard key={language.key} language={language} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.24em] text-teal-700 dark:text-teal-300">
              Workflow
            </p>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-slate-950 dark:text-white">
              From camera input to accessible output
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-400">
              The app is structured to support a real translation pipeline while providing a usable prototype interface today.
            </p>
          </div>

          <div className="grid gap-4">
            {steps.map(([title, description]) => (
              <div key={title} className="rounded-3xl border border-emerald-100 bg-white/90 p-6 dark:border-emerald-900/40 dark:bg-slate-900/80">
                <h3 className="text-lg font-black text-slate-950 dark:text-white">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#09211c] py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-4xl font-black tracking-tight sm:text-5xl">
            Ready for a multilingual accessibility build
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-emerald-50/80">
            Start with the translator interface, expand the dictionary, and connect trained models when your dataset is ready.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/translate" className="rounded-full bg-amber-300 px-6 py-3 text-base font-black text-emerald-950 transition hover:bg-amber-200">
              Try translator
            </Link>
            <Link href="/learn" className="rounded-full border border-white/20 px-6 py-3 text-base font-black text-white transition hover:bg-white/10">
              Learn the pipeline
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
