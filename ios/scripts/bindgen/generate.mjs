// bindgen 的第三段：出初稿。照手写的格式写出一个域的全套文件：
//
//   ios/Runtime/Bridge/Nacre<域>.mm          原生：一个域，登记一张表
//   ios/Runtime/Builtin/parts/50-<域>.js     内置脚本：一个 part
//   packages/types/ios/<域>.d.ts             类型定义
//   acceptance/src/steps/<域>.js             验收：每个属性读写往返一遍
//   docs/api/<域>.md                         成员清单：只有名字和类型
//
// **生成一次，之后它们就是普通的手写文件**（2026-11-18 定）：直接改，bindgen 不会再碰。
// 事件、认不出所有权的方法、要收紧的成员、默认值的断言、文档里的效果，都是生成之后
// 人接着写的。写法照 docs/internals/adding-classes.md，所以走同一套登记和 check-api.sh。
//
// 一个域里的类有两种：没接过的，整个类写出来；已经手写过的，只写它还没有的成员
// （往原型上挂，类型用声明合并）。能写出来的成员有两样：
//   属性  布尔、数、字符串、枚举、位掩码、结构体、颜色，以及值是另一个原生对象的
//         （那个类得是 JS 里有的）
//   方法  实例方法，参数和返回值是布尔、数、字符串、枚举、位掩码、结构体，或者另一个原生对象。
//         带对象参数的要记所有权：按方法名的动词归类，认不出的不写（见 decideOwnership）
// 别的（数组、回调、类方法、事件）不写，在结果里列出来、说明原因——那是留给人的。
import { enumValues, lowerFirst, methodShape, propertyName, typeKind } from './rules.mjs';

const HEADER = '初稿是 bindgen 生成的（docs/internals/bindgen.md）。之后它是普通的手写文件：直接改，bindgen 不会再碰它。';
const pascal = (domain) => domain.split('-').map((part) => part[0].toUpperCase() + part.slice(1)).join('');
const INTEGERS = /^(unsigned |signed )?(char|short|int|long|long long)$/;
const SKIP_REASON = { object: '对象', array: '数组', block: '回调',
                      delegate: '委托', stringEnum: '字符串常量', unmapped: '认不出的类型', void: '认不出的类型',
                      errorOut: '认不出的类型' };
// 方法的参数和返回值能生成的类型。颜色在属性上能生成，在方法上还不行：
// 它过桥的是对象，方法这条通道现在只走值
const METHOD_KINDS = new Set(['boolean', 'number', 'string', 'enum', 'options', 'struct']);
// JS 里有对应的类的结构体（docs/internals/structs.md）。每一个要四样东西：JS 一侧核对字段
// 用的字段表、把读出来的普通对象包成类的函数、原生一侧的两个互转函数；外加类型定义里
// 写的时候收的那个类型（实例或者带同样字段的普通对象）
const STRUCTS = {
  CGRect: { fields: 'RECT_FIELDS', wrap: 'toRect', toJSON: 'RectToJSON', fromJSON: 'JSONToRect', like: 'CGRectLike',
            names: ['x', 'y', 'width', 'height'] },
  CGPoint: { fields: 'POINT_FIELDS', wrap: 'toPoint', toJSON: 'PointToJSON', fromJSON: 'JSONToPoint', like: 'CGPointLike',
             names: ['x', 'y'] },
  CGSize: { fields: 'SIZE_FIELDS', wrap: 'toSize', toJSON: 'SizeToJSON', fromJSON: 'JSONToSize', like: 'CGSizeLike',
            names: ['width', 'height'] },
  UIEdgeInsets: { fields: 'INSETS_FIELDS', wrap: 'toInsets', toJSON: 'InsetsToJSON', fromJSON: 'JSONToInsets',
                  like: 'UIEdgeInsetsLike', names: ['top', 'left', 'bottom', 'right'] },
  NSDirectionalEdgeInsets: { fields: 'DIRECTIONAL_INSETS_FIELDS', wrap: 'toDirectionalInsets',
                             toJSON: 'DirectionalInsetsToJSON', fromJSON: 'JSONToDirectionalInsets',
                             like: 'NSDirectionalEdgeInsetsLike', names: ['top', 'leading', 'bottom', 'trailing'] },
  CGAffineTransform: { fields: 'TRANSFORM_FIELDS', wrap: 'toTransform', toJSON: 'TransformToJSON',
                       fromJSON: 'JSONToTransform', like: 'CGAffineTransform', names: ['a', 'b', 'c', 'd', 'tx', 'ty'] },
  CAFrameRateRange: { fields: 'FRAME_RATE_FIELDS', wrap: 'toFrameRateRange', toJSON: 'FrameRateRangeToJSON',
                      fromJSON: 'JSONToFrameRateRange', like: 'CAFrameRateRangeLike',
                      names: ['minimum', 'maximum', 'preferred'] },
};
// 一个结构体类型在 JS 里是哪个类。没有对应的返回 { name, known: false }
function structOf(type, ctx) {
  const actual = ((ctx.typedefs.get(type) || '').match(/^struct (\w+)$/) || [])[1];
  const name = STRUCTS[type] ? type : STRUCTS[actual] ? actual : type;
  return STRUCTS[name] ? { name, known: true, ...STRUCTS[name] } : { name, known: false };
}
const noStruct = (name) => '结构体 ' + name + ' 在 JS 里没有对应的类';
const NO_READER = '补充表里没写这个类型怎么读';
const UNKNOWN_OWNERSHIP = '带对象，认不出该怎么记所有权（要写进补充表）';
// 只是看一眼参数、不会留住它的方法
const QUERY = /^(is|can|should|has|contains|does|index|convert|compare)([A-Z]|$)/;
const upperFirst = (text) => text[0].toUpperCase() + text.slice(1);
const classOf = (type) => (type.match(/^(\w+) \*$/) || [])[1] || null;
const RESERVED = new Set(['default', 'class', 'new', 'delete', 'function', 'var', 'in', 'this', 'switch', 'case',
                          'for', 'while', 'do', 'if', 'else', 'return', 'typeof', 'void', 'with', 'options', 'o']);

const newerThan = (version, target) => {
  const a = version.split('.').map(Number);
  const b = target.split('.').map(Number);
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
    if ((a[i] || 0) !== (b[i] || 0)) return (a[i] || 0) > (b[i] || 0);
  }
  return false;
};

/**
 * @param {object} input
 * @param {string} input.domain 域的名字，小写、用连字符（color-well）。文件名、原生的函数名、枚举表的名字都跟着它
 * @param {string} [input.partPrefix] 内置脚本文件名开头的序号，默认 50。这个域用到的手写的类有在 50 这一档
 *   定义的，就得排在它后面
 * @param {object} input.api extract() 的结果，一个框架
 * @param {string[]} input.classes 清单：这个框架里要生成的类
 * @param {{ classes: Map<string, any>, enums: Map<string, string[]> }} input.hand 手写的那一侧
 * @param {string} input.deploymentTarget 支持的最低 iOS 版本。更新的系统才有的成员不生成
 * @param {{ types?: Record<string, { ts: string, fromNames: string, names: string, namesIn?: string }> }} [input.overrides]
 *   补充表。types 是手写的那一侧已经有自己的转换的位掩码类型（UIControlState：normal 是 0，
 *   但它是一个名字），生成的照着用那几个函数和那个类型写法，不另起一张表。
 *   methods 是带对象的方法里动词认不出该怎么记所有权的：{ 类名: { selector: { owns, key / group, why } } }，
 *   owns 是 set（记一条，key 是位置）/ add（往 group 里加）/ remove（从 group 里去掉）/ none（不记，要写 why）。
 *   exclude 是不要生成的成员：{ 类名: [JS 里的名字] }。
 *   protocols 是「这个类实现了这个协议上的成员」：{ 类名: [协议名] }。头文件看不出一个类到底实现了协议里
 *   哪些可选的成员，所以协议上的成员不写在这里就不生成
 * @returns {{ files: Record<string, string>, report: { class: string, generated: string[], methods: string[],
 *             skipped: { kind: 'property' | 'method', name: string, reason: string }[] }[] }}
 */
