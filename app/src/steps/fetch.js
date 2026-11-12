// fetch、Blob、AbortController。

/** @param {import("../main.js").StepContext} ctx */
export function stepFetch(ctx) {
  const { assert } = ctx;
  // ===== fetch =====
  // 对着公开的 httpbin.org 跑，不需要本地起服务。代价是这些断言依赖外网：
  // 没网或者 httpbin 挂了就会整体报错，这是预期的，不是运行时的问题。
  // 另外耗时里现在含真实的 RTT（实测单次约 1.5 s），别拿来衡量桥的开销。
  (async () => {
    const base = 'https://httpbin.org';
    console.log('  --- fetch ---');
    try {
      // /response-headers 把查询参数原样回成响应首部，同名的真发两条，
      // 正好验证「同名多值用 ', ' 合并」
      const res = await fetch(base + '/response-headers?x-multi=one&x-multi=two');
      assert('status', res.status, 200);
      assert('ok', res.ok, true);
      assert('url 是绝对的', res.url,
             base + '/response-headers?x-multi=one&x-multi=two');
      assert('响应首部大小写不敏感', res.headers.get('CONTENT-TYPE'), 'application/json');
      assert('同名多值合并', res.headers.get('x-multi'), 'one, two');
      const data = await res.json();
      assert('json() 解析出数组', Array.isArray(data['x-multi']), true);
      assert('body 读过之后 bodyUsed', res.bodyUsed, true);
      try { await res.json(); console.log('  ✗ body 居然能读第二次'); }
      catch (err) { assert('body 不能读第二次', err.constructor.name, 'TypeError'); }

      // text()：后台 UTF-8 解码
      const t = await (await fetch(base + '/range/16')).text();
      assert('text()', t, 'abcdefghijklmnop');

      // 404 不是网络错误：fetch 照样兑现，只是 ok 为 false
      const r404 = await fetch(base + '/status/404');
      assert('404 不拒绝，只是 ok=false', r404.ok, false);
      assert('404 的 status', r404.status, 404);

      // arrayBuffer 走零拷贝那条路。/range/N 是确定的 a-z 循环，不是随机字节
      const buf = await (await fetch(base + '/range/256')).arrayBuffer();
      assert('arrayBuffer 是 ArrayBuffer', buf instanceof ArrayBuffer, true);
      assert('arrayBuffer 长度', buf.byteLength, 256);
      const view = new Uint8Array(buf);
      assert('arrayBuffer 内容对得上', view[0] + ',' + view[255], '97,118');  // 'a','v'

      // POST 带 body 和自定义首部，/post 把收到的原样回显
      const post = await fetch(base + '/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 来自: 'nacre' }),
      });
      const echo = await post.json();
      assert('POST 的 method 到了服务器', echo.method, 'POST');
      assert('POST 的 body 到了服务器（含中文）', echo.json.来自, 'nacre');
      assert('自定义首部到了服务器', echo.headers['Content-Type'], 'application/json');

      // 网络层失败才拒绝
      try {
        await fetch('http://127.0.0.1:1/nope');
        console.log('  ✗ 连不上居然没拒绝');
      } catch (err) {
        assert('连不上时拒绝', err.constructor.name, 'TypeError');
      }
      try { await fetch('/相对路径'); console.log('  ✗ 相对 URL 居然通过'); }
      catch (err) { assert('相对 URL 被拒（没有 base）', err.constructor.name, 'TypeError'); }

      // --- Blob：字节不进 V8 堆 ---
      const blob = await (await fetch(base + '/range/256')).blob();
      assert('blob() 返回 Blob', blob instanceof Blob, true);
      assert('blob.size', blob.size, 256);
      const blobBuf = await blob.arrayBuffer();
      assert('Blob 能取出字节', new Uint8Array(blobBuf)[255], 118);
      const textBlob = new Blob(['前缀-', '后缀'], { type: 'text/plain' });
      assert('new Blob 拼字符串', await textBlob.text(), '前缀-后缀');
      assert('new Blob 的 type', textBlob.type, 'text/plain');
      assert('new Blob 的 size（UTF-8 字节数）', textBlob.size, 13);  // 6+1+6
      const bytesBlob = new Blob([new Uint8Array([1, 2, 3])]);
      assert('new Blob 吃 TypedArray', bytesBlob.size, 3);

      // --- AbortController ---
      const ctrl = new AbortController();
      assert('signal 初始未中止', ctrl.signal.aborted, false);
      let gotAbortEvent = false;
      ctrl.signal.addEventListener('abort', () => { gotAbortEvent = true; });
      // /delay/5 要 5 秒才回，足够在它回来之前把它取消掉
      const slowRequest = fetch(base + '/delay/5', { signal: ctrl.signal });
      setTimeout(() => ctrl.abort(), 200);
      try {
        await slowRequest;
        console.log('  ✗ 取消了居然还成功');
      } catch (err) {
        assert('取消后拒绝，name 是 AbortError', err.name, 'AbortError');
      }
      assert('abort 事件派发了', gotAbortEvent, true);
      assert('中止后 aborted', ctrl.signal.aborted, true);
      // reason 的类型是 unknown——任何值都能当中止原因，这是 Web 的语义
      assert('reason 默认是 AbortError',
           /** @type {Error} */ (ctrl.signal.reason).name, 'AbortError');
      ctrl.abort();   // 重复中止是空操作，不该再派发
      assert('重复 abort 不出错', ctrl.signal.aborted, true);

      // 已经中止的 signal，请求根本不该发出去
      try {
        await fetch(base + '/get', { signal: AbortSignal.abort() });
        console.log('  ✗ 已中止的 signal 居然还发请求');
      } catch (err) {
        assert('已中止的 signal 直接拒绝', err.name, 'AbortError');
      }
      // 超时：有了定时器才做得了
      try {
        await fetch(base + '/delay/5', { signal: AbortSignal.timeout(300) });
        console.log('  ✗ 超时了居然还成功');
      } catch (err) {
        assert('AbortSignal.timeout 到点中止', err.name, 'AbortError');
      }
      try { AbortSignal.abort().throwIfAborted(); console.log('  ✗ throwIfAborted 没抛'); }
      catch (err) { assert('throwIfAborted 抛的是 reason', err.name, 'AbortError'); }

      // 并发：验证请求是并行发出去的，不是一个接一个。
      //
      // 断言的是**耗时**不是成功率：httpbin 对突发并发会回 429（实测 10 个
      // 一起发有 6 个被限流），那是公开服务的配额，不是运行时的问题。
      // 而 429 本身也是服务器正常答复，照样证明请求发出去了。
      const single0 = Date.now();
      await fetch(base + '/range/8?warm=1');
      const singleMs = Date.now() - single0;

      const t0 = Date.now();
      const batch = await Promise.allSettled(
        Array.from({ length: 10 }, (_, i) =>
          fetch(base + '/range/8?i=' + i).then((r) => r.status)));
      const batchMs = Date.now() - t0;
      const ok200 = batch.filter(
        (r) => r.status === 'fulfilled' && r.value === 200).length;
      assert('10 个请求全都有结果', batch.length, 10);
      assert('没有串行（10 个的耗时 < 单次的 4 倍）', batchMs < singleMs * 4, true);
      console.log('  ✓ 单次', singleMs, 'ms，10 个并发', batchMs,
                  'ms，其中 200 的有', ok200, '个（其余被 httpbin 限流）');
    } catch (err) {
      console.log('  ✗ fetch 用例整体出错:', err && err.message);
    }
  })();

  // ===== 读 body 期间 Response 被回收（回归）=====
  //
  // `fetch(url).then((res) => res.text())`：text() 返回之后就没有人拿着 res 了。
  // 修之前，body 还没下完时 res 被回收 → 原生那条请求记录跟着被删 → 下载完成
  // 的回调按 id 查不到记录 → 这个 Promise 永远不结算。
  //
  // 对照组是另一个同样慢的响应，拿到之后不读、不留引用。只有它在下载结束
  // **之前**被回收了，才说明 GC 真的赶在了那个时间窗里，这一轮的结论才算数。
  (async () => {
    const { storage } = application;
    const tickKey = 'nacre.acceptance.gcTick';
    const noop = () => {};
    try {
      // /drip：响应头立刻回来，body 在 6 秒里一点一点给
      const drip = 'https://httpbin.org/drip?duration=6&numbytes=60&code=200&delay=0';
      const t0 = performance.now();
      let state = 'pending';
      let length = -1;
      let collectedAt = -1;
      let pendingWhenCollected = false;
      // 对照组用 FinalizationRegistry 而不是 WeakRef：轮询 deref() 会把目标
      // 保到当前这一轮任务结束，增量标记跨着好几轮，等于一直保着它——
      // 实测那样写对照组永远不被回收。
      const registry = new FinalizationRegistry(() => {
        collectedAt = Math.round(performance.now() - t0);
        pendingWhenCollected = state === 'pending';
      });

      fetch(drip + '&who=read')
        .then((res) => {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.text();
        })
        .then((text) => { state = 'fulfilled'; length = text.length; },
              (err) => { state = 'rejected: ' + (err && err.message); });
      const controlOK = await fetch(drip + '&who=control').then((res) => {
        registry.register(res, 0);
        return res.ok;
      });

      // 清理回调是 V8 平台队列里的任务，要有原生事件进来那一轮才会被执行。
      // 定时器那一轮不算，所以每一拍写一次本地存储，让 change 事件来带它。
      storage.addEventListener('change', noop);
      for (let tick = 0; state === 'pending' && performance.now() - t0 < 15000; tick++) {
        if (collectedAt < 0) {
          // 清理回调要等一次**完整** GC，小对象只会触发新生代回收。
          // 大块缓冲区记在堆外内存上，每拍 96 MB，实测 3 秒左右出一次完整回收。
          for (let i = 0; i < 24; i++) new Uint8Array(4 << 20);
          for (let i = 0; i < 20; i++) {
            /** @type {object[]} */ const junk = [];
            for (let j = 0; j < 3000; j++) junk.push({ i, j, s: 'x'.repeat(16) + j });
          }
        }
        storage.set(tickKey, tick);
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
      const waited = Math.round(performance.now() - t0);

      console.log('--- fetch：读 body 期间 Response 被回收 ---');
      if (!controlOK || state.startsWith('rejected')) {
        console.log('  ! 慢响应没拿到（' + state + '），多半是 httpbin 限流，这一条未验证');
      } else if (collectedAt < 0 || !pendingWhenCollected) {
        console.log('  ! 对照组没在下载结束之前被回收（collectedAt = ' + collectedAt +
                    '），GC 没赶上，这一条未验证');
      } else if (state === 'pending') {
        console.log('  ✗ 读取开始之后丢掉 Response：对照组在 ' + collectedAt +
                    ' ms 被回收，读取的 Promise 等了 ' + waited + ' ms 还没结算');
      } else {
        console.log('  ✓ 读取开始之后丢掉 Response：对照组在 ' + collectedAt +
                    ' ms 被回收，读取在 ' + waited + ' ms 照常结算');
        assert('读到的内容完整（60 字节）', length, 60);
      }
    } catch (err) {
      console.log('  ✗ 「读 body 期间被回收」用例整体出错:', err && /** @type {Error} */ (err).message);
    } finally {
      storage.removeEventListener('change', noop);
      storage.remove(tickKey);
      console.log('--- fetch：以上回归跑完 ---');
    }
  })();
}
