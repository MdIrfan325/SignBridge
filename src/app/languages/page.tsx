import type { Metadata } from "next";
import { LanguageCard } from "@/components/language-card";
import { SectionHeading } from "@/components/section-heading";
import { LANGUAGES } from "@/lib/sign-data";

export const metadata: Metadata = {
  title: "Languages | SignBridge",
  description: "Browse the SignBridge starter library for American, Welsh, and Indian Sign Language.",
};

export default function LanguagesPage() {
  return (
    <section className="bg-white py-16 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Language library"
          title="Starter signs for ASL, WSL, and ISL"
          description="Explore the included sign entries and regional notes. This library is intentionally small and should be expanded with community-reviewed datasets."
        />

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {LANGUAGES.map((language) => (
            <LanguageCard key={language.key} language={language} />
          ))}
        </div>

        <div className="mt-12 rounded-[2rem] border border-slate-200 bg-slate-50 p-8 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-2xl font-black text-slate-950 dark:text-white">Community review is essential</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">
            Sign languages are living languages with regional variation. Before using this project in education, healthcare, or public services, validate signs and labels with qualified local signers and Deaf community advisors.
          </p>
        </div>
      </div>
    </section>
  );
}
