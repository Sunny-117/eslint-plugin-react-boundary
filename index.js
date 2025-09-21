/* eslint-disable max-len */
/* eslint-disable max-statements-per-line */
/* eslint-disable no-use-before-define */
/**
 * ESLint plugin to ensure React components are wrapped with <Boundary>
 */

const rule = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Ensure React components are wrapped with <Boundary>',
            category: 'Best Practices',
            recommended: true,
        },
        fixable: 'code',
        schema: [
            {
                type: 'object',
                properties: {
                    boundaryComponent: {
                        oneOf: [
                            {
                                type: 'string',
                                default: 'Boundary',
                            },
                            {
                                type: 'array',
                                items: {
                                    type: 'string',
                                },
                                minItems: 1,
                            },
                        ],
                    },
                    importSource: {
                        type: 'string',
                        default: 'react-suspense-boundary',
                    },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            missingBoundary: 'React component "{{componentName}}" should be wrapped with <{{boundaryComponent}}>',
            addBoundaryImport: 'Add {{boundaryComponent}} import from "{{importSource}}"',
        },
    },

    create(context) {
        const options = context.options[0] || {};
        const boundaryComponentConfig = options.boundaryComponent || 'Boundary';
        const boundaryComponents = Array.isArray(boundaryComponentConfig)
            ? boundaryComponentConfig
            : [boundaryComponentConfig];
        const importSource = options.importSource || 'react-suspense-boundary';

        let hasReactImport = false;
        let hasBoundaryImport = false;
        const boundaryImportNames = new Set(); // Track all imported boundary component names
        const exportedComponents = [];
        const definedComponents = new Map(); // Track all defined components
        const sourceCode = context.getSourceCode();

        // 检查是否是 React 组件文件
        function isReactFile() {
            const text = sourceCode.getText();
            return hasReactImport
             || text.includes('jsx')
             || text.includes('React')
             || text.includes('<') // 包含 JSX 语法
             || text.includes('JSX')
             || context.getFilename().match(/\.(jsx|tsx)$/);
        }

        // 检查节点是否是函数组件
        function isFunctionComponent(node) {
            if (!node) {return false;}

            // 函数声明: function Component() {}
            if (node.type === 'FunctionDeclaration') {
                // 支持匿名函数声明（如 export default function() {}）
                const isAnonymous = !node.id;
                return (isAnonymous || isComponentName(node.id?.name)) && hasJSXReturn(node.body);
            }

            // 箭头函数: const Component = () => {}
            if (node.type === 'ArrowFunctionExpression' || node.type === 'FunctionExpression') {
                const body = node.body;
                // 检查是否返回 JSX
                return hasJSXReturn(body);
            }

            return false;
        }

        // 检查是否是组件名称（首字母大写）
        function isComponentName(name) {
            return name && /^[A-Z]/.test(name);
        }

        // 检查函数体是否返回 JSX
        function hasJSXReturn(body) {
            if (!body) {return false;}

            // 直接返回 JSX: () => <div>...</div>
            if (body.type === 'JSXElement' || body.type === 'JSXFragment') {
                return true;
            }

            // 块语句中的 return
            if (body.type === 'BlockStatement') {
                return body.body.some(stmt => {
                    if (stmt.type === 'ReturnStatement') {
                        const arg = stmt.argument;
                        return arg && (
                            arg.type === 'JSXElement'
              || arg.type === 'JSXFragment'
              || (arg.type === 'ConditionalExpression' && hasJSXInConditional(arg))
              || (arg.type === 'LogicalExpression' && hasJSXInLogical(arg))
                        );
                    }
                    return false;
                });
            }

            return false;
        }

        // 检查条件表达式中是否有 JSX
        function hasJSXInConditional(node) {
            return (node.consequent && (node.consequent.type === 'JSXElement' || node.consequent.type === 'JSXFragment'))
             || (node.alternate && (node.alternate.type === 'JSXElement' || node.alternate.type === 'JSXFragment'));
        }

        // 检查逻辑表达式中是否有 JSX
        function hasJSXInLogical(node) {
            return (node.left && (node.left.type === 'JSXElement' || node.left.type === 'JSXFragment'))
             || (node.right && (node.right.type === 'JSXElement' || node.right.type === 'JSXFragment'));
        }

        // 检查组件是否被 Boundary 包裹
        function isWrappedWithBoundary(node) {
            if (!node || !node.body) {return false;}

            // 对于箭头函数直接返回 JSX
            if (node.body.type === 'JSXElement') {
                return isJSXWrappedWithBoundary(node.body);
            }

            // 对于块语句
            if (node.body.type === 'BlockStatement') {
                const returnStatements = node.body.body.filter(stmt => stmt.type === 'ReturnStatement');
                return returnStatements.some(stmt => {
                    if (stmt.argument && stmt.argument.type === 'JSXElement') {
                        return isJSXWrappedWithBoundary(stmt.argument);
                    }
                    return false;
                });
            }

            return false;
        }

        // 检查 JSX 元素是否被 Boundary 包裹
        function isJSXWrappedWithBoundary(jsxElement) {
            if (!jsxElement || jsxElement.type !== 'JSXElement') {return false;}

            const openingElement = jsxElement.openingElement;
            if (!openingElement || !openingElement.name) {return false;}

            // 检查是否是任何一个配置的边界组件
            const elementName = openingElement.name.name;
            return boundaryImportNames.has(elementName) || boundaryComponents.includes(elementName);
        }

        return {
            // 检查 import 语句
            ImportDeclaration(node) {
                if (node.source.value === 'react') {
                    hasReactImport = true;
                }

                if (node.source.value === importSource) {
                    hasBoundaryImport = true;
                    // 检查导入的边界组件名称
                    node.specifiers.forEach(spec => {
                        if (spec.type === 'ImportSpecifier') {
                            // 检查是否导入了配置的边界组件之一
                            if (boundaryComponents.includes(spec.imported.name)) {
                                boundaryImportNames.add(spec.local.name);
                            }
                        } else if (spec.type === 'ImportDefaultSpecifier') {
                            // 默认导入，假设是边界组件
                            boundaryImportNames.add(spec.local.name);
                        }
                    });
                }
            },

            // 检查函数声明（可能稍后被导出）
            FunctionDeclaration(node) {
                if (!isReactFile()) {return;}

                if (node.id && isComponentName(node.id.name) && isFunctionComponent(node)) {
                    definedComponents.set(node.id.name, {
                        name: node.id.name,
                        node: node,
                        type: 'function'
                    });
                }
            },

            // 检查变量声明（可能是箭头函数组件）
            VariableDeclaration(node) {
                if (!isReactFile()) {return;}

                node.declarations.forEach(declarator => {
                    if (declarator.id.name && isComponentName(declarator.id.name)
                        && isFunctionComponent(declarator.init)) {
                        definedComponents.set(declarator.id.name, {
                            name: declarator.id.name,
                            node: declarator.init,
                            type: 'variable'
                        });
                    }
                });
            },

            // 检查命名导出
            ExportNamedDeclaration(node) {
                if (!isReactFile()) {return;}

                if (node.declaration) {
                    // export function Component() {} 或 export const Component = () => {}
                    if (node.declaration.type === 'FunctionDeclaration') {
                        const component = node.declaration;
                        if (isFunctionComponent(component)) {
                            exportedComponents.push({
                                name: component.id.name,
                                node: component,
                                type: 'named',
                            });
                        }
                    } else if (node.declaration.type === 'VariableDeclaration') {
                        node.declaration.declarations.forEach(declarator => {
                            if (declarator.id.name && isComponentName(declarator.id.name)
                  && isFunctionComponent(declarator.init)) {
                                exportedComponents.push({
                                    name: declarator.id.name,
                                    node: declarator.init,
                                    type: 'named',
                                });
                            }
                        });
                    }
                } else if (node.specifiers) {
                    // export { Component } 或 export { Component as MyComponent }
                    node.specifiers.forEach(specifier => {
                        if (specifier.type === 'ExportSpecifier') {
                            const localName = specifier.local.name;
                            const exportedName = specifier.exported.name;
                            const definedComponent = definedComponents.get(localName);

                            if (definedComponent) {
                                exportedComponents.push({
                                    name: exportedName,
                                    node: definedComponent.node,
                                    type: 'named',
                                });
                            }
                        }
                    });
                }
            },

            // 检查默认导出
            ExportDefaultDeclaration(node) {
                if (!isReactFile()) {return;}

                let componentNode = null;
                let componentName = 'default';

            if (node.declaration.type === 'FunctionDeclaration') {
                componentNode = node.declaration;
                componentName = node.declaration.id?.name || 'default';
            } else if (node.declaration.type === 'ArrowFunctionExpression'
               || node.declaration.type === 'FunctionExpression') {
                    componentNode = node.declaration;
                } else if (node.declaration.type === 'Identifier') {
                    // export default Component (引用已定义的组件)
                    componentName = node.declaration.name;
                    const definedComponent = definedComponents.get(componentName);
                    if (definedComponent) {
                        exportedComponents.push({
                            name: componentName,
                            node: definedComponent.node,
                            type: 'default',
                        });
                    }
                    return;
                }

                if (componentNode && isFunctionComponent(componentNode)) {
                    exportedComponents.push({
                        name: componentName,
                        node: componentNode,
                        type: 'default',
                    });
                }
            },

            // 程序结束时检查所有导出的组件
            'Program:exit'() {
                if (!isReactFile() || exportedComponents.length === 0) {return;}

                exportedComponents.forEach(component => {
                    if (!isWrappedWithBoundary(component.node)) {
                        // 选择第一个配置的边界组件作为建议
                        const suggestedBoundary = boundaryComponents[0];
                        context.report({
                            node: component.node,
                            messageId: 'missingBoundary',
                            data: {
                                componentName: component.name,
                                boundaryComponent: suggestedBoundary,
                            },
                            // TODO: 实现 auto-fix 功能
                            // fix(fixer) {
                            //     // 自动修复逻辑
                            // }
                        });
                    }
                });
            },
        };
    },
};

