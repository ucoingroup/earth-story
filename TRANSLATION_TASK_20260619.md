# LLM 翻译集成任务 | 2026-06-19

## 任务目标
为 EACO Earth Story 网站添加 LLM 翻译功能，将每条故事自动翻译成 10 种语言。

## 完成工作

### 1. 翻译脚本开发
- ✅ 创建 `translate-stories.js` - Groq API 翻译脚本
- ✅ 创建 `translate-with-fallback.js` - 多 API 支持翻译脚本
- ✅ 创建 `translate-stories-safe.js` - 安全版（API Key 从环境变量读取）

### 2. Cron 任务更新
- ✅ 更新 cron 任务 `9df4f066-e52f-4233-ae4b-ed1a00a0052a`
- ✅ 添加翻译步骤到自动部署流程
- ✅ 每日 09:10 自动构建 + 翻译 + 部署

### 3. 构建脚本修复
- ✅ 修复 `build-story-site.js` 中 location 字段解析问题
- ✅ 现在正确提取地点名称（去掉多余信息）

## 当前状态

### ⚠️ 翻译 API 问题
- **Groq API 返回 403 Forbidden**
- API Key: (stored in environment variable, not committed)
- 错误原因：可能是 Key 失效、免费额度用完、或 IP 限制

### 替代方案

#### 方案 A：使用其他免费 LLM API
- OpenRouter (https://openrouter.ai)
- Together AI (https://together.ai)
- DeepSeek (https://deepseek.com)

#### 方案 B：浏览器端翻译
- 网站前端集成 Google Translate API
- 用户按需翻译（免费但需用户交互）

#### 方案 C：保留中文原文
- 网站显示中文故事
- 用户使用浏览器自带翻译功能

## 下一步行动

1. **测试 Groq API Key** - 确认是否失效
2. **申请其他免费 API** - 如 OpenRouter、DeepSeek
3. **更新翻译脚本** - 添加新的 API 支持
4. **推送更新到 GitHub** - 包含翻译脚本和 cron 配置

## 文件清单

| 文件 | 路径 | 状态 |
|------|------|------|
| 翻译脚本（安全版） | `earth-story/translate-stories-safe.js` | ✅ 已创建 |
| 构建脚本 | `earth-story/build-story-site.js` | ✅ 已修复 |
| Cron 任务 | `9df4f066-e52f-4233-ae4b-ed1a00a0052a` | ✅ 已更新 |

## 网站地址
- 主页：https://ucoingroup.github.io/earth-story/
- 精选故事：https://ucoingroup.github.io/earth-story/featured.html
