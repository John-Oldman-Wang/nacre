#!/usr/bin/env node
// bindgen 的命令行入口。三个命令，都不动运行时已有的文件：
//
//   node ios/scripts/bindgen/bindgen.mjs extract [框架…]
//       头文件 → ios/build/bindgen/<框架>.json
//   node ios/scripts/bindgen/bindgen.mjs report
//       对照手写的类型定义 → ios/build/bindgen/report.md：每个已接的类还缺哪些成员
//   node ios/scripts/bindgen/bindgen.mjs scaffold <域> <类…>
//       照手写的格式写出一个域的初稿（原生、内置脚本、类型、验收、成员清单）
//
// scaffold 是「生成一次，之后归手写」：它只写新文件，文件已经在了就拒绝，不覆盖。
// 类没接过的整个写出来；已经手写过的只写它还没有的成员。写完之后要人接着做的事
// 它会列出来（事件、认不出所有权的方法、入口各加一行）。
//
// extract 不写框架名时提取的是下面 FRAMEWORKS 这一组：核心用到的四个，加上各能力包用到的。
// overrides.json 是生成初稿时要知道的手写约定（哪些类型手写的已经有转换、哪个类实现了
// 哪个协议、哪些成员定了不接），report 和 scaffold 都读它。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractFramework } from './extract.mjs';
import { readHandwritten } from './handwritten.mjs';
import { compare, coverage } from './compare.mjs';
import { generate } from './generate.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const OUT = path.join(REPO, 'ios', 'build', 'bindgen');
// 我们支持的最低 iOS 版本。头文件里标了更高版本才有的成员不写进初稿
const DEPLOYMENT_TARGET = '26.0';
const FRAMEWORKS = ['Foundation', 'CoreGraphics', 'QuartzCore', 'UIKit',
                    'LocalAuthentication', 'AppTrackingTransparency', 'AdSupport', 'Photos', 'PhotosUI',
                    'CoreLocation', 'Contacts', 'ContactsUI', 'UserNotifications'];

const [command, ...rest] = process.argv.slice(2);
if (command === 'extract') await runExtract(rest.length > 0 ? rest : FRAMEWORKS);
else if (command === 'report') runReport();
else if (command === 'scaffold') runScaffold(rest);
else {
  console.error('用法：bindgen.mjs extract [框架…] | report | scaffold <域> <类…> [--force]');
  process.exit(2);
}

async function runExtract(frameworks) {
  fs.mkdirSync(OUT, { recursive: true });
  for (const framework of frameworks) {
    const started = Date.now();
    const api = await extractFramework(framework);
    fs.writeFileSync(path.join(OUT, framework + '.json'), JSON.stringify(api, null, 1) + '\n');
    console.log(framework.padEnd(26) + ' 类 ' + String(api.classes.length).padStart(4) +
                '  协议 ' + String(api.protocols.length).padStart(4) + '  枚举 ' + String(api.enums.length).padStart(4) +
                '  C 函数 ' + String(api.functions.length).padStart(5) + '   ' + ((Date.now() - started) / 1000).toFixed(1) + ' 秒');
  }
}

// 手写的类型定义：核心的和各能力包的
function handwrittenFiles() {
  const typesDir = path.join(REPO, 'packages', 'types', 'ios');
  const files = fs.readdirSync(typesDir).filter((f) => f.endsWith('.d.ts'))
    .map((f) => path.join(typesDir, f));
  for (const pkg of fs.readdirSync(path.join(REPO, 'packages'))) {
    const file = path.join(REPO, 'packages', pkg, 'index.d.ts');
    if (pkg !== 'types' && pkg !== 'ios' && fs.existsSync(file)) files.push(file);
  }
  return files;
}

