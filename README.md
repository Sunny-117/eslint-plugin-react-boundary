# eslint-plugin-react-boundary

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![bundle][bundle-src]][bundle-href]
[![JSDocs][jsdocs-src]][jsdocs-href]
[![License][license-src]][license-href]

ESLint plugin to ensure React components are properly wrapped with error boundaries for better error handling and application stability.

## Why Error Boundaries Matter

Error boundaries are crucial for React applications because they prevent component errors from crashing the entire application. However, traditional `<Boundary>` components have limitations and cannot catch errors in:

- **Event handlers** (these need try/catch blocks)
- **Asynchronous code** (setTimeout, Promise, async/await, etc.)
- **Server-side rendering** errors
- **Component definition stage errors** (errors during component initialization)

This is why we provide two complementary approaches:

1. **`<Boundary>` wrapper**: Catches rendering errors within component trees
2. **`withBoundary()` HOC**: Provides additional error handling at the component level, including initialization errors

## Installation

```bash
npm install --save-dev eslint-plugin-react-boundary
```

## Configuration

### ESLint 9+ (Flat Config)

```javascript
// eslint.config.js
export default [
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      'react-boundary': require('eslint-plugin-react-boundary')
    },
    rules: {
      'react-boundary/require-boundary': 'error',
      'react-boundary/require-with-boundary': 'error'
    }
  }
];
```

### ESLint 8 and below (Legacy Config)

```json
{
  "plugins": ["react-boundary"],
  "rules": {
    "react-boundary/require-boundary": "error",
    "react-boundary/require-with-boundary": "error"
  }
}
```

## Rules

### Rule: `require-boundary`

This rule ensures that all exported React components have their JSX content wrapped with a `<Boundary>` component to catch rendering errors.

#### Options

- `boundaryComponent` (string | string[]): The name(s) of the boundary component(s) to check for. Default: `"Boundary"`
- `importSource` (string): The module from which the boundary component should be imported. Default: `"react-suspense-boundary"`

#### Configuration Examples

**Single boundary component:**
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

**Multiple boundary components:**
```json
{
  "rules": {
    "react-boundary/require-boundary": [
      "error",
      {
        "boundaryComponent": ["Boundary", "ErrorBoundary"],
        "importSource": "@/components/ErrorBoundary"
      }
    ]
  }
}
```

#### Examples

**❌ Incorrect:**
```jsx
// Missing Boundary wrapper
export function MyComponent() {
  return <div>Hello World</div>;
}

// Separate definition and export without Boundary
function NewOverview() {
  return <div>Overview</div>;
}
export default NewOverview;
```

**✅ Correct:**
```jsx
import { Boundary } from 'react-suspense-boundary';

// Wrapped with Boundary
export function MyComponent() {
  return (
    <Boundary>
      <div>Hello World</div>
    </Boundary>
  );
}

// Separate definition with Boundary
function NewOverview() {
  return (
    <Boundary>
      <div>Overview</div>
    </Boundary>
  );
}
export default NewOverview;
```

### Rule: `require-with-boundary`

This rule ensures that all exported React components are wrapped with a `withBoundary()` Higher-Order Component (HOC) to provide comprehensive error handling, including component initialization errors.

#### Why `withBoundary()` is necessary

While `<Boundary>` components catch rendering errors, they cannot catch:

- **Event handler errors**: Errors in onClick, onChange, etc. handlers
- **Asynchronous errors**: Errors in setTimeout, Promise chains, async/await
- **Server-side rendering errors**: Errors during SSR
- **Component definition errors**: Errors during component initialization/construction

The `withBoundary()` HOC provides additional error handling at the component level to catch these scenarios.

#### Options

- `withBoundaryFunction` (string): The name of the HOC function. Default: `"withBoundary"`
- `importSource` (string): The module from which the HOC should be imported. Default: `"react-suspense-boundary"`
- `boundaryComponent` (string | string[]): Boundary component name(s) for special case detection. Default: `"Boundary"`
- `enableHOCDetection` (boolean): Whether to detect and validate React HOC components (forwardRef, memo, lazy, etc.). Default: `true`

#### Configuration Examples

**Basic Configuration:**
```json
{
  "rules": {
    "react-boundary/require-with-boundary": [
      "error",
      {
        "withBoundaryFunction": "withBoundary",
        "importSource": "@/components/ErrorBoundary"
      }
    ]
  }
}
```

**Advanced Configuration:**
```json
{
  "rules": {
    "react-boundary/require-with-boundary": [
      "error",
      {
        "withBoundaryFunction": "withBoundary",
        "importSource": "react-suspense-boundary",
        "boundaryComponent": ["Boundary", "ErrorBoundary"],
        "enableHOCDetection": true
      }
    ]
  }
}
```

**Disable HOC Detection:**
```json
{
  "rules": {
    "react-boundary/require-with-boundary": [
      "error",
      {
        "withBoundaryFunction": "withBoundary",
        "importSource": "react-suspense-boundary",
        "enableHOCDetection": false
      }
    ]
  }
}
```

#### HOC Detection

When `enableHOCDetection` is `true` (default), the rule will also validate React Higher-Order Components:

- `React.forwardRef()` / `forwardRef()`
- `React.memo()` / `memo()`
- `React.lazy()` / `lazy()`
- Nested HOCs like `memo(forwardRef(...))`

**❌ HOC Examples (when enableHOCDetection: true):**
```jsx
import React, { forwardRef, memo, lazy } from 'react';

// forwardRef without withBoundary - not allowed
export default forwardRef((props, ref) => {
  return <div ref={ref}>Component</div>;
});

// memo without withBoundary - not allowed
export const MemoComponent = memo(() => {
  return <div>Memoized</div>;
});

// lazy without withBoundary - not allowed
export default lazy(() => import('./Component'));
```

