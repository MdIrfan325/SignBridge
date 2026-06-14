import type { Metadata } from "next";
import { SectionHeading } from "@/components/section-heading";

export const metadata: Metadata = {
  title: "Blog | SignBridge",
  description: "Read updates about the SignBridge multilingual sign-language translation project.",
};

const posts = [
  {
    title: "Why multilingual sign translation needs separate language packs",
    date: "June 13, 2026",
    excerpt: "ASL, WSL, and ISL should not share a single label list. Each language needs its own signs, regional notes, and review process.",
  },
  {
    title: "Building a responsible camera translator",
    date: "June 10, 2026",
    excerpt: "A good translator interface gives users control, explains confidence, and makes it clear when a prototype is not a production model.",
  },
  {
    title: "From starter dictionary to trained model",
    date: "June 6, 2026",
    excerpt: "A starter sign dictionary can become a dataset foundation when it is expanded with consent, variation, and community review.",
  },
];

export default function BlogPage() {
  return (
    <section className="bg-slate-50 py-16 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Updates"
          title="Notes from the SignBridge build"
          description="Short posts about multilingual sign-language product design, model planning, and accessibility-first development."
        />

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {posts.map((post) => (
            <article key={post.title} className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <p className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-cyan-300">{post.date}</p>
              <h2 className="mt-4 text-2xl font-black leading-tight text-slate-950 dark:text-white">{post.title}</h2>
              <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-400">{post.excerpt}</p>
              <button className="mt-6 rounded-full border border-slate-200 px-4 py-2 text-sm font-black text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900">
                Read update
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
