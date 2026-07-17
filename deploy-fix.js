const { execSync } = require('child_process');
const path = require('path');

function run(cmd) {
    console.log(`> ${cmd}`);
    try {
        const result = execSync(cmd, { cwd: __dirname, encoding: 'utf-8', timeout: 60000, shell: true });
        if (result && result.trim()) console.log(result.trim());
        return result;
    } catch (e) {
        console.error(`Error: ${e.message}`);
        if (e.stderr) console.error(`stderr: ${e.stderr}`);
        process.exit(1);
    }
}

function git(args) {
    return run(`powershell -Command "& 'C:\\Program Files\\Git\\cmd\\git.exe' ${args}"`);
}

console.log('\n🚀 EACO Earth Story Deploy\n');

git('add -A');
git('status');

const hasChanges = execSync(`powershell -Command "& 'C:\\Program Files\\Git\\cmd\\git.exe' status --porcelain"`, { cwd: __dirname, encoding: 'utf-8', shell: true }).trim();
if (!hasChanges) {
    console.log('\n✅ No changes to deploy.');
    process.exit(0);
}

const date = new Date().toISOString().slice(0, 10);
git(`commit -m '\"🌍 EACO Daily Story Update - ${date}\"'`);
git('push origin main');

console.log('\n✅ Deployed to GitHub! 🌍');
console.log('🌐 https://ucoingroup.github.io/earth-story/');
