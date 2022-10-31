// @ts-check
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import addFiles from '@d-dev/plop-add-files-plugin'
import type { NodePlopAPI } from 'plop'

/* eslint-disable-next-line */
const __dirname = dirname(fileURLToPath(import.meta.url))
export default async function (plop: NodePlopAPI): Promise<void> {
  plop.setWelcomeMessage('Select workspace to scaffold')
  await addFiles(plop)

  plop.setGenerator('monorepo', {
    description: 'scaffold monorepo',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'project name',
      },
    ],
    actions: function (data) {
      const actions = []

      data = data ?? {}

      actions.push({
        type: 'addFiles',
        templateFiles: './templates/monorepo/**/*',
        destination: './{{name}}/',
        base: 'templates/monorepo/',
        verbose: true,
        force: false,
        skipIfExists: true,
        globOptions: {
          cwd: join(__dirname, '../'),
          dot: true,
        },
      })

      return actions
    },
  })
}
