#!/usr/bin/env bash
# 核对同一套 API 在三个地方是否一致：
#
#   Runtime/**/*.mm  分发表        ← 真相，决定运行时实际能做什么
#   nacre.js         取值器和方法  ← 桥，JS 能碰到的东西
#   packages/types/  类型声明      ← 契约，开发者看到的东西
#
# 手写绑定的时期，这三份只能分别维护，所以必须有东西盯着它们别漂。
# 等 bindgen 从 SDK 头文件生成，三份都变成产物，这个脚本就可以退休了。
#
# 用法：bash ios/scripts/check-api.sh
# 退出码非 0 表示发现了不一致。
set -euo pipefail
cd "$(dirname "$0")/../.."

python3 - "$@" <<'PY'
import re, sys, glob

js  = open('ios/Runtime/Builtin/nacre.js').read()
# 能力暴露拆在 Bridge/ 下的几个 .mm 里，拼起来当一份读
mm  = '\n'.join(open(f).read()
                for f in sorted(glob.glob('ios/Runtime/**/*.mm', recursive=True)))
dts = '\n'.join(open(f).read()
                for f in sorted(glob.glob('packages/types/**/*.d.ts', recursive=True)))

problems = []
def complain(section, msg):
    problems.append(f'{section}: {msg}')

# 每个「从源码里抽一组名字」的地方，都要能说出「是我自己失效了」，而不是
# 安静地返回一个空集合。拆 NacreProperties.mm 时被这个形态咬过一次：
# mm_block 定位不到签名，给了空集，于是报出一屏看着像真 diff 的假阳性。
def extract(what, outer, text, inner, limit=None):
    m = re.search(outer, text, re.S)
    if m is None:
        complain('脚本', f'{what} 定位不到，check-api.sh 要更新')
        return None
    names = set(re.findall(inner, m.group(1)))
    # 抽太多和抽成空一样，都是提取点失效。被这个形态咬过一次：颜色常量表
    # 的收尾锚点从 `]) {` 改成了 `];`，非贪婪匹配一路跑到文件下面另一个
    # `]) {`，把整个文件吞了进去，于是报出一屏看着像真 diff 的东西
    if limit is not None and len(names) > limit:
        complain('脚本',
                 f'{what} 抽出来有 {len(names)} 个，远超预期的 {limit}，'
                 f'多半是收尾锚点失效了，check-api.sh 要更新')
        return None
    if not names:
        complain('脚本', f'{what} 抽出来是空的，check-api.sh 要更新')
        return None
    return names

def compare(label, a, b, side='d.ts'):
    """a 或 b 是 None 说明提取点已经报过自己失效了，不再叠一条假的 diff。"""
    if a is None or b is None:
        return
    if a - b: complain(label, f'{side} 缺这些值：{sorted(a - b)}')
    if b - a: complain(label, f'{side} 多这些值：{sorted(b - a)}')

# ---------------------------------------------------------------- 工具
def braced_body(text, start):
    """从 start（紧跟在 { 之后）开始，返回配平的大括号内容。"""
    depth, i = 1, start
    while depth and i < len(text):
        if text[i] == '{': depth += 1
        elif text[i] == '}': depth -= 1
        i += 1
    return text[start:i-1]

# UIColor 的颜色常量是循环 Object.defineProperty 加的，不在 class 体里。
# 两处要用（类成员核对、第 3 节），抽一次
JS_COLORS = extract('nacre.js 的 UIColor 颜色常量表',
                    r"const COLOR_CONSTANTS = \[(.*?)\n  \];", js, r"'(\w+)'",
                    limit=100)

