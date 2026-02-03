import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  studioHost: 'nueracare-studio',
  api: {
    projectId:
      process.env.SANITY_STUDIO_PROJECT_ID ||
      process.env.EXPO_PUBLIC_SANITY_PROJECT_ID ||
      '',
    dataset:
      process.env.SANITY_STUDIO_DATASET ||
      process.env.EXPO_PUBLIC_SANITY_DATASET ||
      'production'
  }
})
