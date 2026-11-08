#!/usr/bin/env bash
# 核对同一套 API 在三个地方是否一致：
#
#   NacreRuntime.mm  分发表        ← 真相，决定运行时实际能做什么
#   nacre.js         取值器和方法  ← 桥，JS 能碰到的东西
#   types/*.d.ts     类型声明      ← 契约，开发者看到的东西
#
# 手写绑定的时期，这三份只能分别维护，所以必须有东西盯着它们别漂。
# 等 bindgen 从 SDK 头文件生成，三份都变成产物，这个脚本就可以退休了。
#
# 用法：bash ios/scripts/check-api.sh
# 退出码非 0 表示发现了不一致。
set -euo pipefail
cd "$(dirname "$0")/../.."

python3 - "$@" <<'PY'
import re, sys

js  = open('ios/Runtime/Builtin/nacre.js').read()
mm  = open('ios/Runtime/NacreRuntime.mm').read()
dts = open('types/ios.d.ts').read() + '\n' + open('types/nacre.d.ts').read()

problems = []
def complain(section, msg):
    problems.append(f'{section}: {msg}')

# ---------------------------------------------------------------- 工具
def braced_body(text, start):
    """从 start（紧跟在 { 之后）开始，返回配平的大括号内容。"""
    depth, i = 1, start
    while depth and i < len(text):
        if text[i] == '{': depth += 1
        elif text[i] == '}': depth -= 1
        i += 1
    return text[start:i-1]

def js_classes():
    """nacre.js 里每个原生类的成员。"""
    out = {}
    for m in re.finditer(r"defineNativeClass\('(\w+)',\s*class\s+\w+(?:\s+extends\s+(\w+))?\s*\{", js):
        name, base = m.group(1), m.group(2)
        b = braced_body(js, m.end())
        gets = set(re.findall(r'^\s{4}get (\w+)\(', b, re.M))
        sets = set(re.findall(r'^\s{4}set (\w+)\(', b, re.M))
        meths = {n for s, n, a in re.findall(r'^\s{4}(static )?(\w+)\(([^)]*)\)\s*\{', b, re.M)
                 if n != 'constructor'} - gets - sets
        statics = set(re.findall(r'^\s{4}static (\w+)\(', b, re.M))
        out[name] = dict(base=base, read=gets, write=sets, methods=meths, statics=statics)
    # UIColor 的颜色常量是循环 Object.defineProperty 加的，不在 class 体里
    m = re.search(r"// UIColor\.h：基础色(.*?)\]\) \{", js, re.S)
    if m and 'UIColor' in out:
        out['UIColor']['statics'] |= set(re.findall(r"'(\w+)'", m.group(1)))
    return out

def dts_classes():
    """d.ts 里每个 declare class 的成员。"""
    out = {}
    for m in re.finditer(r'declare class (\w+)(?:\s+extends\s+(\w+))?\s*\{', dts):
        name, base = m.group(1), m.group(2)
        b = braced_body(dts, m.end())
        # 去掉注释，免得注释里的词被当成成员
        b = re.sub(r'/\*.*?\*/', '', b, flags=re.S)
        b = re.sub(r'//[^\n]*', '', b)
        props = set(re.findall(r'^\s{2}(?:readonly )?(\w+)\s*[?:]', b, re.M))
        ro    = set(re.findall(r'^\s{2}readonly (\w+)\s*[?:]', b, re.M))
        # 「写入宽、读出窄」的属性写成 get/set 对，读写性看有没有 set
        getters = set(re.findall(r'^\s{2}get (\w+)\(', b, re.M))
        setters = set(re.findall(r'^\s{2}set (\w+)\(', b, re.M))
        props |= getters | setters
        ro    |= getters - setters
        statics_prop = set(re.findall(r'^\s{2}static readonly (\w+)\s*:', b, re.M))
        statics_meth = set(re.findall(r'^\s{2}static (\w+)\(', b, re.M))
        meths = (set(re.findall(r'^\s{2}(\w+)\(', b, re.M))
                 - statics_meth - getters - setters - {'constructor'})
        out[name] = dict(base=base, props=props, readonly=ro,
                         methods=meths, statics=statics_prop | statics_meth)
    return out

