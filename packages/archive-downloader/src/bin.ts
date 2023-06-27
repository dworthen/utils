#!/usr/bin/env node

import { existsSync } from 'node:fs'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { Command } from 'commander'
import Handlebars from 'handlebars'

import { downloadArchive } from './downloader/index.js'

type CommandOptions = {
  config?: string
  url?: string
  dest?: string
  platform?: Record<string, string>
  arch?: Record<string, string>
  packageJson?: string
  skip?: boolean
  variables?: Record<string, string>
}

type UrlVariables = {
  name?: string
  version?: string
  platform: string
  arch: string
  platformExt: string
}

async function run(): Promise<void> {
  const packageConfig = JSON.parse(
    await fs.readFile(path.resolve(__dirname, '../package.json'), 'utf-8'),
  )
  const program = new Command()
  await program
    .name('archive-downloader')
    .description('downloads and extracts archive to destination directory.')
    .argument('[source-url]', 'location of archive to download.')
    .argument(
      '[dest]',
      'destination directory of where to extract the archive.',
    )
    .option(
      '-a, --arch <arch-map>',
      'A repeatable mapping of arch',
      parseRecordMapping,
    )
    .option(
      '-p, --platform <platform-os-map>',
      'A repeatable mapping of platform os.',
      parseRecordMapping,
    )
    .option('--no-skip', 'Always install Skip if binary already exists.')
    .option(
      '-v, --variables <variables>',
      'list of key=value variables to make available in the download url.',
      parseRecordMapping,
    )
    .option(
      '-c, --config <configFile>',
      'Load config from a file.',
      './package.json',
    )
    .version(packageConfig.version)
    .action(
      async (sourceUrl?: string, dest?: string, opts: CommandOptions = {}) => {
        const config = await loadConfig(sourceUrl, dest, opts)
        validateConfig(config)
        if (await shouldSkip(config)) {
          console.log(`${config.dest!} already exists. Skipping install.`)
          return
        }
        const variables = await loadVariables(config)
        const url = parseUrl(config.url!, variables)
        console.log(`Downloading archive ${url} to ${config.dest!}`)
        await downloadArchive(url, config.dest!, { force: true })
      },
    )
    .parseAsync()
}

async function shouldSkip(config: CommandOptions): Promise<boolean> {
  return (await existsSync(config.dest!)) && config.skip!
}

function parseRecordMapping(
  val: string,
  previous: Record<string, string> = {},
): Record<string, string> {
  if (val != null && val !== '' && !val.includes('=')) {
    throw Error(`Expect values to be mappings as KEY=VALUE`)
  }

  const [key, value] = val.split('=') as [string, string]
  previous[key] = value
  return previous
}

function requireValue(key: string, mapping: Record<string, unknown>): void {
  if (!(key in mapping) || mapping[key] == null || mapping[key] === '') {
    throw Error(`${key} is a required value.`)
  }
}

function validateConfig(options: CommandOptions): void {
  requireValue('url', options)
  requireValue('dest', options)
}

function parseUrl(url: string, variables: Record<string, string>): string {
  const template = Handlebars.compile(url)
  return template(variables)
}

async function loadVariables(config: CommandOptions): Promise<UrlVariables> {
  const variables: UrlVariables = {
    ...config.variables,
    platform: os.platform(),
    arch: os.arch(),
    platformExt: process.platform === 'win32' ? '.zip' : '.tar.gz',
  }

  if (config.arch != null && variables.arch in config.arch) {
    variables.arch = config.arch[variables.arch] as string
  }

  if (config.platform != null && variables.platform in config.platform) {
    variables.platform = config.platform[variables.platform] as string
  }

  return variables
}

function isRecord(obj: unknown): obj is Record<string, unknown> {
  return obj != null && typeof obj === 'object' && !Array.isArray(obj)
}

function mergeDeep(
  target: unknown,
  ...sources: unknown[]
): Record<string, unknown> {
  if (sources.length === 0) return target as Record<string, unknown>
  const source = sources.shift()

  if (isRecord(target) && isRecord(source)) {
    for (const key in source) {
      if (isRecord(source[key])) {
        if (!(key in target)) Object.assign(target, { [key]: {} })
        mergeDeep(target[key], source[key])
      } else {
        Object.assign(target, { [key]: source[key] })
      }
    }
  }

  return mergeDeep(target, ...sources)
}

async function loadConfig(
  sourceUrl?: string,
  dest?: string,
  opts: CommandOptions = {},
): Promise<CommandOptions> {
  const options = {
    ...opts,
    ...(sourceUrl != null ? { url: sourceUrl } : {}),
    ...(dest != null ? { dest: path.resolve(dest) } : {}),
  }
  if (opts.config != null && opts.config !== '') {
    if (!opts.config.toLowerCase().endsWith('.json')) {
      throw Error(
        `Unable to load ${opts.config}. Only json config files are supported`,
      )
    }
    const configPath = path.resolve(opts.config)
    if (!existsSync(configPath)) {
      throw Error(`${opts.config} does not exist.`)
    }
    const config =
      JSON.parse(await fs.readFile(configPath, 'utf-8'))[
        'archive-downloader'
      ] ?? {}

    return mergeDeep(config, options)
  }
  return options
}

void run()
