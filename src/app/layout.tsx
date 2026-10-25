import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import CartToast from "@/components/CartToast";
import SecurityShield from "@/components/SecurityShield";
import {
  BUSINESS_INFO,
  getLocalBusinessSchema,
  getWebsiteSchema,
} from "@/lib/business-info";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(BUSINESS_INFO.url),
  title: {
    default: "PLAYO Edappal - Best Toy Shop & Ride-On Showroom in Malappuram, Kerala",
    template: "%s | PLAYO Toy Shop Edappal",
  },
  description:
    "PLAYO is the premier kids' toy showroom near Nesto Hypermarket, Edappal, Malappuram, Kerala. Best prices for electric ride-on cars, 4x4 battery jeeps, RC drift cars, diecast models, bikes & baby toys with prompt delivery across Kerala.",
  keywords: [
    "PLAYO Edappal",
    "PLAYO toys",
    "Best toy shop in Edappal",
    "Toy shop near me",
    "Best toy store in Malappuram",
    "Toys shop in Edappal Kerala",
    "Kids toy shop near Nesto Hypermarket",
    "Children toy store in Kerala",
    "Kids electric car shop in Edappal",
    "Kids ride-on car shop near me",
    "Toy jeep for kids in Malappuram",
    "4x4 battery jeep for kids Kerala",
    "Kids scooter shop near me",
    "Mini bike for kids in Edappal",
    "Remote control cars shop in Malappuram",
    "RC drift cars Kerala",
    "Diecast toy cars near me",
    "Diecast metal supercars Kerala",
    "Soft toys shop in Edappal",
    "Birthday gifts for kids in Edappal",
    "Toys for children near me",
    "Buy toys in Edappal",
    "Best place to buy kids toys near Edappal",
    "Toy shop in Ponnani",
    "Toy shop in Kuttippuram",
    "Toy shop in Valanchery",
    "Toy shop in Changaramkulam",
    "Toy showroom in Malappuram district",
  ],
  authors: [{ name: "PLAYO Edappal" }],
  creator: "PLAYO Edappal",
  publisher: "PLAYO Edappal",
  icons: {
    icon: [
      { url: "/images/playo-logo.png", sizes: "any" },
      { url: "/images/playo-logo.png", type: "image/png", sizes: "192x192" },
    ],
    apple: [
      { url: "/images/playo-logo.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/images/playo-logo.png",
  },
  formatDetection: {
    telephone: true,
    address: true,
    email: true,
  },
  alternates: {
    canonical: BUSINESS_INFO.url,
  },
  openGraph: {
    title: "PLAYO Edappal - Best Toy Shop & Ride-On Showroom in Malappuram, Kerala",
    description:
      "Premier toy showroom near Nesto Hypermarket, Edappal. Best kids' electric ride-on cars, 4x4 jeeps, RC drift cars & toys in Malappuram, Kerala.",
    url: BUSINESS_INFO.url,
    siteName: "PLAYO Edappal",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/images/playo-logo.png",
        width: 1200,
        height: 630,
        alt: "PLAYO Toy Shop Edappal - Best Toys & Ride-On Vehicles in Malappuram, Kerala",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PLAYO Edappal - Best Toy Shop & Ride-On Showroom in Malappuram, Kerala",
    description:
      "Premier toy showroom near Nesto Hypermarket, Edappal. Best kids' electric ride-on cars, 4x4 jeeps, RC drift cars & toys in Malappuram, Kerala.",
    images: ["/images/playo-logo.png"],
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
  other: {
    "geo.region": "IN-KL",
    "geo.placename": "Edappal",
    "geo.position": `${BUSINESS_INFO.geo.latitude};${BUSINESS_INFO.geo.longitude}`,
    ICBM: `${BUSINESS_INFO.geo.latitude}, ${BUSINESS_INFO.geo.longitude}`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const storeSchema = getLocalBusinessSchema();
  const websiteSchema = getWebsiteSchema();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/images/playo-logo.png" />
        <link rel="apple-touch-icon" href="/images/playo-logo.png" />
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(storeSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SecurityShield />
        {children}
        <CartToast />
      </body>
    </html>
  );
}
