/**
 * Test cases for eslint-plugin-react-boundary
 */

const {RuleTester} = require('eslint');
const rule = require('../index').rules['require-boundary'];

const ruleTester = new RuleTester({
    languageOptions: {
        ecmaVersion: 2018,
        sourceType: 'module',
        parserOptions: {
            ecmaFeatures: {
                jsx: true,
            },
        },
    },
});

// Valid test cases (should not trigger the rule)
const valid = [
    // Component wrapped with Boundary
    {
        code: `
      import { Boundary } from 'react-suspense-boundary';
      
      export function MyComponent() {
        return (
          <Boundary>
            <div>Hello World</div>
          </Boundary>
        );
      }
    `,
    },

    // Default export with Boundary
    {
        code: `
      import { Boundary } from 'react-suspense-boundary';
      
      export default function App() {
        return (
          <Boundary>
            <div>App</div>
          </Boundary>
        );
      }
    `,
    },

    // Arrow function with Boundary
    {
        code: `
      import { Boundary } from 'react-suspense-boundary';
      
      export const Header = () => {
        return (
          <Boundary>
            <header>Header</header>
          </Boundary>
        );
      }
    `,
    },

    // Non-React file (should be ignored)
    {
        code: `
      export function utilityFunction() {
        return "not a component";
      }
    `,
    },

    // Non-component export (should be ignored)
    {
        code: `
      export const config = {
        apiUrl: 'https://api.example.com'
      };
    `,
    },

    // Component defined first, then exported with default export (wrapped with Boundary)
    {
        code: `
      import { Boundary } from 'react-suspense-boundary';

      function MyComponent() {
        return (
          <Boundary>
            <div>Hello World</div>
          </Boundary>
        );
      }

      export default MyComponent;
    `,
    },

    // Component defined first, then exported with named export (wrapped with Boundary)
    {
        code: `
      import { Boundary } from 'react-suspense-boundary';

      function MyComponent() {
        return (
          <Boundary>
            <div>Hello World</div>
          </Boundary>
        );
      }

      export { MyComponent };
    `,
    },

    // Arrow function component defined first, then exported (wrapped with Boundary)
    {
        code: `
      import { Boundary } from 'react-suspense-boundary';

      const Header = () => {
        return (
          <Boundary>
            <header>Header</header>
          </Boundary>
        );
      }

      export { Header };
    `,
    },

    {
      code: `
      function CrowdCoverage() {
        return <div>123</div>
      }
      export default withBoundary({
          pendingFallback() {
              return <Loading />;
          },
          renderError() {
              return <div className="error">接口异常，请刷新重试</div>;
          },
      })(CrowdCoverage);
      `
    },
    // Component with conditional JSX with Boundary
    {
      code: `
      export const ConditionalComponent = ({ show }) => {
        return (
          <Boundary>
            {show ? <div>Shown</div> : null}
          </Boundary>
        );
      };
      `
    }
];

// Invalid test cases (should trigger the rule)
const invalid = [
    // Function component without Boundary
    {
        code: `
      export function MyComponent() {
        return <div>Hello World</div>;
      }
    `,
        errors: [{
            messageId: 'missingBoundary',
            data: {
                componentName: 'MyComponent',
                boundaryComponent: 'Boundary',
            },
        }],
    },

    // Default export without Boundary
    {
        code: `
      export default function App() {
        return <div>App</div>;
      }
    `,
        errors: [{
            messageId: 'missingBoundary',
            data: {
                componentName: 'App',
                boundaryComponent: 'Boundary',
            },
        }],
    },

    // Arrow function without Boundary
    {
        code: `
      export const Header = () => {
        return <header>Header</header>;
      }
    `,
        errors: [{
            messageId: 'missingBoundary',
            data: {
                componentName: 'Header',
                boundaryComponent: 'Boundary',
            },
        }],
    },

    // Multiple components, some without Boundary
    {
        code: `
      import { Boundary } from 'react-suspense-boundary';
      
      export function GoodComponent() {
        return (
          <Boundary>
            <div>Good</div>
          </Boundary>
        );
      }
      
      export function BadComponent() {
        return <div>Bad</div>;
      }
    `,
        errors: [{
            messageId: 'missingBoundary',
            data: {
                componentName: 'BadComponent',
                boundaryComponent: 'Boundary',
            },
        }],
    },

    // Component with conditional JSX without Boundary
    {
        code: `
      export function ConditionalComponent({ show }) {
        return show ? <div>Shown</div> : <div>Hidden</div>;
      }
    `,
        errors: [{
            messageId: 'missingBoundary',
            data: {
                componentName: 'ConditionalComponent',
                boundaryComponent: 'Boundary',
            },
        }],
    },

    // Component defined first, then exported with default export (without Boundary)
    {
        code: `
      function MyComponent() {
        return <div>Hello World</div>;
      }

      export default MyComponent;
    `,
        errors: [{
            messageId: 'missingBoundary',
            data: {
                componentName: 'MyComponent',
                boundaryComponent: 'Boundary',
            },
        }],
    },

    // Component defined first, then exported with named export (without Boundary)
    {
        code: `
      function MyComponent() {
        return <div>Hello World</div>;
      }

      export { MyComponent };
    `,
        errors: [{
            messageId: 'missingBoundary',
            data: {
                componentName: 'MyComponent',
                boundaryComponent: 'Boundary',
            },
        }],
    },

    // Arrow function component defined first, then exported (without Boundary)
    {
        code: `
      const Header = () => {
        return <header>Header</header>;
      }

      export { Header };
    `,
        errors: [{
            messageId: 'missingBoundary',
            data: {
                componentName: 'Header',
                boundaryComponent: 'Boundary',
            },
        }],
    },

    // Multiple components, some defined and exported separately
    {
        code: `
      import { Boundary } from 'react-suspense-boundary';

      function GoodComponent() {
        return (
          <Boundary>
            <div>Good</div>
          </Boundary>
        );
      }

      function BadComponent() {
        return <div>Bad</div>;
      }

      export { GoodComponent, BadComponent };
    `,
        errors: [{
            messageId: 'missingBoundary',
            data: {
                componentName: 'BadComponent',
                boundaryComponent: 'Boundary',
            },
        }],
    },
];

// Run the tests
ruleTester.run('require-boundary', rule, {
    valid,
    invalid,
});

// eslint-disable-next-line no-console
console.log('All tests passed!');
