/**
 * translate-stories-safe.js
 * 安全的翻译脚本 - 从环境变量读取 API Key
 * 用法: TRANSLATE_API_KEY=your_key node translate-stories-safe.js [date]
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// ===== 语言配置 =====
const LANGUAGES = {
    en: 'English',
    ru: 'Русский',
    fr: 'Français',
    es: 'Español',
    ar: 'العربية',
    vi: 'Tiếng Việt',
    ko: '한국어',
    ja: '日本語',
    ms: 'Bahasa Melayu'
};

const THEME_NAMES = {
    en: { Harmony: 'Harmony', Wisdom: 'Wisdom', Love: 'Love', Nature: 'Nature', Spirituality: 'Spirituality', Universe: 'Universe', Culture: 'Culture', Abundance: 'Abundance', Peace: 'Peace', Time: 'Time' },
    ru: { Harmony: 'Гармония', Wisdom: 'Мудрость', Love: 'Любовь', Nature: 'Природа', Spirituality: 'Духовность', Universe: 'Вселенная', Culture: 'Культура', Abundance: 'Изобилие', Peace: 'Мир', Time: 'Время' },
    fr: { Harmony: 'Harmonie', Wisdom: 'Sagesse', Love: 'Amour', Nature: 'Nature', Spirituality: 'Spiritualité', Universe: 'Univers', Culture: 'Culture', Abundance: 'Abondance', Peace: 'Paix', Time: 'Temps' },
    es: { Harmony: 'Armonía', Wisdom: 'Sabiduría', Love: 'Amor', Nature: 'Naturaleza', Spirituality: 'Espiritualidad', Universe: 'Universo', Culture: 'Cultura', Abundance: 'Abundancia', Peace: 'Paz', Time: 'Tiempo' },
    ar: { Harmony: 'الانسجام', Wisdom: 'الحكمة', Love: 'الحب', Nature: 'الطبيعة', Spirituality: 'الروحانية', Universe: 'الكون', Culture: 'الثقافة', Abundance: 'الوفرة', Peace: 'السلام', Time: 'الوقت' },
    vi: { Harmony: 'Hòa hợp', Wisdom: 'Trí tuệ', Love: 'Tình yêu', Nature: 'Thiên nhiên', Spirituality: 'Tâm linh', Universe: 'Vũ trụ', Culture: 'Văn hóa', Abundance: 'Thịnh vượng', Peace: 'Hòa bình', Time: 'Thời gian' },
    ko: { Harmony: '조화', Wisdom: '지혜', Love: '사랑', Nature: '자연', Spirituality: '영성', Universe: '우주', Culture: '문화', Abundance: '풍요', Peace: '평화', Time: '시간' },
    ja: { Harmony: '調和', Wisdom: '知恵', Love: '愛', Nature: '自然', Spirituality: 'スピリチュアル', Universe: '宇宙', Culture: '文化', Abundance: '豊かさ', Peace: '平和', Time: '時間' },
    ms: { Harmony: 'Keharmonian', Wisdom: 'Kebijaksanaan', Love: 'Cinta', Nature: 'Alam Semula Jadi', Spirituality: 'Kerohanian', Universe: 'Alam Semesta', Culture: 'Budaya', Abundance: 'Kelimpahan', Peace: 'Kedamaian', Time: 'Masa' }
};

const THEME_EMOJIS = {
    'Harmony': '🌏', 'Wisdom': '🌌', 'Love': '❤️', 'Nature': '🌿',
    'Spirituality': '✨', 'Universe': '🔭', 'Culture': '🎭',
    'Abundance': '💰', 'Peace': '☮️', 'Time': '⏰'
};

// ===== 翻译函数 =====
async function translateText(text, targetLang, apiKey) {
    if (!apiKey) {
        return text; // 无 API Key，返回原文
    }
    
    const langName = LANGUAGES[targetLang];
    
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({
            model: 'llama-3.1-70b-versatile',
            messages: [
                { role: 'system', content: `Translate to ${langName}. Keep the warm, uplifting tone. Return only the translation.` },
                { role: 'user', content: text }
            ],
            temperature: 0.3,
            max_tokens: 2000
        });

        const options = {
            hostname: 'api.groq.com',
            port: 443,
            path: '/openai/v1/chat/completions',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json.choices?.[0]) {
                        resolve(json.choices[0].message.content.trim());
                    } else if (json.error) {
                        reject(new Error(json.error.message));
                    } else {
                        reject(new Error('Invalid response'));
                    }
                } catch (e) {
                    reject(e);
                }
            });
        });

        req.on('error', reject);
        req.setTimeout(30000, () => {
            req.destroy();
            reject(new Error('Timeout'));
        });
        req.write(postData);
        req.end();
    });
}

// ===== 主函数 =====
async function main() {
    const args = process.argv.slice(2);
    const dateStr = args[0] || new Date().toISOString().slice(0, 10);
    
    // 从环境变量读取 API Key
    const apiKey = process.env.TRANSLATE_API_KEY || process.env.GROQ_API_KEY || '';
    
    console.log('\n🌍 EACO Story Translator');
    console.log(`📅 Date: ${dateStr}`);
    console.log(`🔑 API Key: ${apiKey ? 'Provided' : 'Not provided (will keep original text)'}`);
    
    const inputDir = __dirname;
    const zhPath = path.join(inputDir, 'stories', dateStr, `${dateStr}-zh.json`);
    
    if (!fs.existsSync(zhPath)) {
        console.log(`❌ Chinese source not found: ${zhPath}`);
        process.exit(1);
    }
    
    const zhData = JSON.parse(fs.readFileSync(zhPath, 'utf-8'));
    console.log(`📖 Found ${zhData.featured?.length || 0} stories`);
    
    // 翻译所有语言
    for (const [lang, langName] of Object.entries(LANGUAGES)) {
        const outPath = path.join(inputDir, 'stories', dateStr, `${dateStr}-${lang}.json`);
        console.log(`\n🔄 Processing ${langName}...`);
        
        const translatedStories = [];
        for (const story of (zhData.featured || [])) {
            try {
                const translatedBody = await translateText(story.body, lang, apiKey);
                translatedStories.push({
                    ...story,
                    body: translatedBody
                });
                
                if (apiKey) {
                    await new Promise(r => setTimeout(r, 300)); // 避免限流
                }
            } catch (error) {
                console.log(`  ⚠️ Translation failed: ${error.message}`);
                translatedStories.push(story); // 保留原文
            }
        }
        
        const themeNames = THEME_NAMES[lang] || THEME_NAMES.en;
        const outputData = {
            date: dateStr,
            language: langName,
            languageCode: lang,
            generated: new Date().toISOString(),
            totalStories: zhData.totalStories || translatedStories.length,
            featured: translatedStories.map(s => ({
                location: s.location,
                energy: s.energy,
                theme: `${THEME_EMOJIS[s.theme] || '📍'} ${themeNames[s.theme] || s.theme}`,
                emoji: s.emoji || THEME_EMOJIS[s.theme] || '📍',
                body: s.body
            }))
        };
        
        fs.mkdirSync(path.dirname(outPath), { recursive: true });
        fs.writeFileSync(outPath, JSON.stringify(outputData, null, 2), 'utf-8');
        console.log(`✅ ${lang} saved`);
    }
    
    console.log('\n✅ Translation complete!');
}

main();
