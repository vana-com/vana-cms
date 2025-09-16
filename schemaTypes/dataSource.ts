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
      type: 'array',
      title: 'Data Source Categories',
      description: 'Categories or types of data source (multiple allowed)',
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
      validation: (Rule) => Rule.required().min(1),
    }),

    defineField({
      name: 'valuePerDataPointUSD',
      type: 'number',
      title: 'Value in USD per Data Point',
      description: 'Estimated value in USD for each data point within this Datasource',
      initialValue: 0.00,
      validation: (Rule) => Rule.min(0),
    }),

    defineField({
      name: 'sectorMultiplier',
      type: 'number',
      title: 'Sector Multiplier',
      description: 'Multiplier factor for this data source sector',
      initialValue: 1,
      validation: (Rule) => Rule.min(0),
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
        subtitle: subtitle && subtitle.length > 0 ? `Categories: ${subtitle.join(', ')}` : 'No categories',
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
