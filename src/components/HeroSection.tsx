"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

interface HeroSectionProps {
  onShopBestsellers: () => void;
  onExploreCategories?: () => void;
  onSelectCategory?: (categorySlug: string) => void;
}

interface SlideItem {
  id: string;
  kicker: string;
  title: string;
  highlightWord: string;
  slug: string;
  bgColor: string;
  bgGradient: string;
  accentColor: string;
  image: string;
  alt: string;
  description: string;
}

// 4 Promotional Slides specified in Design Direction:
// 1. Kids' Diecast Cars
// 2. Kids' Mini Bikes
// 3. Electric Ride-ons
// 4. Small Scooters
const SLIDES_DATA: SlideItem[] = [
  {
    id: "diecast-cars",
    kicker: "Kids'",
    title: "Diecast Cars",
    highlightWord: "Diecast Cars",
    slug: "diecast",
    bgColor: "#0D1B2A",
    bgGradient: "from-[#08121d] via-[#0D1B2A] to-[#162a40]",
    accentColor: "#FFE600",
    image: "/images/carousel/kids-diecast.png",
    alt: "Kids' Precision Metal Collectible Diecast Model Supercar",
    description: "Detailed 1:18 scale models with opening doors and realistic engine bays",
  },
  {
    id: "mini-bikes",
    kicker: "Kids'",
    title: "Mini Bikes",
    highlightWord: "Mini Bikes",
    slug: "mini-bikes",
    bgColor: "#991B1B",
    bgGradient: "from-[#7f1d1d] via-[#991b1b] to-[#b91c1c]",
    accentColor: "#FFE600",
    image: "/images/carousel/kids-balance-bike.png",
    alt: "Kids' Pro Balance Mini Bike & Trail Explorer",
    description: "Ultra-lightweight magnesium alloy frames built for early balance",
  },
  {
    id: "electric-ride-ons",
    kicker: "Electric",
    title: "Ride-ons",
    highlightWord: "Ride-ons",
    slug: "ride-ons",
    bgColor: "#0F243A",
    bgGradient: "from-[#091522] via-[#0D1B2A] to-[#14324f]",
    accentColor: "#FF9800",
    image: "/images/carousel/kids-jeep.png",
    alt: "Kids' 4x4 Off-Road Electric Ride-On Toy Jeep",
    description: "12V dual motors with parent remote control and LED headlights",
  },
  {
    id: "small-scooters",
    kicker: "Small",
    title: "Scooters",
    highlightWord: "Scooters",
    slug: "scooters",
    bgColor: "#0B192C",
    bgGradient: "from-[#091726] via-[#0d2238] to-[#1e3a5f]",
    accentColor: "#FFE600",
    image: "/images/carousel/kids-scooter.png",
    alt: "Kids' 3-Wheel Light-up LED Kick Scooter",
    description: "Lean-to-steer safety with kinetic glowing LED wheels",
  },
];

