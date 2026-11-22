// 键盘的三个事件：屏幕上的 keyboardshow、keyboardhide、keyboardchange。
//
// 它们是**当场派发**的：监听器在键盘的动画里执行，这时候改的布局会跟着键盘
// 一起动（真机实测：iPhone 14，键盘动画 0.383 秒）。所以用例重点验两件事：
//   - 当场：JS 调 endEditing() 让键盘收起时，监听器在这次调用返回之前就执行了
//   - 跟着动：监听器里挪一个视图，它的图层上挂上了动画
//
// 模拟器连着电脑键盘时软键盘不弹，只有收起那一组（时长 0）。弹出那一组和
// 「跟着动」要软键盘真的出来才验得到，没出来报未验证。

/** @param {import("../main.js").StepContext} ctx */
export async function stepKeyboard(ctx) {
  const { assert } = ctx;
  const vc = ctx.vc;
  console.log('--- 键盘的事件 ---');

  /** @param {number} ms */
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  /** @param {() => boolean} ready @param {number} ms */
  const until = async (ready, ms) => {
    for (let waited = 0; waited < ms && !ready(); waited += 50) await sleep(50);
    return ready();
  };

  const screen = ctx.scene.screen;
  const field = new UITextField();
  field.frame = new CGRect(16, 120, 200, 40);
  vc.view.addSubview(field);
  // 跟着键盘动的那个视图：每次键盘事件都把它挪到键盘顶上
  const follower = new UIView();
  follower.frame = new CGRect(0, 0, 10, 10);
  vc.view.addSubview(follower);

  // 「当场」靠这个判断：JS 正在调 becomeFirstResponder / endEditing 的时候为 true
  let inCall = false;
  /** @type {{ type: string, inCall: boolean, event: UIScreenKeyboardEvent, animated: string[] }[]} */
  const got = [];
  /** @param {Event} e */
  const record = (e) => {
    const event = /** @type {UIScreenKeyboardEvent} */ (e);
    follower.frame = new CGRect(0, event.frame.y - 10, 10, 10);
    got.push({ type: e.type, inCall, event, animated: follower.layer.animationKeys() });
  };
  for (const type of /** @type {const} */ (['keyboardshow', 'keyboardhide', 'keyboardchange'])) {
    screen.addEventListener(type, record);
  }

  // ---- 弹出 ----
  const focused = await until(() => {
    inCall = true;
    const ok = field.becomeFirstResponder();
    inCall = false;
    return ok;
  }, 6000);
  if (!focused) {
    console.log('  ! 6 秒内没拿到 first responder，键盘的事件这一组未验证');
    field.removeFromSuperview();
    follower.removeFromSuperview();
    return;
  }
  await until(() => got.some((g) => g.type === 'keyboardshow'), 2000);
  const shown = got.find((g) => g.type === 'keyboardshow');
  if (shown === undefined) {
    console.log('  ! 软键盘没弹出来（多半是模拟器连着电脑键盘），keyboardshow 和「跟着键盘动」未验证');
  } else {
    const e = shown.event;
    assert('keyboardshow：frame 是 CGRect', e.frame instanceof CGRect, true);
    assert('keyboardshow：是 UIScreenKeyboardEvent', e instanceof UIScreenKeyboardEvent, true);
    assert('keyboardshow：键盘有高度', e.frame.height > 0, true);
    assert('keyboardshow：键盘的底边在屏幕底边', Math.round(e.frame.y + e.frame.height),
           Math.round(screen.bounds.height));
    assert('keyboardshow：previousFrame 是 CGRect', e.previousFrame instanceof CGRect, true);
    assert('keyboardshow：duration 是正数（秒）', e.duration > 0, true);
    assert('keyboardshow：监听器里挪的视图跟着键盘动（挂上了动画）',
           shown.animated.includes('position'), true);
    const changeBeforeShow = got.findIndex((g) => g.type === 'keyboardchange') <
                             got.findIndex((g) => g.type === 'keyboardshow');
    assert('弹出时先 keyboardchange 再 keyboardshow', changeBeforeShow, true);
    console.log('  弹出：frame ' + e.frame.x + ',' + e.frame.y + ' ' + e.frame.width + 'x' + e.frame.height +
                '，duration ' + e.duration);
  }

  // ---- 收起：JS 调 endEditing，事件要在这次调用里面就派发 ----
  got.length = 0;
  inCall = true;
  vc.view.endEditing(true);
  inCall = false;
  const hiddenNow = got.find((g) => g.type === 'keyboardhide');
  if (hiddenNow === undefined && shown === undefined) {
    // 软键盘没出来时，收起的通知有时不来
    await until(() => got.some((g) => g.type === 'keyboardhide'), 1000);
  }
  const hidden = got.find((g) => g.type === 'keyboardhide');
  assert('keyboardhide 来了', hidden !== undefined, true);
  if (hidden !== undefined) {
    const e = hidden.event;
    assert('keyboardhide：当场派发（endEditing 返回之前监听器就执行了）', hidden.inCall, true);
    assert('事件是 Event', e instanceof Event, true);
    assert('type 是 keyboardhide', e.type, 'keyboardhide');
    assert('target 是这块屏幕', e.target === screen, true);
    assert('不能取消', e.cancelable, false);
    assert('keyboardhide：frame 是 CGRect', e.frame instanceof CGRect, true);
    assert('keyboardhide：previousFrame 是 CGRect', e.previousFrame instanceof CGRect, true);
    assert('keyboardhide：duration 是不小于 0 的数', typeof e.duration === 'number' && e.duration >= 0, true);
    assert('keyboardhide：frame 只读', (() => {
      try { /** @type {any} */ (e).frame = null; return '没抛'; } catch (err) { return 'TypeError'; }
    })(), 'TypeError');
    const change = got.find((g) => g.type === 'keyboardchange');
    assert('收起时也有 keyboardchange，也是当场', change !== undefined && change.inCall, true);
    if (shown !== undefined) {
      assert('keyboardhide：收起之后键盘在屏幕底边以下，或者高度是 0',
             e.frame.y >= screen.bounds.height || e.frame.height === 0, true);
      assert('keyboardhide：监听器里挪的视图跟着键盘动', hidden.animated.includes('position'), true);
    }
  }

  // ---- 取消监听之后不再收到 ----
  for (const type of /** @type {const} */ (['keyboardshow', 'keyboardhide', 'keyboardchange'])) {
    screen.removeEventListener(type, record);
  }
  got.length = 0;
  if (await until(() => field.becomeFirstResponder(), 3000)) {
    await sleep(500);
    vc.view.endEditing(true);
    await sleep(300);
    assert('removeEventListener 之后收不到', got.length, 0);
  } else {
    console.log('  ! 第二次没拿到 first responder，「取消监听之后收不到」未验证');
  }

  field.removeFromSuperview();
  follower.removeFromSuperview();
}
