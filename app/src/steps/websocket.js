// A16：WebSocket。
//
// 打一个公开的 echo 服务，和 fetch 那段打 httpbin 一个路子——公开服务不稳
// 的时候报未验证，不报失败。

/** @param {import("../main.js").StepContext} ctx */
export function stepWebSocket(ctx) {
  const { assert } = ctx;
  console.log('--- WebSocket ---');

  // ---- 不碰网络的那些 ----
  assert('CONNECTING', WebSocket.CONNECTING, 0);
  assert('OPEN', WebSocket.OPEN, 1);
  assert('CLOSING', WebSocket.CLOSING, 2);
  assert('CLOSED', WebSocket.CLOSED, 3);

  const idle = new WebSocket('wss://echo.websocket.org');
  assert('建完是 CONNECTING', idle.readyState, WebSocket.CONNECTING);
  assert('url 读得回来', idle.url, 'wss://echo.websocket.org');
  assert('还没握手完，没有子协议', idle.protocol, '');
  console.log('  实测：maximumMessageSize 默认 = ' + idle.maximumMessageSize);
  assert('maximumMessageSize 是正数', idle.maximumMessageSize > 0, true);
  idle.maximumMessageSize = 4096;
  assert('maximumMessageSize 写得进去', idle.maximumMessageSize, 4096);

  try {
    // @ts-expect-error 只有四个事件
    idle.addEventListener('ping', () => {});
    console.log('  ✗ 不认识的事件名居然通过了');
  } catch (e) {
    const message = e instanceof Error ? e.message : '';
    assert('不认识的事件名当场抛', e instanceof TypeError, true);
    assert('错误里列出了可选值', message.includes('message'), true);
  }

  // 没开就发要被拒。这条不碰网络：readyState 还是 CONNECTING
  idle.send('too early').then(
    () => { console.log('  ✗ 没开就发居然成功了'); },
    (e) => {
      assert('没开就发被拒', e.name, 'InvalidStateError');
      idle.close();
      assert('close 之后是 CLOSING', idle.readyState, WebSocket.CLOSING);
    },
  );

  // ---- 真的连一条 ----
  const ws = new WebSocket('wss://echo.websocket.org', {
    headers: { 'X-Nacre-Probe': 'a16' },
  });
  /** @type {string[]} */
  const log = [];
  /** @type {any[]} */
  const messages = [];
  ws.addEventListener('open', () => log.push('open'));
  ws.addEventListener('error', (e) => {
    log.push('error');
    console.log('  ! WebSocket 出错：' +
                /** @type {WebSocketErrorEvent} */ (e).message);
  });
  ws.addEventListener('message', (e) => {
    messages.push(/** @type {WebSocketMessageEvent} */ (e).data);
  });
  /** @type {any} */
  let closeEvent = null;
  ws.addEventListener('close', (e) => { closeEvent = e; log.push('close'); });

  const token = 'nacre-' + Date.now();

  /**
   * 等一个条件。到点没等到就报未验证——**但 orElse 还要走**，不然排在
   * 后面的断言会被一个不相干的超时连坐（第一轮就是这么丢掉了 close 那组）。
   * @param {string} what
   * @param {() => boolean} ready
   * @param {() => void} then
   * @param {() => void} [orElse]
   */
  function waitUntil(what, ready, then, orElse) {
    const deadline = Date.now() + 10000;
    const tick = () => {
      if (ready()) { then(); return; }
      if (Date.now() >= deadline) {
        console.log('  ! 10 秒内没等到「' + what + '」（公开 echo 服务可能不可用），' +
                    '这一条未验证');
        if (orElse) orElse();
        return;
      }
      setTimeout(tick, 150);
    };
    setTimeout(tick, 150);
  }

  waitUntil('连上', () => log.includes('open') || log.includes('error'), () => {
    if (!log.includes('open')) {
      console.log('  ! 没连上，后面这一组未验证');
      return;
    }
    assert('连上之后是 OPEN', ws.readyState, WebSocket.OPEN);

    ws.send(token).then(() => {
      waitUntil('文本回声', () => messages.some((m) => String(m).includes(token)), () => {
        assert('文本消息回来了', messages.some((m) => String(m).includes(token)), true);
        assert('文本消息是字符串', typeof messages.find(
            (m) => String(m).includes(token)), 'string');

        // 二进制：发一个 Blob，回来的也该是 Blob。
        //
        // **发得出去是我们的事，回不回来是服务端的事**——公开 echo 服务
        // 不一定支持二进制帧，所以回声这条等不到就报未验证，后面照走
        // 直接发 TypedArray，不用自己包 Blob——JS 侧替你包
        const bytes = new Uint8Array([1, 2, 3, 4, 5]);
        ws.send(bytes).then(
          () => { assert('二进制发得出去', true, true); afterBinarySent(); },
          (e) => { console.log('  ! 二进制发不出去：' + e.message); afterBinarySent(); },
        );

        function afterBinarySent() {
          waitUntil('二进制回声', () => messages.some((m) => m instanceof Blob), () => {
            const blob = /** @type {Blob} */ (messages.find((m) => m instanceof Blob));
            assert('二进制消息回来了是 Blob', blob instanceof Blob, true);
            assert('二进制消息的长度对', blob.size, 5);
            afterBinary();
          }, () => {
            console.log('  实测：这一刻收到的消息 = [' +
                        messages.map((m) => (m instanceof Blob ? 'Blob(' + m.size + ')'
                                                               : typeof m)) + ']');
            afterBinary();
          });
        }

        function afterBinary() {
          // ping：协议级，不需要服务端应用配合
          ws.ping().then(
            (ok) => { assert('ping 拿到 pong', ok, true); finish(); },
            (e) => {
              console.log('  ! ping 失败（服务端可能不回 pong）：' + e.message);
              finish();
            },
          );
        }
      });
    });
  });

  function finish() {
    // 连接已经断了就没有「干净关闭」可言——那时 close 早就发过了
    if (log.includes('error')) {
      console.log('  ! 连接中途断了（服务端掐的），干净关闭这一组未验证');
      assert('断开也会发 close 事件', log.includes('close'), true);
      assert('断开后是 CLOSED', ws.readyState, WebSocket.CLOSED);
      // 1006 是 RFC 6455 规定的「异常关闭」，只能由端自己生成
      assert('异常断开的关闭码是 1006', closeEvent.code, 1006);
      assert('异常断开不是干净关闭', closeEvent.wasClean, false);
      console.log('--- WebSocket：以上异步断言跑完 ---');
      return;
    }
    ws.close(1000, 'bye');
    assert('close 之后是 CLOSING', ws.readyState, WebSocket.CLOSING);
    waitUntil('关闭事件', () => closeEvent !== null, () => {
      assert('收到 close 事件', log.includes('close'), true);
      assert('关完是 CLOSED', ws.readyState, WebSocket.CLOSED);
      assert('关闭码是我们给的', closeEvent.code, 1000);
      assert('是干净关闭', closeEvent.wasClean, true);
      console.log('--- WebSocket：以上异步断言跑完 ---');
    });
  }
}
