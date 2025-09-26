import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'local-dev',
    dataset: process.env.SANITY_STUDIO_DATASET || 'development'
  },
  studioHost: 'localhost'
})