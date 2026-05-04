import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

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
    <html lang="en" className={`${outfit.variable} dark`}>
      <body className="bg-[#050505] text-white font-outfit antialiased selection:bg-blue-500/30">
        {children}
      </body>
    </html>
  );
}
