/**
 * Test file for the specific user example
 */

const {ESLint} = require('eslint');

async function testUserExample() {
    console.log('🧪 Testing user-provided example...\n');

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

    // User's specific example
    const userCode = `
import {Boundary, useResource} from 'react-suspense-boundary';

function Cpp() {
    const res = useResource(xx);
    return (
        <div>
            Cpp
        </div>
    );
}

export default () => { 
// 这里不需要加withBoundary，因为只是中转了一层导出，
// 函数体没有其他内容，这种情况目前会认为是错误，希望这种类型能通过校验
    return <Boundary>
        <Cpp />
    </Boundary>
};
    `.trim();

    console.log('📝 Testing user-provided example...');
    console.log('Code:');
    console.log(userCode);
    console.log('');

    try {
        const results = await eslint.lintText(userCode, {
            filePath: 'test.jsx',
        });

        const hasErrors = results[0].messages.length > 0;

        if (!hasErrors) {
            console.log('✅ PASS: User example passes validation (no errors found)');
            console.log('   The anonymous function with Boundary wrapper is correctly recognized as valid.');
        } else {
            console.log('❌ FAIL: User example still has errors:');
            results[0].messages.forEach(msg => {
                console.log(`   - Line ${msg.line}: ${msg.message}`);
            });
        }
    } catch (error) {
        console.log(`❌ ERROR: ${error.message}`);
    }

    console.log('\n' + '='.repeat(50));
    console.log('🎯 User example test completed.');
}

// Run test
testUserExample().catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
});
