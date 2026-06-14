"use client";

import { useMemo, useState } from "react";

type AlphabetItem = {
  label: string;
  video?: string;
};

type AlphabetViewerProps = {
  alphabet: AlphabetItem[];
  shortName: string;
};

export default function AlphabetViewer({ alphabet, shortName }: AlphabetViewerProps) {
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);

  const selectedEntry = useMemo(() => {
    if (!selectedLetter) {
      return undefined;
    }

    return alphabet.find((entry) => entry.label === selectedLetter);
  }, [alphabet, selectedLetter]);

  return (
    <div>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
        {alphabet.map((letter) => {
          const isSelected = selectedLetter === letter.label;

          return (
            <button
              key={letter.label}
              type="button"
              onClick={() => setSelectedLetter(letter.label)}
              className={`grid h-16 place-items-center rounded-2xl border text-lg font-black transition ${
                isSelected
                  ? "border-teal-600 bg-teal-700 text-white"
                  : "border-emerald-200 bg-emerald-50 text-slate-800 hover:border-teal-300 hover:bg-teal-50 dark:border-emerald-900/40 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-teal-500/70 dark:hover:bg-slate-800"
              }`}
              aria-pressed={isSelected}
              aria-label={`Show sign video for ${letter.label}`}
            >
              {letter.label}
            </button>
          );
        })}
      </div>

      <div className="mt-6 rounded-3xl border border-emerald-100 bg-emerald-50/70 p-4 dark:border-emerald-900/40 dark:bg-slate-900">
        {selectedEntry?.video ? (
          <div className="mx-auto max-w-md">
            <p className="text-center text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {shortName} alphabet: {selectedEntry.label}
            </p>
            <div className="mt-3 grid place-items-center">
              <video
                key={selectedEntry.video}
                src={selectedEntry.video}
                className="h-[260px] w-full max-w-[340px] rounded-2xl object-contain"
                autoPlay
                loop
                muted
                playsInline
                controls
              />
            </div>
          </div>
        ) : selectedEntry ? (
          <p className="py-12 text-center text-sm font-semibold text-slate-500 dark:text-slate-400">
            No video is available for {selectedEntry.label} in {shortName} yet.
          </p>
        ) : (
          <p className="py-12 text-center text-sm font-semibold text-slate-500 dark:text-slate-400">
            Choose an alphabet letter to view its sign video in the center.
          </p>
        )}
      </div>
    </div>
  );
}
