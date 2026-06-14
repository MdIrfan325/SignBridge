import Link from "next/link";
import type { SignLanguage } from "@/lib/sign-data";

export function LanguageCard({ language }: { language: SignLanguage }) {
  return (
    <div className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900">
      <div className={`h-2 rounded-full bg-gradient-to-r ${language.gradient}`} />
      <div className="mt-6 flex items-start justify-between gap-4">
        <div>
          <p className={`text-sm font-black ${language.key === "asl" ? "text-blue-600" : language.key === "wsl" ? "text-emerald-600" : "text-orange-600"}`}>
            {language.shortName}
          </p>
          <h3 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">{language.name}</h3>
          <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">{language.nativeName}</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          {language.words.length}
        </span>
      </div>
      <p className="mt-5 text-sm leading-6 text-slate-600 dark:text-slate-400">{language.description}</p>
      <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">{language.region}</p>
      <div className="mt-6 flex gap-3">
        <Link href={`/sign/${language.key}`} className="rounded-full bg-slate-950 px-4 py-2 text-sm font-black text-white transition group-hover:bg-indigo-600 dark:bg-white dark:text-slate-950">
          View signs
        </Link>
        <Link href={`/translate?language=${language.key}`} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-black text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
          Translate
        </Link>
      </div>
    </div>
  );
}
