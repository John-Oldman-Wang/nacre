// UINavigationController：页面栈、导航级事件、关系属性。
//
// 它放在**第二个窗口**里，占屏幕中间一条空带——这样不动前面那些步骤的
// 布局，又能真的点进去再返回。窗口只设 isHidden = false 不调
// makeKeyAndVisible：可见就能收触摸，没必要把 key 从主窗口抢走。

/** @param {import("../main.js").StepContext} ctx */
export function stepNavigation(ctx) {
  const { assert, vc, scene } = ctx;

  console.log('--- UINavigationController ---');

  // ---- 空栈的默认值 ----
  const empty = new UINavigationController();
  assert('是 UIViewController 的子类', empty instanceof UIViewController, true);
  assert('空栈没有页面', empty.viewControllers.length, 0);
  assert('空栈没有栈顶', empty.topViewController, null);
  assert('默认导航条不藏', empty.isNavigationBarHidden, false);

  // ---- 带根页面构造 ----
  const home = new UIViewController();
  home.title = '首页';
  home.view.backgroundColor = UIColor.systemTealColor;
  assert('title 读回来', home.title, '首页');
  assert('还没进栈时 navigationController 是 null', home.navigationController, null);

  const nav = new UINavigationController(home);
  assert('构造参数进了栈', nav.viewControllers.length, 1);
  assert('栈顶就是它', nav.topViewController === home, true);
  assert('包装身份一致', nav.viewControllers[0] === home, true);
  assert('visibleViewController 同栈顶', nav.visibleViewController === home, true);
  // ObjC 侧这是 weak 回边，JS 侧翻成 strong
  assert('回边：页面能找回导航控制器', home.navigationController === nav, true);
  assert('parentViewController 也是它', home.parentViewController === nav, true);

  // ---- 事件 ----
  /** @type {string[]} */
  const navLog = [];
  /** @type {(UIViewController | null)[]} */
  const shown = [];
  for (const type of ['willshow', 'didshow']) {
    nav.addEventListener(type, (e) => {
      navLog.push(e.type);
      // 事件带数据：「哪个页面」在 willshow 那一刻从 nav 上读不到
      shown.push(/** @type {any} */ (e).viewController);
    });
  }

  // ---- 上屏：第二个窗口，占中间那条空带 ----
  // 右上角那块是空的：色块占 x 40-240 / y 120-290，标题在 y 75 上下，
  // 滚动列表从 y 376 起。实测 UIKit 认自定义 frame，不会把窗口撑满屏幕
  const navWindow = new UIWindow(scene);
  navWindow.frame = new CGRect(248, 130, 156, 150);
  navWindow.rootViewController = nav;
  navWindow.isHidden = false;
  ctx.navWindow = navWindow;
  assert('第二个窗口的自定义 frame 被 UIKit 认了', navWindow.frame.width, 156);

  // ---- push / pop ----
  const detail = new UIViewController();
  detail.title = '详情';
  detail.view.backgroundColor = UIColor.systemIndigoColor;
  nav.pushViewController(detail, { animated: false });
  assert('push 之后栈深 2', nav.viewControllers.length, 2);
  assert('栈顶换成了详情', nav.topViewController === detail, true);
  assert('详情也能找回导航控制器', detail.navigationController === nav, true);

  const popped = nav.popViewController({ animated: false });
  assert('pop 返回被弹出的那一个', popped === detail, true);
  assert('pop 之后栈深 1', nav.viewControllers.length, 1);
  assert('弹出来的页面不再属于导航', detail.navigationController, null);

  // 栈底弹不动
  assert('栈底弹不动，返回 null', nav.popViewController({ animated: false }), null);
  assert('栈还是 1 深', nav.viewControllers.length, 1);

  // ---- popToRoot 一次弹掉好几个 ----
  const a = new UIViewController();
  const b = new UIViewController();
  a.title = 'A';
  b.title = 'B';
  nav.pushViewController(a, { animated: false });
  nav.pushViewController(b, { animated: false });
  assert('连压两个，栈深 3', nav.viewControllers.length, 3);
  const batch = nav.popToRootViewController({ animated: false });
  assert('popToRoot 一次弹掉两个', batch.length, 2);
  assert('弹出的顺序是栈底在前', batch[0] === a && batch[1] === b, true);
  assert('只剩根页面', nav.topViewController === home, true);

  // ---- popToViewController ----
  nav.setViewControllers([home, a, b], { animated: false });
  assert('整栈替换', nav.viewControllers.length, 3);
  const toA = nav.popToViewController(a, { animated: false });
  assert('弹到 A 在栈顶', nav.topViewController === a, true);
  assert('只弹掉了 B', toA.length === 1 && toA[0] === b, true);

  // ---- viewControllers 是可写属性（这一步新开的那条通道）----
  nav.viewControllers = [home, detail];
  assert('属性赋值也能换栈', nav.viewControllers.length, 2);
  assert('赋值后的栈顶', nav.topViewController === detail, true);
  nav.viewControllers = [home];
  assert('缩回一页', nav.viewControllers.length, 1);

  // ---- 导航条 ----
  nav.isNavigationBarHidden = true;
  assert('藏起来了', nav.isNavigationBarHidden, true);
  nav.setNavigationBarHidden(false, { animated: false });
  assert('带动画地显回来', nav.isNavigationBarHidden, false);

  // ---- 写错要抛，不静默 ----
  try {
    // @ts-expect-error 不是 UIViewController
    nav.pushViewController(UIColor.redColor, { animated: false });
    console.log('  ✗ 压一个颜色进去居然通过了');
  } catch (err) {
    console.log('  ✓ 压非 UIViewController 被拒:', err.message.slice(0, 44) + '…');
  }
  try {
    // @ts-expect-error 同上
    nav.viewControllers = [home, UIColor.redColor];
    console.log('  ✗ 栈里塞颜色居然通过了');
  } catch (err) {
    console.log('  ✓ 栈里塞非 UIViewController 被拒:', err.message.slice(0, 44) + '…');
  }
  assert('被拒之后栈没被改坏', nav.viewControllers.length, 1);
  try {
    // 类型上放行（和 window 的事件名一样留了 string 口子），运行时拦
    nav.addEventListener('viewdidappear', () => {});
    console.log('  ✗ 不认识的事件名居然通过了');
  } catch (err) {
    console.log('  ✓ 不认识的事件名被拒:', err.message.slice(0, 48) + '…');
  }

  // ---- 事件到了没有：延后一轮，所以要等 ----
  // 真实返回用：每次页面显示都报一次，这样点返回看得见
  nav.addEventListener('didshow', (e) => {
    const page = /** @type {any} */ (e).viewController;
    console.log('  ✓ didshow：现在显示「' + (page && page.title) + '」，栈深 '
                + nav.viewControllers.length);
  });

  // ---- GC 回归的现场：push 完丢掉 JS 引用，包装得活着 ----
  // 只负责制造现场，断言在 ownership 那一步做——那边已经有「对照组证明 GC
  // 真跑过」的那一套，不重复一遍。必须同步做完：ownership 是紧接着这一步
  // 同步调用的，ctx.nav 放在异步回调里它就拿不到
  (() => {
    const ghost = new UIViewController();
    ghost.title = '幽灵页';
    ghost.view.backgroundColor = UIColor.systemOrangeColor;
    /** @type {any} */ (ghost).probe = '挂在包装上的 JS 状态';
    ghost.addEventListener('nav-probe', () => {});
    nav.pushViewController(ghost, { animated: false });
  })();   // ← ghost 出作用域，JS 这边不再引用
  ctx.nav = nav;
  console.log('  ✓ 导航已上屏（屏幕中间那条），栈顶是「幽灵页」，等着被 GC 考验');

  /** @param {number} left */
  function waitForNavEvents(left) {
    if (navLog.length < 2 && left > 0) {
      setTimeout(() => waitForNavEvents(left - 1), 10);
      return;
    }
    assert('收到了 willshow 和 didshow', navLog.slice(0, 2).join(','),
           'willshow,didshow');
    assert('事件带着「哪个页面」', shown[0] instanceof UIViewController, true);

    console.log('  ✓ 导航事件走通了');
  }
  waitForNavEvents(60);
}