def js_classes():
    """nacre.js 里每个原生类的成员。"""
    out = {}
    for m in re.finditer(r"defineNativeClass\('(\w+)',\s*class\s+\w+(?:\s+extends\s+(\w+))?\s*\{", js):
        name, base = m.group(1), m.group(2)
        b = braced_body(js, m.end())
        gets = set(re.findall(r'^\s{4}get (\w+)\(', b, re.M))
        sets = set(re.findall(r'^\s{4}set (\w+)\(', b, re.M))
        # 方法前面可以有 async（Session.clearStorageData 是第一个这么写的）
        meths = {n for s, n, a in re.findall(r'^\s{4}(static )?(?:async )?(\w+)\(([^)]*)\)\s*\{', b, re.M)
                 if n != 'constructor'} - gets - sets
        # static get X() 也算静态成员。原来只认 static X(，所以 ObjC 的
        # @property(class, readonly) 这类在 JS 侧写成静态取值器时看不见
        statics = (set(re.findall(r'^\s{4}static (\w+)\(', b, re.M)) |
                   set(re.findall(r'^\s{4}static get (\w+)\(', b, re.M)))
        out[name] = dict(base=base, read=gets, write=sets, methods=meths, statics=statics)
    if JS_COLORS and 'UIColor' in out:
        out['UIColor']['statics'] |= JS_COLORS
    if not out:
        complain('脚本', 'nacre.js 里一个 defineNativeClass 都没解析出来，'
                         'check-api.sh 要更新')
    return out

def dts_classes():
    """d.ts 里每个 declare class 的成员。"""
    out = {}
    # 类名后面可能跟泛型参数（NSLayoutAnchor<T>），基类也可能带实参
    for m in re.finditer(
            r'declare class (\w+)(?:<[^{]*?>)?(?:\s+extends\s+(\w+)(?:<[^{]*?>)?)?\s*\{',
            dts):
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
    if not out:
        complain('脚本', 'd.ts 里一个 declare class 都没解析出来，check-api.sh 要更新')
    return out

# ---------------------------------------------------------- 1. 类是否齐
J, D = js_classes(), dts_classes()
# nacre.js 里用 class 定义、注入全局的非原生类也要有声明
plain = set(re.findall(r"define\(globalThis,\s*'(\w+)'", js))
js_all = set(J) | {p for p in plain if p[0].isupper()}
# 两个解析器任何一个空了，类的对比就没有意义——它们自己已经报过失效了
if J and D:
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

    # 颜色常量表提不出来时，UIColor 的静态成员对比没有意义——提取点已经
    # 报过自己失效了，这里再报 39 条就是噪音
    if not (name == 'UIColor' and JS_COLORS is None):
        only_js_s  = j['statics'] - d['statics']
        only_dts_s = d['statics'] - j['statics']
        if only_js_s:  complain(name, f'd.ts 缺这些静态成员：{sorted(only_js_s)}')
        if only_dts_s: complain(name, f'd.ts 多这些静态成员：{sorted(only_dts_s)}')

# ------------------------------------------------- 3. UIColor 的颜色常量
compare('UIColor', JS_COLORS, D.get('UIColor', {}).get('statics', set()))

# -------------------------------------- 4. 枚举的可选值：d.ts 对原生层
# 名字 ↔ 数值的映射只能在原生层（数值随 ABI 变），所以原生层是真相，
# d.ts 是跟着它走的那一份。
def mm_enum(macro):
    return extract(f'原生层的 NACRE_ENUM_MAP({macro})',
                   r'NACRE_ENUM_MAP\(%s,[^,]+,(.*?)\)\n\n' % macro, mm, r'@"(\w+)":')

def dts_union(name):
    # 名字里可以有连字符：网页的事件名照搬 Electron（did-finish-load）
    return extract(f'd.ts 的 {name}', r'type %s =\s*(.*?);' % name, dts, r"'([\w-]+)'")

