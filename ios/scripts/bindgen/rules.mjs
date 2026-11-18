// bindgen 的第二段：机械规则。头文件里的一个声明，照已经定的写法
// （docs/project.md「已定的写法」）套出来在 JS 里是什么。
//
// 这里只放不需要人判断的规则。事件名、方法参数的所有权、哪些成员该合并成
// 一个上层写法，都不是从头文件算得出来的，不在这里。

/** 首字母小写。开头是一段缩写时整段小写：URL → url，ASCIICapable → asciiCapable */
export function lowerFirst(name) {
  const run = (name.match(/^[A-Z]+/) || [''])[0];
  if (run.length === 0) return name;
  if (run.length === name.length) return name.toLowerCase();
  if (run.length === 1) return run.toLowerCase() + name.slice(1);
  // 缩写后面接着小写字母：缩写的最后一个大写字母其实是下一个单词的开头
  if (/[a-z]/.test(name[run.length])) return run.slice(0, -1).toLowerCase() + name.slice(run.length - 1);
  return run.toLowerCase() + name.slice(run.length);
}

const startsWord = (text, at) => at < text.length && /[A-Z0-9]/.test(text[at]);

function commonPrefix(a, b) {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i += 1;
  return a.slice(0, i);
}

// 一个值和类型名共有的那一段，按单词切：两边在这一段后面都得是一个单词的开头，
// 这一段自己不能停在缩写中间，而且不能只是框架前缀（NS、UI 这样全大写的）
function sharedWithTypeName(constant, typeName) {
  let prefix = commonPrefix(constant, typeName);
  const fits = () => startsWord(constant, prefix.length) &&
    (prefix.length === typeName.length || startsWord(typeName, prefix.length)) &&
    /[a-z0-9]/.test(prefix[prefix.length - 1]);
  while (prefix.length > 0 && !fits()) prefix = prefix.slice(0, -1);
  return /[a-z]/.test(prefix) ? prefix : '';
}

// 一组名字之间共有的前缀和后缀，都按单词切
function sharedAmong(names) {
  if (names.length === 0) return { prefix: '', suffix: '' };
  if (names.length === 1) {
    // 只有一个值：只去掉 k 和框架前缀（kCAFoo → foo，NSFoo → foo）
    return { prefix: (names[0].match(/^k?[A-Z]{2,3}(?=[A-Z][a-z])/) || [''])[0], suffix: '' };
  }
  let prefix = names.reduce(commonPrefix);
  while (prefix.length > 0 && !names.every((n) => startsWord(n, prefix.length))) prefix = prefix.slice(0, -1);
  const reversed = names.map((n) => [...n.slice(prefix.length)].reverse().join(''));
  let suffix = [...reversed.reduce(commonPrefix)].reverse().join('');
  // 后缀要从一个单词的开头起（大写字母后面跟着小写），而且不能把哪个值整个吃掉
  while (suffix.length > 0 &&
         !(/^[A-Z][a-z]/.test(suffix) && names.every((n) => n.length > prefix.length + suffix.length))) {
    suffix = suffix.slice(1);
  }
  return { prefix, suffix };
}

/**
 * 枚举的值在 JS 里叫什么：去掉类型前缀，首字母小写。三层，每个值各算各的：
 *
 * 1. 值以类型名开头：去掉类型名（UISwitchStyleSliding → sliding）。类型名是复数时
 *    按单数算（UNAuthorizationOptions 的 UNAuthorizationOptionBadge → badge）
 * 2. 不以类型名开头：去掉它和类型名共有的那一段
 *    （NSLineBreakMode 的 NSLineBreakByWordWrapping → byWordWrapping）
 * 3. 和类型名只共有框架前缀，或者什么都不共有：这些值之间共有的前缀和后缀都去掉
 *    （NSFontAttributeName → font，kCALayerMinXMinYCorner → minXMinY）
 *
 * 一个数值有两个名字时，先声明的是主名。位掩码里数值是 0 的标成 zero：
 * JS 里它是空数组，不是一个名字。
 * @param {{ name: string | null, options?: boolean,
 *           constants: { name: string, value: string | null, deprecated?: boolean, unavailable?: boolean }[] }} decl
 */
