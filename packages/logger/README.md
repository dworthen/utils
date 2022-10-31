# Logger

A small utility wrapper around [debug](https://www.npmjs.com/package/debug).

## Example

```js
import { generateLogger } from '@d-dev/logger'

const log = generateLogger('namespace')

if (SOME_CONDITION) {
  log.enable()
}

log('message %O', someObject)

```

Supports all the same formatters as [debug](https://www.npmjs.com/package/debug).