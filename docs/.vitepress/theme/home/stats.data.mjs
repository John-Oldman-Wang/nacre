// 首页数字条的数，构建时从中文原文的目录数出来，不手写。
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

export default {
  watch: ['api/**/*.md', 'guides/*.md'],
  load() {
    const src = globalThis.VITEPRESS_CONFIG?.srcDir ?? process.cwd();
    const api = path.join(src, 'api');
    // 有成员页的类：api/ 下的每个子目录是一个类的成员页
    const classes = fs.readdirSync(api, { withFileTypes: true }).filter((e) => e.isDirectory()).length;
    const members = walk(api, 0, []).length;
    const guides = fs.readdirSync(path.join(src, 'guides')).filter((f) => f.endsWith('.md') && f !== 'README.md').length;
    return { classes, members, guides, languages: 2 };
  },
};
