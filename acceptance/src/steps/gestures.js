import { customEventWorks, enumIgnored, ENUM_IGNORED } from '../support.js';
// 手势识别器的另外五种：拖动（UIPanGestureRecognizer）、捏合
// （UIPinchGestureRecognizer）、旋转（UIRotationGestureRecognizer）、轻扫
// （UISwipeGestureRecognizer）、屏幕边缘拖动（UIScreenEdgePanGestureRecognizer），
// 外加基类上的 requireGestureRecognizerToFail()。
//
// 点按和长按在 gesture.js。
//
// 默认值都是在 iPhone Air 模拟器（iOS 27.2）上用不带界面的探针量的，不是照
// 头文件的注释抄的。有三条和想当然的不一样：
//   - 拖动的 maximumNumberOfTouches 默认是 4294967295（UINT_MAX），不是
//     NSUIntegerMax，所以 JS 的数装得下，不用另外发明「不限」的写法
//   - 屏幕边缘拖动的 delaysTouchesBegan 默认是 true，maximumNumberOfTouches
//     默认是 1，和它的父类（拖动）都不一样
//   - 没有手势在进行时 setTranslation() 写不进去，读回来还是 (0, 0)
//
// 手势没有程序触发的办法（不像控件有 sendActionsForControlEvents），所以事件
// 和事件带的数据这里**验不到**：只能验订得上、退得掉，真实触摸要人来点。

/** @param {import("../main.js").StepContext} ctx */
export function stepGestures(ctx) {
  console.log('--- 手势识别器：拖动、捏合、旋转、轻扫、屏幕边缘拖动 ---');
  // 这一步排在 stepWebView 后面，后面还有别的步骤。中途抛了不能把它们带倒
  try {
    run(ctx);
  } catch (err) {
    console.log('  ✗ 这一步中途抛了，后面的断言没跑:',
                err instanceof Error ? err.message : String(err));
  }
}

/**
 * 期望 fn 抛 TypeError，并且报错里有 expected 这一段。
 *
 * @param {import("../main.js").StepContext["assert"]} assert
 * @param {string} label
 * @param {() => void} fn
 * @param {string} expected
 */
function throwsWith(assert, label, fn, expected) {
  let message = '没有抛';
  try {
    fn();
  } catch (err) {
    message = err instanceof TypeError ? err.message : '抛的不是 TypeError: ' + String(err);
  }
  assert(label, message.includes(expected) ? expected : message, expected);
}