function runScaffold(args) {
  const force = args.includes('--force');
  const [domain, ...classes] = args.filter((a) => !a.startsWith('--'));
  if (!domain || classes.length === 0) {
    console.error('用法：bindgen.mjs scaffold <域> <类…> [--force]\n比如：bindgen.mjs scaffold refresh-control UIRefreshControl');
    process.exit(2);
  }
  if (!fs.existsSync(OUT)) { console.error('还没有提取结果，先跑 extract'); process.exit(1); }
  const apis = fs.readdirSync(OUT).filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(fs.readFileSync(path.join(OUT, f), 'utf8')));
  const owner = apis.find((a) => a.classes.some((c) => c.name === classes[0]));
  if (!owner) { console.error(classes[0] + '：提取过的框架里没有这个类。先 extract 它所在的框架'); process.exit(1); }
  // 类和协议用它自己那个框架的；枚举、结构体、别名各个框架的都要认得
  // （UIKit 的属性会用到 Foundation 的 NSTextAlignment）
  const api = { ...owner, enums: [...owner.enums], structs: [...owner.structs], typedStrings: [...owner.typedStrings],
                typedefs: { ...owner.typedefs } };
  for (const other of apis) {
    if (other === owner) continue;
    api.enums.push(...other.enums.filter((e) => e.name && !api.enums.some((x) => x.name === e.name)));
    api.structs.push(...other.structs);
    api.typedStrings.push(...other.typedStrings);
    for (const [name, actual] of Object.entries(other.typedefs || {})) if (!(name in api.typedefs)) api.typedefs[name] = actual;
  }
  const here = path.join(REPO, 'ios', 'scripts', 'bindgen');
  const overrides = JSON.parse(fs.readFileSync(path.join(here, 'overrides.json'), 'utf8'));
  const hand = readHandwritten(handwrittenFiles());

  // 内置脚本按文件名的序号执行。这个域用到的手写的类（要补成员的，和要继承的父类）
  // 在哪个文件里定义，它就得排在那个文件后面
  const partsDir = path.join(REPO, 'ios', 'Runtime', 'Builtin', 'parts');
  const definedIn = new Map();
  for (const file of fs.readdirSync(partsDir)) {
    for (const [, name] of fs.readFileSync(path.join(partsDir, file), 'utf8').matchAll(/defineNativeClass\('(\w+)'/g)) {
      definedIn.set(name, Number(file.slice(0, 2)));
    }
  }
  const needs = classes.flatMap((name) => {
    const cls = owner.classes.find((c) => c.name === name);
    return [name, cls ? cls.super : null];
  }).filter((name) => name && hand.classes.has(name));
  const partPrefix = String(Math.max(50, ...needs.map((name) => (definedIn.get(name) || 0) + 1))).padStart(2, '0');

  const { files, report } = generate({ api, domain, partPrefix, classes, hand, deploymentTarget: DEPLOYMENT_TARGET, overrides });
  const existing = Object.keys(files).filter((relative) => fs.existsSync(path.join(REPO, relative)));
  if (existing.length > 0 && !force) {
    console.error('这几个文件已经在了：\n  ' + existing.join('\n  ') +
                  '\n初稿只写一次，之后那些文件是手写的，这里不覆盖。要给已有的域加成员，直接改它的文件；' +
                  '确实要重写就加 --force（手改的会丢）。');
    process.exit(1);
  }
  for (const [relative, text] of Object.entries(files)) {
    fs.writeFileSync(path.join(REPO, relative), text);
    console.log('写了  ' + relative);
  }
  for (const entry of report) {
    console.log('\n' + entry.class + (entry.extended ? '（已经手写过，补成员）' : '（整个类）') + '：' + entry.generated.length + ' 个属性' +
                (entry.generated.length > 0 ? '（' + entry.generated.join('、') + '）' : '') +
                '，' + entry.methods.length + ' 个方法' + (entry.methods.length > 0 ? '（' + entry.methods.join('、') + '）' : ''));
    for (const s of entry.skipped) console.log('  没写' + (s.kind === 'method' ? '方法 ' : '属性 ') + s.name + '：' + s.reason);
  }
  const pascalName = domain.split('-').map((part) => part[0].toUpperCase() + part.slice(1)).join('');
  console.log('\n接下来是人的事（这几个文件现在是手写的了）：\n' +
    '  1. packages/types/ios.d.ts 加一行：/// <reference path="./ios/' + domain + '.d.ts" />\n' +
    "  2. acceptance/src/main.js 加一行 import { step" + pascalName + " } from './steps/" + domain + ".js'，later 里加一行\n" +
    '  3. docs/.vitepress/config.mjs 的侧边栏、docs/api/README.md 的索引各加一项\n' +
    '  4. 上面「没写」的成员里要用的：事件、认不出所有权的方法、带参数的构造，手写进这几个文件\n' +
    '  5. 验收里现在只有读写往返。默认值和实际用法的断言要量过再写；文档里的效果要看过再写\n' +
    '  6. bash ios/scripts/check-api.sh，然后 Debug、Release 各验一遍');
}

function runReport() {
  if (!fs.existsSync(OUT)) { console.error('还没有提取结果，先跑 extract'); process.exit(1); }
  const apis = fs.readdirSync(OUT).filter((f) => f.endsWith('.json')).sort()
    .map((f) => JSON.parse(fs.readFileSync(path.join(OUT, f), 'utf8')));
  if (apis.length === 0) { console.error('还没有提取结果，先跑 extract'); process.exit(1); }
  const files = handwrittenFiles();
  const hand = readHandwritten(files);
  const result = compare(apis, hand);
  const rows = coverage(apis, hand);
  const report = render(result, rows, apis);
  fs.writeFileSync(path.join(OUT, 'report.md'), report);
  console.log(report.split('\n## 逐个类')[0]);
  console.log('完整的报告：' + path.join(OUT, 'report.md'));
}

