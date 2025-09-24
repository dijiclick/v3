// ChatGPT-style layout interfaces
export interface HeroSection {
  titleOverride?: string;
  subtitle?: string;
  heroIcon?: string;
  features?: string[];
  rtlDirection?: boolean;
}

export interface PricingPlan {
  duration: string;
  price: string;
  priceNumber?: number;
  originalPrice?: string;
  originalPriceNumber?: number;
  popular?: boolean;
  discount?: string;
  features?: string[];
}

export interface Screenshot {
  title?: string;
  description?: string;
  gradient?: string;
  icon?: string;
  image?: string;
}

export interface HowItWorksStep {
  step: string;
  title: string;
  description: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface Recommendation {
  icon: string;
  name: string;
  price: string;
  backgroundColor?: string;
}

export interface SidebarContent {
  howItWorks?: HowItWorksStep[];
  faqs?: FAQ[];
  recommendations?: Recommendation[];
}

export interface Statistic {
  value: string;
  label: string;
  icon?: string;
}

export interface StatisticsSection {
  title?: string;
  subtitle?: string;
  backgroundGradient?: string;
  statistics?: Statistic[];
}

export interface Benefit {
  icon?: string;
  title: string;
  description: string;
  gradient?: string;
}

export interface BenefitsSection {
  title?: string;
  benefits?: Benefit[];
}

export interface SupportingLink {
  text: string;
  url: string;
}

export interface FooterCTA {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonUrl?: string;
  supportingLinks?: SupportingLink[];
  backgroundGradient?: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  buyLink: string | null;
  mainDescription: any | null; // Rich text content (JSONB)
  featuredTitle: string | null;
  featuredFeatures: string[] | null;
  price: string;
  originalPrice: string | null;
  categoryId: string | null;
  image: string | null;
  rating: string | null;
  reviewCount: number | null;
  inStock: boolean | null;
  featured: boolean | null;
  tags: string[] | null;
  createdAt: Date | null;
  
  // ChatGPT-style layout fields
  layoutStyle?: 'traditional' | 'chatgpt';
  heroSection?: HeroSection;
  pricingPlans?: PricingPlan[];
  screenshots?: Screenshot[];
  sidebarContent?: SidebarContent;
  statisticsSection?: StatisticsSection;
  benefitsSection?: BenefitsSection;
  footerCTA?: FooterCTA;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: Date | null;
}

export interface CartItem {
  id: string;
  title: string;
  price: number;
  image?: string;
  quantity: number;
  color?: string;
}

export interface FilterState {
  categories: string[];
  priceRange: [number, number];
  rating: number | null;
  search: string;
}
