const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');
const lines = content.split('\n');

const startIdx = 5613; // Line 5614 is 0-indexed 5613
const endIdx = 6803;   // Line 6803 is 0-indexed 6802, so up to 6803

const modalsStr = lines.slice(startIdx, endIdx).join('\n');
lines.splice(startIdx, endIdx - startIdx);

let newContent = lines.join('\n');
const setupOverlayIdx = newContent.indexOf('{/* Setup Overlay */}');
newContent = newContent.slice(0, setupOverlayIdx) + modalsStr + '\n            ' + newContent.slice(setupOverlayIdx);

fs.writeFileSync('index.html', newContent);
console.log('Modals moved successfully!');
