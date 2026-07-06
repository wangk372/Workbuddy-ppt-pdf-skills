/**
 * merge_slides.js — 将独立 slide_XX.html 合并为单个 HTML，供 html2pptx.js 转换
 *
 * 用法：node merge_slides.js <slides目录> <输出文件>
 * 示例：node merge_slides.js ./slides ./slides_merged.html
 */

const fs = require('fs');
const path = require('path');

const [slidesDir, outputFile] = process.argv.slice(2);

if (!slidesDir || !outputFile) {
    console.error('用法: node merge_slides.js <slides目录> <输出文件>');
    process.exit(1);
}

// 读取并排序 slide 文件
const files = fs.readdirSync(slidesDir)
    .filter(f => /^slide_\d+\.html$/.test(f))
    .sort((a, b) => {
        const na = parseInt(a.match(/slide_(\d+)/)[1]);
        const nb = parseInt(b.match(/slide_(\d+)/)[1]);
        return na - nb;
    });

if (files.length === 0) {
    console.error('错误: 目录中没有找到 slide_XX.html 文件');
    process.exit(1);
}

// 收集所有 style 块（去重）和 body 内容
const styleSet = new Set();
const slideBodies = [];

for (const file of files) {
    const html = fs.readFileSync(path.join(slidesDir, file), 'utf-8');

    // 提取 <style> 块内容（去重）
    const styleMatches = html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) || [];
    for (const s of styleMatches) {
        const inner = s.replace(/<\/?style[^>]*>/gi, '').trim();
        if (inner) styleSet.add(inner);
    }

    // 提取 <body> 内容
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch) {
        slideBodies.push(bodyMatch[1].trim());
    }
}

// 构建合并后的 HTML
const combinedStyles = [...styleSet].map(s => `    ${s}`).join('\n\n');

const output = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>PPT Slides</title>
  <!-- Tailwind CSS v3.4.17 Play CDN -->
  <script src="https://cdn.tailwindcss.com/3.4.17"></script>
  <!-- Font Awesome 7.0.1 -->
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.1/css/all.min.css" rel="stylesheet">
  <!-- Google Fonts（8 风格常用字体合集） -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Playfair+Display:wght@400;700&family=DM+Serif+Display&family=Noto+Sans+SC&family=Noto+Serif+SC&family=JetBrains+Mono&family=Crimson+Text:wght@400;700&family=Space+Grotesk:wght@400;700&display=swap" rel="stylesheet">
  <!-- ECharts 6.1.0: 需要复杂图表时预先生成 PNG 后放入 assets/，HTML 中用 <img> 引用 -->
  <!-- <script src="https://cdn.jsdelivr.net/npm/echarts@6.1.0/dist/echarts.min.js"></script> -->
  <style>
${combinedStyles}
  </style>
</head>
<body>
${slideBodies.join('\n')}
</body>
</html>`;

fs.writeFileSync(outputFile, output, 'utf-8');
console.log(`已合并 ${files.length} 页 → ${outputFile}`);
