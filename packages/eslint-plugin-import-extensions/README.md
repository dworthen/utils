# eslint-plugin-esm

A collection of eslint rules for esm modules.

## Install

```bash
$ npm install @d-dev/eslint-plugin -D
```

## Configure

**.eslintrc.json**

```
{
  "plugins": ["@d-dev"],
  "rules": {
    "@d-dev/extensions": "error"
  }
}
```

## Rules

- [extensions](docs/rules/extensions.md) - Enforce the use of file extensions in import/export paths within esm modules or prevent the use of file extensions in import/export paths within commonjs modules.
