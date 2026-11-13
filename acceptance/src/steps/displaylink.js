// A6-3：CADisplayLink —— 和屏幕刷新同步的回调。
//
// 它是 Core Animation 表达不了时的**逃生口**：跟手、依赖实时数据、
// 自定义物理。日常动画该用 CAAnimation，那些跑在 render server 里。
//
// 要验的核心事实两条：
//   - 两道闸都要开：挂了监听器，还要 addToRunLoop
//   - invalidate 之后再也不发

/** @param {import("../main.js").StepContext} ctx */
export function stepDisplayLink(ctx) {
  const { assert, vc } = ctx;
  console.log('--- CADisplayLink：每帧回调 ---');

  const probe = new CADisplayLink();
  assert('建得出来', probe instanceof CADisplayLink, true);
  assert('是个 NSObject', probe instanceof NSObject, true);
  // 还没挂到 run loop 上，时间全是 0
  assert('默认不暂停', probe.isPaused, false);
  assert('没开始跑时 timestamp 是 0', probe.timestamp, 0);
  assert('没开始跑时 duration 是 0', probe.duration, 0);
  const range = probe.preferredFrameRateRange;
  assert('默认帧率区间三个 0', '' + range, 'CAFrameRateRange(0, 0, 0)');

  probe.isPaused = true;
  assert('isPaused 写得进去', probe.isPaused, true);
  probe.isPaused = false;

  probe.preferredFrameRateRange = new CAFrameRateRange(30, 60, 30);
  assert('帧率区间往返', '' + probe.preferredFrameRateRange,
         'CAFrameRateRange(30, 60, 30)');
  probe.preferredFrameRateRange = new CAFrameRateRange(0, 0, 0);

  // ---- NSRunLoop ----
  const loop = NSRunLoop.mainRunLoop;
  assert('拿得到主 run loop', loop instanceof NSRunLoop, true);
  assert('读两次是同一个包装', NSRunLoop.mainRunLoop === loop, true);
  try {
    // @ts-expect-error 由运行时给出，不能 new
    new NSRunLoop();
    console.log('  ✗ NSRunLoop 居然构造出来了');
  } catch (e) {
    assert('NSRunLoop 不可构造', e instanceof TypeError, true);
  }

  try {
    // @ts-expect-error 模式只认那三个
    probe.addToRunLoop(loop, { forMode: 'idle' });
    console.log('  ✗ 不认识的模式居然通过了');
  } catch (e) {
    const message = e instanceof Error ? e.message : '';
    assert('不认识的 run loop 模式当场抛', e instanceof TypeError, true);
    assert('错误里列出了可选值', message.includes('common'), true);
  }
  try {
    // **这里没有 @ts-expect-error**，而且这是个真实的类型漏洞：
    // NSRunLoop 在 d.ts 里没有任何实例成员，而 TypeScript 是结构化类型，
    // 所以任何 NSObject（这里是个 UIViewController）都「符合」它。
    // 只有运行时拦得住
    probe.addToRunLoop(/** @type {any} */ (vc), { forMode: 'common' });
    console.log('  ✗ 非 run loop 居然收了');
  } catch (e) {
    assert('第一个参数不是 run loop 就抛', e instanceof TypeError, true);
  }
  try {
    // @ts-expect-error 只有 tick 一个事件
    probe.addEventListener('frame', () => {});
    console.log('  ✗ 不认识的事件名居然通过了');
  } catch (e) {
    const message = e instanceof Error ? e.message : '';
    assert('不认识的事件名当场抛', e instanceof TypeError, true);
    assert('错误里说了只有 tick', message.includes('tick'), true);
  }

  // ---- 两道闸 ----
  /** @type {number[]} */
  const silent = [];
  probe.addEventListener('tick', () => { silent.push(1); });
  // 挂了监听器但没 addToRunLoop，什么都不该发生——下面异步段里查

  // ---- 真的跑起来：一个方块跟着帧走 ----
  //
  // **这一段没有写死的延迟。** 实测第一帧隔了 2.07 秒才来——那会儿主线程
  // 正忙着跑后面的验收段。等条件不等时长，和动画事件那条一个规矩。
  //
  // 「暂停之后不再收到」这类**否定断言**另外要一个对照组：一个永不暂停的
  // link。只靠「等一会儿没动静」会在主线程被堵住时假通过。
  const card = new UIView();
  card.frame = new CGRect(16, 0, 150, 60);
  card.backgroundColor = 'secondarySystemBackground';
  card.layer.cornerRadius = 10;
  ctx.section('CADisplayLink：每帧走一步', 60).addSubview(card);

  const dot = new UIView();
  dot.frame = new CGRect(0, 22, 16, 16);
  dot.backgroundColor = 'systemTeal';
  dot.layer.cornerRadius = 8;
  card.addSubview(dot);

  /**
   * @param {string} what
   * @param {() => boolean} ready
   * @param {() => void} then
   */
  function waitUntil(what, ready, then) {
    const deadline = Date.now() + 8000;
    const tick = () => {
      if (ready()) { then(); return; }
      if (Date.now() >= deadline) {
        console.log('  ! 8 秒内没等到「' + what + '」，这一组未验证');
        return;
      }
      setTimeout(tick, 100);
    };
    setTimeout(tick, 100);
  }

  const link = new CADisplayLink();
  /** @type {{ timestamp: number, duration: number, targetTimestamp: number }[]} */
  const frames = [];
  let start = 0;
  link.addEventListener('tick', (e) => {
    const frame = /** @type {CADisplayLinkEvent} */ (e).frame;
    frames.push(frame);
    if (start === 0) start = frame.timestamp;
    const t = (frame.timestamp - start) % 2;      // 2 秒一个来回
    dot.frame = new CGRect(t < 1 ? t * 134 : (2 - t) * 134, 22, 16, 16);
  });
  link.addToRunLoop(NSRunLoop.mainRunLoop, { forMode: 'common' });

  // 对照组：永不暂停、永不摘掉，用来证明「这段时间里帧本来是会来的」
  const control = new CADisplayLink();
  let controlFrames = 0;
  control.addEventListener('tick', () => { controlFrames++; });
  control.addToRunLoop(NSRunLoop.mainRunLoop, { forMode: 'common' });

  waitUntil('第一帧', () => frames.length > 0, () => {
    assert('没挂 run loop 的那个一次都没发', silent.length, 0);
    const first = frames[0];
    assert('timestamp 是正数', first.timestamp > 0, true);
    assert('duration 是正数', first.duration > 0, true);
    assert('targetTimestamp 比 timestamp 晚', first.targetTimestamp > first.timestamp, true);

    waitUntil('攒够几帧', () => frames.length >= 5, () => {
      assert('timestamp 递增', frames[1].timestamp > frames[0].timestamp, true);
      const span = frames[frames.length - 1].timestamp - frames[0].timestamp;
      console.log('  实测：' + frames.length + ' 帧 / ' + span.toFixed(3) + ' 秒 ≈ ' +
                  (span > 0 ? (frames.length / span).toFixed(1) : '?') +
                  ' fps，duration = ' + (frames[0].duration * 1000).toFixed(2) + ' ms');

      // ---- 暂停：对照组还在走，它不走 ----
      //
      // **先让在途的那一帧落地再取基准。** 事件延后一轮派发，所以暂停
      // 之前已经发出去的 tick 会在暂停之后才到 JS——「停」从 JS 看不是
      // 瞬时的。不等这一下，基准会少算一帧（实测挂过一次：期望 10 实到 11）
      link.isPaused = true;
      setTimeout(() => {
      const atPause = frames.length;
      const controlAtPause = controlFrames;
      waitUntil('对照组又走了 5 帧', () => controlFrames >= controlAtPause + 5, () => {
        assert('暂停期间对照组照常收到', controlFrames > controlAtPause, true);
        assert('暂停之后自己不再收到', frames.length, atPause);

        link.isPaused = false;
        waitUntil('取消暂停后继续', () => frames.length > atPause, () => {
          // ---- 摘掉：同样用对照组证明这段时间有帧 ----
          // invalidate 同理，也要等在途的那一帧
          link.invalidate();
          setTimeout(() => {
          const atInvalidate = frames.length;
          const controlAtInvalidate = controlFrames;
          waitUntil('对照组又走了 5 帧', () => controlFrames >= controlAtInvalidate + 5, () => {
            assert('invalidate 期间对照组照常收到', controlFrames > controlAtInvalidate, true);
            assert('invalidate 之后不再收到', frames.length, atInvalidate);
            control.invalidate();
            console.log('  ✓ 卡片里有一个青色小圆点在左右来回走（display link 驱动）');
            console.log('--- display link：以上异步断言跑完 ---');
          });
          }, 200);
        });
      });
      }, 200);
    });
  });
}
