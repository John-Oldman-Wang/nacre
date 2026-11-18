// bindgen 的第一段：头文件 → 一份中立的 API 描述。
//
// 做法是让 clang 把语法树导成 JSON（-Xclang -ast-dump=json），从里面挑出归某个
// 框架的声明：类、分类、协议、枚举、结构体、C 函数、字符串常量。这里只管
// 「头文件里写了什么」，不管它该翻译成什么样的 JS——那是 rules.mjs 的事。
//
// 为什么用 clang 而不是自己扫头文件：宏（NS_ENUM、API_AVAILABLE）、可空标注、
// 属性的 strong / copy / weak、getter 的别名，clang 都已经解析好了。
// 设计和实测见 docs/internals/bindgen.md。
import { spawn, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import readline from 'node:readline';

// ---------------------------------------------------------------- 调 clang，一条一条地读

// clang 导出来的是一个巨大的 JSON（UIKit 是 273 MB），顶层声明都在根节点的
// inner 数组里。它的缩进是固定的：每个顶层声明从单独一行的「四个空格加 {」
// 开始，到「四个空格加 }」结束。按这个切开，一个声明解析一次，不把整份读进内存。
async function* topLevelDecls(source, clangArgs) {
  const args = ['clang', '-x', 'objective-c', '-fsyntax-only', '-Xclang', '-ast-dump=json',
                ...clangArgs, source];
  const child = spawn('xcrun', args, { stdio: ['ignore', 'pipe', 'pipe'] });
  let stderr = '';
  child.stderr.on('data', (chunk) => { stderr += chunk; });
  const exited = new Promise((resolve) => child.on('close', resolve));

  let lines = null;
  let count = 0;
  for await (const line of readline.createInterface({ input: child.stdout, crlfDelay: Infinity })) {
    if (lines === null) {
      if (line === '    {') lines = ['{'];
    } else if (line === '    }' || line === '    },') {
      lines.push('}');
      count += 1;
      yield JSON.parse(lines.join('\n'));
      lines = null;
    } else {
      lines.push(line);
    }
  }
  const code = await exited;
  if (/\berror:/.test(stderr)) {
    throw new Error('clang 解析 ' + source + ' 时报错：\n' + stderr.trim().split('\n').slice(0, 8).join('\n'));
  }
  // 一条都没切出来，多半是 clang 换了导出的缩进：是这个提取器自己失效了，要说出来
  if (count === 0) {
    throw new Error('从 clang 的导出里一条声明都没切出来（退出码 ' + code +
                    '）。导出的格式可能变了，extract.mjs 的切法要更新');
  }
}

// ---------------------------------------------------------------- 每个节点在哪个文件

// clang 的 JSON 里，位置上的 file 只在「和上一个写出来的位置不一样」时才出现。
// 所以要按文档顺序把所有节点走一遍，才知道每个声明在哪个文件。
// 走的同时把文件和偏移记在节点上（_file、_begin、_end）。
function trackLocations(node, state) {
  const visit = (loc) => {
    if (!loc) return;
    if (loc.spellingLoc || loc.expansionLoc) {
      visit(loc.spellingLoc);
      visit(loc.expansionLoc);
      return;
    }
    if (loc.file) state.file = loc.file;
  };
  const offsetOf = (loc) => (loc && loc.expansionLoc ? loc.expansionLoc.offset : loc && loc.offset);
  for (const key of Object.keys(node)) {
    const value = node[key];
    if (key === 'loc') {
      visit(value);
      node._file = state.file;
      node._offset = offsetOf(value);
    } else if (key === 'range') {
      visit(value.begin);
      node._begin = offsetOf(value.begin);
      visit(value.end);
      node._end = offsetOf(value.end);
    } else if (key === 'inner') {
      for (const child of value) if (child && typeof child === 'object') trackLocations(child, state);
    }
  }
}

// clang 给的偏移是字节数，不是字符数（头文件里有中文注释时两个不一样），
// 所以源码按字节存、按字节切
const sources = new Map();
function sourceBytes(file) {
  if (!sources.has(file)) {
    let bytes = Buffer.alloc(0);
    try { bytes = fs.readFileSync(file); } catch { /* 读不到就当没有 */ }
    sources.set(file, bytes);
  }
  return sources.get(file);
}
const slice = (file, from, to) => sourceBytes(file).subarray(Math.max(0, from), Math.max(0, to)).toString('utf8');

// ---------------------------------------------------------------- 类型

const QUALIFIERS = /\b(_Nullable|_Nonnull|_Null_unspecified|__kindof|__unsafe_unretained|__strong|__weak|__autoreleasing)\b/g;

// 可不可空：true / false，头文件没标是 null。
// block 的标注写在 (^ 后面，别的类型写在最后。
function nullabilityOf(qualType) {
  const block = qualType.match(/\(\^\s*(_Nullable|_Nonnull|_Null_unspecified)?\s*\)/);
  const found = block ? block[1] : (qualType.match(/(_Nullable|_Nonnull|_Null_unspecified)\s*(?:const)?\s*$/) || [])[1];
  if (found === '_Nullable') return true;
  if (found === '_Nonnull') return false;
  return null;
}

// 类型的写法：去掉可空标注和所有权修饰，去掉开头带下划线的全大写的宏名
// （clang 会把 UI_APPEARANCE_SELECTOR 这类宏印在类型前面）。
export function cleanType(qualType) {
  return qualType
    .replace(QUALIFIERS, '')
    .replace(/^(?:[A-Z][A-Z0-9]*_[A-Z0-9_]+\s+)+/, '')
    .replace(/^\s*const\s+/, '')
    .replace(/\s+/g, ' ')
    .replace(/\(\^\s+\)/g, '(^)')
    .replace(/\s+\*/g, ' *')
    .replace(/\*\s+(?=[*>),])/g, '*')
    .replace(/\s*\bconst$/, '')
    .replace(/\s+([>),])/g, '$1')
    .trim();
}

