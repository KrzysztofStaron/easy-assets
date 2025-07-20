import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI-Powered Collage Creator | Professional Image Enhancement",
  description:
    "Transform basic collages into professional marketing materials with AI. Upload images, create collages, and enhance them with cutting-edge AI technology for stunning results.",
  keywords: [
    "AI image enhancement",
    "collage creator",
    "professional marketing materials",
    "image editing",
    "AI-powered design",
    "digital assets",
    "image transformation",
    "marketing visuals",
    "social media graphics",
    "professional photography",
  ],
  authors: [{ name: "AI-Powered Collage Creator" }],
  creator: "AI-Powered Collage Creator",
  publisher: "AI-Powered Collage Creator",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://easy-assets.vercel.app/"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "AI-Powered Collage Creator | Professional Image Enhancement",
    description:
      "Transform basic collages into professional marketing materials with AI. Create stunning visuals in seconds.",
    url: "https://easy-assets.vercel.app/",
    siteName: "AI-Powered Collage Creator",
    images: [
      {
        url: "/transform.jpg",
        width: 1200,
        height: 630,
        alt: "AI Transformation: From Basic Collage to Professional Marketing Material",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI-Powered Collage Creator | Professional Image Enhancement",
    description:
      "Transform basic collages into professional marketing materials with AI. Create stunning visuals in seconds.",
    images: ["/transform.jpg"],
    creator: "@ai_collage_creator",
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
    </html>
  );
}
