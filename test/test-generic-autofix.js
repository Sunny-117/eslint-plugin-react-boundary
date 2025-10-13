/**
 * Test file for autofix functionality with TypeScript generic components
 */

const {ESLint} = require('eslint');

// Try to load TypeScript parser, but don't fail if it's not available
let tsParser = null;
try {
    tsParser = require('@typescript-eslint/parser');
    console.log('✅ TypeScript parser loaded successfully');
} catch (e) {
    console.warn('⚠️ @typescript-eslint/parser not found, attempting to use ESLint default parser');
}

async function testGenericAutofix() {
    console.log('🧪 Testing autofix functionality for TypeScript generic components...\n');

    // Create ESLint instance with autofix enabled
    const eslint = new ESLint({
        overrideConfigFile: true,
        overrideConfig: [
            {
                files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
                languageOptions: {
                    ecmaVersion: 2020,
                    sourceType: 'module',
                    ...(tsParser && { parser: tsParser }),
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

    // Test cases for autofix with generic components
    const testCases = [
        {
            name: 'Playground Test - Check if generic autofix works',
            input: `
export function TestGeneric(props) {
  return <div>Test</div>;
}
            `.trim(),
            expectedPattern: /withBoundary\(TestGeneric\)/,
        },
        {
            name: 'Generic component with constraints - should add type assertion',
            input: `
export function ConstrainedGeneric<T extends object>(props: { value: T }) {
  return <div>{JSON.stringify(props.value)}</div>;
}
            `.trim(),
            expectedPattern: /withBoundary\(ConstrainedGeneric\) as typeof ConstrainedGeneric/,
        },
        {
            name: 'WithDrawerInput component with constraints - should add type assertion - named export',
            input: `
type WithDrawerInputProps<T extends Record<string, any>> = {
    formConfig: number;
    transForm?: (value: T, props: WithDrawerInputProps<T>) => string;
};

export function WithDrawerInput<T extends Record<string, any>>(props: WithDrawerInputProps<T>) {
  return <div>1</div>;
}
            `.trim(),
            expectedPattern: /withBoundary\(WithDrawerInput\) as typeof WithDrawerInput/,
        },
        {
            name: 'WithDrawerInput component with constraints - should add type assertion - default export',
            input: `
type WithDrawerInputProps<T extends Record<string, any>> = {
    formConfig: number;
    transForm?: (value: T, props: WithDrawerInputProps<T>) => string;
};

export default function WithDrawerInput<T extends Record<string, any>>(props: WithDrawerInputProps<T>) {
  return <div>1</div>;
}
            `.trim(),
            expectedPattern: /withBoundary\(WithDrawerInput\) as typeof WithDrawerInput/,
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

                // Check if pattern should NOT be present
                if (testCase.shouldNotMatch && testCase.shouldNotMatch.test(fixedCode)) {
                    console.log('   ✗ Unwanted pattern found in fixed code');
                    allTestsPassed = false;
                } else if (testCase.shouldNotMatch) {
                    console.log('   ✓ Unwanted pattern correctly absent');
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
        console.log('🎉 All generic autofix tests passed! Generic component autofix functionality is working correctly.');
    } else {
        console.log('💥 Some generic autofix tests failed. Please check the implementation.');
        process.exit(1);
    }
}

// Run tests
testGenericAutofix().catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
});
