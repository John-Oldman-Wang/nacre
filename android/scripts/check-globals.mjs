#!/usr/bin/env node
// Android 挂到全局的名字不能和保留的名字重复。
//
// 规矩（2026-11-28 定，见 docs/project.md 第 4 节「原生类的写法」）：Java 的类用简单类名挂在全局，
// 简单类名撞了保留的名字，在前面加 A（ImageDecoder → AImageDecoder）。保留的名字有三种：
//
// - JS 内置的、Web 全局的：acceptance/ 钉住的 TypeScript 自带的 lib.es*.d.ts、lib.dom.d.ts、
//   lib.webworker.d.ts 里 declare 的全局
// - 我们自己上层定义的：packages/types/nacre.d.ts 里 declare 的全局
//
// Android 的名字从 android/runtime/src/main/builtin/parts/ 里的 defineNativeClass('X') 和
// define(globalThis, 'X') 收。和保留名同名、而且意思就是那一个的（照 Web 实现的 requestAnimationFrame，
// 上层自己的 application），列在 SAME_THING 里。
//
// 用法：node android/scripts/check-globals.mjs（要先在 acceptance/ 里 npm ci，TypeScript 装在那里）

import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const tsLib = join(root, 'acceptance', 'node_modules', 'typescript', 'lib');
const partsDir = join(root, 'android', 'runtime', 'src', 'main', 'builtin', 'parts');
const nacreTypes = join(root, 'packages', 'types', 'nacre.d.ts');

// 和保留名同名、意思也就是那一个的：不是 Java 的类，不加 A
const SAME_THING = new Set([
  'requestAnimationFrame', // Web 的逐帧回调，照 Web 实现
  'cancelAnimationFrame',
  'Application', // 上层的 application，nacre.d.ts 里有
  'application',
]);

if (!existsSync(join(tsLib, 'lib.dom.d.ts'))) {
  console.error('check-globals: 找不到 TypeScript 的 lib.dom.d.ts，先在 acceptance/ 里跑 npm ci');
  process.exit(2);
}

// declare var X、declare function X、declare class X、declare const X……
function declaredGlobals(text) {
  const names = new Set();
  const re = /^declare\s+(?:var|let|const|function|class|abstract\s+class)\s+([A-Za-z_$][\w$]*)/gm;
  for (const m of text.matchAll(re)) names.add(m[1]);
  return names;
}

const reserved = new Map(); // 名字 → 从哪来
const tsFiles = readdirSync(tsLib).filter((f) => /^lib\.(es|decorators|dom|webworker)[\w.]*\.d\.ts$/.test(f)).sort();
for (const f of tsFiles) {
  const from = f.startsWith('lib.es') || f.startsWith('lib.decorators') ? 'JS 内置' : 'Web 全局';
  for (const name of declaredGlobals(readFileSync(join(tsLib, f), 'utf8'))) {
    if (!reserved.has(name)) reserved.set(name, from);
  }
}
for (const name of declaredGlobals(readFileSync(nacreTypes, 'utf8'))) {
  if (!reserved.has(name)) reserved.set(name, '上层（nacre.d.ts）');
}

const defined = []; // { name, file }
for (const f of readdirSync(partsDir).filter((x) => x.endsWith('.js')).sort()) {
  const text = readFileSync(join(partsDir, f), 'utf8');
  for (const re of [/defineNativeClass\('([A-Za-z_$][\w$]*)'/g, /define\(globalThis, '([A-Za-z_$][\w$]*)'/g]) {
    for (const m of text.matchAll(re)) defined.push({ name: m[1], file: f });
  }
}

const clashes = defined.filter(({ name }) => reserved.has(name) && !SAME_THING.has(name));
if (clashes.length > 0) {
  for (const { name, file } of clashes) {
    console.error(`check-globals: ${file} 挂了 ${name}，和保留名重复（${reserved.get(name)}）；Java 的类撞了名在前面加 A：A${name}`);
  }
  process.exit(1);
}
const unused = [...SAME_THING].filter((name) => !defined.some((d) => d.name === name));
if (unused.length > 0) {
  console.error(`check-globals: SAME_THING 里的 ${unused.join('、')} Android 已经不挂了，从表里删掉`);
  process.exit(1);
}
console.log(`check-globals: Android 挂到全局的 ${defined.length} 个名字都不撞保留名（保留名 ${reserved.size} 个）`);
