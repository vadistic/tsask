import { readJSON, writeJSON } from 'fs-extra'
import { join } from 'path'

export const readPkg = async (cwd: string) => {
  return readJSON(join(cwd, 'package.json'))
}

export const writePkg = async (cwd: string, data: any) => {
  return writeJSON(join(cwd, 'package.json'), data, { spaces: 2 })
}

export const filterUndefShallow = (input: any) => {
  const res: any = {}

  for (const key of Object.keys(input)) {
    if (typeof input[key] !== 'undefined') {
      res[key] = input[key]
    }
  }

  return res
}

// add ^ to version
export const addCarret = (fields?: { [key: string]: string }) => {
  if (fields) {
    Object.entries(fields).forEach(([key, val]) => {
      // eslint-disable-next-line no-param-reassign, no-restricted-globals
      if (!isNaN(val[0] as any)) fields[key] = '^' + val
    })
  }
}
