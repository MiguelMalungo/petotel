import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://petotel.com";
const SITE_NAME = "PetOtel";
const SITE_DESCRIPTION =
  "Find and book verified pet-friendly hotels worldwide. Search by destination or vibe — every listing welcomes dogs, cats, and other pets with clear pet policies and fees.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "PetOtel — Book Pet-Friendly Hotels Worldwide | Dogs, Cats & More Welcome",
    template: "%s | PetOtel",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "pet-friendly hotels",
    "dog-friendly hotels",
    "cat-friendly hotels",
    "hotels that allow pets",
    "pet-friendly accommodation",
    "travel with pets",
    "travel with dogs",
    "travel with cats",
    "pet-friendly travel",
    "pet hotel booking",
    "book pet-friendly hotel",
    "pet-friendly resorts",
    "pet-friendly vacation",
    "hotels that accept dogs",
    "hotels that accept cats",
    "pet-friendly lodging",
    "pet-friendly stays",
    "pet-welcoming hotels",
    "animal-friendly hotels",
    "bring your dog hotel",
    "pet-friendly getaway",
    "dog-friendly accommodation",
    "pet travel booking",
    "verified pet-friendly",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  applicationName: SITE_NAME,
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "PetOtel — Book Pet-Friendly Hotels Worldwide",
    description: SITE_DESCRIPTION,
    images: [
      {
        url: `${SITE_URL}/media/og-image.png`,
        width: 1200,
        height: 630,
        alt: "PetOtel — Pet-Friendly Hotel Booking. Travel with your best friend.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PetOtel — Book Pet-Friendly Hotels Worldwide",
    description: SITE_DESCRIPTION,
    images: [`${SITE_URL}/media/og-image.png`],
    creator: "@petotel",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  category: "Travel",
  other: {
    "theme-color": "#D97706",
    "msapplication-TileColor": "#D97706",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#D97706" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <JsonLd />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
