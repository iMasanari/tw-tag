import { type NodePath, type PluginObj, type types as t } from '@babel/core'

const PACKAGE_NAME = 'tw-tag'
const IMPORTED_NAME = 'tw'

const tw = (template: string, trimStart: boolean, trimEnd: boolean) => {
  let value = template.replace(/[\t\r\f\n ]+/g, ' ')

  if (trimStart) {
    value = value.replace(/^ +/, '')
  }

  if (trimEnd) {
    value = value.replace(/ +$/, '')
  }

  return value
}

const replaceTemplateLiteral = (path: NodePath<t.Node>, template: t.TemplateLiteral) => {
  template.quasis.forEach((quasi, i) => {
    quasi.value = { raw: tw(quasi.value.raw, i === 0, quasi.tail) }
  })

  path.replaceWith(template)
}

const replaceStringLeteral = (path: NodePath<t.Node>, template: t.StringLiteral) => {
  template.value = tw(template.value, true, true)

  path.replaceWith(template)
}

const removeUnusedImports = (path: NodePath<t.ImportSpecifier>) => {
  const binding = path.scope.getBinding(path.node.local.name)

  if (!binding || binding.referencePaths.length !== 0) {
    return
  }

  path.remove()

  if (path.parent.type === 'ImportDeclaration' && path.parent.specifiers.length === 0) {
    path.parentPath.remove()
  }
}

interface PluginOptions {
  types: typeof t
}

export default ({ types: t }: PluginOptions): PluginObj => {
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

        if (!binding) {
          return
        }

        binding.referencePaths.forEach(ref => {
          const target = ref.parentPath

          if (target?.isTaggedTemplateExpression()) {
            replaceTemplateLiteral(target, target.node.quasi)
            return
          }

          if (target?.isCallExpression()) {
            const arg = target.node.arguments[0]

            if (arg?.type === 'TemplateLiteral') {
              replaceTemplateLiteral(target, arg)
              return
            }

            if (arg?.type === 'StringLiteral') {
              replaceStringLeteral(target, arg)
              return
            }
          }
        })

        path.scope.crawl()
        removeUnusedImports(path)
      },
    },
  }
}
