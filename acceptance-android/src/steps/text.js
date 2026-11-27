// 文字：TextView 上的字号、颜色、字体、对齐、行数、省略号、行高、字间距、可选中、字体特性和
// 可变字体的轴、按基线定高、自动缩字号、下划线和删除线、文字阴影、测量，View 上的 textAlignment，
// 以及 Typeface（系统字体、粗细、斜体、从项目的 assets/ 加载字体文件）。
//
// 照「接类的总则」（2026-11-26）：视图建出来是自由的，状态以 JS 为准，写什么读什么（颜色、
// gravity、textAlignment 也是）；页面值（lineCount、baseline、resolvedTextSize）自由时是 null；
// 屏幕上的长度是 dp，字号是 textSize 加 fontScaling（true 时跟着系统字号放大）。
// 类型不对抛 TypeError、超出范围抛 RangeError；枚举名、颜色、可变字体轴的写法写错打警告、值不变。
//
// 原生那边排出来的像素，文字组里没有成员读得出来，借了布局组还没改到新规矩的 measuredWidth /
// measuredHeight（挂着的视图上能用，2026-11-26 过渡期；tree.js 也借了）。布局组改成 frame 时顺手改。
//
// 最后一段改手机的系统字号：打「[acceptance] fontscale 2.0」，android/scripts/run-device.sh 用
// adb shell settings put system font_scale 改，「fontscale restore」还原；脚本退出时（含中途失败）也会还原。

/**
 * 抛了什么：没抛是「没抛」，抛了是错误的 name
 * @param {() => unknown} fn
 */
function thrown(fn) {
  try {
    fn();
    return '没抛';
  } catch (err) {
    return err instanceof Error ? err.name : typeof err;
  }
}

/**
 * 跑 fn，收下这期间打的警告（console.warn 的第一个参数），用 ' | ' 连起来；没有警告是空串
 * @param {() => unknown} fn
 */
function warnings(fn) {
  const original = console.warn;
  /** @type {string[]} */
  const seen = [];
  console.warn = (/** @type {unknown} */ first) => { seen.push(String(first)); };
  try {
    fn();
  } finally {
    console.warn = original;
  }
  return seen.join(' | ');
}

/** @param {number} ms */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** @param {number | null} a @param {number} b @param {number} tolerance */
const near = (a, b, tolerance) => a !== null && Math.abs(a - b) <= tolerance;

/**
 * 等 fn() 为真，最多等 ms 毫秒。等到了是 true
 * @param {() => boolean} fn @param {number} ms
 */
async function waitFor(fn, ms) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    if (fn()) return true;
    await sleep(200);
  }
  return fn();
}

/** 布局组的旧成员：挂着时读原生排出来的像素 @param {View} v @returns {number} */
const measuredHeight = (v) => /** @type {any} */ (v).measuredHeight;
/** @param {View} v @returns {number} */
const measuredWidth = (v) => /** @type {any} */ (v).measuredWidth;

