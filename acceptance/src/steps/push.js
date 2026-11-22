// 远程推送：application.remoteNotifications（@nacrejs/push）。
//
// 真的注册要签名用的描述文件带推送能力：平时验收用的通配描述文件没有
// aps-environment，register() 被系统拒绝；用带推送能力的签名时系统给一个真令牌。
// 所以这一步分两段：
//   1. 真的调 register()，结果只打印，按结果多验几条（拿到令牌时）
//   2. 示例模块照系统的做法调 App 委托的三个回调（拿到令牌、注册失败、收到静默
//      推送），验 JS 这一侧的全部行为。两种签名下都要能过

/** @param {() => void} fn */
function thrown(fn) {
  try {
    fn();
    return '没抛';
  } catch (err) {
    return err instanceof Error ? err.name : String(err);
  }
}

/** 让延后一轮派发的事件先到 */
const tick = () => new Promise((resolve) => setTimeout(resolve, 30));

/** @param {import("../main.js").StepContext} ctx */
export async function stepPush(ctx) {
  const { assert } = ctx;
  console.log('--- 远程推送 ---');
  const example = application.nativeModules.get('example');
  if (example === null) {
    assert('远程推送：示例模块在', false, true);
    return;
  }
  const rn = application.remoteNotifications;

  // ---- 对象 ----
  assert('远程推送：每次读是同一个对象', application.remoteNotifications === rn, true);
  assert('远程推送：直接继承 EventTarget',
         Object.getPrototypeOf(RemoteNotifications.prototype), EventTarget.prototype);
  assert('远程推送：不能 new', thrown(() => new /** @type {any} */ (RemoteNotifications)()), 'TypeError');
  assert('远程推送：isRegistered 是布尔', typeof rn.isRegistered, 'boolean');

  /** @param {Promise<string>} p */
  const settle = (p) => p.then((value) => ({ ok: true, value, kind: '' }),
                                (err) => ({ ok: false, value: err instanceof Error ? err.message : String(err),
                                            kind: (err instanceof DOMException ? 'DOMException ' : '') +
                                                  (err instanceof Error ? err.name : '') }));

  // ---- 真的注册：结果取决于签名用的描述文件有没有推送的权限，只打印 ----
  // 每调一次 register()，系统都会稍后回一次（真的令牌或者失败）。下面凡是用测试
  // 替身抢先回答了的，都要再等一次真的回应到了，才往下走，免得它冲掉替身给的值
  const real = await Promise.race([
    settle(rn.register()),
    new Promise((resolve) => setTimeout(() => resolve(null), 10000)),
  ]);
  const realResult = /** @type {{ ok: boolean, value: string, kind: string } | null} */ (real);
  console.log('  · 实测：真的调 register() —— ' + (realResult === null ? '10 秒内没有结果'
    : realResult.ok ? '兑现，令牌 ' + realResult.value.length / 2 + ' 字节' : '拒绝：' + realResult.value));
  if (realResult !== null && !realResult.ok) {
    assert('远程推送：系统拒绝注册时是 DOMException OperationError', realResult.kind, 'DOMException OperationError');
  }
  if (realResult !== null && realResult.ok) {
    assert('远程推送：真的拿到的令牌是小写十六进制', /^[0-9a-f]+$/.test(realResult.value), true);
    assert('远程推送：真的拿到令牌之后 token 就是它', rn.token, realResult.value);
    assert('远程推送：真的注册之后 isRegistered 是 true', rn.isRegistered, true);
  }

  // ---- 同时等着的几个 register() 拿到同一个结果（真的那一次回应）----
  if (realResult !== null) {
    const [x, y] = await Promise.all([settle(rn.register()), settle(rn.register())]);
    assert('远程推送：同时等着的两个 register() 拿到同一个结果',
           x.ok === y.ok && x.value === y.value, true);
  }

  // 测试替身抢先回答之后，系统对那一次注册的真回应还在路上。带推送权限时它是
  // 真令牌：先让 token 是替身给的值，真令牌一到 token 就变，等 tokenchange 就知道
  // 它到了。不带推送权限时它是失败，那时已经没人在等，什么都不改，不用等
  const hasEntitlement = realResult !== null && realResult.ok;
  /** 等下一次 tokenchange，最多 10 秒。到了是 true */
  const nextTokenChange = () => new Promise((resolve) => {
    const timer = setTimeout(() => { rn.removeEventListener('tokenchange', on); resolve(false); }, 10000);
    const on = () => { clearTimeout(timer); rn.removeEventListener('tokenchange', on); resolve(true); };
    rn.addEventListener('tokenchange', on);
  });

  // ---- 等着的 register() 兑现成系统给的令牌（测试替身抢先回答）----
  let arrived = hasEntitlement ? nextTokenChange() : null;
  const pending = rn.register();
  assert('远程推送：测试替身调了委托', example.call('simulatePushToken', '0a0b0c0d'), true);
  // 同一轮里读：带推送权限时，下一轮系统的真令牌可能就到了
  assert('远程推送：token 是最近一次拿到的令牌', rn.token, '0a0b0c0d');
  assert('远程推送：register() 兑现成十六进制的令牌', await pending, '0a0b0c0d');
  if (hasEntitlement && realResult !== null) {
    // 上面那个 tokenchange 是替身的令牌触发的；再等一次，是真令牌回来
    await arrived;
    arrived = nextTokenChange();
    assert('远程推送：系统真的回应到了，token 回到真令牌', await arrived && rn.token === realResult.value, true);
  }

  // ---- 注册失败 ----
  example.call('simulatePushToken', 'ffff0000');
  await tick();
  arrived = hasEntitlement ? nextTokenChange() : null;
  const failing = rn.register();
  assert('远程推送：测试替身调了失败的委托', example.call('simulatePushFailure', 'no valid aps-environment entitlement'), true);
  assert('远程推送：注册失败不改 token', rn.token, 'ffff0000');
  const failed = await settle(failing);
  assert('远程推送：注册失败，register() 拒绝', failed.ok, false);
  assert('远程推送：拒绝带着系统给的原因', failed.value.includes('aps-environment'), true);
  if (arrived !== null) await arrived;

  // ---- 令牌变了派发 tokenchange（只用测试替身，不再调 register()）----
  let changes = 0;
  rn.addEventListener('tokenchange', () => { changes++; });
  example.call('simulatePushToken', '00ff10ab');
  await tick();
  assert('远程推送：令牌变了，token 跟着变', rn.token, '00ff10ab');
  assert('远程推送：令牌变了，派发 tokenchange', changes, 1);
  example.call('simulatePushToken', '00ff10ab');
  await tick();
  assert('远程推送：令牌没变，不派发 tokenchange', changes, 1);
  example.call('simulatePushToken', 'abcdef01');
  await tick();
  assert('远程推送：又变了，再派发一次', changes + ' ' + rn.token, '2 abcdef01');

  // ---- 取消注册 ----
  assert('远程推送：unregister() 不抛', thrown(() => rn.unregister()), '没抛');
  assert('远程推送：unregister() 之后 isRegistered 是 false', rn.isRegistered, false);

  // ---- 静默推送 ----
  assert('远程推送：没有 push 监听器，告诉系统没有新数据',
         await example.callAsync('simulateSilentPush', { aps: { 'content-available': 1 } }), 'noData');

  /** @type {PushEvent | null} */
  let got = null;
  let mode = 'resolve';
  /** @param {PushEvent} e */
  const onPush = (e) => {
    got = e;
    if (mode === 'resolve') e.waitUntil(new Promise((resolve) => setTimeout(resolve, 50)));
    if (mode === 'reject') e.waitUntil(Promise.reject(new Error('拉数据失败')));
    if (mode === 'value') e.waitUntil(/** @type {any} */ (7));
  };
  rn.addEventListener('push', onPush);
  assert('远程推送：waitUntil 的 Promise 兑现，告诉系统有新数据',
         await example.callAsync('simulateSilentPush', { aps: { 'content-available': 1 }, orderId: 42 }), 'newData');
  const event = /** @type {PushEvent | null} */ (got);
  assert('远程推送：push 事件带着推送的内容', event !== null && event.data.orderId, 42);
  assert('远程推送：push 事件带着 aps', event !== null && JSON.stringify(event.data.aps), '{"content-available":1}');
  assert('远程推送：push 事件不可取消', event !== null && event.cancelable, false);
  assert('远程推送：派发完之后再调 waitUntil 抛 InvalidStateError',
         thrown(() => { if (event !== null) event.waitUntil(Promise.resolve()); }), 'InvalidStateError');
  {
    let late = null;
    try { if (event !== null) event.waitUntil(Promise.resolve()); } catch (err) { late = err; }
    assert('远程推送：waitUntil 抛的是 DOMException', late instanceof DOMException, true);
  }
  mode = 'reject';
  assert('远程推送：waitUntil 的 Promise 拒绝，告诉系统失败了',
         await example.callAsync('simulateSilentPush', { aps: { 'content-available': 1 } }), 'failed');
  mode = 'none';
  assert('远程推送：监听器没调 waitUntil，告诉系统没有新数据',
         await example.callAsync('simulateSilentPush', { aps: { 'content-available': 1 } }), 'noData');
  mode = 'value';
  assert('远程推送：waitUntil 给的不是 Promise，当成已经兑现',
         await example.callAsync('simulateSilentPush', { aps: { 'content-available': 1 } }), 'newData');
  rn.removeEventListener('push', onPush);
}