/** @param {import("../main.js").StepContext} ctx */
function run(ctx) {
  const { assert } = ctx;

  // ===== 五个类都能建，继承关系对 =====
  const pan = new UIPanGestureRecognizer();
  const pinch = new UIPinchGestureRecognizer();
  const rotation = new UIRotationGestureRecognizer();
  const swipe = new UISwipeGestureRecognizer();
  const edge = new UIScreenEdgePanGestureRecognizer();
  assert('拖动是 UIGestureRecognizer', pan instanceof UIGestureRecognizer, true);
  assert('捏合是 UIGestureRecognizer', pinch instanceof UIGestureRecognizer, true);
  assert('旋转是 UIGestureRecognizer', rotation instanceof UIGestureRecognizer, true);
  assert('轻扫是 UIGestureRecognizer', swipe instanceof UIGestureRecognizer, true);
  assert('边缘拖动是 UIPanGestureRecognizer', edge instanceof UIPanGestureRecognizer, true);
  assert('拖动不是边缘拖动', pan instanceof UIScreenEdgePanGestureRecognizer, false);
  assert('捏合不是拖动', /** @type {object} */ (pinch) instanceof UIPanGestureRecognizer, false);

  // 基类的报错要把新的子类也点出来
  try {
    new UIGestureRecognizer();
    console.log('  ✗ 基类居然建出来了');
  } catch (err) {
    const message = err instanceof Error ? err.message : '';
    for (const name of ['UIPanGestureRecognizer', 'UIPinchGestureRecognizer',
                        'UIRotationGestureRecognizer', 'UISwipeGestureRecognizer',
                        'UIScreenEdgePanGestureRecognizer']) {
      assert('基类的报错里点了 ' + name, message.includes(name), true);
    }
  }

  // ===== 基类那几个属性在新的类上的默认值 =====
  /** @type {[string, UIGestureRecognizer, boolean][]} */
  const each = [
    ['拖动', pan, false], ['捏合', pinch, false], ['旋转', rotation, false],
    ['轻扫', swipe, false],
    // 只有它的 delaysTouchesBegan 默认是 true（实测）
    ['边缘拖动', edge, true],
  ];
  for (const [name, r, delaysBegan] of each) {
    assert(name + '：默认 state', r.state, 'possible');
    assert(name + '：没挂时 view 是 null', r.view, null);
    assert(name + '：默认 isEnabled', r.isEnabled, true);
    assert(name + '：默认 cancelsTouchesInView', r.cancelsTouchesInView, true);
    assert(name + '：默认 delaysTouchesBegan', r.delaysTouchesBegan, delaysBegan);
    assert(name + '：默认 delaysTouchesEnded', r.delaysTouchesEnded, true);
    assert(name + '：没有触摸时 numberOfTouches', r.numberOfTouches, 0);
  }

  // ===== 拖动 =====
  console.log('  --- UIPanGestureRecognizer ---');
  assert('拖动：默认最少 1 根手指', pan.minimumNumberOfTouches, 1);
  assert('拖动：默认最多 4294967295 根（UINT_MAX）', pan.maximumNumberOfTouches, 4294967295);
  assert('拖动：allowedScrollTypesMask 默认是空数组',
         Array.isArray(pan.allowedScrollTypesMask) && pan.allowedScrollTypesMask.length, 0);

  pan.minimumNumberOfTouches = 2;
  assert('minimumNumberOfTouches 可写', pan.minimumNumberOfTouches, 2);
  pan.maximumNumberOfTouches = 3;
  assert('maximumNumberOfTouches 可写', pan.maximumNumberOfTouches, 3);
  pan.maximumNumberOfTouches = 4294967295;
  assert('maximumNumberOfTouches 写回默认值', pan.maximumNumberOfTouches, 4294967295);
  pan.minimumNumberOfTouches = 1.9;
  assert('手指数给小数：向零取整', pan.minimumNumberOfTouches, 1);
  throwsWith(assert, '负的手指数被拒', () => { pan.minimumNumberOfTouches = -1; },
             'minimumNumberOfTouches must be a non-negative integer');
  throwsWith(assert, '转不出数的手指数被拒',
             // @ts-expect-error 转不出数
             () => { pan.maximumNumberOfTouches = 'many'; },
             'maximumNumberOfTouches must be a finite number');
  assert('被拒之后原值没动', pan.minimumNumberOfTouches + ',' + pan.maximumNumberOfTouches,
         '1,4294967295');

  pan.allowedScrollTypesMask = ['discrete', 'continuous'];
  assert('allowedScrollTypesMask 可写', pan.allowedScrollTypesMask.join(','),
         'discrete,continuous');
  pan.allowedScrollTypesMask = ['continuous'];
  assert('allowedScrollTypesMask 只留一个', pan.allowedScrollTypesMask.join(','), 'continuous');
  pan.allowedScrollTypesMask = [];
  assert('allowedScrollTypesMask 写回空数组', pan.allowedScrollTypesMask.length, 0);
  assert('allowedScrollTypesMask 不认识的名字：不抛、值不变', enumIgnored(() => {
    // @ts-expect-error 没有这个值
    pan.allowedScrollTypesMask = ['wheel'];
  }, () => pan.allowedScrollTypesMask), ENUM_IGNORED);
  throwsWith(assert, 'allowedScrollTypesMask 不是数组被拒',
             // @ts-expect-error 要的是数组
             () => { pan.allowedScrollTypesMask = 'discrete'; },
             'allowedScrollTypesMask needs an array of names');

  // 位移和速度。没有手势在进行，所以都是 0
  const canvas = new UIView();
  canvas.frame = new CGRect(0, 0, 200, 200);
  canvas.addGestureRecognizer(pan);
  const t0 = pan.translationInView(canvas);
  assert('translationInView 返回 CGPoint', t0 instanceof CGPoint, true);
  assert('没有手势时位移是 (0, 0)', t0.x + ',' + t0.y, '0,0');
  const tWindow = pan.translationInView(null);
  assert('translationInView(null)：窗口坐标系，也是 (0, 0)', tWindow.x + ',' + tWindow.y, '0,0');
  const v0 = pan.velocityInView(canvas);
  assert('velocityInView 返回 CGPoint', v0 instanceof CGPoint, true);
  assert('没有手势时速度是 (0, 0)', v0.x + ',' + v0.y, '0,0');
  // 实测：没有手势在进行时写不进去。这里只验「调了不抛、返回 undefined」
  assert('setTranslation 没有返回值',
         pan.setTranslation(new CGPoint(12, 34), { inView: canvas }), undefined);
  const t1 = pan.translationInView(canvas);
  assert('没有手势时 setTranslation 不生效，读回还是 (0, 0)', t1.x + ',' + t1.y, '0,0');
  pan.setTranslation({ x: 1, y: 2 }, { inView: null });
  console.log('  ✓ setTranslation 收普通对象，inView 可以是 null');

  throwsWith(assert, 'setTranslation 不带 inView 被拒',
             // @ts-expect-error 少了 options
             () => { pan.setTranslation(new CGPoint(0, 0)); },
             'setTranslation needs { inView }');
  throwsWith(assert, 'setTranslation 的点缺字段被拒',
             // @ts-expect-error 少了 y
             () => { pan.setTranslation({ x: 1 }, { inView: canvas }); },
             'setTranslation is missing y');
  throwsWith(assert, 'translationInView 给的不是视图被拒',
             // @ts-expect-error 要的是视图或 null
             () => { pan.translationInView(5); },
             'translationInView needs a UIView or null');
  throwsWith(assert, 'velocityInView 给的是别的原生对象被拒',
             // @ts-expect-error 要的是视图或 null
             () => { pan.velocityInView(pinch); },
             'velocityInView needs a UIView or null');
  throwsWith(assert, 'setTranslation 的 inView 不是视图被拒',
             // @ts-expect-error 要的是视图或 null
             () => { pan.setTranslation(new CGPoint(0, 0), { inView: 'canvas' }); },
             'setTranslation needs a UIView or null');
  canvas.removeGestureRecognizer(pan);

  // ===== 捏合 =====
  console.log('  --- UIPinchGestureRecognizer ---');
  assert('捏合：默认 scale', pinch.scale, 1);
  assert('捏合：没有手势时 velocity', pinch.velocity, 0);
  pinch.scale = 2.5;
  assert('scale 可写', pinch.scale, 2.5);
  // @ts-expect-error 类型定义要数字，运行时会转
  pinch.scale = '0.5';
  assert('scale 给数字字符串：按数用', pinch.scale, 0.5);
  throwsWith(assert, '转不出数的 scale 被拒',
             // @ts-expect-error 转不出数
             () => { pinch.scale = 'big'; },
             'scale must be a finite number');
  throwsWith(assert, 'scale 给 Infinity 被拒', () => { pinch.scale = Infinity; },
             'scale must be a finite number');
  assert('被拒之后 scale 没动', pinch.scale, 0.5);
  pinch.scale = 1;
  try {
    // @ts-expect-error velocity 只读
    pinch.velocity = 3;
    console.log('  ✗ 捏合的 velocity 居然能写');
  } catch (err) {
    console.log('  ✓ 捏合的 velocity 只读:', err instanceof TypeError);
  }

  // ===== 旋转 =====
  console.log('  --- UIRotationGestureRecognizer ---');
  assert('旋转：默认 rotation', rotation.rotation, 0);
  assert('旋转：没有手势时 velocity', rotation.velocity, 0);
  rotation.rotation = 1.25;
  assert('rotation 可写', rotation.rotation, 1.25);
  rotation.rotation = -7;
  assert('rotation 可以是负的，也不按一圈折回去', rotation.rotation, -7);
  throwsWith(assert, 'rotation 给 NaN 被拒', () => { rotation.rotation = NaN; },
             'rotation must be a finite number');
  assert('被拒之后 rotation 没动', rotation.rotation, -7);
  rotation.rotation = 0;
  try {
    // @ts-expect-error velocity 只读
    rotation.velocity = 3;
    console.log('  ✗ 旋转的 velocity 居然能写');
  } catch (err) {
    console.log('  ✓ 旋转的 velocity 只读:', err instanceof TypeError);
  }

  // ===== 轻扫 =====
  console.log('  --- UISwipeGestureRecognizer ---');
  assert('轻扫：默认 1 根手指', swipe.numberOfTouchesRequired, 1);
  assert('轻扫：默认方向是数组', Array.isArray(swipe.direction), true);
  assert('轻扫：默认往右', swipe.direction.join(','), 'right');
  swipe.direction = ['left'];
  assert('direction 可写', swipe.direction.join(','), 'left');
  swipe.direction = ['up', 'down'];
  assert('direction 可以给多个', swipe.direction.join(','), 'up,down');
  // 读出来的顺序是位的顺序（right、left、up、down），不是写进去的顺序
  swipe.direction = ['down', 'right'];
  assert('direction 读出来按固定顺序', swipe.direction.join(','), 'right,down');
  swipe.direction = ['right', 'left', 'up', 'down'];
  assert('direction 四个都给', swipe.direction.join(','), 'right,left,up,down');
  // 实测 UIKit 收下空的方向（数值 0），所以这里也不拦
  swipe.direction = [];
  assert('direction 给空数组：收下', swipe.direction.length, 0);
  swipe.direction = ['right'];
  // 数组里有一个不认识的名字：整次赋值不生效，不是只应用认识的那个
  assert('direction 不认识的名字：不抛、值不变', enumIgnored(() => {
    // @ts-expect-error 没有这个方向
    swipe.direction = ['right', 'diagonal'];
  }, () => swipe.direction), ENUM_IGNORED);
  throwsWith(assert, 'direction 不是数组被拒',
             // @ts-expect-error 要的是数组
             () => { swipe.direction = 'left'; },
             'direction needs an array of names');
  assert('被拒之后 direction 没动', swipe.direction.join(','), 'right');
  swipe.numberOfTouchesRequired = 2;
  assert('轻扫的 numberOfTouchesRequired 可写', swipe.numberOfTouchesRequired, 2);
  swipe.numberOfTouchesRequired = 1;
  throwsWith(assert, '轻扫：负的手指数被拒', () => { swipe.numberOfTouchesRequired = -1; },
             'numberOfTouchesRequired must be a non-negative integer');

  // ===== 屏幕边缘拖动 =====
  console.log('  --- UIScreenEdgePanGestureRecognizer ---');
  assert('边缘拖动：edges 默认是数组', Array.isArray(edge.edges), true);
  assert('边缘拖动：edges 默认是空的', edge.edges.length, 0);
  // 父类的默认值到了它这里不一样（实测）
  assert('边缘拖动：默认最少 1 根手指', edge.minimumNumberOfTouches, 1);
  assert('边缘拖动：默认最多 1 根手指', edge.maximumNumberOfTouches, 1);
  edge.edges = ['left'];
  assert('edges 可写', edge.edges.join(','), 'left');
  // 读出来的顺序是位的顺序：top、left、bottom、right
  edge.edges = ['right', 'top'];
  assert('edges 读出来按固定顺序', edge.edges.join(','), 'top,right');
  edge.edges = ['top', 'left', 'bottom', 'right'];
  assert('edges 四条边都给', edge.edges.join(','), 'top,left,bottom,right');
  edge.edges = [];
  assert('edges 写回空数组', edge.edges.length, 0);
  // ObjC 里有 UIRectEdgeAll，这里没有这个名字：四条边写全
  assert("edges 没有 'all' 这个名字：不抛、值不变", enumIgnored(() => {
    // @ts-expect-error 没有 all
    edge.edges = ['all'];
  }, () => edge.edges), ENUM_IGNORED);
  throwsWith(assert, 'edges 不是数组被拒',
             // @ts-expect-error 要的是数组
             () => { edge.edges = 'left'; },
             'edges needs an array of names');
  const te = edge.translationInView(null);
  assert('边缘拖动也有 translationInView', te.x + ',' + te.y, '0,0');
  assert('捏合上没有 translationInView', 'translationInView' in pinch, false);
  assert('拖动上没有 edges', 'edges' in pan, false);

  // ===== 手势之间的关系：等另一个失败 =====
  console.log('  --- requireGestureRecognizerToFail ---');
  const single = new UITapGestureRecognizer();
  const double = new UITapGestureRecognizer();
  double.numberOfTapsRequired = 2;
  assert('requireGestureRecognizerToFail 没有返回值',
         single.requireGestureRecognizerToFail(double), undefined);
  // 不同种类之间也可以：拖动等轻扫失败
  pan.requireGestureRecognizerToFail(swipe);
  console.log('  ✓ 不同种类的识别器之间也能建这个关系');
  throwsWith(assert, 'requireGestureRecognizerToFail 给的是视图被拒',
             // @ts-expect-error 要的是识别器
             () => { single.requireGestureRecognizerToFail(new UIView()); },
             'requireGestureRecognizerToFail needs a UIGestureRecognizer');
  throwsWith(assert, 'requireGestureRecognizerToFail 给 null 被拒',
             // @ts-expect-error 要的是识别器
             () => { single.requireGestureRecognizerToFail(null); },
             'requireGestureRecognizerToFail needs a UIGestureRecognizer');
  assert('建了关系，两边的 state 都没被碰', single.state + ',' + double.state,
         'possible,possible');

  // ===== 挂和摘：读回来还是原来的类 =====
  const holder = new UIView();
  for (const r of [pan, pinch, rotation, swipe, edge]) holder.addGestureRecognizer(r);
  const listed = holder.gestureRecognizers;
  assert('五个都挂上了', listed.length, 5);
  assert('挂上之后 view 指回来', pan.view === holder, true);
  assert('读出来是同一个包装', listed[0] === pan && listed[4] === edge, true);
  assert('读出来的类没丢', [
    listed[0] instanceof UIPanGestureRecognizer,
    listed[1] instanceof UIPinchGestureRecognizer,
    listed[2] instanceof UIRotationGestureRecognizer,
    listed[3] instanceof UISwipeGestureRecognizer,
    listed[4] instanceof UIScreenEdgePanGestureRecognizer,
  ].join(','), 'true,true,true,true,true');
  for (const r of [pan, pinch, rotation, swipe, edge]) holder.removeGestureRecognizer(r);
  assert('摘掉之后视图上没有了', holder.gestureRecognizers.length, 0);

  // ===== 系统自己的识别器按最近的公开父类包装 =====
  //
  // 实测滚动视图一建出来就带着七个识别器，其中拖动那个是
  // UIScrollViewPanGestureRecognizer（UIPanGestureRecognizer 的私有子类）。
  // 在接入拖动之前它读出来是 UIGestureRecognizer。
  //
  // 它的手指数上限是 UIKit 自己定的，会变，所以下面不验具体的数：
  //   不能缩放的滚动视图（这里建的就是）  1 和 4294967295，和自己建的拖动一样
  //   设了缩放范围的滚动视图              1 和 2（UIKit 把上限收成 2）
  // 探针和 App 里量到的一致。这条断言原来写的期望是 '1,2'，那是探针里先设了
  // 缩放范围再读的数，套到没设缩放的滚动视图上是错的。缩放范围现在从 JS
  // 设不了，所以第二种情况这里验不到。
  const scroller = new UIScrollView();
  const systemPans = scroller.gestureRecognizers.filter(
    (r) => r instanceof UIPanGestureRecognizer);
  assert('滚动视图自带一个拖动识别器，读出来是 UIPanGestureRecognizer',
         systemPans.length, 1);
  assert('它不是边缘拖动',
         systemPans.length === 1 && systemPans[0] instanceof UIScreenEdgePanGestureRecognizer,
         false);
  if (systemPans.length === 1) {
    const systemPan = /** @type {UIPanGestureRecognizer} */ (systemPans[0]);
    const least = systemPan.minimumNumberOfTouches;
    const most = systemPan.maximumNumberOfTouches;
    // 要验的是「系统的识别器上读得到拖动的属性」：读出来是整数、上限不小于下限
    assert('系统的拖动识别器上读得到拖动的属性',
           Number.isInteger(least) && Number.isInteger(most) && least >= 1 && most >= least,
           true);
    console.log('  ✓ 系统的拖动识别器：最少 ' + least + ' 根手指，最多 ' + most + ' 根');
    assert('它挂在那个滚动视图上', systemPan.view === scroller, true);
  }

  // ===== 订阅和退订 =====
  const noop = () => {};
  for (const [name, r] of each) {
    for (const type of /** @type {const} */ (['began', 'changed', 'ended', 'cancelled'])) {
      r.addEventListener(type, noop);
      r.removeEventListener(type, noop);
    }
    assert(name + '：四个事件名都能订、能退', r.state, 'possible');
  }
  assert('不认识的事件名当自定义事件', customEventWorks(swipe, 'not-a-real-event'), '收到一次');

  // ===== 屏幕上：三块板子，等真实触摸 =====
  //
  // 下面打的日志全靠人来点，自动跑的时候一条都不会出现：
  //   左（靛蓝）  拖里面的橙色方块 → 方块跟着手指走。began 记下起点，
  //               changed 里用事件带的 translation 算位置
  //   中（青色）  两根手指捏、转里面的方块 → 方块跟着放大缩小或旋转。
  //               同一个视图上的两个识别器默认不同时认（要同时认得靠委托，
  //               还不能做），所以一次触摸里多半只有先认出的那一个有日志
  //   右（灰色）  往左或往右轻扫 → 各打一行
  //   区块的右边缘往里拖 → 屏幕边缘拖动
  // 这个区块在一个纵向滚动的视图里。板子上的拖动和滚动视图自己的拖动谁生效，
  // 没有核对过。
  const host = ctx.section('手势：拖、捏、转、扫（左：拖方块；中：两指捏和转；右：左右扫）', 120);

  /** @param {number} x @param {string} color */
  const makePad = (x, color) => {
    const pad = new UIView();
    pad.frame = new CGRect(x, 0, 110, 120);
    pad.backgroundColor = color;
    pad.layer.cornerRadius = 10;
    host.addSubview(pad);
    return pad;
  };
  /** @param {UIView} pad */
  const makeChip = (pad) => {
    const chip = new UIView();
    chip.frame = new CGRect(35, 40, 40, 40);
    chip.backgroundColor = 'systemOrange';
    chip.layer.cornerRadius = 6;
    pad.addSubview(chip);
    return chip;
  };
  /** @param {CGPoint} p */
  const show = (p) => '(' + p.x.toFixed(1) + ', ' + p.y.toFixed(1) + ')';

  // ---- 左：拖 ----
  const dragPad = makePad(16, 'systemIndigo');
  const dragChip = makeChip(dragPad);
  const drag = new UIPanGestureRecognizer();
  let dragStart = dragChip.center;
  let dragChanges = 0;
  drag.addEventListener('began', (e) => {
    const { location, translation } = /** @type {UIPanGestureRecognizerEvent} */ (e);
    dragStart = dragChip.center;
    dragChanges = 0;
    console.log('  ✓ 真实触摸：拖动 began，location = ' + location +
                '，translation = ' + show(translation));
  });
  drag.addEventListener('changed', (e) => {
    const { translation } = /** @type {UIPanGestureRecognizerEvent} */ (e);
    dragChanges += 1;
    dragChip.center = new CGPoint(dragStart.x + translation.x, dragStart.y + translation.y);
  });
  drag.addEventListener('ended', (e) => {
    const { translation, velocity, numberOfTouches } =
      /** @type {UIPanGestureRecognizerEvent} */ (e);
    // 回调里再去识别器上读，对照事件带的值：手势已经结束，读到的多半是 0
    const late = drag.translationInView(dragPad);
    console.log('  ✓ 真实触摸：拖动 ended，translation = ' + show(translation) +
                '，velocity = ' + show(velocity) + ' pt/s，中间 changed ' + dragChanges +
                ' 次，numberOfTouches = ' + numberOfTouches +
                '；回调里读 translationInView = ' + show(late) +
                '，state = ' + drag.state);
  });
  drag.addEventListener('cancelled', () => {
    console.log('  ✓ 真实触摸：拖动 cancelled');
  });
  dragPad.addGestureRecognizer(drag);

  // ---- 中：捏和转 ----
  const zoomPad = makePad(134, 'systemTeal');
  const zoomChip = makeChip(zoomPad);
  let scaleNow = 1;
  let angleNow = 0;
  const apply = () => {
    zoomChip.transform =
      CGAffineTransform.scale(scaleNow).concat(CGAffineTransform.rotation(angleNow));
  };
  const zoom = new UIPinchGestureRecognizer();
  zoom.addEventListener('began', (e) => {
    const { scale } = /** @type {UIPinchGestureRecognizerEvent} */ (e);
    console.log('  ✓ 真实触摸：捏合 began，scale = ' + scale);
  });
  zoom.addEventListener('changed', (e) => {
    scaleNow = /** @type {UIPinchGestureRecognizerEvent} */ (e).scale;
    apply();
  });
  zoom.addEventListener('ended', (e) => {
    const { scale, velocity, numberOfTouches } =
      /** @type {UIPinchGestureRecognizerEvent} */ (e);
    console.log('  ✓ 真实触摸：捏合 ended，scale = ' + scale + '，velocity = ' + velocity +
                ' /s，numberOfTouches = ' + numberOfTouches +
                '；回调里读识别器的 scale = ' + zoom.scale);
  });
  zoomPad.addGestureRecognizer(zoom);

  const turn = new UIRotationGestureRecognizer();
  turn.addEventListener('began', (e) => {
    const { rotation: angle } = /** @type {UIRotationGestureRecognizerEvent} */ (e);
    console.log('  ✓ 真实触摸：旋转 began，rotation = ' + angle + ' 弧度');
  });
  turn.addEventListener('changed', (e) => {
    angleNow = /** @type {UIRotationGestureRecognizerEvent} */ (e).rotation;
    apply();
  });
  turn.addEventListener('ended', (e) => {
    const { rotation: angle, velocity } = /** @type {UIRotationGestureRecognizerEvent} */ (e);
    console.log('  ✓ 真实触摸：旋转 ended，rotation = ' + angle + ' 弧度，velocity = ' +
                velocity + ' 弧度/s；回调里读识别器的 rotation = ' + turn.rotation);
  });
  zoomPad.addGestureRecognizer(turn);

  // ---- 右：扫 ----
  // 一个识别器可以认多个方向，但认出来时不说是哪个。要分左右，一个方向建一个
  const swipePad = makePad(252, 'systemGray3');
  for (const way of /** @type {const} */ (['left', 'right'])) {
    const flick = new UISwipeGestureRecognizer();
    flick.direction = [way];
    flick.addEventListener('ended', (e) => {
      const { location, numberOfTouches } = /** @type {UIGestureRecognizerEvent} */ (e);
      console.log('  ✓ 真实触摸：轻扫 ended，方向 ' + way + '，location = ' + location +
                  '，numberOfTouches = ' + numberOfTouches);
    });
    swipePad.addGestureRecognizer(flick);
  }

  // ---- 区块的右边缘 ----
  // 左边缘留给导航控制器的左滑返回
  const fromRight = new UIScreenEdgePanGestureRecognizer();
  fromRight.edges = ['right'];
  fromRight.addEventListener('began', (e) => {
    const { location } = /** @type {UIPanGestureRecognizerEvent} */ (e);
    console.log('  ✓ 真实触摸：屏幕右边缘拖动 began，location = ' + location);
  });
  fromRight.addEventListener('ended', (e) => {
    const { translation } = /** @type {UIPanGestureRecognizerEvent} */ (e);
    console.log('  ✓ 真实触摸：屏幕右边缘拖动 ended，translation = ' + show(translation));
  });
  host.addGestureRecognizer(fromRight);

  assert('三块板子上一共挂了 5 个识别器',
         dragPad.gestureRecognizers.length + zoomPad.gestureRecognizers.length +
         swipePad.gestureRecognizers.length, 5);
  assert('区块上挂了边缘拖动', host.gestureRecognizers.length, 1);
  console.log('  ✓ 三块板子已上屏，等着被拖、捏、转、扫（这些要人来点）');
}
