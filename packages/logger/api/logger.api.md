## API Report File for "@d-dev/logger"

> Do not edit this file. It is a report generated by [API Extractor](https://api-extractor.com/).

```ts

import { Debugger } from 'debug';

// Warning: (ae-missing-release-tag) "generateLogger" is part of the package's API, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export function generateLogger(namespace: string): Logger;

// Warning: (ae-missing-release-tag) "Logger" is part of the package's API, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export type Logger = Debugger & {
    enable: () => void;
};

// (No @packageDocumentation comment for this package)

```