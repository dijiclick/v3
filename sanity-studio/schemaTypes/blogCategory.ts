import { defineField, defineType } from 'sanity'

export const blogCategory = defineType({
  name: 'blogCategory',
  title: 'Blog Category',
  type: 'document',
  icon: () => '📂',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required().max(50),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.max(300),
      description: 'Brief description of this blog category',
    }),
    defineField({
      name: 'image',
      title: 'Category Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative Text',
        },
      ],
    }),
    defineField({
      name: 'color',
      title: 'Theme Color',
      type: 'string',
      description: 'Hex color for category theming (e.g., #3B82F6)',
      validation: (Rule) => Rule.regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
        name: 'hex color',
      }).warning('Please use a valid hex color (e.g., #3B82F6)'),
    }),
    defineField({
      name: 'parent',
      title: 'Parent Category',
      type: 'reference',
      to: [{ type: 'blogCategory' }],
      description: 'Select a parent category to create a hierarchy',
    }),
    defineField({
      name: 'featured',
      title: 'Featured Category',
      type: 'boolean',
      initialValue: false,
      description: 'Show this category prominently on the blog homepage',
    }),
    defineField({
      name: 'sortOrder',
      title: 'Sort Order',
      type: 'number',
      description: 'Lower numbers appear first',
      initialValue: 0,
    }),
    defineField({
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      initialValue: true,
      description: 'Inactive categories will be hidden from the frontend',
    }),
    defineField({
      name: 'postCount',
      title: 'Post Count',
      type: 'number',
      description: 'Number of published posts in this category (auto-calculated)',
      readOnly: true,
      initialValue: 0,
    }),
    defineField({
      name: 'rtlDirection',
      title: 'RTL Text Direction',
      type: 'boolean',
      initialValue: true,
      description: 'Enable right-to-left text direction for Persian/Arabic content',
    }),
    defineField({
      name: 'seo',
      title: 'SEO Settings',
      type: 'object',
      fields: [
        {
          name: 'title',
          title: 'SEO Title',
          type: 'string',
          validation: (Rule) => Rule.max(60),
          description: 'Title for search engines (leave empty to use category name)',
        },
        {
          name: 'description',
          title: 'SEO Description',
          type: 'text',
          rows: 3,
          validation: (Rule) => Rule.max(160),
          description: 'Description for search engines (leave empty to use category description)',
        },
        {
          name: 'keywords',
          title: 'Keywords',
          type: 'array',
          of: [{ type: 'string' }],
          options: {
            layout: 'tags',
          },
        },
        {
          name: 'noIndex',
          title: 'No Index',
          type: 'boolean',
          description: 'Prevent search engines from indexing this category',
          initialValue: false,
        },
      ],
      options: {
        collapsible: true,
        collapsed: true,
      },
    }),
  ],
  preview: {
    select: {
      title: 'name',
      media: 'image',
      parentName: 'parent.name',
      isActive: 'isActive',
      postCount: 'postCount',
      color: 'color',
    },
    prepare(selection) {
      const { title, media, parentName, isActive, postCount, color } = selection
      const subtitle = parentName 
        ? `Under ${parentName} • ${postCount} posts ${isActive ? '✅' : '❌'}`
        : `${postCount} posts ${isActive ? '✅' : '❌'}`
      return {
        title,
        subtitle,
        media: media || (color ? { type: 'color', value: color } : null),
      }
    },
  },
  orderings: [
    {
      title: 'Name A-Z',
      name: 'nameAsc',
      by: [{ field: 'name', direction: 'asc' }],
    },
    {
      title: 'Sort Order',
      name: 'sortOrder',
      by: [{ field: 'sortOrder', direction: 'asc' }],
    },
    {
      title: 'Post Count (highest)',
      name: 'postCountDesc',
      by: [{ field: 'postCount', direction: 'desc' }],
    },
    {
      title: 'Created: Newest',
      name: 'createdDesc',
      by: [{ field: '_createdAt', direction: 'desc' }],
    },
  ],
})