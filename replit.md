# Overview

This is a modern e-commerce web application built with React/TypeScript, Express.js, and PostgreSQL. The application features a full-stack architecture with both customer-facing storefront and admin panel capabilities. It supports dual content management through either Sanity CMS or a traditional PostgreSQL database, providing flexibility for content management workflows.

# User Preferences

Preferred communication style: Simple, everyday language.

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