/**
 * Test file to demonstrate the new functionality for separately defined and exported components
 */

const {ESLint} = require('eslint');

async function testSeparateExports() {
    console.log('🧪 Testing separate export functionality...\n');

    // Create ESLint instance with our plugin
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
                    'react-boundary': require('./index'),
                },
                rules: {
                    'react-boundary/require-boundary': 'error',
                },
            },
        ],
    });

    // Test cases for separate exports
    const testCases = [
        {
            name: 'Function defined first, then default export (with Boundary) - should pass',
            code: `
        import { Boundary } from 'react-suspense-boundary';
        
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
            name: 'Function defined first, then default export (without Boundary) - should fail',
            code: `
        function MyComponent() {
          return <div>Hello World</div>;
        }
        
        export default MyComponent;
      `,
            shouldHaveErrors: true,
        },
        {
            name: 'Function defined first, then named export (with Boundary) - should pass',
            code: `
        import { Boundary } from 'react-suspense-boundary';
        
        function MyComponent() {
          return (
            <Boundary>
              <div>Hello World</div>
            </Boundary>
          );
        }
        
        export { MyComponent };
      `,
            shouldHaveErrors: false,
        },
        {
            name: 'Function defined first, then named export (without Boundary) - should fail',
            code: `
        function MyComponent() {
          return <div>Hello World</div>;
        }
        
        export { MyComponent };
      `,
            shouldHaveErrors: true,
        },
        {
            name: 'Arrow function defined first, then named export (with Boundary) - should pass',
            code: `
        import { Boundary } from 'react-suspense-boundary';
        
        const Header = () => {
          return (
            <Boundary>
              <header>Header</header>
            </Boundary>
          );
        }
        
        export { Header };
      `,
            shouldHaveErrors: false,
        },
        {
            name: 'Arrow function defined first, then named export (without Boundary) - should fail',
            code: `
        const Header = () => {
          return <header>Header</header>;
        }
        
        export { Header };
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
        console.log('🎉 All separate export tests passed! New functionality is working correctly.');
    } else {
        console.log('💥 Some tests failed. Please check the implementation.');
        process.exit(1);
    }
}

// Run tests
testSeparateExports().catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
});