// 起了别名的类型本来是什么（CGFloat → double，CGRect → struct CGRect）。提取的
// 过程中见到一个记一个；extract() 开头换一张新的表（提取是一个一个做的，不并行）
let typedefs = new Map();
function noteType(type) {
  const written = cleanType(type.qualType);
  if (type.desugaredQualType && /^\w+$/.test(written)) {
    const actual = cleanType(type.desugaredQualType);
    if (actual !== written) typedefs.set(written, actual);
  }
  return written;
}

const typeOf = (type) => ({ type: noteType(type), nullable: nullabilityOf(type.qualType) });

// ---------------------------------------------------------------- 废弃和不可用

// clang 的 JSON 不带 availability 标注的内容（哪个平台、哪个版本），所以回头看源码。
// 只认 iOS 上的：API_DEPRECATED("…", macos(10.0, 10.5)) 不算。
function availability(node, textBefore) {
  const has = (kind) => (node.inner || []).some((c) => c.kind === kind);
  let deprecated = has('DeprecatedAttr');
  let unavailable = has('UnavailableAttr');
  const text = textBefore + declText(node);
  for (const [, args] of text.matchAll(/API_DEPRECATED(?:_WITH_REPLACEMENT)?\s*\(((?:[^()]|\([^()]*\))*)\)/g)) {
    if (/\bios\s*\(\s*[\d.]+\s*,\s*[\d.]+/.test(args)) deprecated = true;
  }
  if (/\b(NS_DEPRECATED_IOS|NS_CLASS_DEPRECATED_IOS|NS_ENUM_DEPRECATED_IOS)\s*\(/.test(text)) deprecated = true;
  for (const [, args] of text.matchAll(/\bNS_(?:CLASS_|ENUM_)?DEPRECATED\s*\(([^)]*)\)/g)) {
    const parts = args.split(',').map((s) => s.trim());
    if (parts.length >= 4 && !/NA/.test(parts[3])) deprecated = true;
  }
  if (/\bNS_UNAVAILABLE\b|\bUNAVAILABLE_ATTRIBUTE\b/.test(text)) unavailable = true;
  for (const [, args] of text.matchAll(/API_UNAVAILABLE\s*\(([^)]*)\)/g)) {
    if (/\bios\b/.test(args)) unavailable = true;
  }
  // 哪个 iOS 版本才有。生成的时候要拿它和部署目标比：更新的系统才有的符号要加两层保护
  const result = { deprecated, unavailable };
  for (const [, args] of text.matchAll(/API_AVAILABLE\s*\(((?:[^()]|\([^()]*\))*)\)/g)) {
    const ios = args.match(/\bios\s*\(\s*([\d.]+)/);
    if (ios) result.introduced = ios[1];
  }
  return result;
}

// 枚举里一个值在源码里的那一段：到括号外面的第一个逗号或右花括号为止
// （标注里的文字自己可能带逗号：API_DEPRECATED("用 A, 不要用 B", ios(2.0, 13.0))）
function constantText(node) {
  if (node._file === undefined || node._begin === undefined) return '';
  const text = slice(node._file, node._begin, node._begin + 600);
  let depth = 0;
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quoted) { if (ch === '\\') i += 1; else if (ch === '"') quoted = false; continue; }
    if (ch === '"') quoted = true;
    else if (ch === '(') depth += 1;
    else if (ch === ')') depth -= 1;
    else if (depth === 0 && (ch === ',' || ch === '}')) return text.slice(0, i);
  }
  return text;
}

