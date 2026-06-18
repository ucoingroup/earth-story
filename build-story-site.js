/**
 * build-story-site.js
 * 读取每日故事，翻译成10种语言，生成网站数据文件
 * 用法: node build-story-site.js [YYYYMMDD]
 * 如果不指定日期，默认今天
 */

const fs = require('fs');
const path = require('path');

// ===== 配置 =====
const LANGUAGES = {
    en: 'English',
    zh: '中文',
    ru: 'Русский',
    fr: 'Français',
    es: 'Español',
    ar: 'العربية',
    vi: 'Tiếng Việt',
    ko: '한국어',
    ja: '日本語',
    ms: 'Bahasa Melayu'
};

const THEME_EMOJIS = {
    'Harmony': '🌏', 'Wisdom': '🌌', 'Love': '❤️', 'Nature': '🌿',
    'Spirituality': '✨', 'Universe': '🔭', 'Culture': '🎭',
    'Abundance': '💰', 'Peace': '☮️', 'Time': '⏰'
};

const THEME_NAMES = {
    en: { Harmony: 'Harmony', Wisdom: 'Wisdom', Love: 'Love', Nature: 'Nature', Spirituality: 'Spirituality', Universe: 'Universe', Culture: 'Culture', Abundance: 'Abundance', Peace: 'Peace', Time: 'Time' },
    zh: { Harmony: '和谐', Wisdom: '智慧', Love: '爱', Nature: '自然', Spirituality: '心灵', Universe: '宇宙', Culture: '文化', Abundance: '富足', Peace: '和平', Time: '时间' },
    ru: { Harmony: 'Гармония', Wisdom: 'Мудрость', Love: 'Любовь', Nature: 'Природа', Spirituality: 'Духовность', Universe: 'Вселенная', Culture: 'Культура', Abundance: 'Изобилие', Peace: 'Мир', Time: 'Время' },
    fr: { Harmony: 'Harmonie', Wisdom: 'Sagesse', Love: 'Amour', Nature: 'Nature', Spirituality: 'Spiritualité', Universe: 'Univers', Culture: 'Culture', Abundance: 'Abondance', Peace: 'Paix', Time: 'Temps' },
    es: { Harmony: 'Armonía', Wisdom: 'Sabiduría', Love: 'Amor', Nature: 'Naturaleza', Spirituality: 'Espiritualidad', Universe: 'Universo', Culture: 'Cultura', Abundance: 'Abundancia', Peace: 'Paz', Time: 'Tiempo' },
    ar: { Harmony: 'الانسجام', Wisdom: 'الحكمة', Love: 'الحب', Nature: 'الطبيعة', Spirituality: 'الروحانية', Universe: 'الكون', Culture: 'الثقافة', Abundance: 'الوفرة', Peace: 'السلام', Time: 'الوقت' },
    vi: { Harmony: 'Hòa hợp', Wisdom: 'Trí tuệ', Love: 'Tình yêu', Nature: 'Thiên nhiên', Spirituality: 'Tâm linh', Universe: 'Vũ trụ', Culture: 'Văn hóa', Abundance: 'Thịnh vượng', Peace: 'Hòa bình', Time: 'Thời gian' },
    ko: { Harmony: '조화', Wisdom: '지혜', Love: '사랑', Nature: '자연', Spirituality: '영성', Universe: '우주', Culture: '문화', Abundance: '풍요', Peace: '평화', Time: '시간' },
    ja: { Harmony: '調和', Wisdom: '知恵', Love: '愛', Nature: '自然', Spirituality: 'スピリチュアル', Universe: '宇宙', Culture: '文化', Abundance: '豊かさ', Peace: '平和', Time: '時間' },
    ms: { Harmony: 'Keharmonian', Wisdom: 'Kebijaksanaan', Love: 'Cinta', Nature: 'Alam Semula Jadi', Spirituality: 'Kerohanian', Universe: 'Alam Semesta', Culture: 'Budaya', Abundance: 'Kelimpahan', Peace: 'Kedamaian', Time: 'Masa' }
};

