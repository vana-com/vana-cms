import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'

const sharedConfig = {
  projectId: 'o4sryq32',
  plugins: [structureTool(), visionTool()],
  schema: {
    types: schemaTypes,
  },
  document: {
    newDocumentOptions: (
      prev: any,
      {creationContext}: {creationContext: {type: string; schemaType?: string}},
    ) => {
      const {type, schemaType} = creationContext
      if (type === 'structure' && schemaType === 'dataDAO') {
        return []
      }
      return prev
    },
  },
}

export default defineConfig([
  {
    ...sharedConfig,
    name: 'mainnet',
    title: 'Mainnet',
    basePath: '/mainnet',
    dataset: 'mainnet',
  },
  {
    ...sharedConfig,
    name: 'moksha',
    title: 'Moksha',
    basePath: '/moksha',
    dataset: 'moksha',
  },
])
