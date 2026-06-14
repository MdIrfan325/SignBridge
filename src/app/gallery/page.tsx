import type { Metadata } from "next";
import { SectionHeading } from "@/components/section-heading";
import { LANGUAGES } from "@/lib/sign-data";

export const metadata: Metadata = {
  title: "Gallery | SignBridge",
  description: "View the SignBridge language gallery for ASL, WSL, and ISL.",
};

export default function GalleryPage() {
  return (
    <section className="bg-slate-50 py-16 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Gallery"
          title="Language cards and interface areas"
          description="A visual overview of the SignBridge product areas that can be expanded with diagrams, datasets, and community-reviewed media."
        />

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {LANGUAGES.map((language) => (
            <div key={language.key} className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <div className={`h-40 bg-gradient-to-br ${language.gradient}`} />
              <div className="p-6">
                <p className={`text-sm font-black ${language.key === "asl" ? "text-blue-600" : language.key === "wsl" ? "text-emerald-600" : "text-orange-600"}`}>
                  {language.shortName}
                </p>
                <h2 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">{language.name}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{language.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {["Translator", "Dictionary", "Models", "Learning"].map((item) => (
            <div key={item} className="rounded-[2rem] border border-slate-200 bg-white p-6 text-center dark:border-slate-800 dark:bg-slate-950">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-slate-100 text-2xl font-black text-indigo-600 dark:bg-slate-900 dark:text-cyan-300">
                {item[0]}
              </div>
              <h2 className="mt-4 text-xl font-black text-slate-950 dark:text-white">{item}</h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Product area</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
