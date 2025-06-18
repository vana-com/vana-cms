import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  studioHost: 'vana',
  api: {
    projectId: 'o4sryq32',
    dataset: 'mainnet',
  },
  /**
   * Enable auto-updates for studios.
   * Learn more at https://www.sanity.io/docs/cli#auto-updates
   */
  autoUpdates: true,
})
