import {defineType, defineField} from 'sanity'

// Reusable block content configurations
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

export const dataDAO = defineType({
  name: 'dataDAO',
  title: 'Data DAO',
  type: 'document',
  description:
    'DataDAOs are automatically synced from the Vana L1. New DataDAOs can only be created by registering them to the DLP Registry contract, but you can edit the content of existing ones.',
  fieldsets: [
    {
      name: 'basic',
      title: 'Basic Information',
      description: 'Core DataDAO identification and branding',
      options: {collapsible: true, collapsed: false},
    },
    {
      name: 'contact',
      title: 'Contact & Social',
      description: 'Communication channels and social media',
      options: {collapsible: true, collapsed: false},
    },
    {
      name: 'contribution',
      title: 'Data Contribution',
      description: 'How users contribute data and participate',
      options: {collapsible: true, collapsed: false},
    },
    {
      name: 'dataManagement',
      title: 'Data Management',
      description: 'Data sources, schemas, and statistics',
      options: {collapsible: true, collapsed: false},
    },
    {
      name: 'tokenomics',
      title: 'Tokenomics',
      description: 'Token information, pricing, and reward systems',
      options: {collapsible: true, collapsed: false},
    },
    {
      name: 'dataAccess',
      title: 'Data Access & Governance',
      description: 'Data usage permissions and access control',
      options: {collapsible: true, collapsed: false},
    },
  ],
  fields: [
    // Basic Information
    defineField({
      name: 'id',
      type: 'number',
      title: 'ID',
      description: 'Unique identifier for the DataDAO (synced from on-chain)',
      validation: (Rule) => Rule.required().positive().integer(),
      readOnly: true,
      fieldset: 'basic',
    }),

    defineField({
      name: 'name',
      type: 'string',
      title: 'Name',
      description: 'Name of the DataDAO (synced from on-chain, can be manually edited)',
      validation: (Rule) => Rule.required().max(100),
      fieldset: 'basic',
    }),

    defineField({
      name: 'manualNameOverride',
      type: 'boolean',
      title: 'Manual Name Override',
      description: 'When enabled, prevents auto-sync from overwriting the name field',
      initialValue: false,
      fieldset: 'basic',
    }),

    defineField({
      name: 'contractAddress',
      type: 'string',
      title: 'Contract Address',
      description: 'Ethereum contract address for the DataDAO (synced from on-chain)',
      validation: (Rule) =>
        Rule.required().regex(/^0x[a-fA-F0-9]{40}$/, {
          name: 'ethereum-address',
          invert: false,
        }),
      readOnly: true,
      fieldset: 'basic',
    }),

    defineField({
      name: 'icon',
      type: 'image',
      title: 'Icon',
      description: 'Logo or icon for the DataDAO (synced from on-chain, can be manually edited)',
      options: {
        hotspot: true,
      },
      fieldset: 'basic',
    }),

    defineField({
      name: 'manualIconOverride',
      type: 'boolean',
      title: 'Manual Icon Override',
      description: 'When enabled, prevents auto-sync from overwriting the icon field',
      initialValue: false,
      fieldset: 'basic',
    }),

    defineField({
      name: 'website',
      type: 'url',
      title: 'Website',
      description: 'Official website URL (synced from on-chain, can be manually edited)',
      validation: (Rule) =>
        Rule.uri({
          scheme: ['http', 'https'],
        }),
      fieldset: 'basic',
    }),

    defineField({
      name: 'manualWebsiteOverride',
      type: 'boolean',
      title: 'Manual Website Override',
      description: 'When enabled, prevents auto-sync from overwriting the website field',
      initialValue: false,
      fieldset: 'basic',
    }),

    defineField({
      name: 'callToAction',
      type: 'string',
      title: 'Call to Action',
      description:
        'Eg: Join the sleep economy (sleep.fun), Backfill women’s health gaps (Asterisk)',
      validation: (Rule) => Rule.required().max(100),
      fieldset: 'basic',
    }),

    defineField({
      name: 'description',
      type: 'string',
      title: 'Description',
      description:
        'Short description of the DataDAO (synced from on-chain, can be manually edited)',
      validation: (Rule) => Rule.required().max(1000),
      fieldset: 'basic',
    }),

    defineField({
      name: 'manualDescriptionOverride',
      type: 'boolean',
      title: 'Manual Description Override',
      description: 'When enabled, prevents auto-sync from overwriting the description field',
      initialValue: false,
      fieldset: 'basic',
    }),

    defineField({
      name: 'activelyBuilding',
      type: 'boolean',
      title: 'Actively Building',
      description: 'Whether this DataDAO is actively building on the Vana network',
      initialValue: false,
      fieldset: 'basic',
    }),

    // Contact Information
    defineField({
      name: 'email',
      type: 'string',
      title: 'Email',
      description: 'Contact email for the DataDAO',
      validation: (Rule) => Rule.email(),
      fieldset: 'contact',
    }),

    defineField({
      name: 'twitter',
      type: 'string',
      title: 'Twitter (X) Handle',
      description: 'Eg: @sleepfun',
      validation: (Rule) =>
        Rule.regex(/^@[A-Za-z0-9_]+$/, {
          name: 'twitter-handle',
          invert: false,
        }),
      fieldset: 'contact',
    }),

    defineField({
      name: 'telegram',
      type: 'url',
      title: 'Telegram',
      description: 'Telegram group or channel URL',
      validation: (Rule) =>
        Rule.uri({
          scheme: ['http', 'https'],
        }),
      fieldset: 'contact',
    }),

    defineField({
      name: 'discord',
      type: 'url',
      title: 'Discord',
      description: 'Discord server invite URL',
      validation: (Rule) =>
        Rule.uri({
          scheme: ['http', 'https'],
        }),
      fieldset: 'contact',
    }),

    // Contribution Information
    defineField({
      name: 'contributionSteps',
      type: 'array',
      title: 'Contribution Steps',
      description: 'Step-by-step guide on how to contribute data',
      fieldset: 'contribution',
      of: [richTextBlock, imageBlock],
    }),

    defineField({
      name: 'frequencyOfContribution',
      type: 'string',
      title: 'Frequency of Contribution',
      initialValue: 'unspecified',
      description: 'How often users can contribute data',
      options: {
        list: [
          {title: 'Unspecified', value: 'unspecified'},
          {title: 'Daily', value: 'daily'},
          {title: 'Weekly', value: 'weekly'},
          {title: 'Monthly', value: 'monthly'},
          {title: 'One-time', value: 'one-time'},
          {title: 'Continuous', value: 'continuous'},
        ],
      },
      fieldset: 'contribution',
    }),

    defineField({
      name: 'isVerified',
      type: 'boolean',
      title: 'Is Verified',
      description: 'Is this DataDAO verified? (synced from on-chain)',
      initialValue: false,
      readOnly: true,
      fieldset: 'contribution',
    }),


    defineField({
      name: 'proofOfContributionStructure',
      type: 'array',
      title: 'Proof of Contribution Structure',
      description: 'Documentation of how contributions are validated',
      of: [richTextBlock, imageBlock],
      fieldset: 'contribution',
    }),

    // Data Sources
    defineField({
      name: 'dataSources',
      type: 'array',
      title: 'Data Sources',
      description: 'List of data sources this DataDAO accepts',
      of: [
        {
          type: 'reference',
          to: [{type: 'dataSource'}],
        },
      ],
      fieldset: 'dataManagement',
    }),

    // Data Information
    defineField({
      name: 'dataName',
      type: 'string',
      title: 'Data Name',
      description:
        'Name of the refined dataset (auto-synced from refiner schema, can be manually edited)',
      fieldset: 'dataManagement',
    }),

    defineField({
      name: 'manualDataNameOverride',
      type: 'boolean',
      title: 'Manual Data Name Override',
      description: 'When enabled, prevents auto-sync from overwriting the data name field',
      initialValue: false,
      fieldset: 'dataManagement',
    }),

    defineField({
      name: 'dataDescription',
      type: 'string',
      title: 'Data Description',
      description:
        'Description of the type of data collected (auto-synced from refiner schema, can be manually edited)',
      fieldset: 'dataManagement',
    }),

    defineField({
      name: 'manualDataDescriptionOverride',
      type: 'boolean',
      title: 'Manual Data Description Override',
      description: 'When enabled, prevents auto-sync from overwriting the data description field',
      initialValue: false,
      fieldset: 'dataManagement',
    }),

    defineField({
      name: 'refinerId',
      type: 'number',
      title: 'Refiner ID',
      description: 'ID of the latest refiner (auto-synced from subgraph)',
      readOnly: true,
      fieldset: 'dataManagement',
    }),

    defineField({
      name: 'dataSchemaRefined',
      type: 'url',
      title: 'Data Schema (Refined)',
      description: 'URL to IPFS or documentation of refined data schema',
      readOnly: true,
      fieldset: 'dataManagement',
    }),

    defineField({
      name: 'dataSampleRefined',
      type: 'file',
      title: 'Data Sample (Refined)',
      description: 'Sample sqlite/libsql file showing 100 rows of refined dummy data',
      options: {
        accept: '.db,.sqlite,.libsql',
      },
      fieldset: 'dataManagement',
    }),

    defineField({
      name: 'dataSchemaUnrefined',
      type: 'array',
      title: 'Data Schema (Unrefined)',
      description:
        'Documentation of the unrefined data schema (eg: https://docs.ykyr.org/docs/data-schema)',
      of: [richTextBlock, imageBlock],
      fieldset: 'dataManagement',
    }),

    defineField({
      name: 'dataSampleUnrefined',
      type: 'file',
      title: 'Data Sample (Unrefined)',
      description: 'Sample file showing 100 rows of unrefined dummy data',
      options: {
        accept: '.zip,.json,.csv,.txt,',
      },
      fieldset: 'dataManagement',
    }),

    defineField({
      name: 'contributorCount',
      type: 'number',
      title: 'Contributor Count',
      description: 'Number of contributors (synced from on-chain)',
      readOnly: true,
      initialValue: 0,
      fieldset: 'dataManagement',
    }),

    defineField({
      name: 'filesCount',
      type: 'number',
      title: 'Files Count',
      description: 'Number of files in the dataset (synced from on-chain)',
      readOnly: true,
      initialValue: 0,
      fieldset: 'dataManagement',
    }),

    defineField({
      name: 'populationStatistics',
      type: 'array',
      title: 'Population Statistics of Contributors',
      description:
        'Summary numbers that describe the entire group (the "population") the data represents — not just a sample. These are often used to give a big-picture view of the dataset’s shape, spread, and central tendencies.',
      of: [richTextBlock, imageBlock],
      fieldset: 'dataManagement',
    }),

    // Tokenomics

    defineField({
      name: 'token',
      type: 'reference',
      title: 'Associated Token',
      description: 'Token associated with this DataDAO (optional two-way relationship)',
      to: [{type: 'token'}],
      fieldset: 'tokenomics',
    }),

    defineField({
      name: 'tokenomicsRewardMechanics',
      type: 'array',
      title: 'Tokenomics (Reward Mechanics)',
      description: 'How rewards are distributed to contributors',
      of: [richTextBlock, imageBlock],
      fieldset: 'tokenomics',
    }),

    defineField({
      name: 'tokenomicsMacro',
      type: 'array',
      title: 'Tokenomics (Macro)',
      description: 'High-level tokenomics breakdown',
      of: [richTextBlock, imageBlock],
      fieldset: 'tokenomics',
    }),

    defineField({
      name: 'preMinePointsInformation',
      type: 'array',
      title: 'Pre-Mine / Points Information',
      description: 'Information about pre-mining or points system',
      of: [richTextBlock, imageBlock],
      fieldset: 'tokenomics',
    }),

    defineField({
      name: 'valuePerDataPointUSD',
      type: 'number',
      title: 'Value in USD per Data Point',
      description: 'Estimated value in USD for each data point within this DataDAO',
      initialValue: 0.00,
      validation: (Rule) => Rule.min(0),
      fieldset: 'tokenomics',
    }),

    defineField({
      name: 'fdvDiscountPct',
      type: 'number',
      title: 'FDV Discount Percentage',
      description: 'Percentage reduction applied to FDV',
      initialValue: 0,
      validation: (Rule) => Rule.min(0).max(100),
      fieldset: 'tokenomics',
    }),

    // Data Access
    defineField({
      name: 'operationsAllowed',
      type: 'array',
      title: 'Operations Allowed',
      description: 'What operations can be performed with the data',
      of: [richTextBlock, imageBlock],
      fieldset: 'dataAccess',
    }),

    defineField({
      name: 'termsOfAccess',
      type: 'array',
      title: 'Terms of Access / Restrictions',
      description: 'Terms and restrictions for data access',
      of: [richTextBlock, imageBlock],
      fieldset: 'dataAccess',
    }),

    defineField({
      name: 'menuOfTemplateAccess',
      type: 'array',
      title: 'Menu of Template Access',
      description:
        'If a DataDAO has passed resolutions granting standardized access for a standardized fee, they can put these terms here.',
      of: [richTextBlock, imageBlock],
      fieldset: 'dataAccess',
    }),
  ],

  preview: {
    select: {
      title: 'name',
      tokenSymbol: 'token.tokenSymbol',
      media: 'icon',
    },
    prepare(selection) {
      const {title, tokenSymbol, media} = selection
      return {
        title,
        subtitle: tokenSymbol ? `Token: ${tokenSymbol}` : 'No associated token',
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
      title: 'ID',
      name: 'id',
      by: [{field: 'id', direction: 'asc'}],
    },
  ],
})
