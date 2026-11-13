// 容器控制器：父子控制器那一组，和 UITabBarController。

import { collectGarbage } from '../support.js';

/** @param {import("../main.js").StepContext} ctx */
export function stepContainers(ctx) {
  const { assert } = ctx;
  /**
   * 调一下，给出抛出来的错误的 name 和 message；没抛就是「没抛」
   * @param {() => void} run
   */
  const thrown = (run) => {
    try { run(); return '没抛'; }
    catch (err) { return /** @type {Error} */ (err).name + ': ' + /** @type {Error} */ (err).message; }
  };

  // ===== 父子控制器 =====
  console.log('--- 父子控制器 ---');
  const parent = new UIViewController();
  const child = new UIViewController();
  assert('一开始没有子控制器', parent.childViewControllers.length, 0);
  assert('一开始没有父控制器', child.parentViewController, null);

  parent.addChildViewController(child);
  parent.view.addSubview(child.view);
  child.didMoveToParentViewController(parent);
  assert('加进去之后 childViewControllers 有一个', parent.childViewControllers.length, 1);
  assert('读回来就是那个对象', parent.childViewControllers[0] === child, true);
  assert('child.parentViewController 是它', child.parentViewController === parent, true);

  // 已经有父控制器的再加给别人：UIKit 会先把它从原来那边摘下来
  const other = new UIViewController();
  other.addChildViewController(child);
  assert('换了父控制器：原来那边没有了', parent.childViewControllers.length, 0);
  assert('换了父控制器：新的那边有了', other.childViewControllers[0] === child, true);

  child.willMoveToParentViewController(null);
  child.view.removeFromSuperview();
  child.removeFromParentViewController();
  assert('移除之后 childViewControllers 空了', other.childViewControllers.length, 0);
  assert('移除之后没有父控制器', child.parentViewController, null);
  assert('没有父控制器时再移除一次不出错', thrown(() => child.removeFromParentViewController()), '没抛');

  // 写错的
  assert('addChildViewController 给的不是页面',
         // @ts-expect-error 要的是 UIViewController
         thrown(() => parent.addChildViewController(UIColor.redColor)),
         'TypeError: addChildViewController needs a UIViewController');
  assert('addChildViewController 给 null',
         // @ts-expect-error 不能是 null
         thrown(() => parent.addChildViewController(null)),
         'TypeError: addChildViewController needs a UIViewController');
  assert('didMoveToParentViewController 给的不是页面',
         // @ts-expect-error 要的是 UIViewController 或 null
         thrown(() => child.didMoveToParentViewController('parent')),
         'TypeError: didMoveToParentViewController needs a UIViewController or null');
  assert('willMoveToParentViewController 可以给 null', thrown(() => child.willMoveToParentViewController(null)), '没抛');
  // 成环的两种。UIKit 自己不拦，照加不误，之后一沿着父链往上找就无限递归、
  // 栈溢出崩掉（实测）。运行时在加之前拦下来
  const cycleError = 'TypeError: addChildViewController: a view controller cannot be added ' +
                     'as a child of itself or of one of its own descendants';
  assert('把自己加成自己的子控制器', thrown(() => parent.addChildViewController(parent)), cycleError);
  const grandchild = new UIViewController();
  parent.addChildViewController(child);
  child.addChildViewController(grandchild);
  assert('把祖先加成子控制器', thrown(() => grandchild.addChildViewController(parent)), cycleError);
  assert('被拒之后原来的关系没动', grandchild.parentViewController === child, true);
  grandchild.removeFromParentViewController();
  child.removeFromParentViewController();

  // additionalSafeAreaInsets：读写往返
  const insets = child.additionalSafeAreaInsets;
  assert('additionalSafeAreaInsets 默认四边都是 0',
         [insets.top, insets.left, insets.bottom, insets.right].join(','), '0,0,0,0');
  child.additionalSafeAreaInsets = new UIEdgeInsets(1, 2, 44, 4);
  const written = child.additionalSafeAreaInsets;
  assert('additionalSafeAreaInsets 写进去读得回来',
         [written.top, written.left, written.bottom, written.right].join(','), '1,2,44,4');
  assert('additionalSafeAreaInsets 读回来的是 UIEdgeInsets', written instanceof UIEdgeInsets, true);
  assert('additionalSafeAreaInsets 给的不是结构体',
         // @ts-expect-error 要的是 UIEdgeInsets
         thrown(() => { child.additionalSafeAreaInsets = 44; }).split(':')[0], 'TypeError');

  // ===== 自己画 tab 条的容器（点下面三个按钮切换）=====
  //
  // 这就是 UITabBarController 在做的事，用父子控制器自己搭一遍：一个壳页面，
  // 里面一次只放一个子页面，底下一排按钮切换。
  const host = ctx.section('父子控制器：自己画的 tab 条（点按钮切换）', 150);
  const shell = new UIViewController();
  ctx.vc.addChildViewController(shell);
  shell.view.translatesAutoresizingMaskIntoConstraints = false;
  shell.view.backgroundColor = 'secondarySystemBackground';
  shell.view.layer.cornerRadius = 12;
  shell.view.clipsToBounds = true;
  host.addSubview(shell.view);
  NSLayoutConstraint.activateConstraints([
    shell.view.leadingAnchor.constraintEqualToAnchor(host.leadingAnchor, { constant: 16 }),
    shell.view.trailingAnchor.constraintEqualToAnchor(host.trailingAnchor, { constant: -16 }),
    shell.view.topAnchor.constraintEqualToAnchor(host.topAnchor),
    shell.view.bottomAnchor.constraintEqualToAnchor(host.bottomAnchor),
  ]);
  shell.didMoveToParentViewController(ctx.vc);

  const barHeight = 44;
  const bar = new UIStackView();
  bar.translatesAutoresizingMaskIntoConstraints = false;
  bar.axis = 'horizontal';
  bar.distribution = 'fillEqually';
  bar.backgroundColor = 'systemBackground';
  shell.view.addSubview(bar);
  NSLayoutConstraint.activateConstraints([
    bar.leadingAnchor.constraintEqualToAnchor(shell.view.leadingAnchor),
    bar.trailingAnchor.constraintEqualToAnchor(shell.view.trailingAnchor),
    bar.bottomAnchor.constraintEqualToAnchor(shell.view.bottomAnchor),
    bar.heightAnchor.constraintEqualToConstant(barHeight),
  ]);

  /** @type {[string, string][]} */
  const specs = [['首页', 'systemIndigo'], ['行情', 'systemTeal'], ['我的', 'systemOrange']];
  const pages = specs.map(([name, color]) => {
    const page = new UIViewController();
    page.view.backgroundColor = color;
    // 壳的 tab 条盖在子页面上面，所以让子页面的安全区底边往上让出一条
    page.additionalSafeAreaInsets = new UIEdgeInsets(0, 0, barHeight, 0);
    const label = new UILabel();
    label.translatesAutoresizingMaskIntoConstraints = false;
    label.text = name + '（这行字贴着安全区的底边）';
    label.textColor = 'white';
    label.font = UIFont.systemFontOfSize(14, { weight: 'semibold' });
    page.view.addSubview(label);
    const safe = page.view.safeAreaLayoutGuide;
    NSLayoutConstraint.activateConstraints([
      label.centerXAnchor.constraintEqualToAnchor(safe.centerXAnchor),
      label.bottomAnchor.constraintEqualToAnchor(safe.bottomAnchor, { constant: -8 }),
    ]);
    return page;
  });

  let current = -1;
  /** @param {number} index */
  const show = (index) => {
    if (index === current) return;
    if (current >= 0) {
      const leaving = pages[current];
      leaving.willMoveToParentViewController(null);
      leaving.view.removeFromSuperview();
      leaving.removeFromParentViewController();
    }
    const entering = pages[index];
    shell.addChildViewController(entering);
    entering.view.translatesAutoresizingMaskIntoConstraints = false;
    shell.view.insertSubview(entering.view, { atIndex: 0 });
    NSLayoutConstraint.activateConstraints([
      entering.view.leadingAnchor.constraintEqualToAnchor(shell.view.leadingAnchor),
      entering.view.trailingAnchor.constraintEqualToAnchor(shell.view.trailingAnchor),
      entering.view.topAnchor.constraintEqualToAnchor(shell.view.topAnchor),
      entering.view.bottomAnchor.constraintEqualToAnchor(shell.view.bottomAnchor),
    ]);
    entering.didMoveToParentViewController(shell);
    current = index;
  };
  specs.forEach(([name], index) => {
    const button = UIButton.buttonWithType('system');
    button.setTitle(name, { forState: ['normal'] });
    button.addEventListener('primaryActionTriggered', () => {
      show(index);
      console.log('  ✓ 真实触摸：自己画的 tab 条切到「' + name + '」，壳里的子控制器 = ' +
                  shell.childViewControllers.length + ' 个');
    });
    bar.addArrangedSubview(button);
  });
  show(0);
  assert('壳是根页面的子控制器', shell.parentViewController === ctx.vc, true);
  assert('壳里一次只有一个子控制器', shell.childViewControllers.length, 1);
  show(1);
  assert('切换之后还是一个', shell.childViewControllers.length, 1);
  assert('切换之后是第二页', shell.childViewControllers[0] === pages[1], true);
  assert('离开的那一页没有父控制器了', pages[0].parentViewController, null);
  show(0);

  // 安全区真的让出来了吗。子页面不贴屏幕边，系统那一份是 0，剩下的就是
  // additionalSafeAreaInsets 自己
  // 实测：页面还没进窗口时 view.safeAreaInsets 是 0，写了 additionalSafeAreaInsets
  // 也读不出来；进了窗口、布局过一轮之后才有。所以等它有了再量——不赌固定
  // 时长：主线程忙的时候一秒不够（实测读到过 0）。
  // 那行字的底边约束在安全区底边上方 8 pt，所以它离页面底边应该是 44 + 8
  const insetDeadline = Date.now() + 6000;
  const measureInset = () => {
    const page = pages[0];
    if (page.view.safeAreaInsets.bottom !== barHeight && Date.now() < insetDeadline) {
      setTimeout(measureInset, 100);
      return;
    }
    const label = page.view.subviews[0];
    assert('additionalSafeAreaInsets 生效：子页面的安全区底边 = 44',
           page.view.safeAreaInsets.bottom, barHeight);
    assert('additionalSafeAreaInsets 生效：贴着安全区的那行字离页面底边 52 pt',
           page.view.bounds.height - label.frame.y - label.frame.height, barHeight + 8);
  };
  setTimeout(measureInset, 300);

  // ===== UITabBarController =====
  console.log('--- UITabBarController ---');
  /** @param {string} title */
  const tabPage = (title) => {
    const page = new UIViewController();
    page.title = title;
    return page;
  };
  const tabs = new UITabBarController();
  assert('一开始没有页面', tabs.viewControllers.length, 0);
  assert('没有页面时 selectedIndex', tabs.selectedIndex, -1);
  assert('没有页面时 selectedViewController', tabs.selectedViewController, null);

  const first = tabPage('甲');
  const second = tabPage('乙');
  const third = tabPage('丙');
  tabs.viewControllers = [first, second, third];
  assert('写进三个页面', tabs.viewControllers.length, 3);
  assert('读回来是同一批对象', tabs.viewControllers[1] === second, true);
  assert('默认选中第 0 个', tabs.selectedIndex, 0);
  assert('selectedViewController 跟着', tabs.selectedViewController === first, true);
  assert('页面的 tabBarController 是它', second.tabBarController === tabs, true);
  assert('页面的 parentViewController 也是它', second.parentViewController === tabs, true);
  assert('不在里面的页面 tabBarController 是 null', tabPage('外').tabBarController, null);

  tabs.selectedIndex = 2;
  assert('写 selectedIndex', tabs.selectedViewController === third, true);
  tabs.selectedViewController = second;
  assert('写 selectedViewController', tabs.selectedIndex, 1);
  assert('selectedIndex 越界',
         thrown(() => { tabs.selectedIndex = 3; }),
         'TypeError: selectedIndex 3 is out of range; there are 3 view controllers');
  assert('selectedIndex 给负数', thrown(() => { tabs.selectedIndex = -1; }).split(' is ')[0],
         'TypeError: selectedIndex -1');
  assert('越界之后原来选中的没变', tabs.selectedIndex, 1);
  assert('selectedViewController 给不在里面的页面',
         thrown(() => { tabs.selectedViewController = tabPage('外'); }),
         "TypeError: selectedViewController must be one of this tab bar controller's viewControllers");
  assert('viewControllers 里混了不是页面的',
         // @ts-expect-error 要的是 UIViewController
         thrown(() => { tabs.viewControllers = [first, UIColor.redColor]; }),
         'TypeError: viewControllers only accepts UIViewController');
  assert('被拒之后页面没变', tabs.viewControllers.length, 3);

  tabs.setViewControllers([first, third], { animated: false });
  assert('setViewControllers 换成两个', tabs.viewControllers.length, 2);
  assert('被换掉的那一页不再属于它', second.tabBarController, null);
  tabs.viewControllers = null;
  assert('写 null 等于清空', tabs.viewControllers.length, 0);
  tabs.viewControllers = [first, second, third];

  // --- 每一格长什么样：页面自己的 tabBarItem ---
  const auto = first.tabBarItem;
  assert('不设也有一个 tabBarItem', auto instanceof UITabBarItem, true);
  assert('系统自动建的 tabBarItem 用的是页面的 title', auto.title, '甲');
  const house = UIImage.systemImageNamed('house');
  const houseFill = UIImage.systemImageNamed('house.fill');
  const item = new UITabBarItem({ title: '首页', image: house, selectedImage: houseFill, tag: 7 });
  first.tabBarItem = item;
  assert('写进去的 tabBarItem 读回来是同一个', first.tabBarItem === item, true);
  assert('构造时给的 title', item.title, '首页');
  assert('构造时给的 image', item.image === house, true);
  // 实测：selectedImage 读回来**不是**写进去的那个对象。UIKit 在写入时另存了
  // 一份（两次读是同一个，尺寸也一样，就是和你给的那个不 ===）。image 没有
  // 这个现象。读一律走原生，所以这里照实给
  const readBack = item.selectedImage;
  assert('构造时给的 selectedImage：读得回来', readBack !== null, true);
  assert('selectedImage：尺寸和写进去的一样',
         readBack !== null && houseFill !== null &&
         readBack.size.width === houseFill.size.width, true);
  assert('selectedImage：两次读是同一个对象', item.selectedImage === readBack, true);
  assert('实测：selectedImage 读回来不是写进去的那个对象', readBack === houseFill, false);
  assert('构造时给的 tag', item.tag, 7);
  assert('badgeValue 默认是 null', item.badgeValue, null);
  item.badgeValue = '3';
  assert('badgeValue 写得进去', item.badgeValue, '3');
  item.badgeValue = /** @type {any} */ (12);
  assert('badgeValue 给数：按 String() 转', item.badgeValue, '12');
  item.badgeValue = null;
  assert('badgeValue 写 null 是去掉角标', item.badgeValue, null);
  assert('badgeColor 默认是 null（系统的红色）', item.badgeColor, null);
  item.badgeColor = 'systemIndigo';
  assert('badgeColor 写得进去', item.badgeColor, 'systemIndigo');
  item.isEnabled = false;
  assert('isEnabled 写得进去', item.isEnabled, false);
  item.isEnabled = true;
  first.tabBarItem = null;
  assert('写 null 不是清空：系统又建了一个', first.tabBarItem instanceof UITabBarItem, true);
  assert('重新建的不是原来那个', first.tabBarItem === item, false);
  first.tabBarItem = item;
  assert('tabBarItem 给的不是 UITabBarItem',
         // @ts-expect-error 要的是 UITabBarItem
         thrown(() => { first.tabBarItem = new UIBarButtonItem({ title: 'x' }); }),
         'TypeError: tabBarItem needs a UITabBarItem or null');
  assert('UITabBarItem 不带参数也能建', new UITabBarItem().title, null);

  // --- tab 条 ---
  const tabBar = tabs.tabBar;
  assert('tabBar 是 UITabBar', tabBar instanceof UITabBar, true);
  assert('tabBar 每次读是同一个', tabs.tabBar === tabBar, true);
  // @ts-expect-error 构造函数是私有的
  assert('UITabBar 不能自己建', thrown(() => new UITabBar()),
         'TypeError: Illegal constructor: UITabBar is created by the runtime, not by new');
  assert('tabBar.tintColor 默认', tabBar.tintColor, 'systemBlue');
  assert('tabBar.unselectedItemTintColor 默认', tabBar.unselectedItemTintColor, null);
  tabBar.tintColor = 'systemPink';
  assert('tabBar.tintColor 写得进去', tabBar.tintColor, 'systemPink');
  tabBar.unselectedItemTintColor = 'systemGray';
  assert('tabBar.unselectedItemTintColor 写得进去', tabBar.unselectedItemTintColor, 'systemGray');

  assert('isTabBarHidden 默认', tabs.isTabBarHidden, false);
  tabs.isTabBarHidden = true;
  assert('isTabBarHidden 写得进去', tabs.isTabBarHidden, true);
  tabs.setTabBarHidden(false, { animated: false });
  assert('setTabBarHidden 改回来', tabs.isTabBarHidden, false);
  assert('tabBarMinimizeBehavior 默认', tabs.tabBarMinimizeBehavior, 'automatic');
  tabs.tabBarMinimizeBehavior = 'onScrollDown';
  assert('tabBarMinimizeBehavior 写得进去', tabs.tabBarMinimizeBehavior, 'onScrollDown');
  assert('tabBarMinimizeBehavior 写错',
         // @ts-expect-error 只有那四个
         thrown(() => { tabs.tabBarMinimizeBehavior = 'always'; }),
         'TypeError: tabBarMinimizeBehavior has no value "always"; expected one of: ' +
         'automatic / never / onScrollDown / onScrollUp');
  tabs.tabBarMinimizeBehavior = 'automatic';

  // --- 事件 ---
  assert('不认识的事件名：两类名字都列出来',
         thrown(() => tabs.addEventListener('select', () => {})),
         'TypeError: addEventListener has no value "select"; expected one of: ' +
         'didselect / willdismiss / diddismiss / dismissattempted / traitchange');
  assert('模态的事件名也能订', thrown(() => tabs.addEventListener('diddismiss', () => {})), '没抛');
  let selects = 0;
  tabs.addEventListener('didselect', () => { selects++; });
  tabs.selectedIndex = 2;
  tabs.selectedIndex = 0;
  // 实测：didselect 只在用户点 tab 条时派发，程序改 selectedIndex 不派发
  setTimeout(() => {
    assert('程序改了两次 selectedIndex：didselect 一次都不派发', selects, 0);
  }, 500);

  // --- 弹一个真的 tab 界面出来（点它，再点底下的三格）---
  const tabHost = ctx.section('UITabBarController：三个 tab（点它，切换，再点「关闭」）', 44);
  const openTabs = UIButton.buttonWithType('system');
  openTabs.setTitle('弹一个 tab 界面 ↑', { forState: ['normal'] });
  openTabs.backgroundColor = UIColor.systemPinkColor;
  openTabs.setTitleColor(UIColor.whiteColor, { forState: ['normal'] });
  openTabs.layer.cornerRadius = 10;
  openTabs.frame = new CGRect(16, 0, 180, 44);
  tabHost.addSubview(openTabs);
  openTabs.addEventListener('primaryActionTriggered', () => {
    const screen = new UITabBarController();
    /** @type {[string, string, string, string | null][]} */
    const cells = [
      ['首页', 'house', 'systemIndigo', null],
      ['行情', 'chart.line.uptrend.xyaxis', 'systemTeal', '3'],
      ['我的', 'person', 'systemOrange', null],
    ];
    screen.viewControllers = cells.map(([title, symbol, color, badge], index) => {
      const page = new UIViewController();
      page.title = title;
      page.view.backgroundColor = color;
      page.tabBarItem = new UITabBarItem({
        title, image: UIImage.systemImageNamed(symbol), badgeValue: badge,
      });
      const close = UIButton.buttonWithType('system');
      close.setTitle('关闭（这是「' + title + '」）', { forState: ['normal'] });
      close.setTitleColor(UIColor.whiteColor, { forState: ['normal'] });
      close.frame = new CGRect(40, 140, 260, 44);
      close.addEventListener('primaryActionTriggered', () => {
        screen.dismissViewController({ animated: true });
      });
      page.view.addSubview(close);
      // 中间那一页包一层导航控制器：tab 里套导航是最常见的搭法
      if (index !== 1) return page;
      const nav = new UINavigationController(page);
      nav.tabBarItem = page.tabBarItem;
      return nav;
    });
    screen.tabBar.tintColor = 'systemPink';
    screen.modalPresentationStyle = 'fullScreen';
    screen.addEventListener('didselect', (e) => {
      const picked = /** @type {UITabBarControllerEvent} */ (e).viewController;
      console.log('  ✓ 真实触摸：didselect，选中的是第 ' + screen.selectedIndex +
                  ' 格，事件带的页面就是 selectedViewController = ' +
                  (picked === screen.selectedViewController));
    });
    ctx.vc.presentViewController(screen, { animated: true });
    console.log('  tab 界面已弹出：点底下的三格切换，再点页面上的「关闭」');
  });

  // ===== 持有边（GC 之后）=====
  // ===== 持有边（GC 之后）=====
  (async () => {
    const keeper = new UIViewController();
    const tabsKeeper = new UITabBarController();
    /** @type {Set<string>} */
    const collected = new Set();
    const registry = new FinalizationRegistry((/** @type {string} */ name) => { collected.add(name); });
    (() => {
      const page = new UIViewController();
      /** @type {any} */ (page).probe = '挂在 tab 页面的包装上';
      const cell = new UITabBarItem({ title: '探针' });
      /** @type {any} */ (cell).probe = '挂在 tabBarItem 的包装上';
      page.tabBarItem = cell;
      const replaced = new UIViewController();
      tabsKeeper.viewControllers = [page, replaced];
      tabsKeeper.viewControllers = [page];
      registry.register(replaced, '被换掉的 tab 页面');
    })();
    (() => {
      const kept = new UIViewController();
      /** @type {any} */ (kept).probe = '挂在子控制器的包装上';
      keeper.addChildViewController(kept);
      registry.register(kept, '还在父控制器里的');
      const gone = new UIViewController();
      keeper.addChildViewController(gone);
      gone.removeFromParentViewController();
      registry.register(gone, '移除了的');
    })();
    // 晚几秒再逼 GC：启动那几秒里有几条量「主线程没被卡住」的断言
    // （文件读写那一组），GC 的压力和它们撞上会把它们撞红
    await new Promise((resolve) => setTimeout(resolve, 6000));
    const ran = await collectGarbage();
    console.log('--- 容器控制器：持有边 ---');
    if (!ran) {
      console.log('  ! 对照组没被回收，GC 没跑到，这一组未验证');
      return;
    }
    assert('还在父控制器里的子控制器：没被回收', collected.has('还在父控制器里的'), false);
    assert('读回来还是原来那个包装',
           /** @type {any} */ (keeper.childViewControllers[0]).probe, '挂在子控制器的包装上');
    assert('移除了的子控制器：被回收', collected.has('移除了的'), true);

    assert('tab 控制器的页面：没被回收，读回来还是原来那个包装',
           /** @type {any} */ (tabsKeeper.viewControllers[0]).probe, '挂在 tab 页面的包装上');
    assert('页面的 tabBarItem：读回来还是原来那个包装',
           /** @type {any} */ (tabsKeeper.viewControllers[0].tabBarItem).probe, '挂在 tabBarItem 的包装上');
    assert('被换掉的 tab 页面：被回收', collected.has('被换掉的 tab 页面'), true);
    console.log('--- 容器控制器：以上断言跑完 ---');
  })();
}
