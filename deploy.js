/**
 * deploy.js
 * 自动提交并推送到 GitHub
 */

const { execSync } = require('child_process');
const path = require('path');

function run(cmd) {
    console.log(`> ${cmd}`);
    try {
        const result = execSync(cmd, { cwd: __dirname, encoding: 'utf-8', timeout: 60000 });
        if (result.trim()) console.log(result.trim());
        return result;
    } catch (e) {
        console.error(`Error: ${e.message}`);
        process.exit(1);
    }
}

console.log('\n🚀 EACO Earth Story Deploy\n');

run('git add -A');
run('git status');

const hasChanges = execSync('git status --porcelain', { cwd: __dirname, encoding: 'utf-8' }).trim();
if (!hasChanges) {
    console.log('\n✅ No changes to deploy.');
    process.exit(0);
}

run('git commit -m "🌍 EACO Daily Story Update - ' + new Date().toISOString().slice(0, 10) + '"');
run('git push origin main');

console.log('\n✅ Deployed to GitHub! 🌍');
console.log('🌐 https://ucoingroup.github.io/earth-story/');
