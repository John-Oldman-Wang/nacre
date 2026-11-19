#!/usr/bin/env python3
"""核对英文版和中文版是否对齐。

用法：python3 docs/check-translation.py docs [中文文件…]
  不给文件：核对 docs/api、docs/guides 下的全部中文页面。
  给了文件（相对 docs/ 的路径，比如 api/ui-button.md）：只核对这些。

每个中文页面 docs/X.md 对应英文页面 docs/en/X.md。检查：
  1. 英文页面存在
  2. 标题（# 到 ####）的个数、级别、顺序一致
  3. 代码块个数一致
  4. frontmatter 一字不差
  5. 正文（代码块和行内代码以外）没有中文字符
有问题的逐条打印，全部通过时打印 ok。
"""
import pathlib, re, sys

CJK = re.compile(r'[㐀-鿿　-〿＀-￯]')

def parts(text):
    fm = re.match(r'^---\n.*?\n---\n', text, re.S)
    front = fm.group(0) if fm else ''
    body = text[len(front):]
    blocks = re.findall(r'^```.*?^```', body, re.S | re.M)
    prose = re.sub(r'^```.*?^```', '', body, flags=re.S | re.M)
    heads = [len(m.group(1)) for m in re.finditer(r'^(#{1,4}) ', prose, re.M)]
    prose_no_code = re.sub(r'`[^`\n]*`', '', prose)
    # 链接地址里的中文锚点不算（汇总时统一换）
    prose_no_code = re.sub(r'\]\([^)]*\)', ']()', prose_no_code)
    return front, heads, len(blocks), prose_no_code

def main():
    docs = pathlib.Path(sys.argv[1]).resolve()
    if len(sys.argv) > 2:
        files = [docs / f for f in sys.argv[2:]]
    else:
        files = sorted(list((docs / 'api').rglob('*.md')) + list((docs / 'guides').rglob('*.md')))
    bad = 0
    for zh in files:
        rel = zh.relative_to(docs)
        en = docs / 'en' / rel
        if not en.exists():
            print(f'缺英文版：{rel}'); bad += 1; continue
        zf, zh_heads, zb, _ = parts(zh.read_text())
        ef, en_heads, eb, prose = parts(en.read_text())
        if zf != ef:
            print(f'frontmatter 不一致：{rel}'); bad += 1
        if zh_heads != en_heads:
            print(f'标题结构不一致：{rel}（中文 {len(zh_heads)} 个，英文 {len(en_heads)} 个）'); bad += 1
        if zb != eb:
            print(f'代码块个数不一致：{rel}（中文 {zb}，英文 {eb}）'); bad += 1
        for i, line in enumerate(prose.split('\n'), 1):
            if CJK.search(line):
                print(f'正文里还有中文：en/{rel}：{line.strip()[:60]}'); bad += 1
                break
    print('ok' if bad == 0 else f'{bad} 处问题')
    sys.exit(1 if bad else 0)

main()
