# eslint-plugin-react-boundary

ESLint plugin to ensure React components are wrapped with `<Boundary>` component for better error handling.

## Installation

```bash
npm install --save-dev eslint-plugin-react-boundary
```

## Usage

Add `react-boundary` to the plugins section of your `.eslintrc` configuration file:

```json
{
  "plugins": ["react-boundary"],
  "rules": {
    "react-boundary/require-boundary": "error"
  }
}
```

## Rule: require-boundary

This rule ensures that all exported React components are wrapped with a `<Boundary>` component.

### Options

The rule accepts an options object with the following properties:

- `boundaryComponent` (string): The name of the boundary component to check for. Default: `"Boundary"`
- `importSource` (string): The module from which the boundary component should be imported. Default: `"react-suspense-boundary"`

Example configuration:

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

### Examples

#### ❌ Incorrect

```jsx
// Missing Boundary wrapper
export function MyComponent() {
  return <div>Hello World</div>;
}

// Default export without Boundary
export default function App() {
  return <div>App</div>;
}

// Named export without Boundary
export const Header = () => {
  return <header>Header</header>;
};
```

#### ✅ Correct

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

// Default export with Boundary
export default function App() {
  return (
    <Boundary>
      <div>App</div>
    </Boundary>
  );
}

// Named export with Boundary
export const Header = () => {
  return (
    <Boundary>
      <header>Header</header>
    </Boundary>
  );
};
```

## What it checks

The plugin checks for:

1. **Named exports**: `export function Component()`, `export const Component = ()`
2. **Default exports**: `export default function Component()`, `export default () => {}`
3. **Function components**: Components that return JSX elements
4. **Component naming**: Functions with names starting with uppercase letters
5. **JSX returns**: Functions that return JSX elements, fragments, or conditional JSX

## Features

- Detects React component files automatically
- Supports both function declarations and arrow functions
- Handles named and default exports
- Configurable boundary component name and import source
- Provides helpful error messages
- Auto-fix capability (basic implementation)

## Development

To test the plugin locally:

1. Clone the repository
2. Run `npm install`
3. Run tests: `npm run test-cases`
4. Run demo: `node demo/run-demo.js`

### Running Tests

```bash
npm run test
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
