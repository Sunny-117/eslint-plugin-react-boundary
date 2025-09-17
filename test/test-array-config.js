/**
 * Test file to demonstrate the array configuration functionality for boundary components
 */

const {ESLint} = require('eslint');

async function testArrayConfig() {
    console.log('🧪 Testing array configuration for boundary components...\n');

    // Create ESLint instance with array configuration
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
                    'react-boundary/require-boundary': ['error', {
                        boundaryComponent: ['Boundary', 'ErrorBoundary'],
                        importSource: '@/components/ErrorBoundary'
                    }],
                },
            },
        ],
    });

    // Test cases for array configuration
    const testCases = [
        {
            name: 'Component wrapped with Boundary (first option) - should pass',
            code: `
        import { Boundary } from '@/components/ErrorBoundary';
        
        function MyComponent() {
          return (
            <Boundary>
              <div>Hello World</div>
            </Boundary>
          );
        }
        
        export default MyComponent;
      `,
            shouldHaveErrors: false,
        },
        {
            name: 'Component wrapped with ErrorBoundary (second option) - should pass',
            code: `
        import { ErrorBoundary } from '@/components/ErrorBoundary';
        
        function MyComponent() {
          return (
            <ErrorBoundary>
              <div>Hello World</div>
            </ErrorBoundary>
          );
        }
        
        export { MyComponent };
      `,
            shouldHaveErrors: false,
        },
        {
            name: 'Component wrapped with both options in different components - should pass',
            code: `
        import { Boundary, ErrorBoundary } from '@/components/ErrorBoundary';
        
        function ComponentA() {
          return (
            <Boundary>
              <div>Component A</div>
            </Boundary>
          );
        }
        
        function ComponentB() {
          return (
            <ErrorBoundary>
              <div>Component B</div>
            </ErrorBoundary>
          );
        }
        
        export { ComponentA, ComponentB };
      `,
            shouldHaveErrors: false,
        },
        {
            name: 'Component without any boundary wrapper - should fail',
            code: `
        function MyComponent() {
          return <div>Hello World</div>;
        }
        
        export default MyComponent;
      `,
            shouldHaveErrors: true,
        },
        {
            name: 'Component wrapped with unknown boundary - should fail',
            code: `
        import { UnknownBoundary } from '@/components/ErrorBoundary';
        
        function MyComponent() {
          return (
            <UnknownBoundary>
              <div>Hello World</div>
            </UnknownBoundary>
          );
        }
        
        export default MyComponent;
      `,
            shouldHaveErrors: true,
        },
        {
            name: 'Mixed components - some wrapped, some not - should fail for unwrapped',
            code: `
        import { ErrorBoundary } from '@/components/ErrorBoundary';
        
        function GoodComponent() {
          return (
            <ErrorBoundary>
              <div>Good</div>
            </ErrorBoundary>
          );
        }
        
        function BadComponent() {
          return <div>Bad</div>;
        }
        
        export { GoodComponent, BadComponent };
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
        console.log('🎉 All array configuration tests passed! Multiple boundary components are supported.');
    } else {
        console.log('💥 Some tests failed. Please check the implementation.');
        process.exit(1);
    }
}

// Run tests
testArrayConfig().catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
});
