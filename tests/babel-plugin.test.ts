import { transformAsync } from '@babel/core'
import { expect, it, describe } from 'vitest'
import plugin from '../src/babel-plugin'

it('tw`...`', async () => {
  const code = `
    import { tw } from "tw-tag";
    
    tw\`
      a  b
      \${"c"}
    \`;
  `

  const actual = await transformAsync(code, {
    plugins: [[plugin, { devLabel: false }]],
  })

  expect(actual?.code).toBe('`a b ${"c"}`;')
})

it('tw(`...`)', async () => {
  const code = `
    import { tw } from "tw-tag";
    
    tw(\`
      a  b
      \${"c"}
    \`);
  `

  const actual = await transformAsync(code, {
    plugins: [[plugin, { devLabel: false }]],
  })

  expect(actual?.code).toBe('`a b ${"c"}`;')
})

it('tw("...")', async () => {
  const code = `
    import { tw } from "tw-tag";
    
    tw("      a  b      c    ");
  `

  const actual = await transformAsync(code, {
    plugins: [[plugin, { devLabel: false }]],
  })

  expect(actual?.code).toBe('"a b c";')
})

it('import as other name', async () => {
  const code = `
    import { tw as OTHER_NAME } from "tw-tag";
    
    OTHER_NAME\`
      a  b
      \${"c"}
    \`;
  `

  const actual = await transformAsync(code, {
    plugins: [[plugin, { devLabel: false }]],
  })

  expect(actual?.code).toBe('`a b ${"c"}`;')
})

it('Import is not removed when referenced.', async () => {
  const code = `
    import { tw } from "tw-tag";
    
    console.log(tw);
  `

  const actual = await transformAsync(code, {
    plugins: [[plugin, { devLabel: false }]],
  })

  expect(actual?.code).toBe('import { tw } from "tw-tag";\nconsole.log(tw);')
})

it('Imports other than `tw` are not removed.', async () => {
  const code = `
    import { tw, xxx } from "tw-tag";
    
    tw("a");
  `

  const actual = await transformAsync(code, {
    plugins: [[plugin, { devLabel: false }]],
  })

  expect(actual?.code).toBe('import { xxx } from "tw-tag";\n"a";')
})

describe('devLabel options', () => {
  it('devLabel: false', async () => {
    const code = `
      import { tw } from "tw-tag";
      
      const identifierStyle = tw\`
        a  b
        \${"c"}
      \`;
    `

    const actual = await transformAsync(code, {
      filename: 'test.js',
      plugins: [[plugin, { devLabel: false }]],
    })

    expect(actual?.code).toMatchInlineSnapshot(
      '"const identifierStyle = `a b ${\\"c\\"}`;"'
    )
  })

  it('devLabel: true (identifier)', async () => {
    const code = `
      import { tw } from "tw-tag";
      
      const identifierStyle = tw\`
        a  b
        \${"c"}
      \`;
    `

    const actual = await transformAsync(code, {
      filename: 'test.js',
      plugins: [[plugin, { devLabel: true }]],
    })

    expect(actual?.code).toMatchInlineSnapshot(
      '"const identifierStyle = `DEV-test-identifierStyle a b ${\\"c\\"}`;"'
    )
  })

  it('devLabel: true (object)', async () => {
    const code = `
      import { tw } from "tw-tag";
      
      const objectStyle = {
        identifierStyle: tw\`
          a b
        \`,
        'literalStyle': tw\`
          c
        \`,
      }
    `

    const actual = await transformAsync(code, {
      filename: 'test.js',
      plugins: [[plugin, { devLabel: true }]],
    })

    expect(actual?.code).toMatchInlineSnapshot(`
      "const objectStyle = {
        identifierStyle: \`DEV-test-identifierStyle a b\`,
        'literalStyle': \`DEV-test-literalStyle c\`
      };"
    `)
  })
})
