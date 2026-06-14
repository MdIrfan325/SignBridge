import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-emerald-100 bg-white/80 backdrop-blur dark:border-emerald-900/40 dark:bg-slate-950/80">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_0.8fr_0.8fr] lg:px-8">
        <div>
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-teal-600 to-cyan-500 font-black text-white shadow-lg shadow-teal-500/20">
              S
            </span>
            <span className="text-xl font-black tracking-tight text-slate-950 dark:text-white">
              SignBridge
            </span>
          </Link>
          <p className="mt-4 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-400">
            An original multilingual sign-language interface for ASL, WSL, and ISL translation workflows, dictionary browsing, and model-ready accessibility tools.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-950 dark:text-white">
            Product
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-400">
            <li><Link href="/translate" className="hover:text-teal-700 dark:hover:text-teal-300">Live translator</Link></li>
            <li><Link href="/languages" className="hover:text-teal-700 dark:hover:text-teal-300">Language library</Link></li>
            <li><Link href="/text-to-sign" className="hover:text-teal-700 dark:hover:text-teal-300">Text to sign</Link></li>
            <li><Link href="/models" className="hover:text-teal-700 dark:hover:text-teal-300">Model plan</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-950 dark:text-white">
            Resources
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-400">
            <li><Link href="/learn" className="hover:text-teal-700 dark:hover:text-teal-300">How it works</Link></li>
            <li><Link href="/gallery" className="hover:text-teal-700 dark:hover:text-teal-300">Gallery</Link></li>
            <li><Link href="/services" className="hover:text-teal-700 dark:hover:text-teal-300">Services</Link></li>
            <li><Link href="/blog" className="hover:text-teal-700 dark:hover:text-teal-300">Updates</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-emerald-100 px-4 py-6 text-sm text-slate-500 dark:border-emerald-900/40 dark:text-slate-400 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 md:flex-row">
          <p>© 2026 SignBridge. Built as an original accessibility project.</p>
          <div className="flex gap-4">
            <Link href="/about" className="hover:text-teal-700 dark:hover:text-teal-300">About</Link>
            <Link href="/learn" className="hover:text-teal-700 dark:hover:text-teal-300">Privacy-first approach</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
