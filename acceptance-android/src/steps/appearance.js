// 外观：View 的背景、前景、透明度、可见性、高度和阴影、轮廓和裁切、变换、模糊；Drawable 一族
// （ColorDrawable、GradientDrawable、RippleDrawable）；RenderEffect 的模糊。
//
// 照「接类的总则」（2026-11-26）：视图和 Drawable 都只在 JS 里记状态，读回的就是写进去的值，
// 颜色也原样读回。Drawable 每用在一个挂着的视图上，就按那个页面建一个原生对象，JS 改了挨个同步
// 过去。长度是 dp，角度是度，透明度一律 0–1。
//
// 写错：Web IDL 转不过来的抛 TypeError；超出范围、个数不对抛 RangeError；颜色、枚举的名字
// 写错，属性位打一条警告、值不变，方法和构造的参数抛 TypeError。
//
// 原生那边是不是真的设上了，这一步读不到（状态以 JS 为准，没有读原生的成员）。这里验的是：
// 挂上、挂着时改、拿下来再放回去、密度变了，都没有警告、没有抛；最后点一下带水波的那个。

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

/**
 * 跑 fn，抛了的和打的警告都收下来：没有是空串
 * @param {() => unknown} fn
 */
function problems(fn) {
  /** @type {string[]} */
  const seen = [];
  const w = warnings(() => {
    try {
      fn();
    } catch (err) {
      seen.push(err instanceof Error ? err.name + ': ' + err.message : String(err));
    }
  });
  if (w !== '') seen.push(w);
  return seen.join(' | ');
}

/** @param {number} ms */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** @param {unknown} v */
const json = (v) => JSON.stringify(v);