function render(result, rows, apis) {
  const t = result.totals;
  const lines = [];
  const pct = (a, b) => (b === 0 ? '—' : (100 * a / b).toFixed(1) + '%');
  lines.push('# bindgen 对照报告', '',
    'SDK：' + (apis[0].sdk || '') + '。机械规则是 `ios/scripts/bindgen/rules.mjs`，手写的结果读自类型定义。', '',
    '## 规模：头文件里有多少，接了多少', '',
    '| 框架 | 类 | 已接的类 | 属性 | 方法 | 废弃或不可用 | 枚举 | 协议 | C 函数 |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- |');
  for (const r of rows) {
    lines.push('| ' + [r.framework, r.classes, r.bound, r.properties, r.methods, r.deprecated, r.enums, r.protocols, r.functions].join(' | ') + ' |');
  }
  const total = (key) => rows.reduce((n, r) => n + r[key], 0);
  lines.push('| 合计 | ' + ['classes', 'bound', 'properties', 'methods', 'deprecated', 'enums', 'protocols', 'functions'].map(total).join(' | ') + ' |', '');

  lines.push('## 已接的 ' + t.classes + ' 个类：机械规则和手写的差多少', '',
    '| | 个数 | |', '| --- | --- | --- |',
    '| 名字和形状都一样 | ' + t.same + ' | 机械规则直接算得出 |',
    '| 名字一样，形状不一样 | ' + t.different + ' | 只读不一样，或者 options 的键对不上 |',
    '| 只在手写里有 | ' + t.handOnly + ' | 其中 ' + t.renamed + ' 个像是改了名，' + (t.handOnly - t.renamed) + ' 个头文件里找不到对应 |',
    '| 只在头文件里有（还没接） | ' + t.generatedOnly + ' | 不含构造方法 ' + t.constructors + ' 个、废弃或不可用的 ' + t.skipped + ' 个 |', '',
    '手写的成员里，机械规则算得出同名的占 ' + pct(t.same + t.different, t.same + t.different + t.handOnly) + '。', '',
    '手写的类里有 ' + result.handClassesNotInHeaders.length + ' 个在这些框架的头文件里找不到（我们自己定义的，或者框架没提取）：' +
    result.handClassesNotInHeaders.join('、') + '。', '');

  lines.push('## 枚举', '',
    '对得上名字的枚举 ' + t.enums + ' 个：值一样的 ' + t.enumSame + ' 个，只在手写里有的 ' + t.enumHandOnly +
    ' 个，只在头文件里有的 ' + t.enumGeneratedOnly + ' 个。', '',
    '值的前缀不是类型名的：' + (result.enums.filter((e) => !e.prefixIsTypeName).map((e) => e.name).join('、') || '没有') + '。', '',
    '手写的字符串联合类型里有 ' + result.handEnumsNotInHeaders.length + ' 个在头文件里没有同名的枚举。', '');

  lines.push('## 类型：机械规则认得出多少', '',
    '| 框架 | 成员里出现的类型 | 认得出 | 比例 | 认不出的里最多的 |', '| --- | --- | --- | --- | --- |');
  for (const r of rows) {
    const top = [...r.unmapped].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([type, n]) => '`' + type + '` ' + n).join('，');
    lines.push('| ' + [r.framework, r.typesTotal, r.typesMapped, pct(r.typesMapped, r.typesTotal), top].join(' | ') + ' |');
  }
  lines.push('');

  lines.push('## 逐个类', '');
  for (const c of [...result.classes].sort((a, b) => a.name.localeCompare(b.name))) {
    lines.push('### ' + c.name + '（' + c.framework + '）', '',
      '一样 ' + c.same.length + '，形状不一样 ' + c.different.length + '，只在手写里 ' + c.handOnly.length +
      '，还没接 ' + c.generatedOnly.length + '，构造方法 ' + c.constructors.length + '，废弃或不可用 ' + c.skipped.length + '。', '');
    if (c.different.length > 0) {
      lines.push('形状不一样：' + c.different.map((d) => '`' + d.name + '`（' +
        (d.what === 'readonly' ? '手写' + (d.hand ? '只读' : '可写') + '，头文件' + (d.generated ? '只读' : '可写')
          : d.what === 'options' ? '手写的键 ' + d.hand.join('/') + '，头文件 ' + (d.generated.join('/') || '没有')
            : d.what) + '）').join('；') + '。', '');
    }
    if (c.handOnly.length > 0) {
      lines.push('只在手写里：' + c.handOnly.map((m) => '`' + m.name + '`' + (m.guess ? ' ← `' + m.guess + '`' : '') +
        (m.deprecated ? '（头文件里标了废弃）' : '')).join('，') + '。', '');
    }
    if (c.generatedOnly.length > 0) {
      lines.push('还没接：' + c.generatedOnly.map((m) => '`' + m.name + '`').join('，') + '。', '');
    }
  }
  lines.push('## 逐个枚举', '');
  for (const e of [...result.enums].sort((a, b) => a.name.localeCompare(b.name))) {
    if (e.handOnly.length === 0 && e.generatedOnly.length === 0) continue;
    lines.push('- `' + e.name + '`：' + (e.handOnly.length ? '只在手写里 ' + e.handOnly.map((v) => '`' + v + '`').join(' ') + '；' : '') +
      (e.generatedOnly.length ? '只在头文件里 ' + e.generatedOnly.map((v) => '`' + v + '`').join(' ') : ''));
  }
  return lines.join('\n') + '\n';
}
