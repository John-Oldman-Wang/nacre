// 后台任务：application.runBackgroundTask(work, { name }) 和
// application.backgroundTimeRemaining。原生在 NacreBackgroundTask.mm。
//
// 这是内置脚本的一个 part：整个文件是一个函数表达式，运行时按文件名顺序执行，用共享的 ctx 调一次。
//
// UIKit 是一对调用（开始拿一个号、做完交回去），忘了交回去任务就一直占着。这里
// 包成「传一个函数」：work 返回的 Promise 落定，任务就结束。系统快到时间时
// work 拿到的 signal 被中止，运行时当场把任务结束，不等 work。形状和 Web 的
// navigator.locks.request(name, fn) 一样：调用方的函数决定占多久。
(function (ctx) {
  'use strict';

  const { define, describeValue, nativeClassCallValue, registerBlock, releaseBlock, toTextOrNull } = ctx;

  /** @param {string} message */
  function timeoutError(message) {
    return new ctx.DOMException(message, 'TimeoutError');
  }

  define(Application.prototype, 'runBackgroundTask', function runBackgroundTask(work, options) {
    // 返回 Promise 的方法，参数错了是拒绝，不是同步抛（Web IDL 的约定）
    if (typeof work !== 'function') {
      return Promise.reject(new TypeError(
        'runBackgroundTask needs a function, got ' + describeValue(work)));
    }
    if (options != null && typeof options !== 'object') {
      return Promise.reject(new TypeError(
        'runBackgroundTask options must be an object, got ' + describeValue(options)));
    }
    const name = options != null && options.name !== undefined ? toTextOrNull(options.name) : null;

    const controller = new AbortController();
    let ended = false;
    // 系统快到时间：原生当场调回来，回去之后马上把任务结束
    const blockId = registerBlock(() => {
      ended = true;
      controller.abort(timeoutError('Background time expired'));
    }, true);
    const task = nativeClassCallValue('UIApplication', 'beginBackgroundTaskWithName:expirationHandler:',
                                      [name, blockId]);
    if (task === 0) {
      // 系统不给（已经没有后台时间了）。work 照样跑，signal 一开始就是中止的
      ended = true;
      releaseBlock(blockId);
      controller.abort(timeoutError('No background time available'));
    }
    const finish = () => {
      if (!ended) {
        ended = true;
        nativeClassCallValue('UIApplication', 'endBackgroundTask:', [task]);
      }
      releaseBlock(blockId);
    };

    let result;
    try {
      result = Promise.resolve(work(controller.signal));
    } catch (err) {
      result = Promise.reject(err);
    }
    return result.finally(finish);
  });

  // 还剩多少秒。在前台是 Infinity（系统给的是 DBL_MAX，原生换成 null 过桥）
  Object.defineProperty(Application.prototype, 'backgroundTimeRemaining', {
    configurable: true,
    enumerable: false,
    get() {
      const remaining = nativeClassCallValue('UIApplication', 'backgroundTimeRemaining', []);
      return remaining === null ? Infinity : remaining;
    },
  });
})