const withBoundaryRule = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Ensure React components are exported with withBoundary HOC',
            category: 'Best Practices',
            recommended: true,
        },
        fixable: 'code',
        schema: [
            {
                type: 'object',
                properties: {
                    withBoundaryFunction: {
                        type: 'string',
                        default: 'withBoundary',
                    },
                    importSource: {
                        type: 'string',
                        default: 'react-suspense-boundary',
                    },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            missingWithBoundary: 'React component "{{componentName}}" should be exported with {{withBoundaryFunction}}()',
            directExportNotAllowed: 'Direct export of React component "{{componentName}}" is not allowed. Use {{withBoundaryFunction}}() wrapper.',
        },
    },

    create(context) {
        const options = context.options[0] || {};
        const withBoundaryFunction = options.withBoundaryFunction || 'withBoundary';
        const importSource = options.importSource || 'react-suspense-boundary';

        let hasReactImport = false;
        let hasWithBoundaryImport = false;
        const exportedComponents = [];
        const definedComponents = new Map(); // Track all defined components
        const sourceCode = context.getSourceCode();

        // 检查是否是 React 组件文件
        function isReactFile() {
            const text = sourceCode.getText();
            return hasReactImport
             || text.includes('jsx')
             || text.includes('React')
             || text.includes('<') // 包含 JSX 语法
             || text.includes('JSX')
             || context.getFilename().match(/\.(jsx|tsx)$/);
        }

        // 检查节点是否是函数组件
        function isFunctionComponent(node) {
            if (!node) {return false;}

            // 函数声明: function Component() {}
            if (node.type === 'FunctionDeclaration') {
                const isAnonymous = !node.id;
                return (isAnonymous || isComponentName(node.id?.name)) && hasJSXReturn(node.body);
            }

            // 箭头函数: const Component = () => {}
            if (node.type === 'ArrowFunctionExpression' || node.type === 'FunctionExpression') {
                const body = node.body;
                // 检查是否返回 JSX
                return hasJSXReturn(body);
            }

            return false;
        }

        // 检查节点是否是被 React 高阶函数包装的组件
        function isReactHOCComponent(node) {
            if (!node || node.type !== 'CallExpression') {
                return false;
            }

            const callee = node.callee;

            // 检查是否是 React.forwardRef, React.memo 等
            if (callee.type === 'MemberExpression') {
                const object = callee.object;
                const property = callee.property;

                if (object.name === 'React' &&
                    (property.name === 'forwardRef' ||
                     property.name === 'memo' ||
                     property.name === 'lazy')) {
                    return true;
                }
            }

            // 检查是否是直接导入的 forwardRef, memo 等
            if (callee.type === 'Identifier') {
                if (callee.name === 'forwardRef' ||
                    callee.name === 'memo' ||
                    callee.name === 'lazy') {
                    return true;
                }
            }

            return false;
        }

        // 检查节点是否是组件（包括普通组件和 HOC 包装的组件）
        function isComponent(node) {
            return isFunctionComponent(node) || isReactHOCComponent(node);
        }

        // 检查是否是组件名称（首字母大写）
        function isComponentName(name) {
            return name && /^[A-Z]/.test(name);
        }

        // 检查函数体是否返回 JSX
        function hasJSXReturn(body) {
            if (!body) {return false;}

            // 直接返回 JSX: () => <div>...</div>
            if (body.type === 'JSXElement' || body.type === 'JSXFragment') {
                return true;
            }

            // 块语句中的 return
            if (body.type === 'BlockStatement') {
                return body.body.some(stmt => {
                    if (stmt.type === 'ReturnStatement') {
                        const arg = stmt.argument;
                        return arg && (
                            arg.type === 'JSXElement'
              || arg.type === 'JSXFragment'
              || (arg.type === 'ConditionalExpression' && hasJSXInConditional(arg))
              || (arg.type === 'LogicalExpression' && hasJSXInLogical(arg))
                        );
                    }
                    return false;
                });
            }

            return false;
        }

        // 检查条件表达式中是否有 JSX
        function hasJSXInConditional(node) {
            return (node.consequent && (node.consequent.type === 'JSXElement' || node.consequent.type === 'JSXFragment'))
             || (node.alternate && (node.alternate.type === 'JSXElement' || node.alternate.type === 'JSXFragment'));
        }

        // 检查逻辑表达式中是否有 JSX
        function hasJSXInLogical(node) {
            return (node.left && (node.left.type === 'JSXElement' || node.left.type === 'JSXFragment'))
             || (node.right && (node.right.type === 'JSXElement' || node.right.type === 'JSXFragment'));
        }

        // 检查导出是否使用了 withBoundary 包装
        function isWrappedWithBoundary(node) {
            // 检查是否是函数调用，且调用的是 withBoundary
            if (node.type === 'CallExpression') {
                const callee = node.callee;
                if (callee.type === 'Identifier' && callee.name === withBoundaryFunction) {
                    return true;
                }
            }
            return false;
        }

        // 生成自动修复
        function generateAutoFix(fixer, component, withBoundaryFunction, importSource) {
            const fixes = [];
            const sourceCode = context.getSourceCode();

            // 检查是否已经有 withBoundary 的导入
            let hasWithBoundaryImport = false;
            const program = sourceCode.ast;

            for (const statement of program.body) {
                if (statement.type === 'ImportDeclaration' && statement.source.value === importSource) {
                    // 检查是否已经导入了 withBoundary
                    const hasWithBoundary = statement.specifiers.some(spec =>
                        (spec.type === 'ImportSpecifier' && spec.imported.name === withBoundaryFunction) ||
                        (spec.type === 'ImportDefaultSpecifier' && withBoundaryFunction === 'default')
                    );

                    if (!hasWithBoundary) {
                        // 添加到现有的导入中
                        const lastSpecifier = statement.specifiers[statement.specifiers.length - 1];
                        fixes.push(fixer.insertTextAfter(lastSpecifier, `, ${withBoundaryFunction}`));
                    }
                    hasWithBoundaryImport = true;
                    break;
                }
            }

            // 如果没有找到导入，添加新的导入语句
            if (!hasWithBoundaryImport) {
                const firstImport = program.body.find(node => node.type === 'ImportDeclaration');
                const importStatement = `import { ${withBoundaryFunction} } from '${importSource}';\n`;

                if (firstImport) {
                    fixes.push(fixer.insertTextBefore(firstImport, importStatement));
                } else {
                    fixes.push(fixer.insertTextBefore(program.body[0], importStatement));
                }
            }

            // 修复导出语句
            if (component.exportType === 'direct') {
                // 直接导出的情况，如 export default function Component() {}
                if (component.node.type === 'ExportDefaultDeclaration') {
                    const decl = component.node.declaration;
                    if (decl.type === 'FunctionDeclaration') {
                        // 具名函数声明与匿名函数声明分别处理
                        if (decl.id && decl.id.name) {
                            // export default function Component() {} -> function Component() {} export default withBoundary(Component);
                            const funcDeclaration = decl;
                            const componentName = funcDeclaration.id.name;
                            fixes.push(fixer.replaceText(component.node, sourceCode.getText(funcDeclaration)));
                            fixes.push(fixer.insertTextAfter(component.node, `\n\nexport default ${withBoundaryFunction}(${componentName});`));
                        } else {
                            // 匿名函数声明：export default function() {} -> export default withBoundary(function() {})
                            const original = sourceCode.getText(decl);
                            fixes.push(fixer.replaceText(decl, `${withBoundaryFunction}(${original})`));
                        }
                    } else if (decl.type === 'ArrowFunctionExpression' || decl.type === 'FunctionExpression') {
                        // export default () => {} / export default function() {} (表达式形式)
                        const original = sourceCode.getText(decl);
                        fixes.push(fixer.replaceText(decl, `${withBoundaryFunction}(${original})`));
                    } else if (decl.type === 'Identifier') {
                        // export default Component -> export default withBoundary(Component)
                        const componentName = decl.name;
                        fixes.push(fixer.replaceText(decl, `${withBoundaryFunction}(${componentName})`));
                    } else if (decl.type === 'CallExpression' && isReactHOCComponent(decl)) {
                        // export default forwardRef(...) -> export default withBoundary(forwardRef(...))
                        const original = sourceCode.getText(decl);
                        fixes.push(fixer.replaceText(decl, `${withBoundaryFunction}(${original})`));
                    }
                } else if (component.node.type === 'ExportNamedDeclaration') {
                    if (component.node.declaration) {
                        // export function Component() {} -> function Component() {} export { withBoundary(Component) as Component };
                        if (component.node.declaration.type === 'FunctionDeclaration') {
                            const funcDeclaration = component.node.declaration;
                            const componentName = funcDeclaration.id.name;

                            fixes.push(fixer.replaceText(component.node, sourceCode.getText(funcDeclaration)));
                            fixes.push(fixer.insertTextAfter(component.node, `\n\nconst Wrapped${componentName} = ${withBoundaryFunction}(${componentName});\nexport { Wrapped${componentName} as ${componentName} };`));
                        }
                    }
                }
            } else if (component.exportType === 'reference') {
                // 引用导出的情况，如 export { Component } 或 export default Component
                if (component.node.type === 'ExportDefaultDeclaration' && component.node.declaration.type === 'Identifier') {
                    // export default Component -> export default withBoundary(Component)
                    const componentName = component.node.declaration.name;
                    fixes.push(fixer.replaceText(component.node.declaration, `${withBoundaryFunction}(${componentName})`));
                } else if (component.node.type === 'ExportNamedDeclaration' && component.node.specifiers) {
                    const specifier = component.node.specifiers.find(spec =>
                        spec.type === 'ExportSpecifier' && spec.exported.name === component.name
                    );

                    if (specifier) {
                        const localName = specifier.local.name;
                        const exportedName = specifier.exported.name;

                        // 在导出之前添加包装的变量声明
                        fixes.push(fixer.insertTextBefore(component.node, `const Wrapped${exportedName} = ${withBoundaryFunction}(${localName});\n`));

                        // 修改导出引用
                        fixes.push(fixer.replaceText(specifier, `Wrapped${exportedName} as ${exportedName}`));
                    }
                }
            }

            return fixes;
        }

        return {
            // 检查 import 语句
            ImportDeclaration(node) {
                if (node.source.value === 'react') {
                    hasReactImport = true;
                }

                if (node.source.value === importSource) {
                    hasWithBoundaryImport = true;
                }
            },

            // 检查函数声明（可能稍后被导出）
            FunctionDeclaration(node) {
                if (!isReactFile()) {return;}

                if (node.id && isComponentName(node.id.name) && isFunctionComponent(node)) {
                    definedComponents.set(node.id.name, {
                        name: node.id.name,
                        node: node,
                        type: 'function',
                        isComponent: true
                    });
                }
            },

            // 检查变量声明（可能是箭头函数组件）
            VariableDeclaration(node) {
                if (!isReactFile()) {return;}

                node.declarations.forEach(declarator => {
                    if (declarator.id.name && isComponentName(declarator.id.name)) {
                        if (isComponent(declarator.init)) {
                            // 这是一个组件定义（包括普通组件和 HOC 包装的组件）
                            definedComponents.set(declarator.id.name, {
                                name: declarator.id.name,
                                node: declarator.init,
                                type: 'variable',
                                isComponent: true
                            });
                        } else if (declarator.init && isWrappedWithBoundary(declarator.init)) {
                            // 这是一个用 withBoundary 包装的组件
                            definedComponents.set(declarator.id.name, {
                                name: declarator.id.name,
                                node: declarator.init,
                                type: 'variable',
                                isComponent: false, // 不是直接的组件，而是包装后的
                                isWrapped: true
                            });
                        }
                    }
                });
            },

            // 检查命名导出
            ExportNamedDeclaration(node) {
                if (!isReactFile()) {return;}

                if (node.declaration) {
                    // export function Component() {} 或 export const Component = () => {}
                    if (node.declaration.type === 'FunctionDeclaration') {
                        const component = node.declaration;
                        if (isFunctionComponent(component)) {
                            exportedComponents.push({
                                name: component.id.name,
                                node: node,
                                exportType: 'direct',
                                componentNode: component,
                            });
                        }
                    } else if (node.declaration.type === 'VariableDeclaration') {
                        node.declaration.declarations.forEach(declarator => {
                            if (declarator.id.name && isComponentName(declarator.id.name)
                  && isComponent(declarator.init)) {
                                exportedComponents.push({
                                    name: declarator.id.name,
                                    node: node,
                                    exportType: 'direct',
                                    componentNode: declarator.init,
                                });
                            }
                        });
                    }
                } else if (node.specifiers) {
                    // export { Component } 或 export { Component as MyComponent }
                    node.specifiers.forEach(specifier => {
                        if (specifier.type === 'ExportSpecifier') {
                            const localName = specifier.local.name;
                            const exportedName = specifier.exported.name;
                            const definedComponent = definedComponents.get(localName);

                            if (definedComponent) {
                                // 如果是已经包装的组件，不需要报错
                                if (definedComponent.isWrapped) {
                                    return;
                                }

                                // 只有直接的组件才需要报错
                                if (definedComponent.isComponent) {
                                    exportedComponents.push({
                                        name: exportedName,
                                        node: node,
                                        exportType: 'reference',
                                        componentNode: definedComponent.node,
                                    });
                                }
                            }
                        }
                    });
                }
            },

            // 检查默认导出
            ExportDefaultDeclaration(node) {
                if (!isReactFile()) {return;}

                let componentNode = null;
                let componentName = 'default';
                let exportType = 'direct';

                if (node.declaration.type === 'FunctionDeclaration') {
                    componentNode = node.declaration;
                    componentName = node.declaration.id?.name || 'default';
                } else if (node.declaration.type === 'ArrowFunctionExpression'
                   || node.declaration.type === 'FunctionExpression') {
                    componentNode = node.declaration;
                } else if (node.declaration.type === 'Identifier') {
                    // export default Component (引用已定义的组件)
                    componentName = node.declaration.name;
                    const definedComponent = definedComponents.get(componentName);
                    if (definedComponent) {
                        componentNode = definedComponent.node;
                        exportType = 'reference';
                    }
                } else if (node.declaration.type === 'CallExpression') {
                    // export default withBoundary(Component) - 这是我们想要的形式
                    if (isWrappedWithBoundary(node.declaration)) {
                        // 这是正确的导出方式，不需要报错
                        return;
                    } else if (isReactHOCComponent(node.declaration)) {
                        // export default forwardRef(...) - 这是直接导出 HOC 组件
                        componentNode = node.declaration;
                        componentName = 'default';
                        exportType = 'direct';
                    }
                }

                if (componentNode && isComponent(componentNode)) {
                    exportedComponents.push({
                        name: componentName,
                        node: node,
                        exportType: exportType,
                        componentNode: componentNode,
                    });
                }
            },

            // 程序结束时检查所有导出的组件
            'Program:exit'() {
                if (!isReactFile() || exportedComponents.length === 0) {return;}

                exportedComponents.forEach(component => {
                    // 对于这个规则，我们检查导出是否使用了 withBoundary 包装
                    // 如果是直接导出组件，就报错
                    context.report({
                        node: component.node,
                        messageId: 'directExportNotAllowed',
                        data: {
                            componentName: component.name,
                            withBoundaryFunction: withBoundaryFunction,
                        },
                        fix(fixer) {
                            return generateAutoFix(fixer, component, withBoundaryFunction, importSource);
                        }
                    });
                });
            },
        };
    },
};

module.exports = {
    rules: {
        'require-boundary': rule,
        'require-with-boundary': withBoundaryRule,
    },
};
