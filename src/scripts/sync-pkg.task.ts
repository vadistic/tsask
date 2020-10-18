import sortPkgJson from 'sort-package-json'

import { Task } from '../runner'
import { readPkg, writePkg, addCarret } from '../utils'

export const sortPkg: Task = async (args, props) => {
  const pkg: any = await readPkg(props.paths.project)

  addCarret(pkg.dependencies)
  addCarret(pkg.devDependencies)
  addCarret(pkg.peerDependencies)

  const sorted = await sortPkgJson(pkg)

  await writePkg(props.paths.project, sorted)

  props.log.log(`package.json sorted!`)
}
