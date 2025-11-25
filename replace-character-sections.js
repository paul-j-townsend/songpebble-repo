const fs = require('fs');
const path = require('path');

// Read the files
const songFormPath = path.join(__dirname, 'src/components/SongForm.tsx');
const newSectionsPath = path.join(__dirname, 'CHARACTER_SECTIONS_NEW.tsx');

console.log('Reading files...');
const songFormContent = fs.readFileSync(songFormPath, 'utf8');
const newSectionsContent = fs.readFileSync(newSectionsPath, 'utf8');

// Split into lines
const lines = songFormContent.split('\n');

// Find the start of the Characters Section
let startIndex = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('Characters Section')) {
    startIndex = i;
    break;
  }
}

// Find the Lyrics Input section (end of characters section)
let endIndex = -1;
for (let i = startIndex; i < lines.length; i++) {
  if (lines[i].includes('Lyrics Input')) {
    endIndex = i;
    break;
  }
}

if (startIndex === -1 || endIndex === -1) {
  console.error('Could not find the sections to replace!');
  console.error('Start index:', startIndex, 'End index:', endIndex);
  process.exit(1);
}

console.log(`Found Characters Section at line ${startIndex + 1}`);
console.log(`Found Lyrics Input Section at line ${endIndex + 1}`);
console.log(`Replacing ${endIndex - startIndex} lines...`);

// Build the new content
const before = lines.slice(0, startIndex).join('\n');
const after = lines.slice(endIndex).join('\n');

// Combine
const newContent = before + '\n' + newSectionsContent + '\n' + after;

// Write back
fs.writeFileSync(songFormPath, newContent, 'utf8');

console.log('✓ Successfully replaced character sections!');
console.log('✓ Old section removed: lines', startIndex + 1, '-', endIndex);
console.log('✓ New sections added: To Characters and Senders');
console.log('\nNext steps:');
console.log('1. Run the database migration: supabase/08_restructure_characters_to_senders.sql');
console.log('2. Update the API route: src/app/api/create-order/route.ts');
console.log('3. Update tests if needed');
