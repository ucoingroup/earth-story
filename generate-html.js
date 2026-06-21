const fs = require('fs');

// 读取MD文件
const mdPath = 'C:\\Users\\Administrator\\.qclaw\\workspace\\openclaw\\config\\skills\\eaco-earth-stories\\scripts\\interstellar-stories-database.md';
const mdContent = fs.readFileSync(mdPath, 'utf-8');

// 按故事分隔符分割
const stories = [];
const lines = mdContent.split('\n');

let currentStory = null;
let currentSection = '';

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // 检测新故事开始
    if (line.includes('🌌 EACO-INT-')) {
        // 保存上一个故事
        if (currentStory) {
            stories.push(currentStory);
        }
        
        // 解析标题
        const idMatch = line.match(/EACO-INT-(\d+)/);
        const nameMatch = line.match(/·\s*(.+)$/);
        
        currentStory = {
            id: idMatch ? `EACO-INT-${idMatch[1]}` : '',
            civilization: nameMatch ? nameMatch[1].trim() : '',
            location: '',
            dimension: '',
            energy: 0,
            reading: 0,
            tags: [],
            content: '',
            goldenSentence: ''
        };
        continue;
    }
    
    if (!currentStory) continue;
    
    // 解析信息行
    if (line.includes('📍')) {
        const locationMatch = line.match(/📍\s*(.+?)\s*\|/);
        const dimensionMatch = line.match(/🌀\s*(.+?)\s*\|/);
        const energyMatch = line.match(/⚡\s*能量\s*(\d+)/);
        const readingMatch = line.match(/👁\s*阅读\s*(\d+)/);
        
        if (locationMatch) currentStory.location = locationMatch[1].trim();
        if (dimensionMatch) currentStory.dimension = dimensionMatch[1].trim();
        if (energyMatch) currentStory.energy = parseInt(energyMatch[1]);
        if (readingMatch) currentStory.reading = parseInt(readingMatch[1]);
        continue;
    }
    
    // 解析标签
    if (line.includes('🏷️')) {
        const tagMatches = line.match(/#[\w\u4e00-\u9fa5]+/g);
        if (tagMatches) {
            currentStory.tags = tagMatches.map(t => t.replace('#', ''));
        }
        continue;
    }
    
    // 解析金句
    if (line.includes('💫')) {
        currentStory.goldenSentence = line.replace(/^>\s*💫\s*/, '').trim();
        continue;
    }
    
    // 收集正文内容
    if (line.trim() && !line.startsWith('>') && !line.startsWith('---') && !line.startsWith('#')) {
        currentStory.content += line.trim() + ' ';
    }
}

// 保存最后一个故事
if (currentStory) {
    stories.push(currentStory);
}

// 过滤无效故事并添加预览
const validStories = stories.filter(s => s.civilization && s.energy > 0);
validStories.forEach(s => {
    s.preview = s.content.substring(0, 120).trim() + '...';
});

console.log(`成功解析 ${validStories.length} 个故事`);

// 生成JSON数据
const jsonData = JSON.stringify(validStories, null, 2);

