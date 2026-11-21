// 拖动结束时改滚动停下的位置：UIScrollView 的 beforedragend 事件。
//
// 手指离开的那一刻系统当场来问「停在哪」（scrollViewWillEndDragging:
// withVelocity:targetContentOffset:），带着松手时的速度和系统算出来的停点。
// 事件当场派发、不能取消；事件对象上的 targetContentOffset 可写，监听器改了
// 什么，原生就照什么停。
//
// 真的拖动要手指。这里由示例模块照 UIKit 松手时的做法调滚动视图的委托，
// 把系统算出来的停点交进去，再把委托改完的停点交回来。

/** @param {() => void} fn */
const run = (fn) => { try { fn(); } catch { /* 下面断言结果 */ } };

/** @param {import("../main.js").StepContext} ctx */
export async function stepDragTarget(ctx) {
  const { assert } = ctx;
  console.log('--- 拖动结束时改滚动停下的位置 ---');
  const example = application.nativeModules.get('example');
  if (example === null) {
    assert('停点：示例模块在', false, true);
    return;
  }
  let host = ctx.vc;
  while (host.presentedViewController !== null) host = host.presentedViewController;
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  page.modalPresentationStyle = 'fullScreen';
  const scroller = new UIScrollView();
  scroller.frame = new CGRect(0, 100, 300, 400);
  scroller.contentSize = new CGSize(300, 4000);
  scroller.tag = 4242;
  page.view.addSubview(scroller);
  await host.presentViewController(page, { animated: false });

  // 松手：速度 (0, 2) pt/ms，系统算出来停在 (0, 123)
  const lift = () => {
    const out = /** @type {{ x: number, y: number } | null} */ (
      example.call('simulateDragEnd', 4242, 0, 2, 0, 123));
    return out === null ? 'null' : out.x + ',' + out.y;
  };

  assert('停点：没人监听时照系统的', lift(), '0,123');

  /** @type {Event | null} */
  let seen = null;
  /** @type {(e: UIScrollViewDragEndEvent) => void} */
  let answer = () => {};
  /** @param {Event} e */
  const listener = (e) => { seen = e; answer(/** @type {UIScrollViewDragEndEvent} */ (e)); };
  scroller.addEventListener('beforedragend', listener);

  answer = (e) => { e.targetContentOffset = new CGPoint(0, Math.round(e.targetContentOffset.y / 80) * 80); };
  assert('停点：监听器改成 80 的倍数', lift(), '0,160');
  const event = /** @type {UIScrollViewDragEndEvent | null} */ (seen);
  assert('停点：当场派发，事件的 target 是这个滚动视图', event !== null && event.target === scroller, true);
  assert('停点：不能取消', event !== null && event.cancelable, false);
  assert('停点：velocity 是松手时的速度', event !== null && event.velocity instanceof CGPoint &&
         event.velocity.x === 0 && event.velocity.y === 2, true);

  answer = (e) => { e.targetContentOffset = { x: 0, y: 40 }; };
  assert('停点：写普通对象也认', lift(), '0,40');

  answer = () => {};
  assert('停点：监听器不改就照系统的', lift(), '0,123');

  answer = (e) => { /** @type {any} */ (e).targetContentOffset = 'abc'; };
  assert('停点：写了不是点的值，照系统的', lift(), '0,123');

  answer = () => { throw new Error('监听器炸了'); };
  run(() => {});
  assert('停点：监听器抛了，照系统的', lift(), '0,123');

  scroller.removeEventListener('beforedragend', listener);
  answer = (e) => { e.targetContentOffset = new CGPoint(0, 999); };
  assert('停点：摘掉监听器之后照系统的', lift(), '0,123');

  await host.dismissViewController({ animated: false });
}
