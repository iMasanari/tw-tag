import type { PluginObj, types } from '@babel/core'

const PACKAGE_NAME = 'tw-tag'
const IMPORTED_NAME = 'tw'

interface PluginOptions {
  types: typeof types
}

const plugin = ({ types: t }: PluginOptions): PluginObj => {
  return {
    name: 'tw-tag/babel-plugin',
    visitor: {
      ImportSpecifier(path) {
        if (path.parent.type !== 'ImportDeclaration' || path.parent.source.value !== PACKAGE_NAME) {
          return
        }

        const importedName = t.isStringLiteral(path.node.imported) ? path.node.imported.value : path.node.imported.name
        if (importedName !== IMPORTED_NAME) {
          return
        }

        const binding = path.scope.getBinding(path.node.local.name)
        const references = binding?.referencePaths || []

        const targets = references.flatMap(ref => {
          const target = ref.parentPath
          if (!target) {
            return []
          }

          if (target.isTaggedTemplateExpression()) {
            const value = target.node.quasi.quasis[0]?.value.cooked

            return value ? { target, value } : []
          }

          if (target.isCallExpression()) {
            const arg = target.node.arguments[0]

            if (arg?.type === 'StringLiteral') {
              const value = arg.value

              return { target, value }
            }

            if (arg?.type === 'TemplateLiteral') {
              const value = arg.quasis[0]?.value.cooked

              return value ? { target, value } : []
            }

            return []
          }

          return []
        })

        targets.forEach(v => {
          const value = v.value.replace(/[\t\r\f\n ]+/g, ' ').replace(/^ | $/g, '')

          v.target.replaceWith(t.stringLiteral(value))
        })
      },
    },
  }
}

export default plugin
