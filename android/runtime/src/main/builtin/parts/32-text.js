// 文字：TextView 上的字号、颜色、字体、对齐、行数、省略号、行高、字间距、可选中、测量，
// View 上的 textAlignment，以及 Typeface。原生那一侧是 TextDomain.kt。
//
// 这是内置脚本的一个 part：整个文件就是一个函数表达式，运行时按文件名
// 顺序编译执行，拿到函数之后用共享的 ctx 调一次。
//
// 规矩（project.md 第 4 节）：getter 和 setter 名字对得上才合成一个属性，和 Kotlin 一样
// （isTextSelectable 只读、配 setTextIsSelectable()；没有 getTextColor，所以是
// setTextColor() 加只读的 currentTextColor）。一处例外：getTextSize() 是像素、
// setTextSize(size) 是 sp，两边单位不同，所以 textSize 只读，写走 setTextSize()。
// 整数常量是字符串枚举，名字和数值的映射只在原生（枚举属性写错时原生给警告，桥打出来）；
// 颜色是 CSS 写法的字符串，用 30-appearance.js 放在 ctx 上的那几个函数解析。
// 往已有的类上加成员在这个文件里加，不改 10-view.js。
(function (ctx) {
  'use strict';

  const {
    colorArgument,
    colorProperty,
    colorText,
    defineNativeClass,
    nativeCall,
    nativeCallObject,
    nativeClassCallObject,
    nativeClassObject,
    nativeGet,
    nativeOnly,
    nativeSet,
    own,
    requireInstance,
    toInteger,
    toNumber,
    toText,
    toTextOrNull,
  } = ctx;

  const { View, TextView } = globalThis;

  // ---- 参数转换：照 Web IDL（project.md 第 13 条）----

  function describe(v) {
    return ctx.describeValue(v);
  }
  function needArgs(count, given, where) {
    if (given < count) {
      throw new TypeError("Failed to execute '" + where + "': " + count + ' argument' +
                          (count > 1 ? 's' : '') + ' required, but only ' + given + ' present.');
    }
  }
  // sequence<DOMString>：可迭代的对象，每一项 String()
  function toStringList(v, where) {
    if (v === null || typeof v !== 'object' || typeof v[Symbol.iterator] !== 'function') {
      throw new TypeError(where + ': expected an array of strings, got ' + describe(v));
    }
    return Array.from(v, String);
  }

  // 把一个类体里写的成员（不含 constructor）原样搬到已有的原型上：和直接写在类里一样，
  // 不可枚举、可配置
  function addMembers(target, source) {
    const descriptors = Object.getOwnPropertyDescriptors(source.prototype);
    delete descriptors.constructor;
    Object.defineProperties(target.prototype, descriptors);
  }

  // ---- Typeface ----

  // 字体。不能 new（Java 也没有公开的构造），用静态的几个常量和工厂方法取。不可变
  class Typeface {
    constructor() {
      nativeOnly(new.target);
    }

    static get DEFAULT() { return nativeClassObject('Typeface', 'DEFAULT'); }
    static get DEFAULT_BOLD() { return nativeClassObject('Typeface', 'DEFAULT_BOLD'); }
    static get SANS_SERIF() { return nativeClassObject('Typeface', 'SANS_SERIF'); }
    static get SERIF() { return nativeClassObject('Typeface', 'SERIF'); }
    static get MONOSPACE() { return nativeClassObject('Typeface', 'MONOSPACE'); }

    // 三个重载，和 Java 一样：
    //   create(familyName, style)       familyName 是字体族的名字（'serif'、'monospace'……）或 null
    //   create(family, style)           family 是一个 Typeface
    //   create(family, weight, italic)  weight 是 1–1000 的粗细
    static create(family, styleOrWeight, italic) {
      needArgs(2, arguments.length, 'create');
      if (family instanceof Typeface) {
        requireInstance(family, Typeface, 'create');
        if (arguments.length >= 3) {
          return nativeClassCallObject('Typeface', 'create',
            [family, toInteger(styleOrWeight, 'create'), Boolean(italic)]);
        }
        return nativeClassCallObject('Typeface', 'create', [family, toText(styleOrWeight)]);
      }
      if (arguments.length >= 3) {
        throw new TypeError('create(family, weight, italic): family must be a Typeface, got ' + describe(family));
      }
      return nativeClassCallObject('Typeface', 'create',
        [family == null ? null : String(family), toText(styleOrWeight)]);
    }

    static defaultFromStyle(style) {
      needArgs(1, arguments.length, 'defaultFromStyle');
      return nativeClassCallObject('Typeface', 'defaultFromStyle', [toText(style)]);
    }

    // 从项目的 assets/ 读一个字体文件（.ttf、.otf）。同步，和 Java 一样。
    // 路径相对 assets/；找不到时是 Java 抛的异常
    static createFromAsset(path) {
      needArgs(1, arguments.length, 'createFromAsset');
      return nativeClassCallObject('Typeface', 'createFromAsset', [toText(path)]);
    }

    get style() { return nativeGet(this, 'style'); }
    get weight() { return nativeGet(this, 'weight'); }
    get isBold() { return nativeGet(this, 'isBold'); }
    get isItalic() { return nativeGet(this, 'isItalic'); }
  }
  defineNativeClass('Typeface', Typeface);

  // ---- View ----

  class ViewTextMembers {
    get textAlignment() { return nativeGet(this, 'textAlignment'); }
    set textAlignment(v) { nativeSet(this, 'textAlignment', toText(v)); }
  }
  addMembers(View, ViewTextMembers);

  // ---- TextView ----

  class TextViewTextMembers {
    // 字号，单位是像素。只读：写走 setTextSize()
    get textSize() { return nativeGet(this, 'textSize'); }
    // 上次设字号用的单位
    get textSizeUnit() { return nativeGet(this, 'textSizeUnit'); }

    // setTextSize(size)：单位是 sp（跟着用户的字体大小设置缩放）
    // setTextSize(unit, size)：unit 是 'px' | 'dip' | 'sp' | 'pt' | 'in' | 'mm'
    setTextSize(unitOrSize, size) {
      needArgs(1, arguments.length, 'setTextSize');
      if (arguments.length >= 2) {
        const value = toNumber(size, 'setTextSize');
        nativeCall(this, 'setTextSize', [toText(unitOrSize), value]);
      } else {
        nativeCall(this, 'setTextSize', [toNumber(unitOrSize, 'setTextSize')]);
      }
    }

    // 文字颜色。Java 没有 getTextColor()，读是 currentTextColor
    setTextColor(color) {
      needArgs(1, arguments.length, 'setTextColor');
      nativeCall(this, 'setTextColor', [colorArgument('setTextColor', color)]);
    }
    get currentTextColor() { return colorText(nativeGet(this, 'currentTextColor')); }

    // 选中文字时的底色
    get highlightColor() { return colorText(nativeGet(this, 'highlightColor')); }
    set highlightColor(v) {
      const argb = colorProperty('highlightColor', v);
      if (argb !== null) nativeSet(this, 'highlightColor', argb);
    }

    get typeface() { return nativeCallObject(this, 'getTypeface', []); }
    // null 和 undefined 是系统默认的字体
    set typeface(v) {
      const tf = v == null ? null : requireInstance(v, Typeface, 'typeface');
      nativeCall(this, 'setTypeface', [tf]);
      own(this, 'typeface', tf);
    }

    // 在 typeface 的基础上要粗体、斜体：字体本身没有这个样式时系统合成（加粗、倾斜）
    setTypeface(typeface, style) {
      needArgs(1, arguments.length, 'setTypeface');
      const tf = typeface == null ? null : requireInstance(typeface, Typeface, 'setTypeface');
      if (arguments.length >= 2) nativeCall(this, 'setTypeface', [tf, toText(style)]);
      else nativeCall(this, 'setTypeface', [tf]);
      own(this, 'typeface', tf);
    }

    // 文字在视图里怎么放：名字的数组
    get gravity() { return nativeGet(this, 'gravity'); }
    set gravity(v) { nativeSet(this, 'gravity', toStringList(v, 'gravity')); }

    get maxLines() { return nativeGet(this, 'maxLines'); }
    set maxLines(v) { nativeSet(this, 'maxLines', toInteger(v, 'maxLines')); }
    get minLines() { return nativeGet(this, 'minLines'); }
    set minLines(v) { nativeSet(this, 'minLines', toInteger(v, 'minLines')); }
    // 固定行数：maxLines 和 minLines 都设成 n
    setLines(lines) {
      needArgs(1, arguments.length, 'setLines');
      nativeCall(this, 'setLines', [toInteger(lines, 'setLines')]);
    }

    // 放不下时在哪里加省略号；null 是不加
    get ellipsize() { return nativeGet(this, 'ellipsize'); }
    set ellipsize(v) { nativeSet(this, 'ellipsize', v == null ? null : String(v)); }

    // 行高，单位是像素
    get lineHeight() { return nativeGet(this, 'lineHeight'); }
    set lineHeight(v) { nativeSet(this, 'lineHeight', toInteger(v, 'lineHeight')); }
    // setLineHeight(px)，或 setLineHeight(unit, value)：unit 和 setTextSize 的一样
    setLineHeight(unitOrHeight, height) {
      needArgs(1, arguments.length, 'setLineHeight');
      if (arguments.length >= 2) {
        const value = toNumber(height, 'setLineHeight');
        nativeCall(this, 'setLineHeight', [toText(unitOrHeight), value]);
      } else {
        nativeCall(this, 'setLineHeight', [toInteger(unitOrHeight, 'setLineHeight')]);
      }
    }
    // 行距：每行的高度是「字体的行高 × mult + add」，add 的单位是像素
    get lineSpacingExtra() { return nativeGet(this, 'lineSpacingExtra'); }
    get lineSpacingMultiplier() { return nativeGet(this, 'lineSpacingMultiplier'); }
    setLineSpacing(add, mult) {
      needArgs(2, arguments.length, 'setLineSpacing');
      nativeCall(this, 'setLineSpacing', [toNumber(add, 'setLineSpacing'), toNumber(mult, 'setLineSpacing')]);
    }

    // 字间距，单位是 em（字号的倍数）
    get letterSpacing() { return nativeGet(this, 'letterSpacing'); }
    set letterSpacing(v) { nativeSet(this, 'letterSpacing', toNumber(v, 'letterSpacing')); }

    // 行的上下要不要留出字体自带的余量（给重音符号这类高出来的字）
    get includeFontPadding() { return nativeGet(this, 'includeFontPadding'); }
    set includeFontPadding(v) { nativeSet(this, 'includeFontPadding', Boolean(v)); }

    // 用户能不能长按选中文字、复制
    get isTextSelectable() { return nativeGet(this, 'isTextSelectable'); }
    setTextIsSelectable(selectable) {
      needArgs(1, arguments.length, 'setTextIsSelectable');
      nativeCall(this, 'setTextIsSelectable', [Boolean(selectable)]);
    }

    // 字体特性，CSS 的 font-feature-settings 写法（"'tnum'" 是等宽数字）；null 是不设
    get fontFeatureSettings() { return nativeGet(this, 'fontFeatureSettings'); }
    set fontFeatureSettings(v) { nativeSet(this, 'fontFeatureSettings', toTextOrNull(v)); }

    // 可变字体的轴，CSS 的 font-variation-settings 写法（"'wght' 700"）。Java 的 setter 有
    // 返回值（有没有一个字体文件用上了），所以读是只读属性、写是方法，和 Kotlin 一样
    get fontVariationSettings() { return nativeGet(this, 'fontVariationSettings'); }
    setFontVariationSettings(settings) {
      needArgs(1, arguments.length, 'setFontVariationSettings');
      return nativeCall(this, 'setFontVariationSettings', [toTextOrNull(settings)]);
    }

    // 第一行的基线到视图顶边、最后一行的基线到底边的距离，单位是像素。靠改上下内边距实现
    get firstBaselineToTopHeight() { return nativeGet(this, 'firstBaselineToTopHeight'); }
    set firstBaselineToTopHeight(v) {
      nativeSet(this, 'firstBaselineToTopHeight', toInteger(v, 'firstBaselineToTopHeight'));
    }
    get lastBaselineToBottomHeight() { return nativeGet(this, 'lastBaselineToBottomHeight'); }
    set lastBaselineToBottomHeight(v) {
      nativeSet(this, 'lastBaselineToBottomHeight', toInteger(v, 'lastBaselineToBottomHeight'));
    }

    // 自动缩字号：放不下时在一组字号里挑能放下的最大的。视图的宽高要是定的才生效
    get autoSizeTextType() { return nativeGet(this, 'autoSizeTextType'); }
    get autoSizeMinTextSize() { return nativeGet(this, 'autoSizeMinTextSize'); }
    get autoSizeMaxTextSize() { return nativeGet(this, 'autoSizeMaxTextSize'); }
    get autoSizeStepGranularity() { return nativeGet(this, 'autoSizeStepGranularity'); }
    // 可选的字号，单位是像素
    get autoSizeTextAvailableSizes() { return nativeGet(this, 'autoSizeTextAvailableSizes'); }
    // type 是 'none' | 'uniform'
    setAutoSizeTextTypeWithDefaults(type) {
      needArgs(1, arguments.length, 'setAutoSizeTextTypeWithDefaults');
      nativeCall(this, 'setAutoSizeTextTypeWithDefaults', [toText(type)]);
    }
    // 从 min 到 max 每隔 step 一档；unit 和 setTextSize 的一样
    setAutoSizeTextTypeUniformWithConfiguration(min, max, step, unit) {
      const where = 'setAutoSizeTextTypeUniformWithConfiguration';
      needArgs(4, arguments.length, where);
      nativeCall(this, where, [toInteger(min, where), toInteger(max, where), toInteger(step, where), toText(unit)]);
    }
    // 只在给定的几个字号里挑
    setAutoSizeTextTypeUniformWithPresetSizes(sizes, unit) {
      const where = 'setAutoSizeTextTypeUniformWithPresetSizes';
      needArgs(2, arguments.length, where);
      if (sizes === null || typeof sizes !== 'object' || typeof sizes[Symbol.iterator] !== 'function') {
        throw new TypeError(where + ': sizes must be an array of numbers, got ' + describe(sizes));
      }
      nativeCall(this, where, [Array.from(sizes, (n) => toInteger(n, where)), toText(unit)]);
    }

    // 画字用的开关：'underlineText'（下划线）、'strikeThruText'（删除线）、'fakeBoldText'（合成粗体）……
    get paintFlags() { return nativeGet(this, 'paintFlags'); }
    set paintFlags(v) { nativeSet(this, 'paintFlags', toStringList(v, 'paintFlags')); }

    // 文字阴影：模糊半径、横向和纵向的偏移（像素），颜色。半径是 0 时没有阴影
    setShadowLayer(radius, dx, dy, color) {
      needArgs(4, arguments.length, 'setShadowLayer');
      nativeCall(this, 'setShadowLayer', [toNumber(radius, 'setShadowLayer'), toNumber(dx, 'setShadowLayer'),
                                          toNumber(dy, 'setShadowLayer'), colorArgument('setShadowLayer', color)]);
    }
    get shadowRadius() { return nativeGet(this, 'shadowRadius'); }
    get shadowDx() { return nativeGet(this, 'shadowDx'); }
    get shadowDy() { return nativeGet(this, 'shadowDy'); }
    get shadowColor() { return colorText(nativeGet(this, 'shadowColor')); }

    // 排版的结果。还没排过版时 lineCount 是 0、baseline 是 -1
    get lineCount() { return nativeGet(this, 'lineCount'); }
    get baseline() { return nativeGet(this, 'baseline'); }
  }
  addMembers(TextView, TextViewTextMembers);

})
