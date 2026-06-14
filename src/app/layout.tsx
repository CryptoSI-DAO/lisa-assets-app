import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Layout from "@/components/Layout";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Lisa's Assets — 8 AI Agents. One Coefficient. Zero Bias.",
  description:
    "AI-powered crypto project analysis. 8 specialized agents analyze fundamentals, economics, liquidity, community, code, and risk to produce the Lisa Coefficient.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-background text-foreground font-sans antialiased">
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
