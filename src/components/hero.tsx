import Link from "next/link";
import { LANGUAGES } from "@/lib/sign-data";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.32),transparent_34%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.22),transparent_32%)]" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-28">
        <div>
          <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur">
            Multilingual sign-language workspace
          </div>
          <h1 className="mt-6 max-w-4xl text-5xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">
            Translate across ASL, WSL, and ISL.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            SignBridge brings camera translation, sign dictionaries, and model-ready workflows into one privacy-first interface for American, Welsh, and Indian Sign Language users.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/translate" className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-base font-black text-slate-950 transition hover:bg-slate-200">
              Open translator
            </Link>
            <Link href="/languages" className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-base font-black text-white transition hover:bg-white/10">
              Explore languages
            </Link>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/10 p-4 shadow-2xl shadow-black/30 backdrop-blur">
          <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/80 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-400">Live workspace</p>
                <h2 className="mt-1 text-2xl font-black text-white">Three languages, one flow</h2>
              </div>
              <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-black text-emerald-300">
                Local-first UI
              </span>
            </div>
            <div className="mt-6 grid gap-3">
              {LANGUAGES.map((language) => (
                <div key={language.key} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-black text-transparent bg-clip-text bg-gradient-to-r ${language.gradient}`}>
                        {language.shortName}
                      </p>
                      <p className="mt-1 text-sm text-slate-300">{language.region}</p>
                    </div>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-slate-200">
                      {language.words.length} starter signs
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
