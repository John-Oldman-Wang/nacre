// 富文本：NSAttributedString / NSMutableAttributedString、段落样式、阴影、
// 附件，以及加在 UILabel / UITextField / UITextView / UIButton 上的那几个成员
//
// 这是内置脚本的一个 part：整个文件就是一个函数表达式，运行时按文件名
// 顺序编译执行，拿到函数之后用共享的 ctx 调一次。
//
// 文件名是 51- 不是 50-：它要往 UITextView 的原型上加成员，而 UITextView
// 定义在 50-text-view.js 里，按文件名排在 50-attributed-string 后面。
(function (ctx) {
  'use strict';

  const {
    RECT_FIELDS,
    SIZE_FIELDS,
    colorArg,
    colorString,
    constructNative,
    define,
    defineNativeClass,
    describeValue,
    has,
    nativeCall,
    nativeCallObject,
    nativeCallObjectArray,
    nativeClassCall,
    nativeClassObject,
    nativeGet,
    nativeGetObject,
    nativeGetOwned,
    nativeSet,
    nativeSetOwned,
    own,
    ownOne,
    requireNative,
    stateKey,
    stateOption,
    structArg,
    toBoolean,
    toInteger,
    toNumber,
    toRect,
    toSize,
    toText,
  } = ctx;

  // ---- 属性的名字和各自的值是哪一种 ----
  // 顺序和原生那张表（AttributeKeyPairs）一样，读出来的对象按这个顺序放键
  const ATTRIBUTE_KINDS = new Map([
    ['font', 'font'],
    ['paragraphStyle', 'paragraphStyle'],
    ['foregroundColor', 'color'],
    ['backgroundColor', 'color'],
    ['ligature', 'integer'],
    ['kern', 'number'],
    ['tracking', 'number'],
    ['strikethroughStyle', 'line'],
    ['underlineStyle', 'line'],
    ['strokeColor', 'color'],
    ['strokeWidth', 'number'],
    ['shadow', 'shadow'],
    ['attachment', 'attachment'],
    ['link', 'link'],
    ['baselineOffset', 'number'],
    ['underlineColor', 'color'],
    ['strikethroughColor', 'color'],
  ]);
  const ATTRIBUTE_NAMES = [...ATTRIBUTE_KINDS.keys()].join(' / ');
  // 这几种值的包装要由富文本的包装拿着：字体和附件的身份有意义，颜色的
  // 「写的串原样读回」记在颜色的包装上。段落样式和阴影放进去的是副本，
  // 外面那个对象和富文本没有关系，不拿
  const KEPT_KINDS = new Set(['font', 'color', 'attachment']);

  // 不认识的名字抛，并把能用的列出来——和枚举写错时一样
  function attributeKind(name) {
    const kind = typeof name === 'string' ? ATTRIBUTE_KINDS.get(name) : undefined;
    if (kind === undefined) {
      throw new TypeError('NSAttributedString has no attribute ' + describeValue(name) +
                          '; expected one of: ' + ATTRIBUTE_NAMES);
    }
    return kind;
  }
  function typed(value, cls, className, what) {
    if (!(value instanceof cls)) {
      throw new TypeError(what + ' must be a ' + className + ', got ' + describeValue(value));
    }
    return value;
  }
  // 一个属性的值，转成过桥的样子。照参数转换的规矩：数按数转，对象不转。
  // 返回 undefined 表示这个键不生效（颜色写错，已经警告过）
  function attributeValue(name, kind, value) {
    switch (kind) {
      case 'font': return typed(value, UIFont, 'UIFont', name);
      case 'paragraphStyle': return typed(value, NSParagraphStyle, 'NSParagraphStyle', name);
      case 'shadow': return typed(value, NSShadow, 'NSShadow', name);
      case 'attachment': return typed(value, NSTextAttachment, 'NSTextAttachment', name);
      case 'color':
        // 属性里没有「空的颜色」这个值：不要这个颜色就不带这个键
        if (value === null) {
          throw new TypeError(name + ' must be a color string or a UIColor, got null');
        }
        return colorArg(value, name);
      case 'integer': return toInteger(value, name);
      case 'number': return toNumber(value, name);
      case 'line':
        if (!Array.isArray(value)) {
          throw new TypeError(name + ' must be an array of style names, got ' +
                              describeValue(value));
        }
        return Array.from(value);
      default: return toText(value);   // link：字符串，URL 对象按它的地址
    }
  }
  // 一组属性 → 摊平的「键、值、键、值…」，接在方法的固定参数后面过桥。
  // 字典里对象和标量混在一起，而参数包本来就按下标分开装这两种（见
  // splitArgs），摊平之后正好能过。null / undefined 是「没有属性」；
  // 值是 undefined 的键视为没带
  function attributePairs(attributes, what) {
    if (attributes == null) return [];
    if (typeof attributes !== 'object') {
      throw new TypeError(what + ': attributes must be an object or null, got ' +
                          describeValue(attributes));
    }
    const pairs = [];
    for (const name of Object.keys(attributes)) {
      const value = attributes[name];
      if (value === undefined) continue;
      const converted = attributeValue(name, attributeKind(name), value);
      if (converted !== undefined) pairs.push(name, converted);
    }
    return pairs;
  }
  // 所有权：富文本持有放进去的字体、颜色、附件。只增不减——之后那一段被
  // 删掉、属性被换掉时不清理，多留一份引用不会给错答案
  function keepAttributeObjects(owner, pairs) {
    for (let i = 0; i + 1 < pairs.length; i += 2) {
      if (KEPT_KINDS.has(ATTRIBUTE_KINDS.get(pairs[i]))) ownOne(owner, 'attributes', pairs[i + 1]);
    }
  }
  // 读回来的一处属性。info 是原生给的前一半（标量的值、哪些键是对象），
  // objects 是后一半（那几个对象），从 offset 开始取
  function readAttributes(owner, info, objects, offset) {
    const byName = new Map();
    for (let i = 0; i < info.objects.length; i++) byName.set(info.objects[i], objects[offset + i]);
    const out = {};
    for (const [name, kind] of ATTRIBUTE_KINDS) {
      if (byName.has(name)) {
        const value = byName.get(name);
        if (KEPT_KINDS.has(kind)) ownOne(owner, 'attributes', value);
        out[name] = kind === 'color' ? colorString(value) : value;
      } else if (has(info.values, name)) {
        out[name] = info.values[name];
      }
    }
    return out;
  }

  // ---- 范围和下标 ----
  // NSRange 定义在多行输入那个 part 里（全局）。那边的 rangeArg 没有导出，
  // 这里照着写一份。字段按整数转；负数和越界由原生拒，它知道字符串多长
  const RANGE_FIELDS = ['location', 'length'];
  function rangeArg(value, what) {
    const o = structArg(value, RANGE_FIELDS, what);
    return { location: Math.trunc(o.location) + 0, length: Math.trunc(o.length) + 0 };
  }
  function rangeOption(options, what) {
    const o = options || {};
    if (!has(o, 'range')) throw new TypeError(what + ' needs { range }');
    return rangeArg(o.range, what + ' range');
  }
  function attributedArg(value, what) {
    if (!(value instanceof NSAttributedString)) {
      throw new TypeError(what + ' needs an NSAttributedString, got ' + describeValue(value));
    }
    return value;
  }

  // ---- NSParagraphStyle ----
  // 段落样式：对齐、行距、段距、缩进、换行方式。这个类的属性只读；可改的是
  // 下面的 NSMutableParagraphStyle
  const NSParagraphStyle = defineNativeClass('NSParagraphStyle', class NSParagraphStyle extends NSObject {
    constructor() {
      super();
      constructNative(this, new.target, 'NSParagraphStyle', []);
    }
    static get defaultParagraphStyle() {
      return nativeClassObject('NSParagraphStyle', 'defaultParagraphStyle');
    }

    get alignment() { requireNative(this, 'alignment'); return nativeGet(this, 'alignment'); }
    get lineSpacing() { requireNative(this, 'lineSpacing'); return nativeGet(this, 'lineSpacing'); }
    get paragraphSpacing() {
      requireNative(this, 'paragraphSpacing');
      return nativeGet(this, 'paragraphSpacing');
    }
    get paragraphSpacingBefore() {
      requireNative(this, 'paragraphSpacingBefore');
      return nativeGet(this, 'paragraphSpacingBefore');
    }
    get firstLineHeadIndent() {
      requireNative(this, 'firstLineHeadIndent');
      return nativeGet(this, 'firstLineHeadIndent');
    }
    get headIndent() { requireNative(this, 'headIndent'); return nativeGet(this, 'headIndent'); }
    get tailIndent() { requireNative(this, 'tailIndent'); return nativeGet(this, 'tailIndent'); }
    get lineBreakMode() {
      requireNative(this, 'lineBreakMode');
      return nativeGet(this, 'lineBreakMode');
    }
    get minimumLineHeight() {
      requireNative(this, 'minimumLineHeight');
      return nativeGet(this, 'minimumLineHeight');
    }
    get maximumLineHeight() {
      requireNative(this, 'maximumLineHeight');
      return nativeGet(this, 'maximumLineHeight');
    }
    get lineHeightMultiple() {
      requireNative(this, 'lineHeightMultiple');
      return nativeGet(this, 'lineHeightMultiple');
    }
    get baseWritingDirection() {
      requireNative(this, 'baseWritingDirection');
      return nativeGet(this, 'baseWritingDirection');
    }
    get hyphenationFactor() {
      requireNative(this, 'hyphenationFactor');
      return nativeGet(this, 'hyphenationFactor');
    }
    get defaultTabInterval() {
      requireNative(this, 'defaultTabInterval');
      return nativeGet(this, 'defaultTabInterval');
    }
    get allowsDefaultTighteningForTruncation() {
      requireNative(this, 'allowsDefaultTighteningForTruncation');
      return nativeGet(this, 'allowsDefaultTighteningForTruncation');
    }

    copy() { return nativeCallObject(this, 'copy', []); }
    mutableCopy() { return nativeCallObject(this, 'mutableCopy', []); }
  });

  // 可改的段落样式。取值器在这里再写一遍：子类只定义 setter 的话，同名的
  // getter 会被遮住（访问器属性是整个替换的）
  defineNativeClass('NSMutableParagraphStyle', class NSMutableParagraphStyle extends NSParagraphStyle {
    constructor() {
      super();
      constructNative(this, new.target, 'NSMutableParagraphStyle', []);
    }

    get alignment() { requireNative(this, 'alignment'); return nativeGet(this, 'alignment'); }
    set alignment(value) { requireNative(this, 'alignment'); nativeSet(this, 'alignment', value); }
    get lineSpacing() { requireNative(this, 'lineSpacing'); return nativeGet(this, 'lineSpacing'); }
    set lineSpacing(value) {
      requireNative(this, 'lineSpacing');
      nativeSet(this, 'lineSpacing', toNumber(value, 'lineSpacing'));
    }
    get paragraphSpacing() {
      requireNative(this, 'paragraphSpacing');
      return nativeGet(this, 'paragraphSpacing');
    }
    set paragraphSpacing(value) {
      requireNative(this, 'paragraphSpacing');
      nativeSet(this, 'paragraphSpacing', toNumber(value, 'paragraphSpacing'));
    }
    get paragraphSpacingBefore() {
      requireNative(this, 'paragraphSpacingBefore');
      return nativeGet(this, 'paragraphSpacingBefore');
    }
    set paragraphSpacingBefore(value) {
      requireNative(this, 'paragraphSpacingBefore');
      nativeSet(this, 'paragraphSpacingBefore', toNumber(value, 'paragraphSpacingBefore'));
    }
    get firstLineHeadIndent() {
      requireNative(this, 'firstLineHeadIndent');
      return nativeGet(this, 'firstLineHeadIndent');
    }
    set firstLineHeadIndent(value) {
      requireNative(this, 'firstLineHeadIndent');
      nativeSet(this, 'firstLineHeadIndent', toNumber(value, 'firstLineHeadIndent'));
    }
    get headIndent() { requireNative(this, 'headIndent'); return nativeGet(this, 'headIndent'); }
    set headIndent(value) {
      requireNative(this, 'headIndent');
      nativeSet(this, 'headIndent', toNumber(value, 'headIndent'));
    }
    get tailIndent() { requireNative(this, 'tailIndent'); return nativeGet(this, 'tailIndent'); }
    set tailIndent(value) {
      requireNative(this, 'tailIndent');
      nativeSet(this, 'tailIndent', toNumber(value, 'tailIndent'));
    }
    get lineBreakMode() {
      requireNative(this, 'lineBreakMode');
      return nativeGet(this, 'lineBreakMode');
    }
    set lineBreakMode(value) {
      requireNative(this, 'lineBreakMode');
      nativeSet(this, 'lineBreakMode', value);
    }
    get minimumLineHeight() {
      requireNative(this, 'minimumLineHeight');
      return nativeGet(this, 'minimumLineHeight');
    }
    set minimumLineHeight(value) {
      requireNative(this, 'minimumLineHeight');
      nativeSet(this, 'minimumLineHeight', toNumber(value, 'minimumLineHeight'));
    }
    get maximumLineHeight() {
      requireNative(this, 'maximumLineHeight');
      return nativeGet(this, 'maximumLineHeight');
    }
    set maximumLineHeight(value) {
      requireNative(this, 'maximumLineHeight');
      nativeSet(this, 'maximumLineHeight', toNumber(value, 'maximumLineHeight'));
    }
    get lineHeightMultiple() {
      requireNative(this, 'lineHeightMultiple');
      return nativeGet(this, 'lineHeightMultiple');
    }
    set lineHeightMultiple(value) {
      requireNative(this, 'lineHeightMultiple');
      nativeSet(this, 'lineHeightMultiple', toNumber(value, 'lineHeightMultiple'));
    }
    get baseWritingDirection() {
      requireNative(this, 'baseWritingDirection');
      return nativeGet(this, 'baseWritingDirection');
    }
    set baseWritingDirection(value) {
      requireNative(this, 'baseWritingDirection');
      nativeSet(this, 'baseWritingDirection', value);
    }
    get hyphenationFactor() {
      requireNative(this, 'hyphenationFactor');
      return nativeGet(this, 'hyphenationFactor');
    }
    set hyphenationFactor(value) {
      requireNative(this, 'hyphenationFactor');
      nativeSet(this, 'hyphenationFactor', toNumber(value, 'hyphenationFactor'));
    }
    get defaultTabInterval() {
      requireNative(this, 'defaultTabInterval');
      return nativeGet(this, 'defaultTabInterval');
    }
    set defaultTabInterval(value) {
      requireNative(this, 'defaultTabInterval');
      nativeSet(this, 'defaultTabInterval', toNumber(value, 'defaultTabInterval'));
    }
    get allowsDefaultTighteningForTruncation() {
      requireNative(this, 'allowsDefaultTighteningForTruncation');
      return nativeGet(this, 'allowsDefaultTighteningForTruncation');
    }
    set allowsDefaultTighteningForTruncation(value) {
      requireNative(this, 'allowsDefaultTighteningForTruncation');
      nativeSet(this, 'allowsDefaultTighteningForTruncation', toBoolean(value));
    }

    // 把另一个段落样式的属性值全部抄过来。抄完和参数没有关系，不记所有权边
    setParagraphStyle(style) {
      nativeCall(this, 'setParagraphStyle:',
                 [typed(style, NSParagraphStyle, 'NSParagraphStyle', 'setParagraphStyle style')]);
    }
  });

  // ---- NSShadow ----
  const NSShadow = defineNativeClass('NSShadow', class NSShadow extends NSObject {
    constructor() {
      super();
      constructNative(this, new.target, 'NSShadow', []);
    }
    get shadowOffset() {
      requireNative(this, 'shadowOffset');
      return toSize(nativeGet(this, 'shadowOffset'));
    }
    set shadowOffset(value) {
      requireNative(this, 'shadowOffset');
      nativeSet(this, 'shadowOffset', structArg(value, SIZE_FIELDS, 'shadowOffset'));
    }
    get shadowBlurRadius() {
      requireNative(this, 'shadowBlurRadius');
      return nativeGet(this, 'shadowBlurRadius');
    }
    set shadowBlurRadius(value) {
      requireNative(this, 'shadowBlurRadius');
      nativeSet(this, 'shadowBlurRadius', toNumber(value, 'shadowBlurRadius'));
    }
    get shadowColor() {
      requireNative(this, 'shadowColor');
      return colorString(nativeGetOwned(this, 'shadowColor'));
    }
    set shadowColor(value) {
      requireNative(this, 'shadowColor');
      const color = colorArg(value, 'shadowColor');
      if (color === undefined) return;   // 不合法，警告过了，保留旧值
      nativeSetOwned(this, 'shadowColor', color);
    }
  });

  // ---- NSTextAttachment ----
  // 富文本里的一个附件：在一个字符的位置上显示一张图片
  const NSTextAttachment = defineNativeClass('NSTextAttachment', class NSTextAttachment extends NSObject {
    constructor() {
      super();
      constructNative(this, new.target, 'NSTextAttachment', []);
    }
    static textAttachmentWithImage(image) {
      const attachment = nativeClassCall(
        'NSTextAttachment', 'textAttachmentWithImage:',
        [typed(image, UIImage, 'UIImage', 'textAttachmentWithImage image')]);
      own(attachment, 'image', image);
      return attachment;
    }
    get image() { requireNative(this, 'image'); return nativeGetOwned(this, 'image'); }
    set image(value) { requireNative(this, 'image'); nativeSetOwned(this, 'image', value); }
    get bounds() { requireNative(this, 'bounds'); return toRect(nativeGet(this, 'bounds')); }
    set bounds(value) {
      requireNative(this, 'bounds');
      nativeSet(this, 'bounds', structArg(value, RECT_FIELDS, 'bounds'));
    }
  });

  // ---- NSAttributedString ----
  // 构造的三种写法：不给参数、文字加一组属性、照另一个富文本抄一份
  function initArgs(owner, className, string, attributes) {
    if (string instanceof NSAttributedString) {
      // 抄过来的属性值还是原来那些对象，由原来那个富文本的包装拿着
      ownOne(owner, 'sources', string);
      return [string];
    }
    if (string === undefined && attributes === undefined) return [];
    const pairs = attributePairs(attributes, 'new ' + className);
    keepAttributeObjects(owner, pairs);
    return [toText(string), ...pairs];
  }

  const NSAttributedString = defineNativeClass('NSAttributedString', class NSAttributedString extends NSObject {
    constructor(string, attributes) {
      super();
      // 子类的 super() 也会走到这里。那时建原生对象的是子类，参数不用算两遍
      if (new.target !== NSAttributedString) return;
      constructNative(this, new.target, 'NSAttributedString',
                      initArgs(this, 'NSAttributedString', string, attributes));
    }

    // 只含一个附件的富文本：一个占位字符（U+FFFC）带着 attachment 属性
    static attributedStringWithAttachment(attachment, options) {
      const o = options || {};
      const pairs = attributePairs(has(o, 'attributes') ? o.attributes : null,
                                   'attributedStringWithAttachment');
      const result = nativeClassCall(
        'NSAttributedString', 'attributedStringWithAttachment:attributes:',
        [typed(attachment, NSTextAttachment, 'NSTextAttachment',
               'attributedStringWithAttachment attachment'),
         ...pairs]);
      ownOne(result, 'attributes', attachment);
      keepAttributeObjects(result, pairs);
      return result;
    }

    get string() { requireNative(this, 'string'); return nativeGet(this, 'string'); }
    get length() { requireNative(this, 'length'); return nativeGet(this, 'length'); }

    // 读一处的属性要过两次桥：先要标量的值和「哪些键是对象」，再要那几个
    // 对象（一次调用的返回值要么是 JSON、要么是对象数组，装不下混在一起的）。
    // 没有对象值时省掉第二次
    attributesAtIndex(index) {
      const at = toInteger(index, 'attributesAtIndex index');
      const info = nativeCall(this, 'nacre:attributesAtIndex:', [at]);
      const objects = info.objects.length === 0
        ? [] : nativeCallObjectArray(this, 'nacre:attributeObjectsAtIndex:', [at]);
      return readAttributes(this, info, objects, 0);
    }
    attribute(name, options) {
      attributeKind(name);
      const o = options || {};
      if (!has(o, 'atIndex')) throw new TypeError('attribute needs { atIndex }');
      const value = this.attributesAtIndex(o.atIndex)[name];
      return value === undefined ? null : value;
    }
    // 按「属性相同的连续一段」遍历。先把所有段一次取回来，再逐段调回调：
    // 遍历的是调用那一刻的内容，回调里改这个富文本不影响这一轮
    enumerateAttributesInRange(range, callback) {
      const r = rangeArg(range, 'enumerateAttributesInRange range');
      if (typeof callback !== 'function') {
        throw new TypeError('enumerateAttributesInRange needs a callback function, got ' +
                            describeValue(callback));
      }
      const runs = nativeCall(this, 'nacre:runsInRange:', [r]);
      const objects = runs.some((run) => run.objects.length > 0)
        ? nativeCallObjectArray(this, 'nacre:runObjectsInRange:', [r]) : [];
      let offset = 0;
      const items = runs.map((run) => {
        const attributes = readAttributes(this, run, objects, offset);
        offset += run.objects.length;
        return [attributes, new NSRange(run.range.location, run.range.length)];
      });
      for (const [attributes, runRange] of items) callback(attributes, runRange);
    }
    attributedSubstringFromRange(range) {
      const result = nativeCallObject(
        this, 'attributedSubstringFromRange:',
        [rangeArg(range, 'attributedSubstringFromRange range')]);
      ownOne(result, 'sources', this);
      return result;
    }
    isEqualToAttributedString(other) {
      return nativeCall(this, 'isEqualToAttributedString:',
                        [attributedArg(other, 'isEqualToAttributedString')]);
    }
    containsAttachmentsInRange(range) {
      return nativeCall(this, 'containsAttachmentsInRange:',
                        [rangeArg(range, 'containsAttachmentsInRange range')]);
    }

    // ---- 量尺寸 ----
    size() { return toSize(nativeCall(this, 'size', [])); }
    boundingRectWithSize(size, options) {
      const o = options || {};
      const given = has(o, 'options') ? o.options : [];
      if (!Array.isArray(given)) {
        throw new TypeError('boundingRectWithSize options must be an array of option names, got ' +
                            describeValue(given));
      }
      return toRect(nativeCall(this, 'boundingRectWithSize:options:context:',
                               [structArg(size, SIZE_FIELDS, 'boundingRectWithSize'),
                                Array.from(given)]));
    }

    // ---- 副本 ----
    copy() {
      const result = nativeCallObject(this, 'copy', []);
      if (result !== this) ownOne(result, 'sources', this);
      return result;
    }
    mutableCopy() {
      const result = nativeCallObject(this, 'mutableCopy', []);
      ownOne(result, 'sources', this);
      return result;
    }
  });

  // ---- NSMutableAttributedString ----
  defineNativeClass('NSMutableAttributedString', class NSMutableAttributedString extends NSAttributedString {
    constructor(string, attributes) {
      super();
      constructNative(this, new.target, 'NSMutableAttributedString',
                      initArgs(this, 'NSMutableAttributedString', string, attributes));
    }

    // 换文字。withString 和 withAttributedString 给一个
    replaceCharactersInRange(range, options) {
      const r = rangeArg(range, 'replaceCharactersInRange range');
      const o = options || {};
      if (has(o, 'withAttributedString')) {
        const other = attributedArg(o.withAttributedString,
                                    'replaceCharactersInRange withAttributedString');
        nativeCall(this, 'replaceCharactersInRange:withAttributedString:', [r, other]);
        ownOne(this, 'sources', other);
        return;
      }
      if (!has(o, 'withString')) {
        throw new TypeError(
          'replaceCharactersInRange needs { withString } or { withAttributedString }');
      }
      nativeCall(this, 'replaceCharactersInRange:withString:', [r, toText(o.withString)]);
    }
    // 属性摊平了接在 range 后面过桥，见 attributePairs
    setAttributes(attributes, options) {
      const r = rangeOption(options, 'setAttributes');
      const pairs = attributePairs(attributes, 'setAttributes');
      nativeCall(this, 'setAttributes:range:', [r, ...pairs]);
      keepAttributeObjects(this, pairs);
    }
    addAttribute(name, options) {
      const kind = attributeKind(name);
      const o = options || {};
      if (!has(o, 'value')) throw new TypeError('addAttribute needs { value }');
      const r = rangeOption(o, 'addAttribute');
      const converted = attributeValue(name, kind, o.value);
      if (converted === undefined) return;   // 颜色写错，警告过了，什么都不加
      nativeCall(this, 'addAttributes:range:', [r, name, converted]);
      keepAttributeObjects(this, [name, converted]);
    }
    addAttributes(attributes, options) {
      const r = rangeOption(options, 'addAttributes');
      const pairs = attributePairs(attributes, 'addAttributes');
      if (pairs.length === 0) return;
      nativeCall(this, 'addAttributes:range:', [r, ...pairs]);
      keepAttributeObjects(this, pairs);
    }
    removeAttribute(name, options) {
      attributeKind(name);
      nativeCall(this, 'removeAttribute:range:', [name, rangeOption(options, 'removeAttribute')]);
    }
    appendAttributedString(attributedString) {
      const other = attributedArg(attributedString, 'appendAttributedString');
      nativeCall(this, 'appendAttributedString:', [other]);
      ownOne(this, 'sources', other);
    }
    insertAttributedString(attributedString, options) {
      const other = attributedArg(attributedString, 'insertAttributedString');
      const o = options || {};
      if (!has(o, 'atIndex')) throw new TypeError('insertAttributedString needs { atIndex }');
      nativeCall(this, 'insertAttributedString:atIndex:',
                 [other, toInteger(o.atIndex, 'insertAttributedString atIndex')]);
      ownOne(this, 'sources', other);
    }
    deleteCharactersInRange(range) {
      nativeCall(this, 'deleteCharactersInRange:',
                 [rangeArg(range, 'deleteCharactersInRange range')]);
    }
    setAttributedString(attributedString) {
      const other = attributedArg(attributedString, 'setAttributedString');
      nativeCall(this, 'setAttributedString:', [other]);
      ownOne(this, 'sources', other);
    }
  });

  // ---- 加在已有的类上的成员 ----
  //
  // 视图拿走的是赋值那一刻的内容（原生那边 copy 了一份），读回来的是一份
  // 不可改的快照，不保证是写进去的那个对象。所以：
  //   写：记一条所有权边，写进去的那个富文本的包装由视图拿着——它手里拿着
  //       字体、颜色、附件的包装，读回来的快照里的属性值才认得出来
  //   读：不记边（不走 nativeGetOwned）。读回来的快照是个新包装，手里没有
  //       那些边；拿它把写进去的那条边换掉，反而把该留的放走了
  //
  // 取值器写成这一层的具名函数，属性名一律写成字面量：check-api.sh 是按
  // 字面量核对的（取值器里的属性名、defineProperty 的第二个参数），藏在
  // 循环或者变量里它看不见
  function readAttributedText() {
    requireNative(this, 'attributedText');
    return nativeGetObject(this, 'attributedText');
  }
  function writeAttributedText(value) {
    requireNative(this, 'attributedText');
    nativeSetOwned(this, 'attributedText', value);
  }
  function readAttributedPlaceholder() {
    requireNative(this, 'attributedPlaceholder');
    return nativeGetObject(this, 'attributedPlaceholder');
  }
  function writeAttributedPlaceholder(value) {
    requireNative(this, 'attributedPlaceholder');
    nativeSetOwned(this, 'attributedPlaceholder', value);
  }
  function readCurrentAttributedTitle() {
    requireNative(this, 'currentAttributedTitle');
    return nativeGetObject(this, 'currentAttributedTitle');
  }
  Object.defineProperty(UILabel.prototype, 'attributedText', {
    configurable: true, enumerable: false, get: readAttributedText, set: writeAttributedText,
  });
  Object.defineProperty(UITextField.prototype, 'attributedText', {
    configurable: true, enumerable: false, get: readAttributedText, set: writeAttributedText,
  });
  Object.defineProperty(UITextField.prototype, 'attributedPlaceholder', {
    configurable: true,
    enumerable: false,
    get: readAttributedPlaceholder,
    set: writeAttributedPlaceholder,
  });
  Object.defineProperty(UITextView.prototype, 'attributedText', {
    configurable: true, enumerable: false, get: readAttributedText, set: writeAttributedText,
  });

  // UIButton：按状态的富文本标题。和 setTitle / titleForState 是同一套形状
  define(UIButton.prototype, 'setAttributedTitle', function setAttributedTitle(title, options) {
    const state = stateOption(options, 'setAttributedTitle');
    if (title != null) attributedArg(title, 'setAttributedTitle');
    nativeCall(this, 'setAttributedTitle:forState:', [title == null ? null : title, state]);
    own(this, stateKey('attributedTitle', state), title == null ? null : title);
  });
  // 取值这一侧只认单个状态，和 titleForState 一样
  define(UIButton.prototype, 'attributedTitleForState', function attributedTitleForState(state) {
    return nativeCallObject(this, 'attributedTitleForState:', [[state]]);
  });
  Object.defineProperty(UIButton.prototype, 'currentAttributedTitle', {
    configurable: true, enumerable: false, get: readCurrentAttributedTitle,
  });
})
