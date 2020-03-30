import path from 'path'
import { homedir } from 'os'
import fs from 'fs-extra'
import { Logger } from './logger'
import { Task, TaskProps } from './types'

/**
 * Run task from local or root dir, it's jsut ts-node, but
 * - with simplified paths
 * - parsed args
 * - logger
 * - TODO: some chaining/pararel util
 */
export const runner = async () => {
  const workspaceCwd = getWorkspaceCwd()
  const packageCwd = getPackageCwd()

  const cmd = process.argv[2]
  const scope = path.basename(packageCwd ?? workspaceCwd ?? 'project')
  const logger = new Logger(`${scope}/${cmd || 'task'}`)

  if (!workspaceCwd || !packageCwd) {
    logger.error(`could not resolve package/workspace cwd. Is yarn.lock present?`)
    return
  }

  if (!cmd) {
    logger.error(`task name missing`)
    return
  }

  const props: TaskProps = {
    log: logger,
    info: {
      cmd,
      isWorkspace: packageCwd !== workspaceCwd,
    },
    paths: {
      package: packageCwd,
      workspace: workspaceCwd,
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

const ROOT_FILES = ['yarn.lock', '.git', 'package-lock.json']
const HOME_PATH = homedir()

export const getWorkspaceCwd = (maybeCwd = process.cwd(), loop = 0): string | undefined => {
  if (loop > 8 || maybeCwd === HOME_PATH) {
    return
  }

  return ROOT_FILES.some((file) => fs.existsSync(path.join(maybeCwd, file)))
    ? maybeCwd
    : getWorkspaceCwd(path.join(maybeCwd, '..'), loop + 1)
}

export const getPackageCwd = (maybeCwd = process.cwd(), loop = 0): string | undefined => {
  if (loop > 8 || maybeCwd === HOME_PATH) {
    return
  }

  return fs.existsSync(path.join(maybeCwd, 'package.json'))
    ? maybeCwd
    : getPackageCwd(path.join(maybeCwd, '..'), loop + 1)
}

// ────────────────────────────────────────────────────────────────────────────────

/**
 * runs .task.ts file fn
 */
export const runTask = async (props: TaskProps, fn: Task) => {
  const args = process.argv.slice(3)

  props.log.start()

  const res = await fn(args, props)

  props.log.end()

  return res
}

/**
 * runs any .ts file
 */
export const runFile = async (props: TaskProps) => {
  props.log.start()

  try {
    // resolve by local project cwd
    const file = await import(path.join(props.paths.package, props.info.cmd))

    // run main or default export
    if (typeof file?.default === 'function') {
      console.log(file?.default)
      return file.default()
    }
    if (typeof file?.main === 'function') {
      return file.main()
    }
    props.log.end()
  } catch (err) {
    props.log.error(err.message)
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

const TS = '.ts'
const JS = '.js'

const findTaskFile = async (props: TaskProps) => {
  const filename = props.info.cmd + TASK_EXT

  const localTaskPath = path.join(props.paths.package, TASK_DIR, filename + TS)
  const rootTaskPath = path.join(props.paths.workspace, TASK_DIR, filename + TS)
  const libTaskPathJs = path.join(__dirname, '..', TASK_DIR, filename + JS)
  const libTaskPathTs = path.join(__dirname, '..', TASK_DIR, filename + TS)

  const isLocalTask = () => fs.existsSync(localTaskPath)
  const isRootTask = () => fs.existsSync(rootTaskPath)
  const isLibTaskJs = () => fs.existsSync(libTaskPathJs)
  const isLibTaskTs = () => fs.existsSync(libTaskPathTs)

  if (isLocalTask()) {
    return import(localTaskPath).then((imp) => findTaskFn(props, imp))
  }

  if (props.info.isWorkspace && isRootTask()) {
    return import(rootTaskPath).then((imp) => findTaskFn(props, imp))
  }

  if (isLibTaskJs()) {
    return import(libTaskPathJs).then((imp) => findTaskFn(props, imp))
  }

  if (isLibTaskTs()) {
    return import(libTaskPathTs).then((imp) => findTaskFn(props, imp))
  }

  return []
}
