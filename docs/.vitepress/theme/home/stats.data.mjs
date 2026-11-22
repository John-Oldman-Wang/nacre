// 首页数字条的数，构建时从仓库里数出来，不手写。
// 英文版和中文一页对一页（check-translation.py 核对），所以数中文那份就够了。
import fs from 'node:fs';
import path from 'node:path';

function walk(dir, depth, out) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, depth + 1, out);
    else if (e.name.endsWith('.md') && depth > 0) out.push(p);
  }
  return out;
}

// 类页的 frontmatter 里写着 native: <ObjC 类名>。Web 标准那批（URL、Blob、fetch……）
// 和讲概念的页没有这一行，不算原生类
function isNativeClassPage(file) {
  const head = /^---\n([\s\S]*?)\n---/.exec(fs.readFileSync(file, 'utf8'));
  return head !== null && /^native:/m.test(head[1]);
}

// 能力包：packages/ 下清单里有 capability 的包，示例模块（private）不算
function capabilityPackages(packages) {
  return fs.readdirSync(packages, { withFileTypes: true }).filter((e) => {
    if (!e.isDirectory()) return false;
    const manifest = path.join(packages, e.name, 'nacre-ios.json');
    const pkg = path.join(packages, e.name, 'package.json');
    if (!fs.existsSync(manifest) || !fs.existsSync(pkg)) return false;
    return 'capability' in JSON.parse(fs.readFileSync(manifest, 'utf8')) &&
      JSON.parse(fs.readFileSync(pkg, 'utf8')).private !== true;
  }).length;
}

export default {
  // 只盯文档目录里的：能力包的个数改了要重启开发服务器才会更新（构建时照常数）
  watch: ['api/*.md', 'api/**/*.md', 'guides/*.md'],
  load() {
    const src = globalThis.VITEPRESS_CONFIG?.srcDir ?? process.cwd();
    const api = path.join(src, 'api');
    const classes = fs.readdirSync(api).filter((f) => f.endsWith('.md'))
      .filter((f) => isNativeClassPage(path.join(api, f))).length;
    const members = walk(api, 0, []).length;
    const guides = fs.readdirSync(path.join(src, 'guides')).filter((f) => f.endsWith('.md') && f !== 'README.md').length;
    const capabilities = capabilityPackages(path.join(src, '..', 'packages'));
    return { classes, members, guides, capabilities };
  },
};
