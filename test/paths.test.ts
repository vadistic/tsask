import path from 'path'

import { getRoots } from '../src/runner/roots'

describe('paths', () => {
  test('roots', () => {
    const roots = getRoots()

    expect(roots.workspace).toBeUndefined()
    expect(roots.project && path.basename(roots.project)).toBe('tsask')
  })
})
