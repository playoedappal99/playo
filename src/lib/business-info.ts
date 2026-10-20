/**
 * PLAYO Edappal - Verified Business Constants & Schema Generators
 * Used across metadata, components, and JSON-LD structured data.
 */

export const BUSINESS_INFO = {
  name: "PLAYO",
  legalName: "PLAYO Edappal",
  alternateName: "Playo Toy Shop Edappal",
  category: "Toy Shop / Toys and Children's Products",
  description:
    "PLAYO is a premier kids' toy store and ride-on vehicle showroom located near Nesto Hypermarket, Edappal, Malappuram, Kerala. We specialize in kids' electric ride-on cars, 4x4 battery jeeps, mini dirt bikes, light-up LED scooters, remote control drift cars, diecast metal collectibles, and giant plush soft toys with prompt delivery across Kerala.",
  url: "https://playoedappal.in",
  logo: "https://playoedappal.in/images/playo-logo.png",
  image: "https://playoedappal.in/images/carousel/kids-jeep.png",
  telephone: "+91 96059 73308",
  phoneClean: "+919605973308",
  whatsappNumber: "919605973308",
  email: "playoedappal@gmail.com",
  address: {
    streetAddress: "Near Nesto Hypermarket, Thrissur-Kuttippuram Highway",
    addressLocality: "Edappal",
    addressRegion: "Kerala",
    postalCode: "679576",
    addressCountry: "IN",
  },
  geo: {
    latitude: 10.7618,
    longitude: 75.9892,
  },
  openingHours: "Mo-Su 09:30-22:30",
  openingHoursDisplay: "Monday to Sunday, 9:30 AM – 10:30 PM",
  daysOpen: "Open all 7 days (No weekly holidays)",
  priceRange: "₹₹",
  currenciesAccepted: "INR",
  paymentAccepted: "Cash, Credit Card, Debit Card, UPI, Google Pay, PhonePe",
  areaServed: [
    { name: "Edappal", type: "City" },
    { name: "Malappuram", type: "AdministrativeArea" },
    { name: "Ponnani", type: "City" },
    { name: "Kuttippuram", type: "City" },
    { name: "Valanchery", type: "City" },
    { name: "Kerala", type: "State" },
  ],
  googleMapsDirectionsUrl:
    "https://www.google.com/maps/search/?api=1&query=Playo+Toy+Shop+Near+Nesto+Hypermarket+Edappal+Kerala+679576",
  googleMapsEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.827376662483!2d75.9866034!3d10.7618037!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba7b6dd534571d1%3A0x7d018049e6d8a7c2!2sEdappal%2C%20Kerala%20679576!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin",
};

/**
 * Standard FAQs for GEO (Generative Engine Optimization) & Human Shoppers
 */
export const STORE_FAQS = [
  {
    question: "Where is PLAYO toy shop located in Edappal?",
    answer:
      "PLAYO is conveniently located near Nesto Hypermarket on the main highway corridor in Edappal, Malappuram District, Kerala 679576. Our physical showroom features extensive displays of kids' electric ride-ons, mini bikes, scooters, and premium toys with easy customer parking.",
  },
  {
    question: "What are PLAYO's opening hours?",
    answer:
      "PLAYO Edappal is open every day from Monday to Sunday, between 9:30 AM and 10:30 PM. We do not have any weekly holidays and remain open all seven days of the week to serve families and gift shoppers.",
  },
  {
    question: "How can customers contact PLAYO?",
    answer:
      "You can contact PLAYO directly by calling or messaging on WhatsApp at +91 96059 73308, or by emailing playoedappal@gmail.com. Our team provides instant assistance with product availability, prices, specifications, and home delivery across Kerala.",
  },
  {
    question: "Which types of toys are available at PLAYO?",
    answer:
      "PLAYO offers a diverse selection of quality toys including battery-powered electric ride-on cars and 4x4 jeeps, kids' mini balance and dirt bikes, foldable LED light-up kick scooters, high-speed remote control (RC) drift cars, collectible diecast metal model supercars, soft plush toys and teddy bears, and creative learning building sets.",
  },
  {
    question: "Does PLAYO sell kids' ride-on cars, toy jeeps, or mini bikes?",
    answer:
      "Yes. PLAYO is well-known in Malappuram district for kids' electric ride-on vehicles. We stock rechargeable 12V and 24V battery 4x4 jeeps, sports cars with parental 2.4GHz remote controls, and sturdy kids' mini dirt bikes and balance bikes designed for various age groups.",
  },
  {
    question: "Does PLAYO sell remote-control cars and diecast toys?",
    answer:
      "Yes, we carry a wide range of RC toys including 4WD drift racing cars with interchangeable drift wheels, high-speed buggies, and precision scale diecast metal collectible cars (such as 1:24 and 1:18 scale models) with opening doors and realistic details.",
  },
  {
    question: "Where can customers find directions to PLAYO?",
    answer:
      "Customers travelling from Ponnani, Kuttippuram, Valanchery, Changaramkulam, or within Edappal can reach us easily near Nesto Hypermarket, Edappal. Click the 'Get Directions' link on our website to open turn-by-turn navigation directly in Google Maps.",
  },
  {
    question: "How can customers check product availability and prices?",
    answer:
      "You can browse live product listings and transparent pricing directly on our website catalog. For real-time in-store stock checks, custom color options, or video demos of ride-ons, message our showroom on WhatsApp at +91 96059 73308.",
  },
];

