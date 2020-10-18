import fs from 'fs-extra'
import path from 'path'

import { Logger } from './logger'
import { getRoots } from './roots'
import { Task, TaskProps } from './types'

/**
 * Run task from local or root dir, it's just ts-node, but
 * - with simplified paths
 * - parsed args
 * - logger
 * - TODO: some chaining/pararel util
 */
export const runner = async () => {
  const roots = getRoots()

  const cmd = process.argv[2]
  const scope = path.basename(roots.project ?? roots.workspace ?? 'project')
  const logger = new Logger(`${scope}/${cmd || 'task'}`)

  if (!roots.project) {
    logger.error(`could not resolve package root path`)
    return
  }

  if (!cmd) {
    logger.error(`task name missing`)
    return
  }

  const props: TaskProps = {
    logger,
    info: {
      cmd,
      isWorkspace: !!roots.workspace,
    },
    paths: {
      project: roots.project,
      workspace: roots.workspace,
    },
  }

  // if .ts extension just run script
  if (path.extname(cmd)) {
    await runFile(props)
  }

  // or look for task files
  else {
    const [name, fn] = await findTaskFile(props)

    if (!name || !fn) {
      logger.error(`could not find task '${cmd}'`)
      return
    }

    await runTask(props, fn)
  }
}

// ────────────────────────────────────────────────────────────────────────────────

/**
 * runs .task.ts file fn
 */
export const runTask = async (props: TaskProps, fn: Task) => {
  const args = process.argv.slice(3)

  props.logger.start()

  const res: any = await fn(args, props)

  props.logger.end()

  return res
}

/**
 * runs any .ts file
 */
export const runFile = async (props: TaskProps) => {
  props.logger.start()

  try {
    // resolve by local project cwd
    const file = await import(path.join(props.paths.project, props.info.cmd))

    // run main or default export
    if (typeof file?.default === 'function') {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      await file.default()
    }
    if (typeof file?.main === 'function') {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      await file.main()
    }
    props.logger.end()
  } catch (err) {
    props.logger.error(err.message)
  }
}

/**
 * gets task fn by name from import
 */
const findTaskFn = (props: TaskProps, imported: any): [string, Task] | [] => {
  const fns: [string, Task][] = Object.entries(imported)

  // get first fn when only one export
  if (fns.length === 1) {
    return fns[0]
  }

  const main = props.info.cmd.split(':')[0]

  // TODO: some matcher for function names
  return fns.find(([name]) => name.match(main)) ?? []
}

/**
 * tries tofind task bot in process.cwd() and in workspace root
 */

const TASK_DIR = 'scripts'
const TASK_EXT = '.task'

const EXT_TS = '.ts'
const EXT_JS = '.js'

const findTaskFile = async (props: TaskProps) => {
  const filename = props.info.cmd + TASK_EXT

  const libTaskPathJs = path.join(__dirname, '..', TASK_DIR, filename + EXT_JS)
  const libTaskPathTs = path.join(__dirname, '..', TASK_DIR, filename + EXT_TS)

  const projectTaskPath = path.join(props.paths.project, TASK_DIR, filename + EXT_TS)
  const workspaceTaskPath =
    props.paths.workspace && path.join(props.paths.workspace, TASK_DIR, filename + EXT_TS)

  if (fs.existsSync(projectTaskPath)) {
    return import(projectTaskPath).then(imp => findTaskFn(props, imp))
  }

  if (workspaceTaskPath && fs.existsSync(workspaceTaskPath)) {
    return import(workspaceTaskPath).then(imp => findTaskFn(props, imp))
  }

  if (fs.existsSync(libTaskPathJs)) {
    return import(libTaskPathJs).then(imp => findTaskFn(props, imp))
  }

  if (fs.existsSync(libTaskPathTs)) {
    return import(libTaskPathTs).then(imp => findTaskFn(props, imp))
  }

  return []
}
