// Keychain：application.keychain。全是 Promise。
//
// 和前两步真正的区别是**安全语义是 API 的一部分**：accessible 决定存的东西
// 什么时候能读到、换新设备还在不在，而它存进去就改不了。

import { assert } from '../support.js';

/**
 * @param {string} label
 * @param {() => Promise<unknown>} fn
 * @param {string} expectedName
 */
async function rejects(label, fn, expectedName) {
  try {
    await fn();
    assert(label, '没有 reject', '以 ' + expectedName + ' reject');
  } catch (err) {
    assert(label, /** @type {any} */ (err).name, expectedName);
  }
}

export function stepKeychain() {
  console.log('--- Keychain ---');
  const kc = application.keychain;

  assert('两次读回来是同一个包装', application.keychain === kc, true);
  assert('它是 Keychain', kc instanceof Keychain, true);

  // 参数验在 JS 侧、同步抛，不是 reject
  try {
    // @ts-expect-error 故意给错类型
    kc.get(42);
    console.log('  ✗ 非字符串 key 居然通过了');
  } catch (err) {
    assert('非字符串 key 同步抛',
           err instanceof Error && err.message.includes('key must be a non-empty string'),
           true);
  }
  try {
    // @ts-expect-error 故意给错类型
    kc.set('k', 123);
    console.log('  ✗ 非字符串值居然通过了');
  } catch (err) {
    assert('非字符串值同步抛',
           err instanceof Error && err.message.includes('use setBytes for binary'), true);
  }

  (async () => {
    // 跨进程那条要在 clear 之前读，否则被自己清掉
    const previousRuns = await kc.get('runs');

    await kc.clear();
    assert('clear 之后一个键都没有', (await kc.keys()).length, 0);

    // ---- 往返 ----
    assert('没有的键给 null，不 reject', await kc.get('token'), null);
    assert('没有的键 has 为假', await kc.has('token'), false);
    await kc.set('token', 'abc-123');
    assert('读回来一致', await kc.get('token'), 'abc-123');
    assert('写完 has 为真', await kc.has('token'), true);
    await kc.set('token', '换一个');
    assert('覆盖写同一个键（内部走 update）', await kc.get('token'), '换一个');

    // ---- 删 ----
    await kc.remove('token');
    assert('删掉之后 get 给 null', await kc.get('token'), null);
    await kc.remove('token');   // 本来就没有
    assert('删不存在的键也算成功', await kc.has('token'), false);

    // ---- keys ----
    await kc.set('a', '1');
    await kc.set('b', '2');
    assert('keys 列得出来', (await kc.keys()).slice().sort().join(','), 'a,b');

    // ---- 二进制 ----
    const payload = new Uint8Array([0, 1, 2, 253, 254, 255]);
    await kc.setBytes('bin', new Blob([payload]));
    const back = new Uint8Array(/** @type {ArrayBuffer} */ (await kc.getBytes('bin')));
    assert('二进制往返一致', back.join(','), payload.join(','));
    assert('没有的键 getBytes 也给 null', await kc.getBytes('没有这个'), null);

    // ---- 五个访问级别都写得进去 ----
    /** @type {KeychainAccessible[]} */
    const levels = ['whenUnlocked', 'whenUnlockedThisDeviceOnly', 'afterFirstUnlock',
                    'afterFirstUnlockThisDeviceOnly', 'whenPasscodeSetThisDeviceOnly'];
    let written = 0;
    for (const accessible of levels) {
      try {
        await kc.set('lvl-' + accessible, 'x', { accessible });
        if (await kc.get('lvl-' + accessible) === 'x') written++;
        await kc.remove('lvl-' + accessible);
      } catch (err) {
        // whenPasscodeSetThisDeviceOnly 在没设密码的设备上会失败，这是预期的
        console.log('  ! ' + accessible + ' 写不进去：' +
                    String(/** @type {any} */ (err).message).slice(0, 50));
      }
    }
    console.log('  实测：五个访问级别里写得进去的有 ' + written + ' 个');
    assert('至少前四个访问级别可用', written >= 4, true);

    // ---- 认不出的访问级别：reject，而且错误信息要列出可选值 ----
    await rejects('认不出的访问级别被拒',
                  // @ts-expect-error 故意给个不存在的值
                  () => kc.set('x', 'v', { accessible: 'always' }),
                  'TypeMismatchError');
    try {
      // @ts-expect-error 同上
      await kc.set('x', 'v', { accessible: 'always' });
    } catch (err) {
      const message = String(/** @type {any} */ (err).message);
      assert('错误信息列出了可选值', message.includes('whenUnlockedThisDeviceOnly'), true);
      assert('废弃的 always 不在可选值里', message.includes('"always"'), true);
    }
    assert('被拒之后那个键没被写进去', await kc.has('x'), false);

    // ---- 不卡主线程 ----
    let timerRan = false;
    const writing = kc.set('slow', 'x'.repeat(2000));
    setTimeout(() => { timerRan = true; }, 0);
    await writing;
    assert('写入期间定时器照常跑（重活不在主线程）', timerRan, true);
    await kc.remove('slow');

    await kc.clear();
    assert('收尾 clear 干净', (await kc.keys()).length, 0);

    // ---- 跨进程：这条才证明真存进了钥匙串 ----
    const runs = previousRuns === null ? 1 : Number(previousRuns) + 1;
    await kc.set('runs', String(runs));
    console.log('  ✓ Keychain 记到的启动次数 = ' + runs +
                (runs > 1 ? '（上一次存的还在，确实进了钥匙串）'
                          : '（再跑一次 run-sim.sh 应该看到 2）'));
    console.log('--- Keychain：以上异步断言跑完 ---');
  })();
}
