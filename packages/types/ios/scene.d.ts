// iOS 原生符号。规则见 types/ios.d.ts 的说明。
//
// 场景。App 的一个 UI 实例，JS 创建界面的入口。

// ---------------------------------------------------------------------------
// 场景
// ---------------------------------------------------------------------------

declare class UIScene extends UIResponder {
  /** protected 而不是 private：自己不可直接构造，但挡不住子类。 */
  protected constructor();
}

/** 场景的持久身份。场景对象会被系统销毁重建，session 活得更久。 */
declare class UISceneSession extends NSObject {
  private constructor();
  /** ObjC 常量原值，比如 'UIWindowSceneSessionRoleApplication'。 */
  readonly role: string;
  readonly persistentIdentifier: string;
  /** 自定义数据，系统会帮忙持久化。 */
  userInfo: Record<string, unknown> | null;
}

/** 场景上能监听的事件。 */
type UISceneEventType = 'active' | 'inactive' | 'foreground' | 'background';

/**
 * 场景上每个事件名对应的事件对象。转屏的 `geometrychange` 在 page-overrides.d.ts
 * 里合并进来。
 */
interface UIWindowSceneEventMap {
  'active': Event;
  'inactive': Event;
  'foreground': Event;
  'background': Event;
  /** 整个场景的外观特征变了。 */
  'traitchange': UITraitChangeEvent;
}

declare class UIWindowScene extends UIScene {
  private constructor();
  /**
   * 整个场景的外观特征。系统设置里现在是深色还是浅色，读这里。
   * 变了会派发 `traitchange` 事件，事件对象是 `UITraitChangeEvent`。
   */
  readonly traitCollection: UITraitCollection;
  /** 这个场景自己的前后台状态，和 application.state（所有场景的聚合）不是一回事。 */
  readonly activationState: UISceneActivationState;
  readonly session: UISceneSession;
  readonly isFullScreen: boolean;
  /** 多任务切换器的卡片上显示的标题。 */
  title: string | null;
  subtitle: string;
  /** 场景级的打开 URL。application.openURL 是 App 级的，两者都有。options 同样还没接。 */
  openURL(url: string): Promise<boolean>;

  addEventListener<K extends keyof UIWindowSceneEventMap>(
    type: K,
    callback: ((event: UIWindowSceneEventMap[K]) => void) | null,
    options?: AddEventListenerOptions,
  ): void;
  /** 别的名字当自定义事件：`dispatchEvent` 是公开 API，JS 可以派发自己的事件。 */
  addEventListener(type: string, callback: EventListener | null, options?: AddEventListenerOptions): void;
  removeEventListener<K extends keyof UIWindowSceneEventMap>(
    type: K,
    callback: ((event: UIWindowSceneEventMap[K]) => void) | null,
  ): void;
  removeEventListener(type: string, callback: EventListener | null): void;
}
