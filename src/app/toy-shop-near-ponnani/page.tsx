import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { 
  MapPin, 
  Phone, 
  Clock, 
  Navigation, 
  Car, 
  Bike, 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  ChevronRight, 
  CheckCircle2, 
  ArrowRight,
  MessageCircle,
  Info
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FaqSection from "@/components/FaqSection";
import { 
  BUSINESS_INFO, 
  getLocalBusinessSchema, 
  getBreadcrumbSchema 
} from "@/lib/business-info";

export const metadata: Metadata = {
  title: "Toy Shop Serving Customers in Ponnani | PLAYO Edappal",
  description:
    "Looking for kids' electric cars, 4x4 ride-on jeeps, or mini bikes near Ponnani? Visit PLAYO showroom in Edappal (12 km away, 20-min drive) or get same-day doorstep delivery.",
  alternates: {
    canonical: `${BUSINESS_INFO.url}/toy-shop-near-ponnani`,
  },
  openGraph: {
    title: "Toy Shop Serving Customers in Ponnani | PLAYO Edappal",
    description:
      "Kids' ride-on vehicles, mini bikes, scooters, and toys for families in Ponnani. Visit our Edappal showroom or enjoy same-day delivery.",
    url: `${BUSINESS_INFO.url}/toy-shop-near-ponnani`,
    type: "website",
  },
};

const PONNANI_FAQS = [
  {
    question: "Does PLAYO have a physical store inside Ponnani town?",
    answer:
      "No. PLAYO's primary physical showroom is located in Edappal, near Nesto Hypermarket (approx. 12 km from Ponnani, a smooth 20 to 25-minute drive via the Ponnani-Edappal Road). We serve hundreds of families from Ponnani with in-store test-drives and fast local delivery.",
  },
  {
    question: "How can parents in Ponnani purchase kids' ride-on cars from PLAYO?",
    answer:
      "You have two convenient options: 1) Visit our showroom in Edappal near Nesto Hypermarket so your child can test-drive ride-on jeeps and cars, or 2) Browse our live catalog online, WhatsApp our team at +91 96059 73308 for a video demonstration, and order with same-day doorstep delivery to Ponnani.",
  },
  {
    question: "How long does delivery take to Ponnani addresses?",
    answer:
      "Because our showroom is only 12 km away in Edappal, orders placed with PLAYO are typically delivered to Ponnani, Chandappadi, and Chamravattom areas on the same day or within 24 hours.",
  },
  {
    question: "What route is best when driving from Ponnani to PLAYO Edappal?",
    answer:
      "From Ponnani town or Chandappadi, take the Ponnani - Edappal Road eastward toward Edappal. As you enter Edappal commercial area, proceed towards Nesto Hypermarket. PLAYO is conveniently situated nearby with hassle-free parking.",
  },
];

export default function ToyShopPonnaniPage() {
  const storeSchema = getLocalBusinessSchema();
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Toy Shop Serving Ponnani", url: "/toy-shop-near-ponnani" },
  ]);

  return (
    <div className="min-h-screen bg-[#fafbfc] text-gray-900 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(storeSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <Navbar activePage="home" />

      <main className="flex-1">
        {/* Breadcrumb Navigation */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
            <nav className="flex items-center gap-2 text-xs text-gray-500 font-medium" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-[#FF9800] transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-[#0D1B2A] font-semibold">Toy Shop Serving Ponnani</span>
            </nav>
          </div>
        </div>

        {/* Hero Section */}
        <section className="bg-[#0D1B2A] text-white py-12 sm:py-16 border-b border-[#1b2d42]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-[#FF9800] text-xs font-bold uppercase tracking-wider border border-white/15">
                <Truck className="w-3.5 h-3.5" />
                <span>12 km • 20-Min Drive from Ponnani</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-heading tracking-tight leading-tight">
                Premium Kids&apos; Toys &amp; Ride-Ons <br />
                <span className="text-[#FF9800]">Serving Families in Ponnani</span>
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-gray-300 leading-relaxed">
                Looking for children&apos;s electric ride-on cars, 4x4 battery jeeps, mini dirt bikes, or glowing LED scooters in the Ponnani area? PLAYO&apos;s flagship showroom is located just 12 km away in Edappal near Nesto Hypermarket. Visit us with your kids or order directly with prompt delivery to Ponnani.
              </p>

              {/* Transparent Physical Location Notice */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3 text-xs text-gray-300">
                <Info className="w-4 h-4 text-[#FF9800] shrink-0 mt-0.5" />
                <p>
                  <strong>Physical Store Location:</strong> Our main showroom is situated in Edappal (Near Nesto Hypermarket, PIN 679576). We serve Ponnani families daily with direct in-store trials and fast home delivery.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap gap-3">
                <a
                  href={BUSINESS_INFO.googleMapsDirectionsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-[#FF9800] hover:bg-[#F57C00] text-white text-xs sm:text-sm font-bold inline-flex items-center gap-2 shadow-sm transition-all"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Get Driving Directions from Ponnani</span>
                </a>
                <a
                  href={`https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=Hi%20Playo,%20I%20am%20from%20Ponnani%20and%20looking%20for%20toys`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803d] text-white text-xs sm:text-sm font-bold inline-flex items-center gap-2 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>WhatsApp Ponnani Enquiries</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Popular with Ponnani Customers */}
        <section className="py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-10">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0D1B2A] tracking-tight">
                Top Toy Collections for Ponnani Shoppers
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-2">
                All models are pre-assembled, battery-tested, and covered by motor warranty before dispatch or pickup.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="p-6 rounded-3xl bg-white border border-gray-200/80 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#FF9800] flex items-center justify-center mb-4">
                    <Car className="w-6 h-6" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[#0D1B2A] mb-2">
                    Kids&apos; Electric 4x4 Jeeps &amp; Ride-On Cars
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-4">
                    Heavy-duty rechargeable 12V dual motor and 24V 4WD vehicles. Complete with parental 2.4GHz remote controls, smooth start, and working LED lights.
                  </p>
                </div>
                <Link
                  href="/catalog?category=ride-ons"
                  className="text-xs font-bold text-[#FF9800] inline-flex items-center gap-1 hover:underline"
                >
                  <span>View Ride-Ons</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-gray-200/80 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
                    <Bike className="w-6 h-6" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[#0D1B2A] mb-2">
                    Kids&apos; Mini Dirt Bikes &amp; Balance Cycles
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-4">
                    Lightweight, durable mini adventure bikes designed for early balance training and outdoor active play along coastal and inland terrains.
                  </p>
                </div>
                <Link
                  href="/catalog?category=mini-bikes"
                  className="text-xs font-bold text-red-600 inline-flex items-center gap-1 hover:underline"
                >
                  <span>View Mini Bikes</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-gray-200/80 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[#0D1B2A] mb-2">
                    Light-Up LED 3-Wheel Scooters
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-4">
                    Foldable kick scooters featuring kinetic glowing wheels that need no charging, rear step brakes, and adjustable handlebars.
                  </p>
                </div>
                <Link
                  href="/catalog?category=scooters"
                  className="text-xs font-bold text-amber-600 inline-flex items-center gap-1 hover:underline"
                >
                  <span>View Scooters</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>
          </div>
        </section>

        {/* Travel Guide: Ponnani to Edappal */}
        <section className="py-10 bg-white border-y border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-8">
              <span className="text-xs font-bold uppercase tracking-wider text-[#FF9800]">
                Customer Driving Guide
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0D1B2A] tracking-tight mt-1">
                Driving from Ponnani to PLAYO Edappal Showroom
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-2">
                A straightforward 20-minute drive makes visiting PLAYO an enjoyable outing for Ponnani families.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs sm:text-sm">
              <div className="p-5 rounded-2xl bg-[#FAFCFF] border border-gray-200/80 space-y-2">
                <p className="font-bold text-[#0D1B2A] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-orange-100 text-[#FF9800] flex items-center justify-center text-xs font-black">1</span>
                  <span>Start from Ponnani</span>
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Depart from Ponnani town, Chandappadi, or Chamravattom junction and take the Ponnani - Edappal Road.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#FAFCFF] border border-gray-200/80 space-y-2">
                <p className="font-bold text-[#0D1B2A] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-orange-100 text-[#FF9800] flex items-center justify-center text-xs font-black">2</span>
                  <span>Arrive in Edappal</span>
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Follow the road into Edappal town (approx. 12 km). Head toward the Nesto Hypermarket commercial complex.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#FAFCFF] border border-gray-200/80 space-y-2">
                <p className="font-bold text-[#0D1B2A] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-orange-100 text-[#FF9800] flex items-center justify-center text-xs font-black">3</span>
                  <span>Visit PLAYO Showroom</span>
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Park comfortably in front of PLAYO showroom. Let your child test-drive ride-ons with our team.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Ponnani FAQs */}
        <FaqSection
          title="Questions from Ponnani Customers"
          subtitle="Information about visiting from Ponnani, same-day delivery, and showroom support."
          faqs={PONNANI_FAQS}
          includeSchema={false}
        />
      </main>

      <Footer />
    </div>
  );
}
