import type { Metadata } from "next";
import { SectionHeading } from "@/components/section-heading";

export const metadata: Metadata = {
  title: "Learn | SignBridge",
  description: "Understand the SignBridge multilingual sign-language translation pipeline and responsible AI approach.",
};

const steps = [
  {
    title: "Capture",
    description: "The browser requests camera access and streams video to a local preview. No backend server is required for the interface.",
  },
  {
    title: "Normalize",
    description: "A model pipeline can convert frames into hand landmarks, crop boxes, or feature vectors that work across ASL, WSL, and ISL.",
  },
  {
    title: "Classify",
    description: "The inference layer maps features to the selected language and mode, returning a label, confidence score, and timestamp.",
  },
  {
    title: "Communicate",
    description: "The result can be copied, spoken through the Web Speech API, or stored in temporary client-side history.",
  },
];

export default function LearnPage() {
  return (
    <section className="bg-white py-16 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Learn"
          title="How a multilingual sign translator works"
          description="SignBridge separates the user interface from the model layer so each sign language can use its own dataset, labels, and review process."
        />

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div key={step.title} className="rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-600 text-lg font-black text-white">
                {step.title[0]}
              </div>
              <h2 className="mt-5 text-xl font-black text-slate-950 dark:text-white">{step.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] border border-indigo-100 bg-indigo-50 p-8 dark:border-indigo-500/20 dark:bg-indigo-500/10">
            <h2 className="text-3xl font-black text-slate-950 dark:text-white">Responsible model development</h2>
            <p className="mt-4 text-sm leading-7 text-slate-700 dark:text-slate-300">
              Sign-language recognition should be trained with consent, reviewed by native signers, and tested across lighting, camera angles, skin tones, clothing, and regional variation.
            </p>
            <p className="mt-4 text-sm leading-7 text-slate-700 dark:text-slate-300">
              Treat every output as assistive, not authoritative. Users should be able to correct predictions and keep control over their data.
            </p>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-2xl font-black text-slate-950 dark:text-white">Suggested production stack</h2>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
              <li className="flex gap-3"><span className="font-black text-indigo-600 dark:text-cyan-300">01</span> Browser camera capture with MediaDevices API.</li>
              <li className="flex gap-3"><span className="font-black text-indigo-600 dark:text-cyan-300">02</span> Hand landmark extraction using a local model runtime.</li>
              <li className="flex gap-3"><span className="font-black text-indigo-600 dark:text-cyan-300">03</span> Separate classifiers for ASL, WSL, and ISL.</li>
              <li className="flex gap-3"><span className="font-black text-indigo-600 dark:text-cyan-300">04</span> Community-reviewed labels and region-specific notes.</li>
              <li className="flex gap-3"><span className="font-black text-indigo-600 dark:text-cyan-300">05</span> Client-side history with clear retention controls.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
