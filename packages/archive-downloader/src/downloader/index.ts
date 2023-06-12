import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import os from 'node:os'

import extractZip from 'extract-zip'
import * as path from 'path'
import { extract as extractTar } from 'tar'
import { request } from 'undici'

export type DownloadArtifactsOptions = {
  force?: boolean
}

export async function downloadArchive(
  url: string,
  dest: string,
  options: DownloadArtifactsOptions = {},
): Promise<void> {
  const { force = false } = options
  dest = path.resolve(dest)

  await createDestination(dest, force)

  const archiveName = url.replace(/\/$/, '').split('/').at(-1) as string
  const archiveDir = path.resolve(os.tmpdir(), 'archive-downloader')
  if (existsSync(archiveDir)) {
    await fs.rm(archiveDir, { force: true, recursive: true })
  }
  await fs.mkdir(archiveDir)

  // Download archive to ./archiveContents/[assetName].zip
  const archivePath = path.join(archiveDir, archiveName)
  const downloadRes = await request(url, { maxRedirections: 10 })
  const archiveBuffer = await downloadRes.body.arrayBuffer()
  await fs.writeFile(archivePath, archiveBuffer as any)

  await extract(archivePath, dest)
  await fs.rm(archiveDir, { force: true, recursive: true })
}

async function createDestination(dest: string, force: boolean): Promise<void> {
  if (existsSync(dest)) {
    if (!force) {
      throw new Error(
        `Error: Cannot write to ${dest}. Destination already exists. Use force option to overwrite.`,
      )
    }
    await fs.rm(dest, { force: true, recursive: true })
  }
  await fs.mkdir(dest, { recursive: true })
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
