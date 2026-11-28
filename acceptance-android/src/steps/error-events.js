// 全局错误出口：没接住的异常和没处理的拒绝，在 application 上派发 error / unhandledrejection。
//
// 和 iOS 一样（照 Web）：error 是 ErrorEvent，unhandledrejection 是 PromiseRejectionEvent，都能取消，
// 调了 preventDefault() 运行时就不再打默认的那行日志。日志那一半验收看不到，这里只验事件本身。
//
// 监听器只认这一步自己抛的那几个值，别的照旧放过去：同一时间别的步骤也可能有异常。

/**
 * 每 20 毫秒看一次，check() 为真或者到了期限就停
 * @param {() => boolean} check
 * @param {number} ms
 */
const waitFor = (check, ms) => new Promise((resolve) => {
  const started = Date.now();
  const poll = () => {
    if (check() || Date.now() - started > ms) { resolve(check()); return; }
    setTimeout(poll, 20);
  };
  poll();
});

/** @param {number} ms */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** @param {import('../main.js').StepContext} ctx */
export async function stepErrorEvents(ctx) {
  const { assert } = ctx;
  console.log('--- 全局错误出口：error / unhandledrejection ---');

  const fromTimer = new Error('error-events: thrown in a timer');
  const fromListener = new Error('error-events: thrown in a listener');
  const fromTimerAgain = new Error('error-events: thrown in a timer again');
  const fromErrorListener = new Error('error-events: thrown in an error listener');
  const rejected = new Error('error-events: rejection nobody handles');
  const handled = new Error('error-events: rejection that is handled');
  const ours = new Set([fromTimer, fromListener, fromTimerAgain, fromErrorListener]);

  /** @type {ErrorEvent[]} */
  const errors = [];
  /** @type {PromiseRejectionEvent[]} */
  const rejections = [];

  /** @param {Event} e */
  const onError = (e) => {
    const event = /** @type {ErrorEvent} */ (e);
    if (!ours.has(event.error)) return;
    errors.push(event);
    event.preventDefault();
  };
  /** @param {Event} e */
  const onRejection = (e) => {
    const event = /** @type {PromiseRejectionEvent} */ (e);
    if (event.reason !== rejected && event.reason !== handled) return;
    rejections.push(event);
    event.preventDefault();
  };
  // error 的监听器自己抛：运行时不为它再派发一次 error，免得没完没了
  /** @param {Event} e */
  const throwingListener = (e) => {
    if (/** @type {ErrorEvent} */ (e).error === fromTimerAgain) throw fromErrorListener;
  };

  application.addEventListener('error', onError);
  application.addEventListener('unhandledrejection', onRejection);
  try {
    // --- 定时器回调里没接住的异常 ---
    setTimeout(() => { throw fromTimer; }, 0);
    await waitFor(() => errors.length >= 1, 2000);
    const timerEvent = errors.find((e) => e.error === fromTimer);
    assert('没接住的异常：application 收到 error', timerEvent !== undefined, true);
    if (timerEvent !== undefined) {
      assert('error 事件是 ErrorEvent', timerEvent instanceof ErrorEvent, true);
      assert('error 事件的 message 里有异常的说明', timerEvent.message.includes('thrown in a timer'), true);
      assert('error 事件的 filename 是抛出异常的脚本', timerEvent.filename, 'main.js');
      assert('error 事件的 lineno 是正数', timerEvent.lineno > 0, true);
      assert('error 事件可以取消', timerEvent.cancelable, true);
      assert('error 事件调了 preventDefault 之后 defaultPrevented 是 true', timerEvent.defaultPrevented, true);
    }

    // --- 监听器抛的异常：当场报成 error，后面的监听器照常调，派发方收不到异常 ---
    const target = new EventTarget();
    let laterCalled = false;
    target.addEventListener('ping', () => { throw fromListener; });
    target.addEventListener('ping', () => { laterCalled = true; });
    let dispatchThrew = false;
    try { target.dispatchEvent(new Event('ping')); } catch { dispatchThrew = true; }
    assert('监听器抛的异常当场报成 application 上的 error',
           errors.some((e) => e.error === fromListener), true);
    assert('一个监听器抛了，后面的监听器照常调', laterCalled, true);
    assert('监听器抛的异常不冒到 dispatchEvent 的调用方', dispatchThrew, false);

    // --- error 的监听器自己抛 ---
    application.addEventListener('error', throwingListener);
    setTimeout(() => { throw fromTimerAgain; }, 0);
    await waitFor(() => errors.some((e) => e.error === fromTimerAgain), 2000);
    await sleep(200);
    assert('error 的监听器照常收到第二次的异常', errors.some((e) => e.error === fromTimerAgain), true);
    assert('error 的监听器自己抛的，不再派发一次 error',
           errors.some((e) => e.error === fromErrorListener), false);
    application.removeEventListener('error', throwingListener);

    // --- 没处理的拒绝 ---
    const promise = Promise.reject(rejected);
    Promise.reject(handled).catch(() => {});
    await waitFor(() => rejections.length >= 1, 2000);
    await sleep(200);
    const rejectionEvent = rejections.find((e) => e.reason === rejected);
    assert('没处理的拒绝：application 收到 unhandledrejection', rejectionEvent !== undefined, true);
    if (rejectionEvent !== undefined) {
      assert('unhandledrejection 事件是 PromiseRejectionEvent',
             rejectionEvent instanceof PromiseRejectionEvent, true);
      assert('unhandledrejection 事件的 promise 是被拒绝的那个', rejectionEvent.promise === promise, true);
      assert('unhandledrejection 事件可以取消', rejectionEvent.cancelable, true);
      assert('unhandledrejection 事件调了 preventDefault 之后 defaultPrevented 是 true', rejectionEvent.defaultPrevented, true);
    }
    assert('处理了的拒绝不派发 unhandledrejection', rejections.some((e) => e.reason === handled), false);
  } finally {
    application.removeEventListener('error', onError);
    application.removeEventListener('unhandledrejection', onRejection);
    application.removeEventListener('error', throwingListener);
  }
}
