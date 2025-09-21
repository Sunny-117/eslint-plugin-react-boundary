/**
 * Test file for React HOC components (forwardRef, memo, etc.) with require-with-boundary rule
 */

const {ESLint} = require('eslint');

async function testHOCComponents() {
    console.log('🧪 Testing React HOC components with require-with-boundary rule...\n');

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
                        importSource: 'react-suspense-boundary'
                    }],
                },
            },
        ],
    });

    // Test cases for HOC components
    const testCases = [
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
        },
        {
            name: 'memo component with withBoundary - should pass',
            code: `
        import React, { memo } from 'react';
        import { withBoundary } from 'react-suspense-boundary';
        
        const MyComponent = memo(() => {
          return <div>Memoized Component</div>;
        });
        
        const WrappedComponent = withBoundary(MyComponent);
        export { WrappedComponent };
      `,
            shouldHaveErrors: false,
        },
        {
            name: 'React.forwardRef without withBoundary - should fail',
            code: `
        import React from 'react';
        
        const MyComponent = React.forwardRef((props, ref) => {
          return <div ref={ref}>Hello World</div>;
        });
        
        export default MyComponent;
      `,
            shouldHaveErrors: true,
        },
        {
            name: 'React.memo without withBoundary - should fail',
            code: `
        import React from 'react';
        
        const MyComponent = React.memo(() => {
          return <div>Memoized Component</div>;
        });
        
        export default MyComponent;
      `,
            shouldHaveErrors: true,
        },
        {
            name: 'lazy component without withBoundary - should fail',
            code: `
        import React, { lazy } from 'react';
        
        const LazyComponent = lazy(() => import('./SomeComponent'));
        
        export default LazyComponent;
      `,
            shouldHaveErrors: true,
        },
        {
            name: 'lazy component with withBoundary - should pass',
            code: `
        import React, { lazy } from 'react';
        import { withBoundary } from 'react-suspense-boundary';
        
        const LazyComponent = lazy(() => import('./SomeComponent'));
        
        export default withBoundary(LazyComponent);
      `,
            shouldHaveErrors: false,
        },
        {
            name: 'nested HOCs without withBoundary - should fail',
            code: `
        import React, { memo, forwardRef } from 'react';
        
        const MyComponent = memo(forwardRef((props, ref) => {
          return <div ref={ref}>Nested HOCs</div>;
        }));
        
        export default MyComponent;
      `,
            shouldHaveErrors: true,
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
        },
        {
            name: 'Regular function component - should still work',
            code: `
        function RegularComponent() {
          return <div>Regular Component</div>;
        }
        
        export default RegularComponent;
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
        console.log('🎉 All HOC component tests passed! React HOC support is working correctly.');
    } else {
        console.log('💥 Some HOC tests failed. Please check the implementation.');
        process.exit(1);
    }
}

// Run tests
testHOCComponents().catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
});