/** @param {import("../main.js").StepContext} ctx */
export async function stepAppearance(ctx) {
  const { assert } = ctx;
  const activity = /** @type {Activity} */ (ctx.activity);
  /** @type {any} 故意写错类型的地方用它 */
  let bad;

  // ===== 颜色的写法：原样读回 =====
  console.log('  --- 外观：颜色的写法 ---');
  const swatch = new ColorDrawable();
  assert('new ColorDrawable() 是全透明', swatch.color, '#00000000');
  const colorCases = [
    '#ff0000', '#F00', '#f008', '#FF000080', '#12345678',
    'rgb(0, 128, 255)', 'rgba(0,0,0,0.5)', 'rgb(0 0 0 / 50%)', 'rgb(100%, 0%, 0%)', 'RGB(1, 2, 3)',
    'rgb(300, -5, 0)', '  #abcdef  ', 'transparent', 'TRANSPARENT',
  ];
  for (const written of colorCases) {
    swatch.color = '#123456';
    assert('颜色 ' + json(written) + ' 不打警告', warnings(() => { swatch.color = written; }), '');
    assert('颜色 ' + json(written) + ' 原样读回', swatch.color, written);
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
    assert('不支持的颜色 ' + json(v) + ' 打一条警告',
           warnings(() => { swatch.color = bad; }).startsWith('[Nacre] color: '), true);
  }
  assert('不支持的颜色写了几次值都不变', swatch.color, '#123456');

  // 构造的参数写错：抛
  assert('new ColorDrawable 颜色写错抛 TypeError', thrown(() => new ColorDrawable('#GGG')), 'TypeError');
  assert('new ColorDrawable 给的颜色原样读回', new ColorDrawable('rgb(0, 0, 255)').color, 'rgb(0, 0, 255)');

  // ===== Drawable 共有的：alpha =====
  console.log('  --- 外观：Drawable ---');
  assert('Drawable.alpha 默认 1', swatch.alpha, 1);
  swatch.alpha = 0.5;
  assert('Drawable.alpha 写 0.5', swatch.alpha, 0.5);
  bad = '0.25';
  swatch.alpha = bad;
  assert("Drawable.alpha 写 '0.25' 照 Web IDL 转成 0.25", swatch.alpha, 0.25);
  bad = 'x';
  assert("Drawable.alpha 写 'x' 抛 TypeError", thrown(() => { swatch.alpha = bad; }), 'TypeError');
  assert('Drawable.alpha 写 2 抛 RangeError（一律 0–1）', thrown(() => { swatch.alpha = 2; }), 'RangeError');
  assert('Drawable.alpha 写 255 抛 RangeError（不是 Java 的 0–255）', thrown(() => { swatch.alpha = 255; }), 'RangeError');
  assert('Drawable.alpha 写 -0.1 抛 RangeError', thrown(() => { swatch.alpha = -0.1; }), 'RangeError');
  assert('Drawable.alpha 写错之后不变', swatch.alpha, 0.25);
  swatch.color = '#ff0000';
  assert('改了 alpha 之后 ColorDrawable.color 还是写进去的值（不乘透明度）', swatch.color, '#ff0000');
  swatch.alpha = 1;
  assert('ColorDrawable 没有固有尺寸这个成员', 'intrinsicWidth' in swatch, false);

  assert('Drawable 是抽象类，new 抛 TypeError', thrown(() => new /** @type {any} */ (Drawable)()), 'TypeError');
  class MyDrawable extends Drawable {}
  assert('继承 Drawable，new 抛 TypeError', thrown(() => new MyDrawable()), 'TypeError');
  class Tinted extends GradientDrawable {}
  const tinted = new Tinted();
  assert('继承 GradientDrawable 能 new（继承只在 JS 这一层）', tinted instanceof GradientDrawable, true);
  tinted.color = '#abcdef';
  assert('子类的实例照样记状态', tinted.color, '#abcdef');
  assert('绕过构造建出来的读属性抛 TypeError',
         thrown(() => /** @type {any} */ (Object.create(GradientDrawable.prototype)).color), 'TypeError');

  // ===== View：背景和前景 =====
  console.log('  --- 外观：背景和前景 ---');
  const view = new View();
  assert('View 一开始没有背景', view.background, null);
  assert('View 一开始没有前景', view.foreground, null);
  assert('setBackgroundColor 没有了（改成 background = new ColorDrawable(…)）',
         'setBackgroundColor' in view, false);
  const fill = new ColorDrawable('#336699');
  view.background = fill;
  assert('background 读回写进去的那个 Drawable', view.background === fill, true);
  const card = new GradientDrawable();
  view.background = card;
  assert('background 换成 GradientDrawable', view.background === card, true);
  view.foreground = new ColorDrawable('#00000020');
  assert('foreground 设成 ColorDrawable', view.foreground instanceof ColorDrawable, true);
  view.foreground = null;
  assert('foreground 设成 null', view.foreground, null);
  bad = {};
  assert('background 给普通对象抛 TypeError', thrown(() => { view.background = bad; }), 'TypeError');
  assert('background 给普通对象之后不变', view.background === card, true);
  bad = '#ff0000';
  assert('background 给颜色字符串抛 TypeError', thrown(() => { view.background = bad; }), 'TypeError');
  bad = new View();
  assert('background 给视图抛 TypeError', thrown(() => { view.background = bad; }), 'TypeError');
  view.background = null;
  assert('background 设成 null', view.background, null);
  view.background = card;
  bad = undefined;
  view.background = bad;
  assert('background 写 undefined 照 Web IDL 得到 null', view.background, null);
  const other = new View();
  view.background = card;
  other.background = card;
  assert('同一个 Drawable 给两个视图，两边读到的都是它', view.background === card && other.background === card, true);

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
  assert('alpha 写 1.5 抛 RangeError', thrown(() => { view.alpha = 1.5; }), 'RangeError');
  assert('alpha 写 -0.5 抛 RangeError', thrown(() => { view.alpha = -0.5; }), 'RangeError');
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
  view.elevation = 8.5;
  assert('elevation 写 8.5（dp，可以是小数）', view.elevation, 8.5);
  bad = '12';
  view.elevation = bad;
  assert("elevation 写 '12' 转成 12", view.elevation, 12);
  bad = undefined;
  assert('elevation 写 undefined 抛 TypeError', thrown(() => { view.elevation = bad; }), 'TypeError');
  view.elevation = -2;
  assert('elevation 可以是负的', view.elevation, -2);
  view.elevation = 8;
  assert('translationZ 默认 0', view.translationZ, 0);
  view.translationZ = 2;
  assert('translationZ 写 2', view.translationZ, 2);
  assert('没有 z（它等于 elevation + translationZ，推得出来）', 'z' in view, false);

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
  bad = 'custom';
  assert("outlineProvider 写 'custom' 也是一条警告", warnings(() => { view.outlineProvider = bad; }) !== '', true);
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
  assert('outlineSpotShadowColor 写 rgb()，原样读回', view.outlineSpotShadowColor, 'rgb(0, 0, 255)');
  assert('阴影颜色写错：一条警告',
         warnings(() => { view.outlineSpotShadowColor = '#xyz'; }),
         '[Nacre] outlineSpotShadowColor: "#xyz" is not a valid color, ignored');
  assert('阴影颜色写错之后不变', view.outlineSpotShadowColor, 'rgb(0, 0, 255)');

  // ===== View：变换 =====
  console.log('  --- 外观：变换 ---');
  /** @type {['translationX' | 'translationY' | 'scaleX' | 'scaleY' | 'rotation' | 'rotationX' | 'rotationY', number, number][]} */
  const transforms = [
    ['translationX', 0, 12.5],
    ['translationY', 0, -40],
    ['scaleX', 1, 1.5],
    ['scaleY', 1, -0.25],
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

  // 中心点：一个 { x, y }（dp），null 是视图的正中（跟着大小变）
  assert('pivot 默认 null（正中）', view.pivot, null);
  const written = { x: 10, y: 20.5 };
  view.pivot = written;
  const pivot = view.pivot;
  assert('pivot 写 { x: 10, y: 20.5 }', json(pivot), '{"x":10,"y":20.5}');
  assert('pivot 读出来是冻结的', pivot !== null && Object.isFrozen(pivot), true);
  assert('pivot 不是写进去的那个对象（改它不会改视图）', pivot === written, false);
  assert('pivot 读两次是同一个', view.pivot === pivot, true);
  bad = { x: '5', y: 6 };
  view.pivot = bad;
  assert("pivot 的成员照 Web IDL 转成数（x: '5'）", json(view.pivot), '{"x":5,"y":6}');
  bad = { x: 1 };
  assert('pivot 缺 y 抛 TypeError', thrown(() => { view.pivot = bad; }), 'TypeError');
  bad = { x: 1, y: 'x' };
  assert("pivot 的 y 是 'x' 抛 TypeError", thrown(() => { view.pivot = bad; }), 'TypeError');
  bad = 5;
  assert('pivot 写数抛 TypeError', thrown(() => { view.pivot = bad; }), 'TypeError');
  assert('pivot 写错之后不变', json(view.pivot), '{"x":5,"y":6}');
  view.pivot = null;
  assert('pivot 写 null 回到正中', view.pivot, null);
  assert('pivotX、pivotY、isPivotSet、resetPivot 都没有了（合成了 pivot）',
         ['pivotX', 'pivotY', 'isPivotSet', 'resetPivot'].some((n) => n in view), false);

  assert('cameraDistance 默认 1280（dp）', view.cameraDistance, 1280);
  view.cameraDistance = 3000;
  assert('cameraDistance 写 3000', view.cameraDistance, 3000);
  view.cameraDistance = 0;
  assert('cameraDistance 写 0', view.cameraDistance, 0);
  assert('cameraDistance 写负数抛 RangeError', thrown(() => { view.cameraDistance = -1; }), 'RangeError');
  assert('cameraDistance 写错之后不变', view.cameraDistance, 0);
  view.cameraDistance = 1280;

  // ===== GradientDrawable =====
  console.log('  --- 外观：GradientDrawable ---');
  const g = new GradientDrawable();
  assert('GradientDrawable 是 Drawable', g instanceof Drawable, true);
  /** @type {[string, unknown][]} */
  const gradientDefaults = [
    ['shape', 'rectangle'], ['color', null], ['colors', null], ['gradientType', 'linearGradient'],
    ['orientation', 'topBottom'], ['gradientCenterX', 0.5], ['gradientCenterY', 0.5], ['gradientRadius', null],
    ['cornerRadius', 0], ['cornerRadii', null], ['innerRadius', null], ['innerRadiusRatio', 3],
    ['thickness', null], ['thicknessRatio', 9], ['useLevel', false], ['intrinsicWidth', null],
    ['intrinsicHeight', null], ['strokeWidth', 0], ['strokeColor', '#000000'], ['strokeDashWidth', 0],
    ['strokeDashGap', 0], ['alpha', 1],
  ];
  for (const [name, value] of gradientDefaults) {
    assert('GradientDrawable.' + name + ' 默认 ' + json(value), /** @type {any} */ (g)[name], value);
  }
  assert('setColors、setGradientCenter、setStroke、setSize 都没有了（改成属性）',
         ['setColors', 'setGradientCenter', 'setStroke', 'setSize'].some((n) => n in g), false);
  bad = new GradientDrawable(/** @type {any} */ ('leftRight'), /** @type {any} */ (['#000', '#fff']));
  assert('构造只有无参的，多给的参数不管', bad.orientation === 'topBottom' && bad.colors === null, true);

  for (const shape of /** @type {const} */ (['oval', 'line', 'ring', 'rectangle'])) {
    g.shape = shape;
    assert('shape 写 ' + shape, g.shape, shape);
  }
  bad = 'circle';
  assert('shape 写错：一条警告',
         warnings(() => { g.shape = bad; }),
         '[Nacre] shape has no value "circle"; expected one of: rectangle / oval / line / ring, ignored');
  assert('shape 写错之后不变', g.shape, 'rectangle');

  // 纯色和渐变：一个 Drawable 只能是其中一种
  g.color = '#00ff00';
  assert('color 写 #00ff00', g.color, '#00ff00');
  assert('color 写错：一条警告',
         warnings(() => { g.color = 'green'; }),
         '[Nacre] color: "green" is not a valid color, ignored');
  assert('color 写错之后不变', g.color, '#00ff00');

  g.colors = ['#ff0000', 'rgb(0, 0, 255)'];
  const colors = g.colors;
  assert('colors 写两个颜色，原样读回', json(colors), '["#ff0000","rgb(0, 0, 255)"]');
  assert('colors 读出来是冻结的', Object.isFrozen(colors), true);
  assert('colors 读两次是同一个', g.colors === colors, true);
  assert('设了渐变之后 color 是 null', g.color, null);
  g.color = null;
  assert('渐变时 color 写 null，渐变不受影响', json(g.colors), '["#ff0000","rgb(0, 0, 255)"]');
  assert('colors 里有一个写错：一条警告',
         warnings(() => { g.colors = ['#000000', 'nope']; }),
         '[Nacre] colors: "nope" is not a valid color, ignored');
  assert('colors 里有一个写错，整次不生效', json(g.colors), '["#ff0000","rgb(0, 0, 255)"]');
  bad = '#000000';
  assert('colors 给的不是数组抛 TypeError', thrown(() => { g.colors = bad; }), 'TypeError');
  assert('colors 只有一个颜色抛 RangeError', thrown(() => { g.colors = ['#000']; }), 'RangeError');
  assert('colors 是空数组抛 RangeError', thrown(() => { g.colors = []; }), 'RangeError');
  assert('colors 写错之后不变', json(g.colors), '["#ff0000","rgb(0, 0, 255)"]');

  // 带位置的渐变（原来的 setColors(colors, offsets)）：每一项是 { color, offset }，offset 是 0–1
  g.colors = [{ color: '#ff0000', offset: 0 }, { color: '#00ff00', offset: 0.2 }, { color: '#0000ff', offset: 1 }];
  assert('colors 写带位置的三项', json(g.colors),
         '[{"color":"#ff0000","offset":0},{"color":"#00ff00","offset":0.2},{"color":"#0000ff","offset":1}]');
  assert('带位置的每一项也是冻结的', Object.isFrozen(/** @type {any} */ (g.colors)[0]), true);
  bad = [{ color: '#000', offset: '0' }, { color: '#fff', offset: 1 }];
  g.colors = bad;
  assert("offset 照 Web IDL 转成数（'0'）", json(g.colors), '[{"color":"#000","offset":0},{"color":"#fff","offset":1}]');
  bad = [{ color: '#000', offset: 0 }, { color: '#fff', offset: 1.5 }];
  assert('offset 超出 0–1 抛 RangeError', thrown(() => { g.colors = bad; }), 'RangeError');
  bad = [{ color: '#000', offset: 0 }, { color: '#fff', offset: 'x' }];
  assert("offset 是 'x' 抛 TypeError", thrown(() => { g.colors = bad; }), 'TypeError');
  bad = [{ color: '#000', offset: 0 }, '#fff'];
  assert('有的带位置、有的不带抛 TypeError', thrown(() => { g.colors = bad; }), 'TypeError');
  bad = [{ offset: 0 }, { color: '#fff', offset: 1 }];
  assert('一项缺 color 抛 TypeError', thrown(() => { g.colors = bad; }), 'TypeError');
  bad = [{ color: 'nope', offset: 0 }, { color: '#fff', offset: 1 }];
  assert('带位置的颜色写错：一条警告',
         warnings(() => { g.colors = bad; }),
         '[Nacre] colors: "nope" is not a valid color, ignored');
  assert('带位置的写错之后不变', json(g.colors), '[{"color":"#000","offset":0},{"color":"#fff","offset":1}]');

  g.color = '#ffffff';
  assert('再设 color 之后 colors 是 null', g.colors, null);
  g.colors = ['#000', '#fff'];
  g.colors = null;
  assert('colors 写 null', g.colors, null);
  assert('colors 写 null 之后 color 也是 null（没有填充）', g.color, null);

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

  g.gradientCenterX = 0.25;
  g.gradientCenterY = 0.75;
  assert('gradientCenterX 写 0.25', g.gradientCenterX, 0.25);
  assert('gradientCenterY 写 0.75', g.gradientCenterY, 0.75);
  bad = 'x';
  assert("gradientCenterX 写 'x' 抛 TypeError", thrown(() => { g.gradientCenterX = bad; }), 'TypeError');
  g.gradientCenterX = 1.5;
  assert('渐变中心可以在自己外面（1.5）', g.gradientCenterX, 1.5);
  g.gradientCenterX = 0.25;

  g.gradientType = 'radialGradient';
  g.gradientRadius = 120;
  assert('gradientRadius 写 120（dp）', g.gradientRadius, 120);
  assert('gradientRadius 写负数抛 RangeError', thrown(() => { g.gradientRadius = -1; }), 'RangeError');
  g.gradientRadius = null;
  assert('gradientRadius 写 null 回到没设', g.gradientRadius, null);
  g.gradientRadius = 60;
  g.gradientType = 'linearGradient';

  g.cornerRadius = 16;
  assert('cornerRadius 写 16', g.cornerRadius, 16);
  assert('cornerRadius 写负数抛 RangeError', thrown(() => { g.cornerRadius = -1; }), 'RangeError');
  g.cornerRadii = [1, 2, 3, 4, 5, 6, 7, 8];
  const radii = g.cornerRadii;
  assert('cornerRadii 写 8 个数', json(radii), '[1,2,3,4,5,6,7,8]');
  assert('cornerRadii 读出来是冻结的', Object.isFrozen(radii), true);
  assert('写 cornerRadii 不改 cornerRadius', g.cornerRadius, 16);
  assert('cornerRadii 不是 8 个数抛 RangeError', thrown(() => { g.cornerRadii = [1, 2, 3]; }), 'RangeError');
  assert('cornerRadii 有一个不是数抛 TypeError',
         thrown(() => { g.cornerRadii = [1, 2, 3, 4, 5, 6, 7, /** @type {any} */ ('x')]; }), 'TypeError');
  assert('cornerRadii 有负数抛 RangeError',
         thrown(() => { g.cornerRadii = [1, 2, 3, 4, 5, 6, 7, -8]; }), 'RangeError');
  assert('cornerRadii 写错之后不变', json(g.cornerRadii), '[1,2,3,4,5,6,7,8]');
  g.cornerRadii = null;
  assert('cornerRadii 写 null', g.cornerRadii, null);
  assert('cornerRadii 写 null 之后 cornerRadius 还是原来的', g.cornerRadius, 16);
  g.cornerRadii = [1, 2, 3, 4, 5, 6, 7, 8];
  g.cornerRadius = 12;
  assert('写 cornerRadius 之后 cornerRadii 是 null（四个角一样）', g.cornerRadii, null);

  g.innerRadius = 10;
  assert('innerRadius 写 10', g.innerRadius, 10);
  assert('innerRadius 写负数抛 RangeError', thrown(() => { g.innerRadius = -1; }), 'RangeError');
  g.innerRadius = null;
  assert('innerRadius 写 null（按比例算）', g.innerRadius, null);
  g.innerRadiusRatio = 2.5;
  assert('innerRadiusRatio 写 2.5', g.innerRadiusRatio, 2.5);
  assert('innerRadiusRatio 写 0 抛 RangeError', thrown(() => { g.innerRadiusRatio = 0; }), 'RangeError');
  g.thickness = 6;
  assert('thickness 写 6', g.thickness, 6);
  g.thickness = null;
  assert('thickness 写 null', g.thickness, null);
  g.thicknessRatio = 4;
  assert('thicknessRatio 写 4', g.thicknessRatio, 4);
  assert('thicknessRatio 写负数抛 RangeError', thrown(() => { g.thicknessRatio = -2; }), 'RangeError');
  g.useLevel = true;
  assert('useLevel 写 true', g.useLevel, true);
  g.useLevel = false;

  g.intrinsicWidth = 120;
  g.intrinsicHeight = 48.5;
  assert('intrinsicWidth 写 120（dp）', g.intrinsicWidth, 120);
  assert('intrinsicHeight 写 48.5', g.intrinsicHeight, 48.5);
  assert('intrinsicWidth 写负数抛 RangeError', thrown(() => { g.intrinsicWidth = -1; }), 'RangeError');
  g.intrinsicHeight = null;
  assert('intrinsicHeight 写 null（没有固有尺寸）', g.intrinsicHeight, null);

  // 边框：原来的 setStroke 拆成四个属性
  g.strokeWidth = 1.5;
  g.strokeColor = '#3366cc';
  g.strokeDashWidth = 6;
  g.strokeDashGap = 4;
  assert('strokeWidth 写 1.5', g.strokeWidth, 1.5);
  assert('strokeColor 写 #3366cc', g.strokeColor, '#3366cc');
  assert('strokeDashWidth 写 6', g.strokeDashWidth, 6);
  assert('strokeDashGap 写 4', g.strokeDashGap, 4);
  assert('strokeWidth 写负数抛 RangeError', thrown(() => { g.strokeWidth = -1; }), 'RangeError');
  assert('strokeDashGap 写负数抛 RangeError', thrown(() => { g.strokeDashGap = -1; }), 'RangeError');
  assert('strokeColor 写错：一条警告',
         warnings(() => { g.strokeColor = 'black'; }),
         '[Nacre] strokeColor: "black" is not a valid color, ignored');
  assert('strokeColor 写错之后不变', g.strokeColor, '#3366cc');

  // ===== RippleDrawable =====
  console.log('  --- 外观：RippleDrawable ---');
  const content = new GradientDrawable();
  content.color = '#e8e8ff';
  content.cornerRadius = 24;
  const ripple = new RippleDrawable('#00000040');
  assert('RippleDrawable 是 Drawable', ripple instanceof Drawable, true);
  assert('color 是构造时给的', ripple.color, '#00000040');
  assert('content 默认 null', ripple.content, null);
  assert('mask 默认 null', ripple.mask, null);
  assert('radius 默认 null（按视图的大小）', ripple.radius, null);
  ripple.content = content;
  assert('content 写一个 Drawable', ripple.content === content, true);
  const mask = new ColorDrawable('#ffffff');
  ripple.mask = mask;
  assert('mask 写一个 Drawable', ripple.mask === mask, true);
  ripple.mask = null;
  assert('mask 写 null', ripple.mask, null);
  bad = {};
  assert('content 给普通对象抛 TypeError', thrown(() => { ripple.content = bad; }), 'TypeError');
  assert('content 写错之后不变', ripple.content === content, true);
  assert('content 是它自己：HierarchyRequestError', thrown(() => { ripple.content = ripple; }), 'HierarchyRequestError');
  const outer = new RippleDrawable('#000');
  outer.content = ripple;
  assert('绕一圈成环：HierarchyRequestError', thrown(() => { ripple.mask = outer; }), 'HierarchyRequestError');
  assert('成环被拒之后不变', ripple.mask, null);

  ripple.radius = 40;
  assert('radius 写 40（dp）', ripple.radius, 40);
  ripple.radius = null;
  assert('radius 写 null', ripple.radius, null);
  assert('radius 写负数抛 RangeError', thrown(() => { ripple.radius = -1; }), 'RangeError');
  bad = 'auto';
  assert("radius 写 'auto' 抛 TypeError（没有值用 null）", thrown(() => { ripple.radius = bad; }), 'TypeError');
  ripple.color = '#ff000040';
  assert('color 写 #ff000040', ripple.color, '#ff000040');
  assert('color 写错：一条警告', warnings(() => { ripple.color = 'nope'; }),
         '[Nacre] color: "nope" is not a valid color, ignored');
  assert('setColor 没有了（改成 color 属性）', 'setColor' in ripple, false);
  assert('new RippleDrawable 不给颜色抛 TypeError', thrown(() => new /** @type {any} */ (RippleDrawable)()), 'TypeError');
  assert('new RippleDrawable 颜色写错抛 TypeError', thrown(() => new RippleDrawable('nope')), 'TypeError');
  bad = new RippleDrawable('#000', /** @type {any} */ (content));
  assert('构造只收颜色，多给的内容不管', bad.content, null);

  // ===== RenderEffect =====
  console.log('  --- 外观：RenderEffect ---');
  // 这台手机是 Android 12 以上，有 RenderEffect；Android 11 上没有这个类，View 上也没有
  // renderEffect（那一支没有设备，没验过）
  assert('RenderEffect 在全局', typeof RenderEffect, 'function');
  assert('View 上有 renderEffect', 'renderEffect' in view, true);
  assert('setRenderEffect 没有了（改成 renderEffect 属性）', 'setRenderEffect' in view, false);
  assert('RenderEffect 不能 new', thrown(() => new /** @type {any} */ (RenderEffect)()), 'TypeError');
  const blur = RenderEffect.createBlurEffect({ radiusX: 8, radiusY: 4.5 });
  assert('createBlurEffect({ radiusX, radiusY })', blur instanceof RenderEffect, true);
  for (const edge of /** @type {const} */ (['clamp', 'repeat', 'mirror', 'decal'])) {
    assert('createBlurEffect 边缘 ' + edge,
           RenderEffect.createBlurEffect({ radiusX: 4, radiusY: 2, edgeTreatment: edge }) instanceof RenderEffect, true);
  }
  assert('createBlurEffect 边缘写错抛 TypeError',
         thrown(() => RenderEffect.createBlurEffect({ radiusX: 4, radiusY: 4, edgeTreatment: /** @type {any} */ ('blurry') })),
         'TypeError');
  assert("createBlurEffect 半径写 'x' 抛 TypeError",
         thrown(() => RenderEffect.createBlurEffect({ radiusX: /** @type {any} */ ('x'), radiusY: 4 })), 'TypeError');
  assert('createBlurEffect 缺 radiusY 抛 TypeError',
         thrown(() => RenderEffect.createBlurEffect(/** @type {any} */ ({ radiusX: 4 }))), 'TypeError');
  assert('createBlurEffect 半径是负数抛 RangeError',
         thrown(() => RenderEffect.createBlurEffect({ radiusX: -1, radiusY: 4 })), 'RangeError');
  assert('createBlurEffect 照 Java 按位置传抛 TypeError',
         thrown(() => /** @type {any} */ (RenderEffect).createBlurEffect(4, 4)), 'TypeError');
  assert('createBlurEffect 不给参数抛 TypeError',
         thrown(() => /** @type {any} */ (RenderEffect).createBlurEffect()), 'TypeError');
  assert('renderEffect 默认 null', view.renderEffect, null);
  view.renderEffect = blur;
  assert('renderEffect 读回写进去的那个', view.renderEffect === blur, true);
  bad = {};
  assert('renderEffect 给普通对象抛 TypeError', thrown(() => { view.renderEffect = bad; }), 'TypeError');
  view.renderEffect = null;
  assert('renderEffect 写 null', view.renderEffect, null);

  // ===== 挂到屏幕上 =====
  console.log('  --- 外观：挂到屏幕上 ---');
  const screen = new LinearLayout();
  screen.orientation = 'vertical';
  screen.paddingStart = 24;
  screen.paddingTop = 120;
  screen.paddingEnd = 24;

  // 卡片：每个外观的状态都写过
  const cardView = new TextView();
  cardView.text = '圆角、边框和阴影';
  const cardBg = new GradientDrawable();
  cardBg.color = '#ffffff';
  cardBg.cornerRadius = 12;
  cardBg.strokeWidth = 1.5;
  cardBg.strokeColor = '#3366cc';
  cardBg.strokeDashWidth = 6;
  cardBg.strokeDashGap = 3;
  cardBg.intrinsicWidth = 200;
  cardBg.intrinsicHeight = 40;
  cardBg.alpha = 0.9;
  cardView.background = cardBg;
  cardView.foreground = new ColorDrawable('#3366cc10');
  cardView.paddingStart = 16;
  cardView.paddingTop = 16;
  cardView.paddingEnd = 16;
  cardView.paddingBottom = 16;
  cardView.elevation = 8;
  cardView.translationZ = 1;
  cardView.clipToOutline = true;
  cardView.outlineProvider = 'background';
  cardView.outlineSpotShadowColor = '#3366cc';
  cardView.outlineAmbientShadowColor = 'rgba(0, 0, 0, 0.3)';

  // 按钮：水波，内容是一个渐变，遮罩是圆角矩形
  const button = new TextView();
  button.text = '点我看水波';
  const buttonBg = new GradientDrawable();
  buttonBg.colors = [{ color: '#e0e8ff', offset: 0 }, { color: '#ffe0f0', offset: 1 }];
  buttonBg.orientation = 'leftRight';
  buttonBg.cornerRadius = 8;
  const buttonMask = new GradientDrawable();
  buttonMask.color = '#000000';
  buttonMask.cornerRadii = [8, 8, 8, 8, 8, 8, 8, 8];
  const buttonRipple = new RippleDrawable('#3366cc60');
  buttonRipple.content = buttonBg;
  buttonRipple.mask = buttonMask;
  buttonRipple.radius = 80;
  button.background = buttonRipple;
  button.paddingStart = 16;
  button.paddingTop = 16;
  button.paddingEnd = 16;
  button.paddingBottom = 16;

  // 变换、模糊
  const blurred = new TextView();
  blurred.text = '模糊的字';
  blurred.renderEffect = RenderEffect.createBlurEffect({ radiusX: 2, radiusY: 2, edgeTreatment: 'decal' });
  blurred.rotation = -4;
  blurred.rotationX = 10;
  blurred.rotationY = 5;
  blurred.scaleX = 1.2;
  blurred.scaleY = 0.9;
  blurred.translationX = 8;
  blurred.translationY = 4;
  blurred.pivot = { x: 0, y: 0 };
  blurred.cameraDistance = 2000;
  blurred.alpha = 0.8;
  const ring = new GradientDrawable();
  ring.shape = 'ring';
  ring.innerRadius = 4;
  ring.thickness = 2;
  ring.innerRadiusRatio = 2;
  ring.thicknessRatio = 5;
  ring.colors = ['#ff0000', '#0000ff'];
  ring.gradientType = 'sweepGradient';
  ring.gradientCenterX = 0.4;
  ring.gradientCenterY = 0.6;
  blurred.background = ring;

  // 同一个 Drawable 用在两个视图上（每处一个原生对象）
  const shared = new GradientDrawable();
  shared.color = '#ffeecc';
  shared.cornerRadius = 4;
  const sharedA = new TextView();
  sharedA.text = '共用的背景 A';
  sharedA.background = shared;
  const sharedB = new TextView();
  sharedB.text = '共用的背景 B';
  sharedB.background = shared;
  const hidden = new View();
  hidden.visibility = 'gone';
  hidden.background = shared;

  for (const v of [cardView, button, blurred, sharedA, sharedB, hidden]) screen.addView(v);
  assert('挂上：每个外观的状态都写过，没有警告、没有抛',
         problems(() => { activity.contentView = screen; }), '');
  assert('挂上之后读回的还是写进去的', button.background === buttonRipple && cardBg.alpha === 0.9, true);

  // 挂着时改：视图的每个状态
  assert('挂着时改视图的状态，没有警告、没有抛', problems(() => {
    cardView.alpha = 0.95;
    cardView.visibility = 'visible';
    cardView.elevation = 10;
    cardView.translationZ = 2;
    cardView.translationX = 1;
    cardView.translationY = 1;
    cardView.scaleX = 1.01;
    cardView.scaleY = 1.01;
    cardView.rotation = 0.5;
    cardView.rotationX = 1;
    cardView.rotationY = 1;
    cardView.pivot = { x: 10, y: 10 };
    cardView.pivot = null;
    cardView.cameraDistance = 1500;
    cardView.outlineProvider = 'bounds';
    cardView.outlineProvider = 'paddedBounds';
    cardView.outlineProvider = 'none';
    cardView.outlineProvider = 'background';
    cardView.clipToOutline = false;
    cardView.outlineAmbientShadowColor = '#000000';
    cardView.outlineSpotShadowColor = '#336699';
    cardView.foreground = null;
    cardView.renderEffect = RenderEffect.createBlurEffect({ radiusX: 0.5, radiusY: 0.5 });
    cardView.renderEffect = null;
  }), '');

  // 挂着时改 Drawable：同步到每一处的原生对象
  assert('挂着时改 Drawable 的状态，没有警告、没有抛', problems(() => {
    cardBg.shape = 'rectangle';
    cardBg.color = '#fafafa';
    cardBg.colors = ['#ffffff', '#eeeeff'];
    cardBg.colors = [{ color: '#ffffff', offset: 0 }, { color: '#eeeeff', offset: 0.8 }];
    cardBg.color = '#ffffff';
    cardBg.color = null;
    cardBg.color = '#ffffff';
    cardBg.gradientType = 'linearGradient';
    cardBg.orientation = 'tlBr';
    cardBg.gradientCenterX = 0.5;
    cardBg.gradientCenterY = 0.5;
    cardBg.gradientRadius = 30;
    cardBg.gradientRadius = null;
    cardBg.cornerRadii = [12, 12, 12, 12, 0, 0, 0, 0];
    cardBg.cornerRadii = null;
    cardBg.cornerRadius = 14;
    cardBg.innerRadius = 3;
    cardBg.innerRadius = null;
    cardBg.innerRadiusRatio = 3;
    cardBg.thickness = 3;
    cardBg.thickness = null;
    cardBg.thicknessRatio = 9;
    cardBg.useLevel = true;
    cardBg.useLevel = false;
    cardBg.intrinsicWidth = null;
    cardBg.intrinsicHeight = null;
    cardBg.strokeWidth = 2;
    cardBg.strokeColor = '#224488';
    cardBg.strokeDashWidth = 0;
    cardBg.strokeDashGap = 0;
    cardBg.alpha = 1;
    shared.color = '#eeffcc';
    shared.cornerRadius = 6;
    buttonBg.cornerRadius = 10;
    buttonMask.cornerRadius = 10;
    buttonRipple.color = '#3366cc80';
    buttonRipple.radius = null;
    buttonRipple.alpha = 0.95;
    swatch.color = '#00ff00';
  }), '');

  // 水波换内容、换遮罩：原生的水波整个重建，装回视图上
  assert('挂着时换水波的内容和遮罩，没有警告、没有抛', problems(() => {
    const plain = new ColorDrawable('#f0f0ff');
    buttonRipple.content = plain;
    buttonRipple.mask = null;
    buttonRipple.content = buttonBg;
    buttonRipple.mask = buttonMask;
  }), '');
  assert('挂着时换背景、两个视图换成同一个、再换回来，没有警告、没有抛', problems(() => {
    sharedB.background = cardBg;
    sharedB.background = null;
    sharedB.background = shared;
  }), '');

  // 拿下来、改、放回去
  assert('拿下来、改了再放回去，没有警告、没有抛', problems(() => {
    screen.removeView(sharedA);
    shared.color = '#ccffee';
    sharedA.background = new ColorDrawable('#ffffee');
    sharedA.background = shared;
    screen.addView(sharedA, { index: 3 });
    activity.contentView = null;
    cardBg.cornerRadius = 16;
    activity.contentView = screen;
  }), '');

  // 密度变了：用到 dp 的 Drawable 按新密度重建。等页面的窗口边衬变一次（状态栏的像素高度
  // 跟着密度变），说明配置变化已经来过了
  /** @type {string[]} */
  const densityWarnings = [];
  const originalWarn = console.warn;
  console.warn = (/** @type {unknown} */ first) => { densityWarnings.push(String(first)); };
  try {
    for (const dpi of ['560', 'restore']) {
      /** @type {Promise<boolean>} */
      const changed = new Promise((resolve) => {
        const timer = setTimeout(() => resolve(false), 8000);
        activity.addEventListener('windowinsetschange', () => { clearTimeout(timer); resolve(true); }, { once: true });
      });
      console.log('[acceptance] density ' + dpi);
      assert('密度 ' + dpi + '：等到了配置变化', await changed, true);
      await sleep(1000);
    }
  } finally {
    console.warn = originalWarn;
  }
  assert('密度变了两次，按新密度重建 Drawable 时没有警告', densityWarnings.join(' | '), '');

  /** @type {Promise<boolean>} */
  const clicked = new Promise((resolve) => {
    const timer = setTimeout(() => resolve(false), 10000);
    button.addEventListener('click', () => { clearTimeout(timer); resolve(true); }, { once: true });
  });
  await sleep(300);
  console.log('[acceptance] tap 点我看水波');
  assert('带 RippleDrawable 背景的视图点得到', await clicked, true);
  await sleep(500);
  assert('背景还是挂上去的那个 RippleDrawable', button.background === buttonRipple, true);
  activity.contentView = null;
}
