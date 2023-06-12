import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { wrapBin } from './utils/index.js'

const bin = wrapBin(
  path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../bin/goclitest',
  ),
)

async function run(): Promise<void> {
  const { stdout, stderr } = await bin(process.argv.slice(2))
  console.error(stderr)
  console.log(stdout)
}

void run()
