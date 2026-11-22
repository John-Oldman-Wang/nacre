// 页面的覆写点：方向、状态栏；场景的几何信息、转屏和状态栏的现状。
//
// UIKit 里这几项只能靠写 UIViewController 的子类覆写拿到。运行时给 UIViewController、
// UINavigationController、UITabBarController 各预置了一个子类：方向和状态栏在 JS 里是
// 可写的属性（系统来问时由运行时替页面回答）。

/** 界面的一个方向。 */
type UIInterfaceOrientation = 'unknown' | 'portrait' | 'portraitUpsideDown' | 'landscapeLeft' | 'landscapeRight';

/**
 * 一组方向里的一个名字。`landscape`、`all`、`allButUpsideDown` 是几个方向的合称，
 * 写入时认，读出来拆成单个的方向。
 */
type UIInterfaceOrientationMaskName =
  | 'portrait'
  | 'portraitUpsideDown'
  | 'landscapeLeft'
  | 'landscapeRight'
  | 'landscape'
  | 'all'
  | 'allButUpsideDown';

/** 状态栏的样式：`'darkContent'` 是黑字，`'lightContent'` 是白字，`'default'` 跟着深色浅色走。 */
type UIStatusBarStyle = 'default' | 'lightContent' | 'darkContent';

interface UIViewController {
  /**
   * 这个页面允许的方向。不写时是系统的默认值：四个方向都有。
   * 写入时运行时通知系统重新来问；空数组和不认识的名字不生效，打一条警告。
   */
  get supportedInterfaceOrientations(): UIInterfaceOrientation[];
  set supportedInterfaceOrientations(value: readonly UIInterfaceOrientationMaskName[]);
  /** 全屏弹出这个页面时，一出来是什么方向。 */
  preferredInterfaceOrientationForPresentation: UIInterfaceOrientation;
  /** 希望锁住方向（iOS 26）。系统只在场景占满屏幕、没被遮住时才锁。 */
  prefersInterfaceOrientationLocked: boolean;
  /** 希望状态栏藏起来。 */
  prefersStatusBarHidden: boolean;
  /** 希望状态栏用什么样式。 */
  preferredStatusBarStyle: UIStatusBarStyle;

  /** 通知系统重新来问允许的方向。写 `supportedInterfaceOrientations` 时运行时已经调了。 */
  setNeedsUpdateOfSupportedInterfaceOrientations(): void;
  /** 通知系统重新来问状态栏。写状态栏的两个属性时运行时已经调了。 */
  setNeedsStatusBarAppearanceUpdate(): void;
  /** 通知系统重新来问是否锁方向。写 `prefersInterfaceOrientationLocked` 时运行时已经调了。 */
  setNeedsUpdateOfPrefersInterfaceOrientationLocked(): void;
}

/** 场景的几何信息：方向、是不是锁着。读的那一刻的值。不能 `new`。 */
declare class UIWindowSceneGeometry extends NSObject {
  private constructor();
  readonly interfaceOrientation: UIInterfaceOrientation;
  readonly isInterfaceOrientationLocked: boolean;
  readonly isInteractivelyResizing: boolean;
}

/** 请求转屏时的偏好：想要哪几个方向。 */
declare class UIWindowSceneGeometryPreferencesIOS extends NSObject {
  /** 不给方向就是「没有偏好」；写错方向名抛 `TypeError`。 */
  constructor(interfaceOrientations?: readonly UIInterfaceOrientationMaskName[]);
  get interfaceOrientations(): UIInterfaceOrientation[];
  set interfaceOrientations(value: readonly UIInterfaceOrientationMaskName[]);
}

/** 状态栏此刻的样子。从 `scene.statusBarManager` 读。不能 `new`。 */
declare class UIStatusBarManager extends NSObject {
  private constructor();
  readonly isStatusBarHidden: boolean;
  readonly statusBarStyle: UIStatusBarStyle;
  /** 状态栏占的区域，单位 pt。藏起来时是 0 高。 */
  readonly statusBarFrame: CGRect;
}

/** 场景的 `geometrychange` 事件。当场派发：监听器在转屏动画里执行。不能取消。 */
declare class UIWindowSceneGeometryChangeEvent extends Event {
  constructor(type: string, init?: EventInit & Partial<Pick<UIWindowSceneGeometryChangeEvent, 'previousInterfaceOrientation'>>);
  /** 变化之前的方向。现在的方向读 `scene.effectiveGeometry`。 */
  readonly previousInterfaceOrientation: UIInterfaceOrientation;
}

// 合并进场景的事件表
interface UIWindowSceneEventMap {
  'geometrychange': UIWindowSceneGeometryChangeEvent;
}

interface UIWindowScene {
  /** 场景此刻的几何信息。每次读给一份新的。 */
  readonly effectiveGeometry: UIWindowSceneGeometry;
  /** 状态栏此刻的样子。 */
  readonly statusBarManager: UIStatusBarManager;
  /**
   * 请求转到某个方向。已经是偏好里的方向时当场兑现；系统拒绝（方向不被允许）时拒绝；
   * 否则等方向真的变过去再兑现。没有偏好的方向、参数不是偏好对象时当场抛 `TypeError`。
   */
  requestGeometryUpdateWithPreferences(preferences: UIWindowSceneGeometryPreferencesIOS): Promise<void>;
}
