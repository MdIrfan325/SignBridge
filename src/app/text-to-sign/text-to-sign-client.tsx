"use client";

import { useMemo, useState } from "react";
import { LANGUAGES, languageMap, type SignLanguageKey } from "@/lib/sign-data";

const languageOptions = LANGUAGES.map((language) => language.key);

function tokenize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

export default function TextToSignClient() {
  const [selectedLanguage, setSelectedLanguage] = useState<SignLanguageKey>("asl");
  const [text, setText] = useState("");
  const language = languageMap[selectedLanguage];

  const signs = useMemo(() => {
    return tokenize(text).map((token) => {
      const match = language.words.find((sign) => sign.label.toLowerCase() === token);
      return match || {
        label: token,
        type: "word",
        description: "No starter sign found. Add this word to the language dictionary.",
        movement: "Pending community review",
        tip: "Create a reviewed sign entry before using this in production.",
      };
    });
  }, [language, text]);

  const matchedCount = signs.filter((sign) => language.words.some((entry) => entry.label.toLowerCase() === sign.label.toLowerCase())).length;

  return (
    <div className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="sb-reveal max-w-3xl">
          <p className="text-sm font-black uppercase tracking-[0.24em] text-teal-700 dark:text-teal-300">
            Text to sign
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 dark:text-white sm:text-5xl">
            Convert text into sign entries
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-400">
            Enter text and choose a language to see which words are covered by the starter dictionary.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="sb-reveal sb-hover-lift rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-sm dark:border-emerald-900/40 dark:bg-slate-900/80" style={{ animationDelay: "80ms" }}>
            <label className="block">
              <span className="text-sm font-black text-slate-700 dark:text-slate-200">Language</span>
              <select
                value={selectedLanguage}
                onChange={(event) => setSelectedLanguage(event.target.value as SignLanguageKey)}
                className="mt-2 w-full rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm font-bold text-slate-950 outline-none focus:ring-2 focus:ring-teal-500 dark:border-emerald-900/40 dark:bg-slate-950 dark:text-white"
              >
                {languageOptions.map((key) => (
                  <option key={key} value={key}>
                    {languageMap[key].shortName} — {languageMap[key].name}
                  </option>
                ))}
              </select>
            </label>

            <label className="mt-5 block">
              <span className="text-sm font-black text-slate-700 dark:text-slate-200">Text</span>
              <textarea
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder="Type a short sentence..."
                rows={8}
                className="mt-2 w-full rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-slate-950 outline-none focus:ring-2 focus:ring-teal-500 dark:border-emerald-900/40 dark:bg-slate-950 dark:text-white"
              />
            </label>

            <div className="sb-breathe mt-5 rounded-3xl border border-teal-100 bg-teal-50/80 p-5 dark:border-teal-500/20 dark:bg-teal-500/10">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-teal-700 dark:text-teal-300">
                Coverage
              </p>
              <p className="mt-2 text-3xl font-black text-slate-950 dark:text-white">
                {text.trim() ? `${Math.round((matchedCount / signs.length) * 100)}%` : "—"}
              </p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                {matchedCount} of {signs.length || 0} tokens found in the starter dictionary.
              </p>
            </div>
          </section>

          <section className="sb-reveal sb-hover-lift rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-sm dark:border-emerald-900/40 dark:bg-slate-900/80" style={{ animationDelay: "160ms" }}>
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-black text-slate-950 dark:text-white">Sign plan</h2>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
                {language.shortName}
              </span>
            </div>

            <div className="mt-5 grid gap-4">
              {signs.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-emerald-200 p-5 text-sm text-slate-500 dark:border-emerald-900/40 dark:text-slate-400">
                  Type text to generate a sign plan.
                </p>
              ) : (
                signs.map((sign, index) => {
                  const isKnown = language.words.some((entry) => entry.label.toLowerCase() === sign.label.toLowerCase());

                  return (
                    <article key={`${sign.label}-${index}`} className="sb-reveal sb-hover-lift rounded-3xl border border-emerald-100 bg-white/70 p-5 dark:border-emerald-900/40 dark:bg-slate-950/60" style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-2xl font-black text-slate-950 dark:text-white">{sign.label}</h3>
                          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{sign.description}</p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider ${isKnown ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" : "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"}`}>
                          {isKnown ? "Mapped" : "Missing"}
                        </span>
                      </div>

                      {isKnown && (
                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 dark:border-emerald-900/40 dark:bg-slate-900">
                            <p className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Movement</p>
                            <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">{sign.movement}</p>
                          </div>
                          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 dark:border-emerald-900/40 dark:bg-slate-900">
                            <p className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Tip</p>
                            <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">{sign.tip}</p>
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