const DAILY_MESSAGES = {
    en: {
        prefix: '🌟 Daily Energy Message:\n> ',
        brand: 'Connecting the world through positive energy'
    },
    zh: {
        prefix: '🌟 今日能量寄语：\n> ',
        brand: '连接万物，传递正能量'
    },
    ru: {
        prefix: '🌟 Послание энергии дня:\n> ',
        brand: 'Соединяя мир через позитивную энергию'
    },
    fr: {
        prefix: '🌟 Message d\'énergie du jour:\n> ',
        brand: 'Connecter le monde par l\'énergie positive'
    },
    es: {
        prefix: '🌟 Mensaje de energía diaria:\n> ',
        brand: 'Conectando el mundo a través de la energía positiva'
    },
    ar: {
        prefix: '🌟 رسالة الطاقة اليومية:\n> ',
        brand: 'ربط العالم عبر الطاقة الإيجابية'
    },
    vi: {
        prefix: '🌟 Thông điệp năng lượng hàng ngày:\n> ',
        brand: 'Kết nối thế giới qua năng lượng tích cực'
    },
    ko: {
        prefix: '🌟 오늘의 에너지 메시지:\n> ',
        brand: '긍정 에너지로 세계를 연결합니다'
    },
    ja: {
        prefix: '🌟 今日のエネルギーメッセージ：\n> ',
        brand: 'ポジティブエネルギーで世界をつなぐ'
    },
    ms: {
        prefix: '🌟 Mesej Tenaga Harian:\n> ',
        brand: 'Menghubungkan dunia melalui tenaga positif'
    }
};

