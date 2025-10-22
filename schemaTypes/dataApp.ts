import {defineType, defineField} from 'sanity'

// Reusable rich text block configuration
const richTextBlock = {
  type: 'block',
  styles: [
    {title: 'Normal', value: 'normal'},
    {title: 'H1', value: 'h1'},
    {title: 'H2', value: 'h2'},
    {title: 'H3', value: 'h3'},
    {title: 'Quote', value: 'blockquote'},
  ],
  lists: [
    {title: 'Bullet', value: 'bullet'},
    {title: 'Numbered', value: 'number'},
  ],
  marks: {
    decorators: [
      {title: 'Strong', value: 'strong'},
      {title: 'Emphasis', value: 'em'},
      {title: 'Code', value: 'code'},
    ],
    annotations: [
      {
        title: 'URL',
        name: 'link',
        type: 'object',
        fields: [
          {
            title: 'URL',
            name: 'href',
            type: 'url',
          },
        ],
      },
    ],
  },
}

const imageBlock = {
  type: 'image',
  options: {hotspot: true},
  fields: [
    {
      name: 'alt',
      type: 'string',
      title: 'Alternative Text',
    },
  ],
}

export const dataApp = defineType({
  name: 'dataApp',
  title: 'Data App',
  type: 'document',
  description: 'Applications built on top of data from Vana DataDAOs',
  fields: [
    defineField({
      name: 'name',
      type: 'string',
      title: 'Name',
      description: 'Name of the data app',
      validation: (Rule) => Rule.required().max(30),
    }),

    defineField({
      name: 'id',
      type: 'string',
      title: 'App ID',
      description:
        'Unique identifier using reverse domain notation (e.g., com.vana.netflix-wrapped)',
      validation: (Rule) =>
        Rule.required().regex(
          /^[a-z0-9]+(\.[a-z0-9-]+)*\.[a-z0-9-]+$/,
          'Must follow reverse domain notation (e.g., com.vana.netflix-wrapped)',
        ),
    }),

    defineField({
      name: 'shortDescription',
      type: 'string',
      title: 'Short Description',
      description: 'Brief description of the app (50 characters max)',
      validation: (Rule) => Rule.required().max(50),
    }),

    defineField({
      name: 'status',
      type: 'string',
      title: 'Status',
      description: 'Current status of the data app in the review process',
      initialValue: 'draft',
      options: {
        list: [
          {title: 'Draft', value: 'draft'},
          {title: 'In Review', value: 'in_review'},
          {title: 'Approved', value: 'approved'},
          {title: 'Rejected', value: 'rejected'},
        ],
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'longDescription',
      type: 'array',
      title: 'Long Description',
      description: 'Detailed description of the app with rich text formatting',
      of: [richTextBlock, imageBlock],
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'icon',
      type: 'image',
      title: 'Icon',
      description: 'Logo or icon for the data app',
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'banner',
      type: 'image',
      title: 'Banner',
      description: 'Banner image for the data app',
      options: {
        hotspot: true,
      },
    }),

    defineField({
      name: 'schema',
      type: 'reference',
      title: 'Schema',
      description: 'The data schema used by this app',
      to: [{type: 'schema'}],
    }),

    defineField({
      name: 'appUrl',
      type: 'url',
      title: 'App URL',
      description: 'URL to access the data app',
      validation: (Rule) =>
        Rule.required().uri({
          scheme: ['http', 'https'],
        }),
    }),

    defineField({
      name: 'authorizedUrls',
      type: 'array',
      title: 'Authorized URLs',
      description: 'All development and production URLs for this app',
      of: [
        {
          type: 'url',
          validation: (Rule) =>
            Rule.uri({
              scheme: ['http', 'https'],
            }),
        },
      ],
    }),

    defineField({
      name: 'tags',
      type: 'array',
      title: 'Tags',
      description: 'Select tags to categorize and promote this app',
      of: [
        {
          type: 'string',
          options: {
            list: [
              {title: 'Top', value: 'top'},
              {title: 'Featured', value: 'featured'},
              {title: 'New', value: 'new'},
              {title: 'Coming Soon', value: 'coming-soon'},
            ],
          },
        },
      ],
    }),

    defineField({
      name: 'grantee',
      type: 'number',
      title: 'Data Permission Grantee',
      description: 'ID of the grantee for data portability operations',
      validation: (Rule) => Rule.integer().min(0),
    }),

    defineField({
      name: 'encryptedPrivateKey',
      type: 'text',
      title: 'Encrypted Private Key',
      description:
        'The secure identity key for this app. When users grant this app permission to access their data, they authorize this specific key. The app uses it to connect to users\' personal servers and retrieve their data. For security, this key is encrypted with the Vana App\'s public key.',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'category',
      type: 'array',
      title: 'Categories',
      description: 'Categories or types of data app (multiple allowed)',
      of: [
        {
          type: 'string',
          options: {
            list: [
              {title: 'Shopping', value: 'shopping'},
              {title: 'Social Media', value: 'social-media'},
              {title: 'Entertainment', value: 'entertainment'},
              {title: 'Music', value: 'music'},
              {title: 'Finance & Trading', value: 'finance-trading'},
              {title: 'Health & Fitness', value: 'health-fitness'},
              {title: 'Travel', value: 'travel'},
              {title: 'Productivity', value: 'productivity'},
              {title: 'Communication', value: 'communication'},
              {title: 'Education', value: 'education'},
              {title: 'Gaming', value: 'gaming'},
              {title: 'News & Media', value: 'news-media'},
              {title: 'Transportation', value: 'transportation'},
              {title: 'Food & Dining', value: 'food-dining'},
              {title: 'Professional', value: 'professional'},
              {title: 'IoT & Devices', value: 'iot-devices'},
              {title: 'Other', value: 'other'},
            ],
          },
        },
      ],
    }),

    defineField({
      name: 'lastStatusUpdatedDate',
      type: 'datetime',
      title: 'Last Status Updated Date',
      description: 'Timestamp when the status field was last changed (e.g., draft -> in_review)',
    }),

    defineField({
      name: 'createdByUserId',
      type: 'string',
      title: 'Created By User ID',
      description: 'Vana App user ID of the creator',
    }),

    defineField({
      name: 'appCreationSeedPrompt',
      type: 'text',
      title: 'App Creation Seed Prompt',
      description: 'The prompt used to seed the app creation process',
    }),

    defineField({
      name: 'discordUsername',
      type: 'string',
      title: 'Discord Username',
    }),
    defineField({
      name: 'twitterHandle',
      type: 'string',
      title: 'Twitter Handle',
    }),
  ],

  preview: {
    select: {
      title: 'name',
      subtitle: 'shortDescription',
      media: 'icon',
    },
    prepare(selection) {
      const {title, subtitle, media} = selection
      return {
        title: title || 'Untitled Data App',
        subtitle: subtitle || 'No description',
        media,
      }
    },
  },

  orderings: [
    {
      title: 'Name',
      name: 'name',
      by: [{field: 'name', direction: 'asc'}],
    },
    {
      title: 'Creation Date',
      name: 'createdAt',
      by: [{field: '_createdAt', direction: 'desc'}],
    },
  ],
})
