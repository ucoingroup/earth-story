/**
 * build-featured-stories.js
 * 从 stories-database.md 中解析所有故事
 * 挑选能量值最高的 100-200 个
 * 生成多语言 JSON 数据文件供网站使用
 */

const fs = require('fs');
const path = require('path');

// ===== 配置 =====
const INPUT_FILE = path.join(__dirname, '..', 'openclaw', 'config', 'skills', 'eaco-earth-stories', 'stories-database.md');
const OUTPUT_DIR = __dirname; // earth-story 目录
const FEATURED_COUNT = 150; // 挑选前150个

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

// ===== 解析故事数据库 =====
function parseStoriesDatabase(content) {
    const stories = [];
    const lines = content.split('\n');
    
    let currentStory = null;
    let inBody = false;
    let bodyLines = [];
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // 检测新故事开始: ### 🌏 EACO-XXX · 主题 · 标题
        const titleMatch = line.match(/###\s+[^\·]+\·\s*([^\·]+)\·\s*(.+)/);
        if (line.startsWith('### ') && line.includes('EACO-')) {
            // 保存上一个故事
            if (currentStory && bodyLines.length > 0) {
                currentStory.body = bodyLines.join('\n').trim();
                stories.push(currentStory);
            }
            
            // 解析故事编号和标题
            const match = line.match(/EACO-(\d+)\s*·\s*([^\·]+)·\s*(.+)/);
            if (match) {
                currentStory = {
                    id: match[1],
                    themeRaw: match[2].trim(),
                    title: match[3].trim(),
                    location: '',
                    character: '',
                    energy: 0,
                    views: 0,
                    mechanism: '',
                    inspiration: '',
                    body: '',
                    tags: []
                };
                inBody = false;
                bodyLines = [];
            }
            continue;
        }
        
        if (!currentStory) continue;
        
        // 解析元数据行: 📍 地点 | 👤 人物 | ⚡ 能量 | 👁 阅读
        if (line.includes('📍') && line.includes('⚡')) {
            const locMatch = line.match(/📍\s*(.+?)\s*\|/);
            const energyMatch = line.match(/⚡\s*能量\s*(\d+)/);
            const viewsMatch = line.match(/👁\s*阅读\s*(\d+)/);
            if (locMatch) currentStory.location = locMatch[1].trim();
            if (energyMatch) currentStory.energy = parseInt(energyMatch[1]);
            if (viewsMatch) currentStory.views = parseInt(viewsMatch[1]);
            continue;
        }
        
        // 解析 EACO 机制
        if (line.includes('💰 EACO机制')) {
            const mechMatch = line.match(/💰\s*EACO机制:\s*(.+)/);
            if (mechMatch) currentStory.mechanism = mechMatch[1].trim();
            continue;
        }
        
        // 解析灵感
        if (line.includes('🌱 灵感')) {
            const inspMatch = line.match(/🌱\s*灵感:\s*(.+)/);
            if (inspMatch) currentStory.inspiration = inspMatch[1].trim();
            continue;
        }
        
        // 解析标签
        if (line.startsWith('#') && !line.startsWith('### ') && !line.startsWith('## ')) {
            const tags = line.split(/\s+/).filter(t => t.startsWith('#')).map(t => t.replace('#', ''));
            currentStory.tags = tags;
            continue;
        }
        
        // 故事正文：收集 --- 之前的所有段落
        if (line.trim() === '---') {
            if (currentStory && bodyLines.length > 0) {
                currentStory.body = bodyLines.join('\n\n').trim();
                stories.push(currentStory);
                currentStory = null;
                bodyLines = [];
                inBody = false;
            }
            continue;
        }
        
        // 收集正文（跳过元数据行）
        if (currentStory && !line.startsWith('#') && !line.startsWith('💰') && 
            !line.startsWith('🌱') && !line.startsWith('📍') && !line.startsWith('👤') &&
            line.trim() !== '') {
            // 检查是否是元数据行
            if (!line.match(/^[📍👤⚡👁💰🌱]/) && !line.includes('EACO机制') && !line.includes('灵感:')) {
                bodyLines.push(line);
            }
        }
    }
    
    // 保存最后一个故事
    if (currentStory && bodyLines.length > 0) {
        currentStory.body = bodyLines.join('\n\n').trim();
        stories.push(currentStory);
    }
    
    return stories;
}

// ===== 清理正文（去掉 markdown 引用标记）=====
function cleanBody(body) {
    return body
        .split('\n')
        .map(line => line.replace(/^>\s*/, ''))
        .filter(line => line.trim() !== '')
        .join('\n\n');
}

