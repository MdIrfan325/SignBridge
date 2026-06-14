import { Suspense } from "react";
import type { Metadata } from "next";
import TranslatorClient from "./translator-client";

export const metadata: Metadata = {
  title: "Translate | SignBridge",
  description: "Use the SignBridge translator workspace for ASL, WSL, and ISL camera translation, text output, speech output, and prediction history.",
};

export default function TranslatePage() {
  return (
    <Suspense fallback={<div className="py-20" />}>
      <TranslatorClient />
    </Suspense>
  );
}