export function enumValues(decl) {
  const typeName = decl.name || '';
  const stripped = new Map();
  const rest = [];
  let prefixIsTypeName = decl.constants.length > 0;
  // 类型名是复数时值用的是单数：UNAuthorizationOptions 的值是 UNAuthorizationOptionBadge
  const singular = /[a-z]s$/.test(typeName) ? typeName.slice(0, -1) : null;
  for (const c of decl.constants) {
    const whole = [typeName, singular].find((p) => p && c.name.startsWith(p) && startsWord(c.name, p.length));
    if (whole) {
      stripped.set(c.name, c.name.slice(whole.length));
      continue;
    }
    prefixIsTypeName = false;
    const shared = typeName ? sharedWithTypeName(c.name, typeName) : '';
    if (shared) stripped.set(c.name, c.name.slice(shared.length));
    else rest.push(c.name);
  }
  const { prefix, suffix } = sharedAmong(rest);
  for (const name of rest) stripped.set(name, name.slice(prefix.length, name.length - suffix.length));

  const main = new Map();
  const values = decl.constants.map((c) => {
    const js = lowerFirst(stripped.get(c.name));
    let aliasOf = null;
    if (c.value !== null && c.value !== undefined) {
      if (main.has(c.value)) aliasOf = main.get(c.value);
      else main.set(c.value, js);
    }
    return { objc: c.name, js, value: c.value, aliasOf, zero: decl.options === true && c.value === '0',
             deprecated: c.deprecated === true, unavailable: c.unavailable === true };
  });
  return { prefixIsTypeName, values };
}

/** 方法名：selector 的第一段是方法名，其余段是 options 对象的键 */
export function methodShape(selector) {
  if (!selector.includes(':')) return { name: selector, options: [], positional: 0 };
  const segments = selector.split(':').slice(0, -1);
  return { name: segments[0], options: segments.slice(1), positional: 1 };
}

/** 属性名：getter 是 is 开头的别名时用它（hidden → isHidden） */
export function propertyName(property) {
  return property.getter && /^is[A-Z]/.test(property.getter) ? property.getter : property.name;
}

const NUMBERS = new Set(['CGFloat', 'NSInteger', 'NSUInteger', 'NSTimeInterval', 'CFTimeInterval',
  'CFIndex', 'size_t', 'float', 'double', 'int', 'long', 'short', 'char', 'long long',
  'int8_t', 'int16_t', 'int32_t', 'int64_t', 'uint8_t', 'uint16_t', 'uint32_t', 'uint64_t',
  'UInt8', 'UInt16', 'UInt32', 'UInt64', 'SInt8', 'SInt16', 'SInt32', 'SInt64', 'unichar']);

/**
 * 一个类型按机械规则归到哪一种。归不了的是 unmapped：要么补规则，要么手写。
 * @param {string} type extract.mjs 清理过的类型写法
 * @param {{ enums: Map<string, { options: boolean }>, structs: Set<string>, classes: Set<string>,
 *           typedStrings?: Set<string>, typedefs?: Map<string, string> | null }} ctx
 */
export function typeKind(type, ctx) {
  if (type === 'void') return 'void';
  if (type === 'BOOL' || type === 'bool' || type === '_Bool') return 'boolean';
  if (NUMBERS.has(type) || NUMBERS.has(type.replace(/^(unsigned|signed) /, ''))) return 'number';
  if (type === 'NSString *') return 'string';
  if (type === 'UIColor *' || type === 'CGColorRef') return 'color';
  if (type === 'NSError **') return 'errorOut';
  if (type.includes('(^')) return 'block';
  if (ctx.enums.has(type)) return ctx.enums.get(type).options ? 'options' : 'enum';
  if (ctx.typedStrings && ctx.typedStrings.has(type)) return 'stringEnum';
  if (ctx.structs.has(type)) return 'struct';
  if (/^id<[\w, ]+>$/.test(type)) return 'delegate';
  if (type === 'instancetype') return 'object';
  const array = type.match(/^NSArray<(\w+) \*> \*$/);
  if (array) return ctx.classes.has(array[1]) ? 'array' : 'unmapped';
  const object = type.match(/^(\w+) \*$/);
  if (object && ctx.classes.has(object[1])) return 'object';
  // 起了别名的类型（CLLocationDistance 是 double，CGRect 是 struct CGRect）按它本来的类型算
  const actual = ctx.typedefs && ctx.typedefs.get(type);
  if (actual && actual !== type) {
    if (/^struct \w+$/.test(actual)) return 'struct';
    const named = actual.match(/^enum (\w+)$/);
    // 只知道它是个枚举、不知道它有哪些值的（别的框架的），按认不出算：没有值就建不了表
    if (named) return !ctx.enums.has(named[1]) ? 'unmapped' : ctx.enums.get(named[1]).options ? 'options' : 'enum';
    return typeKind(actual, { ...ctx, typedefs: null });
  }
  return 'unmapped';
}
