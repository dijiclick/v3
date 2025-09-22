# Sanity CMS Schemas for E-commerce

This directory contains the Sanity Studio schema definitions for the e-commerce application. These schemas should be used in your Sanity Studio project.

## Setup Instructions

1. Create a new Sanity project:
```bash
npm create sanity@latest
```

2. Choose the following options:
   - ✅ TypeScript: Yes
   - ✅ Template: "Clean project"
   - ✅ Package manager: npm

3. Copy the schema files from this directory to your Sanity Studio `schemas/` folder

4. Import and register the schemas in your `sanity.config.ts`:

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

5. Update your `schemas/index.ts`:

```typescript
import { product } from './product'
import { category } from './category'
import { page } from './page'

export const schemaTypes = [product, category, page]
```

## Environment Variables

Add these to your React app's `.env` file:

```bash
VITE_SANITY_PROJECT_ID=your-project-id
VITE_SANITY_DATASET=production
VITE_SANITY_TOKEN=your-token-for-writes
```

## Content Types

- **Product**: E-commerce product with pricing, images, categories, SEO
- **Category**: Product categories with hierarchical support
- **Page**: Static pages with rich content (About, FAQ, etc.)