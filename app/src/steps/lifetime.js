// 对象的生命周期：没有父对象的那几类，由谁拿着、什么时候放开。

import { collectGarbage } from '../support.js';

/** @param {import("../main.js").StepContext} ctx */
export function stepLifetime(ctx) {
  const { assert } = ctx;
  // ===== 没有父对象的三类 =====
  //
  // 视图、手势、页面都挂在某个父对象下面，从 application 一路走得到。下面
  // 这三类没有父对象，系统却会一直让它们活着、给它们发事件：
  //
  //   CADisplayLink   加进 run loop 之后由 run loop 拿着，直到 invalidate
  //   WebSocket       连接没关之前由系统的网络会话拿着
  //   单例            generalPasteboard、mainRunLoop，系统一直拿着
  //
  // JS 侧要有对应的一条持有边，包装才不会在它们还活着的时候被回收重建。
  // **这里故意都不加监听器**：加了监听器的对象另有一条保活的路，会把这几条
  // 边有没有接上盖住。
  (async () => {
    /** @param {number} ms */
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    /** @type {Set<string>} */
    const collected = new Set();
    const registry = new FinalizationRegistry((/** @type {string} */ name) => { collected.add(name); });
    // 每次都现取，不存成局部变量：存了就等于自己拿着它，「单例的包装还是
    // 原来那个」那一条就什么都证明不了
    const main = () => NSRunLoop.mainRunLoop;

    try {
      /** @type {any} */ (UIPasteboard.generalPasteboard).probe = '挂在剪贴板包装上';
      /** @type {any} */ (NSRunLoop.mainRunLoop).probe = '挂在 run loop 包装上';

      // 对照：建了没加进 run loop，谁都不拿着
      (() => { registry.register(new CADisplayLink(), 'idle link'); })();
      // 加进 run loop 之后丢掉引用
      const running = (() => {
        const link = new CADisplayLink();
        registry.register(link, 'running link');
        link.addToRunLoop(main(), { forMode: 'common' });
        return new WeakRef(link);
      })();
      // 加进两个模式，之后一个一个摘
      const twoModes = (() => {
        const link = new CADisplayLink();
        registry.register(link, 'two-mode link');
        link.addToRunLoop(main(), { forMode: 'default' });
        link.addToRunLoop(main(), { forMode: 'tracking' });
        return new WeakRef(link);
      })();
      // 打开着的连接，没有监听器，也没有引用
      const socket = (() => {
        const ws = new WebSocket('wss://echo.websocket.org');
        registry.register(ws, 'open socket');
        return new WeakRef(ws);
      })();
      // 见证：同一个服务连不连得上。连不上的话上面那个会自己关掉，
      // 被回收是对的，那一条就不能算数
      let witnessState = 'connecting';
      const witness = new WebSocket('wss://echo.websocket.org');
      witness.addEventListener('open', () => { witnessState = 'open'; });
      witness.addEventListener('close', () => { witnessState = 'closed'; });
      for (let i = 0; i < 50 && witnessState === 'connecting'; i++) await sleep(100);
      // 现在就记下来：后面会把见证连接关掉，到时候状态就变了
      const reachable = witnessState === 'open';

      const ranOnce = await collectGarbage();
      console.log('--- 生命周期：没有父对象的三类 ---');
      if (!ranOnce) {
        console.log('  ! 对照组没被回收，GC 没跑到，这一组未验证');
        return;
      }
      assert('对照：没进 run loop 的 display link 被回收', collected.has('idle link'), true);
      assert('在 run loop 上的 display link 没被回收', collected.has('running link'), false);
      assert('在两个模式上的 display link 没被回收', collected.has('two-mode link'), false);
      assert('单例 generalPasteboard：GC 后还是原来那个包装',
             /** @type {any} */ (UIPasteboard.generalPasteboard).probe, '挂在剪贴板包装上');
      assert('单例 mainRunLoop：GC 后还是原来那个包装',
             /** @type {any} */ (NSRunLoop.mainRunLoop).probe, '挂在 run loop 包装上');
      if (reachable) {
        assert('打开着的 WebSocket 没被回收', collected.has('open socket'), false);
      } else {
        console.log('  ! 见证连接是 ' + witnessState + '，echo 服务没连上，「打开着的 WebSocket」这一条未验证');
      }

      // --- 放开：失效、摘掉、关闭之后要能被回收 ---
      //
      // WeakRef 只在这里 deref 一次，用完立刻把局部变量清掉——拿着它就等于
      // 自己把对象钉住了
      let link = running.deref();
      if (link !== undefined) link.invalidate();
      link = undefined;

      let both = twoModes.deref();
      if (both !== undefined) both.removeFromRunLoop(main(), { forMode: 'default' });
      both = undefined;
      await collectGarbage();
      assert('两个模式摘掉一个：还在另一个上，没被回收', collected.has('two-mode link'), false);
      both = twoModes.deref();
      if (both !== undefined) both.removeFromRunLoop(main(), { forMode: 'tracking' });
      both = undefined;

      let ws = socket.deref();
      if (ws !== undefined) {
        ws.close();
        for (let i = 0; i < 50 && ws.readyState !== WebSocket.CLOSED; i++) await sleep(100);
      }
      ws = undefined;
      witness.close();

      const ranTwice = await collectGarbage();
      if (!ranTwice) {
        console.log('  ! 第二轮 GC 没跑到，「放开」这几条未验证');
        return;
      }
      assert('invalidate 之后的 display link 被回收', collected.has('running link'), true);
      assert('两个模式都摘掉之后被回收', collected.has('two-mode link'), true);
      if (reachable) {
        assert('关闭之后的 WebSocket 被回收', collected.has('open socket'), true);
      }
    } catch (err) {
      console.log('  ✗ 「生命周期」用例整体出错:', err && /** @type {Error} */ (err).message);
    } finally {
      console.log('--- 生命周期：以上断言跑完 ---');
    }
  })();
}
