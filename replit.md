# Overview

This is a modern e-commerce web application built with React/TypeScript, Express.js, and PostgreSQL. The application features a full-stack architecture with both customer-facing storefront and admin panel capabilities. It supports dual content management through either Sanity CMS or a traditional PostgreSQL database, providing flexibility for content management workflows.

# User Preferences

Preferred communication style: Simple, everyday language.

# Recent Major Updates

## Enhanced Blog System & Search Improvements (September 2025)
- **Intelligent Text Direction Detection**: Implemented automatic LTR/RTL text direction switching in search components based on input language (English = LTR, Persian = RTL) with real-time detection and layout adjustment
- **Fixed Search API Integration**: Resolved search API calling issue where query parameters were incorrectly constructed, enabling successful ChatGPT product discovery through comprehensive search
- **Comprehensive Search Testing**: Added Playwright end-to-end tests to verify ChatGPT product searchability and text direction functionality across different input languages
- **Fixed Search Component Styling**: Resolved white text on white background issue in both ComprehensiveSearch and SearchInput components by adding explicit text color classes for proper contrast across light and dark themes
- **Fixed Search Functionality**: Comprehensive search now correctly finds all content including "ChatGPT" tools and products
- **Modern Blog Card Design**: Updated blog main page with larger featured images (4:3 aspect ratio), enhanced author displays, and professional styling
- **Advanced Admin Image Management**: Full-featured image upload system in blog editor with drag-and-drop, preview, validation, and URL input options
- **Enhanced Author Presentation**: Prominent author profiles with larger avatars, gradient backgrounds, and job titles for better visibility
- **Visual Polish**: Modern hover effects, shadow-2xl transitions, improved typography, and responsive grid layouts (1-2-3 columns)
- **Professional UI/UX**: Enhanced metadata display with colorful icons, improved category badges, and smooth 500ms transitions

## Complete Modern Blog Redesign (September 2025)
- **Modern Component System**: Created 7 new modern components (Newsletter, Pagination, SearchBar, Sidebar, BlogPost, CategoryFilter, EmptyState) with full Persian RTL support
- **Professional Design Language**: Implemented gradient headers, card-based layouts, modern typography, and smooth animations throughout
- **Integrated Search & Filtering**: Advanced search with category filtering, tag selection, and synchronized state management across all components
- **Enhanced Sidebar Features**: Newsletter signup, popular posts display, subscription services showcase, and hot tags with interactive clicking
- **Persian Localization**: Complete RTL layout support, Persian date formatting, number localization, and cultural adaptations
- **Responsive Grid System**: Adaptive layouts that work seamlessly across desktop, tablet, and mobile devices
- **API Integration**: Full compatibility with existing backend endpoints while adding fallback handling for robust user experience

## Complete Bilingual Admin Panel (December 2025)
- **100% Farsi Translation Coverage**: All admin panel elements now switch to Farsi when language is selected
- **Comprehensive Translation System**: 200+ translation keys covering all admin functionality
- **Full RTL/LTR Support**: Complete bidirectional text support with automatic layout adjustment
- **Admin Components Coverage**: Authentication, dashboard, settings, forms, SEO tools, and blog management
- **Enhanced User Experience**: Toast messages, validation feedback, and all UI elements properly localized

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development and building
- **UI Library**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state and custom hooks for client state
- **Cart Management**: Local storage-based cart system with reactive updates

## Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Database**: PostgreSQL with Neon serverless driver
- **ORM**: Drizzle ORM with TypeScript schema definitions
- **API**: RESTful endpoints for products, categories, and CRUD operations
- **Session Management**: PostgreSQL session store for admin authentication

## Content Management System
- **Dual CMS Support**: Configurable between Sanity CMS and database-driven content
- **Sanity Integration**: Complete studio setup with custom schemas for products, categories, and pages
- **Fallback Strategy**: Automatic fallback to database when Sanity is not configured
- **Content Adaptation**: Adapter layer to normalize content between different sources

## Database Schema
- **Products Table**: Full e-commerce product data including pricing, inventory, ratings, and categorization
- **Categories Table**: Hierarchical category system with slugs and descriptions  
- **Users Table**: Admin user management with authentication
- **Relationships**: Foreign key relationships between products and categories

## SEO and Performance
- **Meta Tag Management**: Dynamic SEO metadata injection for products and pages
- **Structured Data**: JSON-LD schema markup for rich snippets
- **Image Optimization**: Responsive images with lazy loading
- **Performance**: Code splitting, tree shaking, and optimized bundle sizes

## Authentication and Security
- **Admin Authentication**: Session-based authentication with password protection and modern login UI
- **Enhanced Login Experience**: Redesigned login page with gradients, glassmorphism effects, loading states, password visibility toggle, and remember me functionality
- **Route Protection**: Protected admin routes with authentication guards
- **CORS**: Configured for secure cross-origin requests
- **Environment Variables**: Secure configuration management

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL database hosting
- **Database URL**: Required environment variable for database connection

## Content Management
- **Sanity CMS**: Optional headless CMS integration
  - Project ID and dataset configuration
  - Image optimization and CDN delivery
  - Real-time content updates
- **Sanity Studio**: Self-hosted admin interface on port 3333

## UI and Styling
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide Icons**: Comprehensive icon library
- **Google Fonts**: Inter font family for typography

## Development Tools
- **Replit Plugins**: Development banner and error overlay
- **TypeScript**: Full type safety across frontend and backend
- **ESBuild**: Fast JavaScript bundling for production builds
- **PostCSS**: CSS processing with Tailwind and Autoprefixer

## State Management
- **TanStack Query**: Server state management with caching
- **Local Storage**: Client-side cart and preference persistence
- **Custom Hooks**: Reactive state management for cart and authentication

## Image and Media
- **Unsplash**: Placeholder images for product catalog
- **Sanity CDN**: Optimized image delivery when using Sanity CMS
- **Image URL Builder**: Dynamic image transformations and optimization