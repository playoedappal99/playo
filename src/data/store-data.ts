export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  href: string;
}

export interface ProductItem {
  id: string;
  name: string;
  categorySlug: string;
  category?: string;
  price: number;
  originalPrice: number;
  discount: string;
  rating: number;
  reviewsCount: number;
  imageUrl: string;
  tag?: string;
  features?: string[];
  specs?: {
    ageGroup?: string;
    battery?: string;
    scale?: string;
    material?: string;
  };
  inStock?: boolean;
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
    imageUrl: "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=800&q=80",
    href: "#products",
  },
  {
    id: "cat-rc",
    name: "RC Cars",
    slug: "rc-cars",
    imageUrl: "https://images.unsplash.com/photo-1594787317798-2921d7fa74ca?auto=format&fit=crop&w=800&q=80",
    href: "#products",
  },
  {
    id: "cat-scooters",
    name: "Scooters",
    slug: "scooters",
    imageUrl: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=800&q=80",
    href: "#products",
  },
  {
    id: "cat-dolls",
    name: "Dolls & Pretend Play",
    slug: "dolls",
    imageUrl: "https://images.unsplash.com/photo-1558060370-d644479cb6f7?auto=format&fit=crop&w=800&q=80",
    href: "#products",
  },
  {
    id: "cat-soft",
    name: "Soft Toys",
    slug: "soft-toys",
    imageUrl: "https://images.unsplash.com/photo-1559454403-b8fb88521f11?auto=format&fit=crop&w=800&q=80",
    href: "#products",
  },
  {
    id: "cat-creative",
    name: "Creative & Learning",
    slug: "learning",
    imageUrl: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=800&q=80",
    href: "#products",
  },
];

export const PRODUCTS_DATA: ProductItem[] = [
  {
    id: "prod-1",
    name: "Remote Control Jeep Wrangler",
    categorySlug: "ride-ons",
    price: 3999,
    originalPrice: 5999,
    discount: "38% OFF",
    rating: 5,
    reviewsCount: 124,
    imageUrl: "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "prod-2",
    name: "Kids Ride On BMW Style Car",
    categorySlug: "ride-ons",
    price: 8499,
    originalPrice: 12999,
    discount: "35% OFF",
    rating: 5,
    reviewsCount: 98,
    imageUrl: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "prod-3",
    name: "Kids 3-wheel Scooter",
    categorySlug: "scooters",
    price: 1899,
    originalPrice: 2999,
    discount: "37% OFF",
    rating: 5,
    reviewsCount: 78,
    imageUrl: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "prod-4",
    name: "Battery Operated Toy Car",
    categorySlug: "ride-ons",
    price: 6499,
    originalPrice: 9999,
    discount: "35% OFF",
    rating: 5,
    reviewsCount: 62,
    imageUrl: "https://images.unsplash.com/photo-1532330384-85a065c79219?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "prod-5",
    name: "Soft Teddy Bear (Large)",
    categorySlug: "toys",
    price: 1299,
    originalPrice: 1999,
    discount: "35% OFF",
    rating: 5,
    reviewsCount: 110,
    imageUrl: "https://images.unsplash.com/photo-1559454403-b8fb88521f11?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "prod-6",
    name: "RC Monster Truck",
    categorySlug: "rc-cars",
    price: 2499,
    originalPrice: 3999,
    discount: "38% OFF",
    rating: 5,
    reviewsCount: 87,
    imageUrl: "https://images.unsplash.com/photo-1594787317798-2921d7fa74ca?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "prod-7",
    name: "Classic Roadster Ride On",
    categorySlug: "ride-ons",
    price: 5999,
    originalPrice: 8999,
    discount: "33% OFF",
    rating: 5,
    reviewsCount: 54,
    imageUrl: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "prod-8",
    name: "Speed Racer RC Car",
    categorySlug: "rc-cars",
    price: 1999,
    originalPrice: 2899,
    discount: "35% OFF",
    rating: 5,
    reviewsCount: 41,
    imageUrl: "https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?auto=format&fit=crop&w=600&q=80",
  },
];

export const TESTIMONIALS_DATA: TestimonialItem[] = [
  {
    id: "rev-1",
    name: "Priya Nair",
    location: "Calicut, Kerala",
    rating: 5,
    comment: "Excellent quality and fast delivery! My son loves his ride-on jeep. Highly recommend!",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
  },
  {
    id: "rev-2",
    name: "Rahul K",
    location: "Malappuram, Kerala",
    rating: 5,
    comment: "Great collection and reasonable price. Customer support is also very helpful.",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
  },
  {
    id: "rev-3",
    name: "Fathima",
    location: "Kozhikode, Kerala",
    rating: 5,
    comment: "Bought a teddy bear for my daughter. It's super soft and she loves it!",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
  },
];