# ---------------------------------------------------------- 1. 类是否齐
J, D = js_classes(), dts_classes()
# nacre.js 里用 class 定义、注入全局的非原生类也要有声明
plain = set(re.findall(r"define\(globalThis,\s*'(\w+)'", js))
js_all = set(J) | {p for p in plain if p[0].isupper()}
missing = js_all - set(D)
extra = set(D) - js_all - {'Intl'}
if missing: complain('类', f'd.ts 里缺这些类：{sorted(missing)}')
if extra:   complain('类', f'd.ts 里多出这些类（nacre.js 没有）：{sorted(extra)}')

# 沿 d.ts 的继承链收集祖先的成员。子类为了收窄类型重新声明一个父类已有的
# 方法（比如 addEventListener 的重载）是合法的，不该报成「多出来」。
def inherited(name, key):
    seen, out = set(), set()
    base = D.get(name, {}).get('base')
    while base and base in D and base not in seen:
        seen.add(base)
        out |= D[base][key]
        base = D[base].get('base')
    return out

# ---------------------------------------------- 2. 每个类的成员是否对得上
for name in sorted(set(J) & set(D)):
    j, d = J[name], D[name]
    if j['base'] and d['base'] and j['base'] != d['base']:
        complain(name, f"继承不一致：nacre.js 是 {j['base']}，d.ts 是 {d['base']}")

    js_members = j['read'] | j['write']
    only_js  = js_members - d['props']
    only_dts = d['props'] - js_members - d['statics'] - inherited(name, 'props')
    if only_js:  complain(name, f'd.ts 缺这些属性：{sorted(only_js)}')
    if only_dts: complain(name, f'd.ts 多这些属性：{sorted(only_dts)}')

    # 只读 / 读写要一致：d.ts 标了 readonly，nacre.js 就不该有 setter
    for p in sorted(js_members & d['props']):
        js_ro, dts_ro = p not in j['write'], p in d['readonly']
        if js_ro != dts_ro:
            complain(name, f'{p} 的可写性不一致：'
                           f"nacre.js {'只读' if js_ro else '读写'}，"
                           f"d.ts {'只读' if dts_ro else '读写'}")

    only_js_m  = j['methods'] - j['statics'] - d['methods']
    only_dts_m = (d['methods'] - (j['methods'] | j['read'] | j['write'])
                  - inherited(name, 'methods'))
    if only_js_m:  complain(name, f'd.ts 缺这些方法：{sorted(only_js_m)}')
    if only_dts_m: complain(name, f'd.ts 多这些方法：{sorted(only_dts_m)}')

    only_js_s  = j['statics'] - d['statics']
    only_dts_s = d['statics'] - j['statics']
    if only_js_s:  complain(name, f'd.ts 缺这些静态成员：{sorted(only_js_s)}')
    if only_dts_s: complain(name, f'd.ts 多这些静态成员：{sorted(only_dts_s)}')

# ------------------------------------------------- 3. UIColor 的颜色常量
m = re.search(r"// UIColor\.h：基础色(.*?)\]\) \{", js, re.S)
js_colors = set(re.findall(r"'(\w+)'", m.group(1))) if m else set()
dts_colors = D.get('UIColor', {}).get('statics', set())
if js_colors - dts_colors: complain('UIColor', f'd.ts 缺这些颜色：{sorted(js_colors - dts_colors)}')
if dts_colors - js_colors: complain('UIColor', f'd.ts 多这些颜色：{sorted(dts_colors - js_colors)}')

# ---------------------------------- 4. 枚举的可选值：d.ts 对 NacreRuntime.mm
def mm_enum(macro):
    m = re.search(r'NACRE_ENUM_MAP\(%s,[^,]+,(.*?)\)\n\n' % macro, mm, re.S)
    return set(re.findall(r'@"(\w+)":', m.group(1))) if m else set()

