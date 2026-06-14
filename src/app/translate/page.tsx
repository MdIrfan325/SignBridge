import { Suspense } from "react";
import type { Metadata } from "next";
import TranslatorClient from "./translator-client";

export const metadata: Metadata = {
  title: "Translate | SignBridge",
  description: "Use the SignBridge translator workspace for ASL, WSL, and ISL camera translation, text output, speech output, and prediction history.",
};

export default function TranslatePage() {
  return (
    <Suspense fallback={<div className="bg-slate-50 py-16 dark:bg-slate-900" />}>
      <TranslatorClient />
    </Suspense>
  );
}