// 创建HTML文件
const htmlTemplate = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🌌 星际文明正能量故事集</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #0a0e27;
            color: #fff;
            min-height: 100vh;
            overflow-x: hidden;
        }
        
        /* 星空背景 */
        #starfield {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 0;
            background: radial-gradient(ellipse at center, #1a1e3e 0%, #0a0e27 70%);
        }
        
        .star {
            position: absolute;
            background: #fff;
            border-radius: 50%;
            animation: twinkle var(--duration) ease-in-out infinite;
        }
        
        @keyframes twinkle {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 1; }
        }
        
        /* 主容器 */
        .container {
            position: relative;
            z-index: 1;
            display: flex;
            min-height: 100vh;
        }
        
        /* 左侧导航 */
        .sidebar {
            width: 240px;
            background: rgba(20, 24, 50, 0.9);
            backdrop-filter: blur(10px);
            padding: 20px;
            position: fixed;
            height: 100vh;
            overflow-y: auto;
            border-right: 1px solid rgba(100, 150, 255, 0.2);
        }
        
        .sidebar h2 {
            font-size: 1.2em;
            margin-bottom: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .filter-btn {
            display: block;
            width: 100%;
            padding: 12px 15px;
            margin-bottom: 8px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(100, 150, 255, 0.2);
            color: #fff;
            text-align: left;
            cursor: pointer;
            border-radius: 8px;
            transition: all 0.3s ease;
            font-size: 0.95em;
        }
        
        .filter-btn:hover {
            background: rgba(100, 150, 255, 0.2);
            border-color: rgba(100, 150, 255, 0.5);
            transform: translateX(5px);
        }
        
        .filter-btn.active {
            background: linear-gradient(135deg, rgba(102, 126, 234, 0.3), rgba(118, 75, 162, 0.3));
            border-color: #667eea;
            box-shadow: 0 0 15px rgba(102, 126, 234, 0.3);
        }
        
        /* 主内容区 */
        .main-content {
            margin-left: 240px;
            padding: 30px;
            flex: 1;
            width: calc(100% - 240px);
        }
        
        .header {
            text-align: center;
            margin-bottom: 40px;
        }
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            animation: glow 3s ease-in-out infinite;
        }
        
        @keyframes glow {
            0%, 100% { filter: brightness(1); }
            50% { filter: brightness(1.3); }
        }
        
        .header p {
            color: rgba(255, 255, 255, 0.7);
            font-size: 1.1em;
        }
        
        /* 排序控制 */
        .controls {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            padding: 15px;
            background: rgba(20, 24, 50, 0.6);
            border-radius: 12px;
            backdrop-filter: blur(10px);
        }
        
        .sort-btn {
            padding: 10px 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            color: #fff;
            border-radius: 8px;
            cursor: pointer;
            font-size: 0.95em;
            transition: all 0.3s ease;
        }
        
        .sort-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }
        
        .story-count {
            color: rgba(255, 255, 255, 0.8);
            font-size: 0.95em;
        }
        
        /* 故事卡片网格 */
        .stories-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 25px;
            margin-top: 20px;
        }
        
        .story-card {
            background: rgba(20, 24, 50, 0.8);
            backdrop-filter: blur(10px);
            border-radius: 16px;
            padding: 25px;
            cursor: pointer;
            transition: all 0.4s ease;
            border: 2px solid transparent;
            position: relative;
            overflow: hidden;
        }
        
        .story-card::before {
            content: '';
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            background: linear-gradient(135deg, #667eea, #764ba2, #f093fb);
            border-radius: 16px;
            opacity: 0;
            z-index: -1;
            transition: opacity 0.4s ease;
        }
        
        .story-card:hover::before {
            opacity: 1;
        }
        
        .story-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 12px 40px rgba(102, 126, 234, 0.3);
        }
        
        /* 能量值发光效果 */
        .story-card[data-energy="840"] { box-shadow: 0 0 30px rgba(255, 215, 0, 0.6); border-color: rgba(255, 215, 0, 0.8); }
        .story-card[data-energy="790"] { box-shadow: 0 0 25px rgba(255, 215, 0, 0.5); border-color: rgba(255, 215, 0, 0.7); }
        .story-card[data-energy="779"] { box-shadow: 0 0 22px rgba(255, 215, 0, 0.4); border-color: rgba(255, 215, 0, 0.6); }
        .story-card[data-energy="777"] { box-shadow: 0 0 22px rgba(255, 165, 0, 0.4); border-color: rgba(255, 165, 0, 0.6); }
        .story-card[data-energy="750"] { box-shadow: 0 0 20px rgba(255, 165, 0, 0.4); border-color: rgba(255, 165, 0, 0.5); }
        .story-card[data-energy="743"] { box-shadow: 0 0 18px rgba(255, 140, 0, 0.4); border-color: rgba(255, 140, 0, 0.5); }
        .story-card[data-energy="741"] { box-shadow: 0 0 18px rgba(255, 140, 0, 0.3); border-color: rgba(255, 140, 0, 0.5); }
        .story-card[data-energy="737"] { box-shadow: 0 0 16px rgba(255, 100, 100, 0.3); border-color: rgba(255, 100, 100, 0.4); }
        .story-card[data-energy="736"] { box-shadow: 0 0 16px rgba(255, 100, 100, 0.3); border-color: rgba(255, 100, 100, 0.4); }
        .story-card[data-energy="735"] { box-shadow: 0 0 15px rgba(255, 100, 200, 0.3); border-color: rgba(255, 100, 200, 0.4); }
        
        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .civilization-name {
            font-size: 1.3em;
            font-weight: bold;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .dimension-badge {
            padding: 5px 12px;
            background: linear-gradient(135deg, rgba(102, 126, 234, 0.3), rgba(118, 75, 162, 0.3));
            border-radius: 20px;
            font-size: 0.85em;
            border: 1px solid rgba(102, 126, 234, 0.5);
        }
        
        .energy-bar {
            margin: 15px 0;
        }
        
        .energy-label {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 0.9em;
            color: rgba(255, 255, 255, 0.8);
        }
        
        .energy-progress {
            height: 8px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            overflow: hidden;
        }
        
        .energy-fill {
            height: 100%;
            background: linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
            border-radius: 10px;
            transition: width 0.6s ease;
        }
        
        .story-preview {
            color: rgba(255, 255, 255, 0.7);
            font-size: 0.95em;
            line-height: 1.6;
            margin: 15px 0;
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
        
        .golden-sentence {
            margin-top: 15px;
            padding: 12px;
            background: rgba(255, 215, 0, 0.1);
            border-left: 3px solid #ffd700;
            border-radius: 8px;
            font-style: italic;
            color: #ffd700;
            font-size: 0.9em;
        }
        
        .card-footer {
            margin-top: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 0.85em;
            color: rgba(255, 255, 255, 0.5);
        }
        
        /* 模态框 */
        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.85);
            z-index: 1000;
            backdrop-filter: blur(5px);
            animation: fadeIn 0.3s ease;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        .modal.active {
            display: flex;
            justify-content: center;
            align-items: center;
        }
        
        .modal-content {
            background: linear-gradient(135deg, #1a1e3e 0%, #0a0e27 100%);
            padding: 40px;
            border-radius: 20px;
            max-width: 700px;
            width: 90%;
            max-height: 85vh;
            overflow-y: auto;
            position: relative;
            border: 2px solid rgba(102, 126, 234, 0.3);
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            animation: slideUp 0.4s ease;
        }
        
        @keyframes slideUp {
            from { transform: translateY(50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        
        .modal-close {
            position: absolute;
            top: 20px;
            right: 20px;
            font-size: 2em;
            color: rgba(255, 255, 255, 0.5);
            cursor: pointer;
            transition: all 0.3s ease;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
        }
        
        .modal-close:hover {
            color: #fff;
            background: rgba(255, 255, 255, 0.1);
            transform: rotate(90deg);
        }
        
        .modal-body {
            margin-top: 20px;
        }
        
        .modal-body h2 {
            font-size: 1.8em;
            margin-bottom: 10px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .modal-body .story-meta {
            display: flex;
            gap: 15px;
            margin-bottom: 20px;
            flex-wrap: wrap;
        }
        
        .modal-body .story-meta span {
            padding: 5px 12px;
            background: rgba(102, 126, 234, 0.2);
            border-radius: 20px;
            font-size: 0.9em;
        }
        
        .modal-body .full-story {
            line-height: 1.8;
            font-size: 1.05em;
            color: rgba(255, 255, 255, 0.9);
        }
        
        .modal-body .golden-sentence-full {
            margin-top: 30px;
            padding: 20px;
            background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 215, 0, 0.05));
            border-left: 4px solid #ffd700;
            border-radius: 12px;
            font-size: 1.1em;
            color: #ffd700;
            font-style: italic;
        }
        
        /* 响应式设计 */
        @media (max-width: 1024px) {
            .sidebar {
                width: 200px;
            }
            .main-content {
                margin-left: 200px;
                width: calc(100% - 200px);
            }
        }
        
        @media (max-width: 768px) {
            .container {
                flex-direction: column;
            }
            .sidebar {
                width: 100%;
                height: auto;
                position: relative;
                padding: 15px;
            }
            .main-content {
                margin-left: 0;
                width: 100%;
                padding: 20px;
            }
            .stories-grid {
                grid-template-columns: 1fr;
            }
            .header h1 {
                font-size: 1.8em;
            }
        }
        
        /* 滚动条样式 */
        ::-webkit-scrollbar {
            width: 8px;
        }
        
        ::-webkit-scrollbar-track {
            background: rgba(20, 24, 50, 0.5);
        }
        
        ::-webkit-scrollbar-thumb {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 10px;
        }
    </style>
</head>
<body>
    <canvas id="starfield"></canvas>
    
    <div class="container">
        <aside class="sidebar">
            <h2>🌌 维度筛选</h2>
            <button class="filter-btn active" data-dimension="全部">全部故事</button>
            <button class="filter-btn" data-dimension="∞">∞ 无限维度</button>
            <button class="filter-btn" data-dimension="9D">9D 九维</button>
            <button class="filter-btn" data-dimension="8D">8D 八维</button>
            <button class="filter-btn" data-dimension="7D">7D 七维</button>
            <button class="filter-btn" data-dimension="6D">6D 六维</button>
            <button class="filter-btn" data-dimension="5D">5D 五维</button>
            <button class="filter-btn" data-dimension="4D">4D 四维</button>
            <button class="filter-btn" data-dimension="3D">3D 三维</button>
        </aside>
        
        <main class="main-content">
            <div class="header">
                <h1>🌌 星际文明正能量故事集</h1>
                <p>EACO星际网络 · 100个高维文明故事</p>
            </div>
            
            <div class="controls">
                <button class="sort-btn" id="sortBtn">按能量值排序 ↓</button>
                <div class="story-count" id="storyCount">共 0 个故事</div>
            </div>
            
            <div class="stories-grid" id="storiesGrid"></div>
        </main>
    </div>
    
    <div class="modal" id="storyModal">
        <div class="modal-content">
            <span class="modal-close" id="modalClose">&times;</span>
            <div class="modal-body" id="modalBody"></div>
        </div>
    </div>
    
    <script>
        // 星空背景动画
        const canvas = document.getElementById('starfield');
        const ctx = canvas.getContext('2d');
        
        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        const stars = [];
        for (let i = 0; i < 200; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 2,
                alpha: Math.random(),
                delta: Math.random() * 0.02
            });
        }
        
        function animateStars() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            stars.forEach(star => {
                star.alpha += star.delta;
                if (star.alpha <= 0 || star.alpha >= 1) star.delta = -star.delta;
                
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
                ctx.fillStyle = \`rgba(255, 255, 255, \${star.alpha})\`;
                ctx.fill();
            });
            
            requestAnimationFrame(animateStars);
        }
        animateStars();
        
        // 故事数据
        const stories = ${jsonData};
        
        let currentFilter = '全部';
        let sortAscending = false;
        
        // 渲染故事卡片
        function renderStories(storiesToRender) {
            const grid = document.getElementById('storiesGrid');
            grid.innerHTML = '';
            
            storiesToRender.forEach(story => {
                const card = document.createElement('div');
                card.className = 'story-card';
                card.dataset.energy = story.energy;
                
                const energyPercent = (story.energy / 840 * 100).toFixed(0);
                
                card.innerHTML = \`
                    <div class="card-header">
                        <div class="civilization-name">\${story.civilization}</div>
                        <div class="dimension-badge">\${story.dimension}</div>
                    </div>
                    <div class="energy-bar">
                        <div class="energy-label">
                            <span>⚡ 能量值</span>
                            <span>\${story.energy}</span>
                        </div>
                        <div class="energy-progress">
                            <div class="energy-fill" style="width: \${energyPercent}%"></div>
                        </div>
                    </div>
                    <div class="story-preview">\${story.preview}</div>
                    <div class="golden-sentence">💫 \${story.goldenSentence}</div>
                    <div class="card-footer">
                        <span>📍 \${story.location}</span>
                        <span>👁 \${story.reading} 阅读</span>
                    </div>
                \`;
                
                card.addEventListener('click', () => openModal(story));
                grid.appendChild(card);
            });
            
            document.getElementById('storyCount').textContent = \`共 \${storiesToRender.length} 个故事\`;
        }
        
        // 筛选故事
        function filterStories(dimension) {
            if (dimension === '全部') return stories;
            return stories.filter(s => s.dimension.includes(dimension));
        }
        
        // 排序故事
        function sortStories(storiesToSort) {
            return storiesToSort.sort((a, b) => {
                return sortAscending ? a.energy - b.energy : b.energy - a.energy;
            });
        }
        
        // 打开模态框
        function openModal(story) {
            const modal = document.getElementById('storyModal');
            const modalBody = document.getElementById('modalBody');
            
            modalBody.innerHTML = \`
                <h2>\${story.id} · \${story.civilization}</h2>
                <div class="story-meta">
                    <span>📍 \${story.location}</span>
                    <span>🌀 \${story.dimension}</span>
                    <span>⚡ 能量 \${story.energy}</span>
                    <span>👁 阅读 \${story.reading}</span>
                </div>
                <div class="full-story">\${story.content}</div>
                <div class="golden-sentence-full">💫 \${story.goldenSentence}</div>
            \`;
            
            modal.classList.add('active');
        }
        
        // 关闭模态框
        document.getElementById('modalClose').addEventListener('click', () => {
            document.getElementById('storyModal').classList.remove('active');
        });
        
        document.getElementById('storyModal').addEventListener('click', (e) => {
            if (e.target.id === 'storyModal') {
                e.target.classList.remove('active');
            }
        });
        
        // 筛选按钮事件
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                currentFilter = btn.dataset.dimension;
                const filtered = filterStories(currentFilter);
                const sorted = sortStories(filtered);
                renderStories(sorted);
            });
        });
        
        // 排序按钮事件
        document.getElementById('sortBtn').addEventListener('click', () => {
            sortAscending = !sortAscending;
            document.getElementById('sortBtn').textContent = sortAscending ? '按能量值排序 ↑' : '按能量值排序 ↓';
            
            const filtered = filterStories(currentFilter);
            const sorted = sortStories(filtered);
            renderStories(sorted);
        });
        
        // 初始化
        const initialStories = sortStories(stories);
        renderStories(initialStories);
    </script>
</body>
</html>`;

fs.writeFileSync('C:\\Users\\Administrator\\.qclaw\\workspace\\earth-story\\interstellar.html', htmlTemplate, 'utf-8');
console.log('HTML文件已生成: interstellar.html');
