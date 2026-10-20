import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import CartToast from "@/components/CartToast";
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
    default: "PLAYO Toy Shop in Edappal, Malappuram | Kids' Toys & Ride-On Vehicles",
    template: "%s | PLAYO Toy Shop Edappal",
  },
  description:
    "Discover toys for kids at PLAYO, near Nesto Hypermarket, Edappal, Malappuram. Explore available toy categories and visit us daily from 9:30 AM to 10:30 PM.",
  keywords: [
    "PLAYO Edappal",
    "Best toy shop in Edappal",
    "Toy shop near me",
    "Best toy store in Malappuram",
    "Toys shop in Edappal Kerala",
    "Kids toy shop near Nesto Hypermarket",
    "Children toy store near me",
    "Kids electric car shop in Edappal",
    "Kids ride-on car shop near me",
    "Toy jeep for kids in Malappuram",
    "Kids scooter shop near me",
    "Mini bike for kids in Edappal",
    "Remote control cars shop in Malappuram",
    "Diecast toy cars near me",
    "Soft toys shop in Edappal",
    "Birthday gifts for kids in Edappal",
    "Toys for children near me",
    "Buy toys in Edappal",
    "Best place to buy kids toys near Edappal",
    "Toy shop in Ponnani",
    "Toy shop in Kuttippuram",
    "Toy shop in Valanchery",
  ],
  authors: [{ name: "PLAYO Edappal" }],
  creator: "PLAYO Edappal",
  publisher: "PLAYO Edappal",
  formatDetection: {
    telephone: true,
    address: true,
    email: true,
  },
  alternates: {
    canonical: BUSINESS_INFO.url,
  },
  openGraph: {
    title: "PLAYO Toy Shop in Edappal, Malappuram | Kids' Toys & Ride-On Vehicles",
    description:
      "Discover toys for kids at PLAYO, near Nesto Hypermarket, Edappal, Malappuram. Explore available toy categories and visit us daily from 9:30 AM to 10:30 PM.",
    url: BUSINESS_INFO.url,
    siteName: "PLAYO Edappal",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/images/carousel/kids-jeep.png",
        width: 1200,
        height: 630,
        alt: "PLAYO Toy Shop Edappal - Kids Electric Ride-Ons & Toys",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PLAYO Toy Shop in Edappal, Malappuram | Kids' Toys & Ride-On Vehicles",
    description:
      "Discover toys for kids at PLAYO, near Nesto Hypermarket, Edappal, Malappuram. Visit us daily from 9:30 AM to 10:30 PM.",
    images: ["/images/carousel/kids-jeep.png"],
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
        {children}
        <CartToast />
      </body>
    </html>
  );
}

