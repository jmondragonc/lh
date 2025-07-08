const { execSync } = require('child_process');

try {
  console.log('🔨 Starting build process...');
  const result = execSync('npm run build', { 
    encoding: 'utf8', 
    stdio: 'pipe',
    cwd: '/Users/joseph/Work/lh'
  });
  console.log('✅ Build successful!');
  console.log(result);
} catch (error) {
  console.log('❌ Build failed!');
  console.log('=== STDOUT ===');
  console.log(error.stdout || 'No stdout');
  console.log('\n=== STDERR ===');
  console.log(error.stderr || 'No stderr');
  console.log('\n=== ERROR ===');
  console.log(error.message);
  console.log('\n=== STATUS ===');
  console.log(error.status);
}