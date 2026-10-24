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
  title: "Toy Shop Serving Customers in Kuttippuram | PLAYO Edappal",
  description:
    "Looking for kids' electric cars, battery jeeps, or balance bikes near Kuttippuram? Visit PLAYO in Edappal (only 10 km via NH 66, 15-min drive) or order with fast home delivery.",
  alternates: {
    canonical: `${BUSINESS_INFO.url}/toy-shop-near-kuttippuram`,
  },
  openGraph: {
    title: "Toy Shop Serving Customers in Kuttippuram | PLAYO Edappal",
    description:
      "Kids' ride-on vehicles, mini dirt bikes, scooters, and toys for families in Kuttippuram. Visit our showroom in Edappal near Nesto or get fast home delivery.",
    url: `${BUSINESS_INFO.url}/toy-shop-near-kuttippuram`,
    type: "website",
  },
};

const KUTTIPPURAM_FAQS = [
  {
    question: "Where is PLAYO located relative to Kuttippuram?",
    answer:
      "PLAYO is located approximately 10 km south of Kuttippuram in Edappal, near Nesto Hypermarket on the main highway corridor. The drive takes just 15 to 20 minutes via the NH 66 highway.",
  },
  {
    question: "Can Kuttippuram residents test ride-on vehicles before buying?",
    answer:
      "Absolutely. Many families from Kuttippuram drive down to our Edappal showroom on evenings or weekends so their children can test-drive battery-operated 4x4 jeeps, sports cars, and balance bikes before purchase.",
  },
  {
    question: "Do you deliver toys to Kuttippuram, Kumbidi, and Thirunavaya?",
    answer:
      "Yes. We offer same-day and scheduled delivery across the Kuttippuram, Kumbidi, Thavanur, and Thirunavaya regions. All ride-on cars arrive pre-assembled and safety-inspected.",
  },
  {
    question: "What are your showroom hours for visitors from Kuttippuram?",
    answer:
      "PLAYO Edappal is open every day from 9:30 AM to 10:30 PM with zero weekly holidays, making it convenient to visit after work or over the weekend.",
  },
];

