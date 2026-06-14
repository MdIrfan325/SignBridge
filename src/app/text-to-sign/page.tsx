import type { Metadata } from "next";
import TextToSignClient from "./text-to-sign-client";

export const metadata: Metadata = {
  title: "Text to Sign | SignBridge",
  description: "Convert text into ASL, WSL, or ISL sign plans with the SignBridge text-to-sign interface.",
};

export default function TextToSignPage() {
  return <TextToSignClient />;
}
