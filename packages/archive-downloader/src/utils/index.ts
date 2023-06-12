import { execa, ExecaReturnValue } from 'execa'

export function wrapBin(
  binPath: string,
): (args: string[]) => Promise<ExecaReturnValue<string>> {
  const ext = process.platform === 'win32' ? '.exe' : ''
  binPath += ext

  return async function run(args: string[]): Promise<ExecaReturnValue<string>> {
    return await execa(binPath, args)
  }
}
