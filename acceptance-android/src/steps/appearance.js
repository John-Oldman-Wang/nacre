// 外观：View 的背景、透明度、可见性、高度和阴影、轮廓和裁切、变换；Drawable 一族
// （ColorDrawable、GradientDrawable、RippleDrawable）；RenderEffect 的模糊。
//
// 颜色写成 CSS 的字符串（'#rrggbb'、'#rrggbbaa'、rgb()……），读出来规范化成小写的
// '#rrggbb'（不透明）或 '#rrggbbaa'。属性写错：打一条警告、值不变；方法参数和构造写错：
// 抛 TypeError。枚举一样。单位是像素，角度是度。
//
// 最后一段把这些都挂到屏幕上画半秒，点一下带水波的那个，看系统真的能画、能点。

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

/** @param {import("../main.js").StepContext} ctx */
export async function stepAppearance(ctx) {
  const { assert } = ctx;
  const activity = application.activity;
  /** @type {any} 故意写错类型的地方用它 */
  let bad;

  // ===== 颜色的写法 =====
  console.log('  --- 外观：颜色的写法 ---');
  const swatch = new ColorDrawable();
  assert('new ColorDrawable() 是全透明', swatch.color, '#00000000');
  /** @type {[string, string][]} */
  const colorCases = [
    ['#ff0000', '#ff0000'],
    ['#F00', '#ff0000'],
    ['#f008', '#ff000088'],
    ['#FF000080', '#ff000080'],
    ['#12345678', '#12345678'],
    ['rgb(0, 128, 255)', '#0080ff'],
    ['rgba(0,0,0,0.5)', '#00000080'],
    ['rgb(0 0 0 / 50%)', '#00000080'],
    ['rgb(100%, 0%, 0%)', '#ff0000'],
    ['RGB(1, 2, 3)', '#010203'],
    ['rgb(300, -5, 0)', '#ff0000'],
    ['  #abcdef  ', '#abcdef'],
    ['transparent', '#00000000'],
    ['TRANSPARENT', '#00000000'],
  ];
  for (const [written, read] of colorCases) {
    swatch.color = '#123456';
    swatch.color = written;
    assert('颜色 ' + JSON.stringify(written) + ' 读出 ' + read, swatch.color, read);
  }

  // 写错：警告、值不变
  swatch.color = '#123456';
  assert('颜色写错 #GGG：一条警告',
         warnings(() => { swatch.color = '#GGG'; }),
         '[Nacre] color: "#GGG" is not a valid color, ignored');
  assert('颜色写错之后值不变', swatch.color, '#123456');
  /** @type {unknown[]} */
  const badColors = ['#12345', 'red', 'hsl(0 100% 50%)', 'rgb(1, 2)', '', null, 0xff0000];
  for (const v of badColors) {
    bad = v;
    assert('不支持的颜色 ' + JSON.stringify(v) + ' 打一条警告',
           warnings(() => { swatch.color = bad; }).startsWith('[Nacre] color: '), true);
  }
  assert('不支持的颜色写了几次值都不变', swatch.color, '#123456');

  // 构造和方法参数写错：抛
  assert('new ColorDrawable 颜色写错抛 TypeError', thrown(() => new ColorDrawable('#GGG')), 'TypeError');
  assert('new ColorDrawable 给 CSS 颜色', new ColorDrawable('rgb(0, 0, 255)').color, '#0000ff');

  // ===== View：背景和前景 =====
  console.log('  --- 外观：背景和前景 ---');
  const view = new View(activity);
  assert('View 一开始没有背景', view.background, null);
  assert('View 一开始没有前景', view.foreground, null);
  view.setBackgroundColor('#336699');
  const bg = view.background;
  assert('setBackgroundColor 之后背景是 ColorDrawable', bg instanceof ColorDrawable, true);
  assert('ColorDrawable 也是 Drawable', bg instanceof Drawable, true);
  assert('背景的颜色读得回来', bg instanceof ColorDrawable ? bg.color : null, '#336699');
  assert('再读一次背景是同一个包装', view.background === bg, true);
  assert('setBackgroundColor 颜色写错抛 TypeError', thrown(() => view.setBackgroundColor('nope')), 'TypeError');
  assert('setBackgroundColor 不给参数抛 TypeError',
         thrown(() => /** @type {any} */ (view).setBackgroundColor()), 'TypeError');

  const card = new GradientDrawable();
  view.background = card;
  assert('background 设成 GradientDrawable', view.background === card, true);
  view.foreground = new ColorDrawable('#00000020');
  assert('foreground 设成 ColorDrawable', view.foreground instanceof ColorDrawable, true);
  view.foreground = null;
  assert('foreground 设成 null', view.foreground, null);
  bad = {};
  assert('background 给普通对象抛 TypeError', thrown(() => { view.background = bad; }), 'TypeError');
  assert('background 给普通对象之后不变', view.background === card, true);
  bad = '#ff0000';
  assert('background 给颜色字符串抛 TypeError', thrown(() => { view.background = bad; }), 'TypeError');
  view.background = null;
  assert('background 设成 null', view.background, null);

  // ===== View：透明度、可见性 =====
  console.log('  --- 外观：透明度和可见性 ---');
  assert('alpha 默认 1', view.alpha, 1);
  view.alpha = 0.3;
  assert('alpha 写 0.3 读出 0.3', view.alpha, 0.3);
  bad = '0.5';
  view.alpha = bad;
  assert("alpha 写 '0.5' 照 Web IDL 转成 0.5", view.alpha, 0.5);
  bad = null;
  view.alpha = bad;
  assert('alpha 写 null 得到 0', view.alpha, 0);
  bad = 'abc';
  assert("alpha 写 'abc' 抛 TypeError", thrown(() => { view.alpha = bad; }), 'TypeError');
  assert('alpha 写 NaN 抛 TypeError', thrown(() => { view.alpha = NaN; }), 'TypeError');
  assert('alpha 写错之后不变', view.alpha, 0);
  view.alpha = 1;

  assert("visibility 默认 'visible'", view.visibility, 'visible');
  view.visibility = 'invisible';
  assert("visibility 写 'invisible'", view.visibility, 'invisible');
  view.visibility = 'gone';
  assert("visibility 写 'gone'", view.visibility, 'gone');
  bad = 'hidden';
  assert('visibility 写错：一条警告，列出全部可选值',
         warnings(() => { view.visibility = bad; }),
         '[Nacre] visibility has no value "hidden"; expected one of: visible / invisible / gone, ignored');
  assert('visibility 写错之后不变', view.visibility, 'gone');
  bad = 0;
  assert('visibility 写数字 0 也是一条警告（不认整数常量）',
         warnings(() => { view.visibility = bad; }).startsWith('[Nacre] visibility has no value "0"'), true);
  view.visibility = 'visible';

  // ===== View：高度、阴影、轮廓 =====
  console.log('  --- 外观：高度、阴影和轮廓 ---');
  assert('elevation 默认 0', view.elevation, 0);
  view.elevation = 8;
  assert('elevation 写 8', view.elevation, 8);
  bad = '12';
  view.elevation = bad;
  assert("elevation 写 '12' 转成 12", view.elevation, 12);
  view.elevation = 8;
  view.translationZ = 2;
  assert('translationZ 写 2', view.translationZ, 2);
  assert('z = elevation + translationZ', view.z, 10);
  view.z = 5;
  assert('写 z 改的是 translationZ', view.translationZ, -3);
  assert('写 z 之后 elevation 不变', view.elevation, 8);
  bad = undefined;
  assert('elevation 写 undefined 抛 TypeError', thrown(() => { view.elevation = bad; }), 'TypeError');

  assert("outlineProvider 默认 'background'", view.outlineProvider, 'background');
  view.outlineProvider = 'bounds';
  assert("outlineProvider 写 'bounds'", view.outlineProvider, 'bounds');
  view.outlineProvider = 'paddedBounds';
  assert("outlineProvider 写 'paddedBounds'", view.outlineProvider, 'paddedBounds');
  view.outlineProvider = 'none';
  assert("outlineProvider 写 'none'", view.outlineProvider, 'none');
  bad = 'oval';
  assert('outlineProvider 写错：一条警告',
         warnings(() => { view.outlineProvider = bad; }),
         '[Nacre] outlineProvider has no value "oval"; expected one of: background / bounds / paddedBounds / none, ignored');
  assert('outlineProvider 写错之后不变', view.outlineProvider, 'none');
  view.outlineProvider = 'background';

  assert('clipToOutline 默认 false', view.clipToOutline, false);
  view.clipToOutline = true;
  assert('clipToOutline 写 true', view.clipToOutline, true);
  bad = 0;
  view.clipToOutline = bad;
  assert('clipToOutline 写 0 照 Web IDL 得到 false', view.clipToOutline, false);
  bad = 'false';
  view.clipToOutline = bad;
  assert("clipToOutline 写 'false' 照 Web IDL 得到 true", view.clipToOutline, true);

  assert('outlineAmbientShadowColor 默认黑色', view.outlineAmbientShadowColor, '#000000');
  assert('outlineSpotShadowColor 默认黑色', view.outlineSpotShadowColor, '#000000');
  view.outlineAmbientShadowColor = '#ff000080';
  assert('outlineAmbientShadowColor 写半透明红', view.outlineAmbientShadowColor, '#ff000080');
  view.outlineSpotShadowColor = 'rgb(0, 0, 255)';
  assert('outlineSpotShadowColor 写 rgb()', view.outlineSpotShadowColor, '#0000ff');
  assert('阴影颜色写错：一条警告',
         warnings(() => { view.outlineSpotShadowColor = '#xyz'; }),
         '[Nacre] outlineSpotShadowColor: "#xyz" is not a valid color, ignored');
  assert('阴影颜色写错之后不变', view.outlineSpotShadowColor, '#0000ff');

  // ===== View：变换 =====
  console.log('  --- 外观：变换 ---');
  /** @type {['translationX' | 'translationY' | 'scaleX' | 'scaleY' | 'rotation' | 'rotationX' | 'rotationY', number, number][]} */
  const transforms = [
    ['translationX', 0, 12.5],
    ['translationY', 0, -40],
    ['scaleX', 1, 1.5],
    ['scaleY', 1, 0.25],
    ['rotation', 0, 45],
    ['rotationX', 0, 30],
    ['rotationY', 0, -15],
  ];
  for (const [name, initial, value] of transforms) {
    assert(name + ' 默认 ' + initial, view[name], initial);
    view[name] = value;
    assert(name + ' 写 ' + value, view[name], value);
    bad = 'x';
    assert(name + " 写 'x' 抛 TypeError", thrown(() => { view[name] = bad; }), 'TypeError');
    assert(name + ' 写错之后不变', view[name], value);
  }

  assert('isPivotSet 默认 false', view.isPivotSet, false);
  view.pivotX = 10;
  view.pivotY = 20;
  assert('pivotX 写 10', view.pivotX, 10);
  assert('pivotY 写 20', view.pivotY, 20);
  assert('写了中心点之后 isPivotSet 是 true', view.isPivotSet, true);
  view.resetPivot();
  assert('resetPivot 之后 isPivotSet 是 false', view.isPivotSet, false);
  bad = {};
  assert('pivotX 写对象抛 TypeError', thrown(() => { view.pivotX = bad; }), 'TypeError');

  view.cameraDistance = 8000;
  assert('cameraDistance 写 8000（差不到 1 像素）', Math.abs(view.cameraDistance - 8000) < 1, true);

  // ===== GradientDrawable =====
  console.log('  --- 外观：GradientDrawable ---');
  const g = new GradientDrawable();
  assert('GradientDrawable 是 Drawable', g instanceof Drawable, true);
  assert("shape 默认 'rectangle'", g.shape, 'rectangle');
  assert('color 默认 null', g.color, null);
  assert('colors 默认 null', g.colors, null);
  assert("gradientType 默认 'linearGradient'", g.gradientType, 'linearGradient');
  assert("orientation 默认 'topBottom'", g.orientation, 'topBottom');
  assert('cornerRadius 默认 0', g.cornerRadius, 0);
  assert('cornerRadii 默认 null', g.cornerRadii, null);
  assert('useLevel 默认 false', g.useLevel, false);
  assert('alpha 默认 255', g.alpha, 255);
  assert('intrinsicWidth 默认 -1（没有固有尺寸）', g.intrinsicWidth, -1);
  assert('intrinsicHeight 默认 -1', g.intrinsicHeight, -1);

  for (const shape of /** @type {const} */ (['oval', 'line', 'ring', 'rectangle'])) {
    g.shape = shape;
    assert('shape 写 ' + shape, g.shape, shape);
  }
  bad = 'circle';
  assert('shape 写错：一条警告',
         warnings(() => { g.shape = bad; }),
         '[Nacre] shape has no value "circle"; expected one of: rectangle / oval / line / ring, ignored');
  assert('shape 写错之后不变', g.shape, 'rectangle');

  g.color = '#00ff00';
  assert('color 写 #00ff00', g.color, '#00ff00');
  assert('color 写错：一条警告',
         warnings(() => { g.color = 'green'; }),
         '[Nacre] color: "green" is not a valid color, ignored');
  assert('color 写错之后不变', g.color, '#00ff00');

  g.colors = ['#ff0000', 'rgb(0, 0, 255)'];
  assert('colors 写两个颜色', String(g.colors), '#ff0000,#0000ff');
  assert('设了渐变之后 color 是 null', g.color, null);
  assert('colors 里有一个写错：一条警告',
         warnings(() => { g.colors = ['#000000', 'nope']; }),
         '[Nacre] colors: "nope" is not a valid color, ignored');
  assert('colors 里有一个写错，整次不生效', String(g.colors), '#ff0000,#0000ff');
  bad = '#000000';
  assert('colors 给的不是数组抛 TypeError', thrown(() => { g.colors = bad; }), 'TypeError');
  g.color = '#ffffff';
  assert('再设 color 之后 colors 是 null', g.colors, null);
  g.colors = ['#000', '#fff'];
  g.colors = null;
  assert('colors 写 null', g.colors, null);

  g.setColors(['#ff0000', '#00ff00', '#0000ff'], [0, 0.2, 1]);
  assert('setColors 带位置', String(g.colors), '#ff0000,#00ff00,#0000ff');
  g.setColors(['#111111', '#222222'], null);
  assert('setColors 位置给 null', String(g.colors), '#111111,#222222');
  assert('setColors 颜色写错抛 TypeError', thrown(() => g.setColors(['#zzz', '#000'], null)), 'TypeError');
  assert('setColors 颜色和位置个数不同抛 RangeError',
         thrown(() => g.setColors(['#000', '#fff'], [0, 0.5, 1])), 'RangeError');
  assert('setColors 位置不是数抛 TypeError', thrown(() => g.setColors(['#000', '#fff'], [0, 'x'])), 'TypeError');

  for (const t of /** @type {const} */ (['radialGradient', 'sweepGradient', 'linearGradient'])) {
    g.gradientType = t;
    assert('gradientType 写 ' + t, g.gradientType, t);
  }
  bad = 'linear';
  assert('gradientType 写错：一条警告',
         warnings(() => { g.gradientType = bad; }),
         '[Nacre] gradientType has no value "linear"; expected one of: linearGradient / radialGradient / sweepGradient, ignored');

  const orientations = /** @type {const} */ (['trBl', 'rightLeft', 'brTl', 'bottomTop', 'blTr', 'leftRight', 'tlBr', 'topBottom']);
  for (const o of orientations) {
    g.orientation = o;
    assert('orientation 写 ' + o, g.orientation, o);
  }
  bad = 'TOP_BOTTOM';
  assert('orientation 写 Java 的常量名：一条警告',
         warnings(() => { g.orientation = bad; }),
         '[Nacre] orientation has no value "TOP_BOTTOM"; expected one of: ' +
         'topBottom / trBl / rightLeft / brTl / bottomTop / blTr / leftRight / tlBr, ignored');

  g.setGradientCenter(0.25, 0.75);
  assert('setGradientCenter 之后 gradientCenterX', g.gradientCenterX, 0.25);
  assert('setGradientCenter 之后 gradientCenterY', g.gradientCenterY, 0.75);
  assert('setGradientCenter 给一个参数抛 TypeError',
         thrown(() => /** @type {any} */ (g).setGradientCenter(0.5)), 'TypeError');
  // 渐变半径只对放射渐变有意义
  g.gradientType = 'radialGradient';
  g.gradientRadius = 120;
  assert('放射渐变的 gradientRadius 写 120', g.gradientRadius, 120);
  g.gradientType = 'linearGradient';

  g.cornerRadius = 16;
  assert('cornerRadius 写 16', g.cornerRadius, 16);
  g.cornerRadii = [1, 2, 3, 4, 5, 6, 7, 8];
  assert('cornerRadii 写 8 个数', String(g.cornerRadii), '1,2,3,4,5,6,7,8');
  assert('cornerRadii 不是 8 个数抛 RangeError', thrown(() => { g.cornerRadii = [1, 2, 3]; }), 'RangeError');
  assert('cornerRadii 有一个不是数抛 TypeError',
         thrown(() => { g.cornerRadii = [1, 2, 3, 4, 5, 6, 7, 'x']; }), 'TypeError');
  assert('cornerRadii 写错之后不变', String(g.cornerRadii), '1,2,3,4,5,6,7,8');
  g.cornerRadii = null;
  assert('cornerRadii 写 null', g.cornerRadii, null);

  g.setStroke(3, '#000000');
  g.setStroke(3, '#000000', 6, 4);
  assert('setStroke 两个和四个参数都能调', true, true);
  assert('setStroke 三个参数抛 TypeError',
         thrown(() => /** @type {any} */ (g).setStroke(3, '#000', 6)), 'TypeError');
  assert('setStroke 颜色写错抛 TypeError', thrown(() => g.setStroke(3, 'black')), 'TypeError');
  assert("setStroke 宽度写 'x' 抛 TypeError", thrown(() => g.setStroke(/** @type {any} */ ('x'), '#000')), 'TypeError');

  g.setSize(120, 48);
  assert('setSize 之后 intrinsicWidth', g.intrinsicWidth, 120);
  assert('setSize 之后 intrinsicHeight', g.intrinsicHeight, 48);

  g.innerRadius = 10;
  assert('innerRadius 写 10', g.innerRadius, 10);
  g.innerRadiusRatio = 2.5;
  assert('innerRadiusRatio 写 2.5', g.innerRadiusRatio, 2.5);
  g.thickness = 6;
  assert('thickness 写 6', g.thickness, 6);
  g.thicknessRatio = 4;
  assert('thicknessRatio 写 4', g.thicknessRatio, 4);
  g.useLevel = true;
  assert('useLevel 写 true', g.useLevel, true);
  g.useLevel = false;

  g.alpha = 128;
  assert('Drawable.alpha 写 128', g.alpha, 128);
  bad = '64.9';
  g.alpha = bad;
  assert("Drawable.alpha 写 '64.9' 向零取整成 64", g.alpha, 64);
  bad = 'x';
  assert("Drawable.alpha 写 'x' 抛 TypeError", thrown(() => { g.alpha = bad; }), 'TypeError');
  g.alpha = 255;

  const g2 = new GradientDrawable('leftRight', ['#000', '#fff']);
  assert('new GradientDrawable(方向, 颜色) 的方向', g2.orientation, 'leftRight');
  assert('new GradientDrawable(方向, 颜色) 的颜色', String(g2.colors), '#000000,#ffffff');
  assert('new GradientDrawable 方向写错抛 TypeError',
         thrown(() => new GradientDrawable(/** @type {any} */ ('sideways'), ['#000', '#fff'])), 'TypeError');
  assert('new GradientDrawable 颜色写错抛 TypeError',
         thrown(() => new GradientDrawable('leftRight', ['#000', 'white'])), 'TypeError');

  // ===== RippleDrawable =====
  console.log('  --- 外观：RippleDrawable ---');
  const content = new GradientDrawable();
  content.color = '#e8e8ff';
  content.cornerRadius = 24;
  const ripple = new RippleDrawable('#00000040', content, null);
  assert('RippleDrawable 是 Drawable', ripple instanceof Drawable, true);
  assert("radius 默认 'auto'", ripple.radius, 'auto');
  ripple.radius = 40;
  assert('radius 写 40', ripple.radius, 40);
  ripple.radius = 'auto';
  assert("radius 写 'auto'", ripple.radius, 'auto');
  bad = 'big';
  assert('radius 写错：一条警告',
         warnings(() => { ripple.radius = bad; }).startsWith('[Nacre] radius has no value "big"'), true);
  assert('radius 写错之后不变', ripple.radius, 'auto');
  ripple.setColor('#ff000040');
  assert('setColor 能调', true, true);
  assert('setColor 颜色写错抛 TypeError', thrown(() => ripple.setColor('nope')), 'TypeError');
  assert('new RippleDrawable 只给颜色（内容和遮罩可以不给）',
         new RippleDrawable('#00000020') instanceof RippleDrawable, true);
  assert('new RippleDrawable 不给颜色抛 TypeError',
         thrown(() => new /** @type {any} */ (RippleDrawable)()), 'TypeError');
  assert('new RippleDrawable 内容不是 Drawable 抛 TypeError',
         thrown(() => new RippleDrawable('#000', /** @type {any} */ ({}), null)), 'TypeError');
  assert('new RippleDrawable 颜色写错抛 TypeError',
         thrown(() => new RippleDrawable('nope', null, null)), 'TypeError');

  // ===== 不能 new 的 =====
  assert('Drawable 是抽象类，new 抛 TypeError', thrown(() => new /** @type {any} */ (Drawable)()), 'TypeError');
  class MyDrawable extends Drawable {}
  assert('继承 Drawable，new 抛 TypeError', thrown(() => new MyDrawable()), 'TypeError');
  class Tinted extends GradientDrawable {}
  assert('继承 GradientDrawable 能 new（继承只在 JS 这一层）', new Tinted() instanceof GradientDrawable, true);

  // ===== RenderEffect =====
  console.log('  --- 外观：RenderEffect ---');
  // 这台手机是 Android 12 以上，有 RenderEffect；Android 11 上没有这个类，View 上也没有
  // setRenderEffect（那一支没有设备，未验证）
  assert('RenderEffect 在全局', typeof RenderEffect, 'function');
  assert('View 上有 setRenderEffect', 'setRenderEffect' in View.prototype, true);
  assert('RenderEffect 不能 new', thrown(() => new /** @type {any} */ (RenderEffect)()), 'TypeError');
  const blur = RenderEffect.createBlurEffect(8, 8);
  assert('createBlurEffect 两个参数', blur instanceof RenderEffect, true);
  for (const edge of /** @type {const} */ (['clamp', 'repeat', 'mirror', 'decal'])) {
    assert('createBlurEffect 边缘 ' + edge,
           RenderEffect.createBlurEffect(4, 2, edge) instanceof RenderEffect, true);
  }
  assert('createBlurEffect 边缘写错抛 TypeError',
         thrown(() => RenderEffect.createBlurEffect(4, 4, /** @type {any} */ ('blurry'))), 'TypeError');
  assert("createBlurEffect 半径写 'x' 抛 TypeError",
         thrown(() => RenderEffect.createBlurEffect(/** @type {any} */ ('x'), 4)), 'TypeError');
  assert('createBlurEffect 只给一个参数抛 TypeError',
         thrown(() => /** @type {any} */ (RenderEffect).createBlurEffect(4)), 'TypeError');
  view.setRenderEffect(blur);
  view.setRenderEffect(null);
  assert('setRenderEffect 给效果、给 null 都能调', true, true);
  assert('setRenderEffect 给普通对象抛 TypeError',
         thrown(() => view.setRenderEffect(/** @type {any} */ ({}))), 'TypeError');
  assert('setRenderEffect 不给参数抛 TypeError',
         thrown(() => /** @type {any} */ (view).setRenderEffect()), 'TypeError');

  // ===== 挂到屏幕上：系统真的画、真的能点 =====
  console.log('  --- 外观：挂到屏幕上 ---');
  const screen = new LinearLayout(activity);
  screen.setPadding(48, 400, 48, 0);

  const cardView = new TextView(activity);
  cardView.text = '圆角、边框和阴影';
  const cardBg = new GradientDrawable();
  cardBg.color = '#ffffff';
  cardBg.cornerRadius = 32;
  cardBg.setStroke(4, '#3366cc');
  cardView.background = cardBg;
  cardView.setPadding(40, 40, 40, 40);
  cardView.elevation = 24;
  cardView.clipToOutline = true;
  cardView.outlineSpotShadowColor = '#3366cc';

  const button = new TextView(activity);
  button.text = '点我看水波';
  const buttonBg = new GradientDrawable('leftRight', ['#e0e8ff', '#ffe0f0']);
  buttonBg.cornerRadius = 24;
  button.background = new RippleDrawable('#3366cc60', buttonBg, null);
  button.setPadding(40, 40, 40, 40);

  const blurred = new TextView(activity);
  blurred.text = '模糊的字';
  blurred.setRenderEffect(RenderEffect.createBlurEffect(6, 6, 'clamp'));
  blurred.rotation = -4;
  blurred.scaleX = 1.2;
  blurred.alpha = 0.8;

  screen.addView(cardView);
  screen.addView(button);
  screen.addView(blurred);
  activity.setContentView(screen);

  /** @type {Promise<boolean>} */
  const clicked = new Promise((resolve) => {
    button.addEventListener('click', () => resolve(true), { once: true });
    setTimeout(() => resolve(false), 10000);
  });
  await sleep(300);
  console.log('[acceptance] tap 点我看水波');
  assert('带 RippleDrawable 背景的视图点得到', await clicked, true);
  await sleep(500);
  assert('背景还是挂上去的那个 RippleDrawable', button.background instanceof RippleDrawable, true);
  assert('阴影、圆角裁切、水波、模糊一起画了半秒', screen.childCount, 3);
}
