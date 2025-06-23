import {defineType, defineField} from 'sanity'

export const token = defineType({
  name: 'token',
  title: 'Token',
  type: 'document',
  description: 'Token information that can be associated with DataDAOs or exist independently',
  fields: [
    defineField({
      name: 'tokenContract',
      type: 'string',
      title: 'Token Contract Address',
      description: 'Ethereum contract address for the token (synced from on-chain if token is associated with a DataDAO)',
      validation: (Rule) =>
        Rule.required().regex(/^0x[a-fA-F0-9]{40}$/, {
          name: 'ethereum-address',
          invert: false,
        }),
    }),

    defineField({
      name: 'tokenSymbol',
      type: 'string',
      title: 'Token Symbol',
      description: 'Token symbol (e.g., BOPS)',
      validation: (Rule) => Rule.required().max(10),
    }),

    defineField({
      name: 'tokenName',
      type: 'string',
      title: 'Token Name',
      description: 'Token name (synced from on-chain if token is associated with a DataDAO, can be manually edited)',
      validation: (Rule) => Rule.max(100),
    }),

    defineField({
      name: 'icon',
      type: 'image',
      title: 'Token Icon',
      description: 'Logo or icon for the token (synced from on-chain if token is associated with a DataDAO, can be manually edited)',
      options: {
        hotspot: true,
      },
    }),

    defineField({
      name: 'description',
      type: 'string',
      title: 'Token Description',
      description: 'Description of the token and its purpose (synced from on-chain if token is associated with a DataDAO, can be manually edited)',
      validation: (Rule) => Rule.max(1000),
    }),

    defineField({
      name: 'associatedDataDAO',
      type: 'reference',
      title: 'Associated DataDAO',
      description: 'DataDAO that uses this token (optional - should only be set for VRC-20 tokens associated with a DataDAO)',
      to: [{type: 'dataDAO'}],
    }),
  ],

  preview: {
    select: {
      title: 'tokenSymbol',
      subtitle: 'tokenContract',
      media: 'icon',
    },
    prepare(selection) {
      const {title, subtitle, media} = selection
      return {
        title: title || 'Untitled Token',
        subtitle: subtitle ? `${subtitle.slice(0, 20)}...` : 'No contract address',
        media,
      }
    },
  },

  orderings: [
    {
      title: 'Token Symbol',
      name: 'tokenSymbol',
      by: [{field: 'tokenSymbol', direction: 'asc'}],
    },
    {
      title: 'Contract Address',
      name: 'tokenContract',
      by: [{field: 'tokenContract', direction: 'asc'}],
    },
  ],
})