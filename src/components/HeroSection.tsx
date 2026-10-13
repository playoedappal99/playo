"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight,
  ShieldCheck, 
  Truck, 
  Shield, 
  RotateCcw, 
  Headphones 
} from "lucide-react";

interface HeroSectionProps {
  onShopBestsellers: () => void;
  onExploreCategories?: () => void;
  onSelectCategory?: (categorySlug: string) => void;
}

interface SlideItem {
  id: string;
  kicker: string;
  title: string;
  slug: string;
  bgColor: string;
  bgGradient: string;
  image: string;
  alt: string;
  imageFit?: "cover" | "contain";
}

const SLIDES_DATA: SlideItem[] = [
  {
    id: "mini-bikes",
    kicker: "Kids'",
    title: "Mini Bike",
    slug: "scooters",
    bgColor: "#e61d2b",
    bgGradient: "from-[#d90429] via-[#ef233c] to-[#e61d2b]",
    image: "/images/carousel/mini-bike.png",
    alt: "Kids' Red Mini Dirt Bike Motocross",
    imageFit: "contain",
  },
  {
    id: "small-scooters",
    kicker: "Kids'",
    title: "Small Scooters",
    slug: "scooters",
    bgColor: "#f97316",
    bgGradient: "from-[#c2410c] via-[#ea580c] to-[#f97316]",
    image: "/images/carousel/scooters.jpg",
    alt: "Kids' 3-Wheel Light-up LED Kick Scooter",
    imageFit: "contain",
  },
  {
    id: "toy-jeeps",
    kicker: "Kids'",
    title: "Toy Jeeps",
    slug: "ride-ons",
    bgColor: "#059669",
    bgGradient: "from-[#047857] via-[#059669] to-[#10b981]",
    image: "/images/carousel/toy-jeeps.jpg",
    alt: "Kids' 4x4 Off-Road Electric Ride-On Toy Jeep",
    imageFit: "contain",
  },
  {
    id: "various-toys",
    kicker: "Kids'",
    title: "Various Toys",
    slug: "learning",
    bgColor: "#0284c7",
    bgGradient: "from-[#0369a1] via-[#0284c7] to-[#38bdf8]",
    image: "/images/carousel/various-toys.jpg",
    alt: "Kids' Educational Stacking Blocks and Various Learning Toys",
    imageFit: "contain",
  },
  {
    id: "soft-toys",
    kicker: "Kids'",
    title: "Soft Toys",
    slug: "soft-toys",
    bgColor: "#db2777",
    bgGradient: "from-[#be185d] via-[#db2777] to-[#f472b6]",
    image: "/images/carousel/soft-toys.jpg",
    alt: "Kids' Plush Cuddly Teddy Bear and Soft Toys",
    imageFit: "contain",
  },
  {
    id: "rc-cars",
    kicker: "Kids'",
    title: "RC Cars",
    slug: "rc-cars",
    bgColor: "#2563eb",
    bgGradient: "from-[#1d4ed8] via-[#2563eb] to-[#60a5fa]",
    image: "/images/carousel/rc-cars.jpg",
    alt: "High-Speed Radio Control RC Drift Sports Car with Remote",
    imageFit: "contain",
  },
  {
    id: "diecast-cars",
    kicker: "Kids'",
    title: "Diecast Cars",
    slug: "rc-cars",
    bgColor: "#0f172a",
    bgGradient: "from-[#020617] via-[#0f172a] to-[#1e293b]",
    image: "/images/carousel/diecast-cars.jpg",
    alt: "Precision Metal Collectible Diecast Model Supercar",
    imageFit: "contain",
  },
];

