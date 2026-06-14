"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/translate", label: "Translate" },
  { href: "/languages", label: "Languages" },
  { href: "/text-to-sign", label: "Text to Sign" },
  { href: "/learn", label: "Learn" },
  { href: "/models", label: "Models" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-emerald-100/80 bg-white/85 backdrop-blur-xl dark:border-emerald-900/40 dark:bg-slate-950/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-teal-600 to-cyan-500 font-black text-white shadow-lg shadow-teal-500/20">
            S
          </span>
          <span>
            <span className="block text-lg font-black tracking-tight text-slate-950 dark:text-white">
              SignBridge
            </span>
            <span className="block text-xs font-medium text-slate-500 dark:text-slate-400">
              ASL · WSL · ISL
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50/60 p-1 md:flex dark:border-emerald-900/50 dark:bg-emerald-950/30" aria-label="Primary navigation">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                pathname === link.href
                  ? "bg-teal-700 text-white dark:bg-teal-500 dark:text-slate-950"
                  : "text-slate-700 hover:bg-white hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/translate"
          className="rounded-full bg-teal-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-teal-600 dark:bg-teal-500 dark:text-slate-950 dark:hover:bg-teal-400"
        >
          Start translating
        </Link>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-3 md:hidden sm:px-6 lg:px-8">
        <nav className="flex gap-2 overflow-x-auto pb-1" aria-label="Mobile navigation">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                pathname === link.href
                  ? "border-teal-600 bg-teal-600 text-white"
                  : "border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
