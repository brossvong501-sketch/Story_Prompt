import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const docsDir = path.join(rootDir, 'docs');

try {
  if (fs.existsSync(distDir)) {
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }
    fs.cpSync(distDir, docsDir, { recursive: true });
    console.log('✓ Successfully mirrored dist/ to docs/ for GitHub Pages!');
  }
} catch (err) {
  console.warn('Note: Could not mirror to docs/:', err);
}
