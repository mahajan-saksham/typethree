import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the migrations directory
const projectRoot = path.resolve(__dirname, '..');
const migrationsDir = path.join(projectRoot, 'supabase/migrations');

// Get all SQL files in the migrations directory
const migrationFiles = fs.readdirSync(migrationsDir)
  .filter(file => file.endsWith('.sql'))
  .map(file => path.join(migrationsDir, file));

console.log(`Found ${migrationFiles.length} migration files to process`);

// Process each file
for (const filePath of migrationFiles) {
  try {
    // Read the file content
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Replace all escaped newlines (\n) with actual newlines
    content = content.replace(/\\n/g, '');
    
    // Write the content back to the file if it was modified
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed syntax in file: ${path.basename(filePath)}`);
    } else {
      console.log(`✓ No issues found in file: ${path.basename(filePath)}`);
    }
  } catch (error) {
    console.error(`❌ Error processing file ${filePath}:`, error.message);
  }
}

console.log('Migration files processing complete!');
