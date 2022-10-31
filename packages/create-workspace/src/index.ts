#!/usr/bin/env node
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import minimist from 'minimist'
import { Plop, run } from 'plop'

const args = process.argv.slice(2)
const argv = minimist(args)

/* eslint-disable-next-line */
const __dirname = dirname(fileURLToPath(import.meta.url))

Plop.prepare(
  {
    cwd: argv['cwd'],
    configPath: join(__dirname, 'plopfile.js'),
    preload: argv['preload'] ?? [],
    completion: argv['completion'],
  },
  (env) =>
    Plop.execute(env, (env) => {
      const options = {
        ...env,
        dest: process.cwd(), // this will make the destination path to be based on the cwd when calling the wrapper
      }
      void run(options, undefined, true)
    }),
)
