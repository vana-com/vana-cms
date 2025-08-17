import {defineType, defineField} from 'sanity'

export const schema = defineType({
  name: 'schema',
  title: 'Schema',
  type: 'document',
  description: 'Data schema definitions used by data applications',
  fields: [
    defineField({
      name: 'id',
      type: 'number',
      title: 'ID',
      description: 'Numeric identifier for the schema',
      validation: (Rule) => Rule.required().integer().positive(),
    }),

    defineField({
      name: 'dataSource',
      type: 'reference',
      title: 'Data Source',
      description: 'The data source this schema is associated with',
      to: [{type: 'dataSource'}],
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'reclaimProviderId',
      type: 'string',
      title: 'Reclaim Provider ID',
      description: 'UUID of a Reclaim Protocol provider (https://reclaimprotocol.org/), if this schema uses Reclaim',
      validation: (Rule) =>
        Rule.regex(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
          'Must be a valid UUID format'
        ),
    }),
  ],

  preview: {
    select: {
      id: 'id',
      dataSourceName: 'dataSource.dataSourceName',
      media: 'dataSource.dataSourceIcon',
    },
    prepare(selection) {
      const {id, dataSourceName, media} = selection
      return {
        title: `Schema ${id}`,
        subtitle: dataSourceName ? `Data Source: ${dataSourceName}` : 'No data source',
        media,
      }
    },
  },

  orderings: [
    {
      title: 'ID',
      name: 'id',
      by: [{field: 'id', direction: 'asc'}],
    },
    {
      title: 'Creation Date',
      name: 'createdAt',
      by: [{field: '_createdAt', direction: 'desc'}],
    },
  ],
})