for macro, tsname in [('TextAlignment', 'NSTextAlignment'),
                      ('LineBreakMode', 'NSLineBreakMode'),
                      ('ContentMode', 'UIViewContentMode'),
                      ('BaselineAdjustment', 'UIBaselineAdjustment'),
                      ('ImageOrientation', 'UIImageOrientation'),
                      ('ImageRenderingMode', 'UIImageRenderingMode'),
                      ('ImageResizingMode', 'UIImageResizingMode'),
                      ('LayoutRelation', 'NSLayoutRelation'),
                      ('LayoutAttribute', 'NSLayoutAttribute'),
                      ('LayoutConstraintAxis', 'UILayoutConstraintAxis'),
                      ('ControlEvent', 'UIControlEventType'),
                      ('ControlHorizontalAlignment', 'UIControlContentHorizontalAlignment'),
                      ('ControlVerticalAlignment', 'UIControlContentVerticalAlignment'),
                      ('ButtonType', 'UIButtonType'),
                      ('ButtonRole', 'UIButtonRole'),
                      ('StackDistribution', 'UIStackViewDistribution'),
                      ('ModalPresentationStyle', 'UIModalPresentationStyle'),
                      ('ModalTransitionStyle', 'UIModalTransitionStyle'),
                      ('TabBarMinimizeBehavior', 'UITabBarMinimizeBehavior'),
                      ('UserInterfaceStyle', 'UIUserInterfaceStyle'),
                      ('UserInterfaceSizeClass', 'UIUserInterfaceSizeClass'),
                      ('AccessibilityContrast', 'UIAccessibilityContrast'),
                      ('TraitLayoutDirection', 'UITraitEnvironmentLayoutDirection'),
                      ('BarButtonSystemItem', 'UIBarButtonSystemItem'),
                      ('IndicatorStyle', 'UIScrollViewIndicatorStyle'),
                      ('ContentInsetAdjustmentBehavior',
                       'UIScrollViewContentInsetAdjustmentBehavior'),
                      ('GestureState', 'UIGestureRecognizerState'),
                      ('UserInterfaceIdiom', 'UIUserInterfaceIdiom'),
                      ('ImpactFeedbackStyle', 'UIImpactFeedbackStyle'),
                      ('NotificationFeedbackType', 'UINotificationFeedbackType'),
                      ('WebNavigationType', 'WebNavigationType'),
                      ('KeychainAccessible', 'KeychainAccessible')]:
    compare(tsname, mm_enum(macro), dts_union(tsname))

# 位掩码走另一个宏：一个数值对一组名字
compare('CACornerMask',
        extract('原生层的 CornerMask 掩码表',
                r'NACRE_MASK_MAP\(CornerMask,[^,]+,(.*?)\)\n\n', mm, r'@"(\w+)":'),
        dts_union('CACornerMask'))

# 圆角矩形挑角。不收 allCorners（值是 ~0，不是四个位或起来），所以
# 原生表和 d.ts 的联合都只有四个
compare('UIRectCorner',
        extract('原生层的 RectCorner 掩码表',
                r'NACRE_MASK_MAP\(RectCorner,[^,]+,(.*?)\)\n\n', mm, r'@"(\w+)":'),
        dts_union('UIRectCorner'))

# UIControlState 的 normal 是 0，掩码表里没有它，d.ts 里有——对比时补上
state = extract('原生层的 ControlState 掩码表',
                r'NACRE_MASK_MAP\(ControlState,[^,]+,(.*?)\)\n\n', mm, r'@"(\w+)":')
compare('UIControlStateName', (state | {'normal'}) if state else None,
        dts_union('UIControlStateName'))

# 值是 NSString 常量的枚举，走 NACRE_STRING_ENUM_MAP。原来这七条各有各的
# 正则（按 XxxPairs(void) 那个形状找），抽宏之后并成一个表驱动的循环
for tsname, macro in [('CALayerCornerCurve', 'CornerCurve'),
                      ('CAGradientLayerType', 'GradientType'),
                      ('CAShapeLayerFillRule', 'FillRule'),
                      ('CAShapeLayerLineCap', 'LineCap'),
                      ('CAShapeLayerLineJoin', 'LineJoin'),
                      ('CAMediaTimingFillMode', 'FillMode'),
                      ('CAMediaTimingFunctionName', 'TimingFunctionName'),
                      ('CAAnimationCalculationMode', 'CalculationMode'),
                      ('CAAnimationRotationMode', 'RotationMode')]:
    compare(tsname,
            extract(f'原生层的 {macro} 字符串枚举表',
                    rf'NACRE_STRING_ENUM_MAP\({macro},(.*?)\)\n\n', mm,
                    r'@\[\s*@"(\w+)"'),
            dts_union(tsname))

