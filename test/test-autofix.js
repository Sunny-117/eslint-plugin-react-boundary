/**
 * Test file for autofix functionality of require-with-boundary rule
 */

const {ESLint} = require('eslint');

async function testAutofix() {
    console.log('🧪 Testing autofix functionality for require-with-boundary rule...\n');

    // Create ESLint instance with autofix enabled
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
        fix: true, // Enable autofix
    });

    // Test cases for autofix
    const testCases = [
        {
            name: 'Direct default export of function - should be fixed',
            input: `
function NewOverview() {
  return <div>Overview</div>;
}

export default NewOverview;
            `.trim(),
            expectedPattern: /withBoundary\(NewOverview\)/,
        },
        {
            name: 'Direct named export of function - should be fixed',
            input: `
export function MyComponent() {
  return <div>Component</div>;
}
            `.trim(),
            expectedPattern: /withBoundary\(MyComponent\)/,
        },
        {
            name: 'Direct export of arrow function - should be fixed',
            input: `
const Header = () => {
  return <header>Header</header>;
}

export { Header };
            `.trim(),
            expectedPattern: /withBoundary\(Header\)/,
        },
        {
            name: 'Default export inline function - should be fixed',
            input: `
export default function App() {
  return <div>App</div>;
}
            `.trim(),
            expectedPattern: /withBoundary\(App\)/,
        },
        {
            name: 'Already has import - should add to existing import',
            input: `
import { Boundary } from 'react-suspense-boundary';

function MyComponent() {
  return <div>Component</div>;
}

export default MyComponent;
            `.trim(),
            expectedPattern: /import.*withBoundary.*from 'react-suspense-boundary'/,
        },
        {
            name: 'Default export anonymous arrow function - should be fixed',
            input: `
export default () => {
  return <div>Anon</div>;
}
            `.trim(),
            expectedPattern: /export default\s*withBoundary\(\(\)\s*=>/,
        },
        {
            name: 'Default export anonymous function declaration - should be fixed',
            input: `
export default function() {
  return <div>AnonFn</div>;
}
            `.trim(),
            expectedPattern: /export default\s*withBoundary\(function\(\)/,
        },
        {
            name: 'export const arrow function - should be fixed',
            input: `
export const AiBuildPreviewComp = props => {
  return <div>Anon</div>;
}
            `.trim(),
            expectedPattern: /withBoundary\(AiBuildPreviewComp\)/,
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
        console.log('🎉 All autofix tests passed! Autofix functionality is working correctly.');
    } else {
        console.log('💥 Some autofix tests failed. Please check the implementation.');
        process.exit(1);
    }
}

// Run tests
testAutofix().catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
});
