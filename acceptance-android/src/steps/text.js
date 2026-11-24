// 文字：TextView 上的字号、颜色、字体、对齐、行数、省略号、行高、字间距、可选中、测量，
// 字体特性和可变字体的轴、按基线定高、自动缩字号、下划线和删除线、文字阴影，
// 以及 Typeface（系统字体、粗细、斜体、从项目的 assets/ 加载字体文件）。
//
// 规矩（project.md 第 4 节）：getter 和 setter 名字对得上才合成一个属性，和 Kotlin 一样；
// 整数常量变字符串枚举；方法参数照 Java 按位置传。颜色是 CSS 写法的字符串。
// 枚举和颜色属性写错：打警告、保持原值；方法参数写错：抛 TypeError。
//
// 测量（lineCount、baseline）要等排过版，所以这一步是异步的。

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
 * 跑 fn，收集这期间的 console.warn（只收以 [Nacre] 开头的）
 * @param {() => unknown} fn
 * @returns {string[]}
 */
function warnings(fn) {
  const seen = /** @type {string[]} */ ([]);
  const original = console.warn;
  console.warn = (/** @type {unknown[]} */ ...args) => {
    const text = args.map(String).join(' ');
    if (text.startsWith('[Nacre]')) seen.push(text);
    else original.apply(console, args);
  };
  try {
    fn();
  } finally {
    console.warn = original;
  }
  return seen;
}

/** @param {number} ms */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** @param {number} a @param {number} b @param {number} tolerance */
const near = (a, b, tolerance) => Math.abs(a - b) <= tolerance;