export function generate({ api, domain: domainName, partPrefix = '50', classes, hand, deploymentTarget, overrides = {} }) {
  if (!/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(domainName || '')) {
    throw new Error('域的名字要小写、用连字符分开（比如 color-well），现在是 ' + JSON.stringify(domainName));
  }
  const framework = api.framework;
  // 原生那一侧名字的前缀。枚举表的函数不是 static 的，两个域都用到同一个枚举时名字
  // 不能撞，所以表名也带着它
  const domain = pascal(domainName);
  const byName = new Map(api.classes.map((c) => [c.name, c]));
  const enumDecls = new Map(api.enums.filter((e) => e.name).map((e) => [e.name, e]));
  const ctx = { enums: enumDecls, structs: new Set(api.structs.map((s) => s.name)),
                classes: new Set([...byName.keys(), ...hand.classes.keys()]),
                typedStrings: new Set(api.typedStrings.map((t) => t.name)),
                typedefs: new Map(Object.entries(api.typedefs || {})) };

  const usedEnums = new Map();   // 类型名 → [{ js, objc }]
  const usedMasks = new Map();   // 类型名 → 位掩码的表和它的几个函数名
  const maskOf = (type) => {
    const name = enumTypeName(type, ctx);
    if (!usedMasks.has(name)) usedMasks.set(name, maskTable(name, enumDecls, hand, (overrides.types || {})[name], domain));
    return usedMasks.get(name);
  };
  const plans = [];
  const report = [];

  // 手写的那一侧一个类上已经有的名字（它自己声明的，和用声明合并加上去的）
  const handNames = (name) => {
    const entry = hand.classes.get(name);
    return entry ? [...(entry.properties || new Map()).keys(), ...(entry.methods || new Map()).keys()] : [];
  };
  const superOf = (name) => (byName.has(name) ? byName.get(name).super : (hand.classes.get(name) || {}).super) || null;
  const depthOf = (name) => {
    let depth = 0;
    for (let up = superOf(name); up; up = superOf(up)) depth += 1;
    return depth;
  };
  // 父类先算：子类要知道父类上已经有哪些名字（手写的，和这一次生成的）。头文件里子类
  // 重复声明父类的成员是常事（UIImageView 又写了一遍 userInteractionEnabled）
  const generatedNames = new Map();
  const order = [...classes].sort((x, y) => depthOf(x) - depthOf(y));

  for (const name of order) {
    const cls = byName.get(name);
    if (!cls) throw new Error(name + '：' + framework + ' 的头文件里没有这个类');
    // 已经手写过的类只补它没有的成员；没接过的整个类生成出来
    const extend = hand.classes.has(name);
    if (!extend && !hand.classes.has(cls.super) && !classes.includes(cls.super)) {
      throw new Error(name + '：父类 ' + cls.super + ' 还没接，JS 那一侧没有可以继承的类');
    }
    if (!extend && cls.methods.some((m) => m.selector === 'init' && m.unavailable)) {
      throw new Error(name + '：init 不可用，要用别的方法造对象，现在还不生成方法');
    }
    const taken = new Set(handNames(name));
    for (let up = superOf(name); up; up = superOf(up)) {
      for (const n of handNames(up)) taken.add(n);
      for (const n of generatedNames.get(up) || []) taken.add(n);
    }
    const excluded = new Set((overrides.exclude || {})[name] || []);
    const members = { ...cls, properties: [...cls.properties], methods: [...cls.methods] };
    for (const protocolName of (overrides.protocols || {})[name] || []) {
      const protocol = api.protocols.find((p) => p.name === protocolName);
      if (!protocol) throw new Error(name + '：补充表里写的协议 ' + protocolName + ' 在 ' + framework + ' 的头文件里没有');
      members.properties.push(...protocol.properties);
      members.methods.push(...protocol.methods);
    }
    const plan = { name, super: cls.super, extend, properties: [], methods: [] };
    const entry = { class: name, extended: extend, generated: [], methods: [], skipped: [] };
    for (const p of members.properties) {
      const js = propertyName(p);
      // 手写的已经有了（或者这个名字已经生成过一遍）：不动它，也不算「没生成」
      if (taken.has(js) || entry.generated.includes(js)) continue;
      const skip = (reason) => entry.skipped.push({ kind: 'property', name: js, reason });
      if (excluded.has(js)) { skip('补充表里排除了'); continue; }
      if (p.deprecated) { skip('废弃'); continue; }
      if (p.unavailable) { skip('不可用'); continue; }
      if (p.static) { skip('类属性'); continue; }
      if (p.introduced && newerThan(p.introduced, deploymentTarget)) { skip('要 iOS ' + p.introduced); continue; }
      const kind = typeKind(p.type, ctx);
      // 值是另一个原生对象：它的类得是 JS 里有的（手写的，或者也在清单里），
      // 不然读出来没有类可以包它
      const objectClass = kind === 'object' ? (p.type.match(/^(\w+) \*$/) || [])[1] : null;
      if (kind === 'object' && objectClass && !hand.classes.has(objectClass) && !classes.includes(objectClass)) {
        skip('它的类 ' + objectClass + ' 还没接');
        continue;
      }
      if (SKIP_REASON[kind] && !(kind === 'object' && objectClass)) { skip(SKIP_REASON[kind]); continue; }
      const item = { js, objc: p.name, getter: p.getter || p.name, kind, readonly: p.readonly,
                     nullable: p.nullable !== false, type: p.type };
      if (kind === 'object') {
        item.objectClass = objectClass;
        // 所有权照头文件里写的：weak / assign 是回边，不记；其余的（strong、copy、
        // 没写的只读属性）原生持有它，JS 一侧也记一条
        item.owned = p.ownership !== 'weak' && p.ownership !== 'assign';
      }
      if (kind === 'number') {
        const actual = ctx.typedefs.get(p.type) || p.type;
        item.integer = INTEGERS.test(actual);
        item.single = actual === 'float';
      }
      if (kind === 'enum') {
        item.enumType = enumTypeName(p.type, ctx);
        if (!usedEnums.has(item.enumType)) usedEnums.set(item.enumType, enumTable(item.enumType, enumDecls, hand));
      }
      if (kind === 'options') {
        item.mask = maskOf(p.type);
        if (!item.mask.namesIn) { skip(NO_READER); continue; }
      }
      if (kind === 'struct') {
        item.struct = structOf(p.type, ctx);
        if (!item.struct.known) { skip(noStruct(item.struct.name)); continue; }
      }
      plan.properties.push(item);
      entry.generated.push(js);
    }
    planMethods(members, plan, entry, { ctx, deploymentTarget, usedEnums, enumDecls, hand, maskOf, classes, overrides,
                                        extend, taken, excluded });
    generatedNames.set(name, [...entry.generated, ...entry.methods]);
    plans.push(plan);
    report.push(entry);
  }
  // 算的时候父类在前，写出来照清单的顺序
  const inListOrder = (x, y) => classes.indexOf(x.name || x.class) - classes.indexOf(y.name || y.class);
  plans.sort(inListOrder);
  report.sort(inListOrder);

  return {
    files: {
      ['ios/Runtime/Bridge/Nacre' + domain + '.mm']: renderNative(domain, domainName, plans, usedEnums, usedMasks),
      ['ios/Runtime/Builtin/parts/' + partPrefix + '-' + domainName + '.js']: renderScript(domainName, plans),
      ['packages/types/ios/' + domainName + '.d.ts']: renderTypes(domainName, plans, usedEnums, usedMasks),
      ['acceptance/src/steps/' + domainName + '.js']: renderAcceptance(domain, plans, usedEnums),
      ['docs/api/' + domainName + '.md']: renderDocs(domainName, plans),
    },
    report,
  };
}

