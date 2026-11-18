// 生成器的用例：清单里的一个类，生成出来的原生代码、内置脚本、类型定义各是什么。
// 生成的是和手写一样的三样东西（docs/internals/adding-classes.md），所以核对的是
// 「照手写的规矩该怎么写」。
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { before, test } from 'node:test';
import { extract } from '../extract.mjs';
import { generate } from '../generate.mjs';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const HEADER = path.join(DIR, 'fixtures', 'Sample.h');
// 手写的那一侧：SampleItem 和 NSObject 是已经接了的类，SampleMode 这个枚举类型已经声明过
const HAND = { classes: new Map([['NSObject', {}], ['SampleItem', {}]]),
               enums: new Map([['SampleMode', ['automatic', 'urlOnly']]]) };
// 补充表：手写的那一侧已经有自己的转换的类型，生成的照着用，不另起一张表
const OVERRIDES = {
  types: { SampleState: { ts: 'readonly SampleStateName[]', fromNames: 'SampleStateArgFromNames',
                          names: 'NamesForSampleStateArg' } },
  // 带对象的方法，动词认不出该怎么记所有权的，在这里写明
  methods: { SampleWell: { 'insertPart:atIndex:': { owns: 'add', group: 'parts', why: '用例：没有带对象的 remove 与它配对' } } },
};
let api;
let out;
let ext;
before(async () => {
  api = await extract({ framework: 'Sample', source: HEADER, owns: (file) => file === HEADER });
  out = generate({ api, domain: 'gen-sample', classes: ['SampleWell'], hand: HAND, deploymentTarget: '26.0', overrides: OVERRIDES });
  // 往已接的类上补成员那一组用的：SampleView 是手写过一部分的类（HAND_VIEW 在下面）
  ext = generate({ api, domain: 'gen-sample', classes: ['SampleView'], hand: HAND_VIEW, deploymentTarget: '26.0' });
});
const line = (text, needle) => text.split('\n').find((l) => l.includes(needle)) || '';

test('文件名按框架来：运行时的三样，外加验收的断言和成员清单', () => {
  assert.deepEqual(Object.keys(out.files).sort(),
    ['acceptance/src/steps/gen-sample.js', 'docs/api/gen-sample.md',
     'ios/Runtime/Bridge/NacreGenSample.mm', 'ios/Runtime/Builtin/parts/50-gen-sample.js',
     'packages/types/ios/gen-sample.d.ts']);
  // 生成一次，之后就是普通的手写文件：文件头说的是这个，不是「不要手改」
  for (const text of Object.values(out.files)) {
    assert.match(text.split('\n').slice(0, 4).join('\n'), /初稿是 bindgen 生成的/);
    assert.doesNotMatch(text, /不要手改/);
  }
});

