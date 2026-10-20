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
  title: "Toy Shop Serving Customers in Valanchery | PLAYO Edappal",
  description:
    "Looking for kids' electric ride-on cars, 4x4 battery jeeps, or mini bikes near Valanchery? Visit PLAYO in Edappal (16 km, 25-min drive) or order with fast doorstep delivery.",
  alternates: {
    canonical: `${BUSINESS_INFO.url}/toy-shop-near-valanchery`,
  },
  openGraph: {
    title: "Toy Shop Serving Customers in Valanchery | PLAYO Edappal",
    description:
      "Kids' ride-on vehicles, mini dirt bikes, scooters, and toys for families in Valanchery. Visit our showroom in Edappal near Nesto or get Kerala-wide delivery.",
    url: `${BUSINESS_INFO.url}/toy-shop-near-valanchery`,
    type: "website",
  },
};

const VALANCHERY_FAQS = [
  {
    question: "Where is PLAYO located relative to Valanchery?",
    answer:
      "PLAYO's physical showroom is located in Edappal, near Nesto Hypermarket, approximately 16 km south of Valanchery (a 25 to 30-minute drive via the Valanchery - Kuttippuram - Edappal highway route).",
  },
  {
    question: "Do Valanchery families visit the Edappal showroom?",
    answer:
      "Yes. Because high-end children's ride-on jeeps and mini bikes require personal sizing and parental remote pairing, many parents from Valanchery visit our showroom in Edappal near Nesto Hypermarket to let their kids test-drive vehicles on our indoor floor before making a decision.",
  },
  {
    question: "Can I get battery cars delivered directly to Valanchery?",
    answer:
      "Yes. We provide prompt doorstep delivery to Valanchery, Moodal, Vettekkod, and surrounding locations. Every vehicle is pre-assembled, safety-tested, and delivered with official motor warranty documentation.",
  },
  {
    question: "What are PLAYO showroom hours?",
    answer:
      "We are open Monday to Sunday, from 9:30 AM to 10:30 PM. We do not observe weekly holidays and remain open all seven days of the week.",
  },
];

export default function ToyShopValancheryPage() {
  const storeSchema = getLocalBusinessSchema();
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Toy Shop Serving Valanchery", url: "/toy-shop-near-valanchery" },
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
              <span className="text-[#0D1B2A] font-semibold">Toy Shop Serving Valanchery</span>
            </nav>
          </div>
        </div>

        {/* Hero Section */}
        <section className="bg-[#0D1B2A] text-white py-12 sm:py-16 border-b border-[#1b2d42]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-[#FF9800] text-xs font-bold uppercase tracking-wider border border-white/15">
                <Truck className="w-3.5 h-3.5" />
                <span>16 km • 25-Min Drive from Valanchery</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-heading tracking-tight leading-tight">
                Kids&apos; Ride-On Vehicles &amp; Toys <br />
                <span className="text-[#FF9800]">Serving Valanchery Families</span>
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-gray-300 leading-relaxed">
                Looking for durable children&apos;s electric ride-on cars, 4x4 battery jeeps, mini dirt bikes, or light-up kick scooters in the Valanchery region? PLAYO&apos;s physical showroom is located just 16 km away in Edappal near Nesto Hypermarket. Come for an in-store test drive or order with doorstep delivery.
              </p>

              {/* Physical Showroom Notice */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3 text-xs text-gray-300">
                <Info className="w-4 h-4 text-[#FF9800] shrink-0 mt-0.5" />
                <p>
                  <strong>Physical Showroom Notice:</strong> PLAYO is based in Edappal (near Nesto Hypermarket, PIN 679576). We welcome visitors and provide delivery to Valanchery, Moodal, and surrounding areas.
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
                  <span>Get Driving Directions from Valanchery</span>
                </a>
                <a
                  href={`https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=Hi%20Playo,%20I%20am%20from%20Valanchery%20and%20looking%20for%20toys`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803d] text-white text-xs sm:text-sm font-bold inline-flex items-center gap-2 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>WhatsApp Valanchery Enquiries</span>
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
                Recommended Toys for Valanchery Shoppers
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-2">
                Every vehicle includes battery warranty, remote pairing, and complete safety inspection.
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
                    All-terrain battery 4x4 jeeps with parental 2.4GHz remote control, soft start acceleration, front and rear LED lights, and dual motors.
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
                    Kids&apos; Mini Adventure Dirt Bikes
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-4">
                    Ultra-sturdy balance dirt bikes engineered for young learners to build steering balance, core strength, and outdoor fun.
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
                    Light-Up 3-Wheel LED Scooters
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-4">
                    Foldable kick scooters with glowing wheels that flash while moving, anti-slip decks, and adjustable height handlebars.
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

        {/* Driving Guide: Valanchery to Edappal */}
        <section className="py-10 bg-white border-y border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-8">
              <span className="text-xs font-bold uppercase tracking-wider text-[#FF9800]">
                Customer Driving Directions
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0D1B2A] tracking-tight mt-1">
                Driving from Valanchery to PLAYO Edappal Showroom (16 km)
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-2">
                A scenic 25-minute highway drive connects Valanchery directly to our showroom entrance near Nesto Hypermarket.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs sm:text-sm">
              <div className="p-5 rounded-2xl bg-[#FAFCFF] border border-gray-200/80 space-y-2">
                <p className="font-bold text-[#0D1B2A] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-orange-100 text-[#FF9800] flex items-center justify-center text-xs font-black">1</span>
                  <span>Depart Valanchery Town</span>
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Start from Valanchery central junction and drive south towards Kuttippuram along the main corridor.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#FAFCFF] border border-gray-200/80 space-y-2">
                <p className="font-bold text-[#0D1B2A] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-orange-100 text-[#FF9800] flex items-center justify-center text-xs font-black">2</span>
                  <span>Pass Kuttippuram toward Edappal</span>
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Continue past Kuttippuram along NH 66 toward Edappal. Enter Edappal commercial district.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#FAFCFF] border border-gray-200/80 space-y-2">
                <p className="font-bold text-[#0D1B2A] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-orange-100 text-[#FF9800] flex items-center justify-center text-xs font-black">3</span>
                  <span>Turn near Nesto Hypermarket</span>
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Locate PLAYO showroom directly near Nesto Hypermarket. Ample parking space for your car and hassle-free shopping.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <FaqSection
          title="Questions from Valanchery Customers"
          subtitle="Answers about our Edappal showroom, product trials, warranties, and delivery to Valanchery."
          faqs={VALANCHERY_FAQS}
          includeSchema={false}
        />
      </main>

      <Footer />
    </div>
  );
}
