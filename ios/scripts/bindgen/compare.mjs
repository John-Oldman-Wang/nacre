// bindgen 的对照：机械规则算出来的 API，和手写的类型定义差在哪。
//
// 它回答两个问题：机械规则离手写的结果有多远（名字对不上的有多少、是哪些），
// 头文件里有而我们还没接的有多少。结果是「兜底」怎么做的依据。
import { enumValues, methodShape, propertyName, typeKind } from './rules.mjs';

// 只有 init… 是构造方法。造对象的类方法（+buttonWithType:）在 JS 里是普通的静态方法
const isConstructor = (m) => !m.static && /^init($|[A-Z])/.test(m.selector);

function buildIndex(apis) {
  const index = { classes: new Map(), categories: new Map(), protocols: new Map(), enums: new Map(),
                  typedStrings: new Map(), structs: new Set(), typedefs: new Map() };
  for (const api of apis) {
    for (const c of api.classes) if (!index.classes.has(c.name)) index.classes.set(c.name, { ...c, framework: api.framework });
    for (const c of api.categories) {
      if (!index.categories.has(c.class)) index.categories.set(c.class, []);
      index.categories.get(c.class).push(c);
    }
    for (const p of api.protocols) if (!index.protocols.has(p.name)) index.protocols.set(p.name, p);
    for (const e of api.enums) if (e.name && !index.enums.has(e.name)) index.enums.set(e.name, e);
    for (const t of api.typedStrings) if (!index.typedStrings.has(t.name)) index.typedStrings.set(t.name, { ...t, constants: [] });
    for (const s of api.structs) index.structs.add(s.name);
    for (const [name, actual] of Object.entries(api.typedefs || {})) if (!index.typedefs.has(name)) index.typedefs.set(name, actual);
  }
  // 一个类型的常量可以在别的框架里（NSAttributedStringKey 在 Foundation，它的值在 UIKit），
  // 所以常量是全部框架收齐之后再按类型名归的
  for (const api of apis) {
    for (const c of api.constants) if (index.typedStrings.has(c.type)) index.typedStrings.get(c.type).constants.push(c.name);
  }
  return index;
}

// 一个类自己声明的全部成员：类本身、别的框架给它写的分类、它采纳的协议
function ownMembers(index, cls) {
  const properties = [...cls.properties];
  const methods = [...cls.methods];
  const protocolNames = [...cls.protocols];
  for (const category of index.categories.get(cls.name) || []) {
    properties.push(...category.properties);
    methods.push(...category.methods);
    protocolNames.push(...category.protocols);
  }
  const seen = new Set();
  while (protocolNames.length > 0) {
    const name = protocolNames.pop();
    if (seen.has(name) || !index.protocols.has(name)) continue;
    seen.add(name);
    const protocol = index.protocols.get(name);
    properties.push(...protocol.properties);
    methods.push(...protocol.methods);
    protocolNames.push(...protocol.protocols);
  }
  return { properties, methods };
}

// 机械规则给一个类算出来的样子
function generatedShape(index, cls) {
  const { properties, methods } = ownMembers(index, cls);
  const shape = { properties: new Map(), methods: new Map(), constructors: [], skipped: [] };
  for (const p of properties) {
    const name = propertyName(p);
    if (p.deprecated || p.unavailable) { shape.skipped.push({ kind: 'property', name }); continue; }
    if (!shape.properties.has(name)) shape.properties.set(name, { readonly: p.readonly, static: p.static, objc: p.name, type: p.type });
  }
  for (const m of methods) {
    const { name, options } = methodShape(m.selector);
    if (m.deprecated || m.unavailable) { shape.skipped.push({ kind: 'method', name }); continue; }
    if (isConstructor(m)) { shape.constructors.push(m.selector); continue; }
    const entry = shape.methods.get(name) || { static: m.static, selectors: [], options: [] };
    entry.selectors.push(m.selector);
    for (const key of options) if (!entry.options.includes(key)) entry.options.push(key);
    shape.methods.set(name, entry);
  }
  return shape;
}

