const tags = require('./tags')
let set = new Set(tags)
const importAsName = '__$vactapp_global_as_module'
const importFromName = 'vactapp'
module.exports = function ({ types: t }) {
  return {
    visitor: {
      JSXElement(path) {
        path.replaceWith(traverse(path.node, t))
      },

      JSXFragment(path) {
        path.replaceWith(traverse(path.node, t))
      },

      VariableDeclarator(path) {
        if (path.node.id.type === 'Identifier' && /^\$.+$/.test(path.node.id.name)) {
          let preInit = path.node.init
          if (preInit.type === 'ObjectExpression') {
            path.node.init = t.callExpression(
              t.memberExpression(t.identifier(importAsName), t.identifier('defineState')),
              [
                preInit
              ]
            )
          }
        }
      },

      // 解决引入问题
      Program(path) {
        let hasImport = (list, name, package) => {
          for (let i of list) {
            if (i.type === 'ImportDeclaration' && i.source.value=== importFromName) {
              for(let item of i.specifiers) {
                if(item.type === 'ImportNamespaceSpecifier') {
                  if (item.local.name === importAsName) {
                    return true
                  }
                }
              }
            }
          }
          return false
        }


        if (!hasImport(path.node.body)) {
          path.node.body.unshift(
            t.importDeclaration(
              [
                t.importNamespaceSpecifier(t.identifier(importAsName))
              ], t.stringLiteral(importFromName)
            )
          )
        }

      }
    }
  }
}

function isOnEvent(str) {
  return /^on.+$/.test(str)
}

function traverse(node, t) {
  let replaceChildren = []
  let children = node.children


  if (children && children.length) {
    for (let child of children) {
      let res = traverse(child, t)
      if (res) replaceChildren.push(res)
    }
  }

  // 如果子元素也是标签
  if (node.type === 'JSXElement') {
    let attrs = []
    let tagAttrs = node.openingElement.attributes
    for (let attr of tagAttrs) {
      if (attr.value.type === 'JSXExpressionContainer') {

        // if (attr.name.name === 'aaa') continue
        let expression = attr.value.expression

        let prop = t.objectProperty(
          t.identifier(attr.name.name),
          isOnEvent(attr.name.name) ? expression : t.arrowFunctionExpression([], expression, false),
          false,
          false,
          null
        );
        attrs.push(prop)
      } else if (attr.value.type === 'StringLiteral') {
        let prop = t.objectProperty(
          t.identifier(attr.name.name),
          t.stringLiteral(attr.value.value),
          false,
          false,
          null
        );
        attrs.push(prop)
      }
    }

    let object = t.objectExpression(attrs);

    return t.callExpression(
      t.memberExpression(t.identifier(importAsName), t.identifier('h')),
      [
        set.has(node.openingElement.name.name) ? t.stringLiteral(node.openingElement.name.name) : t.identifier(node.openingElement.name.name),
        object,
        t.arrayExpression(replaceChildren)
      ]
    )
  }

  // 如果子元素是文本
  if (node.type === 'JSXText') {
    return t.stringLiteral(node.value)
  }

  if (node.type === 'JSXExpressionContainer') {
    let expression = node.expression
    return t.arrowFunctionExpression([], expression, false)
  }


  if (node.type === 'JSXFragment') {
    return t.callExpression(
      t.memberExpression(t.identifier(importAsName), t.identifier('h')),
      [
        t.identifier('VFragment'),
        t.nullLiteral(),
        t.arrayExpression(replaceChildren)
      ]
    )
  }

}
