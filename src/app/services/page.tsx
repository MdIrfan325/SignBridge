import type { Metadata } from "next";
import { SectionHeading } from "@/components/section-heading";

export const metadata: Metadata = {
  title: "Services | SignBridge",
  description: "Explore service areas for adapting SignBridge to education, healthcare, public services, and workplaces.",
};

const services = [
  {
    title: "Education",
    description: "Support classrooms, campus services, and learning tools with multilingual sign-language interfaces.",
  },
  {
    title: "Healthcare",
    description: "Create calmer intake, appointment, and emergency communication workflows with accessible sign tools.",
  },
  {
    title: "Public services",
    description: "Help government desks, libraries, and community centers offer clearer communication options.",
  },
  {
    title: "Workplaces",
    description: "Build inclusive meeting, onboarding, and support experiences for Deaf and hard-of-hearing teams.",
  },
];

export default function ServicesPage() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Services"
          title="Adapt SignBridge for real accessibility workflows"
          description="The app can be extended for institutions that need multilingual sign-language support without forcing every team to start from scratch."
        />

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {services.map((service) => (
            <article key={service.title} className="rounded-[2rem] border border-emerald-100 bg-white/90 p-8 shadow-sm dark:border-emerald-900/40 dark:bg-slate-900/80">
              <h2 className="text-2xl font-black text-slate-950 dark:text-white">{service.title}</h2>
              <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-400">{service.description}</p>
            </article>
          ))}
        </div>

        <div className="mt-12 rounded-[2rem] border border-teal-100 bg-teal-50/80 p-8 dark:border-teal-500/20 dark:bg-teal-500/10">
          <h2 className="text-3xl font-black text-slate-950 dark:text-white">Implementation path</h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-3">
            <li className="rounded-3xl bg-white p-5 dark:bg-slate-950">
              <p className="text-sm font-black uppercase tracking-wider text-teal-700 dark:text-teal-300">Phase 1</p>
              <h3 className="mt-3 text-lg font-black text-slate-950 dark:text-white">Prototype</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">Use the current UI, language data, and demo detection loop.</p>
            </li>
            <li className="rounded-3xl bg-white p-5 dark:bg-slate-950">
              <p className="text-sm font-black uppercase tracking-wider text-teal-700 dark:text-teal-300">Phase 2</p>
              <h3 className="mt-3 text-lg font-black text-slate-950 dark:text-white">Train</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">Collect reviewed datasets for each language and use case.</p>
            </li>
            <li className="rounded-3xl bg-white p-5 dark:bg-slate-950">
              <p className="text-sm font-black uppercase tracking-wider text-teal-700 dark:text-teal-300">Phase 3</p>
              <h3 className="mt-3 text-lg font-black text-slate-950 dark:text-white">Deploy</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">Connect models, test with users, and ship a privacy-first interface.</p>
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}