export default function ToyShopKuttippuramPage() {
  const storeSchema = getLocalBusinessSchema();
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Toy Shop Serving Kuttippuram", url: "/toy-shop-near-kuttippuram" },
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
              <span className="text-[#0D1B2A] font-semibold">Toy Shop Serving Kuttippuram</span>
            </nav>
          </div>
        </div>

        {/* Hero Section */}
        <section className="bg-[#0D1B2A] text-white py-12 sm:py-16 border-b border-[#1b2d42]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-[#FF9800] text-xs font-bold uppercase tracking-wider border border-white/15">
                <Truck className="w-3.5 h-3.5" />
                <span>10 km • 15-Min Drive via NH 66</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-heading tracking-tight leading-tight">
                Kids&apos; Ride-On Vehicles &amp; Toys <br />
                <span className="text-[#FF9800]">Serving Kuttippuram &amp; Surrounding Areas</span>
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-gray-300 leading-relaxed">
                Searching for children&apos;s electric ride-on cars, 4x4 jeeps, mini dirt bikes, or light-up kick scooters near Kuttippuram? PLAYO&apos;s physical showroom is located just 10 km away in Edappal near Nesto Hypermarket. Enjoy an in-store test drive or place an order with rapid delivery.
              </p>

              {/* Physical Showroom Clarification Notice */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3 text-xs text-gray-300">
                <Info className="w-4 h-4 text-[#FF9800] shrink-0 mt-0.5" />
                <p>
                  <strong>Physical Showroom Notice:</strong> PLAYO operates its dedicated showroom in Edappal (near Nesto Hypermarket, PIN 679576). We actively serve customers from Kuttippuram, Kumbidi, and Thavanur with showroom test-drives and local delivery.
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
                  <span>Get Driving Directions from Kuttippuram</span>
                </a>
                <a
                  href={`https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=Hi%20Playo,%20I%20am%20from%20Kuttippuram%20and%20looking%20for%20toys`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803d] text-white text-xs sm:text-sm font-bold inline-flex items-center gap-2 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>WhatsApp Kuttippuram Enquiries</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-10">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0D1B2A] tracking-tight">
                Featured Toy Categories for Kuttippuram Families
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-2">
                All electric vehicles are tested for battery longevity and motor safety before delivery.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="p-6 rounded-3xl bg-white border border-gray-200/80 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#FF9800] flex items-center justify-center mb-4">
                    <Car className="w-6 h-6" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[#0D1B2A] mb-2">
                    Kids&apos; Electric 4x4 Jeeps &amp; Luxury Cars
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-4">
                    Rechargeable 12V and 24V vehicles with dual high-torque motors, parental 2.4GHz remote control override, MP3 playback, and comfortable leather-style seating.
                  </p>
                </div>
                <Link
                  href="/catalog?category=ride-ons"
                  className="text-xs font-bold text-[#FF9800] inline-flex items-center gap-1 hover:underline"
                >
                  <span>Explore Ride-Ons</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-gray-200/80 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
                    <Bike className="w-6 h-6" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[#0D1B2A] mb-2">
                    Kids&apos; Pro Mini Bikes &amp; Balance Cycles
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-4">
                    High-strength magnesium alloy frames designed for toddlers and early riders learning balance and pedal confidence without training wheels.
                  </p>
                </div>
                <Link
                  href="/catalog?category=mini-bikes"
                  className="text-xs font-bold text-red-600 inline-flex items-center gap-1 hover:underline"
                >
                  <span>Explore Mini Bikes</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-gray-200/80 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[#0D1B2A] mb-2">
                    3-Wheel LED Kick Scooters
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-4">
                    Foldable, lightweight scooters with luminous wheels that light up as kids ride, adjustable handlebars, and anti-slip wide footboards.
                  </p>
                </div>
                <Link
                  href="/catalog?category=scooters"
                  className="text-xs font-bold text-amber-600 inline-flex items-center gap-1 hover:underline"
                >
                  <span>Explore Scooters</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>
          </div>
        </section>

        {/* Driving Guide: Kuttippuram to Edappal */}
        <section className="py-10 bg-white border-y border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-8">
              <span className="text-xs font-bold uppercase tracking-wider text-[#FF9800]">
                Directions from Kuttippuram
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0D1B2A] tracking-tight mt-1">
                How to Reach PLAYO from Kuttippuram (10 km via NH 66)
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-2">
                A quick 15-minute journey makes our showroom the easiest local toy superstore for Kuttippuram families.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs sm:text-sm">
              <div className="p-5 rounded-2xl bg-[#FAFCFF] border border-gray-200/80 space-y-2">
                <p className="font-bold text-[#0D1B2A] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-orange-100 text-[#FF9800] flex items-center justify-center text-xs font-black">1</span>
                  <span>Head South from Kuttippuram</span>
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Start from Kuttippuram Bridge / Railway Station area and proceed south along the NH 66 corridor.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#FAFCFF] border border-gray-200/80 space-y-2">
                <p className="font-bold text-[#0D1B2A] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-orange-100 text-[#FF9800] flex items-center justify-center text-xs font-black">2</span>
                  <span>Approach Edappal Commercial Zone</span>
                </p>
                <p className="text-gray-600 leading-relaxed">
                  After about 9 km, enter Edappal town limits. Locate the landmark Nesto Hypermarket complex.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#FAFCFF] border border-gray-200/80 space-y-2">
                <p className="font-bold text-[#0D1B2A] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-orange-100 text-[#FF9800] flex items-center justify-center text-xs font-black">3</span>
                  <span>Arrive at PLAYO Showroom</span>
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Pull into our showroom parking directly near Nesto Hypermarket. Enjoy in-store vehicle trials and personal guidance.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <FaqSection
          title="Questions from Kuttippuram Shoppers"
          subtitle="Learn about visiting our Edappal showroom, warranty, and delivery to Kuttippuram."
          faqs={KUTTIPPURAM_FAQS}
          includeSchema={false}
        />
      </main>

      <Footer />
    </div>
  );
}