// ===== 解析每日故事文件 =====
function parseDailyStory(content) {
    const stories = [];
    const blocks = content.split(/---\n/);
    
    for (const block of blocks) {
        const locationMatch = block.match(/\*\*地点\*\*[：:]\s*(.+)/);
        const energyMatch = block.match(/\*\*能量值\*\*[：:]\s*(\d+)/);
        const themeMatch = block.match(/####\s*(\S+)\s*[^·]*·\s*(\S+)/);
        const bodyMatch = block.match(/\*\*正文\*\*[：:]*\s*\n([\s\S]*?)(?=\n---|\n#|$)/);
        
        if (locationMatch && energyMatch) {
            const rawTheme = themeMatch ? themeMatch[2].replace('#', '') : '';
            const location = locationMatch[1].trim();
            const energy = parseInt(energyMatch[1]);
            
            // Extract body paragraphs
            let body = '';
            const quoteMatches = block.matchAll(/^>\s*(.+)$/gm);
            for (const m of quoteMatches) {
                if (m[1].includes('自动生成') || m[1].includes('EACO每日')) continue;
                body += m[1] + '\n\n';
            }
            body = body.trim();
            
            if (body.length > 20) {
                stories.push({
                    location,
                    energy,
                    theme: rawTheme,
                    emoji: THEME_EMOJIS[rawTheme] || '📍',
                    body
                });
            }
        }
    }
    
    return stories;
}

// ===== 为故事添加人工精选感悟（从分享文本中提取） =====
// 如果存在 reflection 文件，读取它
function loadReflections(dateStr, baseDir) {
    const refPath = path.join(baseDir, 'reflections', `${dateStr}.json`);
    if (fs.existsSync(refPath)) {
        try {
            return JSON.parse(fs.readFileSync(refPath, 'utf-8'));
        } catch (e) {}
    }
    return {};
}

// ===== 生成精选故事数据 =====
function selectFeatured(stories, count = 5) {
    // 按能量值排序，取前N个，但确保地点多样性
    const sorted = [...stories].sort((a, b) => b.energy - a.energy);
    const featured = [];
    const usedLocations = new Set();
    
    for (const story of sorted) {
        if (featured.length >= count) break;
        // 优先选择不同地点
        if (!usedLocations.has(story.location) || featured.length >= count - 2) {
            featured.push(story);
            usedLocations.add(story.location);
        }
    }
    
    // 按能量值排序
    return featured.sort((a, b) => b.energy - a.energy);
}

// ===== 构建日期目录下的JSON =====
function buildDateJSON(dateStr, stories, outputPath) {
    const featured = selectFeatured(stories, 5);
    
    // 为每种语言生成JSON
    for (const [lang, langName] of Object.entries(LANGUAGES)) {
        const themeNames = THEME_NAMES[lang] || THEME_NAMES.en;
        const data = {
            date: dateStr,
            language: langName,
            languageCode: lang,
            generated: new Date().toISOString(),
            totalStories: stories.length,
            featured: featured.map(s => ({
                location: s.location,
                energy: s.energy,
                theme: `${THEME_EMOJIS[s.theme] || ''} ${themeNames[s.theme] || s.theme}`,
                emoji: s.emoji,
                body: s.body  // 英文原文；翻译后会被替换
            }))
        };
        
        const outDir = path.join(outputPath, 'stories', dateStr);
        fs.mkdirSync(outDir, { recursive: true });
        fs.writeFileSync(path.join(outDir, `${dateStr}-${lang}.json`), JSON.stringify(data, null, 2), 'utf-8');
    }
    
    return featured;
}

// ===== 构建索引 =====
function buildIndex(allDates, outputPath) {
    const indexPath = path.join(outputPath, 'index');
    fs.mkdirSync(indexPath, { recursive: true });
    fs.writeFileSync(
        path.join(indexPath, 'index.json'),
        JSON.stringify({ dates: allDates.sort().reverse(), updated: new Date().toISOString() }, null, 2),
        'utf-8'
    );
}

// ===== 主函数 =====
function main() {
    const args = process.argv.slice(2);
    const targetDate = args[0] || new Date().toISOString().slice(0, 10).replace(/-/g, '');
    
    const dateFormatted = `${targetDate.slice(0, 4)}-${targetDate.slice(4, 6)}-${targetDate.slice(6, 8)}`;
    
    // 故事源文件路径
    const storyFile = path.join(__dirname, '..', 'openclaw', 'config', 'skills', 'eaco-earth-stories', 'daily-stories', `${targetDate}.md`);
    const outputBase = __dirname; // earth-story 目录
    
    console.log(`\n🌍 EACO Earth Story Builder`);
    console.log(`📅 Date: ${dateFormatted}`);
    console.log(`📁 Source: ${storyFile}`);
    console.log(`📂 Output: ${outputBase}`);
    
    if (!fs.existsSync(storyFile)) {
        console.error(`❌ Story file not found: ${storyFile}`);
        process.exit(1);
    }
    
    const content = fs.readFileSync(storyFile, 'utf-8');
    const stories = parseDailyStory(content);
    console.log(`\n✅ Parsed ${stories.length} stories`);
    
    // 构建JSON
    buildDateJSON(dateFormatted, stories, outputBase);
    console.log(`✅ Generated JSON files for ${Object.keys(LANGUAGES).length} languages`);
    
    // 更新索引
    const existingIndexPath = path.join(outputBase, 'index', 'index.json');
    let existingDates = [];
    if (fs.existsSync(existingIndexPath)) {
        try {
            existingDates = JSON.parse(fs.readFileSync(existingIndexPath, 'utf-8')).dates || [];
        } catch (e) {}
    }
    if (!existingDates.includes(dateFormatted)) {
        existingDates.push(dateFormatted);
        buildIndex(existingDates, outputBase);
        console.log(`✅ Updated index (${existingDates.length} dates total)`);
    }
    
    // 输出精选摘要
    const featured = selectFeatured(stories, 5);
    console.log(`\n🌟 Featured Stories (${dateFormatted}):`);
    featured.forEach((s, i) => {
        console.log(`  ${i + 1}. ${THEME_EMOJIS[s.theme] || ''} ${s.location} — Energy: ${s.energy}`);
    });
    
    console.log(`\n✅ Build complete! Run 'node deploy.js' to push to GitHub.`);
}

main();
