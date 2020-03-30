import { Logger } from './logger'

export interface TaskProps {
  log: Logger
  paths: TaskPaths
  info: TaskInfo
}

export interface TaskPaths {
  workspace: string
  package: string
}

export interface TaskInfo {
  cmd: string
  isWorkspace: boolean
}

export type Task = (args: any, props: TaskProps) => any
