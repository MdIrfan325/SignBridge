import type { Metadata } from "next";
import { SectionHeading } from "@/components/section-heading";
import { LANGUAGES } from "@/lib/sign-data";

export const metadata: Metadata = {
  title: "Models | SignBridge",
  description: "Review the model-ready architecture for ASL, WSL, and ISL sign-language translation.",
};

const modelCards = [
  {
    title: "Hand landmark extractor",
    description: "Converts video frames into normalized hand and body features that can be reused across language-specific classifiers.",
    status: "Integration target",
  },
  {
    title: "Alphabet classifier",
    description: "Maps isolated finger-spelling frames to the selected alphabet for ASL, WSL, or ISL.",
    status: "Dataset required",
  },
  {
    title: "Word and phrase classifier",
    description: "Recognizes common signs and short phrases after training with community-reviewed video samples.",
    status: "Dataset required",
  },
  {
    title: "Language router",
    description: "Selects the correct label set, normalization rules, and confidence thresholds for the active language.",
    status: "Ready for implementation",
  },
];

export default function ModelsPage() {
  return (
    <section className="bg-slate-50 py-16 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Models"
          title="Model-ready translation architecture"
          description="The interface is prepared for trained recognition models while keeping language data, UI state, and inference results separate."
        />

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {modelCards.map((card) => (
            <article key={card.title} className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-2xl font-black text-slate-950 dark:text-white">{card.title}</h2>
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-700 dark:bg-indigo-500/10 dark:text-cyan-300">
                  {card.status}
                </span>
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-400">{card.description}</p>
            </article>
          ))}
        </div>

        <div className="mt-12 rounded-[2rem] border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-950">
          <h2 className="text-2xl font-black text-slate-950 dark:text-white">Included language packs</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {LANGUAGES.map((language) => (
              <div key={language.key} className="rounded-3xl bg-slate-50 p-5 dark:bg-slate-900">
                <p className={`text-sm font-black ${language.key === "asl" ? "text-blue-600" : language.key === "wsl" ? "text-emerald-600" : "text-orange-600"}`}>
                  {language.shortName}
                </p>
                <h3 className="mt-2 text-xl font-black text-slate-950 dark:text-white">{language.name}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{((language.alphabet as { label: string; video?: string }[]).length)} alphabet entries and {language.words.length} starter words are registered in the data layer.</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
