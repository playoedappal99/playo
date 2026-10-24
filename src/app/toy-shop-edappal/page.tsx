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
  Store,
  MessageCircle
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
  title: "Best Toy Shop in Edappal, Malappuram | PLAYO Kids' Toys & Ride-Ons",
  description:
    "Looking for the best toy shop in Edappal? Visit PLAYO near Nesto Hypermarket for kids' electric ride-on cars, 4x4 jeeps, mini bikes, scooters, and diecast models. Open daily 9:30 AM - 10:30 PM.",
  alternates: {
    canonical: `${BUSINESS_INFO.url}/toy-shop-edappal`,
  },
  openGraph: {
    title: "Best Toy Shop in Edappal, Malappuram | PLAYO",
    description:
      "Explore electric ride-on cars, 4x4 jeeps, mini bikes, scooters, and toys at PLAYO, near Nesto Hypermarket, Edappal. Open daily 9:30 AM to 10:30 PM.",
    url: `${BUSINESS_INFO.url}/toy-shop-edappal`,
    type: "website",
  },
};

const EDAPPAL_FAQS = [
  {
    question: "Where is PLAYO toy shop located in Edappal?",
    answer:
      "PLAYO is situated near Nesto Hypermarket on the main commercial highway corridor in Edappal, Malappuram District, Kerala 679576. Our showroom features dedicated display space and test areas for children's battery-operated ride-ons.",
  },
  {
    question: "What makes PLAYO the top choice for toys in Edappal?",
    answer:
      "Unlike conventional small toy shops, PLAYO specializes in heavy-duty kids' battery ride-on jeeps and cars, pro mini bikes, and light-up scooters, complete with in-store test trials, pre-assembly safety checks, official motor warranty, and prompt home delivery across Kerala.",
  },
  {
    question: "What are the showroom opening hours in Edappal?",
    answer:
      "We are open Monday to Sunday, from 9:30 AM to 10:30 PM. We do not have any weekly holidays and remain open on all seven days for family convenience.",
  },
  {
    question: "Can children test-drive ride-on cars inside the Edappal showroom?",
    answer:
      "Yes! We encourage parents to bring their children to test ride-on jeeps, balance bikes, and scooters in our showroom to ensure appropriate sizing, comfort, and parental remote control pairing before purchasing.",
  },
];

