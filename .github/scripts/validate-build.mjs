import { existsSync } from 'fs';

const requiredFiles = [
    'dist/index.html',
    'dist/lessons/index.html',
    'dist/pathways/index.html'
];

const missing = requiredFiles.filter(file => !existsSync(file));

if (missing.length > 0) {
    console.error('❌ Missing required files:', missing);
    process.exit(1);
}

console.log('✅ Build output validation passed');
process.exit(0);