export default function HeroSection({
  onShopBestsellers,
  onSelectCategory,
}: HeroSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % SLIDES_DATA.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + SLIDES_DATA.length) % SLIDES_DATA.length);
  }, []);

  // Auto carousel rotation every 4.5 seconds
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 4500);
    return () => clearInterval(interval);
  }, [nextSlide, isPaused]);

  // Touch Swipe Handlers for mobile screens
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50) {
      nextSlide();
    } else if (diff < -50) {
      prevSlide();
    }
    touchStartX.current = null;
  };

  const currentSlide = SLIDES_DATA[currentIndex];

  const handleCtaClick = () => {
    if (onSelectCategory) {
      onSelectCategory(currentSlide.slug);
    } else {
      onShopBestsellers();
    }
  };

  return (
    <section className="w-full bg-[#fafbfc] pt-3 pb-8 sm:pt-4 sm:pb-12">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Main Carousel Banner Card (Large Rounded Corners matching screenshot) */}
        <div 
          className="relative w-full rounded-2xl sm:rounded-[32px] md:rounded-[40px] overflow-hidden shadow-md select-none transition-colors duration-700"
          style={{ backgroundColor: currentSlide.bgColor }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Subtle Ambient Vignette/Gradient Layer */}
          <div className={`absolute inset-0 bg-gradient-to-r ${currentSlide.bgGradient} opacity-95 transition-opacity duration-700`} />

          {/* Banner Inner Content */}
          <div className="relative z-10 w-full min-h-[260px] sm:min-h-[320px] md:min-h-[360px] lg:min-h-[400px] flex items-center">
            
            {/* If Mini Bike slide, we can render the exact composite or side-by-side layout */}
            <div className="w-full grid grid-cols-12 items-center px-6 sm:px-12 md:px-16 lg:px-20 py-8 sm:py-10">
              
              {/* Left Column: Huge Headline & CTA Button */}
              <div className="col-span-12 sm:col-span-7 lg:col-span-6 z-10 space-y-2 sm:space-y-4">
                <div className="flex flex-col tracking-tight">
                  {/* Line 1: Kids' in Pure White */}
                  <span className="font-outfit font-black text-3xl sm:text-5xl md:text-6xl lg:text-7xl text-white leading-[1.05] drop-shadow-xs">
                    {currentSlide.kicker}
                  </span>
                  {/* Line 2: Category in Bright Vibrant Yellow */}
                  <span className="font-outfit font-black text-3xl sm:text-5xl md:text-6xl lg:text-7xl text-[#ffee00] leading-[1.05] drop-shadow-xs">
                    {currentSlide.title}
                  </span>
                </div>

                {/* White Pill CTA Button */}
                <div className="pt-2 sm:pt-4">
                  <button
                    onClick={handleCtaClick}
                    className="bg-white hover:bg-gray-100 text-gray-950 font-bold text-xs sm:text-sm md:text-base px-6 sm:px-8 py-2.5 sm:py-3.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 inline-flex items-center gap-2 group cursor-pointer active:scale-95"
                  >
                    <span>Shop Now</span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-900 transition-transform duration-200 group-hover:translate-x-1" />
                  </button>
                </div>
              </div>

              {/* Right Column: High-Res Clean Product Image */}
              <div className="col-span-12 sm:col-span-5 lg:col-span-6 flex items-center justify-center sm:justify-end mt-4 sm:mt-0">
                <div className="relative w-full max-w-[280px] sm:max-w-[340px] md:max-w-[440px] lg:max-w-[520px] aspect-[4/3] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl ring-2 ring-white/20 transition-all duration-500 ease-out transform hover:scale-[1.02]">
                  <Image
                    src={currentSlide.image}
                    alt={currentSlide.alt}
                    fill
                    priority
                    sizes="(max-width: 640px) 280px, (max-width: 1024px) 440px, 520px"
                    className="object-cover"
                  />
                </div>
              </div>

            </div>

          </div>

          {/* Left Arrow Button */}
          <button
            onClick={prevSlide}
            aria-label="Previous Slide"
            className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 bg-white/95 hover:bg-white text-gray-900 rounded-full shadow-md hover:shadow-lg flex items-center justify-center absolute left-2.5 sm:left-4 md:left-6 top-1/2 -translate-y-1/2 z-20 transition-all hover:scale-110 active:scale-95 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900 stroke-[2.5]" />
          </button>

          {/* Right Arrow Button */}
          <button
            onClick={nextSlide}
            aria-label="Next Slide"
            className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 bg-white/95 hover:bg-white text-gray-900 rounded-full shadow-md hover:shadow-lg flex items-center justify-center absolute right-2.5 sm:right-4 md:right-6 top-1/2 -translate-y-1/2 z-20 transition-all hover:scale-110 active:scale-95 cursor-pointer"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900 stroke-[2.5]" />
          </button>

          {/* Bottom Pagination Indicator Dots (matches screenshot dots) */}
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 absolute bottom-3 sm:bottom-4 md:bottom-5 left-0 right-0 z-20">
            {SLIDES_DATA.map((slide, index) => {
              const isActive = index === currentIndex;
              return (
                <button
                  key={slide.id}
                  onClick={() => setCurrentIndex(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  className={`transition-all duration-300 rounded-full cursor-pointer ${
                    isActive 
                      ? "bg-white w-6 sm:w-8 h-2 sm:h-2.5 shadow-xs" 
                      : "bg-white/45 hover:bg-white/70 w-2 sm:w-2.5 h-2 sm:h-2.5"
                  }`}
                />
              );
            })}
          </div>

        </div>

        {/* Floating Trust Strip Right Below Carousel Banner */}
        <div className="mt-4 sm:mt-5 max-w-6xl mx-auto bg-white rounded-2xl lg:rounded-full py-3 sm:py-3.5 px-4 sm:px-8 shadow-sm border border-gray-100">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6 items-center">
            
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-[#132c4a] shrink-0 stroke-[1.75]" />
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">100% Original</h4>
                <p className="text-[10px] sm:text-[11px] text-gray-500 mt-0.5">Trusted brands & quality</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Truck className="w-5 h-5 text-[#132c4a] shrink-0 stroke-[1.75]" />
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">Free Shipping</h4>
                <p className="text-[10px] sm:text-[11px] text-gray-500 mt-0.5">On orders above ₹999</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Shield className="w-5 h-5 text-[#132c4a] shrink-0 stroke-[1.75]" />
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">Safe Payments</h4>
                <p className="text-[10px] sm:text-[11px] text-gray-500 mt-0.5">Multiple payment options</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <RotateCcw className="w-5 h-5 text-[#132c4a] shrink-0 stroke-[1.75]" />
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">Easy Returns</h4>
                <p className="text-[10px] sm:text-[11px] text-gray-500 mt-0.5">Within 7 Days</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 col-span-2 sm:col-span-1">
              <Headphones className="w-5 h-5 text-[#132c4a] shrink-0 stroke-[1.75]" />
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">Customer Support</h4>
                <p className="text-[10px] sm:text-[11px] text-gray-500 mt-0.5">We&apos;re here to help</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
