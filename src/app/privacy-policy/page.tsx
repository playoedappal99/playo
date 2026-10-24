import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TrustBadges from "@/components/TrustBadges";
import WhatsAppHelpStrip from "@/components/WhatsAppHelpStrip";
import { ShieldCheck, Lock, CreditCard, Database, EyeOff, FileText, ChevronRight, Truck, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | Playo Edappal - playoedappal.in",
  description:
    "Official Privacy Policy of Playo Edappal (playoedappal.in). Learn how we protect customer data, secure payments via Razorpay, and ensure database-level privacy.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#fafbfc] text-gray-900 flex flex-col font-sans selection:bg-[#FF9800] selection:text-white">
      {/* Header */}
      <Navbar activePage="privacy-policy" />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-6 font-medium" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-gray-900 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-gray-900 font-semibold">Privacy Policy</span>
        </nav>

        {/* Hero Title */}
        <div className="bg-white rounded-3xl border border-gray-200/90 p-6 sm:p-10 shadow-xs mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-4">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Customer Privacy &amp; Data Security</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0D1B2A] tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-2 font-medium">
            Effective Date: January 1, 2026 • Last Updated: October 2026 • Playo Edappal (playoedappal.in)
          </p>

          <p className="text-xs sm:text-sm text-gray-600 mt-4 leading-relaxed">
            At <strong className="text-gray-900 font-semibold">Playo Edappal</strong>, accessible from{" "}
            <a href="https://playoedappal.in" className="text-sky-600 font-bold hover:underline">
              https://playoedappal.in
            </a>
            , protecting the privacy and personal information of our young drivers and their parents is our utmost
            priority. This Privacy Policy document outlines the types of information we collect, how it is safeguarded
            by our database-backed architecture, and our strict payment processing standards via{" "}
            <strong className="text-gray-900 font-semibold">Razorpay</strong>.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {/* Section 1: Business Identity */}
          <section className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-2xs space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-[#0D1B2A] flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-black">
                1
              </span>
              <span>Who We Are (Entity Details)</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              We operate as a physical toy superstore and showroom headquartered in Edappal, Kerala:
            </p>
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-700 space-y-1">
              <p className="font-bold text-gray-900">Playo Toys &amp; Kids Ride-Ons Showroom</p>
              <p>Edappal, Malappuram District, Kerala — 679541, India</p>
              <p>Official Website: <span className="font-mono text-sky-600">https://playoedappal.in</span></p>
              <p>Customer Support: <a href="tel:+919072345678" className="font-semibold text-gray-900 hover:underline">+91 9072 345 678</a></p>
              <p>Support Email: <a href="mailto:playoedappal@gmail.com" className="font-semibold text-gray-900 hover:underline">playoedappal@gmail.com</a></p>
            </div>
          </section>

          {/* Section 2: Information We Collect */}
          <section className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-2xs space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-[#0D1B2A] flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-black">
                2
              </span>
              <span>Information We Collect</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              We collect only the essential information necessary to verify stock, process orders, and deliver items to
              your doorstep across Kerala:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-gray-600 leading-relaxed">
              <li><strong className="text-gray-900">Personal Contact Details:</strong> Full name, 10-digit mobile phone number, and email address.</li>
              <li><strong className="text-gray-900">Shipping &amp; Delivery Address:</strong> House number / building name, road name / area, landmark, city, state, and 6-digit postal PIN code.</li>
              <li><strong className="text-gray-900">Order Particulars:</strong> Selected toys, color variants, quantities, price subtotal, delivery fee, and discount codes.</li>
              <li><strong className="text-gray-900">Courier Preferences:</strong> Delivery instructions and chosen shipping partner (Indian Post or Speed &amp; Safe Courier Service).</li>
            </ul>
          </section>

          {/* Section 3: Razorpay Payment Gateway Integration */}
          <section className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-2xs space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-[#0D1B2A] flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-black">
                3
              </span>
              <span>Payment Gateway Integration (Razorpay)</span>
            </h2>
            <div className="p-4 rounded-xl bg-[#F0F8FF] border border-sky-200 flex items-start gap-3.5">
              <CreditCard className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-slate-700 space-y-1.5">
                <p className="font-bold text-sky-950">
                  Zero Financial Data Stored on Playo Edappal Servers
                </p>
                <p className="leading-relaxed">
                  All online payments on <strong>playoedappal.in</strong> are facilitated through{" "}
                  <strong>Razorpay Payment Gateway</strong> (Razorpay Software Private Limited).
                </p>
              </div>
            </div>

            <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-gray-600 leading-relaxed">
              <li>
                <strong className="text-gray-900">PCI-DSS Level 1 Compliance:</strong> Razorpay handles all sensitive
                payment authorizations in a PCI-DSS certified environment. Card details, CVV numbers, net banking credentials,
                and UPI PINs are processed exclusively on Razorpay&apos;s encrypted servers.
              </li>
              <li>
                <strong className="text-gray-900">Accepted Payment Methods:</strong> UPI (Google Pay, PhonePe, Paytm, BHIM),
                Credit and Debit Cards (Visa, MasterCard, RuPay, American Express), Net Banking from all major Indian banks, and
                authorized digital wallets.
              </li>
              <li>
                <strong className="text-gray-900">Refund Processing:</strong> In the rare event of order cancellation or
                replacement authorization, refunds are credited back to the original source account via Razorpay within 5–7
                business days in accordance with Reserve Bank of India (RBI) guidelines.
              </li>
            </ul>
          </section>

          {/* Section 4: Database Storage & Cloudinary Architecture */}
          <section className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-2xs space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-[#0D1B2A] flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-black">
                4
              </span>
              <span>Database Storage &amp; Cloud Architecture</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              In accordance with real-world enterprise standards, our platform operates on a strictly database-backed architecture:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-gray-600 leading-relaxed">
              <li>
                <strong className="text-gray-900">MongoDB Atlas:</strong> All catalog entries, stock balances, price points,
                and customer order receipts are stored in a secured MongoDB Atlas cluster protected by end-to-end TLS 1.3
                encryption in transit and AES-256 encryption at rest.
              </li>
              <li>
                <strong className="text-gray-900">Cloudinary CDN:</strong> All showroom media assets, category banners, and toy
                photographs are stored on Cloudinary&apos;s global Content Delivery Network. No customer personal data is ever
                uploaded to Cloudinary.
              </li>
              <li>
                <strong className="text-gray-900">Anti-Tampering Price Validation:</strong> All cart prices and discounts
                are authoritatively validated against our database before orders are created, ensuring fair and tamper-proof billing.
              </li>
            </ul>
          </section>

          {/* Section 5: Device-Level Order Privacy */}
          <section className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-2xs space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-[#0D1B2A] flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-black">
                5
              </span>
              <span>Device-Level Privacy &amp; Order Isolation</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              We respect your right to private shopping without forcing you to remember complicated passwords:
            </p>
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs sm:text-sm text-emerald-950 space-y-2">
              <p className="font-bold flex items-center gap-1.5 text-emerald-800">
                <EyeOff className="w-4 h-4 text-emerald-600" />
                <span>Strict Device Isolation for &ldquo;My Orders&rdquo;</span>
              </p>
              <p className="text-xs text-emerald-900 leading-relaxed">
                When you place an order on your phone or laptop, that order&apos;s unique ID is saved locally on your device&apos;s
                secure browser storage (<code className="bg-emerald-100/80 px-1 py-0.5 rounded text-[11px]">localStorage</code>).
                When you visit the &ldquo;My Orders&rdquo; page, only orders placed on <strong>your specific device</strong> are
                displayed. Other visitors or devices cannot view your orders, address, or phone number.
              </p>
            </div>
          </section>

          {/* Section 6: Delivery & Logistics Partners */}
          <section className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-2xs space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-[#0D1B2A] flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-black">
                6
              </span>
              <span>Third-Party Courier Disclosure</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              We do not sell, rent, or lease your personal information to third parties or marketing brokers. We share your
              delivery information exclusively with our authorized delivery partners to accomplish doorstep parcel transit:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-gray-600">
              <li><strong>Indian Post (Door-to-Door Delivery)</strong></li>
              <li><strong>Speed &amp; Safe Courier Service</strong></li>
            </ul>
          </section>

          {/* Section 7: User Rights & Inquiries */}
          <section className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-2xs space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-[#0D1B2A] flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-black">
                7
              </span>
              <span>Your Rights &amp; How to Contact Us</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              You have the right to request a copy of the order records associated with your phone number, or to request
              deletion of historical customer logs. For any questions regarding this Privacy Policy or your data, reach out to us:
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <a
                href="mailto:playoedappal@gmail.com"
                className="px-4 py-2.5 rounded-xl bg-[#0D1B2A] hover:bg-black text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-2"
              >
                <span>Email: playoedappal@gmail.com</span>
              </a>
              <a
                href="https://wa.me/919072345678?text=Hello%20Playo%20Edappal,%20I%20have%20a%20question%20regarding%20Privacy%20Policy"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-2"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>WhatsApp Customer Care</span>
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
