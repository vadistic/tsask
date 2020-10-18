import fs from 'fs-extra'
import { homedir } from 'os'
import path from 'path'

const ROOT_FILES = ['package.json', 'yarn.lock', '.git', 'package-lock.json']
const HOME_PATH = homedir()

export const getWorkspaceRoot = (maybeCwd: string, loop = 0): string | undefined => {
  if (loop > 8 || maybeCwd === HOME_PATH) {
    return undefined
  }

  return ROOT_FILES.some(file => fs.existsSync(path.join(maybeCwd, file)))
    ? maybeCwd
    : getWorkspaceRoot(path.join(maybeCwd, '..'), loop + 1)
}

export const getProjectRoot = (maybeCwd = process.cwd(), loop = 0): string | undefined => {
  if (loop > 8 || maybeCwd === HOME_PATH) {
    return undefined
  }

  return ROOT_FILES.some(file => fs.existsSync(path.join(maybeCwd, file)))
    ? maybeCwd
    : getWorkspaceRoot(path.join(maybeCwd, '..'), loop + 1)
}

export const getRoots = () => {
  const projectRoot = getProjectRoot()
  // there no point in looking for workspace if no project is found
  const workspaceRoot = projectRoot ? getWorkspaceRoot(path.join(projectRoot, '..')) : undefined

  return {
    project: projectRoot,
    workspace: workspaceRoot,
  }
}
