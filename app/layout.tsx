import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Prompt, Sarabun } from "next/font/google";
import "./globals.css";

const prompt = Prompt({
  variable: "--font-prompt",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600"],
});

const sarabun = Sarabun({
  variable: "--font-sarabun",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

export const metadata: Metadata = {
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,
  title: "Anis & Usman — ส่งคำอวยพร",
  description: "ร่วมส่งคำอวยพรให้บ่าวสาว Anis & Usman · 17.10.2026",
  openGraph: {
    title: "Anis & Usman 💍",
    description: "ร่วมส่งคำอวยพรให้บ่าวสาว · 17.10.2026",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#FFF8F9",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="th"
      className={`${prompt.variable} ${sarabun.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="page-glow relative min-h-full flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
