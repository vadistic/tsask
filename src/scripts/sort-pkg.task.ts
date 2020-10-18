import sortPkgJson from 'sort-package-json'

import { Task } from '../runner'
import { readPkg, filterUndefShallow, writePkg, addCarret } from '../utils'

export const sortPkg: Task = async (args, props) => {
  let pkg: any = await readPkg(props.paths.project)

  if (props.paths.workspace) {
    props.logger.log(`workspace detected, importing  some fields from root package.json`)

    // just these fields
    const { description, homepage, repository, license, author } = await readPkg(
      props.paths.workspace,
    )

    pkg = { description, homepage, repository, license, author, ...pkg }

    return
  }

  addCarret(pkg.dependencies)
  addCarret(pkg.devDependencies)
  addCarret(pkg.peerDependencies)

  const sorted = await sortPkgJson(pkg)

  const filtered = filterUndefShallow(sorted)

  await writePkg(props.paths.project, filtered)

  props.logger.log(`package.json synced!`)
}
