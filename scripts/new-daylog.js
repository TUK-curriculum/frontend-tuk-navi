#!/usr/bin/env node
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Resolve current directory (ESM compatible)
const __dirname = dirname(fileURLToPath(import.meta.url));

// Build date string YYYY-MM-DD
const now = new Date();
const yyyy = now.getFullYear();
const mm = String(now.getMonth() + 1).padStart(2, '0');
const dd = String(now.getDate()).padStart(2, '0');
const dateStr = `${yyyy}-${mm}-${dd}`;

// Target paths
const dirPath = join(__dirname, '..', 'docs', 'daily');
const filePath = join(dirPath, `${dateStr}.md`);

if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
}

if (existsSync(filePath)) {
    console.log(`✅ Dev diary already exists for ${dateStr}: ${filePath}`);
    process.exit(0);
}

const template = `# 🗓️ ${dateStr} Dev Diary\n\n## 📌 오늘 목표\n\n## ✅ 작업 내용\n\n## 🐞 트러블슈팅 로그\n\n## ✍️ 내일 할 일\n\n`;

writeFileSync(filePath, template, 'utf8');
console.log(`✨ Created new dev diary: ${filePath}`);

// Auto git add/commit/push when --commit or -c flag is provided
if (process.argv.includes('--commit') || process.argv.includes('-c')) {
    try {
        execSync(`git add ${filePath}`, { stdio: 'inherit' });
        execSync(`git commit -m "docs: dev diary ${dateStr}"`, { stdio: 'inherit' });
        // Determine current branch name
        const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
        execSync(`git push origin ${branch}`, { stdio: 'inherit' });
    } catch (err) {
        console.error('⚠️  Git auto-commit failed:', err.message);
    }
} 