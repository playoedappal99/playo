import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Navigation, 
  MessageCircle, 
  ChevronRight, 
  CheckCircle2 
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FaqSection from "@/components/FaqSection";
import { 
  BUSINESS_INFO, 
  getLocalBusinessSchema, 
  getBreadcrumbSchema,
  STORE_FAQS
} from "@/lib/business-info";

export const metadata: Metadata = {
  title: "Contact PLAYO Toy Shop in Edappal | Store Location, Hours & Phone",
  description:
    "Visit PLAYO toy store near Nesto Hypermarket, Edappal, Malappuram. Get directions, call or WhatsApp +91 96059 73308, and check daily store hours from 9:30 AM to 10:30 PM.",
  alternates: {
    canonical: `${BUSINESS_INFO.url}/contact`,
  },
  openGraph: {
    title: "Contact PLAYO Toy Shop in Edappal | Store Location, Hours & Phone",
    description:
      "Visit PLAYO toy store near Nesto Hypermarket, Edappal, Malappuram. Daily hours: 9:30 AM - 10:30 PM. Call/WhatsApp: +91 96059 73308.",
    url: `${BUSINESS_INFO.url}/contact`,
    type: "website",
  },
};

export default function ContactPage() {
  const storeSchema = getLocalBusinessSchema();
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Contact & Store Location", url: "/contact" },
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

      {/* Header */}
      <Navbar activePage="contact" />

      <main className="flex-1">
        {/* Breadcrumb Bar */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
            <nav className="flex items-center gap-2 text-xs text-gray-500 font-medium" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-[#FF9800] transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-[#0D1B2A] font-semibold">Contact &amp; Store Location</span>
            </nav>
          </div>
        </div>

        {/* Main Content Grid: Contact Details Cards + Embedded Map */}
        <section className="py-10 sm:py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
              
              {/* Left Column: Verified NAP & Contact Information (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* NAP Card */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-6">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-[#0D1B2A] tracking-tight">
                      Store Details &amp; Contact Information
                    </h1>
                    <p className="text-xs text-gray-500 mt-1">
                      Direct contact channels for product availability, prices, and showroom visits.
                    </p>
                  </div>

                  {/* Physical Address */}
                  <div className="flex items-start gap-3.5 pt-2">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF9800] flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase text-gray-400 tracking-wider">Physical Address</p>
                      <p className="text-sm font-bold text-[#0D1B2A] mt-0.5">
                        PLAYO Toys &amp; Ride-Ons Showroom
                      </p>
                      <p className="text-xs text-gray-600 leading-relaxed mt-0.5">
                        Near Nesto Hypermarket, Thrissur-Kuttippuram Highway, <br />
                        Edappal, Malappuram District, Kerala — 679576
                      </p>
                      <div className="mt-2">
                        <a
                          href={BUSINESS_INFO.googleMapsDirectionsUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF9800] hover:underline"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>Get Directions on Google Maps</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Phone & WhatsApp */}
                  <div className="flex items-start gap-3.5 border-t border-gray-100 pt-5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase text-gray-400 tracking-wider">Phone &amp; WhatsApp</p>
                      <a
                        href={`tel:${BUSINESS_INFO.phoneClean}`}
                        className="text-sm font-bold text-[#0D1B2A] hover:text-[#FF9800] transition-colors block mt-0.5"
                      >
                        {BUSINESS_INFO.telephone}
                      </a>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Available for live video demos, stock status &amp; instant pricing.
                      </p>
                      <div className="mt-2.5">
                        <a
                          href={`https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=Hi%20Playo%20Edappal,%20I%20want%20to%20enquire%20about%20toys`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#16A34A] text-white text-xs font-bold hover:bg-[#15803d] transition-colors shadow-2xs"
                        >
                          <MessageCircle className="w-3.5 h-3.5 fill-current" />
                          <span>Chat on WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start gap-3.5 border-t border-gray-100 pt-5">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase text-gray-400 tracking-wider">Email Enquiries</p>
                      <a
                        href={`mailto:${BUSINESS_INFO.email}`}
                        className="text-sm font-bold text-[#0D1B2A] hover:text-blue-600 transition-colors block mt-0.5"
                      >
                        {BUSINESS_INFO.email}
                      </a>
                      <p className="text-xs text-gray-500 mt-0.5">
                        For wholesale, retail inquiries, and bulk birthday gifts.
                      </p>
                    </div>
                  </div>

                  {/* Opening Hours */}
                  <div className="flex items-start gap-3.5 border-t border-gray-100 pt-5">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase text-gray-400 tracking-wider">Business Hours</p>
                      <p className="text-sm font-bold text-[#0D1B2A] mt-0.5">
                        {BUSINESS_INFO.openingHoursDisplay}
                      </p>
                      <p className="text-xs text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>{BUSINESS_INFO.daysOpen}</span>
                      </p>
                    </div>
                  </div>

                </div>

              </div>

              {/* Right Column: Google Maps & Driving Directions (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Map Card */}
                <div className="bg-white rounded-3xl overflow-hidden border border-gray-200/80 shadow-xs flex flex-col">
                  <div className="p-5 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-[#0D1B2A]">
                        Showroom Location Map
                      </h2>
                      <p className="text-xs text-gray-500">
                        Conveniently situated near Nesto Hypermarket with easy customer parking.
                      </p>
                    </div>
                    <a
                      href={BUSINESS_INFO.googleMapsDirectionsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 bg-[#FF9800] hover:bg-[#F57C00] text-white text-xs font-bold rounded-xl transition-all inline-flex items-center gap-1.5 shadow-2xs shrink-0"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Open in Google Maps</span>
                    </a>
                  </div>

                  {/* Embedded Interactive Map */}
                  <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] bg-gray-100">
                    <iframe
                      src={BUSINESS_INFO.googleMapsEmbedUrl}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="PLAYO Edappal Google Maps Location"
                      className="w-full h-full"
                    />
                  </div>
                </div>

                {/* Practical Driving Directions from Nearby Towns */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs">
                  <h3 className="text-base sm:text-lg font-bold text-[#0D1B2A] mb-4">
                    Directions &amp; Travel Guidance from Nearby Localities
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* From Edappal Junction */}
                    <div className="p-4 rounded-2xl bg-[#FAFCFF] border border-gray-100">
                      <p className="text-xs font-bold text-[#0D1B2A] flex items-center gap-1.5 mb-1">
                        <MapPin className="w-3.5 h-3.5 text-[#FF9800]" />
                        <span>From Edappal Junction (~1 km)</span>
                      </p>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        Head along the main commercial road toward Nesto Hypermarket. PLAYO is located just moments from the hypermarket entrance with visible storefront signage.
                      </p>
                    </div>

                    {/* From Ponnani */}
                    <div className="p-4 rounded-2xl bg-[#FAFCFF] border border-gray-100">
                      <p className="text-xs font-bold text-[#0D1B2A] flex items-center gap-1.5 mb-1">
                        <MapPin className="w-3.5 h-3.5 text-[#FF9800]" />
                        <span>From Ponnani (~12 km, 20-25 mins)</span>
                      </p>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        Take the Ponnani - Edappal Road straight into Edappal. Turn toward the Nesto Hypermarket zone. Ample car and two-wheeler parking available.
                      </p>
                    </div>

                    {/* From Kuttippuram */}
                    <div className="p-4 rounded-2xl bg-[#FAFCFF] border border-gray-100">
                      <p className="text-xs font-bold text-[#0D1B2A] flex items-center gap-1.5 mb-1">
                        <MapPin className="w-3.5 h-3.5 text-[#FF9800]" />
                        <span>From Kuttippuram (~10 km, 15-20 mins)</span>
                      </p>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        Drive south along NH 66 corridor toward Edappal town. Enter near Nesto Hypermarket for convenient direct access to our toy showroom.
                      </p>
                    </div>

                    {/* From Valanchery */}
                    <div className="p-4 rounded-2xl bg-[#FAFCFF] border border-gray-100">
                      <p className="text-xs font-bold text-[#0D1B2A] flex items-center gap-1.5 mb-1">
                        <MapPin className="w-3.5 h-3.5 text-[#FF9800]" />
                        <span>From Valanchery (~16 km, 25-30 mins)</span>
                      </p>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        Take the Valanchery - Kuttippuram - Edappal route. Arrive easily near Nesto Hypermarket. Ideal for weekend family shopping outings.
                      </p>
                    </div>

                  </div>
                </div>

              </div>

            </div>
          </div>
        </section>

        {/* GEO & Search FAQ Section on Contact Page */}
        <FaqSection
          title="Frequently Asked Visit & Contact Questions"
          subtitle="Clear, verified answers for customers visiting PLAYO toy shop in Edappal, Malappuram."
          faqs={STORE_FAQS}
          includeSchema={false}
        />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
