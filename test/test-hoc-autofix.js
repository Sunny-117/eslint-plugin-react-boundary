/**
 * Test file for autofix functionality with React HOC components
 */

const {ESLint} = require('eslint');

async function testHOCAutofix() {
    console.log('🧪 Testing autofix functionality for React HOC components...\n');

    // Create ESLint instance with autofix enabled
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
        fix: true, // Enable autofix
    });

    // Test cases for autofix with HOC components
    const testCases = [
        {
            name: 'forwardRef component - should be fixed',
            input: `
import React, { forwardRef } from 'react';

const MyComponent = forwardRef((props, ref) => {
  return <div ref={ref}>Hello World</div>;
});

export default MyComponent;
            `.trim(),
            expectedPattern: /withBoundary\(MyComponent\)/,
        },
        {
            name: 'memo component - should be fixed',
            input: `
import React, { memo } from 'react';

const MyComponent = memo(() => {
  return <div>Memoized Component</div>;
});

export { MyComponent };
            `.trim(),
            expectedPattern: /withBoundary\(MyComponent\)/,
        },
        {
            name: 'React.forwardRef - should be fixed',
            input: `
import React from 'react';

const MyComponent = React.forwardRef((props, ref) => {
  return <div ref={ref}>Hello World</div>;
});

export default MyComponent;
            `.trim(),
            expectedPattern: /withBoundary\(MyComponent\)/,
        },
        {
            name: 'React.memo - should be fixed',
            input: `
import React from 'react';

const MyComponent = React.memo(() => {
  return <div>Memoized Component</div>;
});

export default MyComponent;
            `.trim(),
            expectedPattern: /withBoundary\(MyComponent\)/,
        },
        {
            name: 'lazy component - should be fixed',
            input: `
import React, { lazy } from 'react';

const LazyComponent = lazy(() => import('./SomeComponent'));

export default LazyComponent;
            `.trim(),
            expectedPattern: /withBoundary\(LazyComponent\)/,
        },
        {
            name: 'nested HOCs - should be fixed',
            input: `
import React, { memo, forwardRef } from 'react';

const MyComponent = memo(forwardRef((props, ref) => {
  return <div ref={ref}>Nested HOCs</div>;
}));

export default MyComponent;
            `.trim(),
            expectedPattern: /withBoundary\(MyComponent\)/,
        },
        {
            name: 'direct export of forwardRef - should be fixed',
            input: `
import React, { forwardRef } from 'react';

export default forwardRef((props, ref) => {
  return <div ref={ref}>Direct Export</div>;
});
            `.trim(),
            expectedPattern: /withBoundary\(/,
        },
    ];

    let allTestsPassed = true;

    for (const testCase of testCases) {
        console.log(`📝 Testing: ${testCase.name}`);

        try {
            const results = await eslint.lintText(testCase.input, {
                filePath: 'test.jsx',
            });

            if (results[0].output) {
                const fixedCode = results[0].output;
                console.log(`✅ PASS: ${testCase.name}`);
                console.log('   Original code:');
                console.log('   ' + testCase.input.split('\n').join('\n   '));
                console.log('   Fixed code:');
                console.log('   ' + fixedCode.split('\n').join('\n   '));
                
                // Check if the expected pattern is in the fixed code
                if (testCase.expectedPattern.test(fixedCode)) {
                    console.log('   ✓ Expected pattern found in fixed code');
                } else {
                    console.log('   ✗ Expected pattern NOT found in fixed code');
                    allTestsPassed = false;
                }
            } else {
                console.log(`❌ FAIL: ${testCase.name} - No autofix output generated`);
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
        console.log('🎉 All HOC autofix tests passed! HOC autofix functionality is working correctly.');
    } else {
        console.log('💥 Some HOC autofix tests failed. Please check the implementation.');
        process.exit(1);
    }
}

// Run tests
testHOCAutofix().catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
});
