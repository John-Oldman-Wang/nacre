import { customEventWorks } from '../support.js';
// 同步回调（M1b）：系统问、JS 当场答。
//
// 两个使用者，各占一种进入的时机：
//   - UIView 的动画：JS 调原生，原生当场回头调 JS 给的那段代码（嵌套）
//   - 输入框的 should… 事件：系统来问「要不要」，监听器里 preventDefault() 就是「不要」
//
// 这一步要用焦点（同一时刻只有一个 first responder），所以把「全部做完」作为
// Promise 返回，排在后面的步骤等它（见 main.js）。

const sleep = (/** @type {number} */ ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** 抛了就返回错误，没抛返回 null @param {() => unknown} fn */
function caught(fn) {
  try { fn(); return null; } catch (err) { return /** @type {Error} */ (err); }
}

/** @param {import("../main.js").StepContext} ctx */
export function stepSyncCallbacks(ctx) {
  const { assert, win } = ctx;
  const host = ctx.section('同步回调：UIView 动画、输入框的 should… 事件', 96);
  console.log('  --- 同步回调：UIView 动画 ---');

  // 动画要视图在窗口里才真的建得出来，所以这几个小方块直接挂在窗口上，验完摘掉
  const makeBox = () => {
    const box = new UIView();
    box.frame = new CGRect(-200, -200, 40, 40);   // 屏幕外，不挡别的区块
    box.backgroundColor = 'systemBlue';
    win.addSubview(box);
    return box;
  };

  // ===== 1. animations 当场执行 =====
  const box = makeBox();
  let ran = 0;
  let alphaInside = -1;
  const moved = UIView.animateWithDuration(0.2, {
    animations() {
      ran++;
      box.alpha = 0.25;
      alphaInside = box.alpha;
    },
  });
  assert('animations 当场执行：调用返回之前已经跑过一次', ran, 1);
  assert('animations 里能调别的原生接口，写进去当场读得回来', alphaInside, 0.25);
  assert('调用返回之后读到的也是写进去的值（不是动画的中间值）', box.alpha, 0.25);
  assert('返回的是 Promise', moved instanceof Promise, true);
  assert('图层上因此多了一个透明度的动画', box.layer.animationKeys().includes('opacity'), true);

  // ===== 2. 不带动画执行 =====
  const still = makeBox();
  let ranStill = 0;
  UIView.animateWithDuration(0.2, {
    animations() {
      UIView.performWithoutAnimation(() => { ranStill++; still.alpha = 0.5; });
    },
  });
  assert('performWithoutAnimation 的那段代码也是当场执行', ranStill, 1);
  assert('它里面的改动生效了', still.alpha, 0.5);
  assert('但没有建动画', still.layer.animationKeys().length, 0);
  let ranBare = 0;
  UIView.performWithoutAnimation(() => { ranBare++; });
  assert('performWithoutAnimation 单独用', ranBare, 1);

  // ===== 3. 嵌套：动画里再开动画 =====
  const outer = makeBox();
  const inner = makeBox();
  /** @type {string[]} */
  const order = [];
  UIView.animateWithDuration(0.2, {
    animations() {
      order.push('外层开始');
      outer.alpha = 0.75;   // 用单精度能精确表示的数：alpha 在系统里是 float
      UIView.animateWithDuration(0.1, {
        animations() { order.push('内层'); inner.alpha = 0.125; },
      });
      order.push('外层结束');
    },
  });
  order.push('调用返回');
  assert('嵌套的顺序', order.join(' → '), '外层开始 → 内层 → 外层结束 → 调用返回');
  assert('嵌套：两层的改动都生效', outer.alpha + ',' + inner.alpha, '0.75,0.125');

  // ===== 4. animations 里抛异常 =====
  const boom = new Error('动画里故意抛的');
  const thrown = caught(() => UIView.animateWithDuration(0.1, { animations() { throw boom; } }));
  assert('animations 里抛的异常原样传给调用方', thrown === boom, true);
  let after = 0;
  UIView.animateWithDuration(0.1, { animations() { after++; } });
  assert('抛过之后照常能用', after, 1);
  const boomBare = new Error('不带动画的那段里故意抛的');
  assert('performWithoutAnimation 里抛的也原样传出来',
         caught(() => UIView.performWithoutAnimation(() => { throw boomBare; })) === boomBare, true);

  // ===== 5. 参数 =====
  /** @param {string} label @param {() => unknown} fn @param {string} name @param {string[]} words */
  const rejects = (label, fn, name, words) => {
    const err = caught(fn);
    const ok = err !== null && err.name === name && words.every((w) => String(err.message).includes(w));
    assert(label, ok ? name : (err === null ? '没抛' : err.name + ': ' + err.message), name);
  };
  rejects('没给 animations', () =>
    // @ts-expect-error animations 是必填的
    UIView.animateWithDuration(0.2, {}), 'TypeError', ['animations']);
  rejects('animations 不是函数', () =>
    // @ts-expect-error animations 要的是函数
    UIView.animateWithDuration(0.2, { animations: 5 }), 'TypeError', ['animations']);
  rejects('没给 options 对象', () =>
    // @ts-expect-error 第二个参数是必填的
    UIView.animateWithDuration(0.2), 'TypeError', ['animations']);
  rejects('时长不是数', () => UIView.animateWithDuration(NaN, { animations() {} }),
          'TypeError', ['duration']);
  rejects('时长是负数', () => UIView.animateWithDuration(-1, { animations() {} }),
          'TypeError', ['duration']);
  rejects('不认识的选项，报错里列出可选的', () => UIView.animateWithDuration(0.2, {
    // @ts-expect-error 没有这个选项
    options: ['bouncy'],
    animations() {},
  }), 'TypeError', ['options', 'bouncy', 'curveEaseInOut']);
  rejects('options 不是数组', () => UIView.animateWithDuration(0.2, {
    // @ts-expect-error options 要的是数组
    options: 'curveLinear',
    animations() {},
  }), 'TypeError', ['options']);
  rejects('performWithoutAnimation 给的不是函数', () =>
    // @ts-expect-error 要的是函数
    UIView.performWithoutAnimation(null), 'TypeError', ['performWithoutAnimation']);
  let ranOptions = 0;
  UIView.animateWithDuration(0.1, {
    delay: 0.05,
    options: ['curveEaseOut', 'allowUserInteraction', 'beginFromCurrentState'],
    animations() { ranOptions++; },
  });
  assert('带 delay 和 options：animations 照样当场执行', ranOptions, 1);
  let ranSpring = 0;
  const springBox = makeBox();
  const sprung = UIView.animateWithDuration(0.3, {
    usingSpringWithDamping: 0.6,
    initialSpringVelocity: 0,
    animations() { ranSpring++; springBox.alpha = 0.5; },
  });
  assert('弹簧动画：animations 当场执行', ranSpring, 1);
  rejects('弹簧的两个参数要一起给', () => UIView.animateWithDuration(0.3, {
    usingSpringWithDamping: 0.6,
    animations() {},
  }), 'TypeError', ['initialSpringVelocity']);

  // ===== 6. 结束时兑现 =====
  const cut = makeBox();
  const interrupted = UIView.animateWithDuration(5, { animations() { cut.alpha = 0.125; } });
  cut.layer.removeAllAnimations();   // 当场打断：这一个应该以 finished = false 结束
  const instant = UIView.animateWithDuration(0, { animations() {} });

  /** 等一个 Promise，到点没等到就报未验证 @template T @param {string} what @param {Promise<T>} p @param {(v: T) => void} then */
  const settled = async (what, p, then) => {
    /** @type {{ value: T } | null} */
    let got = null;
    p.then((value) => { got = { value }; });
    for (let waited = 0; got === null && waited < 6000; waited += 50) await sleep(50);
    const result = /** @type {{ value: T } | null} */ (got);
    if (result === null) console.log('  ! 6 秒内没等到「' + what + '」，这一条未验证');
    else then(result.value);
  };
  const animationChecks = (async () => {
    await settled('0.2 秒的动画结束', moved, (finished) =>
      assert('动画跑完时兑现，值是 true', finished, true));
    await settled('被打断的动画结束', interrupted, (finished) =>
      assert('被打断的动画兑现，值是 false', finished, false));
    await settled('时长为 0 的动画结束', instant, (finished) =>
      assert('时长为 0：照样兑现', finished, true));
    await settled('弹簧动画结束', sprung, (finished) =>
      assert('弹簧动画跑完时兑现', finished, true));
    for (const view of [box, still, outer, inner, springBox, cut]) view.removeFromSuperview();
    console.log('  --- 同步回调：UIView 动画跑完 ---');
  })();

  // ===== 7. 输入框的 should… 事件 =====
  console.log('  --- 同步回调：输入框的 should… 事件 ---');
  const field = new UITextField();
  field.frame = new CGRect(-300, -300, 200, 36);   // 屏幕外；要在窗口里才能拿焦点
  win.addSubview(field);

  // 五个名字都订得上、退得掉；不认识的名字照旧被拒
  const noop = () => {};
  for (const name of /** @type {const} */ (['beforefocus', 'beforeblur', 'beforeinput',
                                            'beforeclear', 'beforereturn'])) {
    field.addEventListener(name, noop);
    field.removeEventListener(name, noop);
  }
  console.log('  ✓ 五个 should… 事件都订得上、退得掉');
  assert('不认识的事件名当自定义事件', customEventWorks(field, 'not-a-real-event'), '收到一次');
  // 用按钮来验：这几个事件只在输入框上有，别的控件上它们只是自定义事件。（普通视图不拒——
  // 它上面不认识的名字只是 JS 这边的自定义事件，不过桥）
  assert('别的控件上没有输入框的拦截事件，当自定义事件', customEventWorks(UIButton.buttonWithType('system'), 'beforeinput'), '收到一次');

  let asked = 0;
  let allowBegin = false;
  let sawCancelable = false;
  let sawTarget = false;
  let sawType = '';
  /** @type {string[]} */
  const sequence = [];
  const onShouldBegin = (/** @type {Event} */ e) => {
    asked++;
    sequence.push('beforefocus');
    sawCancelable = e.cancelable;
    sawTarget = e.target === field;
    sawType = e.type;
    if (!allowBegin) e.preventDefault();
  };
  field.addEventListener('beforefocus', onShouldBegin);
  field.addEventListener('focus', () => { sequence.push('focus'); });

  // 留给真实键盘的那一个：只让输入数字。用代码插入文字时系统不问委托（实测），
  // 所以 beforeinput / beforereturn / beforeclear 自动验收走不到
  const digits = new UITextField();
  digits.frame = new CGRect(16, 8, 260, 36);
  digits.borderStyle = 'roundedRect';
  digits.placeholder = '只能输入数字（验 beforeinput）';
  digits.clearButtonMode = 'always';
  host.addSubview(digits);
  digits.addEventListener('beforeinput', (e) => {
    const ok = /^[0-9]*$/.test(e.replacementString);
    console.log('  ✓ 真实键盘：beforeinput 范围 (' + e.range.location + ', ' + e.range.length +
                ') 换成「' + e.replacementString + '」，range 是 NSRange = ' + (e.range instanceof NSRange) +
                (ok ? '，放行' : '，拦掉'));
    if (!ok) e.preventDefault();
  });
  digits.addEventListener('beforereturn', () => {
    console.log('  ✓ 真实键盘：beforereturn，收起键盘');
    digits.resignFirstResponder();
  });
  digits.addEventListener('beforeclear', (e) => {
    console.log('  ✓ 真实触摸：beforeclear，这次不让清');
    e.preventDefault();
  });
  const hint = new UILabel();
  hint.frame = new CGRect(16, 52, 340, 36);
  hint.numberOfLines = 2;
  hint.font = UIFont.systemFontOfSize(12);
  hint.textColor = 'secondaryLabel';
  hint.text = '点上面的框打字：字母会被拦掉，数字能进去；点清除按钮清不掉；回车收键盘';
  host.addSubview(hint);

  const focusChecks = (async () => {
    await animationChecks;
    await sleep(300);   // 让上面那些动画的回调先走完

    // --- 系统来问「要不要开始」：监听器当场执行，取消就拿不到焦点 ---
    const refused = field.becomeFirstResponder();
    assert('系统当场来问：becomeFirstResponder 返回之前监听器已经跑过', asked, 1);
    assert('事件是可取消的', sawCancelable, true);
    assert('事件的 target 是这个输入框', sawTarget, true);
    assert('事件的 type', sawType, 'beforefocus');
    assert('监听器取消了：becomeFirstResponder 返回 false', refused, false);
    assert('没有进入编辑', field.isFirstResponder, false);

    // --- 放行 ---
    allowBegin = true;
    let granted = false;
    for (let waited = 0; !granted && waited < 6000; waited += 200) {
      granted = field.becomeFirstResponder();
      if (!granted) await sleep(200);
    }
    if (!granted) {
      console.log('  ! 6 秒内没拿到焦点（别的步骤占着，或者窗口不是 key），输入框的 should… 这一组未验证');
      field.removeFromSuperview();
      return;
    }
    assert('放行之后拿到了焦点', field.isFirstResponder, true);
    await sleep(300);
    assert('同步的 beforefocus 排在延后的 focus 前面',
           sequence[sequence.length - 2] + ' → ' + sequence[sequence.length - 1],
           'beforefocus → focus');

    // --- 系统来问「要不要结束」 ---
    let askedEnd = 0;
    let allowEnd = false;
    const onShouldEnd = (/** @type {Event} */ e) => { askedEnd++; if (!allowEnd) e.preventDefault(); };
    field.addEventListener('beforeblur', onShouldEnd);
    const stayed = field.resignFirstResponder();
    assert('系统当场来问：resignFirstResponder 返回之前监听器已经跑过', askedEnd, 1);
    assert('监听器取消了：resignFirstResponder 返回 false', stayed, false);
    assert('焦点还在', field.isFirstResponder, true);
    allowEnd = true;
    assert('放行之后交出了焦点', field.resignFirstResponder(), true);
    assert('不再是 first responder', field.isFirstResponder, false);

    // --- 监听器抛了：按「要」处理 ---
    // 和别的事件一个规矩：监听器抛的异常由派发的那一层接住，照未捕获的异常
    // 报（application 的 error 事件），同一事件的下一个监听器照常执行。抛异常
    // 不算 preventDefault()
    field.removeEventListener('beforefocus', onShouldBegin);
    let ranAfterThrow = 0;
    const onThrow = () => {
      throw new Error('这条是验收故意在 beforefocus 里抛的，它会从 error 事件报出来');
    };
    const onNext = () => { ranAfterThrow++; };
    field.addEventListener('beforefocus', onThrow);
    field.addEventListener('beforefocus', onNext);
    const despite = field.becomeFirstResponder();
    assert('监听器抛了：按放行处理，照样拿到焦点', despite, true);
    assert('同一事件的下一个监听器照常执行', ranAfterThrow, 1);
    field.removeEventListener('beforefocus', onThrow);
    field.removeEventListener('beforefocus', onNext);
    field.resignFirstResponder();

    // --- 一个监听器都不剩：不再来问，行为回到默认 ---
    field.removeEventListener('beforeblur', onShouldEnd);
    const before = asked;
    assert('监听器都摘掉之后照常能拿焦点', field.becomeFirstResponder(), true);
    assert('而且没有再来问', asked, before);
    field.resignFirstResponder();
    field.removeFromSuperview();
    console.log('  --- 同步回调：输入框的 should… 事件跑完 ---');
  })();

  return focusChecks.then(() => undefined, (err) => {
    console.log('  ✗ 同步回调这一步的异步部分抛了: ' + (err && err.message));
  });
}
