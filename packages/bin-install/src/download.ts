import { chmodSync, mkdirSync, renameSync, rmSync } from 'node:fs'
import { writeFile } from 'node:fs/promises'
import path from 'node:path'

import extractZip from 'extract-zip'
import { globSync } from 'glob'
import { extract as extractTar } from 'tar'

import { Settings } from './config.js'
import type { Config, DownloadInfo } from './types.js'

export async function download(config: Config): Promise<DownloadInfo> {
  const settings = new Settings(config)
  settings.validate()
  const downloadInfo = settings.getDownloadInfo()

  mkdirSync(downloadInfo.tempDir, { recursive: true })
  mkdirSync(downloadInfo.destDir, { recursive: true })

  if ('archive' in downloadInfo) {
    await downloadArchive(downloadInfo)
  } else {
    await downloadBinary(downloadInfo)
  }

  const globPattern = `**/${downloadInfo.binaryName}`

  const matches = globSync(globPattern, {
    cwd: downloadInfo.tempDir,
    dot: true,
    nodir: true,
    absolute: true,
  })

  if (matches.length === 0) {
    throw new Error(
      `No binaries with the name ${downloadInfo.binaryName} found in extracted archive`,
    )
  }

  const match = matches[0]!
  const destBinaryPath = path.resolve(
    downloadInfo.destDir,
    downloadInfo.binaryName,
  )

  renameSync(match, destBinaryPath)
  chmodSync(destBinaryPath, '755')

  rmSync(downloadInfo.tempDir, { recursive: true, force: true })

  return downloadInfo
}

async function downloadBinary(downloadInfo: DownloadInfo): Promise<void> {
  const binaryPath = path.resolve(downloadInfo.tempDir, downloadInfo.binaryName)

  const downloadRes = await fetch(downloadInfo.binary)

  if (downloadRes.status !== 200) {
    throw Error(
      `Unable to download archive from ${downloadInfo.binary}. Status code ${downloadRes.status}: ${downloadRes.statusText}`,
    )
  }

  const binaryBuffer = downloadRes.body!
  await writeFile(binaryPath, binaryBuffer)
}

async function downloadArchive(downloadInfo: DownloadInfo): Promise<void> {
  const archiveName = downloadInfo
    .archive!.replace(/\/$/, '')
    .split('/')
    .at(-1) as string

  const archivePath = path.resolve(downloadInfo.tempDir, archiveName)

  const downloadRes = await fetch(downloadInfo.archive!)

  if (downloadRes.status !== 200) {
    throw Error(
      `Unable to download archive from ${downloadInfo.archive!}. Status code ${
        downloadRes.status
      }: ${downloadRes.statusText}`,
    )
  }

  const archiveBuffer = downloadRes.body!
  await writeFile(archivePath, archiveBuffer)

  await extract(archivePath, downloadInfo.tempDir)
  await rmSync(archivePath)
}

async function extract(from: string, to: string): Promise<void> {
  if (from.toLocaleLowerCase().endsWith('.zip')) {
    await extractZip(from, { dir: to })
  } else {
    await extractTar({
      file: from,
      C: to,
    })
  }
}