test('名字都跟着域走：文件名、原生的函数名、枚举表的名字、域的名字', () => {
  const made = generate({ api, domain: 'color-well', classes: ['SampleWell'], hand: HAND, deploymentTarget: '26.0',
                          overrides: OVERRIDES, partPrefix: '51' });
  assert.deepEqual(Object.keys(made.files).sort(),
    ['acceptance/src/steps/color-well.js', 'docs/api/color-well.md', 'ios/Runtime/Bridge/NacreColorWell.mm',
     'ios/Runtime/Builtin/parts/51-color-well.js', 'packages/types/ios/color-well.d.ts']);
  const mm = made.files['ios/Runtime/Bridge/NacreColorWell.mm'];
  assert.match(mm, /static id ReadColorWellProperty\(/);
  // 枚举表的函数不是 static 的，两个域都用到同一个枚举时名字不能撞，所以带上域的名字
  assert.match(mm, /NACRE_ENUM_MAP\(ColorWellSampleMode, SampleMode,/);
  assert.match(mm, /d\.name = "color-well";/);
  assert.match(mm, /@implementation NacreColorWellDomain/);
  assert.match(made.files['acceptance/src/steps/color-well.js'], /export function stepColorWell\(ctx\)/);
  assert.throws(() => generate({ api, domain: 'Color Well', classes: ['SampleWell'], hand: HAND, deploymentTarget: '26.0' }),
                /域的名字/);
});

test('哪些属性生成了，哪些没有、为什么', () => {
  const report = out.report.find((r) => r.class === 'SampleWell');
  assert.deepEqual(report.generated,
    ['isEnabled', 'radius', 'ratio', 'count', 'title', 'name', 'mode', 'kind', 'tint',
     'edges', 'origin', 'item', 'owner', 'currentItem', 'templateItem', 'anchor']);
  assert.deepEqual(report.skipped.filter((s) => s.kind === 'property').map((s) => [s.name, s.reason]), [
    ['panel', '它的类 SampleView 还没接'],
    ['futureValue', '要 iOS 99.0'], ['oldValue', '废弃'], ['state', '补充表里没写这个类型怎么读'],
    ['range', '结构体 SampleRange 在 JS 里没有对应的类']]);
});

// ---------------------------------------------------------------- 对象属性
//
// 值是另一个原生对象的属性。所有权照头文件里写的：strong、copy 和没写的只读属性
// 记一条所有权边（JS 一侧 owner 的包装拖住 value 的包装）；weak 的不记——那是回边，
// 另一端已经被上游的边兜住了。见 docs/internals/wrapper.md。
// 属性的类得是 JS 里有的（手写的，或者也在清单里），不然读出来没有类可以包它。

test('对象属性在内置脚本里：strong / copy / 只读的记所有权，weak 的不记', () => {
  const js = out.files['ios/Runtime/Builtin/parts/50-gen-sample.js'];
  assert.equal(line(js, 'get item()'), "    get item() { requireNative(this, 'item'); return nativeGetOwned(this, 'item'); }");
  assert.equal(line(js, 'set item('), "    set item(value) { requireNative(this, 'item'); nativeSetOwned(this, 'item', value); }");
  assert.match(line(js, 'get templateItem()'), /nativeGetOwned\(this, 'templateItem'\)/);
  assert.match(line(js, 'set templateItem('), /nativeSetOwned\(this, 'templateItem', value\)/);
  assert.match(line(js, 'get currentItem()'), /nativeGetOwned\(this, 'currentItem'\)/);
  assert.equal(line(js, 'set currentItem('), '', '只读的没有 setter');
  assert.equal(line(js, 'get owner()'), "    get owner() { requireNative(this, 'owner'); return nativeGetObject(this, 'owner'); }");
  assert.equal(line(js, 'set owner('), "    set owner(value) { requireNative(this, 'owner'); nativeSetObject(this, 'owner', value); }");
});

test('对象属性在原生里：走对象那条通道，写的时候核对类', () => {
  const mm = out.files['ios/Runtime/Bridge/NacreGenSample.mm'];
  assert.match(mm, /if \(name == "item"\) return \{NacreKeep\(o\.item\), "SampleItem"\};/);
  assert.match(mm, /if \(name == "currentItem"\) return \{NacreKeep\(o\.currentItem\), "SampleItem"\};/);
  assert.match(mm, /if \(name == "item"\) \{\n\s+if \(GenSampleObject\(value, SampleItem\.class, "SampleItem", true, name, error\)\) o\.item = value;\n\s+return true;/);
  // 头文件里标了不可空的，写 null 要被拒
  assert.match(mm, /if \(GenSampleObject\(value, SampleItem\.class, "SampleItem", false, name, error\)\) o\.templateItem = value;/);
  const write = mm.slice(mm.indexOf('WriteGenSampleObjectProperty'), mm.indexOf('CallGenSampleMethod'));
  assert.doesNotMatch(write, /"currentItem"/);
});

test('对象属性在类型定义里', () => {
  const dts = out.files['packages/types/ios/gen-sample.d.ts'];
  assert.match(dts, /^  item: SampleItem \| null;$/m);
  assert.match(dts, /^  owner: SampleItem \| null;$/m);
  assert.match(dts, /^  readonly currentItem: SampleItem;$/m);
  assert.match(dts, /^  templateItem: SampleItem;$/m);
});

// ---------------------------------------------------------------- 方法
//
// 只生成参数和返回值都是简单类型（布尔、数、字符串、枚举）的实例方法。
// 写法照已定的规矩：selector 的第一段是方法名，第一个参数是位置参数，其余段是
// options 的键。animated 这个键可以不带（手写的 25 处全是这样），别的键必填。

test('哪些方法生成了，哪些没有、为什么', () => {
  const report = out.report.find((r) => r.class === 'SampleWell');
  assert.deepEqual(report.methods,
    ['reset', 'setEnabled', 'setRadius', 'radiusForSegmentAtIndex', 'isEnabledForSegmentAtIndex',
     'titleForSegmentAtIndex', 'setTitle', 'modeForKind', 'ratioForCount',
     'applyRadius', 'edgesForCount', 'setLabel',
     'setIcon', 'iconForState', 'setBadge', 'badgeForSegmentAtIndex', 'addChild', 'removeChild',
     'containsChild', 'removeOrphan', 'childAtIndex', 'insertPart',
     'moveTo', 'pointForCount', 'convertPoint']);
  assert.deepEqual(report.skipped.filter((s) => s.kind === 'method').map((s) => [s.name, s.reason]), [
    ['attachItem', '带对象，认不出该怎么记所有权（要写进补充表）'],
    ['insertExtra', '带对象，认不出该怎么记所有权（要写进补充表）'],
    ['panelAtIndex', '返回的类 SampleView 还没接'], ['fillWithColor', '颜色'],
    ['loadWithCompletionHandler', '回调'],
    ['insertTitle', '同名的有几个写法'],
    ['radius', '和属性同名'], ['wellCount', '类方法'], ['oldReset', '废弃'],
    ['futureReset', '要 iOS 99.0'],
    // 名字是 did… / will… / …DidChange 的是系统来调的通知，draw… 要在绘图的上下文里调
    ['didMoveToParent', '给子类覆盖的通知，原生类不做继承'], ['willRemoveChild', '给子类覆盖的通知，原生类不做继承'],
    ['titleDidChange', '给子类覆盖的通知，原生类不做继承'], ['drawContentInRect', '要在绘图的上下文里调，JS 里没有']]);
});

test('方法在内置脚本里：位置参数、options、转换', () => {
  const js = out.files['ios/Runtime/Builtin/parts/50-gen-sample.js'];
  const body = (name) => {
    const from = js.indexOf('\n    ' + name + '(');
    return js.slice(from, js.indexOf('\n    }', from) + 6);
  };
  assert.match(body('reset'), /reset\(\) \{\n\s+nativeCall\(this, 'reset', \[\]\);/);
  // animated 可以不带，不带就是 false
  assert.match(body('setEnabled'), /setEnabled\(enabled, options\) \{/);
  assert.match(body('setEnabled'), /const o = options == null \? \{\} : options;/);
  assert.match(body('setEnabled'), /nativeCall\(this, 'setEnabled:animated:', \[toBoolean\(enabled\), toBoolean\(o\.animated\)\]\);/);
  // 别的键必填，没带就抛
  assert.match(body('setRadius'), /if \(!has\(o, 'forSegmentAtIndex'\)\) throw new TypeError\('setRadius needs \{ forSegmentAtIndex \}'\);/);
  assert.match(body('setRadius'), /nativeCall\(this, 'setRadius:forSegmentAtIndex:', \[toNumber\(radius, 'setRadius'\), toInteger\(o\.forSegmentAtIndex, 'forSegmentAtIndex'\)\]\);/);
  // 有返回值的 return
  assert.match(body('radiusForSegmentAtIndex'), /return nativeCall\(this, 'radiusForSegmentAtIndex:', \[toInteger\(index, 'radiusForSegmentAtIndex'\)\]\);/);
  assert.match(body('setTitle'), /\[toTextOrNull\(title\), toInteger\(o\.forSegmentAtIndex, 'forSegmentAtIndex'\)\]/);
  // 枚举原样交给原生
  assert.match(body('modeForKind'), /return nativeCall\(this, 'modeForKind:', \[kind\]\);/);
});

test('方法在原生里：取参、调用、把结果写成 JSON', () => {
  const mm = out.files['ios/Runtime/Bridge/NacreGenSample.mm'];
  assert.match(mm, /static bool CallGenSampleMethod\(id object, NSString\* sel, const NacreArgs& args,\n\s+std::string\* out, std::string\* error\) \{/);
  assert.match(mm, /if \(\[sel isEqualToString:@"reset"\]\) \{\n\s+\[o reset\];\n\s+\*out = "null";\n\s+return true;/);
  assert.match(mm, /BOOL a0 = NACRE_BOOL\(args\.value\(0\), @"setEnabled"\);\n\s+BOOL a1 = NACRE_BOOL\(args\.value\(1\), @"animated"\);\n\s+\[o setEnabled:a0 animated:a1\];/);
  assert.match(mm, /CGFloat a0 = NACRE_NUM\(args\.value\(0\), @"setRadius"\);\n\s+NSUInteger a1 = \(NSUInteger\)NACRE_INT\(args\.value\(1\), @"forSegmentAtIndex"\);/);
  assert.match(mm, /\*out = EncodeJSON\(@\(\[o radiusForSegmentAtIndex:a0\]\)\);/);
  assert.match(mm, /\*out = EncodeJSON\(@\(\(double\)\[o ratioForCount:a0\]\)\);/);
  assert.match(mm, /\*out = EncodeJSON\(\[o titleForSegmentAtIndex:a0\]\);/);
  assert.match(mm, /if \(!GenSampleText\(args\.value\(0\), @"setTitle", true, &a0, error\)\) return true;/);
  // 枚举参数写错：报错里列出可选值。方法的位置上这是抛 TypeError，不是警告
  assert.match(mm, /SampleKind a0;\n\s+if \(!GenSampleSampleKindFromName\(args\.value\(0\), &a0\)\) \{\n\s+\*error = EnumError\(@"modeForKind", args\.value\(0\), NamesForGenSampleSampleKind\(\)\);\n\s+return true;/);
  assert.match(mm, /\*out = EncodeJSON\(NameForGenSampleSampleMode\(\[o modeForKind:a0\]\)\);/);
  assert.match(mm, /d\.call = nacre_bridge::CallGenSampleMethod;/);
});

test('方法在类型定义里', () => {
  const dts = out.files['packages/types/ios/gen-sample.d.ts'];
  assert.match(dts, /^  reset\(\): void;$/m);
  assert.match(dts, /^  setEnabled\(enabled: boolean, options\?: \{ animated\?: boolean \}\): void;$/m);
  assert.match(dts, /^  setRadius\(radius: number, options: \{ forSegmentAtIndex: number \}\): void;$/m);
  assert.match(dts, /^  radiusForSegmentAtIndex\(index: number\): number;$/m);
  assert.match(dts, /^  isEnabledForSegmentAtIndex\(index: number\): boolean;$/m);
  assert.match(dts, /^  titleForSegmentAtIndex\(index: number\): string \| null;$/m);
  assert.match(dts, /^  setTitle\(title: string \| null, options: \{ forSegmentAtIndex: number \}\): void;$/m);
  assert.match(dts, /^  modeForKind\(kind: SampleKind\): SampleMode;$/m);
});

test('原生：读', () => {
  const mm = out.files['ios/Runtime/Bridge/NacreGenSample.mm'];
  assert.match(mm, /static id ReadGenSampleProperty\(id object, NSString\* key\) \{/);
  assert.match(mm, /if \(\[object isKindOfClass:SampleWell\.class\]\) \{\n    SampleWell\* o = \(SampleWell\*\)object;/);
  assert.match(mm, /if \(\[key isEqualToString:@"isEnabled"\]\) return @\(o\.isEnabled\);/);
  assert.match(mm, /if \(\[key isEqualToString:@"radius"\]\) return @\(o\.radius\);/);
  // float 转成 double 再给，和手写的 UISlider.value 一样
  assert.match(mm, /if \(\[key isEqualToString:@"ratio"\]\) return @\(\(double\)o\.ratio\);/);
  // 可空的字符串读到没有是 null，不是「不认识这个名字」
  assert.match(mm, /if \(\[key isEqualToString:@"title"\]\) return o\.title \?: NSNull\.null;/);
  assert.match(mm, /if \(\[key isEqualToString:@"name"\]\) return o\.name \?: @"";/);
  assert.match(mm, /if \(\[key isEqualToString:@"mode"\]\) return NameForGenSampleSampleMode\(o\.mode\) \?: NSNull\.null;/);
});

test('原生：写。只读的属性没有写的分支', () => {
  const mm = out.files['ios/Runtime/Bridge/NacreGenSample.mm'];
  assert.match(mm, /if \(\[key isEqualToString:@"isEnabled"\]\) \{ o\.enabled = NACRE_BOOL\(value, key\); return YES; \}/);
  assert.match(mm, /if \(\[key isEqualToString:@"radius"\]\) \{ o\.radius = NACRE_NUM\(value, key\); return YES; \}/);
  assert.match(mm, /if \(\[key isEqualToString:@"ratio"\]\) \{ o\.ratio = \(float\)NACRE_NUM\(value, key\); return YES; \}/);
  assert.match(mm, /if \(\[key isEqualToString:@"count"\]\) \{ o\.count = NACRE_INT\(value, key\); return YES; \}/);
  assert.match(mm, /if \(GenSampleText\(value, key, true, &text, error\)\) o\.title = text;/);
  assert.match(mm, /if \(GenSampleText\(value, key, false, &text, error\)\) o\.name = text;/);
  assert.match(mm, /if \(!GenSampleSampleModeFromName\(value, &v\)\) \{\n\s+\*error = EnumError\(key, value, NamesForGenSampleSampleMode\(\)\);/);
  const write = mm.slice(mm.indexOf('WriteGenSampleProperty'), mm.indexOf('ReadGenSampleObjectProperty'));
  assert.doesNotMatch(write, /@"kind"/);
});

test('原生：枚举表。废弃的值和别名不进表', () => {
  const mm = out.files['ios/Runtime/Bridge/NacreGenSample.mm'];
  assert.match(mm, /NACRE_ENUM_MAP\(GenSampleSampleMode, SampleMode,\n\s+@"automatic": @\(SampleModeAutomatic\),\n\s+@"urlOnly": @\(SampleModeURLOnly\)\)/);
  assert.match(mm, /NACRE_ENUM_MAP\(GenSampleSampleKind, SampleKind,\n\s+@"new": @\(SampleKindNew\),\n\s+@"last": @\(SampleKindLast\)\)/);
});

test('原生：颜色走对象那条通道，构造和登记', () => {
  const mm = out.files['ios/Runtime/Bridge/NacreGenSample.mm'];
  assert.match(mm, /if \(name == "tint"\) return \{NacreKeep\(o\.tint\), "UIColor"\};/);
  assert.match(mm, /if \(name == "tint"\) \{\n\s+if \(GenSampleObject\(value, UIColor\.class, "UIColor", true, name, error\)\) o\.tint = value;\n\s+return true;/);
  assert.match(mm, /if \(className == "SampleWell"\) \{\n\s+\*out = \{NacreKeep\(\[\[SampleWell alloc\] init\]\), className\};/);
  assert.match(mm, /d\.name = "gen-sample";/);
  assert.match(mm, /d\.classes = \{SampleWell\.class\};/);
  for (const channel of ['read', 'write', 'readObject', 'writeObject', 'construct']) {
    assert.match(mm, new RegExp('d\\.' + channel + ' = nacre_bridge::'));
  }
});

test('内置脚本：一个 part，类体里的成员缩进 4 个空格，转换照参数转换的规矩', () => {
  const js = out.files['ios/Runtime/Builtin/parts/50-gen-sample.js'];
  assert.match(js, /defineNativeClass\('SampleWell', class SampleWell extends SampleItem \{/);
  assert.match(js, /constructNative\(this, new\.target, 'SampleWell', \[\]\);/);
  assert.equal(line(js, 'get isEnabled()'), "    get isEnabled() { requireNative(this, 'isEnabled'); return nativeGet(this, 'isEnabled'); }");
  assert.equal(line(js, 'set isEnabled('), "    set isEnabled(value) { requireNative(this, 'isEnabled'); nativeSet(this, 'isEnabled', toBoolean(value)); }");
  assert.match(line(js, 'set radius('), /nativeSet\(this, 'radius', toNumber\(value, 'radius'\)\)/);
  assert.match(line(js, 'set count('), /nativeSet\(this, 'count', toInteger\(value, 'count'\)\)/);
  assert.match(line(js, 'set title('), /nativeSet\(this, 'title', toTextOrNull\(value\)\)/);
  assert.match(line(js, 'set name('), /nativeSet\(this, 'name', toText\(value\)\)/);
  // 枚举原样交给原生：写错了由原生列出可选值，在属性位是一条警告
  assert.match(line(js, 'set mode('), /nativeSet\(this, 'mode', value\)/);
  assert.equal(line(js, 'set kind('), '', '只读的属性没有 setter');
  assert.match(js, /get tint\(\) \{\n\s+requireNative\(this, 'tint'\);\n\s+return colorString\(nativeGetOwned\(this, 'tint'\)\);/);
  assert.match(js, /const color = colorArg\(value, 'tint'\);\n\s+if \(color === undefined\) return;\n\s+nativeSetOwned\(this, 'tint', color\);/);
});

test('内置脚本语法没问题，从 ctx 里取的助手都用到了', () => {
  const js = out.files['ios/Runtime/Builtin/parts/50-gen-sample.js'];
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'nacre-gen-')), 'part.js');
  fs.writeFileSync(file, 'const part = ' + js.trimEnd().replace(/;$/, '') + ';\n');
  execFileSync('node', ['--check', file]);
  const taken = js.match(/const \{([^}]+)\} = ctx;/)[1].split(',').map((s) => s.trim()).filter(Boolean);
  for (const name of taken) {
    assert.ok(js.split(name).length > 2, name + ' 取了没用');
  }
  assert.deepEqual(taken, [...taken].sort(), '取的名字按字母排');
});

test('类型定义：新的枚举类型声明一次，手写里已经有的不再声明', () => {
  const dts = out.files['packages/types/ios/gen-sample.d.ts'];
  assert.match(dts, /^type SampleKind = 'new' \| 'last';$/m);
  assert.doesNotMatch(dts, /^type SampleMode/m);
  assert.match(dts, /^declare class SampleWell extends SampleItem \{$/m);
  assert.match(dts, /^  constructor\(\);$/m);
  assert.match(dts, /^  isEnabled: boolean;$/m);
  assert.match(dts, /^  radius: number;$/m);
  assert.match(dts, /^  title: string \| null;$/m);
  assert.match(dts, /^  name: string;$/m);
  assert.match(dts, /^  mode: SampleMode;$/m);
  assert.match(dts, /^  readonly kind: SampleKind;$/m);
  assert.match(dts, /^  get tint\(\): string \| null;\n  set tint\(value: ColorValue \| null\);$/m);
  const ts = createRequire(path.resolve(DIR, '../../../../acceptance/package.json'))('typescript');
  const parsed = ts.createSourceFile('gen.d.ts', dts, ts.ScriptTarget.Latest, true);
  assert.equal(parsed.parseDiagnostics.length, 0);
});

// ---------------------------------------------------------------- 位掩码
//
// 位掩码在 JS 里是名字的数组。表里只放数值是单独一位的值：0 是空数组，不是一个名字；
// 几位合起来的（All = Top | Left）也不是一个名字。

test('位掩码的表：只放单独一位的值', () => {
  const mm = out.files['ios/Runtime/Bridge/NacreGenSample.mm'];
  assert.match(mm, /NACRE_MASK_MAP\(GenSampleSampleEdge, SampleEdge,\n\s+@"top": @\(SampleEdgeTop\),\n\s+@"left": @\(SampleEdgeLeft\)\)/);
  assert.doesNotMatch(mm, /SampleEdgeNone|SampleEdgeAll/);
});

test('位掩码的属性：读是名字的数组，写错分两种报', () => {
  const mm = out.files['ios/Runtime/Bridge/NacreGenSample.mm'];
  assert.match(mm, /if \(\[key isEqualToString:@"edges"\]\) return NamesInGenSampleSampleEdge\(o\.edges\);/);
  // 「名字不认识」列出可选值（属性位上是一条警告）；「不是数组」是另一句话（抛 TypeError）
  assert.match(mm, /SampleEdge v;\n\s+id bad = nil;\n\s+if \(!GenSampleSampleEdgeFromNames\(value, &v, &bad\)\) \{\n\s+\*error = bad != nil \? EnumError\(key, bad, NamesForGenSampleSampleEdge\(\)\)\n\s+: GenSampleNotArray\(key, NamesForGenSampleSampleEdge\(\)\);/);
  const js = out.files['ios/Runtime/Builtin/parts/50-gen-sample.js'];
  assert.equal(line(js, 'set edges('), "    set edges(value) { requireNative(this, 'edges'); nativeSet(this, 'edges', value); }");
  const dts = out.files['packages/types/ios/gen-sample.d.ts'];
  assert.match(dts, /^type SampleEdge = 'top' \| 'left';$/m);
  assert.match(dts, /^  edges: SampleEdge\[\];$/m);
});

test('位掩码作方法的参数和返回值', () => {
  const mm = out.files['ios/Runtime/Bridge/NacreGenSample.mm'];
  assert.match(mm, /SampleEdge a1;\n\s+id bad1 = nil;\n\s+if \(!GenSampleSampleEdgeFromNames\(args\.value\(1\), &a1, &bad1\)\) \{/);
  assert.match(mm, /\[o applyRadius:a0 toEdges:a1\];/);
  assert.match(mm, /\*out = EncodeJSON\(NamesInGenSampleSampleEdge\(\[o edgesForCount:a0\]\)\);/);
  const js = out.files['ios/Runtime/Builtin/parts/50-gen-sample.js'];
  assert.match(js, /nativeCall\(this, 'applyRadius:toEdges:', \[toNumber\(radius, 'applyRadius'\), o\.toEdges\]\);/);
  const dts = out.files['packages/types/ios/gen-sample.d.ts'];
  assert.match(dts, /^  applyRadius\(radius: number, options: \{ toEdges: SampleEdge\[\] \}\): void;$/m);
  assert.match(dts, /^  edgesForCount\(count: number\): SampleEdge\[\];$/m);
});

test('补充表里的类型：用手写的那两个函数和它的类型写法，不另起一张表', () => {
  const mm = out.files['ios/Runtime/Bridge/NacreGenSample.mm'];
  assert.doesNotMatch(mm, /NACRE_MASK_MAP\(GenSampleSampleState/);
  assert.match(mm, /if \(!SampleStateArgFromNames\(args\.value\(1\), &a1, &bad1\)\) \{\n\s+\*error = bad1 != nil \? EnumError\(@"forState", bad1, NamesForSampleStateArg\(\)\)/);
  const dts = out.files['packages/types/ios/gen-sample.d.ts'];
  assert.doesNotMatch(dts, /^type SampleState/m);
  assert.match(dts, /^  setLabel\(label: string \| null, options: \{ forState: readonly SampleStateName\[\] \}\): void;$/m);
});

// ---------------------------------------------------------------- 带对象的方法
//
// 把对象交给原生的方法，JS 一侧要记一条所有权边（docs/internals/wrapper.md）。
// 头文件里没写方法会不会留住参数，所以按方法名的动词归类：
//   set…            记一条，同一个位置再设顶掉旧的；有对应的取值方法时两边记在同一个位置
//   add… / insert…  类里有带对象的 remove… 与它配对时，往一组里加一个
//   remove…         有配对的 add 时从那一组里去掉；没有配对的不记（解除持有）
//   is / can / contains / index / convert… 不记（只读）
// 别的认不出，不生成，除非补充表里写明。

const methodBody = (js, name) => {
  const from = js.indexOf('\n    ' + name + '(');
  return js.slice(from, js.indexOf('\n    }', from) + 6);
};

test('set…：记一条所有权，位置里带上其余的参数；配对的取值方法记在同一个位置', () => {
  const js = out.files['ios/Runtime/Builtin/parts/50-gen-sample.js'];
  assert.match(methodBody(js, 'setIcon'), /nativeCall\(this, 'setIcon:forState:', \[icon, o\.forState\]\);\n\s+own\(this, 'icon:' \+ keyPart\(o\.forState\), icon\);/);
  assert.match(methodBody(js, 'iconForState'), /return own\(this, 'icon:' \+ keyPart\(state\), nativeCallObject\(this, 'iconForState:', \[state\]\)\);/);
  assert.match(methodBody(js, 'setBadge'), /own\(this, 'badge:' \+ keyPart\(o\.forSegmentAtIndex\), badge\);/);
  assert.match(methodBody(js, 'badgeForSegmentAtIndex'), /return own\(this, 'badge:' \+ keyPart\(index\), nativeCallObject\(this, 'badgeForSegmentAtIndex:', \[toInteger\(index, 'badgeForSegmentAtIndex'\)\]\)\);/);
  // 位置里的数组先排序：['a', 'b'] 和 ['b', 'a'] 是同一个状态
  assert.match(js, /const keyPart = \(v\) => \(Array\.isArray\(v\) \? v\.slice\(\)\.sort\(\)\.join\('\|'\) : String\(v\)\);/);
});

test('add… 和 remove… 配成一组；查询和没有配对的 remove 不记', () => {
  const js = out.files['ios/Runtime/Builtin/parts/50-gen-sample.js'];
  assert.match(methodBody(js, 'addChild'), /nativeCall\(this, 'addChild:', \[child\]\);\n\s+ownOne\(this, 'child', child\);/);
  assert.match(methodBody(js, 'removeChild'), /nativeCall\(this, 'removeChild:', \[child\]\);\n\s+disown\(this, 'child', child\);/);
  assert.match(methodBody(js, 'containsChild'), /return nativeCall\(this, 'containsChild:', \[child\]\);\n    \}/);
  assert.doesNotMatch(methodBody(js, 'containsChild'), /own/);
  assert.doesNotMatch(methodBody(js, 'removeOrphan'), /own/);
  // 不记的要在原生那个文件里标出来、写明理由：check-api.sh 的所有权检查认这一行
  const mm = out.files['ios/Runtime/Bridge/NacreGenSample.mm'];
  assert.match(mm, /\/\/ nacre:ownership-exempt containsChild: —— 只读，不持有/);
  assert.match(mm, /\/\/ nacre:ownership-exempt removeOrphan: —— 解除持有，不是建立持有/);
  assert.doesNotMatch(mm, /ownership-exempt (addChild|removeChild|setIcon)/);
});

test('补充表里写明的方法照它说的记', () => {
  const js = out.files['ios/Runtime/Builtin/parts/50-gen-sample.js'];
  assert.match(methodBody(js, 'insertPart'), /nativeCall\(this, 'insertPart:atIndex:', \[part, toInteger\(o\.atIndex, 'atIndex'\)\]\);\n\s+ownOne\(this, 'parts', part\);/);
});

test('带对象的方法在原生里：对象参数直接从 args.object 取，核对类；返回对象的走另一条通道', () => {
  const mm = out.files['ios/Runtime/Bridge/NacreGenSample.mm'];
  assert.match(mm, /id g0 = args\.object\(0\);\n\s+if \(!GenSampleIsObject\(g0, args\.value\(0\), @"setIcon", SampleItem\.class, "SampleItem", true, error\)\) return true;\n\s+SampleItem\* a0 = g0;/);
  assert.match(mm, /if \(!GenSampleIsObject\(g0, args\.value\(0\), @"addChild", SampleItem\.class, "SampleItem", false, error\)\) return true;/);
  assert.match(mm, /static bool CallGenSampleObjectMethod\(id object, NSString\* sel, const NacreArgs& args,\n\s+nacre::NativeObjectRef\* out, std::string\* error\) \{/);
  assert.match(mm, /\*out = \{NacreKeep\(\[o iconForState:a0\]\), "SampleItem"\};/);
  assert.match(mm, /\*out = \{NacreKeep\(\[o childAtIndex:a0\]\), "SampleItem"\};/);
  assert.match(mm, /d\.callObject = nacre_bridge::CallGenSampleObjectMethod;/);
});

test('带对象的方法在类型定义里', () => {
  const dts = out.files['packages/types/ios/gen-sample.d.ts'];
  assert.match(dts, /^  setIcon\(icon: SampleItem \| null, options: \{ forState: readonly SampleStateName\[\] \}\): void;$/m);
  assert.match(dts, /^  iconForState\(state: readonly SampleStateName\[\]\): SampleItem \| null;$/m);
  assert.match(dts, /^  addChild\(child: SampleItem\): void;$/m);
  assert.match(dts, /^  containsChild\(child: SampleItem\): boolean;$/m);
  assert.match(dts, /^  childAtIndex\(index: number\): SampleItem \| null;$/m);
});

test('补充表里的 owns 写了不认识的值，或者不记却没写理由：报错', () => {
  const bad = (entry) => ({ ...OVERRIDES, methods: { SampleWell: { 'insertPart:atIndex:': entry } } });
  assert.throws(() => generate({ api, domain: 'gen-sample', classes: ['SampleWell'], hand: HAND, deploymentTarget: '26.0', overrides: bad({ owns: 'keep' }) }),
                /insertPart:atIndex:.*owns/);
  assert.throws(() => generate({ api, domain: 'gen-sample', classes: ['SampleWell'], hand: HAND, deploymentTarget: '26.0', overrides: bad({ owns: 'none' }) }),
                /insertPart:atIndex:.*why/);
});

// ---------------------------------------------------------------- 结构体
//
// CGRect 这类在 JS 里是类（字段只读）。读出来永远是那个类的实例；写的时候是
// 实例或者带同样字段的普通对象都收。能生成的只有 JS 里已经有类的那七个结构体。

test('结构体的属性：读出来包成类，写的时候核对字段', () => {
  const js = out.files['ios/Runtime/Builtin/parts/50-gen-sample.js'];
  assert.equal(line(js, 'get origin()'), "    get origin() { requireNative(this, 'origin'); return toPoint(nativeGet(this, 'origin')); }");
  assert.equal(line(js, 'set origin('), "    set origin(value) { requireNative(this, 'origin'); nativeSet(this, 'origin', structArg(value, POINT_FIELDS, 'origin')); }");
  assert.equal(line(js, 'set anchor('), '', '只读的没有 setter');
  const mm = out.files['ios/Runtime/Bridge/NacreGenSample.mm'];
  assert.match(mm, /if \(\[key isEqualToString:@"origin"\]\) return PointToJSON\(o\.origin\);/);
  assert.match(mm, /if \(\[key isEqualToString:@"origin"\]\) \{ o\.origin = JSONToPoint\(value\); return YES; \}/);
  const dts = out.files['packages/types/ios/gen-sample.d.ts'];
  // 读给类本身，写收 Like：和手写的 view.frame 一样
  assert.match(dts, /^  get origin\(\): CGPoint;\n  set origin\(value: CGPointLike\);$/m);
  assert.match(dts, /^  readonly anchor: CGPoint;$/m);
});

test('结构体作方法的参数和返回值', () => {
  const js = out.files['ios/Runtime/Builtin/parts/50-gen-sample.js'];
  assert.match(methodBody(js, 'moveTo'), /nativeCall\(this, 'moveTo:', \[structArg\(point, POINT_FIELDS, 'moveTo'\)\]\);/);
  assert.match(methodBody(js, 'pointForCount'), /return toPoint\(nativeCall\(this, 'pointForCount:', \[toInteger\(count, 'pointForCount'\)\]\)\);/);
  assert.match(methodBody(js, 'convertPoint'), /return toPoint\(nativeCall\(this, 'convertPoint:withScale:', \[structArg\(point, POINT_FIELDS, 'convertPoint'\), toNumber\(o\.withScale, 'withScale'\)\]\)\);/);
  const mm = out.files['ios/Runtime/Bridge/NacreGenSample.mm'];
  assert.match(mm, /CGPoint a0 = JSONToPoint\(args\.value\(0\)\);\n\s+\[o moveTo:a0\];/);
  assert.match(mm, /\*out = EncodeJSON\(PointToJSON\(\[o pointForCount:a0\]\)\);/);
  const dts = out.files['packages/types/ios/gen-sample.d.ts'];
  assert.match(dts, /^  moveTo\(point: CGPointLike\): void;$/m);
  assert.match(dts, /^  pointForCount\(count: number\): CGPoint;$/m);
  assert.match(dts, /^  convertPoint\(point: CGPointLike, options: \{ withScale: number \}\): CGPoint;$/m);
});

// ---------------------------------------------------------------- 往已接的类上补成员
//
// 清单里的类如果已经手写过，就只补它没有的成员：手写的一个字不动，同一个名字
// 手写的有了（它自己的，或者它手写的父类上的）就跳过。写法是手写的富文本那一组
// 已经在用的：原生多认领这个类的几个名字，JS 往原型上挂，类型用声明合并。

const members = (properties, methods) => ({
  properties: new Map(properties.map((n) => [n, {}])), methods: new Map(methods.map((n) => [n, {}])) });
// SampleView 手写过一部分；SampleItem 和 NSObject 也是手写的
const HAND_VIEW = { enums: HAND.enums, classes: new Map([
  ['NSObject', members([], [])], ['SampleItem', members([], [])],
  ['SampleView', { super: 'NSObject', ...members(['isOn', 'mode', 'title', 'width'], ['setOn', 'sizeToFit', 'insertItem']) }]]) };

test('已接的类：只补手写没有的成员', () => {
  const report = ext.report.find((r) => r.class === 'SampleView');
  assert.equal(report.extended, true);
  assert.deepEqual(report.generated, ['edges', 'item', 'origin']);
  assert.deepEqual(report.methods, ['itemAtIndex', 'markerCountWithScale']);
  // 手写的已经有的不算「没生成」，不列出来
  assert.deepEqual(report.skipped.map((s) => s.name).filter((n) => ['isOn', 'mode', 'title', 'width', 'setOn', 'sizeToFit', 'insertItem'].includes(n)), []);
});

test('已接的类：带对象参数的方法先不补（所有权的检查看不见挂上去的方法）', () => {
  const report = ext.report.find((r) => r.class === 'SampleView');
  const why = new Map(report.skipped.map((s) => [s.name, s.reason]));
  assert.equal(why.get('addMarker'), '往已接的类上补带对象的方法还没做');
  assert.equal(why.get('removeMarker'), '往已接的类上补带对象的方法还没做');
});

test('已接的类在内置脚本里：不重新定义类，往原型上挂', () => {
  const js = ext.files['ios/Runtime/Builtin/parts/50-gen-sample.js'];
  assert.doesNotMatch(js, /defineNativeClass\('SampleView'/);
  assert.doesNotMatch(js, /constructNative/);
  // 属性：一个一句 Object.defineProperty，属性名是字面量（check-api.sh 按字面量核对）
  assert.match(js, /Object\.defineProperty\(SampleView\.prototype, 'edges', \{\n    configurable: true,\n    enumerable: false,\n    get\(\) \{ requireNative\(this, 'edges'\); return nativeGet\(this, 'edges'\); \},\n    set\(value\) \{ requireNative\(this, 'edges'\); nativeSet\(this, 'edges', value\); \},\n  \}\);/);
  assert.match(js, /Object\.defineProperty\(SampleView\.prototype, 'item', \{[^}]*get\(\) \{ requireNative\(this, 'item'\); return nativeGetOwned\(this, 'item'\); \}/);
  // 方法：用一个不带 Object.defineProperty 字样的助手挂，和手写的一样
  assert.match(js, /const define = \(proto, name, value\) => Object\.defineProperty\(proto, name, \{ configurable: true, enumerable: false, writable: true, value \}\);/);
  assert.match(js, /define\(SampleView\.prototype, 'itemAtIndex', function itemAtIndex\(index\) \{\n    return nativeCallObject\(this, 'itemAtIndex:', \[toInteger\(index, 'itemAtIndex'\)\]\);\n  \}\);/);
});

test('已接的类在原生里：只认领补的那几个名字，不造对象', () => {
  const mm = ext.files['ios/Runtime/Bridge/NacreGenSample.mm'];
  assert.match(mm, /d\.classes = \{SampleView\.class\};/);
  assert.match(mm, /if \(\[key isEqualToString:@"edges"\]\) return NamesInGenSampleSampleEdge\(o\.edges\);/);
  assert.doesNotMatch(mm, /@"isOn"|@"title"|@"mode"/);
  assert.doesNotMatch(mm, /Construct/);
});

test('已接的类在类型定义里：声明合并，不是再声明一个类', () => {
  const dts = ext.files['packages/types/ios/gen-sample.d.ts'];
  assert.doesNotMatch(dts, /declare class SampleView/);
  assert.match(dts, /^interface SampleView \{$/m);
  assert.match(dts, /^  edges: SampleEdge\[\];$/m);
  // 头文件里 item 标的是不可空
  assert.match(dts, /^  item: SampleItem;$/m);
  assert.match(dts, /^  get origin\(\): CGPoint;\n  set origin\(value: CGPointLike\);$/m);
  assert.match(dts, /^  itemAtIndex\(index: number\): SampleItem \| null;$/m);
});

test('手写的父类上已经有的名字，子类不再生成（头文件里子类重复声明的）', () => {
  const hand = { enums: HAND.enums, classes: new Map([
    ['NSObject', members([], [])], ['SampleItem', { super: 'NSObject', ...members(['title', 'radius'], ['reset']) }]]) };
  const made = generate({ api, domain: 'gen-sample', classes: ['SampleWell'], hand, deploymentTarget: '26.0', overrides: OVERRIDES });
  const report = made.report.find((r) => r.class === 'SampleWell');
  assert.equal(report.generated.includes('title'), false);
  assert.equal(report.generated.includes('radius'), false);
  assert.equal(report.methods.includes('reset'), false);
  assert.equal(report.generated.includes('isEnabled'), true);
});

test('补充表：排除某个成员；把协议上的成员算进来', () => {
  const made = generate({ api, domain: 'gen-sample', classes: ['SampleView'], hand: HAND_VIEW, deploymentTarget: '26.0',
                          overrides: { exclude: { SampleView: ['origin'] }, protocols: { SampleView: ['SampleTraits'] } } });
  const report = made.report.find((r) => r.class === 'SampleView');
  assert.deepEqual(report.generated, ['edges', 'item', 'secure', 'traitMode']);
  assert.equal(report.skipped.find((s) => s.name === 'origin').reason, '补充表里排除了');
  // 不写进补充表，协议上的成员不生成：头文件看不出这个类到底实现了哪些可选的成员
  assert.equal(ext.report.find((r) => r.class === 'SampleView').generated.includes('secure'), false);
  assert.throws(() => generate({ api, domain: 'gen-sample', classes: ['SampleView'], hand: HAND_VIEW, deploymentTarget: '26.0',
                                 overrides: { protocols: { SampleView: ['Nope'] } } }), /SampleView.*Nope/);
});

test('验收的断言也生成：每个属性读出来的类型对，写回原值读到的不变', () => {
  const step = ext.files['acceptance/src/steps/gen-sample.js'];
  assert.match(step, /export function stepGenSample\(ctx\) \{/);
  assert.match(step, /const o = new SampleView\(\);/);
  assert.match(step, /assert\('SampleView\.edges 读出来是名字的数组', Array\.isArray\(o\.edges\), true\);/);
  assert.match(step, /assert\('SampleView\.origin 读出来是 CGPoint', o\.origin instanceof CGPoint, true\);/);
  assert.match(step, /assert\('SampleView\.item 读出来是 SampleItem', o\.item instanceof SampleItem, true\);/);
  assert.match(step, /o\.edges = before;/);
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'nacre-gen-')), 'step.mjs');
  fs.writeFileSync(file, step);
  execFileSync('node', ['--check', file]);
});

test('成员清单的文档也生成：只列名字和类型', () => {
  const doc = ext.files['docs/api/gen-sample.md'];
  assert.match(doc, /^## SampleView$/m);
  assert.match(doc, /^\| `edges` \| `SampleEdge\[\]` \| 可读可写 \|$/m);
  // 表格里的竖线要转义，不然这一格会被切成两格
  assert.match(doc, /^\| `itemAtIndex\(index\)` \| 返回 `SampleItem \\\| null` \|/m);
});

test('已有的枚举类型：表里的名字照手写声明的来，机械规则算出来对不上就报错', () => {
  const bad = { ...HAND, enums: new Map([['SampleMode', ['automatic', 'onlyURL']]]) };
  assert.throws(() => generate({ api, domain: 'gen-sample', classes: ['SampleWell'], hand: bad, deploymentTarget: '26.0' }),
                /SampleMode.*onlyURL/);
});

test('用到了提取结果里找不到定义的枚举：当成认不出的类型跳过，不是崩掉', () => {
  // 别的框架的枚举就是这样：这个框架的提取结果里只有它的名字（通过别名），没有它的值
  const well = api.classes.find((c) => c.name === 'SampleWell');
  const foreign = { name: 'foreign', getter: null, type: 'Foreign', nullable: null, readonly: false, ownership: 'assign',
                    static: false, deprecated: false, unavailable: false };
  const api2 = { ...api, typedefs: { ...api.typedefs, Foreign: 'enum ForeignEnum' },
                 classes: api.classes.map((c) => (c === well ? { ...well, properties: [...well.properties, foreign] } : c)) };
  const made = generate({ api: api2, domain: 'gen-sample', classes: ['SampleWell'], hand: HAND, deploymentTarget: '26.0',
                          overrides: OVERRIDES });
  const report = made.report.find((r) => r.class === 'SampleWell');
  assert.equal(report.generated.includes('foreign'), false);
  assert.equal(report.skipped.find((x) => x.name === 'foreign').reason, '认不出的类型');
});

test('重新生成一遍，一个字节不变', () => {
  const again = generate({ api, domain: 'gen-sample', classes: ['SampleWell'], hand: HAND, deploymentTarget: '26.0', overrides: OVERRIDES });
  assert.deepEqual(again.files, out.files);
});

test('不能生成的类当场报错，说清楚原因', () => {
  assert.throws(() => generate({ api, domain: 'gen-sample', classes: ['Nope'], hand: HAND, deploymentTarget: '26.0' }), /Nope.*头文件里没有/);
  // 父类没接：JS 那一侧没有可以继承的类
  const orphan = { ...HAND, classes: new Map([['NSObject', {}]]) };
  assert.throws(() => generate({ api, domain: 'gen-sample', classes: ['SampleWell'], hand: orphan, deploymentTarget: '26.0' }), /SampleWell.*父类 SampleItem/);
});
