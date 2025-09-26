# Sanity CMS Setup Guide

This guide will help you set up Sanity CMS for your e-commerce application.

## Prerequisites

- Node.js 20+
- npm/yarn/pnpm
- A Sanity account (free at https://sanity.io)

## Step 1: Create Sanity Project

1. **Create a new Sanity project:**
   ```bash
   npm create sanity@latest
   ```

2. **Choose the following options:**
   - ✅ TypeScript: Yes
   - ✅ Template: "Clean project"
   - ✅ Package manager: npm

3. **Note your project details:**
   - Project ID (you'll need this)
   - Dataset name (usually "production")

## Step 2: Set Up Schemas

1. **Copy schema files** from the `sanity-schemas/` directory to your Sanity Studio `schemas/` folder

2. **Update your `schemas/index.ts`:**
   ```typescript
   import { product } from './product'
   import { category } from './category'
   import { page } from './page'

   export const schemaTypes = [product, category, page]
   ```

3. **Update your `sanity.config.ts`:**
   ```typescript
   import { defineConfig } from 'sanity'
   import { deskTool } from 'sanity/desk'
   import { visionTool } from '@sanity/vision'
   import { schemaTypes } from './schemas'

   export default defineConfig({
     name: 'default',
     title: 'TechShop CMS',
     
     projectId: 'your-project-id',
     dataset: 'production',
     
     plugins: [deskTool(), visionTool()],
     
     schema: {
       types: schemaTypes,
     },
   })
   ```

## Step 3: Configure Environment Variables

Add these to your React app's `.env` file:

```bash
VITE_SANITY_PROJECT_ID=your-project-id
VITE_SANITY_DATASET=production
```

**Important Security Note:**
- The frontend client uses only public read access (no token required)
- For admin operations (creating/editing content), use Sanity Studio which has its own authentication
- Never expose API tokens in frontend environment variables

## Step 4: Configure CORS

1. Go to https://sanity.io/manage
2. Select your project
3. Go to API → CORS origins
4. Add your development and production URLs:
   - `http://localhost:5000` (development)
   - Your production domain

## Step 5: Start Sanity Studio

```bash
cd your-sanity-project
npm run dev
```

The studio will be available at `http://localhost:3333`

## Step 6: Content Creation

### Categories
1. Create categories first (Products depend on them)
2. Add at least: Electronics, Home & Garden, Fashion, Sports
3. Set featured categories for homepage display

### Products
1. Create products and assign them to categories
2. Add high-quality images
3. Set pricing, stock status, and descriptions
4. Mark some products as "featured" for homepage

### Pages
1. Create static pages like "About", "Contact", "FAQ"
2. Use rich text content with the portable text editor
3. Set SEO information for better search visibility

## Step 7: Testing Integration

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Check the console** for any Sanity connection errors

3. **Verify data loading** - your products and categories should now come from Sanity

## Content Structure

### Product Fields
- **Title**: Product name
- **Slug**: URL-friendly identifier
- **Description**: Product description
- **Price**: Current selling price
- **Original Price**: For showing discounts
- **Category**: Reference to category
- **Images**: Main image + gallery
- **Stock**: Quantity and availability
- **SEO**: Custom meta tags

### Category Fields
- **Name**: Category name
- **Slug**: URL-friendly identifier
- **Description**: Category description
- **Image**: Category featured image
- **Parent**: For category hierarchy
- **SEO**: Custom meta tags

### Page Fields
- **Title**: Page title
- **Slug**: URL path
- **Content**: Rich text with blocks
- **Featured Image**: Page hero image
- **Navigation**: Show in menu options
- **SEO**: Custom meta tags

## Deployment

### Sanity Studio
```bash
npm run build
npm run deploy
```

Your studio will be available at `https://yourproject.sanity.studio`

### Production Environment
Update your production environment variables with the same Sanity configuration.

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure you've added your domain to CORS origins
2. **Missing Content**: Check that your environment variables are set correctly
3. **Image Loading**: Verify your project ID and dataset name
4. **Token Permissions**: Ensure your token has read permissions (write permissions for admin operations)

### Support

- Sanity Documentation: https://www.sanity.io/docs
- Community: https://slack.sanity.io
- GitHub Issues: https://github.com/sanity-io/sanity

## Next Steps

1. **Content Migration**: If you have existing content, create a migration script
2. **Advanced Features**: Set up webhooks for real-time updates
3. **Performance**: Enable CDN for production image optimization
4. **Backup**: Set up automated content backups

Your e-commerce site is now powered by Sanity CMS! 🎉