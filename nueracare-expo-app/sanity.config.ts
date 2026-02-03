import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './sanity/schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'NuraCare',

  projectId:
    process.env.SANITY_STUDIO_PROJECT_ID ||
    process.env.EXPO_PUBLIC_SANITY_PROJECT_ID ||
    'q5maqr3y',
  dataset:
    process.env.SANITY_STUDIO_DATASET ||
    process.env.EXPO_PUBLIC_SANITY_DATASET ||
    'production',

  plugins: [structureTool(), visionTool()],

  schema: {
    types: schemaTypes,
  },
})
