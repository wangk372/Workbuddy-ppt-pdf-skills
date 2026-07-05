/**
 * html2pdf.js — HTML 转 PDF 转换引擎
 *
 * 工作流程：
 *   1. 读取 HTML 文件
 *   2. Playwright Chromium 无头渲染
 *   3. page.pdf() 直接输出 A4 PDF
 *
 * 用法：node scripts/html2pdf.js <input.html> [output.pdf]
 *   默认输出：output.pdf
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

function normalizePath(p) {
  // Git Bash 路径兼容：/c/Users/... → C:\Users\...
  if (process.platform === 'win32' && /^\/[a-zA-Z]\//.test(p)) {
    p = p[1].toUpperCase() + ':' + p.slice(2);
  }
  return path.resolve(p);
}

async function htmlToPdf(inputPath, outputPath) {
  const resolvedInput = normalizePath(inputPath);
  const resolvedOutput = normalizePath(outputPath || 'output.pdf');

  if (!fs.existsSync(resolvedInput)) {
    console.error(`错误：找不到输入文件 "${resolvedInput}"`);
    process.exit(1);
  }

  console.log(`输入：${resolvedInput}`);
  console.log(`输出：${resolvedOutput}`);
  console.log('启动浏览器...');

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 加载 HTML 文件
    const fileUrl = `file://${resolvedInput.replace(/\\/g, '/')}`;
    await page.goto(fileUrl, { waitUntil: 'networkidle' });

    // 等待 ECharts 图表渲染完成（如有）
    await page.waitForTimeout(1500);

    // 检查是否有未渲染的 ECharts 实例，再等一会
    const hasECharts = await page.evaluate(() => {
      return typeof window.echarts !== 'undefined';
    });
    if (hasECharts) {
      console.log('检测到 ECharts，等待图表渲染...');
      await page.waitForTimeout(1000);
    }

    // 生成 PDF
    console.log('生成 PDF...');
    await page.pdf({
      path: resolvedOutput,
      format: 'A4',
      printBackground: true,       // 保留背景色/背景图
      preferCSSPageSize: true,     // 使用 CSS @page 中定义的尺寸
      margin: {                    // 仅当 @page 未定义 margin 时生效
        top: '0',
        right: '0',
        bottom: '0',
        left: '0',
      },
    });

    console.log(`完成：${resolvedOutput}`);

    // 输出文件大小
    const stats = fs.statSync(resolvedOutput);
    const sizeKB = (stats.size / 1024).toFixed(1);
    console.log(`文件大小：${sizeKB} KB`);
  } catch (err) {
    console.error('转换失败：', err.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

// CLI 入口
const args = process.argv.slice(2);
if (args.length < 1) {
  console.log('用法：node scripts/html2pdf.js <input.html> [output.pdf]');
  console.log('  默认输出：output.pdf');
  process.exit(1);
}

htmlToPdf(args[0], args[1]);
