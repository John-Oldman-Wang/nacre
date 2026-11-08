#!/usr/bin/env bash
# 核对 docs/ 和 README.md 里的相对链接：文件在不在、锚点命不命中。
# 用法：bash docs/check-links.sh
set -euo pipefail
cd "$(dirname "$0")/.."
python3 - <<'PY'
import re, pathlib, sys, unicodedata

def anchors(path):
    out = set()
    for line in pathlib.Path(path).read_text().split('\n'):
        m = re.match(r'^#{1,6} (.+?)\s*$', line)
        if not m: continue
        t = re.sub(r'`|\*\*|\*|\[|\]|\(.*?\)', '', m.group(1))
        a = re.sub(r'[^\w一-鿿\s-]', '', t).strip().lower().replace(' ', '-')
        out.add(a)
    return out

files = [p for p in pathlib.Path('.').rglob('*.md')
         if not str(p).startswith(('node_modules', 'ios/build', 'ios/Vendor'))]
bad = []
for f in files:
    text = f.read_text()
    for m in re.finditer(r'\[[^\]]*\]\(([^)\s]+)\)', text):
        href = m.group(1)
        if href.startswith(('http://', 'https://', 'mailto:')): continue
        path, _, frag = href.partition('#')
        target = (f.parent / path).resolve() if path else f.resolve()
        if not target.exists():
            bad.append(f'{f}: 文件不存在 → {href}')
            continue
        if frag and frag not in anchors(target):
            bad.append(f'{f}: 锚点没命中 → {href}')
if bad:
    print(f'链接核对：{len(bad)} 处有问题\n')
    for b in bad: print('  ✗', b)
    sys.exit(1)
print(f'链接核对：{len(files)} 份文档，全部命中')
PY
