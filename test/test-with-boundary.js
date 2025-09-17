/**
 * Test file for the new require-with-boundary rule
 */

const {ESLint} = require('eslint');

async function testWithBoundaryRule() {
    console.log('🧪 Testing require-with-boundary rule...\n');

    // Create ESLint instance with the new rule
    const eslint = new ESLint({
        overrideConfigFile: true,
        overrideConfig: [
            {
                files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
                languageOptions: {
                    ecmaVersion: 2018,
                    sourceType: 'module',
                    parserOptions: {
                        ecmaFeatures: {
                            jsx: true,
                        },
                    },
                },
                plugins: {
                    'react-boundary': require('../index'),
                },
                rules: {
                    'react-boundary/require-with-boundary': ['error', {
                        withBoundaryFunction: 'withBoundary',
                        importSource: 'react-suspense-boundary'
                    }],
                },
            },
        ],
    });

    // Test cases for the new rule
    const testCases = [
        {
            name: 'Default export with withBoundary wrapper - should pass',
            code: `
        import { withBoundary } from 'react-suspense-boundary';
        
        function NewOverview() {
          return <div>Overview</div>;
        }
        
        export default withBoundary(NewOverview);
      `,
            shouldHaveErrors: false,
        },
        {
            name: 'Named export with withBoundary wrapper - should pass',
            code: `
        import { withBoundary } from 'react-suspense-boundary';

        function MyComponent() {
          return <div>Component</div>;
        }

        const WrappedComponent = withBoundary(MyComponent);
        export { WrappedComponent };
      `,
            shouldHaveErrors: false,
        },
        {
            name: 'Direct default export of component - should fail',
            code: `
        function NewOverview() {
          return <div>Overview</div>;
        }
        
        export default NewOverview;
      `,
            shouldHaveErrors: true,
        },
        {
            name: 'Direct named export of component - should fail',
            code: `
        export function MyComponent() {
          return <div>Component</div>;
        }
      `,
            shouldHaveErrors: true,
        },
        {
            name: 'Direct export of arrow function component - should fail',
            code: `
        const Header = () => {
          return <header>Header</header>;
        }
        
        export { Header };
      `,
            shouldHaveErrors: true,
        },
        {
            name: 'Direct default export of inline function - should fail',
            code: `
        export default function App() {
          return <div>App</div>;
        }
      `,
            shouldHaveErrors: true,
        },
        {
            name: 'Non-React file - should be ignored',
            code: `
        export function utilityFunction() {
          return "not a component";
        }
        
        export const config = {
          apiUrl: 'https://api.example.com'
        };
      `,
            shouldHaveErrors: false,
        },
        {
            name: 'Mixed exports - some wrapped, some not - should fail for unwrapped',
            code: `
        import { withBoundary } from 'react-suspense-boundary';
        
        function GoodComponent() {
          return <div>Good</div>;
        }
        
        function BadComponent() {
          return <div>Bad</div>;
        }
        
        export default withBoundary(GoodComponent);
        export { BadComponent };
      `,
            shouldHaveErrors: true,
        },
    ];

    let allTestsPassed = true;

    for (const testCase of testCases) {
        console.log(`📝 Testing: ${testCase.name}`);

        try {
            const results = await eslint.lintText(testCase.code, {
                filePath: 'test.jsx',
            });

            const hasErrors = results[0].messages.length > 0;
            const passed = hasErrors === testCase.shouldHaveErrors;

            if (passed) {
                console.log(`✅ PASS: ${testCase.name}`);
                if (hasErrors) {
                    console.log('   Found expected errors:');
                    results[0].messages.forEach(msg => {
                        console.log(`   - ${msg.message}`);
                    });
                }
            } else {
                console.log(`❌ FAIL: ${testCase.name}`);
                console.log(`   Expected errors: ${testCase.shouldHaveErrors}, Got errors: ${hasErrors}`);
                if (hasErrors) {
                    results[0].messages.forEach(msg => {
                        console.log(`   - ${msg.message}`);
                    });
                }
                allTestsPassed = false;
            }
        } catch (error) {
            console.log(`❌ ERROR: ${testCase.name}`);
            console.log(`   ${error.message}`);
            allTestsPassed = false;
        }

        console.log('');
    }

    console.log('\n' + '='.repeat(50));
    if (allTestsPassed) {
        console.log('🎉 All require-with-boundary tests passed! New rule is working correctly.');
    } else {
        console.log('💥 Some tests failed. Please check the implementation.');
        process.exit(1);
    }
}

// Run tests
testWithBoundaryRule().catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
});