export default function ToyShopEdappalPage() {
  const storeSchema = getLocalBusinessSchema();
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Toy Shop in Edappal", url: "/toy-shop-edappal" },
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
              <span className="text-[#0D1B2A] font-semibold">Toy Shop in Edappal, Malappuram</span>
            </nav>
          </div>
        </div>

        {/* Hero Section */}
        <section className="bg-[#0D1B2A] text-white py-12 sm:py-16 border-b border-[#1b2d42]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-[#FF9800] text-xs font-bold uppercase tracking-wider border border-white/15">
                <Store className="w-3.5 h-3.5" />
                <span>Edappal Flagship Showroom</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-heading tracking-tight leading-tight">
                Best Toy Shop in <span className="text-[#FF9800]">Edappal, Malappuram</span>
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-gray-300 leading-relaxed">
                Welcome to PLAYO, the premier destination for kids&apos; electric ride-on vehicles, pro mini bikes, LED kick scooters, RC drift cars, and collectible diecast models in Edappal. Located right near Nesto Hypermarket, our showroom is open 7 days a week from 9:30 AM to 10:30 PM.
              </p>

              <div className="pt-2 flex flex-wrap gap-3">
                <a
                  href={BUSINESS_INFO.googleMapsDirectionsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-[#FF9800] hover:bg-[#F57C00] text-white text-xs sm:text-sm font-bold inline-flex items-center gap-2 shadow-sm transition-all"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Get Directions (Near Nesto)</span>
                </a>
                <a
                  href={`tel:${BUSINESS_INFO.phoneClean}`}
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold inline-flex items-center gap-2 border border-white/20 transition-colors"
                >
                  <Phone className="w-4 h-4 text-[#FF9800]" />
                  <span>Call +91 96059 73308</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Store Highlights & Verified Categories in Edappal */}
        <section className="py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-10">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0D1B2A] tracking-tight">
                Toy Categories Available at our Edappal Showroom
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-2">
                We carry a comprehensive, certified selection of children&apos;s toys and adventure ride-ons ready for in-store pickup or Kerala doorstep delivery.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Ride-ons */}
              <div className="p-6 rounded-3xl bg-white border border-gray-200/80 shadow-xs flex flex-col justify-between hover:border-[#FF9800]/50 transition-all">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#FF9800] flex items-center justify-center mb-4">
                    <Car className="w-6 h-6" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[#0D1B2A] mb-2">
                    Kids&apos; Electric Ride-On Cars &amp; 4x4 Jeeps in Edappal
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-4">
                    Rechargeable 12V and 24V 4-wheel drive jeeps, licensed luxury sports cars, equipped with Bluetooth music, parental remote controls, and spring suspension for safe outdoor rides.
                  </p>
                </div>
                <Link
                  href="/catalog?category=ride-ons"
                  className="text-xs font-bold text-[#FF9800] inline-flex items-center gap-1 hover:underline"
                >
                  <span>Browse Electric Ride-Ons</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Mini Bikes */}
              <div className="p-6 rounded-3xl bg-white border border-gray-200/80 shadow-xs flex flex-col justify-between hover:border-red-400 transition-all">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
                    <Bike className="w-6 h-6" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[#0D1B2A] mb-2">
                    Kids&apos; Mini Dirt Bikes &amp; Balance Cycles in Edappal
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-4">
                    Ultra-lightweight magnesium alloy and steel mini bikes built for developing balance, coordination, and outdoor cycling confidence.
                  </p>
                </div>
                <Link
                  href="/catalog?category=mini-bikes"
                  className="text-xs font-bold text-red-600 inline-flex items-center gap-1 hover:underline"
                >
                  <span>Browse Mini Bikes</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Scooters */}
              <div className="p-6 rounded-3xl bg-white border border-gray-200/80 shadow-xs flex flex-col justify-between hover:border-amber-400 transition-all">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[#0D1B2A] mb-2">
                    Light-Up 3-Wheel LED Scooters
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-4">
                    Smooth lean-to-steer stability scooters with battery-free kinetic light-up wheels and adjustable height handlebars for toddlers to young teens.
                  </p>
                </div>
                <Link
                  href="/catalog?category=scooters"
                  className="text-xs font-bold text-amber-600 inline-flex items-center gap-1 hover:underline"
                >
                  <span>Browse Kids&apos; Scooters</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* RC Drift */}
              <div className="p-6 rounded-3xl bg-white border border-gray-200/80 shadow-xs flex flex-col justify-between hover:border-blue-400 transition-all">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                    <Car className="w-6 h-6" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[#0D1B2A] mb-2">
                    RC Drift &amp; Stunt Racing Cars
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-4">
                    4WD high-speed remote control drift cars with extra drift slicks, authentic LED lights, and long-range 2.4GHz transmitters.
                  </p>
                </div>
                <Link
                  href="/catalog?category=rc-cars"
                  className="text-xs font-bold text-blue-600 inline-flex items-center gap-1 hover:underline"
                >
                  <span>Browse RC Cars</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Diecast */}
              <div className="p-6 rounded-3xl bg-white border border-gray-200/80 shadow-xs flex flex-col justify-between hover:border-emerald-400 transition-all">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[#0D1B2A] mb-2">
                    Diecast Metal Collectibles &amp; Scale Models
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-4">
                    Precision metal diecast supercars (1:24 &amp; 1:18 scale) with working doors, opening engine hoods, and realistic sounds.
                  </p>
                </div>
                <Link
                  href="/catalog?category=diecast"
                  className="text-xs font-bold text-emerald-600 inline-flex items-center gap-1 hover:underline"
                >
                  <span>Browse Diecast Models</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Soft Toys */}
              <div className="p-6 rounded-3xl bg-white border border-gray-200/80 shadow-xs flex flex-col justify-between hover:border-purple-400 transition-all">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                    <Store className="w-6 h-6" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[#0D1B2A] mb-2">
                    Soft Toys &amp; Kids&apos; Birthday Gifts in Edappal
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-4">
                    Giant huggable teddy bears, plush companions, and creative learning toys curated for memorable children&apos;s birthday gifts.
                  </p>
                </div>
                <Link
                  href="/catalog?category=soft-toys"
                  className="text-xs font-bold text-purple-600 inline-flex items-center gap-1 hover:underline"
                >
                  <span>Browse Soft Toys</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>
          </div>
        </section>

        {/* In-Store Showroom Experience */}
        <section className="py-10 bg-white border-y border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#FF9800]">
                  Why Shop Locally in Edappal?
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0D1B2A] tracking-tight">
                  Test Before You Buy: Real Showroom Experience Near Nesto Hypermarket
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Buying a kids&apos; electric car or mini bike online often leads to uncertain dimensions, unexpected assembly challenges, or battery issues. At PLAYO Edappal, our showroom staff fully assembles and charges every vehicle, lets your child sit inside and test the controls, and pairs the 2.4GHz parental remote control before you drive away.
                </p>

                <div className="space-y-2.5 pt-2 text-xs sm:text-sm text-gray-700">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Free pre-assembly, battery load test &amp; remote pairing</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Official motor &amp; battery warranty support with local spare parts</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Open all 7 days from 9:30 AM to 10:30 PM with hassle-free parking</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Doorstep delivery available across Malappuram and Kerala</span>
                  </div>
                </div>

                <div className="pt-4 flex items-center gap-3">
                  <a
                    href={BUSINESS_INFO.googleMapsDirectionsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-5 py-2.5 rounded-xl bg-[#0D1B2A] hover:bg-black text-white text-xs font-bold inline-flex items-center gap-2 transition-all shadow-xs"
                  >
                    <Navigation className="w-3.5 h-3.5 text-[#FF9800]" />
                    <span>Get Directions to Showroom</span>
                  </a>
                  <a
                    href={`https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=Hi%20Playo%20Edappal,%20I%20want%20to%20visit%20the%20showroom`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-5 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803d] text-white text-xs font-bold inline-flex items-center gap-2 transition-all shadow-xs"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-current" />
                    <span>WhatsApp Showroom</span>
                  </a>
                </div>
              </div>

              {/* Showroom Visit Info Box */}
              <div className="bg-[#FAFCFF] rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-5">
                <h3 className="text-lg font-bold text-[#0D1B2A] border-b border-gray-200/80 pb-3">
                  PLAYO Edappal Showroom Quick Facts
                </h3>

                <div className="space-y-4 text-xs sm:text-sm">
                  <div>
                    <p className="text-xs font-bold uppercase text-gray-400">Landmark</p>
                    <p className="font-semibold text-gray-800 mt-0.5">
                      Near Nesto Hypermarket, Thrissur-Kuttippuram Highway, Edappal
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase text-gray-400">Operating Hours</p>
                    <p className="font-semibold text-gray-800 mt-0.5">
                      9:30 AM – 10:30 PM (Monday to Sunday)
                    </p>
                    <p className="text-emerald-600 text-xs font-semibold">Open all seven days</p>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase text-gray-400">Phone &amp; WhatsApp</p>
                    <p className="font-semibold text-gray-800 mt-0.5">
                      +91 96059 73308
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase text-gray-400">PIN Code</p>
                    <p className="font-semibold text-gray-800 mt-0.5">679576</p>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="p-3.5 rounded-2xl bg-orange-50 border border-orange-200/70 text-xs text-orange-950">
                    <p className="font-bold">Family Visiting Tip:</p>
                    <p className="mt-0.5 leading-relaxed">
                      Convenient parking available directly outside the store. Combine your toy shopping with a visit to Nesto Hypermarket!
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Edappal FAQ Section */}
        <FaqSection
          title="Frequently Asked Questions about PLAYO Edappal"
          subtitle="Answers about our Edappal showroom, product trials, warranties, and directions."
          faqs={EDAPPAL_FAQS}
          includeSchema={false}
        />
      </main>

      <Footer />
    </div>
  );
}
