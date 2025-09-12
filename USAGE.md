# 使用指南

## 快速开始

### 1. 安装插件

```bash
npm install --save-dev eslint-plugin-react-boundary
```

### 2. 配置 ESLint

在你的 `.eslintrc.js` 或 `.eslintrc.json` 中添加：

```json
{
  "plugins": ["react-boundary"],
  "rules": {
    "react-boundary/require-boundary": "error"
  }
}
```

### 3. 运行 ESLint

```bash
npx eslint src/**/*.{js,jsx,ts,tsx}
```

## 配置选项

### 基本配置

```json
{
  "rules": {
    "react-boundary/require-boundary": "error"
  }
}
```

### 自定义配置

```json
{
  "rules": {
    "react-boundary/require-boundary": [
      "error",
      {
        "boundaryComponent": "ErrorBoundary",
        "importSource": "@/components/ErrorBoundary"
      }
    ]
  }
}
```

## 支持的组件模式

### 1. 函数声明

```jsx
// ❌ 错误
export function MyComponent() {
  return <div>Hello</div>;
}

// ✅ 正确
export function MyComponent() {
  return (
    <Boundary>
      <div>Hello</div>
    </Boundary>
  );
}
```

### 2. 箭头函数

```jsx
// ❌ 错误
export const MyComponent = () => {
  return <div>Hello</div>;
};

// ✅ 正确
export const MyComponent = () => {
  return (
    <Boundary>
      <div>Hello</div>
    </Boundary>
  );
};
```

### 3. 默认导出

```jsx
// ❌ 错误
export default function App() {
  return <div>App</div>;
}

// ✅ 正确
export default function App() {
  return (
    <Boundary>
      <div>App</div>
    </Boundary>
  );
}
```

### 4. 条件渲染

```jsx
// ❌ 错误
export const ConditionalComponent = ({ show }) => {
  return show ? <div>Shown</div> : null;
};

// ✅ 正确
export const ConditionalComponent = ({ show }) => {
  return (
    <Boundary>
      {show ? <div>Shown</div> : null}
    </Boundary>
  );
};
```

## 自动修复

插件支持自动修复功能，可以自动添加 Boundary 包裹：

```bash
# 自动修复
npx eslint src/**/*.{js,jsx,ts,tsx} --fix
```

自动修复会：
1. 自动添加 Boundary 的 import 语句（如果缺失）
2. 自动用 Boundary 包裹组件的返回值

## 集成到 CI/CD

### GitHub Actions

```yaml
name: ESLint Check
on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm install
      - run: npx eslint src/**/*.{js,jsx,ts,tsx}
```

### Pre-commit Hook

使用 husky 和 lint-staged：

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "src/**/*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "git add"
    ]
  }
}
```

## 常见问题

### Q: 为什么我的组件没有被检查？

A: 插件只检查：
- 导出的函数组件
- 函数名以大写字母开头
- 返回 JSX 的函数

### Q: 如何排除某些文件？

A: 使用 ESLint 的 `.eslintignore` 文件或配置：

```json
{
  "ignorePatterns": ["src/legacy/**/*.js"]
}
```

### Q: 如何自定义 Boundary 组件名？

A: 在规则配置中指定：

```json
{
  "rules": {
    "react-boundary/require-boundary": [
      "error",
      {
        "boundaryComponent": "MyCustomBoundary",
        "importSource": "@/components/MyCustomBoundary"
      }
    ]
  }
}
```

## 最佳实践

1. **在项目初期配置**：越早配置越好，避免后期大量修改
2. **使用自动修复**：利用 `--fix` 选项自动添加 Boundary
3. **配置 CI/CD**：确保所有提交都符合规范
4. **团队培训**：确保团队成员了解为什么需要 Boundary 包裹

## 性能考虑

- 插件只在 ESLint 运行时工作，不影响运行时性能
- 建议在开发环境和 CI/CD 中使用
- 可以通过 `.eslintignore` 排除不需要检查的文件
