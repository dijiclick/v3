import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes/index'

export default defineConfig({
  name: 'default',
  title: 'TechShop CMS',

  // Local development setup - no external project needed
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'local-dev',
  dataset: process.env.SANITY_STUDIO_DATASET || 'development',

  plugins: [structureTool(), visionTool()],

  schema: {
    types: schemaTypes,
  },

  // Development settings for Replit
  useCdn: false,
  apiVersion: '2024-01-01',
  
  // Local development configuration
  studioHost: 'localhost',
  basePath: '/',
})