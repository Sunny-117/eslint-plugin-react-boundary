#!/usr/bin/env node

/**
 * Simple test script to verify the plugin works
 */

const {ESLint} = require('eslint');
const path = require('path');

async function testPlugin() {
    console.log('🧪 Testing eslint-plugin-react-boundary...\n');

    // Create ESLint instance with our plugin
    const eslint = new ESLint({
        baseConfig: {
            parserOptions: {
                ecmaVersion: 2018,
                sourceType: 'module',
                ecmaFeatures: {
                    jsx: true,
                },
            },
            plugins: ['react-boundary'],
            rules: {
                'react-boundary/require-boundary': 'error',
            },
        },
        useEslintrc: false,
        plugins: {
            'react-boundary': require('./index'),
        },
    });

    // Test cases
    const testCases = [
        {
            name: 'Bad Component (should have errors)',
            code: `
        export function BadComponent() {
          return <div>Hello World</div>;
        }
      `,
            shouldHaveErrors: true,
        },
        {
            name: 'Good Component (should be clean)',
            code: `
        import { Boundary } from 'react-suspense-boundary';
        
        export function GoodComponent() {
          return (
            <Boundary>
              <div>Hello World</div>
            </Boundary>
          );
        }
      `,
            shouldHaveErrors: false,
        },
        {
            name: 'Non-React file (should be ignored)',
            code: `
        export function utilityFunction() {
          return "not a component";
        }
      `,
            shouldHaveErrors: false,
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

    // Test with actual files
    console.log('📁 Testing with example files...\n');

    try {
        const badResults = await eslint.lintFiles(['examples/bad-component.jsx']);
        const goodResults = await eslint.lintFiles(['examples/good-component.jsx']);

        console.log(`📄 bad-component.jsx: ${badResults[0].messages.length} errors`);
        badResults[0].messages.forEach(msg => {
            console.log(`   - Line ${msg.line}: ${msg.message}`);
        });

        console.log(`📄 good-component.jsx: ${goodResults[0].messages.length} errors`);
        if (goodResults[0].messages.length > 0) {
            goodResults[0].messages.forEach(msg => {
                console.log(`   - Line ${msg.line}: ${msg.message}`);
            });
        }

    } catch (error) {
        console.log(`⚠️  Could not test example files: ${error.message}`);
    }

    console.log('\n' + '='.repeat(50));
    if (allTestsPassed) {
        console.log('🎉 All tests passed! Plugin is working correctly.');
    } else {
        console.log('💥 Some tests failed. Please check the implementation.');
        process.exit(1);
    }
}

// Run tests
testPlugin().catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
});