// 一个值（方法的参数或返回值）怎么过桥
function valueOf(type, nullable, { ctx, usedEnums, enumDecls, hand, maskOf }) {
  const kind = typeKind(type, ctx);
  const value = { kind, type, nullable: nullable !== false };
  if (kind === 'options') value.mask = maskOf(type);
  if (kind === 'struct') value.struct = structOf(type, ctx);
  if (kind === 'object') value.objectClass = classOf(type);
  if (kind === 'number') {
    const actual = ctx.typedefs.get(type) || type;
    value.integer = INTEGERS.test(actual);
    value.single = actual === 'float';
  }
  if (kind === 'enum') {
    value.enumType = enumTypeName(type, ctx);
    if (!usedEnums.has(value.enumType)) usedEnums.set(value.enumType, enumTable(value.enumType, enumDecls, hand));
  }
  return value;
}

// 挑出能生成的方法。方法名是 selector 的第一段；同一个名字有几个 selector 的
// （insertTitle:atIndex: 和 insertTitle:aboveIndex:）现在不生成——那要按带了哪些键
// 来分派，手写的各有各的做法，没有一条机械的规则
function planMethods(cls, plan, entry, env) {
  const usable = cls.methods.filter((m) => !/^init($|[A-Z])/.test(m.selector));
  const count = new Map();
  for (const m of usable) {
    const { name } = methodShape(m.selector);
    count.set(name, (count.get(name) || 0) + 1);
  }
  const reported = new Set();
  const propertyNames = new Set(cls.properties.flatMap((p) => [p.name, propertyName(p)]));
  for (const m of usable) {
    const shape = methodShape(m.selector);
    if (env.taken.has(shape.name) || entry.methods.includes(shape.name)) continue;
    const skip = (reason) => {
      if (reported.has(shape.name)) return;
      reported.add(shape.name);
      entry.skipped.push({ kind: 'method', name: shape.name, reason });
    };
    if (env.excluded.has(shape.name)) { skip('补充表里排除了'); continue; }
    // 系统来调、让子类知道「某件事发生了」的方法（didMoveToSuperview、tintColorDidChange）。
    // 原生类在 JS 里不做继承，覆盖不了；自己去调它也什么都不会发生
    if (m.params.length === 0 && m.returns.type === 'void' && !m.static &&
        (/^(did|will)[A-Z]/.test(shape.name) || /DidChange$/.test(shape.name))) {
      skip('给子类覆盖的通知，原生类不做继承');
      continue;
    }
    if (/^draw[A-Z]/.test(shape.name) && !m.static) { skip('要在绘图的上下文里调，JS 里没有'); continue; }
    if (count.get(shape.name) > 1) { skip('同名的有几个写法'); continue; }
    if (m.deprecated) { skip('废弃'); continue; }
    if (m.unavailable) { skip('不可用'); continue; }
    if (m.static) { skip('类方法'); continue; }
    if (m.introduced && newerThan(m.introduced, env.deploymentTarget)) { skip('要 iOS ' + m.introduced); continue; }
    if (propertyNames.has(shape.name)) { skip('和属性同名'); continue; }
    const paramKinds = m.params.map((p) => typeKind(p.type, env.ctx));
    const returnKind = m.returns.type === 'void' ? null : typeKind(m.returns.type, env.ctx);
    const bad = [...paramKinds, ...(returnKind ? [returnKind] : [])].find((k) => k !== 'object' && !METHOD_KINDS.has(k));
    if (bad) { skip(bad === 'color' ? '颜色' : SKIP_REASON[bad] || '认不出的类型'); continue; }
    const badStruct = [...m.params.map((p) => p.type), m.returns.type]
      .find((type) => typeKind(type, env.ctx) === 'struct' && !structOf(type, env.ctx).known);
    if (badStruct) { skip(noStruct(structOf(badStruct, env.ctx).name)); continue; }
    // 对象：它的类得是 JS 里有的
    const known = (name) => name !== null && (env.hand.classes.has(name) || env.classes.includes(name));
    const strange = m.params.find((p, i) => paramKinds[i] === 'object' && !known(classOf(p.type)));
    if (strange) { skip(classOf(strange.type) ? '它的类 ' + classOf(strange.type) + ' 还没接' : '认不出的类型'); continue; }
    if (returnKind === 'object' && !known(classOf(m.returns.type))) {
      skip(classOf(m.returns.type) ? '返回的类 ' + classOf(m.returns.type) + ' 还没接' : '认不出的类型');
      continue;
    }
    const objectAt = paramKinds.map((k, i) => (k === 'object' ? i : -1)).filter((i) => i >= 0);
    // check-api.sh 的所有权检查是按类体里的方法切的，挂到原型上的方法它看不见。
    // 没有这道检查兜着，带对象的方法先不往已接的类上补
    if (env.extend && objectAt.length > 0) { skip('往已接的类上补带对象的方法还没做'); continue; }
    let ownership = null;
    if (objectAt.length > 0) {
      ownership = decideOwnership(cls, m, shape, objectAt, returnKind === 'object', env);
      if (ownership === null) { skip(UNKNOWN_OWNERSHIP); continue; }
    }
    if (m.returns.type !== 'void' && typeKind(m.returns.type, env.ctx) === 'options' && !env.maskOf(m.returns.type).namesIn) {
      skip(NO_READER);
      continue;
    }
    const params = m.params.map((p, i) => {
      // 第一个参数是位置参数，名字照头文件里的；其余的是 options 的键，名字是 selector 的段
      const key = i === 0 ? null : shape.options[i - 1];
      const local = /^[A-Za-z_]\w*$/.test(p.name) && !RESERVED.has(p.name) ? p.name : 'value';
      return { ...valueOf(p.type, p.nullable, env), key, name: i === 0 ? local : key,
               // animated 可以不带，不带就是不要动画；别的键必填
               optional: key === 'animated' && typeKind(p.type, env.ctx) === 'boolean' };
    });
    plan.methods.push({ name: shape.name, selector: m.selector, params, ownership, ownedAs: null,
                        returns: m.returns.type === 'void' ? null : valueOf(m.returns.type, m.returns.nullable, env) });
    entry.methods.push(shape.name);
  }
  // set… 和它的取值方法配对：setIcon:forState: 对 iconForState:。配上的两边把对象记在
  // 同一个位置，取回来的那个包装和设进去的是同一条边
  for (const setter of plan.methods) {
    if (!setter.ownership || setter.ownership.owns !== 'set') continue;
    const rest = setter.params.filter((p, i) => i !== setter.ownership.index);
    if (rest.length === 0) continue;
    const getter = plan.methods.find((g) => g.name === setter.ownership.base + rest.map((p) => upperFirst(p.key)).join('') &&
      g.returns && g.returns.kind === 'object' && g.params.length === rest.length && !g.ownership);
    if (getter) getter.ownedAs = setter.ownership.base;
  }
}

