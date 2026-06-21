const fs = require('fs');
const path = require('path');

// 读取MD文件
const mdPath = 'C:\\Users\\Administrator\\.qclaw\\workspace\\openclaw\\config\\skills\\eaco-earth-stories\\scripts\\interstellar-stories-database.md';
const mdContent = fs.readFileSync(mdPath, 'utf-8');

// 按分隔符分割故事
const storyBlocks = mdContent.split(/\n---\n/);

const stories = [];

storyBlocks.forEach((block, index) => {
    const lines = block.trim().split('\n');
    
    // 查找故事标题行
    let titleLine = '';
    let titleIndex = -1;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('🌌 EACO-INT-')) {
            titleLine = lines[i];
            titleIndex = i;
            break;
        }
    }
    
    if (!titleLine) return;
    
    // 解析标题：## 🌌 EACO-INT-093 · Void Walkers
    const idMatch = titleLine.match(/EACO-INT-(\d+)/);
    const nameMatch = titleLine.match(/·\s*(.+)$/) || titleLine.match(/EACO-INT-\d+\s*·\s*(.+)/);
    
    // 解析信息行：📍 虚空行者·维度间旅行者 | 🌀 ∞ | ⚡ 能量 840 | 👁 阅读 10246
    let infoLine = '';
    let tagsLine = '';
    for (let i = titleIndex + 1; i < lines.length; i++) {
        if (lines[i].includes('📍')) {
            infoLine = lines[i];
        }
        if (lines[i].includes('🏷️')) {
            tagsLine = lines[i];
            break;
        }
    }
    
    if (!infoLine) return;
    
    // 解析信息
    const locationMatch = infoLine.match(/📍\s*(.+?)\s*\|/);
    const dimensionMatch = infoLine.match(/🌀\s*(.+?)\s*\|/);
    const energyMatch = infoLine.match(/⚡\s*能量\s*(\d+)/);
    const readingMatch = infoLine.match(/👁\s*阅读\s*(\d+)/);
    
    // 解析标签
    const tags = [];
    if (tagsLine) {
        const tagMatches = tagsLine.match(/#[\w\u4e00-\u9fa5]+/g);
        if (tagMatches) {
            tagMatches.forEach(t => tags.push(t.replace('#', '')));
        }
    }
    
    // 提取故事内容（标题行之后，金句之前的段落）
    const contentStart = titleIndex + 1;
    let contentEnd = lines.length;
    let goldenSentence = '';
    
    for (let i = contentStart; i < lines.length; i++) {
        if (lines[i].includes('💫')) {
            goldenSentence = lines[i].replace(/^>\s*💫\s*/, '').trim();
            contentEnd = i;
            break;
        }
    }
    
    // 提取故事正文（跳过信息行和标签行）
    let storyContent = '';
    for (let i = contentStart; i < contentEnd; i++) {
        const line = lines[i].trim();
        if (line && !line.startsWith('📍') && !line.startsWith('🏷️') && !line.startsWith('>')) {
            storyContent += line + ' ';
        }
    }
    
    // 如果没有找到正文，尝试其他方式提取
    if (!storyContent.trim()) {
        for (let i = titleIndex + 2; i < contentEnd; i++) {
            const line = lines[i].trim();
            if (line && !line.startsWith('📍') && !line.startsWith('🏷️')) {
                storyContent += line + ' ';
            }
        }
    }
    
    const story = {
        id: idMatch ? `EACO-INT-${idMatch[1]}` : `EACO-INT-${String(index).padStart(3, '0')}`,
        civilization: nameMatch ? nameMatch[1].trim() : '未知文明',
        location: locationMatch ? locationMatch[1].trim() : '',
        dimension: dimensionMatch ? dimensionMatch[1].trim() : '未知',
        energy: energyMatch ? parseInt(energyMatch[1]) : 0,
        reading: readingMatch ? parseInt(readingMatch[1]) : 0,
        tags: tags,
        content: storyContent.trim(),
        goldenSentence: goldenSentence,
        preview: storyContent.trim().substring(0, 100) + '...'
    };
    
    stories.push(story);
});

// 过滤掉空故事
const validStories = stories.filter(s => s.civilization !== '未知文明' && s.energy > 0);

console.log(JSON.stringify(validStories, null, 2));
console.log(`\n总共解析了 ${validStories.length} 个故事`);

// 写入JSON文件
const outputPath = 'C:\\Users\\Administrator\\.qclaw\\workspace\\earth-story\\stories.json';
fs.writeFileSync(outputPath, JSON.stringify(validStories, null, 2), 'utf-8');
console.log(`JSON数据已保存到: ${outputPath}`);