// ===== 生成精选集 JSON =====
function buildFeaturedJSON(stories, lang) {
    const themeNames = {
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
    
    const t = themeNames[lang] || themeNames.en;
    
    return {
        collection: 'featured',
        collectionName: lang === 'zh' ? '精选故事集' : 'Featured Stories',
        language: LANGUAGES[lang] || LANGUAGES.en,
        languageCode: lang,
        generated: new Date().toISOString(),
        totalStories: stories.length,
        stories: stories.map(s => {
            const themeKey = Object.keys(t).find(k => s.themeRaw.includes(k)) || 'Harmony';
            return {
                id: s.id,
                location: s.location,
                energy: s.energy,
                views: s.views,
                theme: `${THEME_EMOJIS[themeKey] || '📍'} ${t[themeKey] || themeKey}`,
                emoji: THEME_EMOJIS[themeKey] || '📍',
                title: s.title,
                body: cleanBody(s.body),
                mechanism: s.mechanism,
                inspiration: s.inspiration,
                tags: s.tags
            };
        })
    };
}

// ===== 主函数 =====
function main() {
    console.log('\n🌍 EACO Featured Stories Builder');
    console.log(`📂 Input: ${INPUT_FILE}`);
    console.log(`📁 Output: ${path.join(OUTPUT_DIR, 'stories', 'featured')}`);
    console.log(`📊 Selecting top ${FEATURED_COUNT} stories by energy\n`);
    
    if (!fs.existsSync(INPUT_FILE)) {
        console.error(`❌ Stories database not found: ${INPUT_FILE}`);
        console.error('   Please check the path and try again.');
        process.exit(1);
    }
    
    console.log('📖 Reading stories database...');
    const content = fs.readFileSync(INPUT_FILE, 'utf-8');
    
    console.log('🔍 Parsing stories...');
    const allStories = parseStoriesDatabase(content);
    console.log(`✅ Parsed ${allStories.length} stories total`);
    
    if (allStories.length === 0) {
        console.error('❌ No stories found! Check the file format.');
        process.exit(1);
    }
    
    // 按能量值排序，取前 N 个
    const featured = allStories
        .sort((a, b) => b.energy - a.energy)
        .slice(0, FEATURED_COUNT);
    
    console.log(`\n🌟 Top ${featured.length} stories by energy:`);
    featured.slice(0, 10).forEach((s, i) => {
        console.log(`   ${i + 1}. [${s.energy}] ${s.location} — ${s.title}`);
    });
    console.log(`   ... and ${featured.length - 10} more`);
    
    // 生成多语言 JSON 文件
    const outDir = path.join(OUTPUT_DIR, 'stories', 'featured');
    fs.mkdirSync(outDir, { recursive: true });
    
    console.log(`\n📝 Generating JSON files for ${Object.keys(LANGUAGES).length} languages...`);
    
    for (const [lang, langName] of Object.entries(LANGUAGES)) {
        const data = buildFeaturedJSON(featured, lang);
        const outPath = path.join(outDir, `featured-${lang}.json`);
        fs.writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf-8');
        console.log(`   ✅ ${lang} (${langName})`);
    }
    
    // 更新索引
    const indexPath = path.join(OUTPUT_DIR, 'index', 'index.json');
    let indexData = { dates: [], collections: [], updated: new Date().toISOString() };
    if (fs.existsSync(indexPath)) {
        try {
            indexData = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
        } catch (e) {}
    }
    
    if (!indexData.collections) indexData.collections = [];
    if (!indexData.collections.includes('featured')) {
        indexData.collections.push('featured');
    }
    indexData.updated = new Date().toISOString();
    
    fs.mkdirSync(path.dirname(indexPath), { recursive: true });
    fs.writeFileSync(indexPath, JSON.stringify(indexData, null, 2), 'utf-8');
    console.log(`\n✅ Updated index.json (collections: ${indexData.collections.join(', ')})`);
    
    console.log(`\n✅ Featured stories build complete!`);
    console.log(`📊 Stats:`);
    console.log(`   - Total stories in DB: ${allStories.length}`);
    console.log(`   - Featured stories: ${featured.length}`);
    console.log(`   - Energy range: ${featured[featured.length - 1].energy} ~ ${featured[0].energy}`);
    console.log(`\n🚀 Run 'node deploy.js' to push to GitHub Pages!`);
}

main();
