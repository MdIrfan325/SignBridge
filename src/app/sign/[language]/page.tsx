import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { LANGUAGES, getLanguage } from "@/lib/sign-data";
import AlphabetViewer from "@/components/alphabet-viewer";

export function generateStaticParams() {
  return LANGUAGES.map((language) => ({ language: language.key }));
}

type PageProps = {
  params: Promise<{ language: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { language } = await params;
  const selected = getLanguage(language);

  return {
    title: `${selected?.shortName || "Language"} Signs | SignBridge`,
    description: `Browse starter ${selected?.shortName || "sign language"} signs in SignBridge.`,
  };
}

export default async function SignLanguagePage({ params }: PageProps) {
  const { language } = await params;
  const selected = getLanguage(language);

  if (!selected) {
    notFound();
  }

  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-emerald-100 bg-white/90 p-8 shadow-sm dark:border-emerald-900/40 dark:bg-slate-900/80">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
            <div>
              <p className={`text-sm font-black ${selected.key === "asl" ? "text-blue-600" : selected.key === "wsl" ? "text-emerald-600" : "text-orange-600"}`}>
                {selected.shortName}
              </p>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 dark:text-white">{selected.name}</h1>
              <p className="mt-3 text-sm font-semibold text-slate-500 dark:text-slate-400">{selected.nativeName}</p>
              <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-400">{selected.description}</p>
            </div>
            <Link href="/translate" className="rounded-full bg-teal-700 px-6 py-3 text-sm font-black text-white transition hover:bg-teal-600 dark:bg-teal-500 dark:text-slate-950 dark:hover:bg-teal-400">
              Translate with {selected.shortName}
            </Link>
          </div>

          <div className="mt-8 rounded-3xl border border-emerald-100 bg-emerald-50/70 p-6 dark:border-emerald-900/40 dark:bg-slate-950/70">
            <h2 className="text-xl font-black text-slate-950 dark:text-white">Regional note</h2>
            <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-400">{selected.note}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[0.35fr_0.65fr]">
          <div className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-sm dark:border-emerald-900/40 dark:bg-slate-900/80">
            <h2 className="text-xl font-black text-slate-950 dark:text-white">Alphabet</h2>
            <div className="mt-5">
              <AlphabetViewer alphabet={selected.alphabet} shortName={selected.shortName} />
            </div>
          </div>

          <div className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-sm dark:border-emerald-900/40 dark:bg-slate-900/80">
            <h2 className="text-xl font-black text-slate-950 dark:text-white">Starter words</h2>
            <div className="mt-5 grid gap-4">
              {selected.words.map((sign) => (
                <article key={sign.label} className="rounded-3xl border border-emerald-100 bg-white/70 p-5 dark:border-emerald-900/40 dark:bg-slate-950/60">
                  <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                    <div>
                      <h3 className="text-2xl font-black text-slate-950 dark:text-white">{sign.label}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{sign.description}</p>
                    </div>
                    <span className="w-fit rounded-full bg-emerald-100 px-3 py-1 text-xs font-black uppercase tracking-wider text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
                      {sign.type}
                    </span>
                  </div>
                  <div className="mt-5 grid gap-3 md:grid-cols-2">
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 dark:border-emerald-900/40 dark:bg-slate-900">
                      <p className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Movement</p>
                      <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">{sign.movement}</p>
                    </div>
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 dark:border-emerald-900/40 dark:bg-slate-900">
                      <p className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Tip</p>
                      <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">{sign.tip}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
