import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sivio - 10x More Interviews From 10x Fewer Applications",
  description: "Quality over quantity. While others spam 100+ applications for 2 interviews, Sivio users send 12 and get 3. Join 300+ students getting 10x more interviews through direct hiring manager access.",
  keywords: ["internship platform", "job application", "quality over quantity", "hiring manager access", "interview rate", "college students", "beta platform"],
  authors: [{ name: "Sivio" }],
  openGraph: {
    title: "Sivio - 10x More Interviews From 10x Fewer Applications",
    description: "Quality over quantity. 347 students already getting 10x more interviews. Limited beta access.",
    url: "https://sivio.vercel.app",
    siteName: "Sivio",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sivio - 10x More Interviews From 10x Fewer Applications",
    description: "Quality over quantity. Join 347 students getting real interviews.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>{children}</body>
      </html>
    </ClerkProvider>
  );
}
