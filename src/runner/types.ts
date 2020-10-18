import { Logger } from './logger'

export interface TaskProps {
  log: Logger
  paths: TaskPaths
  info: TaskInfo
}

export interface TaskPaths {
  project: string
  workspace?: string
}

export interface TaskInfo {
  cmd: string
  isWorkspace: boolean
}

export type Task = (args: any, props: TaskProps) => unknown