// 手写的一个成员在机械规则那边找不到同名的：猜它是不是改了名
function guessRenamed(kind, name, shape, taken) {
  const fits = (candidate) => candidate === name ||
    (candidate.startsWith(name) && /[A-Z]/.test(candidate[name.length])) ||
    candidate === 'is' + name[0].toUpperCase() + name.slice(1);
  const fromMethods = [...shape.methods].filter(([n]) => !taken.has('method ' + n) && fits(n))
    .map(([n, m]) => ({ key: 'method ' + n, label: [...m.selectors].sort((a, b) => a.length - b.length)[0] }));
  const fromProperties = [...shape.properties].filter(([n, p]) => !taken.has('property ' + n) && (fits(n) || fits(p.objc)))
    .map(([n]) => ({ key: 'property ' + n, label: n }));
  const ordered = kind === 'method' ? [...fromMethods, ...fromProperties] : [...fromProperties, ...fromMethods];
  ordered.sort((a, b) => a.label.length - b.label.length);
  const first = (kind === 'method' ? fromMethods : fromProperties).sort((a, b) => a.label.length - b.label.length)[0] || ordered[0];
  return first || null;
}

function compareClass(index, hand, cls) {
  const shape = generatedShape(index, cls);
  // 父类链上机械规则给的成员：手写的把父类的成员写在了子类上时用
  const inherited = [];
  for (let up = index.classes.get(cls.super); up; up = index.classes.get(up.super)) inherited.push(generatedShape(index, up));

  const out = { name: cls.name, framework: cls.framework, same: [], different: [], handOnly: [],
                generatedOnly: [], skipped: shape.skipped, constructors: shape.constructors };
  const taken = new Set();
  const unmatched = [];

  for (const [name, p] of hand.properties) {
    const g = shape.properties.get(name);
    if (g) {
      taken.add('property ' + name);
      if (g.readonly !== p.readonly) out.different.push({ kind: 'property', name, what: 'readonly', hand: p.readonly, generated: g.readonly });
      else if (g.static !== p.static) out.different.push({ kind: 'property', name, what: 'static', hand: p.static, generated: g.static });
      else out.same.push({ kind: 'property', name });
    } else if (inherited.some((s) => s.properties.has(name))) out.same.push({ kind: 'property', name, inherited: true });
    else unmatched.push({ kind: 'property', name });
  }
  for (const [name, m] of hand.methods) {
    const g = shape.methods.get(name);
    if (g) {
      taken.add('method ' + name);
      const missing = m.options.filter((k) => !g.options.includes(k));
      if (missing.length > 0) out.different.push({ kind: 'method', name, what: 'options', hand: m.options, generated: g.options });
      else out.same.push({ kind: 'method', name, selectors: g.selectors });
    } else if (inherited.some((s) => s.methods.has(name))) out.same.push({ kind: 'method', name, inherited: true });
    else unmatched.push({ kind: 'method', name });
  }
  for (const member of unmatched) {
    const guess = guessRenamed(member.kind, member.name, shape, taken);
    if (guess) taken.add(guess.key);
    const deprecated = shape.skipped.some((s) => s.name === member.name);
    out.handOnly.push({ ...member, guess: guess ? guess.label : null, deprecated });
  }
  for (const [name] of shape.properties) if (!taken.has('property ' + name)) out.generatedOnly.push({ kind: 'property', name });
  for (const [name, m] of shape.methods) if (!taken.has('method ' + name)) out.generatedOnly.push({ kind: 'method', name, selectors: m.selectors });
  return out;
}

