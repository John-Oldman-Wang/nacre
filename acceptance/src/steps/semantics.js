// 基础语义：Blob 读出来的字节是独立的；事件派发中移除监听器、监听器抛异常，
// 和 Chrome 一致。
//
// 这几条来自一份外部审查（2026-11-16），都先在运行时里用探针复现过：
//   - 改了 blob.arrayBuffer() 读出的缓冲区，Blob 自己的内容跟着变
//   - 第一个监听器里移除第二个，第二个照样被调
//   - 监听器抛的异常只打到控制台，application 的 error 事件收不到

const text = (/** @type {ArrayBuffer} */ buffer) =>
  String.fromCharCode(...new Uint8Array(buffer));

/** @param {import("../main.js").StepContext} ctx */
export function stepSemantics(ctx) {
  const { assert } = ctx;
  ctx.section('基础语义：Blob 的字节、事件的派发（没有界面，看日志）', 8);
  console.log('  --- 基础语义：事件派发中移除监听器 ---');

  // ===================================================================
  // 1. 派发中移除：还没轮到的监听器被移除了，就不再调（Chrome 的做法）
  {
    const target = new EventTarget();
    /** @type {string[]} */
    const order = [];
    const second = () => { order.push('second'); };
    target.addEventListener('x', () => { order.push('first'); target.removeEventListener('x', second); });
    target.addEventListener('x', second);
    target.addEventListener('x', () => { order.push('third'); });
    target.dispatchEvent(new Event('x'));
    assert('前一个监听器移除了后一个：后一个不再被调', order.join(','), 'first,third');
    order.length = 0;
    target.dispatchEvent(new Event('x'));
    assert('下一次派发它也不在', order.join(','), 'first,third');
  }
  {
    // 移除自己：这一轮照常跑完，下一轮不在
    const target = new EventTarget();
    let calls = 0;
    const self = () => { calls++; target.removeEventListener('x', self); };
    target.addEventListener('x', self);
    target.dispatchEvent(new Event('x'));
    target.dispatchEvent(new Event('x'));
    assert('监听器里移除自己：只跑这一次', calls, 1);
  }
  {
    // 移除之后又加回同一个函数：是一次新的登记，不在这一轮的名单里
    const target = new EventTarget();
    /** @type {string[]} */
    const order = [];
    const second = () => { order.push('second'); };
    let swapped = false;
    target.addEventListener('x', () => {
      order.push('first');
      // 只在第一轮换一次。每一轮都换的话，第二个每一轮都刚好被换掉，永远轮不到
      if (swapped) return;
      swapped = true;
      target.removeEventListener('x', second);
      target.addEventListener('x', second);
    });
    target.addEventListener('x', second);
    target.dispatchEvent(new Event('x'));
    assert('移除之后当场加回去：这一轮不调', order.join(','), 'first');
    order.length = 0;
    target.dispatchEvent(new Event('x'));
    assert('下一轮照常调', order.join(','), 'first,second');
  }
  {
    // 派发中新加的：这一轮不调（原来就是这样，盯住别改坏）
    const target = new EventTarget();
    /** @type {string[]} */
    const order = [];
    let added = false;
    target.addEventListener('x', () => {
      order.push('first');
      if (!added) { added = true; target.addEventListener('x', () => { order.push('late'); }); }
    });
    target.dispatchEvent(new Event('x'));
    assert('派发中新加的监听器：这一轮不调', order.join(','), 'first');
    order.length = 0;
    target.dispatchEvent(new Event('x'));
    assert('下一轮调', order.join(','), 'first,late');
  }
  {
    // once 的监听器在轮到它之前被移除
    const target = new EventTarget();
    /** @type {string[]} */
    const order = [];
    const once = () => { order.push('once'); };
    target.addEventListener('x', () => { order.push('first'); target.removeEventListener('x', once); });
    target.addEventListener('x', once, { once: true });
    target.dispatchEvent(new Event('x'));
    assert('once 的监听器轮到之前被移除：不调', order.join(','), 'first');
  }
  {
    // 监听器里对同一个目标再派发一次：里面那一次看到的是当时的名单
    const target = new EventTarget();
    /** @type {string[]} */
    const order = [];
    let depth = 0;
    const second = () => { order.push('second@' + depth); };
    target.addEventListener('x', () => {
      order.push('first@' + depth);
      if (depth === 0) {
        depth = 1;
        target.removeEventListener('x', second);
        target.dispatchEvent(new Event('x'));
        depth = 0;
      }
    });
    target.addEventListener('x', second);
    target.dispatchEvent(new Event('x'));
    assert('嵌套派发：外层移除了的，里外两层都不调', order.join(','), 'first@0,first@1');
  }

  // ===================================================================
  // 2. 监听器抛异常：别的监听器照常跑，异常从 application 的 error 事件报出来
  console.log('  --- 基础语义：监听器抛异常 ---');
  /** @type {ErrorEvent[]} */
  const reported = [];
  const collect = (/** @type {Event} */ e) => {
    reported.push(/** @type {ErrorEvent} */ (e));
    e.preventDefault();   // 不要默认的那行 Uncaught 日志
  };
  application.addEventListener('error', collect);
  {
    const target = new EventTarget();
    /** @type {string[]} */
    const order = [];
    const boom = new Error('监听器里故意抛的');
    target.addEventListener('x', () => { order.push('first'); throw boom; });
    target.addEventListener('x', () => { order.push('second'); });
    let returned;
    let thrownOut = false;
    try { returned = target.dispatchEvent(new Event('x')); } catch { thrownOut = true; }
    assert('一个监听器抛了：后面的照常跑', order.join(','), 'first,second');
    assert('异常不从 dispatchEvent 冒出来', thrownOut, false);
    assert('dispatchEvent 照常返回 true', returned, true);
    assert('dispatchEvent 返回之前，error 事件已经派发了', reported.length, 1);
    assert('error 事件带着抛出来的那个对象', reported.length > 0 && reported[0].error === boom, true);
    assert('message 里有异常的文字', reported.length > 0 && reported[0].message.includes('监听器里故意抛的'), true);
    assert('事件是 ErrorEvent', reported.length > 0 && reported[0] instanceof ErrorEvent, true);
  }
  {
    reported.length = 0;
    const target = new EventTarget();
    target.addEventListener('x', () => { throw '抛的不是 Error 对象'; });   // eslint-disable-line no-throw-literal
    target.dispatchEvent(new Event('x'));
    assert('抛的不是 Error 对象：照样报，error 就是那个值',
           reported.length === 1 && reported[0].error, '抛的不是 Error 对象');
  }
  {
    // 两个监听器都抛：各报一次，顺序和监听器的顺序一致
    reported.length = 0;
    const target = new EventTarget();
    target.addEventListener('x', () => { throw new Error('甲'); });
    target.addEventListener('x', () => { throw new Error('乙'); });
    target.dispatchEvent(new Event('x'));
    assert('两个监听器都抛：报两次，先后和监听器一致',
           reported.map((e) => /** @type {Error} */ (e.error).message).join(','), '甲,乙');
  }
  {
    // 原生对象上的事件也一样（控件的事件是原生派发的，走的是同一个 dispatchEvent）
    reported.length = 0;
    const button = UIButton.buttonWithType('system');
    let after = 0;
    button.addEventListener('touchupinside', () => { throw new Error('按钮的监听器抛的'); });
    button.addEventListener('touchupinside', () => { after++; });
    button.dispatchEvent(new Event('touchupinside'));
    assert('原生对象上的监听器抛了：照样报、后面的照常跑',
           reported.length + ',' + after, '1,1');
  }
  {
    // error 的监听器自己抛：不能没完没了地绕回来
    reported.length = 0;
    let faulty = 0;
    const bad = () => { faulty++; throw new Error('error 的监听器自己抛的'); };
    application.addEventListener('error', bad);
    const target = new EventTarget();
    target.addEventListener('x', () => { throw new Error('起因'); });
    target.dispatchEvent(new Event('x'));
    application.removeEventListener('error', bad);
    assert('error 的监听器自己抛：只被调一次，没有绕回来', faulty, 1);
    assert('别的 error 监听器照常收到起因', reported.some((e) => /** @type {Error} */ (e.error).message === '起因'), true);
  }
  application.removeEventListener('error', collect);

  // ===================================================================
  // 3. Blob 读出来的字节是独立的一份
  return (async () => {
    console.log('  --- 基础语义：Blob 读出的字节 ---');
    const blob = new Blob(['hello']);
    const first = await blob.arrayBuffer();
    assert('读出来的内容', text(first), 'hello');
    new Uint8Array(first)[0] = 0x58;   // 'X'
    assert('改了读出来的缓冲区：Blob 自己的内容不变', await blob.text(), 'hello');
    const second = await blob.arrayBuffer();
    assert('第二次读出来的还是原来的内容', text(second), 'hello');
    assert('两次读出来的是两个对象', first === second, false);
    new Uint8Array(second)[1] = 0x59;   // 'Y'
    assert('改第二次读出的：第一次读出的不跟着变', text(first), 'Xello');
    assert('改过的缓冲区自己留着改动', text(second), 'hYllo');
    assert('Blob 的 size 不变', blob.size, 5);

    const fromBytes = new Blob([new Uint8Array([1, 2, 3, 4])]);
    const bytes = new Uint8Array(await fromBytes.arrayBuffer());
    bytes.fill(9);
    assert('从字节建的 Blob：改读出的缓冲区不影响它',
           Array.from(new Uint8Array(await fromBytes.arrayBuffer())).join(','), '1,2,3,4');

    // 自己构造的 Response，body 是 Blob：读出来的同样是独立的
    const viaResponse = await new Response('AB').blob();
    new Uint8Array(await viaResponse.arrayBuffer())[0] = 0x5a;
    assert('Response 给的 Blob：改读出的缓冲区不影响它', await viaResponse.text(), 'AB');

    // 发出去的请求体也不该被改到
    const body = new Blob(['payload']);
    new Uint8Array(await body.arrayBuffer()).fill(0x2d);
    assert('读过、改过缓冲区之后，Blob 还能原样再读', await body.text(), 'payload');

    const empty = await new Blob([]).arrayBuffer();
    assert('空的 Blob：读出 0 个字节', empty.byteLength, 0);

    // 大一点的：1 MB，内容按规律填，头尾和中间各看一个
    const big = new Uint8Array(1024 * 1024);
    for (let i = 0; i < big.length; i++) big[i] = i % 251;
    const bigBlob = new Blob([big]);
    const copy = new Uint8Array(await bigBlob.arrayBuffer());
    assert('1 MB 的 Blob：长度', copy.length, 1024 * 1024);
    assert('1 MB 的 Blob：头、中、尾三个字节都对',
           copy[0] + ',' + copy[524288] + ',' + copy[1048575],
           (0 % 251) + ',' + (524288 % 251) + ',' + (1048575 % 251));
    console.log('  --- 基础语义：以上断言跑完 ---');
  })().catch((err) => {
    console.log('  ✗ 基础语义这一步的异步部分中途抛了: ' + (err instanceof Error ? err.message : String(err)));
  });
}
