#!/usr/bin/env node

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import usedPm from 'used-pm'

import { download } from './download.js'
import type { Config } from './types.js'

async function run() {
  const localFilepath = path.resolve(os.homedir(), 'bin-install-test.json')
  writeFileSync(
    localFilepath,
    JSON.stringify(process.env, undefined, 2),
    'utf-8',
  )

  const configPath = path.resolve(process.argv[2] ?? './package.json')
  const config = loadConfig(configPath)
  config.tempDir = config.tempDir ?? path.resolve('./bin-install-temp')
  config.destDir = config.destDir ?? getDestDir()
  const downloadInfo = await download(config)
  console.log(
    `Successfully downloaded ${downloadInfo.binaryName} to ${downloadInfo.destDir}`,
  )
}

function loadConfig(filepath: string): Config {
  if (!existsSync(filepath)) {
    throw new Error(`bin-install: Config path not found: ${filepath}`)
  }

  const fileContents = readFileSync(filepath, 'utf-8')
  const config = JSON.parse(fileContents)

  if (!('bin-install' in config)) {
    throw new Error(
      `bin-install: Config file, ${filepath} does not contain "bin-install" config key.`,
    )
  }

  return config['bin-install'] as Config
}

function getDestDir(): string {
  const binInstallDest = process.env['BIN_INSTALL_DEST_DIR']
  if (binInstallDest != null) {
    const homeDir = os.homedir()
    const binDest = binInstallDest.replace(/^~/, homeDir)
    return binDest
  }

  const pm = usedPm()

  if (pm == null) {
    // bin-install ran outside of npm script.
    // This is supported but config file provided to bin-install
    // must specify destination, destDir, of where to install the binary
    throw new Error(
      `bin-install expected to run inside an npm script. Either provide a destDir location in config or run in npm script`,
    )
  }

  if (pm.name.toLowerCase() !== 'npm') {
    // Install locally when using pnpm, yarn, etc.
    // Only npm is supported for global installs as only
    // npm provides prefix env variables
    // to determine installation locations.
    return path.resolve('node_modules', '.bin')
  }

  if (process.env['npm_config_global'] === 'true') {
    const prefix = process.env['npm_config_prefix']
    if (prefix == null) {
      throw new Error(
        `Unable to determine where to install binary. env variable npm_config_prefix not set.`,
      )
    }
    if (process.platform === 'win32') {
      // On windows use installation directory itself instead of bin folder.
      // https://docs.npmjs.com/cli/v10/configuring-npm/folders#executables
      return prefix
    }
    return path.resolve(prefix, 'bin')
  }

  const prefix = process.env['npm_config_local_prefix']
  if (prefix == null) {
    throw new Error(
      `Unable to determine where to install binary. env variable npm_config_local_prefix not set.`,
    )
  }
  return path.resolve(prefix, 'node_modules', '.bin')
}

run().catch((ex) => {
  console.error(ex)
  process.exit(1)
})
