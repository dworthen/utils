import path from 'node:path'

import handlebars from 'handlebars'

import type { Config, DownloadInfo } from './types.js'

export class Settings {
  private declare readonly config: Config

  constructor(config: Config) {
    this.config = config
  }

  public validate = () => {
    if (!('binary' in this.config)) {
      throw new Error(`Config missing required property "binary".`)
    }

    if (!('destDir' in this.config)) {
      throw new Error(`Config missing required property "destDir".`)
    }

    if (!('tempDir' in this.config)) {
      throw new Error(`Config missing required property "temmpDir".`)
    }

    if (!('os' in this.config)) {
      throw new Error(`Config missing required property "os".`)
    }

    if (!('arch' in this.config)) {
      throw new Error(`Config missing required property "arch".`)
    }

    if (
      'archive' in this.config &&
      this.config.archive != null &&
      this.config.archive !== ''
    ) {
      try {
        new URL(this.config.archive)
      } catch (ex) {
        throw new Error(`archive, ${this.config.archive}, is not a valid url.`)
      }
      let binIsUrl = false
      try {
        new URL(this.config.binary)
        binIsUrl = true
      } catch (ex) {
        if (path.isAbsolute(this.config.binary)) {
          throw new Error(
            `Binary, ${this.config.binary}, is an absolute path but is expected to be a filename.`,
          )
        }
        const pathSegments = this.config.binary.split(/\\|\//)
        if (pathSegments.length > 1) {
          throw new Error(
            `Binary, ${this.config.binary}, is a path segment. Expected to be name of binary to extract from within the archive`,
          )
        }
      }
      if (binIsUrl) {
        throw new Error(
          `Binary, ${this.config.binary} is a url but expected to be a filename when archive key is provided.`,
        )
      }
    } else {
      try {
        new URL(this.config.binary)
      } catch (ex) {
        throw new Error(`binary, ${this.config.binary}, is not a valid url.`)
      }
    }
  }

  public getDownloadInfo = (): DownloadInfo => {
    let os: string = process.platform
    let arch: string = process.arch

    const archiveExt = os === 'win32' ? '.zip' : '.tar.gz'
    const binaryExt = os === 'win32' ? '.exe' : ''

    if (!(os in this.config.os)) {
      throw new Error(
        `Your os, ${os}, is not supported by this prebuilt binary installer. Please install from source.`,
      )
    }

    os = this.config.os[os]!

    if (!(os in this.config.arch) || !(arch in this.config.arch[os]!)) {
      throw new Error(
        `Your architecture, ${arch}, is not supported by this prebuild binary installer. Please install from source.`,
      )
    }

    arch = this.config.arch[os]![arch]!

    const downloadInfo: DownloadInfo = {
      ...this.config,
      ...this.config.variables,
      binaryName: '',
      os,
      arch,
      archiveExt,
      binaryExt,
    }

    const binaryTemplate = handlebars.compile(downloadInfo.binary)
    downloadInfo.binary = binaryTemplate(downloadInfo)

    downloadInfo.binaryName = downloadInfo.binary

    if ('archive' in downloadInfo) {
      const archiveTemplate = handlebars.compile(downloadInfo.archive!)
      downloadInfo.archive = archiveTemplate(downloadInfo)
      downloadInfo.binaryName = downloadInfo.binaryName
        .replace(/\/$/, '')
        .split('/')
        .at(-1) as string
    }

    return downloadInfo
  }
}
