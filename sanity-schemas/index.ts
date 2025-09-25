// Core content schemas
import { product } from './product'
import { category } from './category'
import { page } from './page'

// Blog system schemas
import { blogPost } from './blogPost'
import { blogCategory } from './blogCategory'
import { author } from './author'
import { tag } from './tag'

export const schemaTypes = [
  // Core content
  product,
  category,
  page,
  
  // Blog system
  blogPost,
  blogCategory,
  author,
  tag,
]

// Named exports for individual schemas
export {
  // Core content
  product,
  category,
  page,
  
  // Blog system
  blogPost,
  blogCategory,
  author,
  tag,
}