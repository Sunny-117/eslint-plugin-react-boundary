#!/usr/bin/env node

/**
 * Demo script to show the plugin in action
 */

const { ESLint } = require('eslint');
const path = require('path');

async function runDemo() {
  console.log('🎬 ESLint Plugin React Boundary Demo\n');
  console.log('This demo shows how the plugin detects React components that are not wrapped with <Boundary>\n');

  // Create ESLint instance with our plugin
  const eslint = new ESLint({
    baseConfig: {
      env: {
        browser: true,
        es2021: true
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        },
        ecmaVersion: 12,
        sourceType: 'module'
      },
      plugins: ['react-boundary'],
      rules: {
        'react-boundary/require-boundary': 'error'
      }
    },
    useEslintrc: false,
    plugins: {
      'react-boundary': require('../index')
    }
  });

  console.log('📁 Checking demo-project/src/App.jsx (should have errors)...\n');
  
  try {
    const results = await eslint.lintFiles([path.join(__dirname, 'demo-project/src/App.jsx')]);
    const result = results[0];

    if (result.messages.length > 0) {
      console.log(`❌ Found ${result.messages.length} errors in App.jsx:`);
      result.messages.forEach((msg, index) => {
        console.log(`   ${index + 1}. Line ${msg.line}: ${msg.message}`);
      });
    } else {
      console.log('✅ No errors found in App.jsx');
    }

    console.log('\n' + '='.repeat(60) + '\n');

    console.log('📁 Checking demo-project/src/FixedApp.jsx (should be clean)...\n');

    const fixedResults = await eslint.lintFiles([path.join(__dirname, 'demo-project/src/FixedApp.jsx')]);
    const fixedResult = fixedResults[0];
    
    if (fixedResult.messages.length > 0) {
      console.log(`❌ Found ${fixedResult.messages.length} errors in FixedApp.jsx:`);
      fixedResult.messages.forEach((msg, index) => {
        console.log(`   ${index + 1}. Line ${msg.line}: ${msg.message}`);
      });
    } else {
      console.log('✅ No errors found in FixedApp.jsx - all components are properly wrapped!');
    }
    
  } catch (error) {
    console.error('❌ Demo failed:', error.message);
    process.exit(1);
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n🎯 Summary:');
  console.log('• The plugin successfully detects React components that are not wrapped with <Boundary>');
  console.log('• It works with function declarations, arrow functions, and default exports');
  console.log('• Components that are properly wrapped pass the linting check');
  console.log('\n💡 To use this plugin in your project:');
  console.log('1. Install: npm install --save-dev eslint-plugin-react-boundary');
  console.log('2. Configure ESLint to use the plugin');
  console.log('3. Run: npx eslint src/**/*.{js,jsx,ts,tsx}');
  console.log('\n🚀 Happy coding with better error boundaries!');
}

// Run demo
runDemo().catch(error => {
  console.error('Demo failed:', error);
  process.exit(1);
});
