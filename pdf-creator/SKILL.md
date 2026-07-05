---
name: pdf-creator
description: 通过 HTML 生成 PDF 文档，支持多轮编辑。适用场景：从零创建报告、论文、手册、简历等 PDF 文档。不适用场景：修改他人发来的 PDF 文件、需要保持原始格式的 PDF 编辑。
---

# PDF 文档

通过 HTML 生成 PDF 文档。整个文档是一个完整的 HTML 文件，包含封面、目录、正文等所有页面，经 Playwright 渲染后直接输出为 PDF。

交付物：**output.pdf** — 渲染转换后的最终 PDF 文件

---

## 创建流程

```
用户意图
  → Step 1: 内容大纲（输出供用户确认）
  → Step 2: 文档设计规划
  → Step 3: 生成完整 HTML 文档
  → Step 4: 转换为 output.pdf
```

### Step 1：内容大纲

分析用户需求，规划文档的结构骨架。用户自己的逻辑优先，没有明确结构时再辅助构建。

如果用户连主题都不明确，先追问主题和用途再动手。用户提供了附件或资料时，先提取关键内容作为素材。

几个要点：
- 章节标题要有信息量——"背景介绍"是空洞的类别名，标题应传达该章节的核心观点
- 未指定页数时不硬性限制，按内容合理规划
- 文档结构：封面页 → 目录页 → 正文各章 → （可选）附录/封底
- 自检：只读每章标题，连起来应该是一条通顺的逻辑线

⛔ **确认门**：输出大纲后，必须停止当前回复，等待用户确认或调整。禁止在输出大纲的同一回复中执行 Step 2 或生成 HTML。
例外：用户在需求中明确说了"不用确认""直接做""不用给我看大纲"等类似表述时，可以跳过确认门，但仍需在回复中输出大纲（供用户事后查看），并继续执行 Step 2。

### Step 2：文档设计规划

根据文档的内容类型和受众，确定视觉设计语言。

从以下风格中选 1 个作为 Visual Anchor（也可根据内容提出其他风格）：Swiss/International、Editorial/Magazine、Classic/Bookish、Bauhaus/Constructivist、Dark/Luxe、Zen/Minimal、Blueprint/Tech

读取 `references/design-guide.md` 了解设计理念和约束，然后**必须按以下模板输出设计规格**（禁止在未输出设计规格的情况下生成 HTML）：

```
Visual Anchor: [风格名称]
Design Rationale: [一句话，为什么选这个风格]

配色（60-30-10 法则，Tailwind 类名，不用 HEX）:
  60% 背景/大面积: bg-[xxx]
  30% 正文/段落: text-[xxx]
  10% 强调/标题: text-[xxx] / bg-[xxx]

字体:
  字体族: [具体字体名]
  标题: [text-size font-weight 等 Tailwind 类名]
  正文: [text-size text-color leading 等 Tailwind 类名]
  代码/数据: [monospace 字体配置，如适用]
```

输出设计规格后无需等待用户确认，直接进入 Step 3。

### Step 3：生成 HTML 文档

读取 `references/html-skeleton.md` 获取 HTML 技术骨架。整个文档生成为一个 HTML 文件（`document.html`）。

读取 `references/design-guide.md` 了解设计原则。

生成后自查：
- HTML 标签正确闭合
- 只输出代码，禁止输出代码解释、设计说明等额外内容
- ⛔ 所有数据和事实必须可追溯至前序步骤搜集的资料，禁止编造资料中不存在的数字、日期、比例等。资料不足时留空或标注"待补充"

### Step 4：转换 PDF

将 `document.html` 转换为 `output.pdf`：

```bash
node scripts/html2pdf.js document.html output.pdf
```

命令会返回生成的 pdf 文件路径。

---

## 编辑流程

用户首次创建后可能进行多轮修改。

**核心原则**：只改用户要求的部分，其余保持原样。新增或修改的内容必须与整套文档的设计规范一致——修改前先读取 `document.html` 完整源码，提取当前设计规范（配色、字体、间距等）。

### 新增章节

在 `document.html` 中插入新的章节 HTML，置于适当位置，添加对应目录项并更新所有内部锚点链接。

### 删除章节

删除对应 HTML 段落后，移除目录中的对应条目，检查并更新剩余锚点链接。

### 全局风格调整

用户要求修改整套文档的视觉风格（换配色、换字体等）。先明确新的设计规范并输出供用户确认，确认后修改 `document.html`。优先用 Tailwind class 替换，减少遗漏。

### 编辑后同步

每次编辑完成后，重新执行转换命令（同 Step 4），然后向用户确认修改内容。

---

## 参考文件

这些文件包含执行各步骤时需要的详细规范，按需读取：

- `references/html-skeleton.md` — HTML 技术骨架、@page/CSS 打印约束（Step 3 时读取）
- `references/design-guide.md` — 设计理念、配色排版规范、素材策略（Step 2/3 时读取）
- `scripts/html2pdf.js` — HTML 转 PDF 引擎（Step 4 转换）
