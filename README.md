# tsask

> tsask = Typescript Task

Inspired by [`./task.js`](https://gist.github.com/substack/8313379).

[NPM](https://www.npmjs.com/package/@vadistic/tsask) |
[GITHUB](https://github.com/vadistic/tsask)

## Why

- yeah, it's just `ts-node --transpileOnly`
- refactored from other project, because I thought it's quite cool (even though really simple)
- no buy-in, scripts will be just them scripts
- helps to keep `scripts/*` / `package.json` clean

## Features

- runs task fns from `scripts/something.task.ts` (file can have multiple tasks)
- also grabs tasks from monorepo root
- can run any `.ts` file with `ts-node`
- task fns gets project paths as arg
- colorful logger
- it's already too much :)

## Installation

```sh
yarn add -D @vadistic/tsask
```

## Example

```ts
// scripts/hello.task.ts

export const whatever = () => {
  console.log('Hello!')
}

// or with build-in logger

export const whatever = (args, { logger }) => {
  logger.log('Hello!')
}
```

```sh
tsask hello

tsask any/ts/file/can/be/run/from/project/root.ts
```