// 一个声明在源码里的那一段：从它开头到后面第一个分号
function declText(node) {
  if (node._text !== undefined) return node._text;
  if (node._file === undefined || node._begin === undefined) return '';
  const from = node._begin;
  const semicolon = sourceBytes(node._file).indexOf(';', node._end === undefined ? from : node._end);
  return slice(node._file, from, semicolon === -1 ? from + 400 : semicolon + 1);
}

// 类和协议的标注写在 @interface 前面：往回看到上一个声明结束的地方
function textBeforeDecl(node) {
  if (node._file === undefined || node._begin === undefined) return '';
  const back = slice(node._file, node._begin - 600, node._begin);
  const cut = Math.max(back.lastIndexOf('@end'), back.lastIndexOf(';'), back.lastIndexOf('}'));
  return cut === -1 ? back : back.slice(cut + 1);
}

// ---------------------------------------------------------------- 成员

function describeProperty(node) {
  const getter = node.getter && node.getter.name !== node.name ? node.getter.name : null;
  const ownership = node.copy ? 'copy' : node.weak ? 'weak' : (node.strong || node.retain) ? 'strong'
    : (node.assign || node.unsafe_unretained) ? 'assign' : null;
  return { name: node.name, getter, ...typeOf(node.type), readonly: node.readonly === true,
           ownership, static: node.class === true, ...availability(node, '') };
}

function describeMethod(node) {
  const params = (node.inner || []).filter((c) => c.kind === 'ParmVarDecl')
    .map((p) => ({ name: p.name || '', ...typeOf(p.type) }));
  return { selector: node.name, static: node.instance !== true, returns: typeOf(node.returnType),
           params, ...availability(node, ''),
           designated: (node.inner || []).some((c) => c.kind === 'ObjCDesignatedInitializerAttr') };
}

function members(node) {
  const properties = [];
  const methods = [];
  for (const child of node.inner || []) {
    if (child.kind === 'ObjCPropertyDecl') properties.push(describeProperty(child));
    // isImplicit 的是属性自带的读写方法，属性已经列了
    else if (child.kind === 'ObjCMethodDecl' && !child.isImplicit) methods.push(describeMethod(child));
  }
  return { properties, methods };
}

// 协议里哪些方法是可选的：JSON 里没有，看源码里它前面最近的那个 @optional / @required
function markOptional(node, described) {
  const kids = (node.inner || []).filter((c) => c.kind === 'ObjCMethodDecl' && !c.isImplicit);
  kids.forEach((child, i) => {
    const before = slice(node._file || '', node._begin || 0, child._begin || 0);
    described.methods[i].optional = before.lastIndexOf('@optional') > before.lastIndexOf('@required');
  });
}

// ---------------------------------------------------------------- 枚举的数值

