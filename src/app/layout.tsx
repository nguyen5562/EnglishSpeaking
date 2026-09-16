import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "IELTS Speaking AI",
  description: "Master your spoken English with instant AI feedback on pronunciation, vocabulary, and fluency.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster 
          position="bottom-center" 
          toastOptions={{
            className: "bg-white/80 backdrop-blur-md border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.03)] text-slate-800 rounded-2xl px-5 py-4 font-medium text-[15px]",
          }}
        />
      </body>
    </html>
  );
}