function compareEnum(name, handValues, decl) {
  const generated = enumValues(decl);
  // 位掩码里数值是 0 的在 JS 里是空数组，废弃的不接：都不算头文件里多出来的名字
  const listed = generated.values.filter((v) => !v.zero && !v.deprecated && !v.unavailable);
  const names = [...new Set(listed.map((v) => v.js).concat(generated.values.filter((v) => v.zero || v.deprecated || v.unavailable)
    .map((v) => v.js).filter((js) => handValues.includes(js))))];
  return { name, prefixIsTypeName: generated.prefixIsTypeName,
           same: handValues.filter((v) => names.includes(v)),
           handOnly: handValues.filter((v) => !names.includes(v)),
           generatedOnly: names.filter((v) => !handValues.includes(v)),
           aliases: generated.values.filter((v) => v.aliasOf !== null).map((v) => v.js) };
}

/**
 * @param {object[]} apis extract() 的结果，一个框架一份
 * @param {{ classes: Map<string, any>, enums: Map<string, string[]> }} hand readHandwritten() 的结果
 */
export function compare(apis, hand) {
  const index = buildIndex(apis);
  const classes = [];
  const handClassesNotInHeaders = [];
  for (const [name, entry] of hand.classes) {
    const cls = index.classes.get(name);
    if (cls) classes.push(compareClass(index, entry, cls));
    else handClassesNotInHeaders.push(name);
  }
  const enums = [];
  const handEnumsNotInHeaders = [];
  for (const [name, values] of hand.enums) {
    const decl = index.enums.get(name) ||
      (index.typedStrings.has(name) ? { name, constants: index.typedStrings.get(name).constants.map((c) => ({ name: c, value: null })) } : null);
    if (decl) enums.push(compareEnum(name, values, decl));
    else handEnumsNotInHeaders.push(name);
  }
  const sum = (list, key) => list.reduce((n, item) => n + item[key].length, 0);
  const totals = { classes: classes.length, same: sum(classes, 'same'), different: sum(classes, 'different'),
                   handOnly: sum(classes, 'handOnly'), generatedOnly: sum(classes, 'generatedOnly'),
                   skipped: sum(classes, 'skipped'), constructors: sum(classes, 'constructors'),
                   renamed: classes.reduce((n, c) => n + c.handOnly.filter((m) => m.guess !== null).length, 0),
                   enums: enums.length, enumSame: sum(enums, 'same'), enumHandOnly: sum(enums, 'handOnly'),
                   enumGeneratedOnly: sum(enums, 'generatedOnly') };
  return { classes, enums, handClassesNotInHeaders, handEnumsNotInHeaders, totals };
}

/** 整个框架的规模，和机械规则认得出多少种类型 */
export function coverage(apis, hand) {
  const index = buildIndex(apis);
  const ctx = { enums: index.enums, structs: index.structs, classes: new Set(index.classes.keys()),
                typedStrings: new Set(index.typedStrings.keys()), typedefs: index.typedefs };
  const rows = [];
  for (const api of apis) {
    const row = { framework: api.framework, classes: api.classes.length, bound: 0, properties: 0, methods: 0,
                  deprecated: 0, enums: api.enums.length, protocols: api.protocols.length,
                  functions: api.functions.length, typesMapped: 0, typesTotal: 0, unmapped: new Map() };
    const note = (type) => {
      row.typesTotal += 1;
      if (typeKind(type, ctx) === 'unmapped') row.unmapped.set(type, (row.unmapped.get(type) || 0) + 1);
      else row.typesMapped += 1;
    };
    for (const cls of api.classes) {
      if (hand.classes.has(cls.name)) row.bound += 1;
      for (const p of cls.properties) {
        if (p.deprecated || p.unavailable) { row.deprecated += 1; continue; }
        row.properties += 1;
        note(p.type);
      }
      for (const m of cls.methods) {
        if (m.deprecated || m.unavailable) { row.deprecated += 1; continue; }
        row.methods += 1;
        note(m.returns.type);
        for (const param of m.params) note(param.type);
      }
    }
    rows.push(row);
  }
  return rows;
}
