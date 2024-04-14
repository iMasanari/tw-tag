# tw-tag

tw-tag is a library for describing Tailwind CSS as a kind of DSL.

## Usage

```jsx
import { tw } from "tw-tag"

const tailwindClassName = tw`
  flex
  pt-4
  text-center
  rotate-90
`

console.log(tailwindClassName) // 'flex pt-4 text-center rotate-90'

function SomeComponent() {
  return (
    <>
      <div className={tailwindClassName} />
      {/* inline */}
      <div className={tw`pt-4 mx-auto`} />
    </>
  )
}
```

### Use Babel

The tw function converts consecutive spaces into a single space.
You can do this at build time by using the Babel plugin.

```js
// babel.config.js
module.exports = {
  plugins: [
    'tw-tag/babel-plugin',
  ],
}
```

```js
// before
import { tw } from 'tw-tag'

const tailwindClassName = tw`
  flex
  pt-4
  text-center
  rotate-90
`

// after
const tailwindClassName = `flex pt-4 text-center rotate-90`
```

### in TypeScript

If you write ``tw(`...`)``, the type will be inferred based on your input.

```ts
// type: string
const a = tw`
  flex
  pt-4
  text-center
  rotate-90
`

// type: 'flex pt-4 text-center rotate-90'
const b = tw(`
  flex
  pt-4
  text-center
  rotate-90
`)
```

The `` tw`...` `` format will be supported once `TemplateStringsArray` inference is improved.

ref: https://github.com/microsoft/TypeScript/pull/49552


## Babel options

```js
// babel.config.js
module.exports = {
  plugins: [
    ['tw-tag/babel-plugin', {
      devLabel: false,
    }],
  ],
}
```

### `devLabel`

type: `boolean` (default value: `process.env.NODE_ENV !== 'production'`)

Add className for debugging. format: `DEV-[fileName]-[localName]`

```js
// some-file.js
const variableName = tw`p4`

// build when develop
const variableName = `DEV-someFile-variableName p4`
```

## `tw` support for VSCode

To enable Tailwind CSS IntelliSense completion, add the setting below.

```json5
// settings.json
{
  // ...
  "tailwindCSS.experimental.classRegex": [
    "tw\\(?`([^`]*)"
  ],
}
```
