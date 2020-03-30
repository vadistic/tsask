import sortPkgJson from 'sort-package-json'
import { Task } from '../runner'
import { readPkg, filterUndefShallow, writePkg } from '../utils/utils'

export const sortPkg: Task = async (args, props) => {
  let pkg = await readPkg(props.paths.package)

  if (props.info.isWorkspace) {
    props.log.log(`workspace detected, importing fields from root`)

    // just hese fields
    const { description, homepage, repository, license, author } = await readPkg(
      props.paths.workspace,
    )

    pkg = { description, homepage, repository, license, author, ...pkg }
  }

  // add ^ to version
  const addCarret = (field?: { [key: string]: string }) => {
    if (field) {
      Object.entries(field).forEach(([key, val]) => {
        if (!isNaN(val[0] as any)) field[key] = '^' + val
      })
    }
  }

  addCarret(pkg.dependencies)
  addCarret(pkg.devDependencies)
  addCarret(pkg.peerDependencies)

  const sorted = await sortPkgJson(pkg)

  const filtered = filterUndefShallow(sorted)

  writePkg(props.paths.package, filtered)

  props.log.log(`package.json sorted!`)
}
