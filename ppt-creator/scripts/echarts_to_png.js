/**
 * echarts_to_png.js — 用 Playwright 渲染 ECharts 图表并输出 PNG
 *
 * 用法: node echarts_to_png.js <output.png> <JSON>
 *
 * JSON 格式: {"option":{...chartOption}, "width":1000, "height":500}
 *
 * 示例:
 *   node scripts/echarts_to_png.js slides/assets/pie_chart.png \
 *     '{"option":{"series":[{"type":"pie","data":[{"value":60,"name":"A"},{"value":40,"name":"B"}]}]},"width":600,"height":500}'
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function render({ width = 1000, height = 500, option: chartOption, outputPath }) {
  if (!chartOption) throw new Error('chart option is required');
  if (!outputPath) throw new Error('outputPath is required');

  const outputDir = path.dirname(outputPath);
  fs.mkdirSync(outputDir, { recursive: true });

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<script src="https://cdn.jsdelivr.net/npm/echarts@6.1.0/dist/echarts.min.js"></script>
<style>
body { margin:0; padding:0; display:flex; align-items:center; justify-content:center; width:${width}px; height:${height}px; background:#fff; }
#chart { width:${width}px; height:${height}px; }
</style>
</head>
<body><div id="chart"></div>
<script>
var c = echarts.init(document.getElementById('chart'));
c.setOption(${JSON.stringify(chartOption)});
</script>
</body></html>`;

  const tmpPath = path.join(outputDir, '.tmp_chart.html');
  fs.writeFileSync(tmpPath, html);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: width + 40, height: height + 40 });
  await page.goto('file://' + tmpPath.replace(/\\/g, '/'), { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  const chartEl = await page.$('#chart');
  if (!chartEl) throw new Error('Chart element not found in rendered page');

  await chartEl.screenshot({ path: outputPath, omitBackground: false });
  await browser.close();
  fs.unlinkSync(tmpPath);

  console.log(`Chart saved: ${outputPath} (${width}x${height})`);
}

// === CLI ===
const [outputPath, jsonArg] = process.argv.slice(2);

if (!outputPath || !jsonArg) {
  console.error('Usage: node echarts_to_png.js <output.png> \'{"option":{...},"width":1000,"height":500}\'');
  process.exit(1);
}

let config;
try {
  config = JSON.parse(jsonArg);
} catch (e) {
  console.error('Invalid JSON. Ensure the argument is properly quoted.');
  process.exit(1);
}

const { option, width = 1000, height = 500 } = config;

render({ option, width, height, outputPath: path.resolve(outputPath) })
  .then(() => process.exit(0))
  .catch(e => { console.error(e.message); process.exit(1); });
