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
      name: 'shortDescription',
      type: 'string',
      title: 'Short Description',
      description: 'Brief description of the app (50 characters max)',
      validation: (Rule) => Rule.required().max(50),
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
      name: 'appUrl',
      type: 'url',
      title: 'App URL',
      description: 'URL to access the data app',
      validation: (Rule) =>
        Rule.required().uri({
          scheme: ['http', 'https'],
        }),
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
