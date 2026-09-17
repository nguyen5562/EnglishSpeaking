import type { Metadata } from "next";
import { Outfit, Geist } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const outfit = Outfit({ 
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "English Learning AI",
  description: "Master your spoken English with instant AI feedback on pronunciation, vocabulary, and fluency.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`h-full antialiased ${outfit.variable} ${geist.variable}`}>
      <body className="min-h-full flex flex-col font-body bg-background text-foreground">
        {children}
        <Toaster 
          position="bottom-center" 
          toastOptions={{
            className: "bg-surface border border-border shadow-clay-3 text-text-primary rounded-modal px-6 py-4 font-medium text-[15px]",
          }}
        />
      </body>
    </html>
  );
}
