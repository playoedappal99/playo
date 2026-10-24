export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  href: string;
}

export interface ProductItem {
  _id?: string;
  id: string;
  name: string;
  categorySlug: string;
  category?: string;
  brand?: string;
  scale?: string;
  material?: string;
  color?: string;
  colorHex?: string;
  availableColors?: string | {
    name: string;
    hex?: string;
    inStock?: boolean;
    imageIndex?: number;
  }[];
  images?: string[];
  colorMappings?: {
    id?: string;
    color: string;
    images?: string[];
  }[];
  galleryImages?: {
    url: string;
    label: string;
    angleName?: string;
    color?: string;
  }[];
  price: number;
  originalPrice: number;
  discount: string;
  rating: number;
  reviewsCount: number;
  soldCount?: number;
  deliveryFee?: number;
  imageUrl: string;
  tag?: string;
  features?: string[];
  description?: string;
  bullets?: string[];
  detailsFeatures?: {
    label: string;
    value: string;
  }[];
  specs?: {
    ageGroup?: string;
    battery?: string;
    scale?: string;
    material?: string;
    speed?: string;
    brand?: string;
    color?: string;
    category?: string;
    [key: string]: string | undefined;
  };
  inStock?: boolean;
  stockCount?: number;
  isBestToy?: boolean;
}

export interface TestimonialItem {
  id: string;
  name: string;
  location: string;
  rating: number;
  comment: string;
  avatarUrl: string;
}

export const CATEGORIES_DATA: CategoryItem[] = [
  {
    id: "cat-rideons",
    name: "Electric Ride-ons",
    slug: "ride-ons",
    imageUrl: "/images/carousel/kids-jeep.png",
    href: "/catalog?category=ride-ons",
  },
  {
    id: "cat-scooters",
    name: "Small Scooters",
    slug: "scooters",
    imageUrl: "/images/carousel/kids-scooter.png",
    href: "/catalog?category=scooters",
  },
  {
    id: "cat-minibikes",
    name: "Mini Bikes",
    slug: "mini-bikes",
    imageUrl: "/images/carousel/kids-balance-bike.png",
    href: "/catalog?category=mini-bikes",
  },
  {
    id: "cat-rc",
    name: "RC Cars",
    slug: "rc-cars",
    imageUrl: "/images/carousel/kids-rc-car.png",
    href: "/catalog?category=rc-cars",
  },
  {
    id: "cat-diecast",
    name: "Diecast Cars",
    slug: "diecast",
    imageUrl: "/images/carousel/kids-diecast.png",
    href: "/catalog?category=diecast",
  },
  {
    id: "cat-soft",
    name: "Soft Toys",
    slug: "soft-toys",
    imageUrl: "/images/carousel/kids-teddy.png",
    href: "/catalog?category=soft-toys",
  },
  {
    id: "cat-creative",
    name: "Creative & Learning",
    slug: "learning",
    imageUrl: "/images/carousel/kids-blocks.png",
    href: "/catalog?category=learning",
  },
  {
    id: "cat-dirtbike",
    name: "Adventure Dirt Bikes",
    slug: "mini-bikes",
    imageUrl: "/images/carousel/kids-mini-dirt-bike.png",
    href: "/catalog?category=mini-bikes",
  },
];