**✅ HOC Examples (corrected):**
```jsx
import React, { forwardRef, memo, lazy } from 'react';
import { withBoundary } from 'react-suspense-boundary';

// forwardRef with withBoundary
export default withBoundary(forwardRef((props, ref) => {
  return <div ref={ref}>Component</div>;
}));

// memo with withBoundary
const MemoComponent = memo(() => {
  return <div>Memoized</div>;
});
export const WrappedMemoComponent = withBoundary(MemoComponent);

// lazy with withBoundary
export default withBoundary(lazy(() => import('./Component')));
```

#### Examples

**❌ Incorrect:**
```jsx
// Direct export - not allowed
export default function NewOverview() {
  return <div>Overview</div>;
}

// Direct named export - not allowed
function MyComponent() {
  return <div>Component</div>;
}
export { MyComponent };
```

**✅ Correct:**
```jsx
import { withBoundary } from 'react-suspense-boundary';

// Wrapped with withBoundary HOC
function NewOverview() {
  return <div>Overview</div>;
}
export default withBoundary(NewOverview);

// Named export with withBoundary
function MyComponent() {
  return <div>Component</div>;
}
const WrappedComponent = withBoundary(MyComponent);
export { WrappedComponent };
```

## Combining Both Rules

For maximum error coverage, use both rules together:

```json
{
  "rules": {
    "react-boundary/require-boundary": [
      "error",
      {
        "boundaryComponent": ["Boundary", "ErrorBoundary"],
        "importSource": "@/components/ErrorBoundary"
      }
    ],
    "react-boundary/require-with-boundary": [
      "error",
      {
        "withBoundaryFunction": "withBoundary",
        "importSource": "@/components/ErrorBoundary"
      }
    ]
  }
}
```

**Example with both approaches:**
```jsx
import { Boundary, withBoundary } from '@/components/ErrorBoundary';

// Component with both protections
function MyComponent() {
  return (
    <Boundary>
      <div>Protected content</div>
    </Boundary>
  );
}

// Export with HOC wrapper for additional protection
export default withBoundary(MyComponent);
```

## What the Plugin Checks

Both rules automatically detect:

1. **React component files**: Files containing JSX, React imports, or .jsx/.tsx extensions
2. **Function components**: Functions that return JSX elements
3. **Component naming**: Functions with names starting with uppercase letters
4. **Export patterns**:
   - Named exports: `export function Component()`, `export const Component = ()`
   - Default exports: `export default function Component()`, `export default Component`
   - Separate definition and export: `function Component() {}; export default Component;`
5. **JSX returns**: Functions returning JSX elements, fragments, or conditional JSX

## Features

- ✅ Detects React component files automatically
- ✅ Supports function declarations and arrow functions
- ✅ Handles named and default exports
- ✅ Supports separate definition and export patterns
- ✅ Configurable boundary component names (supports arrays)
- ✅ Configurable import sources
- ✅ Comprehensive error messages
- ✅ Two complementary error handling strategies

## Development

### Running Tests

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run specific test suites
npm run test-cases          # Core rule tests
npm run test-separate       # Separate export tests
node test-array-config.js   # Array configuration tests
node test-with-boundary.js  # withBoundary rule tests
```

### Project Structure

```
eslint-plugin-react-boundary/
├── index.js                    # Main plugin file with both rules
├── test/
│   └── test-cases.js          # Core test suite
├── test-plugin.js             # Integration tests
├── test-separate-export.js    # Separate export functionality tests
├── test-array-config.js       # Array configuration tests
├── test-with-boundary.js      # withBoundary rule tests
├── playground/                # Test environment
└── examples/                  # Example files
```

## Error Handling Coverage

| Error Type | `<Boundary>` | `withBoundary()` | Recommended Solution |
|------------|--------------|------------------|---------------------|
| Rendering errors | ✅ | ✅ | Either approach |
| Event handler errors | ❌ | ✅ | `withBoundary()` + try/catch |
| Async errors | ❌ | ✅ | `withBoundary()` + proper async handling |
| SSR errors | ❌ | ✅ | `withBoundary()` |
| Component init errors | ❌ | ✅ | `withBoundary()` |

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.


## License

[MIT](./LICENSE) License © [Sunny-117](https://github.com/Sunny-117)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/eslint-plugin-react-boundary?style=flat&colorA=080f12&colorB=1fa669
[npm-version-href]: https://npmjs.com/package/eslint-plugin-react-boundary
[npm-downloads-src]: https://img.shields.io/npm/dm/eslint-plugin-react-boundary?style=flat&colorA=080f12&colorB=1fa669
[npm-downloads-href]: https://npmjs.com/package/eslint-plugin-react-boundary
[bundle-src]: https://img.shields.io/bundlephobia/minzip/eslint-plugin-react-boundary?style=flat&colorA=080f12&colorB=1fa669&label=minzip
[bundle-href]: https://bundlephobia.com/result?p=eslint-plugin-react-boundary
[license-src]: https://img.shields.io/github/license/Sunny-117/eslint-plugin-react-boundary.svg?style=flat&colorA=080f12&colorB=1fa669
[license-href]: https://github.com/Sunny-117/eslint-plugin-react-boundary/blob/main/LICENSE
[jsdocs-src]: https://img.shields.io/badge/jsdocs-reference-080f12?style=flat&colorA=080f12&colorB=1fa669
[jsdocs-href]: https://www.jsdocs.io/package/eslint-plugin-react-boundary
