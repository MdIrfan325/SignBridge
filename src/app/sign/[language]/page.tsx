import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { LANGUAGES, getLanguage } from "@/lib/sign-data";

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
    <section className="bg-slate-50 py-16 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
            <div>
              <p className={`text-sm font-black ${selected.key === "asl" ? "text-blue-600" : selected.key === "wsl" ? "text-emerald-600" : "text-orange-600"}`}>
                {selected.shortName}
              </p>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 dark:text-white">{selected.name}</h1>
              <p className="mt-3 text-sm font-semibold text-slate-500 dark:text-slate-400">{selected.nativeName}</p>
              <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-400">{selected.description}</p>
            </div>
            <Link href="/translate" className="rounded-full bg-indigo-600 px-6 py-3 text-sm font-black text-white transition hover:bg-indigo-700">
              Translate with {selected.shortName}
            </Link>
          </div>

          <div className="mt-8 rounded-3xl bg-slate-50 p-6 dark:bg-slate-900">
            <h2 className="text-xl font-black text-slate-950 dark:text-white">Regional note</h2>
            <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-400">{selected.note}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[0.35fr_0.65fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
            <h2 className="text-xl font-black text-slate-950 dark:text-white">Alphabet</h2>
            <div className="mt-5 grid grid-cols-4 gap-2">
              {selected.alphabet.map((letter) => (
                <div key={letter.label} className="grid h-24 place-items-center rounded-2xl bg-slate-100 font-black text-slate-800 dark:bg-slate-900 dark:text-slate-100">
                  {letter.video ? (
                    <video src={letter.video} className="h-16 w-16 object-contain" autoPlay loop muted playsInline />
                  ) : (
                    <span>{letter.label}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
            <h2 className="text-xl font-black text-slate-950 dark:text-white">Starter words</h2>
            <div className="mt-5 grid gap-4">
              {selected.words.map((sign) => (
                <article key={sign.label} className="rounded-3xl border border-slate-200 p-5 dark:border-slate-800">
                  <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                    <div>
                      <h3 className="text-2xl font-black text-slate-950 dark:text-white">{sign.label}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{sign.description}</p>
                    </div>
                    <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-black uppercase tracking-wider text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                      {sign.type}
                    </span>
                  </div>
                  <div className="mt-5 grid gap-3 md:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
                      <p className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Movement</p>
                      <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">{sign.movement}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
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