/** @param {import("../main.js").StepContext} ctx */
export async function stepText(ctx) {
  const { assert } = ctx;
  const activity = /** @type {Activity} */ (ctx.activity);
  console.log('  --- 文字 ---');

  // ===== 自由的 TextView：默认值 =====
  const tv = new TextView();
  const any = /** @type {any} */ (tv);
  assert('textSize 默认 14（dp，系统字号为 1 时）', tv.textSize, 14);
  assert('fontScaling 默认 true', tv.fontScaling, true);
  assert('自由时 resolvedTextSize 是 null', tv.resolvedTextSize, null);
  assert("textColor 默认 '#000000de'（AOSP 主题的主文字色）", tv.textColor, '#000000de');
  assert("highlightColor 默认 '#00857766'", tv.highlightColor, '#00857766');
  assert('typeface 默认是 Typeface.DEFAULT', tv.typeface === Typeface.DEFAULT, true);
  assert("gravity 默认 ['start', 'top']", tv.gravity.join(','), 'start,top');
  assert("textAlignment 默认 'gravity'", tv.textAlignment, 'gravity');
  assert('maxLines 默认 null（不限）', tv.maxLines, null);
  assert('minLines 默认 0', tv.minLines, 0);
  assert('ellipsize 默认 null', tv.ellipsize, null);
  assert('lineHeight 默认 null（字体自己的行高）', tv.lineHeight, null);
  assert('letterSpacing 默认 0', tv.letterSpacing, 0);
  assert('includeFontPadding 默认 true', tv.includeFontPadding, true);
  assert('isTextSelectable 默认 false', tv.isTextSelectable, false);
  assert('fontFeatureSettings 默认 null', tv.fontFeatureSettings, null);
  assert('fontVariationSettings 默认 null', tv.fontVariationSettings, null);
  assert('firstBaselineToTopHeight 默认 null', tv.firstBaselineToTopHeight, null);
  assert('lastBaselineToBottomHeight 默认 null', tv.lastBaselineToBottomHeight, null);
  assert('autoSize 默认 null', tv.autoSize, null);
  assert('textShadow 默认 null', tv.textShadow, null);
  assert('isUnderlineText 默认 false', tv.isUnderlineText, false);
  assert('isStrikeThruText 默认 false', tv.isStrikeThruText, false);
  assert('自由时 lineCount 是 null', tv.lineCount, null);
  assert('自由时 baseline 是 null', tv.baseline, null);

  // 一件事只说一次：旧的写法都没有了
  for (const name of ['setTextSize', 'textSizeUnit', 'setTextColor', 'currentTextColor', 'setTypeface', 'setLines',
    'setLineHeight', 'setLineSpacing', 'lineSpacingExtra', 'lineSpacingMultiplier', 'setTextIsSelectable',
    'setFontVariationSettings', 'autoSizeTextType', 'autoSizeMinTextSize', 'autoSizeMaxTextSize',
    'autoSizeStepGranularity', 'autoSizeTextAvailableSizes', 'setAutoSizeTextTypeWithDefaults',
    'setAutoSizeTextTypeUniformWithConfiguration', 'setAutoSizeTextTypeUniformWithPresetSizes', 'paintFlags',
    'setShadowLayer', 'shadowRadius', 'shadowDx', 'shadowDy', 'shadowColor']) {
    assert('没有 ' + name + ' 了', name in tv, false);
  }

  // ===== 字号 =====
  tv.textSize = 20;
  assert('textSize 写读', tv.textSize, 20);
  tv.textSize = 18.5;
  assert('textSize 可以是小数', tv.textSize, 18.5);
  any.textSize = '16';
  assert("textSize = '16' 照 Web IDL 转成数", tv.textSize, 16);
  tv.textSize = 0;
  assert('textSize = 0 照收', tv.textSize, 0);
  tv.textSize = 16;
  assert('textSize = -1 抛 RangeError', thrown(() => { tv.textSize = -1; }), 'RangeError');
  assert('textSize = NaN 抛 TypeError', thrown(() => { tv.textSize = NaN; }), 'TypeError');
  assert("textSize = 'abc' 抛 TypeError", thrown(() => { any.textSize = 'abc'; }), 'TypeError');
  assert('抛了之后 textSize 不变', tv.textSize, 16);
  tv.fontScaling = false;
  assert('fontScaling 写读', tv.fontScaling, false);
  any.fontScaling = 'yes';
  assert("fontScaling = 'yes' 照 Web IDL 转成 true", tv.fontScaling, true);
  any.fontScaling = 0;
  assert('fontScaling = 0 转成 false', tv.fontScaling, false);
  tv.fontScaling = true;
  assert('resolvedTextSize 只读', thrown(() => { any.resolvedTextSize = 3; }), 'TypeError');

  // ===== 颜色：写什么读什么 =====
  tv.textColor = '#369';
  assert("textColor = '#369' 原样读回", tv.textColor, '#369');
  tv.textColor = 'rgb(51, 102, 153)';
  assert('textColor 写 rgb() 原样读回', tv.textColor, 'rgb(51, 102, 153)');
  tv.textColor = 'transparent';
  assert("textColor = 'transparent'", tv.textColor, 'transparent');
  tv.textColor = '#336699';
  assert("textColor 写错（'nope'）打一条警告",
         warnings(() => { tv.textColor = 'nope'; }), '[Nacre] textColor: "nope" is not a valid color, ignored');
  assert("textColor 不认颜色名（'red'）：打警告", warnings(() => { tv.textColor = 'red'; }) !== '', true);
  assert('textColor = null 是空串，不是颜色：打警告', warnings(() => { any.textColor = null; }) !== '', true);
  assert('写错之后 textColor 不变', tv.textColor, '#336699');
  tv.highlightColor = '#ff000080';
  assert('highlightColor 写读', tv.highlightColor, '#ff000080');
  assert('highlightColor 写错打警告', warnings(() => { tv.highlightColor = '#GGG'; }) !== '', true);
  assert('highlightColor 写错保持原值', tv.highlightColor, '#ff000080');

  // ===== Typeface =====
  assert('Typeface 是全局的类', typeof Typeface, 'function');
  assert('new Typeface() 抛 TypeError', thrown(() => new /** @type {any} */ (Typeface)()), 'TypeError');
  for (const name of ['DEFAULT', 'SANS_SERIF', 'SERIF', 'MONOSPACE']) {
    assert('Typeface.' + name + ' 是 Typeface', /** @type {any} */ (Typeface)[name] instanceof Typeface, true);
  }
  assert('Typeface.DEFAULT 读两次是同一个', Typeface.DEFAULT === Typeface.DEFAULT, true);
  assert('Typeface.DEFAULT 的 weight 是 400', Typeface.DEFAULT.weight, 400);
  assert('Typeface.DEFAULT 不是斜体', Typeface.DEFAULT.isItalic, false);
  for (const name of ['DEFAULT_BOLD', 'defaultFromStyle']) {
    assert('Typeface 上没有 ' + name + ' 了', name in Typeface, false);
  }
  for (const name of ['style', 'isBold']) {
    assert('Typeface 的实例上没有 ' + name + ' 了', name in Typeface.DEFAULT, false);
  }
  assert('weight 只读', thrown(() => { /** @type {any} */ (Typeface.DEFAULT).weight = 700; }), 'TypeError');
  assert("create('serif') 是 Typeface", Typeface.create('serif') instanceof Typeface, true);
  const serifItalic = Typeface.create('serif', { italic: true });
  assert("create('serif', { italic: true }) 是斜体", serifItalic.isItalic, true);
  assert('没给 weight：照字体族自己的 400', serifItalic.weight, 400);
  const light = Typeface.create(Typeface.SANS_SERIF, { weight: 300, italic: true });
  assert('create(SANS_SERIF, { weight: 300, italic: true }) 的 weight', light.weight, 300);
  assert('create(SANS_SERIF, { weight: 300, italic: true }) 是斜体', light.isItalic, true);
  const heavier = Typeface.create(light, { weight: 900 });
  assert('只给 weight：斜体照字体本身的', heavier.isItalic, true);
  assert('只给 weight：粗细是给的', heavier.weight, 900);
  assert('create(null, { weight: 700 }) 是默认字体族的 700', Typeface.create(null, { weight: 700 }).weight, 700);
  assert('create(SERIF) 没给 options：就是它自己', Typeface.create(Typeface.SERIF) === Typeface.SERIF, true);
  assert("create('serif', null) 当成空的 options", Typeface.create('serif', null).weight, 400);
  assert('weight 1001 抛 RangeError', thrown(() => Typeface.create(Typeface.DEFAULT, { weight: 1001 })), 'RangeError');
  assert('weight 0 抛 RangeError', thrown(() => Typeface.create(Typeface.DEFAULT, { weight: 0 })), 'RangeError');
  assert("weight 'abc' 抛 TypeError", thrown(() => Typeface.create(Typeface.DEFAULT, { weight: /** @type {any} */ ('abc') })), 'TypeError');
  assert("options 是字符串（旧的 create('serif', 'bold')）抛 TypeError",
         thrown(() => Typeface.create('serif', /** @type {any} */ ('bold'))), 'TypeError');
  assert('create() 没参数抛 TypeError', thrown(() => /** @type {any} */ (Typeface).create()), 'TypeError');
  const tall = Typeface.createFromAsset('fonts/tall.ttf');
  assert('createFromAsset 读项目 assets/ 里的字体', tall instanceof Typeface, true);
  assert('createFromAsset 找不到文件：Java 的异常带类名',
         thrown(() => Typeface.createFromAsset('fonts/missing.ttf')), 'RuntimeException');
  assert('createFromAsset() 没参数抛 TypeError', thrown(() => /** @type {any} */ (Typeface).createFromAsset()), 'TypeError');

  tv.typeface = Typeface.MONOSPACE;
  assert('typeface 写读：读出同一个', tv.typeface === Typeface.MONOSPACE, true);
  tv.typeface = null;
  assert('typeface = null 读回 null（系统默认的字体）', tv.typeface, null);
  tv.typeface = Typeface.SERIF;
  assert("typeface = 'serif' 抛 TypeError", thrown(() => { any.typeface = 'serif'; }), 'TypeError');
  assert('typeface = {} 抛 TypeError', thrown(() => { any.typeface = {}; }), 'TypeError');
  assert('抛了之后 typeface 不变', tv.typeface === Typeface.SERIF, true);

  // ===== 对齐：写什么读什么 =====
  tv.gravity = ['bottom'];
  assert("gravity = ['bottom'] 原样读回（不补横向）", tv.gravity.join(','), 'bottom');
  tv.gravity = ['centerVertical', 'end'];
  assert('gravity 读回写的顺序', tv.gravity.join(','), 'centerVertical,end');
  tv.gravity = [];
  assert('gravity = [] 读回空数组', tv.gravity.length, 0);
  const written = ['top', 'right', 'clipVertical'];
  tv.gravity = written;
  written.push('left');
  assert('写进去之后改原来的数组，gravity 不变', tv.gravity.join(','), 'top,right,clipVertical');
  assert('读出来的 gravity 是冻结的', Object.isFrozen(tv.gravity), true);
  assert('gravity 写错名字：打警告，列出全部可选值',
         warnings(() => { tv.gravity = ['top', 'sideways']; }),
         '[Nacre] gravity has no value "sideways"; expected one of: left / right / centerHorizontal / ' +
         'fillHorizontal / start / end / top / bottom / centerVertical / fillVertical / clipHorizontal / ' +
         'clipVertical, ignored');
  assert("gravity 同一个方向两个（['left', 'right']）：打警告",
         warnings(() => { tv.gravity = ['left', 'right']; }),
         '[Nacre] gravity: "left" and "right" are both horizontal; give at most one per direction, ignored');
  assert("gravity 不收 'center'：打警告", warnings(() => { tv.gravity = /** @type {any} */ (['center']); }) !== '', true);
  assert('gravity 写错之后不变', tv.gravity.join(','), 'top,right,clipVertical');
  assert("gravity = 'top'（不是数组）抛 TypeError", thrown(() => { any.gravity = 'top'; }), 'TypeError');

  tv.textAlignment = 'center';
  assert('textAlignment 写读', tv.textAlignment, 'center');
  tv.textAlignment = 'inherit';
  assert("textAlignment = 'inherit' 原样读回", tv.textAlignment, 'inherit');
  assert('textAlignment 写错：打警告，列出全部可选值',
         warnings(() => { tv.textAlignment = /** @type {any} */ ('justify'); }),
         '[Nacre] textAlignment has no value "justify"; expected one of: inherit / gravity / textStart / ' +
         'textEnd / center / viewStart / viewEnd, ignored');
  assert('textAlignment 写错之后不变', tv.textAlignment, 'inherit');
  const plain = new View();
  assert("textAlignment 在 View 上，默认 'gravity'", plain.textAlignment, 'gravity');
  plain.textAlignment = 'textEnd';
  assert('View 的 textAlignment 写读', plain.textAlignment, 'textEnd');

  // ===== 行数、省略号 =====
  tv.maxLines = 2;
  assert('maxLines 写读', tv.maxLines, 2);
  any.maxLines = '3';
  assert("maxLines = '3' 照 Web IDL 转成 3", tv.maxLines, 3);
  tv.maxLines = 2.7;
  assert('maxLines 向零取整', tv.maxLines, 2);
  tv.maxLines = null;
  assert('maxLines = null：不限', tv.maxLines, null);
  tv.maxLines = 0;
  assert('maxLines = 0 照收', tv.maxLines, 0);
  assert('maxLines = -1 抛 RangeError', thrown(() => { tv.maxLines = -1; }), 'RangeError');
  assert("maxLines = 'abc' 抛 TypeError", thrown(() => { any.maxLines = 'abc'; }), 'TypeError');
  assert('抛了之后 maxLines 不变', tv.maxLines, 0);
  tv.maxLines = null;
  tv.minLines = 1;
  assert('minLines 写读', tv.minLines, 1);
  assert('minLines = -1 抛 RangeError', thrown(() => { tv.minLines = -1; }), 'RangeError');
  tv.minLines = 0;
  for (const value of /** @type {const} */ (['start', 'middle', 'end', 'marquee'])) {
    tv.ellipsize = value;
    assert("ellipsize = '" + value + "'", tv.ellipsize, value);
  }
  tv.ellipsize = null;
  assert('ellipsize = null', tv.ellipsize, null);
  tv.ellipsize = 'end';
  assert('ellipsize 写错：打警告',
         warnings(() => { tv.ellipsize = /** @type {any} */ ('bogus'); }),
         '[Nacre] ellipsize has no value "bogus"; expected one of: start / middle / end / marquee, ignored');
  assert('ellipsize 写错保持原值', tv.ellipsize, 'end');

  // ===== 行高、字间距、字体内边距、可选中 =====
  tv.lineHeight = 24.5;
  assert('lineHeight 写读（dp，可以是小数）', tv.lineHeight, 24.5);
  tv.lineHeight = null;
  assert('lineHeight = null：回到字体自己的行高', tv.lineHeight, null);
  tv.lineHeight = 0;
  assert('lineHeight = 0 照收', tv.lineHeight, 0);
  assert('lineHeight = -1 抛 RangeError', thrown(() => { tv.lineHeight = -1; }), 'RangeError');
  assert("lineHeight = 'x' 抛 TypeError", thrown(() => { any.lineHeight = 'x'; }), 'TypeError');
  assert('抛了之后 lineHeight 不变', tv.lineHeight, 0);
  tv.lineHeight = null;
  tv.letterSpacing = 0.1;
  assert('letterSpacing 写读（em）', tv.letterSpacing, 0.1);
  tv.letterSpacing = -0.05;
  assert('letterSpacing 可以是负的', tv.letterSpacing, -0.05);
  assert("letterSpacing = 'abc' 抛 TypeError", thrown(() => { any.letterSpacing = 'abc'; }), 'TypeError');
  tv.includeFontPadding = false;
  assert('includeFontPadding 写读', tv.includeFontPadding, false);
  any.includeFontPadding = 1;
  assert('includeFontPadding = 1 照 Web IDL 转成 true', tv.includeFontPadding, true);
  tv.isTextSelectable = true;
  assert('isTextSelectable 可写', tv.isTextSelectable, true);
  any.isTextSelectable = '';
  assert("isTextSelectable = '' 照 Web IDL 转成 false", tv.isTextSelectable, false);

  // ===== 字体特性、可变字体的轴 =====
  tv.fontFeatureSettings = "'tnum'";
  assert('fontFeatureSettings 写读', tv.fontFeatureSettings, "'tnum'");
  tv.fontFeatureSettings = null;
  assert('fontFeatureSettings = null', tv.fontFeatureSettings, null);
  tv.fontVariationSettings = "'wght' 700";
  assert('fontVariationSettings 可写', tv.fontVariationSettings, "'wght' 700");
  tv.fontVariationSettings = "'wght' 650.5, \"wdth\" 80";
  assert('fontVariationSettings 几个轴、双引号、小数', tv.fontVariationSettings, "'wght' 650.5, \"wdth\" 80");
  tv.fontVariationSettings = "'zzzz' 1";
  assert('fontVariationSettings 谁都没有的轴也照收（状态以 JS 为准）', tv.fontVariationSettings, "'zzzz' 1");
  assert('fontVariationSettings 写法不对：打警告',
         warnings(() => { tv.fontVariationSettings = 'wght 700'; }),
         '[Nacre] fontVariationSettings: "wght 700" is not a valid font-variation-settings value, ignored');
  assert("fontVariationSettings 轴名不是 4 个字（\"'wg' 7\"）：打警告",
         warnings(() => { tv.fontVariationSettings = "'wg' 7"; }) !== '', true);
  assert('写法不对之后不变', tv.fontVariationSettings, "'zzzz' 1");
  tv.fontVariationSettings = null;
  assert('fontVariationSettings = null', tv.fontVariationSettings, null);

  // ===== 按基线定高 =====
  tv.firstBaselineToTopHeight = 30;
  assert('firstBaselineToTopHeight 写读（dp）', tv.firstBaselineToTopHeight, 30);
  tv.lastBaselineToBottomHeight = 12.5;
  assert('lastBaselineToBottomHeight 写读（dp）', tv.lastBaselineToBottomHeight, 12.5);
  assert('firstBaselineToTopHeight = -1 抛 RangeError', thrown(() => { tv.firstBaselineToTopHeight = -1; }), 'RangeError');
  assert("lastBaselineToBottomHeight = 'x' 抛 TypeError", thrown(() => { any.lastBaselineToBottomHeight = 'x'; }), 'TypeError');
  tv.firstBaselineToTopHeight = null;
  tv.lastBaselineToBottomHeight = null;
  assert('两个都能写 null', [tv.firstBaselineToTopHeight, tv.lastBaselineToBottomHeight].join(','), ',');

  // ===== 自动缩字号：null、{ min, max, step } 或 { sizes } =====
  const range = { min: 8, max: 40, step: 2 };
  tv.autoSize = range;
  const readRange = /** @type {{ min: number, max: number, step: number }} */ (tv.autoSize);
  assert('autoSize = { min, max, step } 读回同样的三个数', [readRange.min, readRange.max, readRange.step].join(','), '8,40,2');
  assert('读出来的 autoSize 是冻结的副本', Object.isFrozen(readRange) && readRange !== range, true);
  tv.autoSize = { sizes: [12, 16, 20.5] };
  const readSizes = /** @type {{ sizes: readonly number[] }} */ (tv.autoSize);
  assert('autoSize = { sizes } 读回同样的几个字号', readSizes.sizes.join(','), '12,16,20.5');
  assert('sizes 也是冻结的', Object.isFrozen(readSizes.sizes), true);
  assert('autoSize = {} 抛 TypeError', thrown(() => { any.autoSize = {}; }), 'TypeError');
  assert('autoSize 少了 step 抛 TypeError', thrown(() => { any.autoSize = { min: 8, max: 40 }; }), 'TypeError');
  assert('autoSize 同时给 sizes 和 min 抛 TypeError', thrown(() => { any.autoSize = { sizes: [12], min: 8, max: 40, step: 1 }; }), 'TypeError');
  assert('autoSize 的 min 比 max 大抛 RangeError', thrown(() => { tv.autoSize = { min: 40, max: 8, step: 1 }; }), 'RangeError');
  assert('autoSize 的 min 是 0 抛 RangeError', thrown(() => { tv.autoSize = { min: 0, max: 8, step: 1 }; }), 'RangeError');
  assert('autoSize 的 step 是 0 抛 RangeError', thrown(() => { tv.autoSize = { min: 8, max: 40, step: 0 }; }), 'RangeError');
  assert('autoSize 的 sizes 是空数组抛 RangeError', thrown(() => { tv.autoSize = { sizes: [] }; }), 'RangeError');
  assert('autoSize 的 sizes 里有负数抛 RangeError', thrown(() => { tv.autoSize = { sizes: [12, -1] }; }), 'RangeError');
  assert('autoSize 的 sizes 不是数组抛 TypeError', thrown(() => { any.autoSize = { sizes: 12 }; }), 'TypeError');
  assert("autoSize 的 min 是 'abc' 抛 TypeError", thrown(() => { any.autoSize = { min: 'abc', max: 40, step: 1 }; }), 'TypeError');
  assert("autoSize = 'uniform' 抛 TypeError", thrown(() => { any.autoSize = 'uniform'; }), 'TypeError');
  assert('抛了之后 autoSize 不变', /** @type {any} */ (tv.autoSize).sizes.join(','), '12,16,20.5');
  tv.autoSize = null;
  assert('autoSize = null 关掉', tv.autoSize, null);

  // ===== 文字阴影：null 或 { radius, dx, dy, color } =====
  tv.textShadow = { radius: 4, dx: 2, dy: 3, color: '#0008' };
  const shadow = /** @type {{ radius: number, dx: number, dy: number, color: string }} */ (tv.textShadow);
  assert('textShadow 读回同样的四项（颜色原样）', [shadow.radius, shadow.dx, shadow.dy, shadow.color].join(','), '4,2,3,#0008');
  assert('读出来的 textShadow 是冻结的', Object.isFrozen(shadow), true);
  assert('textShadow 少了 color 抛 TypeError', thrown(() => { any.textShadow = { radius: 4, dx: 2, dy: 3 }; }), 'TypeError');
  assert('textShadow 的 radius 是负数抛 RangeError', thrown(() => { tv.textShadow = { radius: -1, dx: 0, dy: 0, color: '#000' }; }), 'RangeError');
  assert('textShadow 的 dx 是 NaN 抛 TypeError', thrown(() => { tv.textShadow = { radius: 1, dx: NaN, dy: 0, color: '#000' }; }), 'TypeError');
  assert('textShadow = 5 抛 TypeError', thrown(() => { any.textShadow = 5; }), 'TypeError');
  assert('textShadow 的颜色写错：打警告',
         warnings(() => { tv.textShadow = { radius: 1, dx: 0, dy: 0, color: 'nope' }; }) !== '', true);
  assert('写错之后 textShadow 不变', /** @type {any} */ (tv.textShadow).color, '#0008');
  tv.textShadow = null;
  assert('textShadow = null', tv.textShadow, null);

  // ===== 下划线、删除线 =====
  tv.isUnderlineText = true;
  assert('isUnderlineText 写读', tv.isUnderlineText, true);
  tv.isStrikeThruText = true;
  assert('isStrikeThruText 写读', tv.isStrikeThruText, true);
  any.isUnderlineText = 0;
  assert('isUnderlineText = 0 转成 false', tv.isUnderlineText, false);
  assert('lineCount 只读', thrown(() => { any.lineCount = 1; }), 'TypeError');
  assert('baseline 只读', thrown(() => { any.baseline = 1; }), 'TypeError');

  // ===== 挂上 =====
  const screen = new LinearLayout();
  screen.orientation = 'vertical';
  screen.paddingTop = 160;
  activity.contentView = screen;

  // 页面的密度：只有内边距的空布局，高度就是内边距换成的像素（不能比屏幕高，不然被父视图截短）
  const ruler = new LinearLayout();
  ruler.paddingTop = 400;
  screen.addView(ruler);
  await sleep(300);
  const density = measuredHeight(ruler) / 400;
  screen.removeView(ruler);
  console.log('  实测：1 dp = ' + density + ' 像素');
  /** @param {number} dp */
  const px = (dp) => Math.round(dp * density);

  // 没写过的和每一项都写成默认值的，排出来一样：initial 等于新建的原生对象的默认值
  const row = new LinearLayout();
  const untouched = new TextView();
  untouched.text = 'Mg 量';
  const explicit = new TextView();
  explicit.text = 'Mg 量';
  Object.assign(explicit, {
    textSize: 14, fontScaling: true, textColor: '#000000de', highlightColor: '#00857766', typeface: Typeface.DEFAULT,
    gravity: ['start', 'top'], textAlignment: 'gravity', maxLines: null, minLines: 0, ellipsize: null,
    lineHeight: null, letterSpacing: 0, includeFontPadding: true, isTextSelectable: false, fontFeatureSettings: null,
    fontVariationSettings: null, firstBaselineToTopHeight: null, lastBaselineToBottomHeight: null, autoSize: null,
    textShadow: null, isUnderlineText: false, isStrikeThruText: false,
  });
  row.addView(untouched);
  row.addView(explicit);
  screen.addView(row);
  await sleep(400);
  assert('挂上之后 resolvedTextSize 是 14', near(untouched.resolvedTextSize, 14, 0.01), true);
  assert('挂上之后 lineCount 是 1', untouched.lineCount, 1);
  assert('挂上之后 baseline 是大于 0 的 dp', (untouched.baseline ?? 0) > 0, true);
  assert('没写过的和写成默认值的：宽高一样',
         measuredWidth(untouched) + 'x' + measuredHeight(untouched), measuredWidth(explicit) + 'x' + measuredHeight(explicit));
  assert('没写过的和写成默认值的：baseline 一样', untouched.baseline, explicit.baseline);
  assert('没写过的和写成默认值的：resolvedTextSize 一样', untouched.resolvedTextSize, explicit.resolvedTextSize);
  console.log('  实测：默认的 TextView 排出来 ' + measuredWidth(untouched) + 'x' + measuredHeight(untouched) +
              ' 像素，baseline ' + untouched.baseline + ' dp');
  screen.removeView(row);
  assert('拿下来之后页面值又是 null',
         [untouched.resolvedTextSize, untouched.lineCount, untouched.baseline].join(','), ',,');

  // 字号：fontScaling 关掉时就是 dp
  const sized = new TextView();
  sized.text = 'size';
  sized.textSize = 30;
  sized.fontScaling = false;
  screen.addView(sized);
  await sleep(200);
  assert('fontScaling = false：resolvedTextSize 等于 textSize', near(sized.resolvedTextSize, 30, 0.01), true);
  sized.textSize = 22.5;
  assert('挂着时写的字号当场设到原生', near(sized.resolvedTextSize, 22.5, 0.01), true);

  // 行高：先在自由时写好再挂上（字号先于行高设到原生），三行和一行的高度差是两倍行高
  const one = new TextView();
  one.text = 'one';
  const three = new TextView();
  three.text = 'one\ntwo\nthree';
  for (const v of [one, three]) {
    v.textSize = 20;
    v.lineHeight = 50;
  }
  screen.addView(one);
  screen.addView(three);
  await sleep(300);
  /** 两行之间的距离（像素） */
  const lineStep = () => (measuredHeight(three) - measuredHeight(one)) / 2;
  assert('lineHeight = 50：每行 50 dp', near(lineStep(), px(50), 1), true);
  for (const v of [one, three]) v.textSize = 30;
  await sleep(300);
  assert('挂着时改了字号，行高还是 50 dp（跟着重设）', near(lineStep(), px(50), 1), true);
  for (const v of [one, three]) v.lineHeight = null;
  await sleep(300);
  console.log('  实测：30 dp 的字，字体自己的行高 ' + lineStep() + ' 像素');
  assert('lineHeight = null：回到字体自己的行高（不是 50 dp 了）', near(lineStep(), px(50), 1), false);
  screen.removeView(one);
  screen.removeView(three);

  // 行数和省略号
  const clipped = new TextView();
  clipped.text = 'one\ntwo\nthree';
  clipped.maxLines = 2;
  clipped.ellipsize = 'end';
  screen.addView(clipped);
  await sleep(300);
  assert('maxLines = 2：lineCount 是 2', clipped.lineCount, 2);
  clipped.maxLines = null;
  await sleep(300);
  assert('maxLines = null：三行都在', clipped.lineCount, 3);
  screen.removeView(clipped);

  // 按基线定高：靠改上下内边距实现，写了的时候盖过 paddingTop / paddingBottom
  const based = new TextView();
  based.text = 'base';
  based.textSize = 20;
  based.firstBaselineToTopHeight = 60;
  const reference = new TextView();
  reference.text = 'base';
  reference.textSize = 30;
  reference.paddingTop = 5;
  screen.addView(based);
  screen.addView(reference);
  await sleep(300);
  assert('firstBaselineToTopHeight = 60：baseline 是 60 dp', near(based.baseline, 60, 0.5), true);
  based.textSize = 30;
  await sleep(300);
  assert('挂着时改了字号，baseline 还是 60 dp', near(based.baseline, 60, 0.5), true);
  based.paddingTop = 5;
  await sleep(300);
  assert('写了 paddingTop，baseline 还是 60 dp（基线定高盖过内边距）', near(based.baseline, 60, 0.5), true);
  assert('paddingTop 读回写进去的 5', based.paddingTop, 5);
  based.firstBaselineToTopHeight = null;
  await sleep(300);
  assert('firstBaselineToTopHeight = null：回到 paddingTop 定的位置', based.baseline, reference.baseline);
  based.lastBaselineToBottomHeight = 40;
  await sleep(300);
  const below = measuredHeight(based) / density - (based.baseline ?? 0);
  assert('lastBaselineToBottomHeight = 40：最后一行的基线到底边 40 dp', near(below, 40, 0.6), true);
  screen.removeView(based);
  screen.removeView(reference);

  // 宽度：横排的布局里文字视图的宽是字的宽
  const widths = new LinearLayout();
  const normal = new TextView();
  const heavy = new TextView();
  const spaced = new TextView();
  for (const v of [normal, heavy, spaced]) {
    v.text = 'MMMMMM';
    v.textSize = 20;
    widths.addView(v);
  }
  heavy.fontVariationSettings = "'wght' 900";
  spaced.letterSpacing = 0.5;
  screen.addView(widths);
  await sleep(300);
  const normalWidth = measuredWidth(normal);
  console.log('  实测：MMMMMM 宽 ' + normalWidth + ' 像素，wght 900 宽 ' + measuredWidth(heavy));
  assert("fontVariationSettings = \"'wght' 900\"：字变宽了", measuredWidth(heavy) > normalWidth, true);
  assert('letterSpacing = 0.5：字变宽了', measuredWidth(spaced) > normalWidth, true);
  heavy.typeface = Typeface.create('sans-serif');
  await sleep(300);
  assert('挂着时换了字体，可变字体的轴跟着重设：还是宽的', measuredWidth(heavy) > normalWidth, true);
  heavy.fontVariationSettings = "'zzzz' 1";
  await sleep(300);
  assert('换成谁都没有的轴：和没设一样宽（不留着上一次的）', measuredWidth(heavy), normalWidth);
  heavy.fontVariationSettings = "'wght' 900";
  await sleep(300);
  heavy.fontVariationSettings = null;
  await sleep(300);
  assert('fontVariationSettings = null：和没设一样宽', measuredWidth(heavy), normalWidth);
  screen.removeView(widths);

  // assets 里的字体：上伸 2 em、下伸 1 em，比系统字体高得多
  const tallText = new TextView();
  tallText.text = 'tall';
  tallText.textSize = 20;
  tallText.typeface = tall;
  const plainText = new TextView();
  plainText.text = 'tall';
  plainText.textSize = 20;
  screen.addView(tallText);
  screen.addView(plainText);
  await sleep(300);
  console.log('  实测：20 dp 的字，系统字体高 ' + measuredHeight(plainText) + '，测试字体高 ' + measuredHeight(tallText));
  assert('换上 assets 里的字体：高度是系统字体的两倍多', measuredHeight(tallText) > 2 * measuredHeight(plainText), true);
  screen.removeView(tallText);
  screen.removeView(plainText);

  // 自动缩字号：一行放不下时缩小
  const auto = new TextView();
  auto.text = 'autosize autosize autosize autosize autosize autosize autosize autosize';
  auto.maxLines = 1;
  auto.textSize = 40;
  auto.autoSize = { min: 6, max: 40, step: 1 };
  screen.addView(auto);
  await sleep(400);
  const shrunk = auto.resolvedTextSize ?? 0;
  console.log('  实测：自动缩字号缩到 ' + shrunk + ' dp');
  assert('autoSize：一行放不下时缩小了', shrunk < 40 && shrunk >= 6, true);
  assert('textSize 还是写进去的 40', auto.textSize, 40);
  auto.autoSize = { sizes: [8, 12, 16] };
  await sleep(400);
  const picked = auto.resolvedTextSize;
  assert('autoSize = { sizes }：在给的几个里挑', [8, 12, 16].some((n) => near(picked, n, 0.3)), true);
  auto.textSize = 30;
  auto.autoSize = null;
  await sleep(400);
  assert('autoSize = null：回到 textSize（开着时写的 30）', near(auto.resolvedTextSize, 30, 0.01), true);
  screen.removeView(auto);

  // 挂着时写的别的状态：不抛，读回写进去的
  const live = new TextView();
  live.text = '挂着的字';
  screen.addView(live);
  await sleep(200);
  live.textColor = '#c00';
  live.highlightColor = 'rgba(0, 0, 255, 0.3)';
  live.textShadow = { radius: 2, dx: 1, dy: 1, color: '#00000080' };
  live.isUnderlineText = true;
  live.isStrikeThruText = true;
  live.gravity = ['centerHorizontal'];
  live.textAlignment = 'inherit';
  live.isTextSelectable = true;
  live.fontFeatureSettings = "'tnum'";
  live.includeFontPadding = false;
  live.ellipsize = 'middle';
  live.minLines = 2;
  await sleep(300);
  assert('挂着时写的颜色读回写进去的', live.textColor + ' ' + live.highlightColor, '#c00 rgba(0, 0, 255, 0.3)');
  assert("挂着时 textAlignment = 'inherit' 原样读回", live.textAlignment, 'inherit');
  assert("挂着时 gravity = ['centerHorizontal'] 原样读回", live.gravity.join(','), 'centerHorizontal');
  assert('minLines = 2：挂着时排成两行高（lineCount 还是 1）', live.lineCount, 1);
  screen.removeView(live);

  // ===== 系统字号变了：fontScaling 为 true 的跟着放大（含 Android 14 起的非线性放大）=====
  const scaled = new TextView();     // 没写过字号：默认 14
  scaled.text = '默认';
  const written14 = new TextView();
  written14.text = '十四';
  written14.textSize = 14;
  const big = new TextView();
  big.text = '一百';
  big.textSize = 100;
  const fixed = new TextView();
  fixed.text = '不放大';
  fixed.textSize = 14;
  fixed.fontScaling = false;
  const spLine = new TextView();
  spLine.text = '行高';
  spLine.textSize = 14;
  spLine.lineHeight = 40;
  const dpLine = new TextView();
  dpLine.text = '行高';
  dpLine.textSize = 14;
  dpLine.lineHeight = 40;
  dpLine.fontScaling = false;
  for (const v of [scaled, written14, big, fixed, spLine, dpLine]) screen.addView(v);
  await sleep(300);
  const spLineBefore = measuredHeight(spLine);
  const dpLineBefore = measuredHeight(dpLine);
  assert('系统字号是 1 时：100 的 resolvedTextSize 是 100', near(big.resolvedTextSize, 100, 0.01), true);

  console.log('[acceptance] fontscale 2.0');
  const grew = await waitFor(() => (written14.resolvedTextSize ?? 0) > 15, 10000);
  assert('系统字号改成 2 之后，写过的 14 跟着放大了', grew, true);
  await sleep(500);
  const r14 = written14.resolvedTextSize ?? 0;
  const r100 = big.resolvedTextSize ?? 0;
  console.log('  实测：系统字号 2 时，14 → ' + r14 + ' dp，100 → ' + r100 + ' dp，没写过的 → ' + scaled.resolvedTextSize);
  assert('没写过字号的（默认 14）也跟着放大，和写了 14 的一样', scaled.resolvedTextSize, r14);
  assert('非线性放大：大字放大的倍数比小字小', r100 / 100 < r14 / 14, true);
  assert('textSize 还是写进去的 14', written14.textSize, 14);
  assert('fontScaling = false 的不放大', near(fixed.resolvedTextSize, 14, 0.01), true);
  assert('fontScaling 为 true 时行高跟着放大', measuredHeight(spLine) > spLineBefore, true);
  assert('fontScaling = false 时行高不变', measuredHeight(dpLine), dpLineBefore);
  const fresh = new TextView();
  fresh.text = '后挂上的';
  fresh.textSize = 14;
  screen.addView(fresh);
  await sleep(200);
  assert('系统字号变了之后才挂上的：和挂着的一样大', fresh.resolvedTextSize, r14);

  console.log('[acceptance] fontscale restore');
  const back = await waitFor(() => near(written14.resolvedTextSize, 14, 0.01), 10000);
  assert('系统字号还原之后回到 14', back, true);
  await sleep(500);
  assert('没写过字号的也回到 14', near(scaled.resolvedTextSize, 14, 0.01), true);
  assert('行高也回来了', measuredHeight(spLine), spLineBefore);
  activity.contentView = null;
}