# 这几张表不走宏。pairs 是**有序数组**（反查要有确定答案），table 是字典
# （只按名字查，不反查），所以内层正则不是同一个。
for tsname, outer, inner in [
    ('UIFontWeight', r'FontWeightTable\(void\).*?@\{(.*?)\};', r'@"(\w+)":'),
    ('UIFontTextStyle', r'TextStylePairs\(void\).*?pairs = @\[(.*?)\];',
     r'@\[\s*@"(\w+)"'),
    ('CAAnimationEventType',
     r'AnimationEventNamesList\(void\).*?names = @\[(.*?)\];', r'@"(\w+)"'),
    # 能动画的属性。原生是字典（只按名字查、不反查），所以内层正则和 pairs 不同
    ('CAAnimationKeyPath', r'AnimKeyPathTable\(void\).*?table = @\{(.*?)\};',
     r'@"(\w+)":'),
    ('UILayoutPriorityName', r'LayoutPriorityTable\(void\).*?@\{(.*?)\};',
     r'@"(\w+)":'),
    # leading==top、trailing==bottom，一个值两个名字，所以实现用有序 pairs。
    # 别名也是可写的，一起对
    ('UIStackViewAlignment', r'StackAlignmentPairs\(void\).*?pairs = @\[(.*?)\];',
     r'@\[\s*@"(\w+)"'),
    ('UIScrollViewDecelerationRate',
     r'DecelerationRatePairs\(void\).*?pairs = @\[(.*?)\];', r'@\[\s*@"(\w+)"'),
    # 滚动事件名：原生一张表，d.ts 一个联合，必须一字不差
    ('UIScrollViewEventType',
     r'ScrollEventNamesList\(void\).*?names = @\[(.*?)\];', r'@"(\w+)"'),
    ('UINavigationControllerEventType',
     r'NavEventNamesList\(void\).*?names = @\[(.*?)\];', r'@"(\w+)"'),
    # 文字大小的档位：原生是字符串常量，自己列的一张表
    ('UIContentSizeCategory',
     r'ContentSizeCategoryPairs\(void\).*?pairs = @\[(.*?)\];', r'@\[\s*@"(\w+)"'),
    ('UITabBarControllerEventType',
     r'TabEventNamesList\(void\).*?names = @\[(.*?)\];', r'@"(\w+)"'),
    ('UIBarButtonItemEventType',
     r'BarButtonEventNamesList\(void\).*?names = @\[(.*?)\];', r'@"(\w+)"'),
    ('UIPresentationEventType',
     r'PresentationEventNamesList\(void\).*?names = @\[(.*?)\];', r'@"(\w+)"'),
    # clearStorageData 能清的几类：原生是「名字 -> 系统的数据类型」的字典
    ('SessionStorageType', r'SessionStorageTable\(void\).*?table = @\{(.*?)\};',
     r'@"(\w+)":'),
    # 网页的事件名带连字符，内层正则和别的事件表不一样
    ('WebContentsEventType',
     r'WebContentsEventNamesList\(void\).*?names = @\[(.*?)\];', r'@"([\w-]+)"'),
    ('UIBarButtonItemStyle',
     r'BarButtonItemStylePairs\(void\).*?pairs = @\[(.*?)\];', r'@\[\s*@"(\w+)"'),
]:
    compare(tsname, extract(f'原生层的 {tsname} 表', outer, mm, inner), dts_union(tsname))

# ----------------------------------- 5. nacre.js 的属性读写对原生层
# 对象属性有两条路：所有权边走 nativeGetOwned / nativeSetOwned（会在 JS 侧
# 记一笔持有关系），回边走 nativeGetObject / nativeSetObject。两边都要算。
def js_calls(fn):
    names = set(re.findall(r"\b%s\(this, '(\w+)'" % fn, js))
    if not names:
        complain('脚本', f"nacre.js 里找不到 {fn}(this, …) 的调用，check-api.sh 要更新")
        return None
    return names

def js_union(*fns):
    """几个取值器的并集。任何一个提不出来就整个返回 None——并集非空会把
    单个取值器的失效藏起来，那正是这类保护要防的事。"""
    out = set()
    for fn in fns:
        names = js_calls(fn)
        if names is None:
            return None
        out |= names
    return out

