import {defineType, defineField} from 'sanity'

export const dataSource = defineType({
  name: 'dataSource',
  title: 'Data Source',
  type: 'document',
  fields: [
    defineField({
      name: 'dataSourceName',
      type: 'string',
      title: 'Data Source Name',
      description: 'Name of the data source (e.g., Amazon, Google, Facebook)',
      validation: (Rule) => Rule.required().max(100),
    }),

    defineField({
      name: 'dataSourceIcon',
      type: 'image',
      title: 'Data Source Icon',
      description: 'Logo or icon representing the data source',
      options: {
        hotspot: true,
      },
    }),

    defineField({
      name: 'dataSourceCategory',
      type: 'string',
      title: 'Data Source Category',
      description: 'Category or type of data source',
      options: {
        list: [
          {title: 'Shopping', value: 'shopping'},
          {title: 'Social Media', value: 'social-media'},
          {title: 'Entertainment', value: 'entertainment'},
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
        layout: 'dropdown',
      },
      validation: (Rule) => Rule.required(),
    }),
  ],

  preview: {
    select: {
      title: 'dataSourceName',
      subtitle: 'dataSourceCategory',
      media: 'dataSourceIcon',
    },
    prepare(selection) {
      const {title, subtitle, media} = selection
      return {
        title,
        subtitle: subtitle ? `Category: ${subtitle}` : 'No category',
        media,
      }
    },
  },

  orderings: [
    {
      title: 'Data Source Name',
      name: 'dataSourceName',
      by: [{field: 'dataSourceName', direction: 'asc'}],
    },
    {
      title: 'Category',
      name: 'dataSourceCategory',
      by: [{field: 'dataSourceCategory', direction: 'asc'}],
    },
  ],
})
