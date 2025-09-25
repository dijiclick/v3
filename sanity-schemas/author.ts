import { defineField, defineType } from 'sanity'

export const author = defineType({
  name: 'author',
  title: 'Author',
  type: 'document',
  icon: () => '👤',
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
      name: 'bio',
      title: 'Bio',
      type: 'text',
      rows: 4,
      validation: (Rule) => Rule.max(500),
      description: 'Brief biography of the author',
    }),
    defineField({
      name: 'avatar',
      title: 'Avatar Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative Text',
          validation: (Rule) => Rule.required(),
        },
      ],
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'email',
      description: 'Author email (not displayed publicly)',
    }),
    defineField({
      name: 'jobTitle',
      title: 'Job Title',
      type: 'string',
      description: 'Author\'s job title or role',
    }),
    defineField({
      name: 'company',
      title: 'Company',
      type: 'string',
      description: 'Author\'s company or organization',
    }),
    defineField({
      name: 'socialMedia',
      title: 'Social Media Links',
      type: 'object',
      fields: [
        {
          name: 'website',
          title: 'Website',
          type: 'url',
          description: 'Personal or professional website',
        },
        {
          name: 'twitter',
          title: 'Twitter',
          type: 'string',
          description: 'Twitter username (without @)',
          validation: (Rule) => Rule.regex(/^[A-Za-z0-9_]+$/, {
            name: 'twitter username',
          }).warning('Please enter a valid Twitter username without @'),
        },
        {
          name: 'linkedin',
          title: 'LinkedIn',
          type: 'url',
          description: 'LinkedIn profile URL',
        },
        {
          name: 'github',
          title: 'GitHub',
          type: 'string',
          description: 'GitHub username',
          validation: (Rule) => Rule.regex(/^[A-Za-z0-9-]+$/, {
            name: 'github username',
          }).warning('Please enter a valid GitHub username'),
        },
        {
          name: 'instagram',
          title: 'Instagram',
          type: 'string',
          description: 'Instagram username (without @)',
          validation: (Rule) => Rule.regex(/^[A-Za-z0-9_.]+$/, {
            name: 'instagram username',
          }).warning('Please enter a valid Instagram username without @'),
        },
        {
          name: 'telegram',
          title: 'Telegram',
          type: 'string',
          description: 'Telegram username (without @)',
          validation: (Rule) => Rule.regex(/^[A-Za-z0-9_]+$/, {
            name: 'telegram username',
          }).warning('Please enter a valid Telegram username without @'),
        },
      ],
      options: {
        collapsible: true,
        collapsed: true,
      },
    }),
    defineField({
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      initialValue: true,
      description: 'Inactive authors will be hidden from the frontend',
    }),
    defineField({
      name: 'featured',
      title: 'Featured Author',
      type: 'boolean',
      initialValue: false,
      description: 'Show this author prominently on the team/authors page',
    }),
    defineField({
      name: 'postCount',
      title: 'Post Count',
      type: 'number',
      description: 'Number of published posts by this author (auto-calculated)',
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
          description: 'Title for search engines (leave empty to use author name)',
        },
        {
          name: 'description',
          title: 'SEO Description',
          type: 'text',
          rows: 3,
          validation: (Rule) => Rule.max(160),
          description: 'Description for search engines (leave empty to use bio)',
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
          description: 'Prevent search engines from indexing this author page',
          initialValue: false,
        },
      ],
      options: {
        collapsible: true,
        collapsed: true,
      },
    }),
    defineField({
      name: 'authorSchema',
      title: 'Author Schema Markup',
      type: 'object',
      fields: [
        {
          name: 'jobTitle',
          title: 'Job Title for Schema',
          type: 'string',
          description: 'Job title for structured data (leave empty to use main job title)',
        },
        {
          name: 'worksFor',
          title: 'Works For',
          type: 'string',
          description: 'Organization name for structured data (leave empty to use company)',
        },
        {
          name: 'knowsAbout',
          title: 'Knows About',
          type: 'array',
          of: [{ type: 'string' }],
          description: 'Topics this author is knowledgeable about',
          options: {
            layout: 'tags',
          },
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
      media: 'avatar',
      jobTitle: 'jobTitle',
      company: 'company',
      isActive: 'isActive',
      postCount: 'postCount',
    },
    prepare(selection) {
      const { title, media, jobTitle, company, isActive, postCount } = selection
      const subtitle = [
        jobTitle,
        company && `at ${company}`,
        `${postCount} posts`,
        isActive ? '✅' : '❌',
      ].filter(Boolean).join(' • ')
      
      return {
        title,
        subtitle,
        media,
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