def mm_bodies(sig_pattern):
    """按签名正则收集所有匹配函数的函数体，拼成一份来扫。

    属性分发按能力域拆成了 NacreProps*.mm 里的 Read<域>Property /
    Write<域>Property 等一组函数，所以这里不能只认一个签名。分发器自己
    （ReadNativeProperty 一类）也会被正则扫到，但它体内没有属性名，
    扫进来不影响结果。"""
    out = []
    for m in re.finditer(sig_pattern, mm, re.M):
        i = m.start()
        out.append(mm[i:mm.index('\n}\n', i)])
    if not out:
        complain('脚本', f'没有函数匹配 {sig_pattern}，拆分之后脚本要更新')
    return '\n'.join(out)

pairs = [
    ('标量读', js_union('nativeGet'),
     set(re.findall(r'isEqualToString:@"(\w+)"',
                    mm_bodies(r'^id Read\w+Property\(id object, NSString\* key\)')))),
    ('标量写', js_union('nativeSet'),
     set(re.findall(r'isEqualToString:@"(\w+)"',
                    mm_bodies(r'^BOOL Write\w+Property\(id object, NSString\* key')))),
    # 锚点在 mm 里单独一个函数（UIView 12 个、UILayoutGuide 10 个，名字重叠），
    # JS 侧走 anchorOf。两边都并进来，否则这 12 个名字谁都盯不到。
    ('对象读',
     js_union('nativeGetObject', 'nativeGetOwned', 'anchorOf'),
     set(re.findall(r'name == "(\w+)"',
                    mm_bodies(r'^nacre::NativeObjectRef Read\w+ObjectProperty\('))) |
     set(re.findall(r'name == "(\w+)"',
                    mm_bodies(r'^nacre::NativeObjectRef AnchorNamed')))),
    ('对象写', js_union('nativeSetObject', 'nativeSetOwned'),
     set(re.findall(r'name == "(\w+)"',
                    mm_bodies(r'^void Write\w+ObjectProperty\(')))),
]
for label, a, b in pairs:
    # 任何一侧是空的，都说明某个提取点失效了（它自己已经报过），
    # 这里再报一百多条按名字的 diff 只会把真正的那一行淹掉
    if not a or not b:
        continue
    # 这一节反过来：原生层是真相，缺的是 nacre.js
    if a - b: complain(label, f'nacre.js 有但原生层没有：{sorted(a - b)}')
    if b - a: complain(label, f'原生层有但 nacre.js 没有：{sorted(b - a)}')

# ------------------------------- 6. 把对象交给原生的方法，必须记一条所有权边
#
# UIButton 的 setImage:forState: 三兄弟漏过一次：按状态存的东西既不是父子边
# 也不是属性，从 ownOne 和 nativeSetOwned 两张网中间掉了下去，实测确认 GC
# 之后读回来是个全新的包装。那次是人工逐条过所有方法才找出来的，所以判据
# 固化在这里。
#
# 真相在原生层：一个 selector 的分支里用了取对象参数的助手，它就收对象。
#
# args.object( 是不经助手、直接取对象参数的写法。它曾经不在这张表里，于是
# addAnimation:forKey:、addToRunLoop:forMode:、appendPath: 这几个分支没人盯。
OBJ_ARG_HELPERS = re.compile(r'\b(?:objectArg|viewArg|optionalViewArg|guideArg|colorArg|imageArg|vcArg|layerArg|gestureArg|optionalControllerArg)\s*\(|\bargs\.object\s*\(')
# kSyncStack 是导航栈那条边的专用写法：它按原生真相整层 ownAll 一遍，
# 所以调它就等于记了边
OWN_MARKERS = re.compile(
    r'\b(?:own|ownOne|ownAll|disown|nativeSetOwned|nativeSetObjectArray)\s*\('
    r'|\[kSyncStack\]\(\)')

