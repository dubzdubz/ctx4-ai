import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NavbarWrapper } from "@/components/nav/navbar-wrapper";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "ctx4.ai",
  description: "Your portable context layer for Claude & ChatGPT",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">
        <NavbarWrapper />
        {children}
      </body>
    </html>
  );
}
