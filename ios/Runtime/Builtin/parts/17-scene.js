// 场景、页面、导航、窗口、tab
//
// 这是内置脚本的一个 part：整个文件就是一个函数表达式，运行时按文件名
// 顺序编译执行，拿到函数之后用共享的 ctx 调一次。
(function (ctx) {
  'use strict';

  const {
    Event,
    INSETS_FIELDS,
    WebContentsClass,
    WebSocketClass,
    answerInvoke,
    colorArg,
    colorString,
    constructNative,
    defineField,
    defineNativeClass,
    disown,
    has,
    initWrapper,
    kHandle,
    kSubscribe,
    kSyncStack,
    nativeCall,
    nativeCallAsync,
    nativeCallObject,
    nativeCallObjectArray,
    nativeCallVoid,
    nativeClassCall,
    nativeClasses,
    nativeGet,
    nativeGetObject,
    nativeGetObjectArray,
    nativeGetOwned,
    nativeOnly,
    nativeSet,
    nativeSetObject,
    nativeSetObjectArray,
    nativeSetOwned,
    own,
    ownAll,
    ownOne,
    parentControllerOf,
    preloadPaths,
    requireNative,
    sessionCookies,
    structArg,
    subscribeNative,
    toBoolean,
    toInsets,
    toInteger,
    toNumber,
    toPoint,
    toText,
    toTextOrNull,
    native,
  } = ctx;

  defineNativeClass('UISceneSession', class UISceneSession extends NSObject {
    constructor() { nativeOnly(new.target); }
    // 'UIWindowSceneSessionRoleApplication' 等，决定这个场景该画什么界面
    get role() { return nativeGet(this, 'role'); }
    get persistentIdentifier() { return nativeGet(this, 'persistentIdentifier'); }
    get userInfo() { return nativeGet(this, 'userInfo'); }
    set userInfo(value) { nativeSet(this, 'userInfo', value); }
  });

  // 系统创建并连接的场景。不可构造——SDK 自己就是 init NS_UNAVAILABLE，
  // 注释写着「由 UIKit 调用，不打算让 App 调用」。
  defineNativeClass('UIWindowScene', class UIWindowScene extends UIScene {
    constructor() { nativeOnly(new.target); }

    // 整个场景的外观特征：系统设置里是深色还是浅色，读这里
    get traitCollection() { return nativeGetObject(this, 'traitCollection'); }
    // 场景的生命周期事件原生总是发，不用订；只有 traitchange 要告诉原生
    [kSubscribe](type, on) {
      if (type === 'traitchange') subscribeNative(this, type, on);
    }

    // 这个场景自己的前后台状态，和 application.state（所有场景的聚合）不是一回事
    get activationState() { return nativeGet(this, 'activationState'); }
    get session() { return nativeGetOwned(this, 'session'); }
    // ObjC 的属性名是 fullScreen，getter 是 isFullScreen，这里用后者
    get isFullScreen() { return nativeGet(this, 'isFullScreen'); }

    // 多任务切换器的卡片上显示的标题
    get title() { return nativeGet(this, 'title'); }
    set title(value) { nativeSet(this, 'title', toTextOrNull(value)); }
    get subtitle() { return nativeGet(this, 'subtitle'); }
    set subtitle(value) { nativeSet(this, 'subtitle', toText(value)); }

    // 场景级的打开 URL。application.openURL 是 App 级的，两者都有
    openURL(url, options) { return nativeCallAsync(this, 'openURL', [String(url)]); }
  });

  // 页面。可构造——它是我们造的，不是系统给的。
  // 被呈现的页面 -> 呈现它的页面。原生的 presentingViewController 是弱的
  // 回边，这里也只用它找到「该去谁身上放开那条持有边」，所以是 WeakMap
  const presenterOf = new WeakMap();
  // 按原生的真相重建「它呈现着谁」那条边：还呈现着就留着，没有了就放开
  function syncPresented(vc) {
    if (vc != null) nativeGetOwned(vc, 'presentedViewController');
  }

  defineNativeClass('UIViewController', class UIViewController extends UIResponder {
    constructor() {
      super();
      constructNative(this, new.target, 'UIViewController', []);
    }
    get view() { return nativeGetOwned(this, 'view'); }
    // 导航条上的标题。返回按钮默认取上一页的 title，所以这一个属性就够走通「返回」
    get title() { requireNative(this, 'title'); return nativeGet(this, 'title'); }
    set title(value) { requireNative(this, 'title'); nativeSet(this, 'title', toTextOrNull(value)); }
    // 两条都是 ObjC 侧的 weak 回边，所以 JS 侧翻成 strong
    // 模态事件（willdismiss / diddismiss / dismissattempted）。
    // 注意 UINavigationController 覆写了这个钩子，所以一个被模态呈现的导航
    // 控制器收不到这几条——它那一侧只认导航事件，见文档的「还没做」
    [kSubscribe](type, on) { subscribeNative(this, type, on); }

    // ---- 模态呈现 ----
    // completion 是 block，所以这里是 Promise——异步一律 Promise
    presentViewController(viewController, options) {
      const o = options || {};
      const done = nativeCallAsync(this, 'presentViewController',
                                   [viewController, !!o.animated]);
      // 原生侧 presentedViewController 是强引用，JS 侧也要有对应的一条。
      // presentViewController: 是同步建立这层关系的，所以这里就记
      own(this, 'presentedViewController', viewController);
      // 这条边什么时候放开不只由 JS 决定：用户可以把它拖走。常驻订一个
      // 内部事件，被拖走时放开，不依赖有没有人监听 diddismiss
      presenterOf.set(viewController, this);
      native.subscribe(viewController[kHandle], '@dismissed', true);
      return done;
    }
    // 可以在呈现者上调，也可以在被呈现的那一页自己身上调（UIKit 会转给
    // 呈现者）。所以关完之后两头都按原生的真相同步一次。
    // 等动画结束再放：动画期间原生还拿着那一页
    dismissViewController(options) {
      const o = options || {};
      const done = nativeCallAsync(this, 'dismissViewController', [!!o.animated]);
      const settle = () => {
        syncPresented(this);
        syncPresented(presenterOf.get(this));
      };
      done.then(settle, settle);
      return done;
    }
    get presentedViewController() {
      return nativeGetOwned(this, 'presentedViewController');
    }
    // weak 回边，JS 侧翻成 strong
    get presentingViewController() {
      return nativeGetOwned(this, 'presentingViewController');
    }
    get modalPresentationStyle() {
      requireNative(this, 'modalPresentationStyle');
      return nativeGet(this, 'modalPresentationStyle');
    }
    set modalPresentationStyle(value) {
      requireNative(this, 'modalPresentationStyle');
      nativeSet(this, 'modalPresentationStyle', value);
    }
    get modalTransitionStyle() {
      requireNative(this, 'modalTransitionStyle');
      return nativeGet(this, 'modalTransitionStyle');
    }
    set modalTransitionStyle(value) {
      requireNative(this, 'modalTransitionStyle');
      nativeSet(this, 'modalTransitionStyle', value);
    }
    // 打开之后用户拖不走它，只能走你给的那个出口。
    // 这是 presentationControllerShouldDismiss: 那个同步回调的「预先声明」版本
    get isModalInPresentation() {
      requireNative(this, 'isModalInPresentation');
      return nativeGet(this, 'isModalInPresentation');
    }
    set isModalInPresentation(value) {
      requireNative(this, 'isModalInPresentation');
      nativeSet(this, 'isModalInPresentation', toBoolean(value));
    }

    // 这一页在导航条上的配置，VC 自己懒加载的
    get navigationItem() { return nativeGetOwned(this, 'navigationItem'); }
    get navigationController() { return nativeGetOwned(this, 'navigationController'); }
    get parentViewController() { return nativeGetOwned(this, 'parentViewController'); }

    // ---- 外观特征 ----
    // 这个页面所处的环境：深色还是浅色、屏幕几倍、文字多大。每次读都是当时的值
    get traitCollection() { return nativeGetObject(this, 'traitCollection'); }
    // 强制这个页面（连同它里面的一切）用浅色或深色。'unspecified' 是跟随外层
    get overrideUserInterfaceStyle() {
      requireNative(this, 'overrideUserInterfaceStyle');
      return nativeGet(this, 'overrideUserInterfaceStyle');
    }
    set overrideUserInterfaceStyle(value) {
      requireNative(this, 'overrideUserInterfaceStyle');
      nativeSet(this, 'overrideUserInterfaceStyle', value);
    }

    // ---- 在 tab 条上的样子 ----
    // 不设的话系统按页面的 title 建一个；写 null 也是让系统重新建一个
    get tabBarItem() { return nativeGetOwned(this, 'tabBarItem'); }
    set tabBarItem(value) {
      nativeSetObject(this, 'tabBarItem', value);
      // 写 null 之后原生那边是一个新建的，所以按原生的真相重读一次再记边
      nativeGetOwned(this, 'tabBarItem');
    }
    get tabBarController() { return nativeGetOwned(this, 'tabBarController'); }

    // ---- 父子控制器：自己写容器用的那一组 ----
    //
    // 加一个子页面是三句，UIKit 只替你做第一句里的 willMove：
    //
    //     parent.addChildViewController(child);          // 内部会调 child.willMove(parent)
    //     parent.view.addSubview(child.view);
    //     child.didMoveToParentViewController(parent);   // 这句要自己补
    //
    // 移除时反过来，willMove(null) 要自己调，didMove(null) 由 remove 代劳。
    // 持有边照原生：父控制器拿着子控制器
    get childViewControllers() {
      return ownAll(this, 'childViewControllers',
                    nativeGetObjectArray(this, 'childViewControllers'));
    }
    addChildViewController(childController) {
      // 它已经有父控制器的话，UIKit 会先把它从那边摘下来
      const from = parentControllerOf(childController);
      nativeCall(this, 'addChildViewController:', [childController]);
      disown(from, 'childViewControllers', childController);
      ownOne(this, 'childViewControllers', childController);
    }
    removeFromParentViewController() {
      const from = parentControllerOf(this);
      nativeCall(this, 'removeFromParentViewController', []);
      disown(from, 'childViewControllers', this);
    }
    // 这两个只是通知，不建立持有。参数是 null 表示「要离开父控制器了」
    willMoveToParentViewController(parent) {
      nativeCall(this, 'willMoveToParentViewController:', [parent === undefined ? null : parent]);
    }
    didMoveToParentViewController(parent) {
      nativeCall(this, 'didMoveToParentViewController:', [parent === undefined ? null : parent]);
    }
    // 在系统给的安全区之外再让出一圈，单位 pt。自己画了一条 tab 条盖在子页面
    // 上面时，用它告诉子页面「底下这一截别放东西」
    get additionalSafeAreaInsets() {
      requireNative(this, 'additionalSafeAreaInsets');
      return toInsets(nativeGet(this, 'additionalSafeAreaInsets'));
    }
    set additionalSafeAreaInsets(value) {
      requireNative(this, 'additionalSafeAreaInsets');
      nativeSet(this, 'additionalSafeAreaInsets',
                structArg(value, INSETS_FIELDS, 'additionalSafeAreaInsets'));
    }
  });

  // 视图树的根。必须绑定到一个场景——initWithWindowScene: 是唯一未废弃的
  // 初始化方法，init 和 initWithFrame: 在 iOS 26 都废弃了。
  // 视图树的根。
  //
  // scene 参数可选，两种用法：
  //   new UIWindow(scene)   参数齐全，立刻创建原生对象（＝ initWithWindowScene:）
  //   new UIWindow()        JS 对象先存在，等 window.windowScene = scene 时才创建
  //
  // 后者让「构造」和「绑定」解耦，而且没有发明新 API——windowScene 本来就是
  // ObjC 的可写属性，没有 scene 的 window 在 ObjC 里也本来就是合法状态
  // （windowScene 是 nullable）。
  // 导航条和工具条上的一个「项」。它不是 UIView，也不是 UIControl——
  // 是一个描述对象，UIKit 自己照着它画按钮。
  const UIBarItem = defineNativeClass('UIBarItem', class UIBarItem extends NSObject {
    constructor() {
      super();
      // UIBarItem 是抽象基类，ObjC 侧没有可用的 init，不给构造
      if (new.target === UIBarItem) {
        throw new TypeError(
          'Illegal constructor: UIBarItem is abstract; construct UIBarButtonItem instead');
      }
    }
    get title() { requireNative(this, 'title'); return nativeGet(this, 'title'); }
    set title(value) { requireNative(this, 'title'); nativeSet(this, 'title', toTextOrNull(value)); }
    get image() { return nativeGetOwned(this, 'image'); }
    set image(value) { nativeSetOwned(this, 'image', value); }
    get isEnabled() {
      requireNative(this, 'isEnabled');
      return nativeGet(this, 'isEnabled');
    }
    set isEnabled(value) {
      requireNative(this, 'isEnabled');
      nativeSet(this, 'isEnabled', toBoolean(value));
    }
    get tag() { requireNative(this, 'tag'); return nativeGet(this, 'tag'); }
    set tag(value) { requireNative(this, 'tag'); nativeSet(this, 'tag', toInteger(value, 'tag')); }
  });

  // 导航条上的按钮。
  //
  // 三种口味：{ title }、{ customView }，以及类方法 systemItem(name)——
  // systemItem 只能在 init 里给（ObjC 没有对应的可写属性），所以它走类方法，
  // 而 title / style 这些构造完当属性设就行。
  //
  // 它不是 UIControl，但 target/action 是同一套，所以事件名沿用 UIButton 的
  // primaryActionTriggered：在按钮和导航条按钮之间切换时不该还要记两个名字。
  defineNativeClass('UIBarButtonItem', class UIBarButtonItem extends UIBarItem {
    constructor(options) {
      super();
      const o = options || {};
      constructNative(this, new.target, 'UIBarButtonItem',
                      o.customView == null ? [] : [o.customView]);
      if (o.title !== undefined) this.title = o.title;
      if (o.image !== undefined) this.image = o.image;
      if (o.style !== undefined) this.style = o.style;
      if (o.isEnabled !== undefined) this.isEnabled = o.isEnabled;
    }

    /** 系统预置的那二十几个（'add'、'done'、'trash'…） */
    static systemItem(name) {
      return nativeClassCall('UIBarButtonItem', 'systemItemWithName:', [name]);
    }
    /** 占位用的弹性空白 */
    static flexibleSpace() {
      return nativeClassCall('UIBarButtonItem', 'flexibleSpaceItem', []);
    }
    /** 占位用的固定宽度空白 */
    static fixedSpace(width) {
      return nativeClassCall('UIBarButtonItem', 'fixedSpaceItemOfWidth:', [toNumber(width, 'width')]);
    }

    [kSubscribe](type, on) { subscribeNative(this, type, on); }

    get style() { requireNative(this, 'style'); return nativeGet(this, 'style'); }
    set style(value) { requireNative(this, 'style'); nativeSet(this, 'style', value); }
    get width() { requireNative(this, 'width'); return nativeGet(this, 'width'); }
    set width(value) { requireNative(this, 'width'); nativeSet(this, 'width', toNumber(value, 'width')); }
    get isHidden() { requireNative(this, 'isHidden'); return nativeGet(this, 'isHidden'); }
    set isHidden(value) { requireNative(this, 'isHidden'); nativeSet(this, 'isHidden', toBoolean(value)); }
    get customView() { return nativeGetOwned(this, 'customView'); }
    set customView(value) { nativeSetOwned(this, 'customView', value); }
  });

  // 导航条上「这一页」的那份配置。不可构造——每个 UIViewController 自带一个。
  defineNativeClass('UINavigationItem', class UINavigationItem extends NSObject {
    constructor() {
      nativeOnly(new.target);
    }
    get title() { requireNative(this, 'title'); return nativeGet(this, 'title'); }
    set title(value) { requireNative(this, 'title'); nativeSet(this, 'title', toTextOrNull(value)); }
    // iOS 26 新加的副标题
    get subtitle() { requireNative(this, 'subtitle'); return nativeGet(this, 'subtitle'); }
    set subtitle(value) { requireNative(this, 'subtitle'); nativeSet(this, 'subtitle', toTextOrNull(value)); }
    // 下一页返回按钮上的字。不设就用这一页的 title
    get backButtonTitle() {
      requireNative(this, 'backButtonTitle');
      return nativeGet(this, 'backButtonTitle');
    }
    set backButtonTitle(value) {
      requireNative(this, 'backButtonTitle');
      nativeSet(this, 'backButtonTitle', toTextOrNull(value));
    }
    get hidesBackButton() {
      requireNative(this, 'hidesBackButton');
      return nativeGet(this, 'hidesBackButton');
    }
    set hidesBackButton(value) {
      requireNative(this, 'hidesBackButton');
      nativeSet(this, 'hidesBackButton', toBoolean(value));
    }
    // 放一个自定义 view 当标题。设了它，title 就被忽略
    get titleView() { return nativeGetOwned(this, 'titleView'); }
    set titleView(value) { nativeSetOwned(this, 'titleView', value); }

    get leftBarButtonItems() {
      return ownAll(this, 'leftBarButtonItems',
                    nativeGetObjectArray(this, 'leftBarButtonItems'));
    }
    set leftBarButtonItems(value) {
      nativeSetObjectArray(this, 'leftBarButtonItems', value);
      ownAll(this, 'leftBarButtonItems',
             nativeGetObjectArray(this, 'leftBarButtonItems'));
    }
    get rightBarButtonItems() {
      return ownAll(this, 'rightBarButtonItems',
                    nativeGetObjectArray(this, 'rightBarButtonItems'));
    }
    set rightBarButtonItems(value) {
      nativeSetObjectArray(this, 'rightBarButtonItems', value);
      ownAll(this, 'rightBarButtonItems',
             nativeGetObjectArray(this, 'rightBarButtonItems'));
    }
  });

  // 页面栈。push 进去、pop 出来，返回手势和返回按钮都是系统给的。
  //
  // 栈变动之后统一用 ownAll 按原生真相重建持有边：原生侧 nav 强持有栈里的每
  // 个 VC，JS 侧也必须有对应的一条，否则 JS 丢掉引用后包装会被 GC，再从
  // topViewController 读回来就是个全新的包装——挂的状态和监听器全丢。
  // 用 ownAll 而不是逐个记进出，是因为它的语义就是「按原生真相整层重建」，
  // pop / popTo / popToRoot / setViewControllers 一视同仁。
  defineNativeClass('UINavigationController',
                    class UINavigationController extends UIViewController {
    constructor(rootViewController) {
      super();
      constructNative(this, new.target, 'UINavigationController',
                      rootViewController == null ? [] : [rootViewController]);
      this[kSyncStack]();
      // 栈不只是 JS 在改：用户点返回、左滑返回都直接作用在 UIKit 上。常驻
      // 订一个内部事件，栈一变就重建持有边，不依赖有没有人监听 didshow
      native.subscribe(this[kHandle], '@stack', true);
    }

    // 事件全在 UINavigationControllerDelegate 上，和滚动同构
    [kSubscribe](type, on) { subscribeNative(this, type, on); }

    // 栈动过之后重读一次原生真相，把持有边整层重建
    [kSyncStack]() {
      ownAll(this, 'viewControllers', nativeGetObjectArray(this, 'viewControllers'));
    }

    get viewControllers() {
      return ownAll(this, 'viewControllers',
                    nativeGetObjectArray(this, 'viewControllers'));
    }
    set viewControllers(value) {
      nativeSetObjectArray(this, 'viewControllers', value);
      this[kSyncStack]();
    }
    get topViewController() { return nativeGetOwned(this, 'topViewController'); }
    get visibleViewController() {
      return nativeGetOwned(this, 'visibleViewController');
    }

    pushViewController(viewController, options) {
      const o = options || {};
      nativeCall(this, 'pushViewController:animated:', [viewController, !!o.animated]);
      this[kSyncStack]();
    }
    // 返回被弹出的那一个；栈底弹不动时返回 null
    popViewController(options) {
      const o = options || {};
      const popped = nativeCallObject(this, 'popViewControllerAnimated:', [!!o.animated]);
      this[kSyncStack]();
      return popped;
    }
    popToViewController(viewController, options) {
      const o = options || {};
      const popped = nativeCallObjectArray(
        this, 'popToViewController:animated:', [viewController, !!o.animated]);
      this[kSyncStack]();
      return popped;
    }
    popToRootViewController(options) {
      const o = options || {};
      const popped = nativeCallObjectArray(
        this, 'popToRootViewControllerAnimated:', [!!o.animated]);
      this[kSyncStack]();
      return popped;
    }
    // 整栈替换。数组按「每个元素一个句柄」传，animated 跟在后面
    setViewControllers(viewControllers, options) {
      const o = options || {};
      nativeCallObjectArray(this, 'setViewControllers:animated:',
                            [...Array.from(viewControllers), !!o.animated]);
      this[kSyncStack]();
    }

    get isNavigationBarHidden() {
      requireNative(this, 'isNavigationBarHidden');
      return nativeGet(this, 'isNavigationBarHidden');
    }
    set isNavigationBarHidden(value) {
      requireNative(this, 'isNavigationBarHidden');
      nativeSet(this, 'isNavigationBarHidden', toBoolean(value));
    }
    setNavigationBarHidden(hidden, options) {
      const o = options || {};
      nativeCall(this, 'setNavigationBarHidden:animated:', [!!hidden, !!o.animated]);
    }
  });

  defineNativeClass('UIWindow', class UIWindow extends UIView {
    constructor(scene) {
      super();
      // 所有权是「场景持有窗口」——UIWindow.windowScene 在头文件里是 weak，
      // 真正持有窗口的是 UIWindowScene.windows。所以镜像记在场景那一侧。
      if (scene != null) {
        constructNative(this, new.target, 'UIWindow', [scene]);
        ownOne(scene, 'windows', this);
      }
    }

    // 换 scene 就是换显示目标。典型 App 一绑到死，需要改的场景是把窗口
    // 移到外接显示器（setScreen: 废弃后的替代品就是它）。
    // 首次赋值还兼做「创建原生对象」的触发点。
    get windowScene() {
      return this[kHandle] === undefined ? null : nativeGetObject(this, 'windowScene');
    }
    set windowScene(value) {
      if (this[kHandle] === undefined) {
        if (value != null) {
          // 这里不在构造函数里，new.target 是 undefined，直接给类本身
          constructNative(this, UIWindow, 'UIWindow', [value]);
          ownOne(value, 'windows', this);
        }
        return;
      }
      const old = nativeGetObject(this, 'windowScene');
      nativeSetObject(this, 'windowScene', value);
      disown(old, 'windows', this);
      ownOne(value, 'windows', this);
    }

    // 窗口唯一的内容入口，不设就没内容
    get rootViewController() {
      requireNative(this, 'rootViewController');
      return nativeGetOwned(this, 'rootViewController');
    }
    set rootViewController(value) {
      requireNative(this, 'rootViewController');
      nativeSetOwned(this, 'rootViewController', value);
    }

    // 多窗口的叠放顺序。键盘、alert 都是 level 更高的窗口
    get windowLevel() {
      requireNative(this, 'windowLevel');
      return nativeGet(this, 'windowLevel');
    }
    set windowLevel(value) {
      requireNative(this, 'windowLevel');
      nativeSet(this, 'windowLevel', toNumber(value, 'windowLevel'));
    }

    get isKeyWindow() {
      requireNative(this, 'isKeyWindow');
      return nativeGet(this, 'isKeyWindow');
    }
    get canBecomeKeyWindow() {
      requireNative(this, 'canBecomeKeyWindow');
      return nativeGet(this, 'canBecomeKeyWindow');
    }

    // 程序创建的 UIWindow 默认 hidden=YES，不调这个屏幕就是黑的
    makeKeyAndVisible() {
      requireNative(this, 'makeKeyAndVisible()');
      nativeCallVoid(this, 'makeKeyAndVisible');
    }
    makeKeyWindow() {
      requireNative(this, 'makeKeyWindow()');
      nativeCallVoid(this, 'makeKeyWindow');
    }
  });

  // ---------- tab ----------
  //
  // 底部的标签栏。用的是经典的 viewControllers 那一套：iOS 18 的 UITab 要在
  // 构造时给一个同步返回页面的回调，现在做不了。
  //
  // 每个页面在 tab 条上长什么样，由**页面自己的** tabBarItem 决定，不是
  // tab 控制器上的属性。

  // tab 条上的一格。title / image / isEnabled / tag 继承自 UIBarItem
  defineNativeClass('UITabBarItem', class UITabBarItem extends UIBarItem {
    constructor(options) {
      super();
      const o = options === undefined || options === null ? {} : options;
      constructNative(this, new.target, 'UITabBarItem', []);
      if (has(o, 'title')) this.title = o.title;
      if (has(o, 'image')) this.image = o.image;
      if (has(o, 'selectedImage')) this.selectedImage = o.selectedImage;
      if (has(o, 'tag')) this.tag = o.tag;
      if (has(o, 'badgeValue')) this.badgeValue = o.badgeValue;
      if (has(o, 'badgeColor')) this.badgeColor = o.badgeColor;
    }
    // 选中时换一张图。不设就用 image
    get selectedImage() { return nativeGetOwned(this, 'selectedImage'); }
    set selectedImage(value) { nativeSetOwned(this, 'selectedImage', value); }
    // 右上角的角标。null 是没有角标，空串是一个不带字的圆点
    get badgeValue() { requireNative(this, 'badgeValue'); return nativeGet(this, 'badgeValue'); }
    set badgeValue(value) {
      requireNative(this, 'badgeValue');
      nativeSet(this, 'badgeValue', toTextOrNull(value));
    }
    get badgeColor() {
      requireNative(this, 'badgeColor');
      return colorString(nativeGetOwned(this, 'badgeColor'));
    }
    set badgeColor(value) {
      requireNative(this, 'badgeColor');
      if (value === null || value === undefined) { nativeSetOwned(this, 'badgeColor', null); return; }
      const color = colorArg(value, 'badgeColor');
      if (color === undefined) return;   // 不合法，警告过了，保留旧值
      nativeSetOwned(this, 'badgeColor', color);
    }
  });

  // tab 条本身。只开了两个颜色：它里面有什么由 tab 控制器管，头文件原话是
  // 直接改它的内容会抛异常
  defineNativeClass('UITabBar', class UITabBar extends UIView {
    constructor() {
      super();
      nativeOnly(new.target);
    }
    // 选中那一格的颜色。null 是跟随系统（默认是蓝色）
    get tintColor() {
      requireNative(this, 'tintColor');
      return colorString(nativeGetOwned(this, 'tintColor'));
    }
    set tintColor(value) {
      requireNative(this, 'tintColor');
      if (value === null || value === undefined) { nativeSetOwned(this, 'tintColor', null); return; }
      const color = colorArg(value, 'tintColor');
      if (color === undefined) return;
      nativeSetOwned(this, 'tintColor', color);
    }
    // 没选中的那些格的颜色
    get unselectedItemTintColor() {
      requireNative(this, 'unselectedItemTintColor');
      return colorString(nativeGetOwned(this, 'unselectedItemTintColor'));
    }
    set unselectedItemTintColor(value) {
      requireNative(this, 'unselectedItemTintColor');
      if (value === null || value === undefined) {
        nativeSetOwned(this, 'unselectedItemTintColor', null);
        return;
      }
      const color = colorArg(value, 'unselectedItemTintColor');
      if (color === undefined) return;
      nativeSetOwned(this, 'unselectedItemTintColor', color);
    }
  });

  defineNativeClass('UITabBarController',
                    class UITabBarController extends UIViewController {
    constructor() {
      super();
      constructNative(this, new.target, 'UITabBarController', []);
    }

    // 事件在 UITabBarControllerDelegate 上，和导航同构
    [kSubscribe](type, on) { subscribeNative(this, type, on); }

    // 持有边：tab 控制器拿着它的每个页面。每次写完按原生的真相整层重建，
    // 和导航栈一个做法。系统不会自己往里加减页面（用户在「更多」里只能
    // 调顺序），所以不用常驻一个内部事件
    get viewControllers() {
      return ownAll(this, 'viewControllers', nativeGetObjectArray(this, 'viewControllers'));
    }
    set viewControllers(value) {
      nativeSetObjectArray(this, 'viewControllers', value);
      ownAll(this, 'viewControllers', nativeGetObjectArray(this, 'viewControllers'));
    }
    setViewControllers(viewControllers, options) {
      const o = options || {};
      nativeCallObjectArray(this, 'setViewControllers:animated:',
                            [...Array.from(viewControllers || []), !!o.animated]);
      ownAll(this, 'viewControllers', nativeGetObjectArray(this, 'viewControllers'));
    }

    // 第几个。没有页面、或者选中的是系统的「更多」时是 -1
    get selectedIndex() { requireNative(this, 'selectedIndex'); return nativeGet(this, 'selectedIndex'); }
    set selectedIndex(value) {
      requireNative(this, 'selectedIndex');
      nativeSet(this, 'selectedIndex', toInteger(value, 'selectedIndex'));
    }
    // 选中的那一页。它本来就在 viewControllers 里，所以这里不另记持有边
    get selectedViewController() { return nativeGetObject(this, 'selectedViewController'); }
    set selectedViewController(value) { nativeSetObject(this, 'selectedViewController', value); }

    get tabBar() { return nativeGetOwned(this, 'tabBar'); }
    get isTabBarHidden() {
      requireNative(this, 'isTabBarHidden');
      return nativeGet(this, 'isTabBarHidden');
    }
    set isTabBarHidden(value) {
      requireNative(this, 'isTabBarHidden');
      nativeSet(this, 'isTabBarHidden', toBoolean(value));
    }
    setTabBarHidden(hidden, options) {
      const o = options || {};
      nativeCall(this, 'setTabBarHidden:animated:', [toBoolean(hidden), !!o.animated]);
    }
    // 内容往下滚时 tab 条要不要收成一小条（iOS 26 加的）
    get tabBarMinimizeBehavior() {
      requireNative(this, 'tabBarMinimizeBehavior');
      return nativeGet(this, 'tabBarMinimizeBehavior');
    }
    set tabBarMinimizeBehavior(value) {
      requireNative(this, 'tabBarMinimizeBehavior');
      nativeSet(this, 'tabBarMinimizeBehavior', value);
    }
  });

  // 带原生对象负载的事件，字段名按类型定。
  //
  // 「事件带不带数据」的判据是**那个信息在对象上读不读得到**：滚动的位置在
  // contentOffset 上读得到，所以 scroll 不带（不带才能无损合并）；导航的
  // 「哪个页面」在 willshow 那一刻从 nav 上读不到（topViewController 还没
  // 换过去），所以带上。
  // 事件负载挂在哪个字段上。值可以是原生对象（willshow 带 viewController）
  // 也可以是普通 JSON 值（动画的 stop 带一个布尔）——sink 一视同仁
  const objectEventField = {
    willshow: 'viewController', didshow: 'viewController', didselect: 'viewController',
    traitchange: 'previousTraitCollection',
    stop: 'finished',
    tick: 'frame', message: 'data', error: 'message',
  };

  // 原生要给某个对象自己派发事件时回调这里（场景的生命周期事件走这条路）
  const alwaysEmitted = new Set(['UIWindow', 'WebSocket']);
  //
  // 返回值：监听器有没有取消这个事件的默认动作。只有下面这张表里的事件
  // 是 cancelable 的——原生那边把默认动作推迟到了这次派发之后，所以
  // preventDefault() 真的拦得住。别的原生事件发生时默认动作早就做完了，
  // 建成不可取消的，preventDefault() 照标准静默无效
  const cancelableNativeEvents = new Set(['will-navigate']);
  native.setObjectEventSink(function (wrapper, type, payload, rebuilt) {
    // 运行时自己订的两个内部事件：系统自己动了持有关系，镜像要跟上。
    // 不派发给监听器
    if (type === '@stack') {
      // 用户点了返回或者左滑返回：按原生的真相把栈那条边重建一遍
      wrapper[kSyncStack]();
      return false;
    }
    if (type === '@dismissed') {
      // 用户把模态页拖走了：呈现它的那一页不再持有它
      const presenter = presenterOf.get(wrapper);
      presenterOf.delete(wrapper);
      syncPresented(presenter);
      return false;
    }
    // 包装是为这次派发现建的，说明原来那个已经被回收，挂在它上面的监听器
    // 也没了，这个事件到不了任何人。正常情况下不该发生：原生对象还在发
    // 事件，就说明有人持有它，镜像里却没有对应的边。打出来，别静默
    //
    // 窗口和 WebSocket 除外：它们的事件原生总是发，不看有没有人订。系统
    // 自己的窗口（键盘那一类）JS 从来没碰过，第一次发事件时包装当然是新建的
    if (rebuilt && !alwaysEmitted.has(wrapper.constructor.name)) {
      console.warn('[Nacre] ' + wrapper.constructor.name + ' fired "' + type +
                   '" after its JS wrapper was collected; its listeners are gone ' +
                   'and this event was dropped. Keep a reference to the object, ' +
                   'or report this if it is still on screen.');
    }
    if (type === '@cookies-changed') {
      // 系统说某个分区的 cookie 变了。事件派发在那个分区的 cookies 对象上，
      // 不带数据——系统没说是哪一条
      const jar = sessionCookies.get(wrapper);
      if (jar !== undefined) jar.dispatchEvent(new Event('changed'));
      return false;
    }
    if (type === '@ipc-invoke') {
      // 网页那边 ipcRenderer.invoke 了一次。不是事件，是一次请求：找处理
      // 函数、答复
      answerInvoke(wrapper, payload);
      return false;
    }
    const event = new Event(type, { cancelable: cancelableNativeEvents.has(type) });
    const field = objectEventField[type];
    if (wrapper instanceof WebContentsClass && type === 'preload-error') {
      // 预加载脚本执行时抛了。照 Electron 给路径和错误
      defineField(event, 'preloadPath', preloadPaths.get(wrapper) || '');
      defineField(event, 'error', new Error(payload && payload.message));
    } else if (wrapper instanceof WebContentsClass) {
      // 网页的事件。负载是一个字典，有什么就挂什么——字段名照搬 Electron，
      // 原生那边已经按事件各自列好了
      if (payload !== undefined && payload !== null && typeof payload === 'object') {
        for (const key of Object.keys(payload)) defineField(event, key, payload[key]);
      }
    } else if (field !== undefined && payload !== undefined) {
      defineField(event, field, payload);
    } else if (payload !== undefined && payload !== null &&
               typeof payload === 'object' && 'wasClean' in payload) {
      // WebSocket 关闭。按**负载的形状**认，不按事件名——'close' 这个名字
      // 太泛，将来别的对象也会用
      defineField(event, 'code', payload.code);
      defineField(event, 'reason', payload.reason);
      defineField(event, 'wasClean', payload.wasClean);
    } else if (payload !== undefined && payload !== null &&
               typeof payload === 'object' && 'tapCount' in payload) {
      // 触摸类的控件事件。原生**只给这九个**带负载，所以这里不用镜像
      // 那张表——收到负载就挂上。location 转成 CGPoint，和别处一致；
      // 没有真实触点时（sendActionsForControlEvents）原生给的就是 null
      defineField(event, 'location',
                  payload.location === null ? null : toPoint(payload.location));
      defineField(event, 'tapCount', payload.tapCount);
    } else if (payload !== undefined && payload !== null &&
               typeof payload === 'object' && 'numberOfTouches' in payload) {
      // 手势事件。同样按负载的形状认：began / ended 这些名字太泛
      defineField(event, 'location',
                  payload.location === null ? null : toPoint(payload.location));
      defineField(event, 'numberOfTouches', payload.numberOfTouches);
    }
    wrapper.dispatchEvent(event);
    // WebSocket 关掉了：系统不再拿着它，这边也放开。放在派发之后，监听器
    // 里还要用它。连接失败走的也是这里——原生在 error 之后总会补一个 close
    if (wrapper instanceof WebSocketClass && type === 'close') {
      disown(ctx.application, 'webSockets', wrapper);
    }
    return event.defaultPrevented;
  });

  // C++ 要建包装对象时回调这里。同一个原生指针 C++ 那边会复用已有的包装，
  // 所以 === 成立。
  //
  // **不走构造函数。** 工厂要的只是「一个挂着事件表和句柄的包装」，而原生类
  // 的构造函数在这条路上本来就什么都不做。走它就得留一个全局的「现在允许
  // 构造」开关，而那个开关是个布尔量：不可重入，一旦卡在 true，之后每个
  // new 都会静默返回空壳——全局、永久、无声。
  native.setWrapperFactory(function (className, handle) {
    const Cls = nativeClasses[className];
    if (Cls === undefined) return null;
    const wrapper = initWrapper(Object.create(Cls.prototype));
    Object.defineProperty(wrapper, kHandle, { value: handle });
    return wrapper;
  });


})