def branch_body(text, start):
    """从 selector 判断处往后找到那个 { ，按括号配对取出分支体。
    不按「到下一个分支为止」切，是因为分支之间还定义着 ...Arg 的 lambda，
    那些定义里就有 objectArg(，会把前一个分支误判成收对象。"""
    i = text.find('{', start)
    if i < 0: return None
    depth, j = 0, i
    while j < len(text):
        if text[j] == '{': depth += 1
        elif text[j] == '}':
            depth -= 1
            if depth == 0: return text[i:j]
        j += 1
    return None

obj_arg_sels = set()
_branches = 0
# 分支有两种写法：ObjC 字符串的 [sel isEqualToString:@"…"]，和返回对象数组
# 那条通道用的 name == "…"（std::string）。后一种只认带冒号的，属性名也是
# 这么比的，不带冒号。
for m in re.finditer(r'\[sel isEqualToString:@"([^"]+)"\]|\bname == "([^"]*:[^"]*)"', mm):
    _branches += 1
    body = branch_body(mm, m.end())
    if body is not None and OBJ_ARG_HELPERS.search(body):
        obj_arg_sels.add(m.group(1) or m.group(2))
if _branches == 0:
    complain('脚本', '分发表里的 selector 分支定位不到，check-api.sh 要更新')
    obj_arg_sels = None
elif not obj_arg_sels:
    complain('脚本', '收对象参数的 selector 抽出来是空的，check-api.sh 要更新')
    obj_arg_sels = None

# nacre.js 侧：按 4 空格缩进切出每个方法体（这个文件的缩进是一致的）
def js_methods(text):
    out, lines = [], text.split('\n')
    i = 0
    while i < len(lines):
        # 写在一行里的方法：appendPath(path) { nativeCall(…); }。原来只认
        # 「行尾是 { 」的多行写法，这种一行的整个被跳过了
        if re.match(r'^    (?:get |set |static )?[A-Za-z_$\[][^;]*\)\s*\{.*\}\s*$', lines[i]):
            out.append(lines[i])
        elif re.match(r'^    (?:get |set |static )?[A-Za-z_$\[][^;]*\{\s*$', lines[i]):
            body, i = [lines[i]], i + 1
            while i < len(lines) and lines[i] != '    }':
                body.append(lines[i]); i += 1
            out.append('\n'.join(body))
        i += 1
    return out

JS_METHODS = js_methods(js)
if not JS_METHODS:
    complain('脚本', 'nacre.js 的方法体切不出来，check-api.sh 要更新')
    JS_METHODS = None

# 收对象、但**不建立持有**的，登记在这里。每一条都要说得出为什么。
OWNERSHIP_EXEMPT = {
    # 只读，不持有
    'convertPoint:toView:', 'convertPoint:fromView:',
    'convertRect:toView:', 'convertRect:fromView:',
    'isDescendantOfView:', 'customSpacingAfterView:',
    # 接过来的是副本（头文件：appends the contents），之后和参数没有关系
    'appendPath:',
    # 参数本来就已经是自己的子视图，持有边在 addSubview 那一步就记过了
    'bringSubviewToFront:', 'sendSubviewToBack:',
    'setCustomSpacing:afterView:',
    # 解除持有，不是建立持有
    'removeArrangedSubview:',
    # 只是通知「你要换父控制器了」，持有关系是 addChildViewController: 建的
    'willMoveToParentViewController:', 'didMoveToParentViewController:',
}

if obj_arg_sels and JS_METHODS:
    seen = set()
    for body in JS_METHODS:
        # \s*：实参换行写的（nativeCallObjectArray(⏎ this, '…'）也要认
        sels = set(re.findall(r"nativeCall(?:Void|Object|ObjectArray)?\(\s*this,\s*'([^']+)'", body))
        hit = (sels & obj_arg_sels) - OWNERSHIP_EXEMPT
        if not hit: continue
        seen |= hit
        if not OWN_MARKERS.search(body):
            complain('所有权',
                     f'{sorted(hit)} 把对象交给原生，但方法体里没有 own / ownOne / '
                     f'ownAll / nativeSetOwned；真的不建立持有就登记进 OWNERSHIP_EXEMPT')
    # 一个都没对上，说明 nacre.js 那一侧的正则失效了。不报的话这一节
    # 会永远「通过」——正是 extract() 当初要防的那种静默失效
    if not seen:
        complain('脚本', 'nacre.js 里一个收对象的 selector 都没对上，check-api.sh 要更新')
    stale = OWNERSHIP_EXEMPT - obj_arg_sels
    if stale:
        complain('所有权', f'OWNERSHIP_EXEMPT 里这些已经不收对象参数了，该删：{sorted(stale)}')

