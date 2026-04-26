const { execSync } = require('child_process');
try {
    console.log(execSync('which g++ || echo not found').toString());
    console.log(execSync('which python3 || echo not found').toString());
} catch(e) {
    console.log(e);
}
