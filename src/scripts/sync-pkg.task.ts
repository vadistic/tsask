import sortPkgJson from 'sort-package-json'

import { Task } from '../runner'
import { readPkg, filterUndefShallow, writePkg } from '../utils'

export const sortPkg: Task = async (args, props) => {
  let pkg: any = await readPkg(props.paths.project)

  if (props.paths.workspace) {
    props.log.log(`workspace detected, importing  some fields from root package.json`)

    // just these fields
    const { description, homepage, repository, license, author } = await readPkg(
      props.paths.workspace,
    )

    pkg = { description, homepage, repository, license, author, ...pkg }

    return
  }

  // add ^ to version
  const addCarret = (field?: { [key: string]: string }) => {
    if (field) {
      Object.entries(field).forEach(([key, val]) => {
        // eslint-disable-next-line no-param-reassign, no-restricted-globals
        if (!isNaN(val[0] as any)) field[key] = '^' + val
      })
    }
  }

  addCarret(pkg.dependencies)
  addCarret(pkg.devDependencies)
  addCarret(pkg.peerDependencies)

  const sorted = await sortPkgJson(pkg)

  const filtered = filterUndefShallow(sorted)

  void writePkg(props.paths.project, filtered)

  props.log.log(`package.json sorted!`)
}