# ----------------------- 7. 原生层不许对 JS 给的值直接调 xxxValue
#
# 试用反馈里的闪退就是这么来的：{ atIndex: undefined } 过 JSON 变成 null，
# 原生拿到 NSNull 直接调 integerValue，进程没了。同一类写法当时有 122 处。
#
# 规则（project.md 原则 13）：类型转换全在 JS 一侧，原生只校验。取数值要走
# NACRE_NUM / NACRE_INT / NACRE_BOOL（类型不对就报错并从所在函数返回），
# 没有报错出口的地方走 SafeNumber。这里盯着别再长出裸调用。
RAW_VALUE = re.compile(
    r'\[\s*(?:value|(?:arg|valueArg|scalar)\(\d+\)|args\.value\(\d+\)|args\[[^\]]+\]'
    r'|args\.values\.\w+|\w+\[@"\w+"\])\s+'
    r'(?:double|float|integer|unsignedInteger|int|unsignedInt|long|longLong|bool)Value\]')
_macro_uses = len(re.findall(r'\bNACRE_(?:NUM|INT|BOOL)\(', mm))
if _macro_uses == 0:
    # 一个宏都没用上，说明这一节的前提变了（宏改名了），不报的话会永远「通过」
    complain('脚本', 'NACRE_NUM / NACRE_INT / NACRE_BOOL 一处都没找到，check-api.sh 要更新')
else:
    raw = sorted(set(m.group(0) for m in RAW_VALUE.finditer(mm)))
    if raw:
        complain('取参', f'原生层对 JS 给的值直接取数，要换成 NACRE_NUM / NACRE_INT / '
                         f'NACRE_BOOL 或 SafeNumber：{raw}')

# ----------------------- 8. 隐私清单和二进制里的符号对不对得上
#
# Apple 不许第三方 SDK 靠宿主 App 的清单来报自己用了什么 required reason
# API，所以 framework 自带一份 PrivacyInfo.xcprivacy。
#
# 这一节**扫二进制**，不扫源码——因为「用了哪些」是链接出来的事实：
# _mach_absolute_time 和 _fstat 都来自 V8 的 libv8_libbase.a，我们一行都
# 没写。源码里看不出来。
#
# 两路扫：C 函数和 ObjC 的类、常量符号走 nm；ObjC 的属性和方法在 nm 里
# 根本不出现（调用只产生 objc_msgSend 和一个 selector 字符串），走
# __objc_methname 段。
import plistlib, subprocess

PRIVACY_MANIFEST = 'ios/Runtime/PrivacyInfo.xcprivacy'

# 照 Apple 的 NSPrivacyAccessedAPIType 页抄的（developer.apple.com →
# bundleresources/app-privacy-configuration/nsprivacyaccessedapitypes/
# nsprivacyaccessedapitype）。**Apple 明说这张表会变**，所以换 V8、加系统
# 框架或者 Apple 更新文档之后，要回来核一遍这里。
PRIVACY_APIS = {
    'NSPrivacyAccessedAPICategoryFileTimestamp': (
        ['_NSFileCreationDate', '_NSFileModificationDate',
         '_NSURLContentModificationDateKey', '_NSURLCreationDateKey',
         '_stat', '_fstat', '_fstatat', '_lstat'],
        ['fileModificationDate']),
    'NSPrivacyAccessedAPICategorySystemBootTime': (
        ['_mach_absolute_time'], ['systemUptime']),
    'NSPrivacyAccessedAPICategoryDiskSpace': (
        ['_NSFileSystemFreeSize', '_NSFileSystemSize',
         '_NSURLVolumeAvailableCapacityKey',
         '_NSURLVolumeAvailableCapacityForImportantUsageKey',
         '_NSURLVolumeAvailableCapacityForOpportunisticUsageKey',
         '_NSURLVolumeTotalCapacityKey',
         '_statfs', '_statvfs', '_fstatfs', '_fstatvfs'], []),
    'NSPrivacyAccessedAPICategoryActiveKeyboards': ([], ['activeInputModes']),
    'NSPrivacyAccessedAPICategoryUserDefaults': (
        ['_OBJC_CLASS_$_NSUserDefaults'], []),
}

