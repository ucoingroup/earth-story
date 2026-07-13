const { execSync } = require('child_process');
const path = require('path');

const WORKSPACE = 'C:\\Users\\Administrator\\.qclaw\\workspace\\earth-story';

function run(cmd) {
    console.log('> ' + cmd);
    try {
        const result = execSync(cmd, { cwd: WORKSPACE, encoding: 'utf-8', timeout: 60000 });
        if (result.trim()) console.log(result.trim());
    } catch (e) {
        console.error('Error: ' + e.message);
        process.exit(1);
    }
}

console.log('\n🚀 EACO Earth Story Deploy\n');

run('git add -A');

const hasChanges = execSync('git status --porcelain', { cwd: WORKSPACE, encoding: 'utf-8' }).trim();
if (!hasChanges) {
    console.log('\n✅ No changes to deploy.');
    process.exit(0);
}

const dateStr = new Date().toISOString().slice(0, 10);
run('git commit -m "EACO Daily Story Update - ' + dateStr + '"');
run('git push origin main');

console.log('\n✅ Deployed to GitHub! 🌍');
console.log('🌐 https://ucoingroup.github.io/earth-story/');