/** @param {import("../main.js").StepContext} ctx */
export async function stepText(ctx) {
  const { assert } = ctx;
  console.log('  --- 文字 ---');
  const activity = application.activity;
  const tv = new TextView(activity);
  const any = /** @type {any} */ (tv);

  // ---- 字号 ----
  assert('textSize 默认是大于 0 的像素数', typeof tv.textSize === 'number' && tv.textSize > 0, true);
  tv.setTextSize('px', 40);
  assert("setTextSize('px', 40)：textSize 是 40", tv.textSize, 40);
  assert("setTextSize('px', 40)：textSizeUnit 是 'px'", tv.textSizeUnit, 'px');
  tv.setTextSize(20);
  assert('setTextSize(20) 的单位是 sp', tv.textSizeUnit, 'sp');
  const sp20 = tv.textSize;
  tv.setTextSize('sp', 20);
  assert("setTextSize(20) 和 setTextSize('sp', 20) 一样大", tv.textSize, sp20);
  tv.setTextSize('sp', 10);
  assert('sp 的字号和数值成正比', near(sp20 / tv.textSize, 2, 0.01), true);
  tv.setTextSize('dip', 20);
  assert("setTextSize('dip', 20)：textSizeUnit 是 'dip'", tv.textSizeUnit, 'dip');
  tv.setTextSize('pt', 72);
  const pt72 = tv.textSize;
  tv.setTextSize('in', 1);
  assert('72pt 等于 1in', near(pt72, tv.textSize, 0.01), true);
  tv.setTextSize('mm', 25.4);
  assert('25.4mm 等于 1in', near(pt72, tv.textSize, 0.05), true);
  tv.setTextSize('10');
  const fromText = tv.textSize;
  tv.setTextSize(10);
  assert("setTextSize('10') 照 Web IDL 转成数", fromText, tv.textSize);
  assert('textSize 只读：赋值抛 TypeError', thrown(() => { any.textSize = 16; }), 'TypeError');
  assert('setTextSize() 没参数抛 TypeError', thrown(() => any.setTextSize()), 'TypeError');
  assert("setTextSize('abc') 抛 TypeError", thrown(() => tv.setTextSize(/** @type {any} */ ('abc'))), 'TypeError');
  assert('setTextSize 不认识的单位抛 TypeError', thrown(() => tv.setTextSize(/** @type {any} */ ('furlong'), 3)), 'TypeError');
  assert('setTextSize 的字号不是数抛 TypeError', thrown(() => tv.setTextSize('px', NaN)), 'TypeError');
  assert('setTextSize 抛了之后字号不变', tv.textSize, fromText);

  // ---- 颜色 ----
  assert('currentTextColor 是 #rrggbb 或 #rrggbbaa', /^#([0-9a-f]{6}|[0-9a-f]{8})$/.test(tv.currentTextColor), true);
  tv.setTextColor('#336699');
  assert("setTextColor('#336699') 读出 #336699（不透明的不带透明度）", tv.currentTextColor, '#336699');
  tv.setTextColor('#369');
  assert("setTextColor('#369') 读出 #336699", tv.currentTextColor, '#336699');
  tv.setTextColor('#3698');
  assert("setTextColor('#3698') 读出 #33669988", tv.currentTextColor, '#33669988');
  tv.setTextColor('#33669980');
  assert('#rrggbbaa 的透明度在最后（照 CSS）', tv.currentTextColor, '#33669980');
  tv.setTextColor('#ABCDEF');
  assert('大写读出小写', tv.currentTextColor, '#abcdef');
  tv.setTextColor('rgb(51, 102, 153)');
  assert('rgb() 读出 #336699', tv.currentTextColor, '#336699');
  tv.setTextColor('rgba(51,102,153,0.5)');
  assert('rgba() 的透明度 0.5 读出 80', tv.currentTextColor, '#33669980');
  tv.setTextColor('rgb(51 102 153 / 50%)');
  assert('rgb() 的空格写法', tv.currentTextColor, '#33669980');
  tv.setTextColor('rgb(300, -5, 0)');
  assert('rgb() 超出范围的照 CSS 夹进范围', tv.currentTextColor, '#ff0000');
  tv.setTextColor('transparent');
  assert("'transparent' 读出 #00000000", tv.currentTextColor, '#00000000');
  tv.setTextColor('#112233');
  assert("setTextColor('#GGG') 抛 TypeError", thrown(() => tv.setTextColor('#GGG')), 'TypeError');
  assert("setTextColor('red') 抛 TypeError（不认颜色名）", thrown(() => tv.setTextColor('red')), 'TypeError');
  assert('setTextColor(null) 抛 TypeError', thrown(() => tv.setTextColor(/** @type {any} */ (null))), 'TypeError');
  assert('setTextColor() 没参数抛 TypeError', thrown(() => any.setTextColor()), 'TypeError');
  assert('setTextColor 抛了之后颜色不变', tv.currentTextColor, '#112233');
  assert('currentTextColor 只读：赋值抛 TypeError', thrown(() => { any.currentTextColor = '#000'; }), 'TypeError');

  tv.highlightColor = '#ff000080';
  assert('highlightColor 读写', tv.highlightColor, '#ff000080');
  const colorWarns = warnings(() => { tv.highlightColor = 'nope'; });
  assert('highlightColor 写错打一条警告', colorWarns.length, 1);
  assert('highlightColor 写错的警告说明是颜色写错了', /is not a valid color/.test(colorWarns[0] || ''), true);
  assert('highlightColor 写错保持原值', tv.highlightColor, '#ff000080');

  // ---- Typeface ----
  assert('Typeface 是全局的类', typeof Typeface, 'function');
  assert('new Typeface() 抛 TypeError', thrown(() => new /** @type {any} */ (Typeface)()), 'TypeError');
  assert('Typeface.DEFAULT 是 Typeface', Typeface.DEFAULT instanceof Typeface, true);
  assert('Typeface.DEFAULT 读两次是同一个', Typeface.DEFAULT === Typeface.DEFAULT, true);
  for (const name of ['DEFAULT_BOLD', 'SANS_SERIF', 'SERIF', 'MONOSPACE']) {
    assert('Typeface.' + name + ' 是 Typeface', /** @type {any} */ (Typeface)[name] instanceof Typeface, true);
  }
  assert("Typeface.DEFAULT 的 style 是 'normal'", Typeface.DEFAULT.style, 'normal');
  assert('Typeface.DEFAULT 的 weight 是 400', Typeface.DEFAULT.weight, 400);
  assert('Typeface.DEFAULT_BOLD 是粗体', Typeface.DEFAULT_BOLD.isBold, true);
  assert("Typeface.DEFAULT_BOLD 的 style 是 'bold'", Typeface.DEFAULT_BOLD.style, 'bold');
  assert('Typeface.DEFAULT_BOLD 的 weight 是 700', Typeface.DEFAULT_BOLD.weight, 700);
  const serifItalic = Typeface.create('serif', 'italic');
  assert("create('serif', 'italic') 是斜体", serifItalic.isItalic, true);
  assert("create('serif', 'italic') 的 style", serifItalic.style, 'italic');
  assert("create(null, 'bold') 是粗体", Typeface.create(null, 'bold').isBold, true);
  assert("create(Typeface.SERIF, 'boldItalic') 的 style",
         Typeface.create(Typeface.SERIF, 'boldItalic').style, 'boldItalic');
  const light = Typeface.create(Typeface.SANS_SERIF, 300, true);
  assert('create(family, 300, true) 的 weight 是 300', light.weight, 300);
  assert('create(family, 300, true) 是斜体', light.isItalic, true);
  assert('create(family, 1001, false)：Java 的异常带类名',
         thrown(() => Typeface.create(Typeface.DEFAULT, 1001, false)), 'IllegalArgumentException');
  assert("create('serif', 'heavy') 抛 TypeError", thrown(() => Typeface.create('serif', /** @type {any} */ ('heavy'))), 'TypeError');
  assert("create('serif', 300, true) 抛 TypeError（粗细那个重载要一个 Typeface）",
         thrown(() => Typeface.create(/** @type {any} */ ('serif'), 300, true)), 'TypeError');
  assert('create() 没参数抛 TypeError', thrown(() => /** @type {any} */ (Typeface).create()), 'TypeError');
  assert("defaultFromStyle('bold') 是粗体", Typeface.defaultFromStyle('bold').isBold, true);
  assert("defaultFromStyle('x') 抛 TypeError", thrown(() => Typeface.defaultFromStyle(/** @type {any} */ ('x'))), 'TypeError');
  assert('style 只读：赋值抛 TypeError', thrown(() => { /** @type {any} */ (Typeface.DEFAULT).style = 'bold'; }), 'TypeError');

  const tall = Typeface.createFromAsset('fonts/tall.ttf');
  assert('createFromAsset 读项目 assets/ 里的字体', tall instanceof Typeface, true);
  assert('createFromAsset 找不到文件：Java 的异常带类名',
         thrown(() => Typeface.createFromAsset('fonts/missing.ttf')), 'RuntimeException');
  assert('createFromAsset() 没参数抛 TypeError', thrown(() => /** @type {any} */ (Typeface).createFromAsset()), 'TypeError');

  // ---- TextView 的字体 ----
  assert('TextView 的 typeface 默认是 Typeface', tv.typeface instanceof Typeface, true);
  tv.typeface = Typeface.MONOSPACE;
  assert('typeface 读写：读出同一个', tv.typeface === Typeface.MONOSPACE, true);
  assert("typeface = 'x' 抛 TypeError", thrown(() => { any.typeface = 'x'; }), 'TypeError');
  assert('typeface = null 不抛', thrown(() => { tv.typeface = null; }), '没抛');
  tv.setTypeface(Typeface.SERIF, 'bold');
  assert("setTypeface(SERIF, 'bold') 之后是粗体", tv.typeface?.isBold, true);
  assert("setTypeface(null, 'italic') 之后是斜体", (() => { tv.setTypeface(null, 'italic'); return tv.typeface?.isItalic; })(), true);
  assert("setTypeface(SERIF, 'x') 抛 TypeError", thrown(() => tv.setTypeface(Typeface.SERIF, /** @type {any} */ ('x'))), 'TypeError');
  assert("setTypeface('x', 'bold') 抛 TypeError", thrown(() => tv.setTypeface(/** @type {any} */ ('x'), 'bold')), 'TypeError');
  tv.setTextSize('px', 40);
  tv.typeface = Typeface.DEFAULT;
  const normalLineHeight = tv.lineHeight;
  tv.typeface = tall;
  assert('换上 assets 里的字体：行高变成字号的 3 倍', near(tv.lineHeight, 120, 2), true);
  console.log('  实测：40px 的系统字体行高 ' + normalLineHeight + '，测试字体 ' + tv.lineHeight);
  tv.typeface = Typeface.DEFAULT;

  // ---- 对齐 ----
  // Gravity 的规则和布局组一样：每个方向最多一个名字，外加两个裁切的开关；不收 center、
  // fill 这种两个方向合起来的名字；读出的顺序是横向、竖直、裁切
  assert("gravity 默认是 ['start', 'top']", tv.gravity.join(','), 'start,top');
  tv.gravity = ['centerHorizontal', 'centerVertical'];
  assert('gravity 两个方向都居中', tv.gravity.join(','), 'centerHorizontal,centerVertical');
  tv.gravity = ['bottom', 'end'];
  assert('gravity 读出横向在前', tv.gravity.join(','), 'end,bottom');
  tv.gravity = ['bottom'];
  assert('只给竖直方向：横向补 start（TextView 的规矩）', tv.gravity.join(','), 'start,bottom');
  tv.gravity = ['centerVertical', 'right', 'clipHorizontal'];
  assert('gravity 的裁切排在最后', tv.gravity.join(','), 'right,centerVertical,clipHorizontal');
  tv.gravity = ['fillHorizontal', 'fillVertical'];
  assert('gravity 两个方向都撑满', tv.gravity.join(','), 'fillHorizontal,fillVertical');
  tv.gravity = [];
  assert('gravity = [] 读出默认', tv.gravity.join(','), 'start,top');
  tv.gravity = ['bottom', 'end'];
  const gravityWarns = warnings(() => { tv.gravity = ['top', 'sideways']; });
  assert('gravity 里有不认识的名字打一条警告', gravityWarns.length, 1);
  assert('gravity 的警告列出可选值', /centerHorizontal/.test(gravityWarns[0] || ''), true);
  assert('gravity 有一个不认识就整次不生效', tv.gravity.join(','), 'end,bottom');
  assert("gravity 不收 'center'：打一条警告", warnings(() => { tv.gravity = ['center']; }).length, 1);
  assert("gravity 同一个方向两个名字（['left', 'right']）：打一条警告",
         warnings(() => { tv.gravity = ['left', 'right']; }).length, 1);
  assert('gravity 写错之后值不变', tv.gravity.join(','), 'end,bottom');
  assert("gravity = 'center'（不是数组）抛 TypeError", thrown(() => { any.gravity = 'center'; }), 'TypeError');

  // textAlignment 读出的是解析后的值（getTextAlignment()）。要 App 声明 supportsRtl 才生效
  // （开发用的壳声明了），不声明时一律解析成 'gravity'。'inherit' 要看父视图，挂上之后的
  // 那几条在最后「测量」那一段里验
  assert("textAlignment 默认是 'gravity'", tv.textAlignment, 'gravity');
  tv.textAlignment = 'center';
  assert("没挂到界面上：textAlignment = 'center' 读得到", tv.textAlignment, 'center');
  tv.textAlignment = 'inherit';
  assert("没有父视图：textAlignment = 'inherit' 读出默认的 'gravity'", tv.textAlignment, 'gravity');
  const plain = new View(activity);
  plain.textAlignment = 'textEnd';

  // ---- 行数和省略号 ----
  assert('maxLines 默认是 2147483647', tv.maxLines, 2147483647);
  tv.maxLines = 2;
  assert('maxLines 读写', tv.maxLines, 2);
  tv.maxLines = /** @type {any} */ ('3');
  assert("maxLines = '3' 照 Web IDL 转成 3", tv.maxLines, 3);
  assert("maxLines = 'abc' 抛 TypeError", thrown(() => { any.maxLines = 'abc'; }), 'TypeError');
  assert('minLines 默认是 0', tv.minLines, 0);
  tv.minLines = 1;
  assert('minLines 读写', tv.minLines, 1);
  tv.setLines(4);
  assert('setLines(4)：maxLines 是 4', tv.maxLines, 4);
  assert('setLines(4)：minLines 是 4', tv.minLines, 4);
  assert('setLines() 没参数抛 TypeError', thrown(() => any.setLines()), 'TypeError');

  assert('ellipsize 默认是 null', tv.ellipsize, null);
  for (const value of /** @type {const} */ (['start', 'middle', 'end', 'marquee'])) {
    tv.ellipsize = value;
    assert("ellipsize = '" + value + "'", tv.ellipsize, value);
  }
  tv.ellipsize = null;
  assert('ellipsize = null', tv.ellipsize, null);
  tv.ellipsize = 'end';
  const ellipsizeWarns = warnings(() => { tv.ellipsize = /** @type {any} */ ('bogus'); });
  assert('ellipsize 写错打一条警告', ellipsizeWarns.length, 1);
  assert('ellipsize 的警告列出可选值', /marquee/.test(ellipsizeWarns[0] || ''), true);
  assert('ellipsize 写错保持原值', tv.ellipsize, 'end');

  // ---- 行高和行距 ----
  tv.setTextSize('px', 40);
  tv.lineHeight = 60;
  assert('lineHeight 读写（像素）', tv.lineHeight, 60);
  tv.lineHeight = /** @type {any} */ ('72');
  assert("lineHeight = '72' 照 Web IDL 转成 72", tv.lineHeight, 72);
  assert("lineHeight = 'x' 抛 TypeError", thrown(() => { any.lineHeight = 'x'; }), 'TypeError');
  assert('lineHeight = -1：Java 的异常带类名', thrown(() => { tv.lineHeight = -1; }), 'IllegalArgumentException');
  tv.setLineHeight(64);
  assert('setLineHeight(64) 的单位是像素', tv.lineHeight, 64);
  tv.setLineHeight('px', 80);
  assert("setLineHeight('px', 80)", tv.lineHeight, 80);
  tv.setTextSize('sp', 20);
  const sp20px = tv.textSize;
  tv.setLineHeight('sp', 20);
  assert("setLineHeight('sp', 20) 和 20sp 的字号一样高", near(tv.lineHeight, sp20px, 1), true);
  assert("setLineHeight('x', 1) 抛 TypeError", thrown(() => tv.setLineHeight(/** @type {any} */ ('x'), 1)), 'TypeError');
  assert('setLineHeight() 没参数抛 TypeError', thrown(() => any.setLineHeight()), 'TypeError');

  const spacing = new TextView(activity);
  assert('lineSpacingExtra 默认是 0', spacing.lineSpacingExtra, 0);
  assert('lineSpacingMultiplier 默认是 1', spacing.lineSpacingMultiplier, 1);
  spacing.setLineSpacing(10, 1.5);
  assert('setLineSpacing(10, 1.5)：lineSpacingExtra 是 10', spacing.lineSpacingExtra, 10);
  assert('setLineSpacing(10, 1.5)：lineSpacingMultiplier 是 1.5', spacing.lineSpacingMultiplier, 1.5);
  assert('setLineSpacing 只给一个参数抛 TypeError', thrown(() => any.setLineSpacing(1)), 'TypeError');
  assert('lineSpacingExtra 只读：赋值抛 TypeError', thrown(() => { /** @type {any} */ (spacing).lineSpacingExtra = 1; }), 'TypeError');

  // ---- 字间距、字体内边距、可选中 ----
  assert('letterSpacing 默认是 0', tv.letterSpacing, 0);
  tv.letterSpacing = 0.1;
  assert('letterSpacing 读写（单位 em）', tv.letterSpacing, 0.1);
  assert("letterSpacing = 'abc' 抛 TypeError", thrown(() => { any.letterSpacing = 'abc'; }), 'TypeError');

  assert('includeFontPadding 默认是 true', tv.includeFontPadding, true);
  tv.includeFontPadding = false;
  assert('includeFontPadding 读写', tv.includeFontPadding, false);
  tv.includeFontPadding = /** @type {any} */ (1);
  assert('includeFontPadding = 1 照 Web IDL 转成 true', tv.includeFontPadding, true);

  assert('isTextSelectable 默认是 false', tv.isTextSelectable, false);
  tv.setTextIsSelectable(true);
  assert('setTextIsSelectable(true)', tv.isTextSelectable, true);
  tv.setTextIsSelectable(/** @type {any} */ (''));
  assert("setTextIsSelectable('') 照 Web IDL 转成 false", tv.isTextSelectable, false);
  assert('setTextIsSelectable() 没参数抛 TypeError', thrown(() => any.setTextIsSelectable()), 'TypeError');
  assert('isTextSelectable 只读：赋值抛 TypeError', thrown(() => { any.isTextSelectable = true; }), 'TypeError');

  // ---- 字体特性、可变字体的轴 ----
  const feat = new TextView(activity);
  assert('fontFeatureSettings 默认是 null', feat.fontFeatureSettings, null);
  feat.fontFeatureSettings = "'tnum'";
  assert('fontFeatureSettings 读写', feat.fontFeatureSettings, "'tnum'");
  feat.fontFeatureSettings = null;
  assert('fontFeatureSettings = null', feat.fontFeatureSettings, null);

  assert('fontVariationSettings 默认是 null', feat.fontVariationSettings, null);
  assert('系统字体有 wght 轴：setFontVariationSettings 返回 true',
         feat.setFontVariationSettings("'wght' 700"), true);
  assert('fontVariationSettings 读出设的值', feat.fontVariationSettings, "'wght' 700");
  // 返回值看的是这个视图背后的全部字体文件，包括系统的后备字体（实测：测试字体没有轴，
  // 但后面接着的 Roboto 有 wght，照样返回 true）。所以用一个谁都没有的轴
  assert('没有字体认的轴：setFontVariationSettings 返回 false',
         feat.setFontVariationSettings("'zzzz' 1"), false);
  assert('不生效时 fontVariationSettings 不变', feat.fontVariationSettings, "'wght' 700");
  assert('setFontVariationSettings 写法不对：Java 的异常带类名',
         thrown(() => feat.setFontVariationSettings('wght')), 'IllegalArgumentException');
  assert('setFontVariationSettings() 没参数抛 TypeError', thrown(() => /** @type {any} */ (feat).setFontVariationSettings()), 'TypeError');
  assert('fontVariationSettings 只读：赋值抛 TypeError', thrown(() => { /** @type {any} */ (feat).fontVariationSettings = ''; }), 'TypeError');

  // ---- 按基线定高 ----
  const base = new TextView(activity);
  base.setTextSize('px', 40);
  base.firstBaselineToTopHeight = 100;
  assert('firstBaselineToTopHeight 读写（像素）', base.firstBaselineToTopHeight, 100);
  assert('firstBaselineToTopHeight 是靠上内边距实现的', base.paddingTop > 0, true);
  base.lastBaselineToBottomHeight = 60;
  assert('lastBaselineToBottomHeight 读写（像素）', base.lastBaselineToBottomHeight, 60);
  assert('lastBaselineToBottomHeight 是靠下内边距实现的', base.paddingBottom > 0, true);
  assert('firstBaselineToTopHeight = -1：Java 的异常带类名',
         thrown(() => { base.firstBaselineToTopHeight = -1; }), 'IllegalArgumentException');
  assert("firstBaselineToTopHeight = 'x' 抛 TypeError", thrown(() => { /** @type {any} */ (base).firstBaselineToTopHeight = 'x'; }), 'TypeError');

  // ---- 自动缩字号 ----
  const auto = new TextView(activity);
  assert("autoSizeTextType 默认是 'none'", auto.autoSizeTextType, 'none');
  auto.setAutoSizeTextTypeWithDefaults('uniform');
  assert("setAutoSizeTextTypeWithDefaults('uniform')", auto.autoSizeTextType, 'uniform');
  assert('默认配置：最小字号大于 0', auto.autoSizeMinTextSize > 0, true);
  assert('默认配置：最大字号大于最小', auto.autoSizeMaxTextSize > auto.autoSizeMinTextSize, true);
  auto.setAutoSizeTextTypeUniformWithConfiguration(10, 40, 2, 'px');
  assert('按配置：最小字号 10', auto.autoSizeMinTextSize, 10);
  assert('按配置：最大字号 40', auto.autoSizeMaxTextSize, 40);
  assert('按配置：步长 2', auto.autoSizeStepGranularity, 2);
  assert('按配置：可选字号从 10 到 40 每隔 2', auto.autoSizeTextAvailableSizes.join(','),
         '10,12,14,16,18,20,22,24,26,28,30,32,34,36,38,40');
  auto.setAutoSizeTextTypeUniformWithPresetSizes([12, 16, 20], 'px');
  assert('按给定的几个字号', auto.autoSizeTextAvailableSizes.join(','), '12,16,20');
  auto.setAutoSizeTextTypeWithDefaults('none');
  assert("setAutoSizeTextTypeWithDefaults('none') 关掉", auto.autoSizeTextType, 'none');
  assert('最小比最大大：Java 的异常带类名',
         thrown(() => auto.setAutoSizeTextTypeUniformWithConfiguration(40, 10, 1, 'px')), 'IllegalArgumentException');
  assert('自动缩字号的单位写错抛 TypeError',
         thrown(() => auto.setAutoSizeTextTypeUniformWithConfiguration(10, 40, 1, /** @type {any} */ ('em'))), 'TypeError');
  assert('setAutoSizeTextTypeWithDefaults 写错抛 TypeError',
         thrown(() => auto.setAutoSizeTextTypeWithDefaults(/** @type {any} */ ('fit'))), 'TypeError');
  assert('给定字号不是数组抛 TypeError',
         thrown(() => auto.setAutoSizeTextTypeUniformWithPresetSizes(/** @type {any} */ (12), 'px')), 'TypeError');
  assert('setAutoSizeTextTypeUniformWithConfiguration 少参数抛 TypeError',
         thrown(() => /** @type {any} */ (auto).setAutoSizeTextTypeUniformWithConfiguration(10, 40, 1)), 'TypeError');
  assert('autoSizeTextType 只读：赋值抛 TypeError', thrown(() => { /** @type {any} */ (auto).autoSizeTextType = 'uniform'; }), 'TypeError');

  // ---- 下划线、删除线（paintFlags）----
  const lined = new TextView(activity);
  console.log('  实测：TextView 默认的 paintFlags = ' + JSON.stringify(lined.paintFlags));
  assert("paintFlags 默认带 'antiAlias'", lined.paintFlags.includes('antiAlias'), true);
  lined.paintFlags = [...lined.paintFlags, 'underlineText', 'strikeThruText'];
  assert('加下划线', lined.paintFlags.includes('underlineText'), true);
  assert('加删除线', lined.paintFlags.includes('strikeThruText'), true);
  assert('原来的还在', lined.paintFlags.includes('antiAlias'), true);
  lined.paintFlags = lined.paintFlags.filter((f) => f !== 'underlineText');
  assert('去掉下划线', lined.paintFlags.includes('underlineText'), false);
  const before = lined.paintFlags.join(',');
  const flagWarns = warnings(() => { lined.paintFlags = ['antiAlias', 'bold']; });
  assert('paintFlags 里有不认识的名字打一条警告', flagWarns.length, 1);
  assert('paintFlags 的警告列出可选值', /strikeThruText/.test(flagWarns[0] || ''), true);
  assert('paintFlags 有一个不认识就整次不生效', lined.paintFlags.join(','), before);
  assert("paintFlags = 'underlineText'（不是数组）抛 TypeError", thrown(() => { /** @type {any} */ (lined).paintFlags = 'underlineText'; }), 'TypeError');

  // ---- 文字阴影 ----
  const shadowed = new TextView(activity);
  assert('shadowRadius 默认是 0', shadowed.shadowRadius, 0);
  shadowed.setShadowLayer(4, 2, 3, '#00000080');
  assert('setShadowLayer：shadowRadius', shadowed.shadowRadius, 4);
  assert('setShadowLayer：shadowDx', shadowed.shadowDx, 2);
  assert('setShadowLayer：shadowDy', shadowed.shadowDy, 3);
  assert('setShadowLayer：shadowColor', shadowed.shadowColor, '#00000080');
  assert('setShadowLayer 颜色写错抛 TypeError', thrown(() => shadowed.setShadowLayer(4, 2, 3, 'nope')), 'TypeError');
  assert('setShadowLayer 半径不是数抛 TypeError', thrown(() => shadowed.setShadowLayer(NaN, 2, 3, '#000')), 'TypeError');
  assert('setShadowLayer 少参数抛 TypeError', thrown(() => /** @type {any} */ (shadowed).setShadowLayer(4, 2, 3)), 'TypeError');
  assert('setShadowLayer 抛了之后阴影不变', shadowed.shadowColor, '#00000080');
  assert('shadowColor 只读：赋值抛 TypeError', thrown(() => { /** @type {any} */ (shadowed).shadowColor = '#000'; }), 'TypeError');

  // ---- 测量 ----
  const measured = new TextView(activity);
  measured.text = '第一行\n第二行\n第三行';
  assert('还没排版时 lineCount 是 0', measured.lineCount, 0);
  assert('还没排版时 baseline 是 -1', measured.baseline, -1);
  assert('lineCount 只读：赋值抛 TypeError', thrown(() => { /** @type {any} */ (measured).lineCount = 1; }), 'TypeError');
  const clipped = new TextView(activity);
  clipped.text = 'one\ntwo\nthree';
  clipped.maxLines = 2;
  clipped.ellipsize = 'end';
  const screen = new LinearLayout(activity);
  screen.addView(measured);
  screen.addView(clipped);
  activity.setContentView(screen);
  await sleep(500);
  assert('排过版：三行字的 lineCount 是 3', measured.lineCount, 3);
  assert('排过版：baseline 大于 0', measured.baseline > 0, true);
  assert('maxLines = 2 加省略号：lineCount 是 2', clipped.lineCount, 2);

  // textAlignment：挂上、排过版之后
  const aligned = new TextView(activity);
  aligned.text = '对齐';
  aligned.textAlignment = 'center';
  const inherits = new TextView(activity);
  inherits.text = '继承';
  inherits.textAlignment = 'inherit';
  screen.textAlignment = 'textEnd';
  screen.addView(aligned);
  screen.addView(inherits);
  screen.addView(plain);
  await sleep(500);
  assert("挂上之后 textAlignment 读出设的 'center'", aligned.textAlignment, 'center');
  aligned.textAlignment = 'viewEnd';
  assert("挂上之后 textAlignment = 'viewEnd' 当场读得到", aligned.textAlignment, 'viewEnd');
  const alignWarns = warnings(() => { aligned.textAlignment = /** @type {any} */ ('justify'); });
  assert('textAlignment 写错打一条警告', alignWarns.length, 1);
  assert('textAlignment 的警告列出可选值', /viewStart/.test(alignWarns[0] || ''), true);
  assert('textAlignment 写错保持原值', aligned.textAlignment, 'viewEnd');
  assert("挂上之后 textAlignment = 'inherit' 读出父视图的 'textEnd'", inherits.textAlignment, 'textEnd');
  assert('textAlignment 在 View 上', plain.textAlignment, 'textEnd');
}