export default function HeroSection({
  onShopBestsellers,
  onSelectCategory,
}: HeroSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % SLIDES_DATA.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + SLIDES_DATA.length) % SLIDES_DATA.length);
  }, []);

  // Check prefers-reduced-motion
  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setIsReducedMotion(mediaQuery.matches);

      const handleChange = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, []);

  // Preload all carousel slide images
  useEffect(() => {
    if (typeof window !== "undefined") {
      SLIDES_DATA.forEach((slide) => {
        const img = new window.Image();
        img.src = slide.image;
      });
    }
  }, []);

  // Auto carousel advance every 4.5 seconds (paused on hover or if reduced motion is enabled)
  useEffect(() => {
    if (isPaused || isReducedMotion) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 4500);
    return () => clearInterval(interval);
  }, [nextSlide, isPaused, isReducedMotion]);

  // Touch Swipe Handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 45) {
      nextSlide();
    } else if (diff < -45) {
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
    <section className="w-full bg-[#FFFFFF] pt-3 pb-8 sm:pt-4 sm:pb-12" aria-label="Hero Promotion Carousel">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Main Carousel Banner Card (Large Rounded Corners with Brand Palette Backgrounds) */}
        <div 
          className="relative w-full rounded-2xl sm:rounded-[32px] md:rounded-[40px] overflow-hidden shadow-lg select-none transition-colors duration-700 group"
          style={{ backgroundColor: currentSlide.bgColor }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          role="region"
          aria-roledescription="carousel"
          aria-label="Promotional highlights"
        >
          {/* Subtle Ambient Vignette/Gradient Layer */}
          <div className={`absolute inset-0 bg-gradient-to-r ${currentSlide.bgGradient} opacity-95 transition-opacity duration-700`} />

          {/* Previous Arrow Button */}
          <button
            onClick={prevSlide}
            aria-label="Previous slide"
            type="button"
            className="hidden sm:flex absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/30 hover:bg-black/55 text-white backdrop-blur-xs items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-md border border-white/20 focus-visible:outline-2 focus-visible:outline-[#FF9800]"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Next Arrow Button */}
          <button
            onClick={nextSlide}
            aria-label="Next slide"
            type="button"
            className="hidden sm:flex absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/30 hover:bg-black/55 text-white backdrop-blur-xs items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-md border border-white/20 focus-visible:outline-2 focus-visible:outline-[#FF9800]"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Banner Inner Content */}
          <div className="relative z-10 w-full min-h-[220px] xs:min-h-[250px] sm:min-h-[340px] md:min-h-[390px] lg:min-h-[430px] flex items-center">
            
            <div className="w-full grid grid-cols-12 items-center px-4 xs:px-6 sm:px-12 md:px-16 lg:px-20 py-5 sm:py-8 md:py-10">
              
              {/* Left Column: Bold Headline & CTA Button */}
              <div className="col-span-6 sm:col-span-7 lg:col-span-6 z-10 space-y-2 xs:space-y-2.5 sm:space-y-3 pr-1 sm:pr-4">
                <h1 className="flex flex-col tracking-tight">
                  {/* Line 1: Kicker / White text */}
                  <span className="font-outfit font-black text-2xl xs:text-3xl sm:text-5xl md:text-6xl lg:text-7xl text-white leading-[1.08] drop-shadow-sm">
                    {currentSlide.kicker}
                  </span>
                  {/* Line 2: Highlighted Keyword in Vibrant Yellow or Orange */}
                  <span 
                    className="font-outfit font-black text-2xl xs:text-3xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.08] drop-shadow-sm transition-colors duration-500"
                    style={{ color: currentSlide.accentColor }}
                  >
                    {currentSlide.title}
                  </span>
                  <span className="sr-only"> — PLAYO Toy Shop in Edappal, Malappuram | Kids&apos; Toys &amp; Ride-On Vehicles</span>
                </h1>

                <p className="hidden sm:block text-xs md:text-sm text-gray-200/90 font-medium max-w-md pt-0.5">
                  {currentSlide.description}
                </p>

                {/* Clear Shop Now Pill CTA Button */}
                <div className="pt-2 xs:pt-2.5 sm:pt-4">
                  <button
                    onClick={handleCtaClick}
                    type="button"
                    className="bg-white hover:bg-gray-100 text-[#0D1B2A] font-extrabold text-xs xs:text-sm sm:text-base px-4 py-2 xs:px-5 xs:py-2.5 sm:px-8 sm:py-3.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 inline-flex items-center gap-1.5 sm:gap-2 group cursor-pointer active:scale-95 focus-visible:outline-2 focus-visible:outline-[#FF9800]"
                  >
                    <span>Shop Now</span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#0D1B2A] transition-transform duration-200 group-hover:translate-x-1 stroke-[2.5]" />
                  </button>
                </div>
              </div>

              {/* Right Column: High Quality Cutout Product Image */}
              <div className="col-span-6 sm:col-span-5 lg:col-span-6 flex items-center justify-center sm:justify-end">
                <div className="relative w-full h-36 xs:h-44 sm:h-auto sm:aspect-[4/3] max-w-[280px] sm:max-w-[360px] md:max-w-[460px] lg:max-w-[540px] flex items-center justify-center transition-all duration-500 ease-out transform scale-110 xs:scale-115 sm:scale-100 hover:scale-[1.03]">
                  <Image
                    src={currentSlide.image}
                    alt={currentSlide.alt}
                    fill
                    priority
                    sizes="(max-width: 640px) 320px, (max-width: 1024px) 460px, 540px"
                    className="object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.38)]"
                  />
                </div>
              </div>

            </div>

          </div>

          {/* Bottom Pagination Indicator Dots */}
          <div className="flex items-center justify-center gap-2 sm:gap-2.5 absolute bottom-3 sm:bottom-4 md:bottom-5 left-0 right-0 z-20">
            {SLIDES_DATA.map((slide, index) => {
              const isActive = index === currentIndex;
              return (
                <button
                  key={slide.id}
                  onClick={() => setCurrentIndex(index)}
                  type="button"
                  aria-label={`Go to slide ${index + 1}: ${slide.kicker} ${slide.title}`}
                  className={`transition-all duration-300 rounded-full cursor-pointer focus-visible:outline-2 focus-visible:outline-[#FF9800] ${
                    isActive 
                      ? "bg-white w-7 sm:w-9 h-2 sm:h-2.5 shadow-xs" 
                      : "bg-white/45 hover:bg-white/75 w-2 sm:w-2.5 h-2 sm:h-2.5"
                  }`}
                />
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