# getattrlist 这一组 Apple 同时算进 FileTimestamp 和 DiskSpace，看符号判不出
# 是哪一种用途，所以不自动归类，撞上了就提出来让人看。
PRIVACY_AMBIGUOUS = ['_getattrlist', '_getattrlistbulk', '_fgetattrlist',
                     '_getattrlistat']

def framework_binary():
    # 哪个构建产物都行，只要是这个 framework。都没有就跳过这一节
    for pat in ('packages/ios/Nacre.xcframework/*/Nacre.framework/Nacre',
                'acceptance/ios/build/Build/Products/*/Nacre.framework/Nacre',
                'examples/*/ios/build/Build/Products/*/Nacre.framework/Nacre'):
        hits = sorted(glob.glob(pat))
        if hits:
            return hits[0]
    return None

privacy_note = ''
try:
    with open(PRIVACY_MANIFEST, 'rb') as f:
        declared = {e['NSPrivacyAccessedAPIType']
                    for e in plistlib.load(f).get('NSPrivacyAccessedAPITypes', [])}
except Exception as e:
    complain('隐私清单', f'{PRIVACY_MANIFEST} 读不出来：{e}')
    declared = None

binary = framework_binary() if declared is not None else None
if declared is None:
    pass
elif binary is None:
    privacy_note = '，隐私清单没查（没有构建产物）'
else:
    syms = set(subprocess.run(['nm', '-u', binary],
                              capture_output=True, text=True).stdout.split())
    sels = set()
    methname = subprocess.run(
        ['otool', '-v', '-s', '__TEXT', '__objc_methname', binary],
        capture_output=True, text=True).stdout
    for line in methname.splitlines()[2:]:
        parts = line.split(None, 1)
        if len(parts) == 2:
            sels.add(parts[1].strip())
    # 这两路各自都要能说出「是我自己失效了」：抽成空集就不是「什么都没用」，
    # 而是 nm / otool 的输出格式变了，再比下去只会得到一屏假阳性
    if not syms:
        complain('脚本', f'nm 从 {binary} 一个未定义符号都没抽到，check-api.sh 要更新')
    elif not sels:
        complain('脚本', '__objc_methname 一个 selector 都没抽到，check-api.sh 要更新')
    else:
        used = set()
        for cat, (want_syms, want_sels) in PRIVACY_APIS.items():
            hit = sorted((set(want_syms) & syms) | (set(want_sels) & sels))
            if hit:
                used.add(cat)
                if cat not in declared:
                    complain('隐私清单',
                             f'二进制里有 {hit}，属于 {cat}，'
                             f'但 {PRIVACY_MANIFEST} 没声明它')
        for cat in sorted(declared - used):
            complain('隐私清单',
                     f'{PRIVACY_MANIFEST} 声明了 {cat}，二进制里却找不到它的符号——'
                     f'要么那个用法没了该删掉，要么这一节的符号表该补')
        amb = sorted(set(PRIVACY_AMBIGUOUS) & syms)
        if amb:
            complain('隐私清单',
                     f'{amb} 同时算 FileTimestamp 和 DiskSpace，看符号判不出用途，要人看')
        privacy_note = f'，隐私清单 {len(used)} 类'

# ------------------------------------------------------------------ 报告
if problems:
    print('API 三边核对：发现 %d 处不一致\n' % len(problems))
    for p in problems:
        print('  ✗', p)
    sys.exit(1)

print('API 三边核对：一致')
print(f'  类 {len(J)} 个，颜色常量 {len(JS_COLORS or [])} 个，'
      f'标量读写 {len(pairs[0][1])}/{len(pairs[1][1])}，'
      f'对象读写 {len(pairs[2][1])}/{len(pairs[3][1])}{privacy_note}')
PY
