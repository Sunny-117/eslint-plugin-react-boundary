/**
 * Comprehensive test file for all require-with-boundary rule features
 * Includes: HOC components, boundary wrapper special cases, and pure wrapper validation
 */

const {ESLint} = require('eslint');

async function testComprehensive() {
    console.log('🧪 Testing comprehensive require-with-boundary rule features...\n');

    // Create ESLint instance with the rule
    const eslint = new ESLint({
        overrideConfigFile: true,
        overrideConfig: [
            {
                files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
                languageOptions: {
                    ecmaVersion: 2020,
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
                        importSource: 'react-suspense-boundary',
                        boundaryComponent: 'Boundary'
                    }],
                },
            },
        ],
    });

    // Create ESLint instance with array config for multi-boundary tests
    const eslintWithArrayConfig = new ESLint({
        overrideConfigFile: true,
        overrideConfig: [
            {
                files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
                languageOptions: {
                    ecmaVersion: 2020,
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
                        importSource: 'react-suspense-boundary',
                        boundaryComponent: ['Boundary', 'ErrorBoundary']
                    }],
                },
            },
        ],
    });

    // Comprehensive test cases
    const testCases = [
        // === HOC Components Tests ===
        {
            name: 'forwardRef component without withBoundary - should fail',
            code: `
        import React, { forwardRef } from 'react';
        
        const MyComponent = forwardRef((props, ref) => {
          return <div ref={ref}>Hello World</div>;
        });
        
        export default MyComponent;
      `,
            shouldHaveErrors: true,
            category: 'HOC',
        },
        {
            name: 'forwardRef component with withBoundary - should pass',
            code: `
        import React, { forwardRef } from 'react';
        import { withBoundary } from 'react-suspense-boundary';
        
        const MyComponent = forwardRef((props, ref) => {
          return <div ref={ref}>Hello World</div>;
        });
        
        export default withBoundary(MyComponent);
      `,
            shouldHaveErrors: false,
            category: 'HOC',
        },
        {
            name: 'memo component without withBoundary - should fail',
            code: `
        import React, { memo } from 'react';
        
        const MyComponent = memo(() => {
          return <div>Memoized Component</div>;
        });
        
        export { MyComponent };
      `,
            shouldHaveErrors: true,
            category: 'HOC',
        },
        {
            name: 'React.memo with withBoundary - should pass',
            code: `
        import React from 'react';
        import { withBoundary } from 'react-suspense-boundary';
        
        const MyComponent = React.memo(() => {
          return <div>Memoized Component</div>;
        });
        
        export default withBoundary(MyComponent);
      `,
            shouldHaveErrors: false,
            category: 'HOC',
        },
        {
            name: 'lazy component without withBoundary - should fail',
            code: `
        import React, { lazy } from 'react';
        
        const LazyComponent = lazy(() => import('./SomeComponent'));
        
        export default LazyComponent;
      `,
            shouldHaveErrors: true,
            category: 'HOC',
        },
        {
            name: 'nested HOCs with withBoundary - should pass',
            code: `
        import React, { memo, forwardRef } from 'react';
        import { withBoundary } from 'react-suspense-boundary';
        
        const MyComponent = memo(forwardRef((props, ref) => {
          return <div ref={ref}>Nested HOCs</div>;
        }));
        
        export default withBoundary(MyComponent);
      `,
            shouldHaveErrors: false,
            category: 'HOC',
        },

        // === Pure Wrapper Tests ===
        {
            name: 'Pure wrapper - only return statement - should pass',
            code: `
        import { Boundary } from 'react-suspense-boundary';
        
        function Cpp() {
            return <div>Cpp</div>;
        }
        
        export default () => { 
            return <Boundary>
                <Cpp />
            </Boundary>
        };
      `,
            shouldHaveErrors: false,
            category: 'Pure Wrapper',
        },
        {
            name: 'Impure wrapper - has variable declaration - should fail',
            code: `
        import { Boundary } from 'react-suspense-boundary';
        
        function Cpp() {
            return <div>Cpp</div>;
        }
        
        export default () => { 
            const someVar = 'test';
            return <Boundary>
                <Cpp />
            </Boundary>
        };
      `,
            shouldHaveErrors: true,
            category: 'Pure Wrapper',
        },
        {
            name: 'Impure wrapper - has useEffect - should fail',
            code: `
        import React, { useEffect } from 'react';
        import { Boundary } from 'react-suspense-boundary';
        
        function Cpp() {
            return <div>Cpp</div>;
        }
        
        export default () => { 
            useEffect(() => {}, []);
            return <Boundary>
                <Cpp />
            </Boundary>
        };
      `,
            shouldHaveErrors: true,
            category: 'Pure Wrapper',
        },
        {
            name: 'Pure wrapper with comments - should pass',
            code: `
        import { Boundary } from 'react-suspense-boundary';
        
        function Cpp() {
            return <div>Cpp</div>;
        }
        
        export default () => { 
            // This is just a comment
            return <Boundary>
                <Cpp />
            </Boundary>
        };
      `,
            shouldHaveErrors: false,
            category: 'Pure Wrapper',
        },

        // === Boundary Position Tests ===
        {
            name: 'Boundary at root level - should pass',
            code: `
        import { Boundary } from 'react-suspense-boundary';
        
        function Cpp() {
            return <div>Cpp</div>;
        }
        
        export default () => { 
            return <Boundary>
                <div>
                    <Cpp />
                </div>
            </Boundary>
        };
      `,
            shouldHaveErrors: false,
            category: 'Boundary Position',
        },
        {
            name: 'Boundary not at root - should fail',
            code: `
        import { Boundary } from 'react-suspense-boundary';
        
        function Cpp() {
            return <div>Cpp</div>;
        }
        
        export default () => { 
            return <div>
                <Boundary>
                    <Cpp />
                </Boundary>
            </div>
        };
      `,
            shouldHaveErrors: true,
            category: 'Boundary Position',
        },

        // === Array Config Test ===
        {
            name: 'ErrorBoundary wrapper (array config) - should pass',
            code: `
        import { ErrorBoundary } from 'react-suspense-boundary';
        
        function Cpp() {
            return <div>Cpp</div>;
        }
        
        export default () => { 
            return <ErrorBoundary>
                <Cpp />
            </ErrorBoundary>
        };
      `,
            shouldHaveErrors: false,
            category: 'Array Config',
            useArrayConfig: true,
        },

        // === Regular Component Test ===
        {
            name: 'Regular component without boundary - should fail',
            code: `
        function MyComponent() {
            return <div>Regular Component</div>;
        }
        
        export default MyComponent;
      `,
            shouldHaveErrors: true,
            category: 'Regular',
        },
    ];

    let allTestsPassed = true;
    const categories = {};

    for (const testCase of testCases) {
        if (!categories[testCase.category]) {
            categories[testCase.category] = [];
        }
        categories[testCase.category].push(testCase);
    }

    // Run tests by category
    for (const [category, tests] of Object.entries(categories)) {
        console.log(`\n📂 ${category} Tests:`);
        console.log('─'.repeat(50));

        for (const testCase of tests) {
            console.log(`📝 Testing: ${testCase.name}`);

            try {
                // Use array config for specific test cases
                const eslintInstance = testCase.useArrayConfig ? eslintWithArrayConfig : eslint;
                
                const results = await eslintInstance.lintText(testCase.code, {
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
    }

    console.log('\n' + '='.repeat(50));
    if (allTestsPassed) {
        console.log('🎉 All comprehensive tests passed! All features are working correctly.');
    } else {
        console.log('💥 Some comprehensive tests failed. Please check the implementation.');
        process.exit(1);
    }
}

// Run tests
testComprehensive().catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
});
