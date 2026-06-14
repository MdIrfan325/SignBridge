import type { Metadata } from "next";
import { Sora, Space_Mono } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const sora = Sora({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  variable: "--font-geist-mono",
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SignBridge | ASL, WSL, and ISL Translator",
  description: "An original multilingual sign-language workspace for American, Welsh, and Indian Sign Language translation, dictionary browsing, and model-ready accessibility tools.",
  keywords: ["ASL", "WSL", "ISL", "sign language", "accessibility", "translation"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sora.variable} ${spaceMono.variable} h-full scroll-smooth antialiased`}>
      <body className="sb-shell flex min-h-full flex-col text-slate-950 dark:text-slate-50">
        <div className="pointer-events-none fixed inset-0 -z-10 opacity-80">
          <div className="absolute left-[8%] top-16 h-44 w-44 rounded-full bg-teal-300/30 blur-3xl dark:bg-teal-600/20" />
          <div className="absolute right-[4%] top-28 h-52 w-52 rounded-full bg-amber-300/30 blur-3xl dark:bg-amber-500/20" />
          <div className="absolute bottom-20 left-1/3 h-56 w-56 rounded-full bg-cyan-300/20 blur-3xl dark:bg-cyan-600/20" />
        </div>
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