function evaluate(node, env, unsigned) {
  const wrap = (v) => (v === null ? null : unsigned ? BigInt.asUintN(64, v) : BigInt.asIntN(64, v));
  const inner = (i) => (node.inner && node.inner[i] ? evaluate(node.inner[i], env, unsigned) : null);
  switch (node.kind) {
    case 'ConstantExpr':
      return node.value !== undefined ? BigInt(node.value) : inner(0);
    case 'IntegerLiteral':
      return BigInt(node.value);
    case 'CharacterLiteral':
      return BigInt(node.value);
    case 'ImplicitCastExpr': case 'ParenExpr': case 'CStyleCastExpr':
      return inner(0);
    case 'DeclRefExpr': {
      const name = node.referencedDecl && node.referencedDecl.name;
      return env.has(name) ? env.get(name) : null;
    }
    case 'UnaryOperator': {
      const v = inner(0);
      if (v === null) return null;
      return wrap(node.opcode === '-' ? -v : node.opcode === '~' ? ~v : node.opcode === '+' ? v : null);
    }
    case 'BinaryOperator': {
      const a = inner(0);
      const b = inner(1);
      if (a === null || b === null) return null;
      const ops = { '<<': () => a << b, '>>': () => a >> b, '|': () => a | b, '&': () => a & b,
                    '^': () => a ^ b, '+': () => a + b, '-': () => a - b, '*': () => a * b };
      return ops[node.opcode] ? wrap(ops[node.opcode]()) : null;
    }
    default:
      return null;
  }
}

function describeEnum(node) {
  const underlying = node.fixedUnderlyingType ? node.fixedUnderlyingType.qualType : null;
  const unsigned = /unsigned/.test((node.fixedUnderlyingType || {}).desugaredQualType || underlying || '');
  const env = new Map();
  let previous = -1n;
  const constants = [];
  for (const child of node.inner || []) {
    if (child.kind !== 'EnumConstantDecl') continue;
    const init = (child.inner || []).find((c) => !/Attr$/.test(c.kind));
    let value = init ? evaluate(init, env, unsigned) : (previous === null ? null : previous + 1n);
    env.set(child.name, value);
    previous = value;
    const constant = { name: child.name, value: value === null ? null : String(value) };
    const { deprecated, unavailable } = availability({ ...child, _text: constantText(child) }, '');
    if (deprecated) constant.deprecated = true;
    if (unavailable) constant.unavailable = true;
    constants.push(constant);
  }
  return { name: node.name || null, type: underlying,
           options: (node.inner || []).some((c) => c.kind === 'FlagEnumAttr'),
           ...availability(node, textBeforeDecl(node)), constants };
}

// ---------------------------------------------------------------- 入口

/**
 * 提取一个框架的 API 描述。
 * @param {object} input
 * @param {string} input.framework 框架名，只写进结果里
 * @param {string} input.source 交给 clang 的文件（头文件，或者一个引入总头的 .m）
 * @param {(file: string, offset: number) => boolean} input.owns 这个位置上的声明归不归这个框架
 * @param {string[]} [input.clangArgs]
 */
