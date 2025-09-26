import { defineField, defineType } from 'sanity'

export const tag = defineType({
  name: 'tag',
  title: 'Tag',
  type: 'document',
  icon: () => '🏷️',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required().max(30),
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
      rows: 2,
      validation: (Rule) => Rule.max(200),
      description: 'Brief description of this tag',
    }),
    defineField({
      name: 'color',
      title: 'Tag Color',
      type: 'string',
      description: 'Hex color for tag styling (e.g., #3B82F6)',
      validation: (Rule) => Rule.regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
        name: 'hex color',
      }).warning('Please use a valid hex color (e.g., #3B82F6)'),
    }),
    defineField({
      name: 'featured',
      title: 'Featured Tag',
      type: 'boolean',
      initialValue: false,
      description: 'Show this tag prominently in tag clouds and filters',
    }),
    defineField({
      name: 'postCount',
      title: 'Post Count',
      type: 'number',
      description: 'Number of published posts with this tag (auto-calculated)',
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
          description: 'Title for search engines (leave empty to use tag name)',
        },
        {
          name: 'description',
          title: 'SEO Description',
          type: 'text',
          rows: 3,
          validation: (Rule) => Rule.max(160),
          description: 'Description for search engines (leave empty to use tag description)',
        },
        {
          name: 'noIndex',
          title: 'No Index',
          type: 'boolean',
          description: 'Prevent search engines from indexing this tag page',
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
      color: 'color',
      postCount: 'postCount',
      featured: 'featured',
    },
    prepare(selection) {
      const { title, color, postCount, featured } = selection
      return {
        title,
        subtitle: `${postCount} posts ${featured ? '⭐ Featured' : ''}`,
        media: color || '🏷️',
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