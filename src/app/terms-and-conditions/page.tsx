import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TrustBadges from "@/components/TrustBadges";
import WhatsAppHelpStrip from "@/components/WhatsAppHelpStrip";
import { FileCheck, ShieldAlert, CreditCard, Truck, RotateCcw, Scale, ChevronRight, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms & Conditions | Playo Edappal - playoedappal.in",
  description:
    "Official Terms and Conditions for Playo Edappal (playoedappal.in). Read our terms on toy purchases, Razorpay payments, delivery fees, and 7-day replacement warranty.",
};

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-[#fafbfc] text-gray-900 flex flex-col font-sans selection:bg-[#FF9800] selection:text-white">
      {/* Header */}
      <Navbar activePage="terms-and-conditions" />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-6 font-medium" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-gray-900 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-gray-900 font-semibold">Terms &amp; Conditions</span>
        </nav>

        {/* Hero Title */}
        <div className="bg-white rounded-3xl border border-gray-200/90 p-6 sm:p-10 shadow-xs mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-800 text-xs font-bold mb-4">
            <FileCheck className="w-4 h-4 text-orange-600" />
            <span>Store Terms &amp; Purchase Agreement</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0D1B2A] tracking-tight">
            Terms &amp; Conditions
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-2 font-medium">
            Effective Date: January 1, 2026 • Last Updated: October 2026 • Playo Edappal (playoedappal.in)
          </p>

          <p className="text-xs sm:text-sm text-gray-600 mt-4 leading-relaxed">
            Welcome to <strong className="text-gray-900 font-semibold">Playo Edappal</strong> (&ldquo;we&rdquo;, &ldquo;our&rdquo;,
            or &ldquo;us&rdquo;), registered and operating as an authentic toys, electric ride-ons, and collectibles superstore
            in Edappal, Malappuram District, Kerala, accessible online at{" "}
            <a href="https://playoedappal.in" className="text-sky-600 font-bold hover:underline">
              https://playoedappal.in
            </a>
            . By browsing, adding products to cart, and placing orders on our website, you agree to be bound by the
            following Terms &amp; Conditions.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {/* Section 1: Acceptance & Store Identity */}
          <section className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-2xs space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-[#0D1B2A] flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-black">
                1
              </span>
              <span>Acceptance of Terms</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              These terms govern all transactions made on <strong>playoedappal.in</strong> and at our physical showroom in
              Edappal, Kerala. If you do not agree to these terms, please refrain from using our online ordering services.
              We reserve the right to modify these terms to reflect changes in regulatory standards or store offerings.
            </p>
          </section>

          {/* Section 2: Products & Child Safety */}
          <section className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-2xs space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-[#0D1B2A] flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-black">
                2
              </span>
              <span>Products, Age Suitability &amp; Safety</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Playo Edappal specializes in:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-gray-600 leading-relaxed">
              <li>Kids&apos; Electric 12V / 24V Ride-on Jeeps, Cars, and Trail Bikes with parent remote controls</li>
              <li>3-Wheel Lean-to-Steer LED Kick Scooters and Magnesium Alloy Balance Mini Bikes</li>
              <li>Collector-grade 1:18, 1:24, and 1:32 scale diecast metal supercars</li>
              <li>Premium plush soft toys, teddy bears, and educational play sets</li>
            </ul>
            <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Parental Guidance:</strong> All electric ride-ons should be operated under responsible adult
                supervision on safe, level surfaces away from vehicular traffic.
              </span>
            </div>
          </section>

          {/* Section 3: Pricing & Delivery Fee Policy */}
          <section className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-2xs space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-[#0D1B2A] flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-black">
                3
              </span>
              <span>Pricing &amp; Delivery Fee Policy</span>
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-gray-600 leading-relaxed">
              <li>
                <strong className="text-gray-900">Currency &amp; Taxes:</strong> All toy prices listed on the site are in
                Indian Rupees (₹) and include all applicable taxes.
              </li>
              <li>
                <strong className="text-gray-900">Delivery Fees:</strong> Depending on the toy&apos;s dimensions, weight, and
                shipping destination across Kerala, delivery may be complimentary (Free Doorstep Delivery) or carry an optional
                delivery fee configured per product. Any applicable delivery charges are calculated transparently and added to the
                Order Summary before payment.
              </li>
              <li>
                <strong className="text-gray-900">Authoritative Database Pricing:</strong> In the event of a technical discrepancy
                or cart manipulation attempt, the authoritative price and stock level verified directly against our MongoDB showroom
                database shall prevail.
              </li>
            </ul>
          </section>

          {/* Section 4: Razorpay Payment Terms */}
          <section className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-2xs space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-[#0D1B2A] flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-black">
                4
              </span>
              <span>Payment Processing via Razorpay Gateway</span>
            </h2>
            <div className="p-4 rounded-xl bg-[#F0F8FF] border border-sky-200 text-xs sm:text-sm text-slate-700 space-y-2">
              <p className="font-bold text-sky-950 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-sky-600" />
                <span>Authorized Payment Gateway Partner: Razorpay</span>
              </p>
              <p className="leading-relaxed">
                We accept payments via <strong>Razorpay</strong>, supporting Unified Payments Interface (UPI via Google Pay,
                PhonePe, Paytm, BHIM), Indian &amp; International Credit/Debit Cards, Net Banking, and approved Digital Wallets.
              </p>
            </div>

            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-gray-600 leading-relaxed">
              <li>Orders will only be confirmed and scheduled for packing after successful transaction confirmation from Razorpay.</li>
              <li>Playo Edappal never stores, reads, or caches card numbers, expiry dates, or CVVs. All sensitive interactions occur in Razorpay&apos;s 256-bit SSL encrypted PCI-DSS compliant vault.</li>
              <li>In the event of a network drop where an amount is debited without order generation, Razorpay automatically initiates an auto-refund within 3–5 banking business days.</li>
            </ul>
          </section>

          {/* Section 5: Order Confirmation & Shipping */}
          <section className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-2xs space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-[#0D1B2A] flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-black">
                5
              </span>
              <span>Order Dispatch &amp; Doorstep Delivery</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              All orders are hand-inspected, packed, and dispatched directly from our showroom in Edappal:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-gray-600 leading-relaxed">
              <li>
                <strong className="text-gray-900">Courier Partners:</strong> We ship through <em>Indian Post (Door-to-Door Delivery)</em> and <em>Speed &amp; Safe Courier Service</em>.
              </li>
              <li>
                <strong className="text-gray-900">Estimated Transit Time:</strong> 2 to 3 business days for deliveries across Kerala. Unforeseen weather disruptions or state holidays may cause minor delays.
              </li>
              <li>
                <strong className="text-gray-900">Live Tracking:</strong> Customers can track their parcels in real-time under the &ldquo;My Orders&rdquo; tab or by searching their Order ID.
              </li>
            </ul>
          </section>

          {/* Section 6: 7-Day Replacement Guarantee & 1-Year Warranty */}
          <section className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-2xs space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-[#0D1B2A] flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-black">
                6
              </span>
              <span>7-Day Replacement Guarantee &amp; Warranty</span>
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-gray-600 leading-relaxed">
              <li>
                <strong className="text-gray-900">7-Day Replacement:</strong> If a product arrives damaged in transit, with
                manufacturing defects, or missing components, contact us within 7 days of delivery for an immediate free replacement.
              </li>
              <li>
                <strong className="text-gray-900">Unboxing Video Recommendation:</strong> We kindly advise recording a continuous
                unboxing video upon receiving the package to ensure immediate claim processing for transit-related physical damage.
              </li>
              <li>
                <strong className="text-gray-900">1-Year Official Warranty:</strong> Selected electric ride-ons include a 1-year
                official warranty covering electric motors and rechargeable battery units against manufacturing failure.
              </li>
            </ul>
          </section>

          {/* Section 7: Governing Law & Jurisdiction */}
          <section className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-2xs space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-[#0D1B2A] flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-black">
                7
              </span>
              <span>Governing Law &amp; Jurisdiction</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              These Terms &amp; Conditions and all purchase contracts shall be governed by and construed in accordance with the
              laws of India. Any disputes arising out of or in connection with these terms shall be subject to the exclusive
              jurisdiction of the competent courts in Malappuram / Kerala, India.
            </p>
          </section>

          {/* Section 8: Showroom Contact Information */}
          <section className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-2xs space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-[#0D1B2A] flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-black">
                8
              </span>
              <span>Showroom Contact Information</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              For any questions regarding these terms, orders, or warranty service, our Edappal showroom team is here to assist:
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <a
                href="tel:+919072345678"
                className="px-4 py-2.5 rounded-xl bg-[#0D1B2A] hover:bg-black text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-2"
              >
                <Phone className="w-3.5 h-3.5 text-[#FF9800]" />
                <span>Call: +91 9072 345 678</span>
              </a>
              <a
                href="mailto:playoedappal@gmail.com"
                className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition-all shadow-2xs"
              >
                <span>Email: playoedappal@gmail.com</span>
              </a>
            </div>
          </section>
        </div>
      </main>

      <TrustBadges />
      <WhatsAppHelpStrip />
      <Footer />
    </div>
  );
}