// 一个带对象参数的方法，JS 一侧该怎么记所有权。返回 null 是认不出：不生成。
// 头文件里没写方法会不会留住参数，所以只认方法名说得很清楚的几种；拿不准的不猜。
// 多记一条只是多留一份引用，但不能无限地多记：add / insert 只有在类里找得到带
// 对象的 remove 与它配对时才记，不然加进去的永远去不掉。
function decideOwnership(cls, m, shape, objectAt, returnsObject, env) {
  const where = cls.name + ' 的 ' + m.selector;
  const override = ((env.overrides.methods || {})[cls.name] || {})[m.selector];
  if (override) {
    if (!['set', 'add', 'remove', 'none'].includes(override.owns)) {
      throw new Error(where + '：补充表里的 owns 只能是 set / add / remove / none');
    }
    if (override.owns === 'none' && !override.why) {
      throw new Error(where + '：补充表里写了不记所有权（owns: none），要写 why 说明理由');
    }
    return { owns: override.owns, base: override.key || shape.name, group: override.group || shape.name,
             why: override.why, index: objectAt[0] };
  }
  if (objectAt.length !== 1 || objectAt[0] !== 0 || returnsObject) return null;
  const name = shape.name;
  const noun = (verb) => lowerFirst(name.slice(verb.length));
  const exists = (names) => cls.methods.some((other) => !other.static && other.params.length > 0 &&
    names.includes(methodShape(other.selector).name) && typeKind(other.params[0].type, env.ctx) === 'object');
  if (/^set[A-Z]/.test(name)) return { owns: 'set', base: noun('set'), index: 0 };
  const adds = name.match(/^(add|insert)(?=[A-Z])/);
  if (adds) {
    const group = noun(adds[1]);
    return exists(['remove' + upperFirst(group)]) ? { owns: 'add', group, index: 0 } : null;
  }
  if (/^remove[A-Z]/.test(name)) {
    const group = noun('remove');
    return exists(['add' + upperFirst(group), 'insert' + upperFirst(group)])
      ? { owns: 'remove', group, index: 0 }
      : { owns: 'none', why: '解除持有，不是建立持有', index: 0 };
  }
  if (QUERY.test(name)) return { owns: 'none', why: '只读，不持有', index: 0 };
  return null;
}

// 属性的类型可能是枚举的别名，找到枚举真正的名字
function enumTypeName(type, ctx) {
  if (ctx.enums.has(type)) return type;
  const actual = (ctx.typedefs.get(type) || '').match(/^enum (\w+)$/);
  return actual ? actual[1] : type;
}

// 一个枚举在原生那张表里有哪些名字。废弃的值不进表；一个数值两个名字的只留主名
// （表是无序的字典，两个名字指向同一个数值时读回来是哪个说不准）。
// 手写的类型定义里已经声明过这个枚举时，名字必须和它一样：机械规则算出来的
// 对不上，就停下来报错，不生成一张和类型定义不一致的表。
function enumTable(typeName, enumDecls, hand) {
  const generated = enumValues(enumDecls.get(typeName));
  // 这个平台上不可用的值也不放：引用它连编译都过不了
  const usable = generated.values.filter((v) => !v.deprecated && !v.unavailable && v.aliasOf === null);
  if (!hand.enums.has(typeName)) return { declared: false, values: usable.map((v) => ({ js: v.js, objc: v.objc })) };
  const values = [];
  for (const js of hand.enums.get(typeName)) {
    const found = generated.values.find((v) => v.js === js);
    if (!found) {
      throw new Error(typeName + '：类型定义里声明了 ' + js + '，机械规则在头文件里找不到对应的值。' +
                      '要么改规则，要么把它写进补充表');
    }
    values.push({ js, objc: found.objc });
  }
  return { declared: true, values };
}

// 一个位掩码在原生那张表里有哪些名字，以及用哪几个函数转换。
// 表里只放数值是单独一位的值：0 是空数组，不是一个名字；几位合起来的
// （All = Top | Left）也不是一个名字。废弃的和别名同样不放。
// 补充表里有这个类型时不建表，用手写的那几个函数。
function maskTable(typeName, enumDecls, hand, override, domain) {
  if (override) {
    return { override: true, ts: override.ts, from: override.fromNames, names: override.names + '()',
             namesIn: override.namesIn || null, declared: true, values: [] };
  }
  const fn = { override: false, ts: typeName + '[]', from: domain + typeName + 'FromNames',
               names: 'NamesFor' + domain + typeName + '()', namesIn: 'NamesIn' + domain + typeName };
  const generated = enumValues({ ...enumDecls.get(typeName), options: true });
  const singleBit = (v) => {
    if (v.value === null || v.value === undefined) return false;
    const n = BigInt(v.value);
    return n > 0n && (n & (n - 1n)) === 0n;
  };
  const usable = generated.values.filter((v) => !v.deprecated && !v.unavailable && v.aliasOf === null && singleBit(v));
  if (!hand.enums.has(typeName)) return { ...fn, declared: false, values: usable.map((v) => ({ js: v.js, objc: v.objc })) };
  const values = [];
  for (const js of hand.enums.get(typeName)) {
    const found = generated.values.find((v) => v.js === js);
    if (!found) {
      throw new Error(typeName + '：类型定义里声明了 ' + js + '，机械规则在头文件里找不到对应的值。' +
                      '要么改规则，要么把它写进补充表');
    }
    values.push({ js, objc: found.objc });
  }
  return { ...fn, declared: true, values };
}

// ---------------------------------------------------------------- 原生