export async function extract({ framework, source, owns, clangArgs = [] }) {
  const classes = new Map();
  const pendingCategories = [];
  const protocols = new Map();
  const enums = [];
  const structs = [];
  const functions = [];
  const typedStrings = new Map();
  const constants = [];
  const state = { file: undefined };
  typedefs = new Map();

  for await (const node of topLevelDecls(source, clangArgs)) {
    trackLocations(node, state);
    if (node._file === undefined || !owns(node._file, node._offset || 0)) continue;

    if (node.kind === 'ObjCInterfaceDecl') {
      // @class Foo; 这样的前向声明：它的范围到名字就结束了（定义的范围到 @end）
      if (node._end === node._offset) continue;
      const body = members(node);
      classes.set(node.name, {
        name: node.name, super: (node.super && node.super.name) || null,
        protocols: (node.protocols || []).map((p) => p.name),
        header: path.basename(node._file), ...availability(node, textBeforeDecl(node)), ...body });
    } else if (node.kind === 'ObjCCategoryDecl') {
      pendingCategories.push({ class: node.interface ? node.interface.name : null, name: node.name || '',
                               protocols: (node.protocols || []).map((p) => p.name),
                               header: path.basename(node._file), ...members(node) });
    } else if (node.kind === 'ObjCProtocolDecl') {
      if (node._end === node._offset) continue;   // @protocol Foo; 前向声明
      const body = members(node);
      markOptional(node, body);
      protocols.set(node.name, { name: node.name, protocols: (node.protocols || []).map((p) => p.name),
                                 header: path.basename(node._file), ...body });
    } else if (node.kind === 'EnumDecl') {
      if ((node.inner || []).some((c) => c.kind === 'EnumConstantDecl')) enums.push(describeEnum(node));
    } else if (node.kind === 'RecordDecl') {
      const fields = (node.inner || []).filter((c) => c.kind === 'FieldDecl')
        .map((f) => ({ name: f.name, type: noteType(f.type) }));
      if (node.name && node.completeDefinition && fields.length > 0) structs.push({ name: node.name, fields });
    } else if (node.kind === 'FunctionDecl') {
      const signature = node.type.qualType;
      functions.push({ name: node.name,
                       returns: { type: cleanType(signature.slice(0, signature.indexOf('('))) },
                       params: (node.inner || []).filter((c) => c.kind === 'ParmVarDecl')
                         .map((p) => ({ name: p.name || '', type: noteType(p.type) })),
                       inline: node.inline === true, ...availability(node, '') });
    } else if (node.kind === 'TypedefDecl') {
      // typedef 自己也记：枚举和结构体的类型名就是这么来的
      if (node.name && node.type) typedefs.set(node.name, cleanType(node.type.desugaredQualType || node.type.qualType));
      if ((node.inner || []).some((c) => c.kind === 'SwiftNewTypeAttr')) {
        typedStrings.set(node.name, { name: node.name, type: cleanType(node.type.qualType), constants: [] });
      }
    } else if (node.kind === 'VarDecl') {
      const type = noteType(node.type);
      constants.push({ name: node.name, type });
      if (typedStrings.has(type)) typedStrings.get(type).constants.push(node.name);
    }
  }

  // 给自己的类写的分类并进类里；给别人的类写的单独列
  const categories = [];
  for (const category of pendingCategories) {
    const target = classes.get(category.class);
    if (!target) { categories.push(category); continue; }
    target.properties.push(...category.properties);
    target.methods.push(...category.methods);
    for (const p of category.protocols) if (!target.protocols.includes(p)) target.protocols.push(p);
  }

  // 只留别名和本来的类型不一样的
  const aliases = {};
  for (const name of [...typedefs.keys()].sort()) if (typedefs.get(name) !== name) aliases[name] = typedefs.get(name);
  return { framework, classes: [...classes.values()], categories, protocols: [...protocols.values()],
           enums, structs, functions, typedStrings: [...typedStrings.values()], constants, typedefs: aliases };
}

/** iOS 模拟器 SDK 的路径 */
export function sdkPath() {
  return execFileSync('xcrun', ['--sdk', 'iphonesimulator', '--show-sdk-path'], { encoding: 'utf8' }).trim();
}

/** 提取 SDK 里的一个框架：引入它的总头，只收它自己 Headers 目录下的声明 */
export async function extractFramework(framework, sdk = sdkPath()) {
  const headers = path.join(fs.realpathSync(sdk), 'System/Library/Frameworks', framework + '.framework', 'Headers');
  if (!fs.existsSync(headers)) throw new Error('SDK 里没有 ' + framework + '.framework 的头文件：' + headers);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nacre-bindgen-'));
  const source = path.join(dir, framework + '.m');
  fs.writeFileSync(source, '#import <' + framework + '/' + framework + '.h>\n');
  try {
    const marker = '/' + framework + '.framework/Headers/';
    const api = await extract({
      framework, source,
      owns: (file) => file.includes(marker),
      clangArgs: ['-isysroot', sdk, '-target', 'arm64-apple-ios26.0-simulator'],
    });
    const version = execFileSync('xcrun', ['--sdk', 'iphonesimulator', '--show-sdk-version'], { encoding: 'utf8' }).trim();
    return { sdk: 'iPhoneSimulator ' + version, ...api };
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}
