import "@/lib/polyfills";
import type { Metadata } from "next";
import { Outfit, Geist } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Aura | AI Interview Copilot",
  description: "Master your next interview with Aura's AI-driven mock sessions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("scroll-smooth", outfit.variable, "font-sans", geist.variable)} suppressHydrationWarning>
      <body className="bg-background text-foreground font-outfit antialiased selection:bg-blue-500/30">
        <ThemeProvider 
          attribute="class" 
          defaultTheme="dark" 
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
