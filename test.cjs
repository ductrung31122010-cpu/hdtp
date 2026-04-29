const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');
const scriptMatch = content.match(/<script type="text\/babel">([\s\S]*?)<\/script>/);

if (scriptMatch) {
  try {
    const babel = require('@babel/core');
    babel.transformSync(scriptMatch[1], { presets: ['@babel/preset-react'] });
    console.log('Syntax OK');
  } catch (e) {
    if (e.code === 'MODULE_NOT_FOUND') {
      console.log('Babel not found, let me install it.');
    } else {
      console.error('Syntax Error:', e.message);
    }
  }
} else {
  console.log('No babel script found');
}