function renderNative(domain, lower, plans, usedEnums, usedMasks) {
  const scalar = (p) => p.kind !== 'color' && p.kind !== 'object';
  const hasText = plans.some((c) => c.properties.some((p) => p.kind === 'string' && !p.readonly) ||
                                    c.methods.some((m) => m.params.some((p) => p.kind === 'string')));
  const hasColor = plans.some((c) => c.properties.some((p) => !scalar(p) && !p.readonly));
  const out = ['// ' + HEADER, '//',
    '// 一个域：' + plans.map((c) => c.name).join('、') + '。写法和手写的域一样，',
    '// 见 docs/internals/adding-classes.md；哪些成员生成、哪些不生成见 docs/internals/bindgen.md。', '',
    '#import "NacreBridge.h"', '', 'namespace nacre_bridge {', ''];

  for (const [typeName, table] of usedEnums) {
    out.push('NACRE_ENUM_MAP(' + domain + typeName + ', ' + typeName + ',');
    table.values.forEach((v, i) => {
      out.push('               @"' + v.js + '": @(' + v.objc + ')' + (i === table.values.length - 1 ? ')' : ','));
    });
    out.push('');
  }
  for (const [typeName, mask] of usedMasks) {
    if (mask.override) continue;
    out.push('NACRE_MASK_MAP(' + domain + typeName + ', ' + typeName + ',');
    mask.values.forEach((v, i) => {
      out.push('               @"' + v.js + '": @(' + v.objc + ')' + (i === mask.values.length - 1 ? ')' : ','));
    });
    out.push('');
  }
  const takesMask = plans.some((c) => c.properties.some((p) => p.kind === 'options' && !p.readonly) ||
                                      c.methods.some((m) => m.params.some((p) => p.kind === 'options')));
  if (takesMask) {
    // 位掩码写错有两种：名字不认识（列出可选值）；给的根本不是数组（这一句）
    out.push('static std::string ' + domain + 'NotArray(NSString* what, NSString* names) {',
      '  return [NSString stringWithFormat:@"%@ needs an array of names; expected any of: %@", what, names].UTF8String;',
      '}', '');
  }
  if (hasText) {
    out.push('static bool ' + domain + 'Text(id value, NSString* what, bool nullable, NSString** out,',
      '                    std::string* error) {',
      '  if ([value isKindOfClass:NSString.class]) { *out = value; return true; }',
      '  if (nullable && (value == nil || value == NSNull.null)) { *out = nil; return true; }',
      '  *error = [NSString stringWithFormat:@"%@ must be a string%@", what,',
      '                                      nullable ? @" or null" : @""].UTF8String;',
      '  return false;', '}', '');
  }
  if (hasColor) {
    out.push('static bool ' + domain + 'Object(id value, Class cls, const char* className, bool nullable,',
      '                    const std::string& name, std::string* error) {',
      '  if ([value isKindOfClass:cls] || (nullable && value == nil)) return true;',
      '  ObjectTypeError(name, className, nullable, error);',
      '  return false;', '}', '');
  }

  const section = (signature, members, tail) => {
    out.push(signature);
    for (const c of plans) {
      const lines = c.properties.flatMap((p) => members(p));
      if (lines.length === 0) continue;
      out.push('  if ([object isKindOfClass:' + c.name + '.class]) {', '    ' + c.name + '* o = (' + c.name + '*)object;',
               ...lines.map((l) => '    ' + l), '  }');
    }
    out.push('  ' + tail, '}', '');
  };

  section('static id Read' + domain + 'Property(id object, NSString* key) {', (p) => {
    if (!scalar(p)) return [];
    const is = 'if ([key isEqualToString:@"' + p.js + '"]) return ';
    if (p.kind === 'boolean') return [is + '@(o.' + p.getter + ');'];
    if (p.kind === 'number') return [is + (p.single ? '@((double)o.' + p.getter + ');' : '@(o.' + p.getter + ');')];
    if (p.kind === 'string') return [is + 'o.' + p.getter + ' ?: ' + (p.nullable ? 'NSNull.null' : '@""') + ';'];
    if (p.kind === 'options') return [is + p.mask.namesIn + '(o.' + p.getter + ');'];
    if (p.kind === 'struct') return [is + p.struct.toJSON + '(o.' + p.getter + ');'];
    return [is + 'NameFor' + domain + p.enumType + '(o.' + p.getter + ') ?: NSNull.null;'];
  }, 'return nil;');

  section('static BOOL Write' + domain + 'Property(id object, NSString* key, id value, std::string* error) {', (p) => {
    if (!scalar(p) || p.readonly) return [];
    const is = 'if ([key isEqualToString:@"' + p.js + '"]) {';
    if (p.kind === 'boolean') return [is + ' o.' + p.objc + ' = NACRE_BOOL(value, key); return YES; }'];
    if (p.kind === 'number') {
      const take = p.integer ? 'NACRE_INT(value, key)' : (p.single ? '(float)' : '') + 'NACRE_NUM(value, key)';
      return [is + ' o.' + p.objc + ' = ' + take + '; return YES; }'];
    }
    if (p.kind === 'string') {
      return [is, '  NSString* text = nil;',
              '  if (' + domain + 'Text(value, key, ' + p.nullable + ', &text, error)) o.' + p.objc + ' = text;',
              '  return YES;', '}'];
    }
    if (p.kind === 'struct') return [is + ' o.' + p.objc + ' = ' + p.struct.fromJSON + '(value); return YES; }'];
    if (p.kind === 'options') {
      return [is, '  ' + enumTypeOfMask(p) + ' v;', '  id bad = nil;',
              '  if (!' + p.mask.from + '(value, &v, &bad)) {',
              '    *error = bad != nil ? EnumError(key, bad, ' + p.mask.names + ')',
              '                        : ' + domain + 'NotArray(key, ' + p.mask.names + ');',
              '    return YES;', '  }', '  o.' + p.objc + ' = v;', '  return YES;', '}'];
    }
    return [is, '  ' + p.enumType + ' v;', '  if (!' + domain + p.enumType + 'FromName(value, &v)) {',
            '    *error = EnumError(key, value, NamesFor' + domain + p.enumType + '());', '    return YES;', '  }',
            '  o.' + p.objc + ' = v;', '  return YES;', '}'];
  }, 'return NO;');

  section('static nacre::NativeObjectRef Read' + domain + 'ObjectProperty(id object, const std::string& name) {', (p) => {
    if (scalar(p)) return [];
    return ['if (name == "' + p.js + '") return {NacreKeep(o.' + p.getter + '), "' + (p.objectClass || 'UIColor') + '"};'];
  }, 'return {};');

  section('static bool Write' + domain + 'ObjectProperty(id object, const std::string& name, id value,\n' +
          '                                        std::string* error) {', (p) => {
    if (scalar(p) || p.readonly) return [];
    const cls = p.objectClass || 'UIColor';
    return ['if (name == "' + p.js + '") {',
            '  if (' + domain + 'Object(value, ' + cls + '.class, "' + cls + '", ' + p.nullable + ', name, error)) o.' + p.objc + ' = value;',
            '  return true;', '}'];
  }, 'return false;');

  const takesObject = plans.some((c) => c.methods.some((m) => m.params.some((p) => p.kind === 'object')));
  if (takesObject) {
    out.push('static bool ' + domain + 'IsObject(id given, id scalar, NSString* what, Class cls, const char* className,',
      '                        bool nullable, std::string* error) {',
      '  // 对象位在标量那一路里是 null。那一路里有东西，说明 JS 给的不是原生对象',
      '  BOOL isNull = given == nil && (scalar == nil || scalar == NSNull.null);',
      '  if ((isNull && nullable) || [given isKindOfClass:cls]) return true;',
      '  ObjectTypeError(what.UTF8String, className, nullable, error);',
      '  return false;', '}', '');
  }
  // 收对象但不记所有权的方法，在这里标出来、写明理由：check-api.sh 的所有权检查认这一行
  const exempt = plans.flatMap((c) => c.methods.filter((m) => m.ownership && m.ownership.owns === 'none')
    .map((m) => '// nacre:ownership-exempt ' + m.selector + ' —— ' + m.ownership.why));
  if (exempt.length > 0) out.push(...exempt, '');

  // 取参：两条方法通道共用
  const takeArgs = (m) => {
    const lines = [];
    m.params.forEach((p, i) => {
      const what = '@"' + (p.key || m.name) + '"';
      const from = 'args.value(' + i + ')';
      if (p.kind === 'boolean') lines.push('BOOL a' + i + ' = NACRE_BOOL(' + from + ', ' + what + ');');
      else if (p.kind === 'number') {
        const take = p.integer ? '(' + p.type + ')NACRE_INT(' + from + ', ' + what + ')'
          : (p.single ? '(float)' : '') + 'NACRE_NUM(' + from + ', ' + what + ')';
        lines.push(p.type + ' a' + i + ' = ' + take + ';');
      } else if (p.kind === 'string') {
        lines.push('NSString* a' + i + ' = nil;',
                   'if (!' + domain + 'Text(' + from + ', ' + what + ', ' + p.nullable + ', &a' + i + ', error)) return true;');
      } else if (p.kind === 'struct') {
        lines.push(p.struct.name + ' a' + i + ' = ' + p.struct.fromJSON + '(' + from + ');');
      } else if (p.kind === 'object') {
        lines.push('id g' + i + ' = args.object(' + i + ');',
                   'if (!' + domain + 'IsObject(g' + i + ', ' + from + ', ' + what + ', ' + p.objectClass + '.class, "' +
                     p.objectClass + '", ' + p.nullable + ', error)) return true;',
                   p.objectClass + '* a' + i + ' = g' + i + ';');
      } else if (p.kind === 'options') {
        lines.push(enumTypeOfMask(p) + ' a' + i + ';', 'id bad' + i + ' = nil;',
                   'if (!' + p.mask.from + '(' + from + ', &a' + i + ', &bad' + i + ')) {',
                   '  *error = bad' + i + ' != nil ? EnumError(' + what + ', bad' + i + ', ' + p.mask.names + ')',
                   '                       : ' + domain + 'NotArray(' + what + ', ' + p.mask.names + ');',
                   '  return true;', '}');
      } else {
        lines.push(p.enumType + ' a' + i + ';',
                   'if (!' + domain + p.enumType + 'FromName(' + from + ', &a' + i + ')) {',
                   '  *error = EnumError(' + what + ', ' + from + ', NamesFor' + domain + p.enumType + '());',
                   '  return true;', '}');
      }
    });
    return lines;
  };
  const sendOf = (m) => {
    const segments = m.selector.includes(':') ? m.selector.split(':').slice(0, -1) : [];
    return '[o ' + (segments.length === 0 ? m.selector : segments.map((seg, i) => seg + ':a' + i).join(' ')) + ']';
  };
  const channel = (signature, wanted, result) => {
    if (!plans.some((c) => c.methods.some(wanted))) return false;
    out.push(...signature);
    for (const c of plans) {
      const methods = c.methods.filter(wanted);
      if (methods.length === 0) continue;
      out.push('  if ([object isKindOfClass:' + c.name + '.class]) {', '    ' + c.name + '* o = (' + c.name + '*)object;');
      for (const m of methods) {
        out.push('    if ([sel isEqualToString:@"' + m.selector + '"]) {', ...takeArgs(m).map((l) => '      ' + l),
                 ...result(m, sendOf(m)).map((l) => '      ' + l), '      return true;', '    }');
      }
      out.push('  }');
    }
    out.push('  return false;', '}', '');
    return true;
  };
  const returnsObject = (m) => m.returns !== null && m.returns.kind === 'object';
  const hasMethods = channel(
    ['static bool Call' + domain + 'Method(id object, NSString* sel, const NacreArgs& args,',
     '                             std::string* out, std::string* error) {'],
    (m) => !returnsObject(m),
    (m, send) => {
      const r = m.returns;
      if (r === null) return [send + ';', '*out = "null";'];
      if (r.kind === 'boolean') return ['*out = EncodeJSON(@(' + send + '));'];
      if (r.kind === 'number') return ['*out = EncodeJSON(@(' + (r.single ? '(double)' : '') + send + '));'];
      if (r.kind === 'string') return ['*out = EncodeJSON(' + send + ');'];
      if (r.kind === 'options') return ['*out = EncodeJSON(' + r.mask.namesIn + '(' + send + '));'];
      if (r.kind === 'struct') return ['*out = EncodeJSON(' + r.struct.toJSON + '(' + send + '));'];
      return ['*out = EncodeJSON(NameFor' + domain + r.enumType + '(' + send + '));'];
    });
  const hasObjectMethods = channel(
    ['static bool Call' + domain + 'ObjectMethod(id object, NSString* sel, const NacreArgs& args,',
     '                                   nacre::NativeObjectRef* out, std::string* error) {'],
    returnsObject,
    (m, send) => ['*out = {NacreKeep(' + send + '), "' + m.returns.objectClass + '"};']);

  const created = plans.filter((c) => !c.extend);
  if (created.length > 0) {
    out.push('static bool ' + domain + 'Construct(const std::string& className, const NacreArgs& args,',
             '                             nacre::NativeObjectRef* out, std::string* error) {');
    for (const c of created) {
      out.push('  if (className == "' + c.name + '") {',
               '    *out = {NacreKeep([[' + c.name + ' alloc] init]), className};', '    return true;', '  }');
    }
    out.push('  return false;', '}', '');
  }
  out.push('}  // namespace nacre_bridge', '',
    '@interface Nacre' + domain + 'Domain : NSObject', '@end', '@implementation Nacre' + domain + 'Domain',
    '+ (void)load {', '  nacre_bridge::NacreDomain d;', '  d.name = "' + lower + '";',
    '  d.classes = {' + plans.map((c) => c.name + '.class').join(', ') + '};',
    '  d.read = nacre_bridge::Read' + domain + 'Property;',
    '  d.write = nacre_bridge::Write' + domain + 'Property;',
    '  d.readObject = nacre_bridge::Read' + domain + 'ObjectProperty;',
    '  d.writeObject = nacre_bridge::Write' + domain + 'ObjectProperty;',
    ...(hasMethods ? ['  d.call = nacre_bridge::Call' + domain + 'Method;'] : []),
    ...(hasObjectMethods ? ['  d.callObject = nacre_bridge::Call' + domain + 'ObjectMethod;'] : []),
    ...(created.length > 0 ? ['  d.construct = nacre_bridge::' + domain + 'Construct;'] : []),
    '  nacre_bridge::NacreRegisterDomain(d);', '}', '@end', '');
  return out.join('\n');
}

