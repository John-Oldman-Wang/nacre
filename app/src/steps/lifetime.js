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
      // 它得真的连上才算数。公开的 echo 服务会拒掉一部分握手（实测：同一轮
      // 里另一条连上了，这一条收到 bad response），被拒的连接自己关掉、
      // 被回收，是对的。这里轮询会把它拿住，所以每次查完立刻清掉
      let socketOpened = false;
      for (let i = 0; i < 80; i++) {
        let peek = socket.deref();
        const state = peek === undefined ? WebSocket.CLOSED : peek.readyState;
        peek = undefined;
        if (state === WebSocket.OPEN) { socketOpened = true; break; }
        if (state === WebSocket.CLOSED) break;
        await sleep(100);
      }
      const reachable = socketOpened;

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
        console.log('  ! 被测的连接没连上（公开的 echo 服务拒了这次握手），' +
                    '「打开着的 WebSocket」这两条未验证');
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

  // ===== 加监听器不改变对象的寿命 =====
  //
  // 原来的做法：对象一加监听器就进一个全局的强引用集合，监听器全部移走才
  // 出来。于是从界面上摘下来的按钮、被弹出导航栈的页面上的按钮，只要加过
  // 监听器又没人逐个移除，就永远不会被回收，连同回调捕获的东西一起。
  //
  // 现在对象活不活只看一件事：从 application 出发走不走得到它。在树上就
  // 活着，监听器也在；不在树上、JS 里又没人拿着，就被回收。和 Web 一样。
  const listenerHost = ctx.section('生命周期（点右边的按钮，先点返回、再把卡片拖走）', 44);

  // ===== 系统自己动了持有关系（要真实触摸）=====
  //
  // 用户点导航条的返回、把模态页向下拖走，都是手指直接作用在 UIKit 上，JS
  // 没有调任何方法。运行时要自己知道这两件事，把「导航栈持有页面」「呈现者
  // 持有被呈现的页面」这两条边及时放开，不然离开的页面一直被拿着。
  //
  // 探针里**一个监听器都没有**，所以 JS 这边收不到任何通知，只能定时逼 GC
  // 看结果。有监听器的话（比如 router 监听 didshow 时会去读栈），那一读
  // 就把边修好了，测不出运行时自己有没有跟上。
  /**
   * @param {string} title
   * @param {string} text
   */
  const plainPage = (title, text) => {
    const page = new UIViewController();
    page.title = title;
    page.view.backgroundColor = 'systemBackground';
    const label = new UILabel();
    label.text = text;
    label.numberOfLines = 0;
    label.textAlignment = 'center';
    label.frame = new CGRect(24, 120, 320, 120);
    page.view.addSubview(label);
    return page;
  };
  const openProbe = UIButton.buttonWithType('system');
  openProbe.setTitle('系统返回 / 拖走探针 ↑', { forState: ['normal'] });
  openProbe.backgroundColor = UIColor.systemTealColor;
  openProbe.setTitleColor(UIColor.whiteColor, { forState: ['normal'] });
  openProbe.layer.cornerRadius = 10;
  openProbe.frame = new CGRect(76, 0, 220, 44);
  listenerHost.addSubview(openProbe);
  openProbe.addEventListener('primaryActionTriggered', () => {
    /** @type {Set<string>} */
    const alive = new Set();
    // 每条都带上「弹出后第几秒」。第二页和另外两个要隔开几秒被回收，才说明
    // 点返回那一下自己就放开了第二页；三个挤在同一秒，说明只是卡片被拖走了
    const openedAt = performance.now();
    const probeRegistry = new FinalizationRegistry((/** @type {string} */ label) => {
      alive.delete(label);
      console.log('  ✓ 真实触摸：' + label + '被回收了（弹出后第 ' +
                  Math.round((performance.now() - openedAt) / 1000) + ' 秒）');
    });
    // 建完就不留引用：之后它们只被原生和运行时的持有边拿着
    (() => {
      const first = plainPage('第一页', '第 2 步：等十秒左右，\n再把这张卡片向下拖走');
      const second = plainPage('第二页', '第 1 步：点左上角的「第一页」返回');
      const sheetNav = new UINavigationController(first);
      sheetNav.pushViewController(second, { animated: false });
      sheetNav.modalPresentationStyle = 'pageSheet';
      /** @type {[object, string][]} */
      const tracked = [
        [second, '被系统返回弹出的第二页'],
        [first, '被拖走的导航控制器里的第一页'],
        [sheetNav, '被拖走的导航控制器'],
      ];
      for (const [target, label] of tracked) {
        alive.add(label);
        probeRegistry.register(target, label);
      }
      ctx.vc.presentViewController(sheetNav, { animated: true });
    })();
    console.log('  探针已弹出：先点返回，等日志里出现「第二页被回收了」，再把卡片拖走');
    let rounds = 0;
    const watch = async () => {
      await collectGarbage(4000);
      rounds++;
      if (alive.size === 0) {
        console.log('  ✓ 真实触摸：探针的三个对象都被回收了，系统返回和拖走之后持有边都放开了');
        return;
      }
      if (rounds >= 18) {
        console.log('  ✗ 真实触摸：90 秒了还没被回收：' + [...alive].join('、'));
        return;
      }
      setTimeout(watch, 1500);
    };
    setTimeout(watch, 3000);
  });
  (async () => {
    /** @param {number} ms */
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    /** @type {Set<string>} */
    const collected = new Set();
    const registry = new FinalizationRegistry((/** @type {string} */ name) => { collected.add(name); });
    const noop = () => {};

    try {
      // --- 在树上：丢掉 JS 引用，监听器必须还在 ---
      let taps = 0;
      (() => {
        const control = new UIControl();
        control.frame = new CGRect(16, 0, 44, 44);
        control.addEventListener('touchUpInside', () => { taps++; });
        listenerHost.addSubview(control);
        registry.register(control, 'attached control');
      })();

      // --- 不在树上、没人拿着：加过监听器也要被回收 ---
      /** @type {[string, () => EventTarget, string][]} */
      const loose = [
        ['游离的 UIControl', () => new UIControl(), 'touchUpInside'],
        ['游离的 UIScrollView', () => new UIScrollView(), 'scroll'],
        ['游离的手势识别器', () => new UITapGestureRecognizer(), 'ended'],
        ['游离的 UIViewController', () => new UIViewController(), 'diddismiss'],
        ['游离的 UINavigationController', () => new UINavigationController(), 'didshow'],
        ['游离的 UIBarButtonItem', () => new UIBarButtonItem({ title: 'x' }), 'primaryActionTriggered'],
        ['没加进图层的动画', () => new CABasicAnimation(), 'stop'],
        ['没进 run loop 的 display link', () => new CADisplayLink(), 'tick'],
      ];
      for (const [label, make, type] of loose) {
        (() => {
          const target = make();
          target.addEventListener(type, noop);
          registry.register(target, label);
        })();
      }
      // 回调捕获着对象自己：最常见的写法。JS 里的环不妨碍回收
      (() => {
        const control = new UIControl();
        control.addEventListener('touchDown', () => { control.isEnabled = false; });
        registry.register(control, '回调捕获着自己的 UIControl');
      })();
      // 加进去又摘下来
      (() => {
        const control = new UIControl();
        control.addEventListener('touchDown', noop);
        listenerHost.addSubview(control);
        control.removeFromSuperview();
        registry.register(control, '摘下来的 UIControl');
      })();
      // 已经失效的 display link，监听器没移
      (() => {
        const link = new CADisplayLink();
        link.addEventListener('tick', noop);
        link.addToRunLoop(NSRunLoop.mainRunLoop, { forMode: 'common' });
        link.invalidate();
        registry.register(link, '失效之后的 display link（监听器没移）');
      })();

      const ran = await collectGarbage();
      console.log('--- 生命周期：加监听器不改变对象的寿命 ---');
      if (!ran) {
        console.log('  ! 对照组没被回收，GC 没跑到，这一组未验证');
        return;
      }
      for (const [label] of loose) assert(label + '：被回收', collected.has(label), true);
      assert('回调捕获着自己的 UIControl：被回收', collected.has('回调捕获着自己的 UIControl'), true);
      assert('摘下来的 UIControl：被回收', collected.has('摘下来的 UIControl'), true);
      assert('失效之后的 display link（监听器没移）：被回收',
             collected.has('失效之后的 display link（监听器没移）'), true);

      assert('在树上的 UIControl：没被回收', collected.has('attached control'), false);
      // 从父视图把它取回来，走一次真的原生派发
      // 按类型找，不按位置：同一个区块里还有探针那个按钮。实测对 UIButton 发
      // touchUpInside 会连带触发它的 primaryActionTriggered，找错了就把探针弹出来了
      const again = /** @type {UIControl | undefined} */ (
        listenerHost.subviews.find((v) => v instanceof UIControl && !(v instanceof UIButton)));
      if (again === undefined) {
        console.log('  ✗ 在树上的 UIControl 从父视图里找不回来了');
        return;
      }
      again.sendActionsForControlEvents(['touchUpInside']);
      await sleep(300);
      assert('在树上的 UIControl：GC 之后监听器还在，事件照常到', taps, 1);

      // --- 还在栈里的页面不能被回收 ---
      //
      // 和上面探针是同一个结构（卡片里的导航控制器，两页，一个监听器都没有），
      // 但这里不碰它：页面还在屏幕上，三个对象都必须活着。这一条是给真实
      // 触摸那一条垫底的——「点返回之后第二页被回收」只有在「不点就不回收」
      // 成立时才说明问题。
      await sleep(3000);   // 让开模态那一步自己的呈现
      await (() => {
        const first = plainPage('自动断言', '这张卡片会自己关掉');
        const second = plainPage('自动断言', '这张卡片会自己关掉');
        const stack = new UINavigationController(first);
        stack.pushViewController(second, { animated: false });
        stack.modalPresentationStyle = 'pageSheet';
        registry.register(second, '栈顶的页面');
        registry.register(first, '栈底的页面');
        registry.register(stack, '被呈现的导航控制器');
        return ctx.vc.presentViewController(stack, { animated: false });
      })();
      await sleep(800);    // 等 didShow 过去：那一下会按原生的栈重建持有边
      if (!(await collectGarbage())) {
        console.log('  ! GC 没跑到，「还在栈里的页面」这一组未验证');
        return;
      }
      assert('还在屏幕上：栈顶的页面没被回收', collected.has('栈顶的页面'), false);
      assert('还在屏幕上：栈底的页面没被回收', collected.has('栈底的页面'), false);
      assert('还在屏幕上：被呈现的导航控制器没被回收', collected.has('被呈现的导航控制器'), false);
      await ctx.vc.dismissViewController({ animated: false });
      if (!(await collectGarbage())) {
        console.log('  ! GC 没跑到，「关掉之后被回收」这一组未验证');
        return;
      }
      assert('程序关掉之后：栈顶的页面被回收', collected.has('栈顶的页面'), true);
      assert('程序关掉之后：栈底的页面被回收', collected.has('栈底的页面'), true);
      assert('程序关掉之后：被呈现的导航控制器被回收', collected.has('被呈现的导航控制器'), true);
    } catch (err) {
      console.log('  ✗ 「监听器不改变寿命」用例整体出错:', err && /** @type {Error} */ (err).message);
    } finally {
      console.log('--- 生命周期：监听器这一组跑完 ---');
    }
  })();
}
