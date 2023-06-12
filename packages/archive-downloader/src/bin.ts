#!/usr/bin/env node

import { existsSync } from 'node:fs'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { Command } from 'commander'
import { findUp } from 'find-up'
import Handlebars from 'handlebars'

import packageConfig from '../package.json' assert { type: 'json' }
import { downloadArchive } from './downloader/index.js'

const program = new Command()

type CommandOptions = {
  config?: string
  url?: string
  dest?: string
  platform?: Record<string, string>
  arch?: Record<string, string>
  packageJson?: string
}

type UrlVariables = {
  name?: string
  version?: string
  platform: string
  arch: string
  platformExt: string
}

program
  .name('archive-downloader')
  .description('downloads and extracts archive to destination directory.')
  .argument('[source-url]', 'location of archive to download.')
  .argument('[dest]', 'destination directory of where to extract the archive.')
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
  .option(
    '-c, --config <configFile>',
    'Load config from a file.',
    './package.json',
  )
  .option(
    '-k, --package-json <packageJson>',
    'package.json path to load version and name variables. Defaults to finding the nearest parent package.json file.',
  )
  .version(packageConfig.version)
  .action(
    async (sourceUrl?: string, dest?: string, opts: CommandOptions = {}) => {
      const config = await loadConfig(sourceUrl, dest, opts)
      validateConfig(config)
      const variables = await loadVariables(config)
      const url = parseUrl(config.url!, variables)
      await downloadArchive(url, config.dest!)
    },
  )

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

  const packageJsonPath =
    config.packageJson != null
      ? path.resolve(config.packageJson)
      : await findUp('package.json')

  if (packageJsonPath != null) {
    const pkgJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'))
    variables.name = pkgJson.name
    variables.version = pkgJson.version
  }
  return variables
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

    if (config.dest != null && config.dest !== '') {
      const configDir = path.dirname(configPath)
      config.dest = path.resolve(configDir, config.dest)
    }

    options.url = options.url ?? config.url
    options.dest = options.dest ?? config.dest
    options.platform = {
      ...config.platform,
      ...options.platform,
    }
    options.arch = {
      ...config.arch,
      ...options.arch,
    }
  }
  return options
}

program.parse()