// 位掩码在 ObjC 里的类型名：头文件里写的那个（可能是别名，照写就行）
function enumTypeOfMask(value) {
  return value.type;
}

// ---------------------------------------------------------------- 内置脚本

// 一个属性的取值器和设值器里的语句。multi 是写成多行（颜色的那两个比较长）
function accessorOf(p) {
  const need = "requireNative(this, '" + p.js + "');";
  const one = (get, set) => ({ multi: false, get: [need, get], set: set === null || p.readonly ? null : [need, set] });
  if (p.kind === 'color') {
    return { multi: true, get: [need, "return colorString(nativeGetOwned(this, '" + p.js + "'));"],
             set: p.readonly ? null : [need, "const color = colorArg(value, '" + p.js + "');",
                                       'if (color === undefined) return;', "nativeSetOwned(this, '" + p.js + "', color);"] };
  }
  if (p.kind === 'struct') {
    return one('return ' + p.struct.wrap + "(nativeGet(this, '" + p.js + "'));",
               "nativeSet(this, '" + p.js + "', structArg(value, " + p.struct.fields + ", '" + p.js + "'));");
  }
  if (p.kind === 'object') {
    const [read, write] = p.owned ? ['nativeGetOwned', 'nativeSetOwned'] : ['nativeGetObject', 'nativeSetObject'];
    return one('return ' + read + "(this, '" + p.js + "');", write + "(this, '" + p.js + "', value);");
  }
  const convert = p.kind === 'boolean' ? 'toBoolean(value)'
    : p.kind === 'number' ? (p.integer ? 'toInteger' : 'toNumber') + "(value, '" + p.js + "')"
      : p.kind === 'string' ? (p.nullable ? 'toTextOrNull(value)' : 'toText(value)')
        : 'value';
  return one("return nativeGet(this, '" + p.js + "');", "nativeSet(this, '" + p.js + "', " + convert + ');');
}

// 一个方法的参数表和方法体里的语句
function methodOf(m) {
  const convert = (p, from, what) => (p.kind === 'boolean' ? 'toBoolean(' + from + ')'
    : p.kind === 'number' ? (p.integer ? 'toInteger' : 'toNumber') + '(' + from + ", '" + what + "')"
      : p.kind === 'string' ? (p.nullable ? 'toTextOrNull(' : 'toText(') + from + ')'
        : p.kind === 'struct' ? 'structArg(' + from + ', ' + p.struct.fields + ", '" + what + "')" : from);
  const first = m.params[0];
  const rest = m.params.slice(1);
  const refs = m.params.map((p, i) => (i === 0 ? p.name : 'o.' + p.key));
  const args = m.params.map((p, i) => (i === 0 ? convert(p, p.name, m.name) : convert(p, 'o.' + p.key, p.key)));
  // 所有权边的位置：名字后面跟上其余的参数（按状态存的图，每个状态各是一条边）
  const keyOf = (base, parts) => "'" + base + (parts.length > 0 ? ":' + " + parts.map((r) => 'keyPart(' + r + ')').join(" + ':' + ") : "'");
  const lines = [];
  if (rest.length > 0) lines.push('const o = options == null ? {} : options;');
  for (const p of rest) {
    if (!p.optional) lines.push("if (!has(o, '" + p.key + "')) throw new TypeError('" + m.name + ' needs { ' + p.key + " }');");
  }
  const call = (m.returns && m.returns.kind === 'object' ? 'nativeCallObject' : 'nativeCall') +
    "(this, '" + m.selector + "', [" + args.join(', ') + '])';
  // 结构体读出来是普通对象，包成类再给出去
  const invoke = m.returns && m.returns.kind === 'struct' ? m.returns.struct.wrap + '(' + call + ')' : call;
  const own = m.ownership;
  if (m.ownedAs !== null) {
    lines.push('return own(this, ' + keyOf(m.ownedAs, refs) + ', ' + invoke + ');');
  } else if (own && own.owns !== 'none') {
    const value = refs[own.index];
    lines.push(invoke + ';');
    if (own.owns === 'set') lines.push('own(this, ' + keyOf(own.base, refs.filter((r, i) => i !== own.index)) + ', ' + value + ');');
    else lines.push((own.owns === 'add' ? 'ownOne' : 'disown') + "(this, '" + own.group + "', " + value + ');');
  } else {
    lines.push((m.returns ? 'return ' : '') + invoke + ';');
  }
  return { name: m.name, params: [first ? first.name : null, rest.length > 0 ? 'options' : null].filter(Boolean).join(', '), lines };
}

