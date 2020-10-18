import { getRoots } from '../src/runner/roots'

describe ('paths', () => {

  test('roots', () => {
    const roots = getRoots()

    console.log(roots)
  })
})
