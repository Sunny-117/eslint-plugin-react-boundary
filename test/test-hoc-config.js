/**
 * Test file for HOC detection configuration
 */

const {ESLint} = require('eslint');

async function testHOCConfig() {
    console.log('🧪 Testing HOC detection configuration...\n');

    // Create ESLint instance with HOC detection enabled (default)
    const eslintWithHOCEnabled = new ESLint({
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
                        enableHOCDetection: true, // 明确启用
                    }],
                },
            },
        ],
    });

    // Create ESLint instance with HOC detection disabled
    const eslintWithHOCDisabled = new ESLint({
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
                        enableHOCDetection: false, // 禁用 HOC 检测
                    }],
                },
            },
        ],
    });

    // Test cases for HOC configuration
    const testCases = [
        {
            name: 'forwardRef component - HOC enabled - should fail',
            code: `
        import React, { forwardRef } from 'react';
        
        const MyComponent = forwardRef((props, ref) => {
          return <div ref={ref}>Hello World</div>;
        });
        
        export default MyComponent;
      `,
            hocEnabled: true,
            shouldHaveErrors: true,
        },
        {
            name: 'forwardRef component - HOC disabled - should pass',
            code: `
        import React, { forwardRef } from 'react';
        
        const MyComponent = forwardRef((props, ref) => {
          return <div ref={ref}>Hello World</div>;
        });
        
        export default MyComponent;
      `,
            hocEnabled: false,
            shouldHaveErrors: false,
        },
        {
            name: 'memo component - HOC enabled - should fail',
            code: `
        import React, { memo } from 'react';
        
        const MyComponent = memo(() => {
          return <div>Memoized Component</div>;
        });
        
        export { MyComponent };
      `,
            hocEnabled: true,
            shouldHaveErrors: true,
        },
        {
            name: 'memo component - HOC disabled - should pass',
            code: `
        import React, { memo } from 'react';
        
        const MyComponent = memo(() => {
          return <div>Memoized Component</div>;
        });
        
        export { MyComponent };
      `,
            hocEnabled: false,
            shouldHaveErrors: false,
        },
        {
            name: 'lazy component - HOC enabled - should fail',
            code: `
        import React, { lazy } from 'react';
        
        const LazyComponent = lazy(() => import('./SomeComponent'));
        
        export default LazyComponent;
      `,
            hocEnabled: true,
            shouldHaveErrors: true,
        },
        {
            name: 'lazy component - HOC disabled - should pass',
            code: `
        import React, { lazy } from 'react';
        
        const LazyComponent = lazy(() => import('./SomeComponent'));
        
        export default LazyComponent;
      `,
            hocEnabled: false,
            shouldHaveErrors: false,
        },
        {
            name: 'direct export forwardRef - HOC enabled - should fail',
            code: `
        import React, { forwardRef } from 'react';
        
        export default forwardRef((props, ref) => {
          return <div ref={ref}>Direct Export</div>;
        });
      `,
            hocEnabled: true,
            shouldHaveErrors: true,
        },
        {
            name: 'direct export forwardRef - HOC disabled - should pass',
            code: `
        import React, { forwardRef } from 'react';
        
        export default forwardRef((props, ref) => {
          return <div ref={ref}>Direct Export</div>;
        });
      `,
            hocEnabled: false,
            shouldHaveErrors: false,
        },
        {
            name: 'regular function component - both configs - should fail',
            code: `
        function MyComponent() {
          return <div>Regular Component</div>;
        }
        
        export default MyComponent;
      `,
            hocEnabled: true,
            shouldHaveErrors: true,
        },
        {
            name: 'regular function component - both configs - should fail',
            code: `
        function MyComponent() {
          return <div>Regular Component</div>;
        }
        
        export default MyComponent;
      `,
            hocEnabled: false,
            shouldHaveErrors: true, // 常规组件无论如何都应该报错
        },
    ];

    let allTestsPassed = true;

    for (const testCase of testCases) {
        console.log(`📝 Testing: ${testCase.name}`);

        try {
            // Choose the appropriate ESLint instance based on HOC config
            const eslintInstance = testCase.hocEnabled ? eslintWithHOCEnabled : eslintWithHOCDisabled;
            
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
                console.log(`   HOC Detection: ${testCase.hocEnabled ? 'Enabled' : 'Disabled'}`);
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
        console.log('🎉 All HOC configuration tests passed! HOC detection can be properly configured.');
    } else {
        console.log('💥 Some HOC configuration tests failed. Please check the implementation.');
        process.exit(1);
    }
}

// Run tests
testHOCConfig().catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
});