def dts_union(name):
    m = re.search(r'type %s =\s*(.*?);' % name, dts, re.S)
    return set(re.findall(r"'([\w]+)'", m.group(1))) if m else set()

for macro, tsname in [('TextAlignment', 'NSTextAlignment'),
                      ('LineBreakMode', 'NSLineBreakMode'),
                      ('ContentMode', 'UIViewContentMode'),
                      ('BaselineAdjustment', 'UIBaselineAdjustment'),
                      ('ImageOrientation', 'UIImageOrientation'),
                      ('ImageRenderingMode', 'UIImageRenderingMode'),
                      ('ImageResizingMode', 'UIImageResizingMode')]:
    a, b = mm_enum(macro), dts_union(tsname)
    if not a: complain('枚举', f'没能从 NacreRuntime.mm 解析出 {macro}，脚本要更新')
    elif a != b:
        if a - b: complain(tsname, f'd.ts 缺这些值：{sorted(a - b)}')
        if b - a: complain(tsname, f'd.ts 多这些值：{sorted(b - a)}')

# 字重和文本样式不走宏，单独对
m = re.search(r'FontWeightTable\(void\).*?@\{(.*?)\};', mm, re.S)
a = set(re.findall(r'@"(\w+)":', m.group(1))) if m else set()
b = dts_union('UIFontWeight')
if a != b: complain('UIFontWeight', f'缺 {sorted(a-b)} 多 {sorted(b-a)}')

m = re.search(r'TextStylePairs\(void\).*?pairs = @\[(.*?)\];', mm, re.S)
a = set(re.findall(r'@\[\s*@"(\w+)"', m.group(1))) if m else set()
b = dts_union('UIFontTextStyle')
if a != b: complain('UIFontTextStyle', f'缺 {sorted(a-b)} 多 {sorted(b-a)}')

# ------------------------------- 5. nacre.js 的属性读写对 NacreRuntime.mm
# 对象属性有两条路：所有权边走 nativeGetOwned / nativeSetOwned（会在 JS 侧
# 记一笔持有关系），回边走 nativeGetObject / nativeSetObject。两边都要算。
def js_calls(fn):
    return set(re.findall(r"\b%s\(this, '(\w+)'" % fn, js))

def mm_block(start_sig):
    i = mm.index(start_sig)
    return mm[i:mm.index('\n}\n', i)]

pairs = [
    ('标量读', js_calls('nativeGet'),
     set(re.findall(r'isEqualToString:@"(\w+)"', mm_block('std::string ReadNativeProperty')))),
    ('标量写', js_calls('nativeSet'),
     set(re.findall(r'isEqualToString:@"(\w+)"', mm_block('void WriteNativeProperty')))),
    ('对象读', js_calls('nativeGetObject') | js_calls('nativeGetOwned'),
     set(re.findall(r'name == "(\w+)"', mm_block('nacre::NativeObjectRef ReadNativeObjectProperty')))),
    ('对象写', js_calls('nativeSetObject') | js_calls('nativeSetOwned'),
     set(re.findall(r'name == "(\w+)"', mm_block('void WriteNativeObjectProperty')))),
]
for label, a, b in pairs:
    if a - b: complain(label, f'nacre.js 有但 NacreRuntime.mm 没有：{sorted(a - b)}')
    if b - a: complain(label, f'NacreRuntime.mm 有但 nacre.js 没有：{sorted(b - a)}')

# ------------------------------------------------------------------ 报告
if problems:
    print('API 三边核对：发现 %d 处不一致\n' % len(problems))
    for p in problems:
        print('  ✗', p)
    sys.exit(1)

print('API 三边核对：一致')
print(f'  类 {len(J)} 个，颜色常量 {len(js_colors)} 个，'
      f'标量读写 {len(pairs[0][1])}/{len(pairs[1][1])}，'
      f'对象读写 {len(pairs[2][1])}/{len(pairs[3][1])}')
PY
