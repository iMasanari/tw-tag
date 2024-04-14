import { basename, extname } from 'node:path'
import { type NodePath, type PluginObj, type types as t } from '@babel/core'

type BabelTypes = typeof t

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

const replaceTemplateLiteral = (t: BabelTypes, path: NodePath<t.Node>, template: t.TemplateLiteral, label: string | null) => {
  const quasis = template.quasis.map((quasi, i) => {
    const className = tw(quasi.value.raw, i === 0, quasi.tail)

    return {
      ...quasi,
      value: {
        raw: i === 0 && label ? `${label} ${className}` : className,
      },
    }
  })

  const target = t.templateLiteral(quasis, template.expressions)

  path.replaceWith(target)
}

const replaceStringLeteral = (t: BabelTypes, path: NodePath<t.Node>, template: t.StringLiteral, label: string | null) => {
  const className = tw(template.value, true, true)
  const target = t.stringLiteral(label ? `${label} ${className}` : className)

  path.replaceWith(target)
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

const getFileBaseName = (fileName: string) =>
  basename(fileName, extname(fileName)).replace(/\W+(\w)/g, (_, char) => char.toUpperCase()).replace(/\W+$/g, '')

const getLocalName = (path: NodePath): string | null => {
  if (path.isVariableDeclarator()) {
    const target = path.node.id

    if (target.type === 'Identifier') {
      return target.name
    }
  }

  if (path.isProperty()) {
    const target = path.node.key

    if (target.type === 'Identifier') {
      return target.name
    }

    if (target.type === 'StringLiteral') {
      return target.value
    }
  }

  if (path.isFunctionDeclaration() || path.isFunctionExpression()) {
    const target = path.node.id

    if (target) {
      return target.name
    }
  }

  if (path.isClassDeclaration() || path.isClassExpression()) {
    const target = path.node.id

    if (target) {
      return target.name
    }
  }

  if (path.parentPath) {
    return getLocalName(path.parentPath)
  }

  return null
}

const getDevLabel = (fileName: string | undefined, node: NodePath) => {
  const baseName = getFileBaseName(fileName || 'ANONYMOUS')
  const localName = getLocalName(node) || 'ANONYMOUS'

  return `DEV-${baseName}-${localName}`

}

interface PluginOptions {
  types: BabelTypes
}

interface TwTagOptions {
  devLabel?: boolean
}

export default ({ types: t }: PluginOptions, options: TwTagOptions): PluginObj => {
  const devLabel = options.devLabel ?? process.env.NODE_ENV !== 'production'

  return {
    name: 'tw-tag/babel-plugin',
    visitor: {
      ImportSpecifier(path, state) {
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

          if (!target) {
            return
          }

          const label = devLabel ? getDevLabel(state.filename, target) : null

          if (target.isTaggedTemplateExpression()) {
            replaceTemplateLiteral(t, target, target.node.quasi, label)
            return
          }

          if (target.isCallExpression()) {
            const arg = target.node.arguments[0]

            if (arg?.type === 'TemplateLiteral') {
              replaceTemplateLiteral(t, target, arg, label)
              return
            }

            if (arg?.type === 'StringLiteral') {
              replaceStringLeteral(t, target, arg, label)
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
