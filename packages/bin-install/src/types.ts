export type Config = {
  archive?: string
  binary: string
  tempDir: string
  destDir: string
  os: Record<string, string>
  arch: Record<string, Record<string, string>>
  variables?: Record<string, string>
}

export type DownloadInfo = {
  archive?: string
  binary: string
  binaryName: string
  tempDir: string
  destDir: string
  os: string
  arch: string
  binaryExt: string
  archiveExt: string
}
