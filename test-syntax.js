const fs = require('fs');
const babel = require('@babel/core');
const content = fs.readFileSync('index.html', 'utf8');
const scriptMatch = content.match(/<script type="text\/babel">([\s\S]*?)<\/script>/);

if (scriptMatch) {
  try {
    babel.transformSync(scriptMatch[1], { presets: ['@babel/preset-react'] });
    console.log('Syntax OK');
  } catch (e) {
    console.error('Syntax Error:', e.message);
  }
} else {
  console.log('No babel script found');
}
