import { execFile, ExecFileOptions } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

export type BinReturn = {
  stdout: string
  stderr: string
}

export function wrapBin(
  binPath: string,
  options?: ExecFileOptions,
): (...args: string[]) => Promise<BinReturn> {
  const ext = process.platform === 'win32' ? '.exe' : ''
  binPath += ext

  return async function run(...args: string[]): Promise<BinReturn> {
    return await execFileAsync(binPath, args, {
      ...options,
      encoding: 'utf-8',
    })
  }
}
