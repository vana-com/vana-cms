import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'DataDAOs',

  projectId: 'ubny5ew0',
  dataset: 'moksha',

  plugins: [structureTool(), visionTool()],

  schema: {
    types: schemaTypes,
  },
})
