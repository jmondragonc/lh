#!/usr/bin/env node

console.log('🔨 Starting detailed build check for Longhorn project...');

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Change to project directory
const projectDir = '/Users/joseph/Work/lh';
process.chdir(projectDir);

console.log('📁 Working directory:', process.cwd());
console.log('📦 Package.json exists:', fs.existsSync('package.json'));
console.log('🔧 Tsconfig.json exists:', fs.existsSync('tsconfig.json'));
console.log('⚙️ Medusa-config.ts exists:', fs.existsSync('medusa-config.ts'));

// Check if build command exists
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log('📝 Build script:', packageJson.scripts?.build || 'NOT FOUND');
} catch (error) {
  console.error('❌ Error reading package.json:', error.message);
}

// Try TypeScript compilation first
console.log('\n🔍 Checking TypeScript compilation...');
const tscCheck = spawn('npx', ['tsc', '--noEmit'], {
  stdio: 'pipe',
  shell: true
});

let tscOutput = '';
let tscError = '';

tscCheck.stdout.on('data', (data) => {
  tscOutput += data.toString();
});

tscCheck.stderr.on('data', (data) => {
  tscError += data.toString();
});

tscCheck.on('close', (code) => {
  console.log(`\n🔍 TypeScript check exit code: ${code}`);
  
  if (tscOutput) {
    console.log('\n📤 TypeScript STDOUT:');
    console.log(tscOutput);
  }
  
  if (tscError) {
    console.log('\n📥 TypeScript STDERR:');
    console.log(tscError);
  }
  
  // Now try the actual build
  console.log('\n🔨 Attempting Medusa build...');
  
  const buildProcess = spawn('npm', ['run', 'build'], {
    stdio: 'pipe',
    shell: true
  });
  
  let buildOutput = '';
  let buildError = '';
  
  buildProcess.stdout.on('data', (data) => {
    buildOutput += data.toString();
  });
  
  buildProcess.stderr.on('data', (data) => {
    buildError += data.toString();
  });
  
  buildProcess.on('close', (buildCode) => {
    console.log(`\n🏗️ Build process exit code: ${buildCode}`);
    
    if (buildOutput) {
      console.log('\n📤 Build STDOUT:');
      console.log(buildOutput);
    }
    
    if (buildError) {
      console.log('\n📥 Build STDERR:');
      console.log(buildError);
    }
    
    if (buildCode === 0) {
      console.log('\n✅ Build completed successfully!');
    } else {
      console.log('\n❌ Build failed with errors');
    }
    
    // Summary
    console.log('\n📊 SUMMARY:');
    console.log(`   TypeScript check: ${code === 0 ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`   Medusa build: ${buildCode === 0 ? '✅ PASSED' : '❌ FAILED'}`);
  });
});
