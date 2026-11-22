// 手势识别器的委托：要不要开始（beforebegin 事件）、能不能和别的识别器同时识别
// （recognizesSimultaneouslyWith）。
//
// 系统当场问这两件事。真的触摸要手指，这里由示例模块照 UIKit 的做法去问识别器
// 的委托（gestureRecognizerShouldBegin: 和 gestureRecognizer:
// shouldRecognizeSimultaneouslyWithGestureRecognizer:），把答案交回来。
//
// 只能用在 JS 自己 new 的识别器上：UIKit 自带的（滚动视图内置的拖动手势）委托
// 必须是它自己，换掉会崩，所以在那上面用抛 TypeError。

/** @param {() => void} fn */
function thrown(fn) {
  try {
    fn();
    return '没抛';
  } catch (err) {
    return err instanceof Error ? err.name : String(err);
  }
}

/** @param {import("../main.js").StepContext} ctx */
export async function stepGestureDelegate(ctx) {
  const { assert } = ctx;
  console.log('--- 手势识别器的委托 ---');
  const example = application.nativeModules.get('example');
  if (example === null) {
    assert('手势委托：示例模块在', false, true);
    return;
  }
  let host = ctx.vc;
  while (host.presentedViewController !== null) host = host.presentedViewController;
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  page.modalPresentationStyle = 'fullScreen';
  const padA = new UIView();
  padA.frame = new CGRect(20, 120, 150, 150);
  padA.tag = 7101;
  const padB = new UIView();
  padB.frame = new CGRect(200, 120, 150, 150);
  padB.tag = 7102;
  const scroller = new UIScrollView();
  scroller.frame = new CGRect(20, 300, 300, 200);
  scroller.contentSize = new CGSize(300, 2000);
  scroller.tag = 7103;
  page.view.addSubview(padA);
  page.view.addSubview(padB);
  page.view.addSubview(scroller);
  const pan = new UIPanGestureRecognizer();
  const tap = new UITapGestureRecognizer();
  padA.addGestureRecognizer(pan);
  padB.addGestureRecognizer(tap);
  await host.presentViewController(page, { animated: false });

  /**
   * 问 tagA 上的识别器（滚动视图问它内置的拖动手势）；给了 tagB 再问能不能和 tagB 的同时识别
   * @param {number} a
   * @param {number | null} b
   */
  const ask = (a, b) => /** @type {{ shouldBegin: boolean, simultaneous: boolean | null } | null} */ (
    example.call('simulateGestureAsk', a, b));

  // ---- 默认 ----
  assert('手势委托：recognizesSimultaneouslyWith 默认是空数组',
         Array.isArray(pan.recognizesSimultaneouslyWith) && pan.recognizesSimultaneouslyWith.length === 0, true);
  let answer = ask(7101, 7102);
  assert('手势委托：没设过，要开始', answer !== null && answer.shouldBegin, true);
  assert('手势委托：没设过，不同时识别', answer !== null && answer.simultaneous, false);

  // ---- beforebegin ----
  /** @type {UIGestureRecognizerEvent | null} */
  let seen = null;
  let refuse = false;
  /** @param {Event} e */
  const onBegin = (e) => {
    seen = /** @type {UIGestureRecognizerEvent} */ (e);
    if (refuse) e.preventDefault();
  };
  pan.addEventListener('beforebegin', onBegin);
  answer = ask(7101, null);
  assert('beforebegin：不调 preventDefault 就开始', answer !== null && answer.shouldBegin, true);
  const event = /** @type {UIGestureRecognizerEvent | null} */ (seen);
  assert('beforebegin：当场派发，target 是识别器', event !== null && event.target === pan, true);
  assert('beforebegin：可以取消', event !== null && event.cancelable, true);
  assert('beforebegin：带着触点个数', event !== null && typeof event.numberOfTouches === 'number', true);
  assert('beforebegin：是 UIGestureRecognizerEvent', event instanceof UIGestureRecognizerEvent, true);
  assert('beforebegin：拖动识别器上也只是基类，没有 translation',
         event instanceof UIPanGestureRecognizerEvent, false);
  refuse = true;
  answer = ask(7101, null);
  assert('beforebegin：preventDefault 就不开始', answer !== null && answer.shouldBegin, false);
  pan.removeEventListener('beforebegin', onBegin);
  answer = ask(7101, null);
  assert('beforebegin：摘掉监听器之后照常开始', answer !== null && answer.shouldBegin, true);

  // ---- recognizesSimultaneouslyWith ----
  pan.recognizesSimultaneouslyWith = [tap];
  assert('同时识别：写进去读回来', pan.recognizesSimultaneouslyWith.length === 1 &&
         pan.recognizesSimultaneouslyWith[0] === tap, true);
  answer = ask(7101, 7102);
  assert('同时识别：列表里的那个，答能', answer !== null && answer.simultaneous, true);
  const builtin = scroller.panGestureRecognizer;
  if (builtin === null) {
    assert('滚动视图有内置的拖动手势', false, true);
    await host.dismissViewController({ animated: false });
    return;
  }
  pan.recognizesSimultaneouslyWith = [builtin];
  answer = ask(7101, 7103);
  assert('同时识别：可以填系统的识别器（滚动视图内置的拖动）', answer !== null && answer.simultaneous, true);
  answer = ask(7101, 7102);
  assert('同时识别：不在列表里的，答不能', answer !== null && answer.simultaneous, false);
  pan.recognizesSimultaneouslyWith = [];
  answer = ask(7101, 7103);
  assert('同时识别：清空之后答不能', answer !== null && answer.simultaneous, false);
  assert('同时识别：填的不是识别器抛',
         thrown(() => { pan.recognizesSimultaneouslyWith = /** @type {any} */ ([padA]); }), 'TypeError');

  // ---- UIKit 自带的识别器上不能用 ----
  assert('系统的识别器：写 recognizesSimultaneouslyWith 抛',
         thrown(() => { builtin.recognizesSimultaneouslyWith = [pan]; }), 'TypeError');
  assert('系统的识别器：监听 beforebegin 抛',
         thrown(() => { builtin.addEventListener('beforebegin', () => {}); }), 'TypeError');
  answer = ask(7103, null);
  assert('系统的识别器：它自己的委托照旧（滚动视图要开始）', answer !== null && answer.shouldBegin, true);

  await host.dismissViewController({ animated: false });
}