function renderScript(framework, plans) {
  // head 是「    get x()」这样带缩进的开头；tail 是右花括号后面跟的（对象字面量里要逗号）
  const block = (head, statements, multi, tail) => {
    const indent = head.match(/^ */)[0];
    return multi ? [head + ' {', ...statements.map((st) => indent + '  ' + st), indent + '}' + tail]
      : [head + ' { ' + statements.join(' ') + ' }' + tail];
  };
  const body = [];
  for (const c of plans) {
    const accessors = c.properties.map((p) => ({ name: p.js, ...accessorOf(p) }));
    const methods = c.methods.map(methodOf);
    if (c.extend) {
      // 已经手写过的类：不重新定义它，往原型上挂。属性一个一句 Object.defineProperty，
      // 属性名写成字面量——check-api.sh 就是按这个写法核对「挂了的」和「类型里声明了的」
      body.push('  // ---- ' + c.name + '：手写的类，这里只补它没有的成员 ----');
      for (const a of accessors) {
        body.push('  Object.defineProperty(' + c.name + ".prototype, '" + a.name + "', {",
                  '    configurable: true,', '    enumerable: false,',
                  ...block('    get()', a.get, a.multi, ','),
                  ...(a.set ? block('    set(value)', a.set, a.multi, ',') : []), '  });');
      }
      for (const m of methods) {
        body.push('  define(' + c.name + ".prototype, '" + m.name + "', function " + m.name + '(' + m.params + ') {',
                  ...m.lines.map((l) => '    ' + l), '  });');
      }
      body.push('');
      continue;
    }
    body.push("  defineNativeClass('" + c.name + "', class " + c.name + ' extends ' + c.super + ' {',
              '    constructor() {', '      super();',
              "      constructNative(this, new.target, '" + c.name + "', []);", '    }', '');
    for (const a of accessors) {
      body.push(...block('    get ' + a.name + '()', a.get, a.multi, ''),
                ...(a.set ? block('    set ' + a.name + '(value)', a.set, a.multi, '') : []));
    }
    for (const m of methods) {
      body.push('', '    ' + m.name + '(' + m.params + ') {', ...m.lines.map((l) => '      ' + l), '    }');
    }
    body.push('  });', '');
  }
  const text = body.join('\n');
  const helpers = ['colorArg', 'colorString', 'constructNative', 'defineNativeClass', 'disown', 'has', 'nativeCall',
                   'nativeCallObject', 'nativeGet', 'nativeGetObject', 'nativeGetOwned', 'nativeSet', 'nativeSetObject',
                   'nativeSetOwned', 'own', 'ownOne', 'requireNative', 'structArg', 'toBoolean', 'toInteger',
                   'toNumber', 'toText', 'toTextOrNull',
                   ...Object.values(STRUCTS).flatMap((st) => [st.fields, st.wrap])]
    .filter((h) => new RegExp('\\b' + h + '\\b').test(text)).sort();
  const local = [];
  // 所有权边的位置里的一段。数组先排序：['a', 'b'] 和 ['b', 'a'] 是同一个状态
  if (/\bkeyPart\(/.test(text)) local.push("  const keyPart = (v) => (Array.isArray(v) ? v.slice().sort().join('|') : String(v));");
  // 往已有的类上挂方法。和类体里的方法一样：不可枚举，可以被覆盖
  if (/\bdefine\(/.test(text)) {
    local.push('  const define = (proto, name, value) => Object.defineProperty(proto, name, { configurable: true, enumerable: false, writable: true, value });');
  }
  if (local.length > 0) local.push('');
  return ['// ' + HEADER, '//',
    '// ' + plans.map((c) => c.name + (c.extend ? '（补成员）' : '')).join('、') + '。',
    '// 这是内置脚本的一个 part：整个文件是一个函数表达式，运行时按文件名顺序执行，用共享的 ctx 调一次。',
    '(function (ctx) {', "  'use strict';", '',
    '  const {', ...helpers.map((h) => '    ' + h + ','), '  } = ctx;', '', ...local, text.trimEnd(), '})', ''].join('\n');
}

// ---------------------------------------------------------------- 类型定义

function renderTypes(framework, plans, usedEnums, usedMasks) {
  const out = ['// ' + HEADER, '//',
    '// 成员的名字是照已定的写法从头文件套出来的，没写注释的成员用法看 Apple 的文档。', ''];
  for (const [typeName, table] of usedEnums) {
    if (table.declared) continue;
    out.push('type ' + typeName + ' = ' + table.values.map((v) => "'" + v.js + "'").join(' | ') + ';', '');
  }
  for (const [typeName, mask] of usedMasks) {
    if (mask.declared) continue;
    out.push('type ' + typeName + ' = ' + mask.values.map((v) => "'" + v.js + "'").join(' | ') + ';', '');
  }
  for (const c of plans) {
    // 已经手写过的类：声明合并，把新成员并进手写的那个类
    if (c.extend) out.push('interface ' + c.name + ' {');
    else out.push('declare class ' + c.name + ' extends ' + c.super + ' {', '  constructor();', '');
    for (const p of c.properties) {
      if (p.kind === 'color') {
        const orNull = p.nullable ? ' | null' : '';
        if (p.readonly) out.push('  readonly ' + p.js + ': string' + orNull + ';');
        else out.push('  get ' + p.js + '(): string' + orNull + ';', '  set ' + p.js + '(value: ColorValue' + orNull + ');');
        continue;
      }
      if (p.kind === 'object') {
        out.push('  ' + (p.readonly ? 'readonly ' : '') + p.js + ': ' + p.objectClass + (p.nullable ? ' | null' : '') + ';');
        continue;
      }
      if (p.kind === 'struct') {
        // 读给类本身，写收 Like（实例或者带同样字段的普通对象），和手写的 view.frame 一样
        if (p.readonly) out.push('  readonly ' + p.js + ': ' + p.struct.name + ';');
        else out.push('  get ' + p.js + '(): ' + p.struct.name + ';', '  set ' + p.js + '(value: ' + p.struct.like + ');');
        continue;
      }
      const type = p.kind === 'boolean' ? 'boolean' : p.kind === 'number' ? 'number'
        : p.kind === 'string' ? 'string' + (p.nullable ? ' | null' : '') : p.kind === 'options' ? p.mask.ts : p.enumType;
      out.push('  ' + (p.readonly ? 'readonly ' : '') + p.js + ': ' + type + ';');
    }
    const tsType = (v, returned = false) => (v.kind === 'boolean' ? 'boolean' : v.kind === 'number' ? 'number'
      : v.kind === 'string' ? 'string' + (v.nullable ? ' | null' : '') : v.kind === 'options' ? v.mask.ts
        : v.kind === 'struct' ? (returned ? v.struct.name : v.struct.like)
          : v.kind === 'object' ? v.objectClass + (v.nullable ? ' | null' : '') : v.enumType);
    if (c.methods.length > 0 && c.properties.length > 0) out.push('');
    for (const m of c.methods) {
      const params = [];
      if (m.params.length > 0) params.push(m.params[0].name + ': ' + tsType(m.params[0]));
      const rest = m.params.slice(1);
      if (rest.length > 0) {
        params.push('options' + (rest.every((p) => p.optional) ? '?' : '') + ': { ' +
                    rest.map((p) => p.key + (p.optional ? '?' : '') + ': ' + tsType(p)).join('; ') + ' }');
      }
      out.push('  ' + m.name + '(' + params.join(', ') + '): ' + (m.returns ? tsType(m.returns, true) : 'void') + ';');
    }
    out.push('}', '');
  }
  return out.join('\n');
}

// ---------------------------------------------------------------- 验收的断言

// 一个值在类型定义里怎么写。returned 是读出来的那一侧（结构体读给类本身，写收 Like）
function typeText(v, returned) {
  if (v.kind === 'boolean') return 'boolean';
  if (v.kind === 'number') return 'number';
  if (v.kind === 'string') return 'string' + (v.nullable ? ' | null' : '');
  if (v.kind === 'color') return (returned ? 'string' : 'ColorValue') + (v.nullable ? ' | null' : '');
  if (v.kind === 'options') return v.mask.ts;
  if (v.kind === 'struct') return returned ? v.struct.name : v.struct.like;
  if (v.kind === 'object') return v.objectClass + (v.nullable ? ' | null' : '');
  return v.enumType;
}

// 每个生成出来的属性读写往返一遍：读出来的类型对；可写的写回原值，读到的不变。
// 它证明的是这条通道接通了、两边的类型对得上。默认值、设了之后界面上的效果、方法，
// 它证明不了——那些要量过、要人看，写不出机械的断言。
function renderAcceptance(framework, plans, usedEnums) {
  const out = ['// ' + HEADER, '//',
    '// bindgen 生成的属性的读写往返。每个属性两件事：读出来的类型对；可写的写回读到的值，',
    '// 再读还是它。证明的是这条通道接通了、类型对得上；默认值和界面上的效果它证明不了。', '',
    '// 一组断言中途抛了只废这一组，不连累后面的',
    '/**', ' * @param {string} name', ' * @param {() => void} fn', ' */',
    'function group(name, fn) {', '  try {', '    fn();', '  } catch (err) {',
    '    const message = err instanceof Error ? err.message : String(err);',
    "    console.log('  ✗ ' + name + ' 这一组中断了 = ' + message + '（期望跑完）');", '  }', '}', '',
    '/** @param {import("../main.js").StepContext} ctx */',
    'export function step' + framework + '(ctx) {', '  const { assert } = ctx;',
    "  console.log('--- 属性的读写往返 ---');"];
  for (const c of plans) {
    if (c.properties.length === 0) continue;
    out.push('', "  group('" + c.name + "', () => {", '    const o = new ' + c.name + '();');
    for (const p of c.properties) {
      const at = c.name + '.' + p.js;
      const read = 'o.' + p.js;
      // 写回原值之后怎么比：结构体和数组不是同一个对象，比内容
      let same = [read, 'before'];
      if (p.kind === 'boolean') out.push("    assert('" + at + " 读出来是布尔', typeof " + read + ", 'boolean');");
      else if (p.kind === 'number') out.push("    assert('" + at + " 读出来是数', typeof " + read + ", 'number');");
      else if (p.kind === 'string' || p.kind === 'color') {
        const what = p.kind === 'color' ? '颜色的字符串' : '字符串';
        out.push(p.nullable
          ? "    assert('" + at + ' 读出来是' + what + "或 null', " + read + ' === null || typeof ' + read + " === 'string', true);"
          : "    assert('" + at + ' 读出来是' + what + "', typeof " + read + ", 'string');");
      } else if (p.kind === 'enum') {
        const names = usedEnums.get(p.enumType).values.map((v) => v.js);
        out.push("    assert('" + at + ' 读出来是 ' + names.join(' / ') + " 里的一个', " +
                 JSON.stringify(names).replace(/"/g, "'") + '.includes(' + read + '), true);');
      } else if (p.kind === 'options') {
        out.push("    assert('" + at + " 读出来是名字的数组', Array.isArray(" + read + '), true);');
        same = [read + ".join(',')", "before.join(',')"];
      } else if (p.kind === 'struct') {
        out.push("    assert('" + at + ' 读出来是 ' + p.struct.name + "', " + read + ' instanceof ' + p.struct.name + ', true);');
        const fields = (from) => '[' + p.struct.names.map((n) => from + '.' + n).join(', ') + "].join(',')";
        same = [fields(read), fields('before')];
      } else if (p.kind === 'object') {
        out.push(p.nullable
          ? "    assert('" + at + ' 读出来是 ' + p.objectClass + " 或 null', " + read + ' === null || ' + read + ' instanceof ' + p.objectClass + ', true);'
          : "    assert('" + at + ' 读出来是 ' + p.objectClass + "', " + read + ' instanceof ' + p.objectClass + ', true);');
        same = null;   // 写回去之后原生可能给一份拷贝，不比身份
      }
      if (p.readonly) continue;
      out.push('    {', '      const before = ' + read + ';');
      // 不可空的属性读到 null 是原生自己的事，但写不回去
      const guard = (p.kind === 'object' || p.kind === 'color' || p.kind === 'string') && !p.nullable ? 'if (before !== null) ' : '';
      out.push('      ' + guard + read + ' = before;');
      if (same) out.push("      assert('" + at + " 写回原值，读到的不变', " + same[0] + ', ' + same[1] + ');');
      else out.push("      assert('" + at + " 写回原值不抛', true, true);");
      out.push('    }');
    }
    out.push('  });');
  }
  out.push('}', '');
  return out.join('\n');
}

// ---------------------------------------------------------------- 成员清单的文档

// 文档的初稿只是一张清单：名字、类型、对应的 selector。例子和效果要人在模拟器上看过
// 再写，所以开头明说这一页还没有按文档写法写
function renderDocs(framework, plans) {
  const cell = (text) => '`' + text.replace(/\|/g, '\\|') + '`';
  const out = ['<!-- ' + HEADER + ' -->', '',
    '# 成员清单：' + plans.map((c) => c.name).join('、'), '', '← [API 文档](README.md)', '',
    '这一页现在只是一张清单：名字、类型、对应的 selector。成员的名字是按[原生类](native-classes.md)里那几条写法从 iOS 的头文件' +
    '套出来的，所以能照着对回 Apple 的文档，用法也照 Apple 的文档。', '',
    '> **注意**：这一页还没有按[文档写法](../writing-guide.md)写：没有例子，没有效果，默认值没有量过。验过的只有每个属性' +
    '读得出来、类型对、写回读到的值不出错；方法没有在模拟器上调过。要用哪个成员，先在模拟器上试。', ''];
  for (const c of plans) {
    out.push('## ' + c.name, '');
    out.push(c.extend ? '这里列的是后补的成员。它原有的成员看它自己的那一页。' : '下面是这个类现在的全部成员。', '');
    if (c.properties.length > 0) {
      out.push('| 属性 | 类型 | |', '| --- | --- | --- |');
      for (const p of c.properties) out.push('| `' + p.js + '` | ' + cell(typeText(p, true)) + ' | ' + (p.readonly ? '只读' : '可读可写') + ' |');
      out.push('');
    }
    if (c.methods.length > 0) {
      out.push('| 方法 | 返回 | 对应的 selector |', '| --- | --- | --- |');
      for (const m of c.methods) {
        const rest = m.params.slice(1);
        const params = [m.params[0] ? m.params[0].name : null,
                        rest.length > 0 ? '{ ' + rest.map((p) => p.key + (p.optional ? '?' : '')).join(', ') + ' }' : null]
          .filter(Boolean).join(', ');
        out.push('| `' + m.name + '(' + params + ')` | ' + (m.returns ? '返回 ' + cell(typeText(m.returns, true)) : '没有返回值') +
                 ' | `' + m.selector + '` |');
      }
      out.push('');
    }
  }
  return out.join('\n');
}
