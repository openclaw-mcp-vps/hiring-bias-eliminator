import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading"
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono"
});

export const metadata: Metadata = {
  metadataBase: new URL("https://hiring-bias-eliminator.example"),
  title: "Hiring Bias Eliminator | Remove bias from job descriptions and interview notes",
  description:
    "Scan job postings and interview feedback for biased language, highlight risk, and get neutral alternatives with AI.",
  keywords: [
    "bias detection",
    "HR compliance",
    "job description scanner",
    "interview feedback",
    "DEI hiring"
  ],
  openGraph: {
    title: "Hiring Bias Eliminator",
    description:
      "AI-powered bias detection for hiring teams that need consistent, legally safer language in job ads and interviewer notes.",
    type: "website",
    url: "https://hiring-bias-eliminator.example"
  },
  twitter: {
    card: "summary_large_image",
    title: "Hiring Bias Eliminator",
    description:
      "Remove biased language from hiring content before it creates legal and reputational risk."
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${spaceGrotesk.variable} ${ibmPlexMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
