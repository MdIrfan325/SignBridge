import type { Metadata } from "next";
import { SectionHeading } from "@/components/section-heading";

export const metadata: Metadata = {
  title: "About | SignBridge",
  description: "Learn about the SignBridge mission to build original multilingual sign-language accessibility tools.",
};

const values = [
  {
    title: "Original work",
    description: "SignBridge uses its own name, copy, layout, and data structure instead of copying another project.",
  },
  {
    title: "Community review",
    description: "Signs and labels should be validated with Deaf signers and local language experts before real-world use.",
  },
  {
    title: "User control",
    description: "The interface is designed for local interaction, clear outputs, and temporary history that users can clear.",
  },
  {
    title: "Multilingual by design",
    description: "ASL, WSL, and ISL are treated as separate languages with distinct label sets and regional notes.",
  },
];

export default function AboutPage() {
  return (
    <section className="bg-white py-16 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="About"
          title="A new multilingual accessibility project"
          description="SignBridge is built as an original web app for sign-language translation workflows across American, Welsh, and Indian Sign Language."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-3xl font-black text-slate-950 dark:text-white">Mission</h2>
            <p className="mt-4 text-base leading-8 text-slate-600 dark:text-slate-400">
              The goal is to make sign-language technology easier to explore, extend, and adapt for different communities. The current build provides the product shell, language data, translator interface, and documentation pages needed to grow into a trained multilingual system.
            </p>
            <p className="mt-4 text-base leading-8 text-slate-600 dark:text-slate-400">
              It is designed for classrooms, clinics, public services, and everyday communication, with a strong reminder that real-world sign-language AI should be built with community participation.
            </p>
          </div>

          <div className="rounded-[2rem] border border-indigo-100 bg-indigo-50 p-8 dark:border-indigo-500/20 dark:bg-indigo-500/10">
            <h2 className="text-2xl font-black text-slate-950 dark:text-white">Project principles</h2>
            <div className="mt-6 space-y-5">
              {values.map((value) => (
                <div key={value.title}>
                  <h3 className="text-lg font-black text-slate-950 dark:text-white">{value.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
