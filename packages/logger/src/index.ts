import type { Debugger } from 'debug'
import debug from 'debug'

export type Logger = Debugger & { enable: () => void }

export function generateLogger(namespace: string): Logger {
  // @ts-expect-error logger is of type Logger in the following line when .enable is added
  const logger: Logger = debug(namespace)
  logger.enable = debug.enable.bind(debug, namespace)
  return logger
}
