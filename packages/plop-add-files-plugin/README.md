# Plop Add Files Plugin

A plugin for [Plop](https://www.npmjs.com/package/plop).
Similar to Plop's addMany action but allows for scaffolding some files without
applying handlebars templating.

## Usage

```js
import addFiles from '@d-dev/plop-add-files-plugin'
export default async function (plop) {
  await addFiles(plop)

  plop.setGenerator('some-generator', {
    description: '',
    prompts: [],
    actions: [
      {
        type: 'addFiles',
        templateFiles: 'templates/some-template/**/*',
        destination: './{{name}}/',
        base: 'templates/some-template/',
      },
    ],
  })
}
```

## Options

```ts
export type AddFilesOptions = {
  type: 'addFiles'
  templateFiles: string
  destination?: string
  base?: string
  verbose?: boolean
  force?: boolean
  skip?: (
    src: string,
    destination: string,
    answers: Record<string, unknown>,
    config: Record<string, unknown>,
  ) => boolean
  skipIfExists?: boolean
  globOptions?: glob.IOptions
  skipTemplating?: (
    src: string,
    destination: string,
    answers: Record<string, unknown>,
    config: Record<string, unknown>,
  ) => boolean
}
```
