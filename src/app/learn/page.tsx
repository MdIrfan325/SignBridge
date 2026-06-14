import type { Metadata } from "next";
import { LearnContent } from "./learn-client";

export const metadata: Metadata = {
  title: "Learn | SignBridge",
  description: "Master sign language with structured lessons, videos, and detailed explanations.",
};

export default function LearnPage() {
  return <LearnContent />;
}
