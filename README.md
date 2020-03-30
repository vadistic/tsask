# tsask

> tsask = Typescript Task

Inspired by [`./task.js`](https://gist.github.com/substack/8313379).

## Why

- refactored from other project, because I thought it's quite cool (even though simple af)
- yeah, it's basically `ts-node --transpileOnly`
- keeps package.json clean
- no buy-in - scripts will be just them scripts

## Features

- runs functions from `scripts/something.task.ts` (file can have multiple tasks)
- also grabs tasks from monorepo root and this project
- can run any `.ts` file with `ts-node`
- task functions gets project paths as arg
- colorful logger
- it'a already too much :)
