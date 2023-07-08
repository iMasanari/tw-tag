import { transformAsync } from '@babel/core'
import { expect, it } from 'vitest'
import plugin from '../src/babel-plugin'

it('tw`...`', async () => {
  const code = `
    import { tw } from "tw-tag";
    
    tw\`
      a b
      c
    \`;
  `

  const actual = await transformAsync(code, {
    plugins: [plugin],
  })

  expect(actual?.code).toBe('import { tw } from "tw-tag";\n"a b c";')
})

it('tw(`...`)', async () => {
  const code = `
    import { tw } from "tw-tag";
    
    tw(\`
      a b
      c
    \`);
  `

  const actual = await transformAsync(code, {
    plugins: [plugin],
  })

  expect(actual?.code).toBe('import { tw } from "tw-tag";\n"a b c";')
})

it('tw("...")', async () => {
  const code = `
    import { tw } from "tw-tag";
    
    tw("      a b      c    ");
  `

  const actual = await transformAsync(code, {
    plugins: [plugin],
  })

  expect(actual?.code).toBe('import { tw } from "tw-tag";\n"a b c";')
})

it('import as other name', async () => {
  const code = `
    import { tw as OTHER_NAME } from "tw-tag";
    
    OTHER_NAME\`
      a b
      c
    \`;
  `

  const actual = await transformAsync(code, {
    plugins: [plugin],
  })

  expect(actual?.code).toBe('import { tw as OTHER_NAME } from "tw-tag";\n"a b c";')
})