/**
 * JSON-LD Schema Generators for SEO and GEO
 */
export function getLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ToyStore",
    "@id": `${BUSINESS_INFO.url}/#store`,
    name: BUSINESS_INFO.name,
    legalName: BUSINESS_INFO.legalName,
    alternateName: BUSINESS_INFO.alternateName,
    description: BUSINESS_INFO.description,
    url: BUSINESS_INFO.url,
    logo: BUSINESS_INFO.logo,
    image: [
      `${BUSINESS_INFO.url}/images/carousel/kids-jeep.png`,
      `${BUSINESS_INFO.url}/images/carousel/kids-diecast.png`,
      `${BUSINESS_INFO.url}/images/carousel/kids-balance-bike.png`,
    ],
    telephone: BUSINESS_INFO.phoneClean,
    email: BUSINESS_INFO.email,
    priceRange: BUSINESS_INFO.priceRange,
    currenciesAccepted: BUSINESS_INFO.currenciesAccepted,
    paymentAccepted: BUSINESS_INFO.paymentAccepted,
    address: {
      "@type": "PostalAddress",
      streetAddress: BUSINESS_INFO.address.streetAddress,
      addressLocality: BUSINESS_INFO.address.addressLocality,
      addressRegion: BUSINESS_INFO.address.addressRegion,
      postalCode: BUSINESS_INFO.address.postalCode,
      addressCountry: BUSINESS_INFO.address.addressCountry,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: BUSINESS_INFO.geo.latitude,
      longitude: BUSINESS_INFO.geo.longitude,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "09:30",
        closes: "22:30",
      },
    ],
    hasMap: BUSINESS_INFO.googleMapsDirectionsUrl,
    areaServed: BUSINESS_INFO.areaServed.map((area) => ({
      "@type": area.type,
      name: area.name,
    })),
  };
}

export function getWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${BUSINESS_INFO.url}/#website`,
    name: BUSINESS_INFO.name,
    url: BUSINESS_INFO.url,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BUSINESS_INFO.url}/catalog?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function getFaqSchema(faqs = STORE_FAQS) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function getBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${BUSINESS_INFO.url}${item.url}`,
    })),
  };
}

export function getProductSchema(product: {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  images?: string[];
  price: number;
  originalPrice?: number;
  inStock?: boolean;
  category?: string;
  brand?: string;
  sku?: string;
}) {
  const imageList = Array.isArray(product.images) && product.images.length > 0
    ? product.images.map((img) => (img.startsWith("http") ? img : `${BUSINESS_INFO.url}${img}`))
    : [product.imageUrl?.startsWith("http") ? product.imageUrl : `${BUSINESS_INFO.url}${product.imageUrl || "/images/catalog/porsche-drift-rc.jpg"}`];

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: imageList,
    description:
      product.description ||
      `Buy ${product.name} at PLAYO Edappal toy showroom. Verified quality, warranty support, and delivery across Kerala.`,
    sku: product.sku || product.id,
    brand: {
      "@type": "Brand",
      name: product.brand || "PLAYO",
    },
    category: product.category || "Toys & Games",
    offers: {
      "@type": "Offer",
      url: `${BUSINESS_INFO.url}/product/${product.id}`,
      priceCurrency: "INR",
      price: product.price,
      priceValidUntil: "2027-12-31",
      itemCondition: "https://schema.org/NewCondition",
      availability: product.inStock !== false
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "ToyStore",
        name: BUSINESS_INFO.name,
        telephone: BUSINESS_INFO.phoneClean,
        address: {
          "@type": "PostalAddress",
          addressLocality: BUSINESS_INFO.address.addressLocality,
          addressRegion: BUSINESS_INFO.address.addressRegion,
          postalCode: BUSINESS_INFO.address.postalCode,
          addressCountry: BUSINESS_INFO.address.addressCountry,
        },
      },
    },
  };
}
