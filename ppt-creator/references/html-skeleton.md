# HTML 技术骨架

每页 slide 共用同一个技术外壳。画布尺寸 1440×810（16:9），与 html2pptx 转换引擎完全匹配。骨架内部的布局、排版、装饰完全自由。

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=1440">
  <title>Slide Title</title>
  <!-- Tailwind CSS v3.4.17 Play CDN -->
  <script src="https://cdn.tailwindcss.com/3.4.17"></script>
  <!-- Font Awesome 7.0.1 -->
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.1/css/all.min.css" rel="stylesheet">
  <!-- Google Fonts（8 风格常用字体合集） -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Playfair+Display:wght@400;700&family=DM+Serif+Display&family=Noto+Sans+SC&family=Noto+Serif+SC&family=JetBrains+Mono&family=Crimson+Text:wght@400;700&family=Space+Grotesk:wght@400;700&display=swap" rel="stylesheet">
  <!-- ECharts 6.1.0: 需要复杂图表时预先生成 PNG 后放入 assets/，HTML 中用 <img> 引用 -->
  <!-- <script src="https://cdn.jsdelivr.net/npm/echarts@6.1.0/dist/echarts.min.js"></script> -->
  <style>
    body {
      margin: 0;
      padding: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    .slide-page {
      width: 1440px;
      height: 810px;
      overflow: hidden;
      position: relative;
    }
    /* 
      以下由 Step 2 视觉规划决定：
      - body background-color
      - .slide-page background-color
      - 自定义字体 class（如 .font-serif, .font-sans 映射到具体字体族）
      - 其他页面自定义样式
    */
  </style>
</head>
<body>
  <div class="slide-page">
    <!-- 页面内容 -->
  </div>
</body>
</html>
```

## 布局约束

这些不是风格偏好，是硬性约束。`.slide-page` 是一个 1440×810 的固定画布，强制设置：`width: 1440px; height: 810px; overflow: hidden; position: relative;`。超出范围的内容会被直接裁掉，没有滚动条，没有自适应，溢出就是丢失。

- `<body>` 内有且只有一个 `<div class="slide-page">` 作为主容器
- body 使用 Flexbox 居中 `.slide-page`（骨架已内置），不要修改 body 的布局方式
- 背景色/背景图必须设置在 `.slide-page` 上
- `.slide-page` 内部使用 Flexbox/Grid 流式布局，确保稳健
- 不使用 CSS 动画（@keyframes/animation/transition），页面元素保持静止。HTML 最终要转为静态 PPTX，动画在转换后会丢失


- 所有内容必须完整显示在 1440×810 范围内。保险做法：给 `.slide-page` 内部留出 padding（如 `p-12` 或 `p-14`），不要把内容顶到画布边缘
- 需要图片时，统一放入 `slides/assets/` 目录，用相对路径引用（如 `<img src="assets/photo.jpg">`）。html2pptx.js 转换时会自动复制
- **空间不足时的降级策略**：先减间距 → 再缩字号 → 最后精简内容。
- **严格禁止**使用 `mt-auto`/`mb-auto` 控制元素位置（易导致溢出，或破坏 flex 容器的对齐逻辑，导致布局异常）
