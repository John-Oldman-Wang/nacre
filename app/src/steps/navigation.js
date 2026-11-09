// UINavigationController：页面栈、导航级事件、关系属性。
//
// 分两半：
//   - 栈的机制用一个**不上屏**的导航控制器验，不干扰界面
//   - 真正的多页面 demo 把现有的全部内容包成第一页，再用 src/router.js
//     那个用户侧的路由器往里跳

import { createRouter } from '../router.js';
import { makePage } from '../pages.js';

/** @param {import("../main.js").StepContext} ctx */
export function stepNavigation(ctx) {
  const { assert, vc, win } = ctx;

  console.log('--- UINavigationController ---');

  // ================= 一、栈的机制（不上屏） =================
  const empty = new UINavigationController();
  assert('是 UIViewController 的子类', empty instanceof UIViewController, true);
  assert('空栈没有页面', empty.viewControllers.length, 0);
  assert('空栈没有栈顶', empty.topViewController, null);
  assert('默认导航条不藏', empty.isNavigationBarHidden, false);

  const home = new UIViewController();
  home.title = '首页';
  assert('title 读回来', home.title, '首页');
  assert('还没进栈时 navigationController 是 null', home.navigationController, null);

  const probe = new UINavigationController(home);
  assert('构造参数进了栈', probe.viewControllers.length, 1);
  assert('栈顶就是它', probe.topViewController === home, true);
  assert('包装身份一致', probe.viewControllers[0] === home, true);
  assert('visibleViewController 同栈顶', probe.visibleViewController === home, true);
  // ObjC 侧这是 weak 回边，JS 侧翻成 strong
  assert('回边：页面能找回导航控制器', home.navigationController === probe, true);
  assert('parentViewController 也是它', home.parentViewController === probe, true);

  const detail = new UIViewController();
  detail.title = '详情';
  probe.pushViewController(detail, { animated: false });
  assert('push 之后栈深 2', probe.viewControllers.length, 2);
  assert('栈顶换成了详情', probe.topViewController === detail, true);
  assert('详情也能找回导航控制器', detail.navigationController === probe, true);

  const popped = probe.popViewController({ animated: false });
  assert('pop 返回被弹出的那一个', popped === detail, true);
  assert('pop 之后栈深 1', probe.viewControllers.length, 1);
  assert('弹出来的页面不再属于导航', detail.navigationController, null);
  assert('栈底弹不动，返回 null', probe.popViewController({ animated: false }), null);
  assert('栈还是 1 深', probe.viewControllers.length, 1);

  const a = new UIViewController();
  const b = new UIViewController();
  a.title = 'A';
  b.title = 'B';
  probe.pushViewController(a, { animated: false });
  probe.pushViewController(b, { animated: false });
  assert('连压两个，栈深 3', probe.viewControllers.length, 3);
  const batch = probe.popToRootViewController({ animated: false });
  assert('popToRoot 一次弹掉两个', batch.length, 2);
  assert('弹出的顺序是栈底在前', batch[0] === a && batch[1] === b, true);
  assert('只剩根页面', probe.topViewController === home, true);

  probe.setViewControllers([home, a, b], { animated: false });
  assert('整栈替换', probe.viewControllers.length, 3);
  const toA = probe.popToViewController(a, { animated: false });
  assert('弹到 A 在栈顶', probe.topViewController === a, true);
  assert('只弹掉了 B', toA.length === 1 && toA[0] === b, true);

  // 这一步新开的那条通道：可写的对象数组属性
  probe.viewControllers = [home, detail];
  assert('属性赋值也能换栈', probe.viewControllers.length, 2);
  assert('赋值后的栈顶', probe.topViewController === detail, true);
  probe.viewControllers = [home];
  assert('缩回一页', probe.viewControllers.length, 1);

  probe.isNavigationBarHidden = true;
  assert('藏起来了', probe.isNavigationBarHidden, true);
  probe.setNavigationBarHidden(false, { animated: false });
  assert('带动画地显回来', probe.isNavigationBarHidden, false);

  // ---- 写错要抛，不静默 ----
  try {
    // @ts-expect-error 不是 UIViewController
    probe.pushViewController(UIColor.redColor, { animated: false });
    console.log('  ✗ 压一个颜色进去居然通过了');
  } catch (err) {
    console.log('  ✓ 压非 UIViewController 被拒:', err.message.slice(0, 44) + '…');
  }
  try {
    // @ts-expect-error 同上
    probe.viewControllers = [home, UIColor.redColor];
    console.log('  ✗ 栈里塞颜色居然通过了');
  } catch (err) {
    console.log('  ✓ 栈里塞非 UIViewController 被拒:', err.message.slice(0, 44) + '…');
  }
  assert('被拒之后栈没被改坏', probe.viewControllers.length, 1);
  try {
    // 类型上放行（和 window 的事件名一样留了 string 口子），运行时拦
    probe.addEventListener('viewdidappear', () => {});
    console.log('  ✗ 不认识的事件名居然通过了');
  } catch (err) {
    console.log('  ✓ 不认识的事件名被拒:', err.message.slice(0, 48) + '…');
  }

  // ---- GC 回归的现场：push 完丢掉 JS 引用，包装得活着 ----
  // 断言在 ownership 那一步做——那边有「对照组证明 GC 真跑过」的那一套。
  // 必须同步做完：ownership 是紧接着同步调用的
  (() => {
    const ghost = new UIViewController();
    ghost.title = '幽灵页';
    /** @type {any} */ (ghost).probe = '挂在包装上的 JS 状态';
    ghost.addEventListener('nav-probe', () => {});
    probe.pushViewController(ghost, { animated: false });
  })();   // ← ghost 出作用域，JS 这边不再引用
  ctx.nav = probe;

  // ================= 二、多页面 demo =================
  //
  // 把现有的全部验收内容（色块、文字、滚动列表…）原样当第一页，外面套一层
  // 导航控制器。第一页藏导航条，所以上面那十几步的布局一个像素都不动。
  // 这条坑留个回归。此刻 vc 正当着窗口的根，UIKit 不让它同时当别人的子控制器
  try {
    new UINavigationController(vc);
    console.log('  ✗ 把正当窗口根的 VC 塞进导航控制器居然通过了');
  } catch (err) {
    console.log('  ✓ 把正当窗口根的 VC 塞进导航控制器被拒:', err.message.slice(0, 52) + '…');
  }

  // 顺序有讲究：**不能**直接 new UINavigationController(vc)。vc 这会儿正当着
  // 窗口的根，UIKit 会抛 UIViewControllerHierarchyInconsistency——
  // 「adding a root view controller as a child of view controller」。
  // 先让空的导航控制器接管窗口，vc 就不再是根了，这时再把它压进去。
  // （这两步在同一轮 JS 里跑完，中间不会渲染出一帧空白）
  const nav = new UINavigationController();
  nav.isNavigationBarHidden = true;
  win.rootViewController = nav;
  nav.pushViewController(vc, { animated: false });
  assert('窗口的根换成了导航控制器', win.rootViewController === nav, true);
  assert('原来那个根页面成了第一页', nav.topViewController === vc, true);
  assert('第一页也能找回导航控制器', vc.navigationController === nav, true);

  // 第一页藏导航条、其余页显——用 willshow 做，这正是这一步新增的那个事件
  nav.addEventListener('willshow', (e) => {
    const page = /** @type {any} */ (e).viewController;
    nav.setNavigationBarHidden(page === vc, { animated: true });
  });

  /** @type {ReturnType<typeof createRouter>} */
  let router;
  router = createRouter(nav, {
    '/': () => vc,
    '/list': () => makePage({
      title: '列表',
      color: UIColor.systemIndigoColor,
      heading: '这是第二页\n（列表）',
      buttons: [
        ['打开 #1', () => router.push('/detail/1')],
        ['打开 #2', () => router.push('/detail/2')],
        ['回首页', () => router.home()],
      ],
    }),
    '/detail/:id': (params) => makePage({
      title: '详情 ' + params.id,
      color: UIColor.systemPinkColor,
      heading: '这是第三页\n详情 #' + params.id,
      buttons: [
        ['返回上一页', () => router.back()],
        ['回首页', () => router.home()],
      ],
    }),
  }, '/');

  router.onChange((path, depth) => {
    console.log('  ✓ 路由变了 → ' + path + '（栈深 ' + depth + '）');
  });

  // 第一页上的入口按钮。右上角那块是空的：色块占 x 40-240 / y 120-290，
  // 标题在 y 75 上下，滚动列表从 y 376 起
  const enter = UIButton.buttonWithType('system');
  enter.setTitle('进入路由 →', { forState: ['normal'] });
  enter.backgroundColor = UIColor.systemIndigoColor;
  enter.setTitleColor(UIColor.whiteColor, { forState: ['normal'] });
  enter.layer.cornerRadius = 10;
  enter.frame = new CGRect(250, 300, 150, 44);
  enter.addEventListener('primaryActionTriggered', () => router.push('/list'));
  vc.view.addSubview(enter);

  // ---- 路由本身的几条，不用等上屏 ----
  assert('router 一开始在根上', router.path, '/');
  assert('router 的栈深和原生一致', router.depth, nav.viewControllers.length);
  try {
    router.push('/nope');
    console.log('  ✗ 没登记的路径居然能跳');
  } catch (err) {
    console.log('  ✓ 没登记的路径被拒:', err.message);
  }

  console.log('  ✓ 多页面已上屏：第一页右上角「进入路由 →」，进去能点、能左滑返回');
}
