// 后台任务：application.runBackgroundTask(work, { name })。
//
// 切到后台后向系统多要一段时间（大约 30 秒）把 work 做完。work 拿到一个
// AbortSignal，系统快到时间时它被中止，运行时当场把任务结束。返回 work 的
// Promise。
//
// 自动跑的验收一直在前台：「切到后台之后还在跑」和「快到时间时 signal 中止」
// 要把 App 切到后台等半分钟，这里只验在前台时的形状。

/** @param {import("../main.js").StepContext} ctx */
export async function stepBackgroundTask(ctx) {
  const { assert } = ctx;
  console.log('--- 后台任务 ---');

  assert('后台任务：runBackgroundTask 是方法', typeof application.runBackgroundTask, 'function');
  assert('后台任务：在前台时 backgroundTimeRemaining 是 Infinity', application.backgroundTimeRemaining, Infinity);

  // ---- work 拿到 signal，返回值原样兑现 ----
  /** @type {AbortSignal | null} */
  let seen = null;
  let remainingInside = 0;
  const value = await application.runBackgroundTask(async (signal) => {
    seen = signal;
    remainingInside = application.backgroundTimeRemaining;
    await new Promise((resolve) => setTimeout(resolve, 20));
    return 42;
  }, { name: '验收' });
  assert('后台任务：兑现成 work 的返回值', value, 42);
  const signal = /** @type {AbortSignal | null} */ (seen);
  assert('后台任务：work 拿到一个 AbortSignal', signal instanceof AbortSignal, true);
  assert('后台任务：在前台做完，signal 没有中止', signal !== null && signal.aborted, false);
  assert('后台任务：任务进行中、在前台时剩余时间也是 Infinity', remainingInside, Infinity);

  // ---- 不是 async 的 work ----
  assert('后台任务：work 直接返回值也行', await application.runBackgroundTask(() => 7), 7);

  // ---- 失败原样传出来 ----
  const failure = new Error('上传失败');
  let caught = null;
  try {
    await application.runBackgroundTask(async () => { throw failure; });
  } catch (err) {
    caught = err;
  }
  assert('后台任务：work 拒绝，Promise 以同一个错误拒绝', caught === failure, true);

  // work 同步抛：不在调用时抛，而是变成拒绝
  const syncFailure = new Error('同步抛');
  let thrownSync = false;
  /** @type {Promise<unknown> | null} */
  let pending = null;
  try {
    pending = application.runBackgroundTask(() => { throw syncFailure; });
  } catch {
    thrownSync = true;
  }
  assert('后台任务：work 同步抛，调用本身不抛', thrownSync, false);
  caught = null;
  try { await pending; } catch (err) { caught = err; }
  assert('后台任务：work 同步抛，Promise 以那个错误拒绝', caught === syncFailure, true);

  // ---- 参数不对 ----
  /** @param {() => Promise<unknown>} run */
  async function rejection(run) {
    let p;
    try { p = run(); } catch (err) { return '同步抛了 ' + (err instanceof Error ? err.name : String(err)); }
    try { await p; return '兑现了'; } catch (err) { return err instanceof Error ? err.name : String(err); }
  }
  assert('后台任务：work 不是函数，以 TypeError 拒绝',
         await rejection(() => application.runBackgroundTask(/** @type {any} */ ('upload'))), 'TypeError');
  assert('后台任务：不带 work，以 TypeError 拒绝',
         await rejection(() => /** @type {any} */ (application).runBackgroundTask()), 'TypeError');
  assert('后台任务：options 是 null 视为空对象', await application.runBackgroundTask(() => 1, null), 1);
  assert('后台任务：name 不是字符串按 String() 转',
         await application.runBackgroundTask(() => 2, { name: /** @type {any} */ (12) }), 2);

  // ---- 同时几个 ----
  const both = await Promise.all([
    application.runBackgroundTask(async () => { await new Promise((r) => setTimeout(r, 30)); return 'a'; }),
    application.runBackgroundTask(async () => 'b'),
  ]);
  assert('后台任务：同时开两个，各自兑现', both.join(','), 'a,b');

  console.log('  ! 后台任务：切到后台之后还在跑、快到时间时 signal 中止，要把 App 切到后台等半分钟，未验证');
}
