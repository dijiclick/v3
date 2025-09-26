import { defineField, defineType } from 'sanity'

export const product = defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  icon: () => '🛍️',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required().max(100),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
      validation: (Rule) => Rule.max(500),
    }),
    defineField({
      name: 'price',
      title: 'Price',
      type: 'number',
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: 'originalPrice',
      title: 'Original Price (for sales)',
      type: 'number',
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'category' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Main Image',
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
      name: 'gallery',
      title: 'Image Gallery',
      type: 'array',
      of: [
        {
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
        },
      ],
      options: {
        layout: 'grid',
      },
    }),
    defineField({
      name: 'rating',
      title: 'Average Rating',
      type: 'number',
      validation: (Rule) => Rule.min(0).max(5),
      initialValue: 0,
    }),
    defineField({
      name: 'reviewCount',
      title: 'Review Count',
      type: 'number',
      validation: (Rule) => Rule.min(0),
      initialValue: 0,
    }),
    defineField({
      name: 'inStock',
      title: 'In Stock',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'stockQuantity',
      title: 'Stock Quantity',
      type: 'number',
      validation: (Rule) => Rule.min(0),
      initialValue: 0,
    }),
    defineField({
      name: 'featured',
      title: 'Featured Product',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags',
      },
    }),
    defineField({
      name: 'specifications',
      title: 'Specifications',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'name',
              title: 'Specification Name',
              type: 'string',
            },
            {
              name: 'value',
              title: 'Value',
              type: 'string',
            },
          ],
        },
      ],
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
        },
        {
          name: 'description',
          title: 'SEO Description',
          type: 'text',
          rows: 3,
          validation: (Rule) => Rule.max(160),
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
      ],
      options: {
        collapsible: true,
        collapsed: true,
      },
    }),

    // ChatGPT-style layout sections
    defineField({
      name: 'layoutStyle',
      title: 'Layout Style',
      type: 'string',
      options: {
        list: [
          { title: 'Standard E-commerce', value: 'ecommerce' },
          { title: 'ChatGPT Style', value: 'chatgpt' },
        ],
      },
      initialValue: 'ecommerce',
      description: 'Choose the layout style for this product page',
    }),

    // Hero Section (for ChatGPT style)
    defineField({
      name: 'heroSection',
      title: 'Hero Section',
      type: 'object',
      fields: [
        {
          name: 'titleOverride',
          title: 'Title Override',
          type: 'string',
          description: 'Custom title for ChatGPT layout (overrides main product title)',
        },
        {
          name: 'subtitle',
          title: 'Subtitle',
          type: 'text',
          rows: 2,
          description: 'Hero section subtitle',
        },
        {
          name: 'heroIcon',
          title: 'Hero Icon/Emoji',
          type: 'string',
          description: 'Emoji or icon for the hero section (e.g., 🤖)',
        },
        {
          name: 'features',
          title: 'Feature List',
          type: 'array',
          of: [{ type: 'string' }],
          description: 'List of key features with checkmarks',
        },
        {
          name: 'rtlDirection',
          title: 'RTL Text Direction',
          type: 'boolean',
          initialValue: false,
          description: 'Enable right-to-left text direction',
        },
      ],
      options: {
        collapsible: true,
        collapsed: true,
      },
      hidden: ({document}) => document?.layoutStyle !== 'chatgpt',
    }),

    // Pricing Plans Section
    defineField({
      name: 'pricingPlans',
      title: 'Pricing Plans',
      type: 'array',
      validation: (Rule) => Rule.custom((value, context) => {
        const layoutStyle = context.document?.layoutStyle;
        if (layoutStyle === 'chatgpt' && (!value || value.length === 0)) {
          return 'At least one pricing plan is required for ChatGPT layout';
        }
        return true;
      }),
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'duration',
              title: 'Duration',
              type: 'string',
              description: 'e.g., "ماهانه", "۳ ماهه", "۶ ماهه"',
            },
            {
              name: 'price',
              title: 'Price',
              type: 'string',
              description: 'e.g., "۱۴۹,۰۰۰ تومان"',
            },
            {
              name: 'priceNumber',
              title: 'Price (Number)',
              type: 'number',
              description: 'Numeric value for calculations',
              validation: (Rule) => Rule.min(0),
            },
            {
              name: 'originalPrice',
              title: 'Original Price (if discounted)',
              type: 'string',
              description: 'e.g., "۲۵۰,۰۰۰ تومان"',
            },
            {
              name: 'originalPriceNumber',
              title: 'Original Price (Number)',
              type: 'number',
              description: 'Numeric value for discount calculations',
              validation: (Rule) => Rule.min(0),
            },
            {
              name: 'isPopular',
              title: 'Popular Plan',
              type: 'boolean',
              initialValue: false,
            },
            {
              name: 'discount',
              title: 'Discount Amount',
              type: 'string',
              description: 'e.g., "تخفیف: ۱۰۱,۰۰۰-"',
            },
          ],
        },
      ],
      hidden: ({document}) => document?.layoutStyle !== 'chatgpt',
    }),

    // Screenshots Section
    defineField({
      name: 'screenshots',
      title: 'Screenshots',
      type: 'array',
      validation: (Rule) => Rule.custom((value, context) => {
        const layoutStyle = context.document?.layoutStyle;
        if (layoutStyle === 'chatgpt' && (!value || value.length === 0)) {
          return 'At least one screenshot is required for ChatGPT layout';
        }
        return true;
      }),
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'title',
              title: 'Screenshot Title',
              type: 'string',
            },
            {
              name: 'description',
              title: 'Description',
              type: 'text',
              rows: 2,
            },
            {
              name: 'gradient',
              title: 'Background Gradient',
              type: 'string',
              description: 'Tailwind gradient classes (e.g., "from-blue-50 to-indigo-100")',
            },
            {
              name: 'icon',
              title: 'Icon/Emoji',
              type: 'string',
              description: 'Emoji or icon for the screenshot',
            },
            {
              name: 'image',
              title: 'Screenshot Image',
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
            },
          ],
        },
      ],
      hidden: ({document}) => document?.layoutStyle !== 'chatgpt',
    }),

    // Sidebar Content
    defineField({
      name: 'sidebarContent',
      title: 'Sidebar Content',
      type: 'object',
      fields: [
        {
          name: 'howItWorks',
          title: 'How It Works Steps',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                {
                  name: 'step',
                  title: 'Step Number',
                  type: 'string',
                },
                {
                  name: 'title',
                  title: 'Step Title',
                  type: 'string',
                },
                {
                  name: 'description',
                  title: 'Step Description',
                  type: 'text',
                  rows: 2,
                },
              ],
            },
          ],
        },
        {
          name: 'faqs',
          title: 'FAQ Items',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                {
                  name: 'question',
                  title: 'Question',
                  type: 'string',
                },
                {
                  name: 'answer',
                  title: 'Answer',
                  type: 'text',
                  rows: 3,
                },
              ],
            },
          ],
        },
        {
          name: 'recommendations',
          title: 'Recommendations',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                {
                  name: 'icon',
                  title: 'Icon/Emoji',
                  type: 'string',
                },
                {
                  name: 'name',
                  title: 'Product Name',
                  type: 'string',
                },
                {
                  name: 'price',
                  title: 'Price',
                  type: 'string',
                },
                {
                  name: 'backgroundColor',
                  title: 'Background Color',
                  type: 'string',
                  description: 'Tailwind color class (e.g., "bg-purple-500")',
                },
              ],
            },
          ],
        },
      ],
      options: {
        collapsible: true,
        collapsed: true,
      },
      hidden: ({document}) => document?.layoutStyle !== 'chatgpt',
    }),

    // Statistics Section
    defineField({
      name: 'statisticsSection',
      title: 'Statistics Section',
      type: 'object',
      fields: [
        {
          name: 'title',
          title: 'Section Title',
          type: 'string',
        },
        {
          name: 'subtitle',
          title: 'Section Subtitle',
          type: 'string',
        },
        {
          name: 'backgroundGradient',
          title: 'Background Gradient',
          type: 'string',
          description: 'Tailwind gradient classes',
        },
        {
          name: 'statistics',
          title: 'Statistics',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                {
                  name: 'value',
                  title: 'Statistic Value',
                  type: 'string',
                  description: 'e.g., "1000+", "99%"',
                },
                {
                  name: 'label',
                  title: 'Statistic Label',
                  type: 'string',
                },
                {
                  name: 'icon',
                  title: 'Icon/Emoji',
                  type: 'string',
                },
              ],
            },
          ],
        },
      ],
      options: {
        collapsible: true,
        collapsed: true,
      },
      hidden: ({document}) => document?.layoutStyle !== 'chatgpt',
    }),

    // Benefits Section
    defineField({
      name: 'benefitsSection',
      title: 'Benefits Section',
      type: 'object',
      fields: [
        {
          name: 'title',
          title: 'Section Title',
          type: 'string',
        },
        {
          name: 'benefits',
          title: 'Benefits',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                {
                  name: 'icon',
                  title: 'Icon/Emoji',
                  type: 'string',
                },
                {
                  name: 'title',
                  title: 'Benefit Title',
                  type: 'string',
                },
                {
                  name: 'description',
                  title: 'Benefit Description',
                  type: 'text',
                  rows: 2,
                },
                {
                  name: 'gradient',
                  title: 'Card Gradient',
                  type: 'string',
                  description: 'Tailwind gradient classes',
                },
              ],
            },
          ],
        },
      ],
      options: {
        collapsible: true,
        collapsed: true,
      },
      hidden: ({document}) => document?.layoutStyle !== 'chatgpt',
    }),

    // Footer CTA Section
    defineField({
      name: 'footerCTA',
      title: 'Footer Call-to-Action',
      type: 'object',
      fields: [
        {
          name: 'title',
          title: 'CTA Title',
          type: 'string',
        },
        {
          name: 'subtitle',
          title: 'CTA Subtitle',
          type: 'string',
        },
        {
          name: 'buttonText',
          title: 'Button Text',
          type: 'string',
        },
        {
          name: 'buttonUrl',
          title: 'Button URL',
          type: 'url',
          description: 'Where the CTA button should link to',
        },
        {
          name: 'supportingLinks',
          title: 'Supporting Links',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                {
                  name: 'text',
                  title: 'Link Text',
                  type: 'string',
                },
                {
                  name: 'url',
                  title: 'Link URL',
                  type: 'url',
                },
              ],
            },
          ],
        },
        {
          name: 'backgroundGradient',
          title: 'Background Gradient',
          type: 'string',
          description: 'Tailwind gradient classes',
        },
      ],
      options: {
        collapsible: true,
        collapsed: true,
      },
      hidden: ({document}) => document?.layoutStyle !== 'chatgpt',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'image',
      price: 'price',
      inStock: 'inStock',
      layoutStyle: 'layoutStyle',
    },
    prepare(selection) {
      const { title, media, price, inStock, layoutStyle } = selection
      const layoutBadge = layoutStyle === 'chatgpt' ? '🎨 ChatGPT' : '🛒 E-commerce'
      return {
        title,
        subtitle: `${layoutBadge} | $${price} ${inStock ? '✅ In Stock' : '❌ Out of Stock'}`,
        media,
      }
    },
  },
  orderings: [
    {
      title: 'Layout Style',
      name: 'layoutStyle',
      by: [{ field: 'layoutStyle', direction: 'asc' }],
    },
    {
      title: 'Title A-Z',
      name: 'titleAsc',
      by: [{ field: 'title', direction: 'asc' }],
    },
    {
      title: 'Title Z-A',
      name: 'titleDesc',
      by: [{ field: 'title', direction: 'desc' }],
    },
    {
      title: 'Price: Low to High',
      name: 'priceAsc',
      by: [{ field: 'price', direction: 'asc' }],
    },
    {
      title: 'Price: High to Low',
      name: 'priceDesc',
      by: [{ field: 'price', direction: 'desc' }],
    },
    {
      title: 'Created: Newest',
      name: 'createdDesc',
      by: [{ field: '_createdAt', direction: 'desc' }],
    },
  ],
})