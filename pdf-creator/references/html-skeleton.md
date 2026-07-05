# HTML 技术骨架

整个 PDF 文档是一个完整的 HTML 文件。页面尺寸 A4（210mm×297mm），通过 CSS `@page` 规则控制纸张尺寸、页边距和页码。内容自然流动，用 `page-break-after` / `page-break-before` 控制分页。

## 骨架模板

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>Document Title</title>
  <!-- Tailwind CSS v3.4.17 Play CDN -->
  <script src="https://cdn.tailwindcss.com/3.4.17"></script>
  <!-- Font Awesome 7.0.1 -->
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.1/css/all.min.css" rel="stylesheet">
  <!-- Google Fonts（常用字体合集） -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Playfair+Display:wght@400;700&family=DM+Serif+Display&family=Noto+Sans+SC&family=Noto+Serif+SC&family=JetBrains+Mono&family=Crimson+Text:wght@400;700&family=Space+Grotesk:wght@400;700&family=Source+Code+Pro&display=swap" rel="stylesheet">
  <!-- ECharts 5.6.0: 仅在有数据图表时才取消注释引入 -->
  <!-- <script src="https://cdn.jsdelivr.net/npm/echarts@5.6.0/dist/echarts.min.js"></script> -->
  <style>
    /* ========== 页面设置 ========== */
    @page {
      size: A4;
      margin: 20mm 15mm 25mm 15mm;
      @bottom-center {
        content: counter(page);
        font-family: 'Noto Sans SC', sans-serif;
        font-size: 9pt;
        color: #888;
      }
    }

    /* 封面页：无页码 */
    @page cover {
      @bottom-center {
        content: none;
      }
    }

    /* 目录页：无页码（或用罗马数字，按需调整） */
    @page toc {
      @bottom-center {
        content: none;
      }
    }

    /* ========== 全局样式 ========== */
    body {
      margin: 0;
      padding: 0;
      font-family: 'Noto Serif SC', serif;
      font-size: 11pt;
      line-height: 1.8;
      color: #333;
    }

    /* ========== 命名页分配 ========== */
    .cover-page { page: cover; }
    .toc-page   { page: toc; }

    /* 正文起始：重置页码计数器为 1 */
    .body-start {
      counter-reset: page 1;
    }

    /* ========== 分页控制 ========== */
    .pb-before {
      page-break-before: always;
    }

    /* 避免在以下元素内部分页 */
    h1, h2, h3, h4, h5, h6 {
      page-break-after: avoid;
    }
    table, figure, blockquote {
      page-break-inside: avoid;
    }

    /* ========== 打印背景 ========== */
    /* Tailwind 的背景色在打印时默认不显示，需要通过 Playwright 的 printBackground 选项保持 */

    /* 
      以下由 Step 2 视觉规划决定：
      - 自定义字体 class（如 .font-serif, .font-sans 映射到具体字体族）
      - 特定的背景色/强调色
      - 页眉/页脚自定义内容（如文档标题显示在页眉）
      - 其他页面自定义样式
    */
  </style>
</head>
<body>
  <!-- 封面页 -->
  <div class="cover-page [h-screen flex flex-col justify-center items-center]">
    <!-- 封面内容 -->
  </div>

  <!-- 目录页 -->
  <div class="toc-page pb-before">
    <!-- 目录内容：<a href="#chapter-id">章节标题</a> -->
  </div>

  <!-- 正文第一章 -->
  <div class="body-start pb-before">
    <h1 id="chapter-1">第一章 标题</h1>
    <!-- 章节内容 -->
  </div>

  <!-- 正文第二章（如需强制新页起始） -->
  <div class="pb-before">
    <h1 id="chapter-2">第二章 标题</h1>
    <!-- 章节内容 -->
  </div>

  <!-- 更多章节... -->

  <!-- 可选封底 -->
  <!-- <div class="cover-page pb-before">封底内容</div> -->
</body>
</html>
```

## 页面布局约束

### @page 规则（硬性约束）

- `size: A4` — 固定 A4 纸张，不可更改
- `margin` — 默认 20mm 15mm 25mm 15mm（上 右 下 左），底部留 25mm 给页码，可按设计调整但建议不小于 15mm
- `@bottom-center` — 页码显示区，默认灰色小字居中
- 封面、目录和封底使用**命名页**（`@page cover` 或 `@page toc`），遮盖默认页码

### 分页控制

- 用 `pb-before` class 直接挂在需要新页起始的元素上，禁止用空 `<div>` 做分页符（空 div 会产生空白页）
- 封面页 `.cover-page` 和目录页 `.toc-page` 需加 `pb-before`
- 正文内容较短的章节可自然流动，不必每章都断页；如需强制从新页起始，在章标题的容器上加 `pb-before`
- 表格、图片、引用块设置 `page-break-inside: avoid`，避免在中间断裂
- 标题（h1-h6）设置 `page-break-after: avoid`，避免标题孤悬在页尾

### 页码规则（硬性约束）

这是最容易出错的环节，必须严格遵守：

1. **封面页**：`class="cover-page"` → 分配到命名页 `page: cover` → 无页码
2. **目录页**：`class="toc-page"` → 分配到命名页 `page: toc` → 无页码
3. **正文第一页**：`.body-start { counter-reset: page 1; }` → 将页码计数器重置为 1
4. 后续正文页自动递增：counter(page) 从 1 开始连续递增
5. **封底页**（如有）：`class="cover-page"` → 分配到命名页 `page: cover` → 无页码

**常见错误**：

- 忘记 `.body-start` 导致正文页码从封面开始连续计数
- `.body-start` 放错位置（必须放在正文第一个元素上）
- 命名页类名（`cover-page`、`toc-page`）与 CSS `page` 属性不匹配

### 目录超链接

目录中每个章节标题必须是内部超链接：

```html
<div class="toc-page">
  <h2>目录</h2>
  <ul>
    <li><a href="#chapter-1">第一章 背景与问题</a></li>
    <li><a href="#chapter-2">第二章 解决方案</a></li>
    <li><a href="#chapter-3">第三章 实施计划</a></li>
  </ul>
</div>
```

对应的章节标题必须设置匹配的 `id`：

```html
<h1 id="chapter-1">第一章 背景与问题</h1>
```

### 内容约束

- 代码块使用等宽字体（`JetBrains Mono` 或 `Source Code Pro`），浅灰背景区分
- 表格使用简洁边框，避免过于厚重的样式影响打印效果
- 不使用 CSS 动画（@keyframes/animation/transition）——PDF 是静态格式
- 打印背景色通过 Playwright 的 `printBackground: true` 选项保持

### 空间管理

- 长段落自动跨页时可能在不自然的位置断开，必要时用 `page-break-inside: avoid` 保护
- 表格过宽时考虑缩小字号或改用纵向布局
- 图片避免超出页边距，大图可用 `max-width: 100%` 约束