export const PRODUCTS_DATA: ProductItem[] = [
  {
    id: "prod-porsche-rc",
    name: "PORSCHE DRIFT RC",
    categorySlug: "rc-cars",
    category: "GIFTS",
    scale: "1:24",
    price: 1990,
    originalPrice: 2990,
    discount: "33% OFF",
    rating: 5,
    reviewsCount: 128,
    imageUrl: "/images/catalog/porsche-drift-violet.jpg",
    galleryImages: [
      {
        url: "/images/catalog/porsche-drift-violet.jpg",
        label: "PORSCHE DRIFT RC angle 1",
        angleName: "Angle 1",
      },
      {
        url: "/images/catalog/porsche-drift-violet-2.jpg",
        label: "PORSCHE DRIFT RC angle 2",
        angleName: "Angle 2",
      },
    ],
    tag: "Bestseller",
    color: "VIOLET",
    colorHex: "#7c3aed",
    availableColors: [
      { name: "VIOLET", hex: "#7c3aed", inStock: true, imageIndex: 0 },
    ],
    inStock: true,
    detailsFeatures: [
      { label: "Scale", value: "1:24" },
      { label: "Category", value: "GIFTS" },
      { label: "Color", value: "VIOLET" },
      { label: "Material", value: "Diecast Metal with Plastic Parts" },
    ],
    features: [
      "Scale: 1:24",
      "Category: GIFTS",
      "Color: VIOLET",
      "Material: Diecast Metal with Plastic Parts",
    ],
    description: "Celebrate every beautiful moment with us",
    bullets: [
      "Premium hamper box",
      "RC car with gun type remote",
      "extra tyre and drift cones",
    ],
    specs: {
      brand: "Porsche",
      scale: "1:24",
      category: "GIFTS",
      ageGroup: "6+ Years",
      battery: "Rechargeable 7.4V Li-ion",
      speed: "18-20 km/h",
      material: "Diecast Metal with Plastic Parts",
      color: "VIOLET",
    },
  },
  {
    id: "prod-drift-giftbox",
    name: "DRIFT RC CAR WITH GIFT BOX",
    categorySlug: "rc-cars",
    category: "GIFTS",
    price: 1990,
    originalPrice: 2890,
    discount: "31% OFF",
    rating: 5,
    reviewsCount: 94,
    imageUrl: "/images/catalog/drift-rc-gift-box.jpg",
    galleryImages: [
      {
        url: "/images/catalog/drift-rc-angle-1.jpg",
        label: "DRIFT RC CAR WITH GIFT BOX angle 1",
        angleName: "Angle 1",
      },
      {
        url: "/images/catalog/drift-rc-angle-2.jpg",
        label: "DRIFT RC CAR WITH GIFT BOX angle 2",
        angleName: "Angle 2",
      },
      {
        url: "/images/catalog/drift-rc-gift-box.jpg",
        label: "DRIFT RC CAR WITH GIFT BOX",
        angleName: "Main View",
      },
    ],
    tag: "Gift Special",
    color: "BLACK, WHITE & BLUE",
    availableColors: [
      { name: "BLACK", hex: "#111827", inStock: false, imageIndex: 0 },
      { name: "WHITE & BLUE", hex: "#2563eb", inStock: false, imageIndex: 1 },
    ],
    inStock: false,
    detailsFeatures: [
      { label: "Category", value: "GIFTS" },
      { label: "Color", value: "BLACK, WHITE & BLUE" },
      { label: "Material", value: "Diecast Metal with Plastic Parts" },
    ],
    features: [
      "Category: GIFTS",
      "Color: BLACK, WHITE & BLUE",
      "Material: Diecast Metal with Plastic Parts",
    ],
    description: "Celebrate every beautiful moment with us",
    bullets: [
      "Premium hamper box",
      "RC car with gun type remote",
      "extra tyre and drift cones",
    ],
    specs: {
      category: "GIFTS",
      color: "BLACK, WHITE & BLUE",
      material: "Diecast Metal with Plastic Parts",
      brand: "Playo Special",
      ageGroup: "6+ Years",
      battery: "USB Rechargeable Pack",
      speed: "18-20 km/h",
    },
  },
  {
    id: "prod-cca-mclaren",
    name: "Metal CCA McLaren 765LT Diecast Model Car",
    categorySlug: "diecast",
    category: "Diecast Cars",
    brand: "CCA",
    scale: "1:24",
    price: 2699,
    originalPrice: 3799,
    discount: "29% OFF",
    rating: 5,
    reviewsCount: 156,
    imageUrl: "/images/catalog/cca-mclaren-box.jpg",
    tag: "Collector's Pick",
    color: "orange",
    colorHex: "#f97316",
    inStock: true,
    features: ["Heavy Diecast Zinc Alloy Body", "Opening Butterfly Doors & Engine Hood", "Authentic Licensed CCA Collector Window Box", "Real Rubber Tires"],
    specs: {
      brand: "CCA",
      scale: "1:24",
      ageGroup: "4+ Years & Collectors",
      material: "Zinc Alloy + ABS Chassis",
      color: "Papaya Orange",
    },
  },
  {
    id: "prod-cca-mclaren-pink",
    name: "Metal CCA McLaren 765LT Edition Pink",
    categorySlug: "diecast",
    category: "Diecast Cars",
    brand: "CCA",
    scale: "1:24",
    price: 2699,
    originalPrice: 3799,
    discount: "29% OFF",
    rating: 5,
    reviewsCount: 68,
    imageUrl: "/images/carousel/mclaren_red.png",
    tag: "Limited Edition",
    color: "pink",
    colorHex: "#ec4899",
    inStock: true,
    features: ["Gloss Pearl Pink Coating", "Detailed Interior Cockpit", "Collector Acrylic Display Base"],
    specs: {
      brand: "CCA",
      scale: "1:24",
      ageGroup: "4+ Years & Collectors",
      material: "Zinc Alloy Diecast",
      color: "Pink",
    },
  },
  {
    id: "prod-cca-mclaren-yellow",
    name: "Metal CCA McLaren 765LT Speed Yellow",
    categorySlug: "diecast",
    category: "Diecast Cars",
    brand: "CCA",
    scale: "1:24",
    price: 2699,
    originalPrice: 3799,
    discount: "29% OFF",
    rating: 5,
    reviewsCount: 112,
    imageUrl: "/images/carousel/mclaren_yellow.png",
    tag: "Top Rated",
    color: "yellow",
    colorHex: "#eab308",
    inStock: true,
    features: ["Speed Yellow Exterior", "Functional Butterfly Doors", "Steering Front Wheels"],
    specs: {
      brand: "CCA",
      scale: "1:24",
      ageGroup: "4+ Years & Collectors",
      material: "Heavy Metal Diecast",
      color: "Yellow",
    },
  },
  {
    id: "prod-cca-mclaren-blue",
    name: "Metal CCA McLaren 765LT Riviera Blue",
    categorySlug: "diecast",
    category: "Diecast Cars",
    brand: "CCA",
    scale: "1:24",
    price: 2699,
    originalPrice: 3799,
    discount: "29% OFF",
    rating: 5,
    reviewsCount: 84,
    imageUrl: "/images/carousel/mclaren_blue.png",
    tag: "Trending",
    color: "blue",
    colorHex: "#3b82f6",
    inStock: true,
    features: ["Metallic Riviera Blue Finish", "Opening Engine Bay Cover", "Official Scale Collector Box"],
    specs: {
      brand: "CCA",
      scale: "1:24",
      ageGroup: "4+ Years & Collectors",
      material: "Heavy Metal Diecast",
      color: "Blue",
    },
  },
  {
    id: "prod-bburago-118",
    name: "Bburago 1:18 Scale Precision Diecast Supercar",
    categorySlug: "diecast",
    category: "Diecast Cars",
    brand: "Bburago",
    scale: "1:18",
    price: 3499,
    originalPrice: 4999,
    discount: "30% OFF",
    rating: 5,
    reviewsCount: 88,
    imageUrl: "/images/carousel/kids-diecast.png",
    tag: "Collector 1:18",
    color: "black",
    colorHex: "#111827",
    inStock: true,
    features: ["Massive 1:18 Scale Collector Grade", "Four-Wheel Independent Suspension", "Working Steering Mechanism"],
    specs: {
      brand: "Bburago",
      scale: "1:18",
      ageGroup: "6+ Years & Collectors",
      material: "Precision Diecast Metal",
      color: "Black",
    },
  },
  {
    id: "prod-drift-sport-116",
    name: "High-Speed 2.4GHz RC Drift Sports Car 1:16",
    categorySlug: "rc-cars",
    category: "RC Cars",
    brand: "DriftPro",
    scale: "1:16",
    price: 2499,
    originalPrice: 3999,
    discount: "38% OFF",
    rating: 5,
    reviewsCount: 76,
    imageUrl: "/images/carousel/kids-rc-car.png",
    tag: "High Speed",
    color: "red",
    colorHex: "#ef4444",
    inStock: true,
    features: ["Precision Drift Tires Included", "25 km/h Top Speed", "Rechargeable Li-ion Pack"],
    specs: {
      brand: "DriftPro",
      scale: "1:16",
      ageGroup: "6+ Years",
      battery: "7.4V Rechargeable Li-ion",
      speed: "Up to 25 km/h",
      color: "Red",
    },
  },
  {
    id: "prod-rock-crawler",
    name: "4WD Rock Crawler Monster Truck 1:14",
    categorySlug: "rc-cars",
    category: "RC Cars",
    brand: "Playo",
    scale: "1:14",
    price: 2899,
    originalPrice: 4299,
    discount: "33% OFF",
    rating: 5,
    reviewsCount: 52,
    imageUrl: "https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?auto=format&fit=crop&w=600&q=80",
    tag: "All-Terrain",
    color: "blue",
    colorHex: "#3b82f6",
    inStock: false,
    features: ["Independent 4-Wheel High Flex Suspension", "Water-Resistant Electronics", "Deep Tread Rubber Tires"],
    specs: {
      brand: "Playo",
      scale: "1:14",
      ageGroup: "6+ Years",
      battery: "USB Rechargeable Pack",
      color: "Blue",
    },
  },
  {
    id: "prod-jeep-wrangler",
    name: "Electric 4x4 Off-Road Jeep Wrangler Ride-On",
    categorySlug: "ride-ons",
    category: "Electric Ride-ons",
    brand: "Playo",
    price: 8999,
    originalPrice: 13999,
    discount: "35% OFF",
    rating: 5,
    reviewsCount: 142,
    imageUrl: "/images/carousel/kids-jeep.png",
    tag: "Bestseller",
    color: "black",
    colorHex: "#111827",
    inStock: true,
    features: ["12V Dual Motor", "Parent Remote Control", "LED Headlights & Horn", "Spring Suspension"],
    specs: {
      brand: "Playo",
      ageGroup: "3-8 Years",
      battery: "12V 7Ah Rechargeable",
      speed: "3-6 km/h",
      material: "Reinforced Non-Toxic ABS",
      color: "Black",
    },
  },
  {
    id: "prod-balance-bike",
    name: "Kids' Pro Balance Mini Bike",
    categorySlug: "mini-bikes",
    category: "Mini Bikes",
    brand: "Playo",
    price: 3499,
    originalPrice: 5499,
    discount: "36% OFF",
    rating: 5,
    reviewsCount: 89,
    imageUrl: "/images/carousel/kids-balance-bike.png",
    tag: "Trending",
    color: "pink",
    colorHex: "#ec4899",
    inStock: true,
    features: ["Ultra-Lightweight Frame", "Puncture-Proof Rubber Tires", "Adjustable Saddle"],
    specs: {
      brand: "Playo",
      ageGroup: "2-5 Years",
      material: "Magnesium Alloy Frame",
      speed: "Pedal-Free Gliding",
      color: "Pink",
    },
  },
  {
    id: "prod-scooter-glow",
    name: "Glow Rider 3-Wheel LED Kick Scooter",
    categorySlug: "scooters",
    category: "Small Scooters",
    brand: "Playo",
    price: 1899,
    originalPrice: 2999,
    discount: "37% OFF",
    rating: 5,
    reviewsCount: 118,
    imageUrl: "/images/carousel/kids-scooter.png",
    tag: "Top Rated",
    color: "blue",
    colorHex: "#3b82f6",
    inStock: true,
    features: ["Light-Up Kinetic LED Wheels", "Lean-to-Steer Safety", "Fold & Carry Quick Lock"],
    specs: {
      brand: "Playo",
      ageGroup: "3-8 Years",
      material: "Aircraft Grade Aluminum",
      color: "Blue",
    },
  },
  {
    id: "prod-plush-bear",
    name: "Ultra Cuddle Plush Teddy Bear (Large)",
    categorySlug: "soft-toys",
    category: "Soft Toys",
    brand: "Playo",
    price: 1299,
    originalPrice: 1999,
    discount: "35% OFF",
    rating: 5,
    reviewsCount: 135,
    imageUrl: "/images/carousel/kids-teddy.png",
    tag: "Most Loved",
    color: "pink",
    colorHex: "#ec4899",
    inStock: true,
    features: ["Silky Soft Hypoallergenic Fur", "Satin Bow Ribbon", "Machine Washable Gentle Cycle"],
    specs: {
      brand: "Playo",
      ageGroup: "All Ages (0+)",
      material: "Premium Microfiber Plush",
      color: "Pink",
    },
  },
  {
    id: "prod-wooden-blocks",
    name: "Educational Stacking Blocks Castle Playset",
    categorySlug: "learning",
    category: "Creative & Learning",
    brand: "Playo",
    price: 1499,
    originalPrice: 2299,
    discount: "35% OFF",
    rating: 5,
    reviewsCount: 92,
    imageUrl: "/images/carousel/kids-blocks.png",
    tag: "STEM Learning",
    color: "yellow",
    colorHex: "#eab308",
    inStock: true,
    features: ["100% Solid Natural Beechwood", "Non-Toxic Pastel Water-Based Paint", "Smooth Rounded Edges"],
    specs: {
      brand: "Playo",
      ageGroup: "1-6 Years",
      material: "Certified Natural Beech Wood",
      color: "Yellow / Pastel",
    },
  },
  {
    id: "prod-dirt-bike",
    name: "Kids' Trail Explorer Mini Dirt Bike",
    categorySlug: "mini-bikes",
    category: "Mini Bikes",
    brand: "Playo",
    price: 7999,
    originalPrice: 11999,
    discount: "33% OFF",
    rating: 5,
    reviewsCount: 47,
    imageUrl: "/images/carousel/kids-mini-dirt-bike.png",
    tag: "Electric",
    color: "orange",
    colorHex: "#f97316",
    inStock: true,
    features: ["Quiet High-Torque Electric Motor", "Twist Grip Throttle", "Rear Disc Brake"],
    specs: {
      brand: "Playo",
      ageGroup: "5-10 Years",
      battery: "24V Sealed Lead Acid",
      speed: "Up to 14 km/h",
      color: "Orange",
    },
  },
];

export const TESTIMONIALS_DATA: TestimonialItem[] = [
  {
    id: "rev-1",
    name: "Priya Nair",
    location: "Calicut, Kerala",
    rating: 5,
    comment: "Excellent quality and super fast delivery to our home! My son is thrilled with his electric ride-on jeep. Best toy store in Kerala!",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
  },
  {
    id: "rev-2",
    name: "Rahul K",
    location: "Malappuram, Kerala",
    rating: 5,
    comment: "Great collection and very transparent pricing. The staff in Edappal is extremely helpful with warranty and setup.",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
  },
  {
    id: "rev-3",
    name: "Fathima",
    location: "Kozhikode, Kerala",
    rating: 5,
    comment: "Bought the large plush teddy bear for my daughter's birthday. It's incredibly soft, hypoallergenic, and she cuddles it every night!",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
  },
];
