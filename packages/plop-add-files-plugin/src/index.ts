import { existsSync } from 'node:fs'
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import { dirname, extname, relative, resolve } from 'node:path'

import { generateLogger } from '@d-dev/logger'
import glob from 'glob'
import type { NodePlopAPI } from 'plop'

const log = generateLogger('@d-dev/plop-add-files-plugin')

export type AddFilesOptions = {
  type: 'addFiles'
  templateFiles: string
  destination: string
  base?: string
  verbose?: boolean
  force: boolean
  skip?: SkipFunction
  skipIfExists?: boolean
  globOptions?: glob.IOptions
  skipTemplating?: SkipFunction
  stripExtensions?: string[]
}

export type SkipFunction = (
  src: string,
  dest: string,
  answers: Record<string, unknown>,
  config: Record<string, unknown>,
) => boolean

export default async function (plop: NodePlopAPI): Promise<void> {
  plop.setHelper('echo', (txt) => txt)
  plop.setHelper('tif', function (...args) {
    const conditions = args.slice(0, -1)
    if (conditions[0] != null) {
      return conditions[1] ?? conditions[0]
    } else {
      return conditions[2] ?? ''
    }
  })

  plop.setActionType('addFiles', async function addFiles(answers, c, plop) {
    const config = c as unknown as AddFilesOptions
    if (config.verbose === true) {
      log.enable()
    }

    log('Answers: %O', answers)
    log('Config: %O', config)

    if (config.templateFiles == null || config.templateFiles === '') {
      throw new Error('Missing required config option templateFiles')
    }

    const templateFiles = glob.sync(config.templateFiles, {
      cwd: process.cwd(),
      ...(config.globOptions ?? {}),
      absolute: false,
    })

    const ouputPath = resolve(
      process.cwd(),
      plop.renderString(config.destination ?? './', answers),
    )
    const basePath = plop.renderString(config.base ?? '', answers)
    const destinationFiles = templateFiles.reduce<Record<string, string>>(
      (acc, cur) => {
        const filePath = (config.stripExtensions ?? ['.hbs']).reduce(
          (acc: string, cur: string) => {
            return acc.replace(new RegExp(cur, 'i'), '')
          },
          plop.renderString(cur, answers),
        )

        if (filePath.split('/').some((el: string) => el === '')) {
          return acc
        }

        const destinationPath = resolve(ouputPath, relative(basePath, filePath))

        if (
          typeof config.skip === 'function' &&
          config.skip(cur, destinationPath, answers, config)
        ) {
          log(
            'Skip function returned true. Skip scaffolding %s to %s',
            cur,
            destinationPath,
          )
          return acc
        }

        if (
          existsSync(destinationPath) &&
          !config.force &&
          config.skipIfExists !== true
        ) {
          throw new Error(
            `${destinationPath} already exists. Use force option to overwrite or skipIfExists option to skip this file.`,
          )
        }

        if (!existsSync(destinationPath) || config.force) {
          acc[resolve(config.globOptions?.cwd ?? process.cwd(), cur)] =
            destinationPath
        }

        return acc
      },
      {},
    )

    log('Files to scaffold: %O', destinationFiles)

    const results = Object.entries(destinationFiles).map(
      async ([src, dest]) => {
        return await createFile(src, dest, answers, config, plop)
      },
    )

    ;(await Promise.all(results)).forEach((result) => {
      log(result)
    })

    return 'Success'
  })

  plop.setDefaultInclude({
    actionTypes: true,
    helpers: true,
    generators: true,
    partials: true,
  })
}

async function createFile(
  src: string,
  dest: string,
  answers: Record<string, unknown>,
  config: Record<string, unknown>,
  plop: NodePlopAPI,
): Promise<string> {
  const templatingExtension = config['templatingExtension'] ?? '.hbs'
  const skipTemplating = (config['skipTemplating'] ??
    ((src: string) => {
      return extname(src) !== templatingExtension
    })) as SkipFunction

  const stats = await stat(src)

  log(
    stats.isDirectory() ? 'Scaffolding directory: %s' : 'Scaffolding file: %s',
    src,
  )

  await mkdir(stats.isDirectory() ? dest : dirname(dest), { recursive: true })

  if (stats.isFile()) {
    const shouldSkipTemplating = skipTemplating(src, dest, answers, config)
    const fileContents = await readFile(src, 'utf-8')
    const contents = !shouldSkipTemplating
      ? plop.renderString(fileContents, answers)
      : fileContents

    log(
      shouldSkipTemplating
        ? 'Skip templating for %s'
        : 'Apply templating to %s',
      src,
    )
    await writeFile(dest, contents, 'utf-8')
  }
  return `Created ${dest}`
}
