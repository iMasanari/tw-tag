import { expect, it } from 'vitest'
import { tw } from '../src/tw-tag'

it('tw`...`', () => {
  const actual = tw`
    a   b
    c
  `

  expect(actual).toBe('a b c')
})

it('tw(`...`)', () => {
  const actual: 'a b c' = tw(`
    a   b
    c
  `)

  expect(actual).toBe('a b c')
})

