#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up RBD E-Commerce...\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env.local file...');
  const envExample = fs.readFileSync(path.join(process.cwd(), 'env.example'), 'utf8');
  fs.writeFileSync(envPath, envExample);
  console.log('✅ .env.local created. Please update with your actual values.\n');
} else {
  console.log('✅ .env.local already exists.\n');
}

// Check if node_modules exists
const nodeModulesPath = path.join(process.cwd(), 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('📦 Installing dependencies...');
  console.log('Run: npm install\n');
} else {
  console.log('✅ Dependencies already installed.\n');
}

console.log('🎯 Next steps:');
console.log('1. Update .env.local with your database and API keys');
console.log('2. Run: npm install');
console.log('3. Run: npx prisma generate');
console.log('4. Run: npx prisma db push');
console.log('5. Run: npm run dev');
console.log('\n🌟 Your e-commerce app will be ready!');
console.log('\n📚 For more information, check the README.md file.');
