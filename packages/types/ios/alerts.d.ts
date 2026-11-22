// iOS 原生符号。规则见 types/ios.d.ts 的说明。
//
// 系统弹窗和分享面板：UIAlertController（提示框和底部菜单）、UIAlertAction
// （弹窗上的按钮）、UIActivityViewController（系统分享面板）。
// 两个控制器都是页面，用 `presentViewController()` 弹出来。

/**
 * 弹窗上一个按钮的样式。
 *
 * - `default`：普通按钮
 * - `cancel`：取消。一个弹窗最多一个；系统把它放在固定的位置，底部菜单里
 *   点菜单外面的空白处等于点它
 * - `destructive`：会删东西、不能撤销的操作，标题是红色
 */
type UIAlertActionStyle = 'default' | 'cancel' | 'destructive';

/**
 * 弹窗的样式。
 *
 * - `alert`：屏幕中间的提示框，可以带输入框
 * - `actionSheet`：从屏幕底部升起来的菜单，不能带输入框
 */
type UIAlertControllerStyle = 'actionSheet' | 'alert';

/** 提示框的严重程度。`critical` 表示要用户立刻处理，系统可能换一种更醒目的样子。 */
type UIAlertControllerSeverity = 'default' | 'critical';

/** 弹窗按钮的事件名。只有一个：用户点了这个按钮。 */
type UIAlertActionEventType = 'click';

/** 弹窗按钮上每个事件名对应的事件对象。 */
interface UIAlertActionEventMap {
  'click': Event;
}

/**
 * 弹窗上的一个按钮。
 *
 * **没有构造函数**，用 `UIAlertAction.actionWithTitle()` 建；标题和样式建好
 * 之后不能改。用户点了它，弹窗先关掉，然后这个按钮派发
 * `click`。
 *
 * ```js
 * const remove = UIAlertAction.actionWithTitle('删除', { style: 'destructive' });
 * remove.addEventListener('click', () => deletePhoto());
 * alert.addAction(remove);
 * ```
 */
declare class UIAlertAction extends NSObject {
  private constructor();
  /**
   * 建一个按钮。`title` 必须有（空串可以）；`style` 必填，写错抛 `TypeError`。
   */
  static actionWithTitle(title: string, options: { style: UIAlertActionStyle }): UIAlertAction;
  addEventListener<K extends keyof UIAlertActionEventMap>(
    type: K,
    callback: ((event: UIAlertActionEventMap[K]) => void) | null,
    options?: AddEventListenerOptions,
  ): void;
  removeEventListener<K extends keyof UIAlertActionEventMap>(
    type: K,
    callback: ((event: UIAlertActionEventMap[K]) => void) | null,
  ): void;

  /** 按钮上的字。 */
  readonly title: string;
  readonly style: UIAlertActionStyle;
  /** 默认 `true`。`false` 时按钮是灰的、点不动。 */
  isEnabled: boolean;
}

/**
 * 弹窗上每个事件名对应的事件对象。页面的其余事件在弹窗上都不派发，只有继承来的
 * `traitchange`。
 */
interface UIAlertControllerEventMap {
  'traitchange': UITraitChangeEvent;
}

/**
 * 系统弹窗：屏幕中间的提示框（`alert`），或者从底部升起来的菜单
 * （`actionSheet`）。
 *
 * 它是一个页面，**没有构造函数**，用
 * `UIAlertController.alertControllerWithTitle()` 建，用
 * `presentViewController()` 弹出来。标题用继承来的 `title` 读写。
 *
 * ```js
 * const alert = UIAlertController.alertControllerWithTitle('删除这张照片？', {
 *   message: '删除之后不能恢复。',
 *   preferredStyle: 'alert',
 * });
 * alert.addAction(UIAlertAction.actionWithTitle('取消', { style: 'cancel' }));
 * vc.presentViewController(alert, { animated: true });
 * ```
 */
declare class UIAlertController extends UIViewController {
  private constructor();
  /**
   * 建一个弹窗。`title` 和 `message` 都可以是 `null`；`preferredStyle` 必填，
   * 建好之后不能改。
   */
  static alertControllerWithTitle(
    title: string | null,
    options: { message?: string | null; preferredStyle: UIAlertControllerStyle },
  ): UIAlertController;

  /**
   * 弹窗**没有自己的事件**。页面的 `beforedismiss` / `dismiss` /
   * `dismissattempt` 在弹窗上不能用，监听它们抛 `TypeError`；用户点了
   * 哪个按钮，在那个按钮（`UIAlertAction`）上监听 `click`。
   * 能监听的只有继承来的 `traitchange`。
   */
  addEventListener<K extends keyof UIAlertControllerEventMap>(
    type: K,
    callback: ((event: UIAlertControllerEventMap[K]) => void) | null,
    options?: AddEventListenerOptions,
  ): void;
  removeEventListener<K extends keyof UIAlertControllerEventMap>(
    type: K,
    callback: ((event: UIAlertControllerEventMap[K]) => void) | null,
  ): void;

  /** 标题下面的说明文字。 */
  message: string | null;
  readonly preferredStyle: UIAlertControllerStyle;
  /** 默认 `'default'`。 */
  severity: UIAlertControllerSeverity;

  /**
   * 加一个按钮。按钮在弹窗上的顺序就是加进来的顺序（取消样式的那个由
   * 系统安排位置）。
   *
   * 抛 `TypeError`：给的不是 `UIAlertAction`；已经有一个取消样式的按钮，
   * 又加一个。
   */
  addAction(action: UIAlertAction): void;
  /** 加进来的全部按钮。 */
  readonly actions: UIAlertAction[];
  /**
   * 提示框里加粗显示的那个按钮；接了键盘时按回车触发的也是它。默认 `null`。
   * 必须是已经用 `addAction()` 加进来的按钮，否则抛 `TypeError`。
   */
  preferredAction: UIAlertAction | null;

  /**
   * 加一个输入框，返回它。拿到之后照常配置（`placeholder`、
   * `isSecureTextEntry`、键盘类型…），用户点按钮之后从它的 `text` 读结果。
   *
   * 只有 `alert` 样式能加；`actionSheet` 上调它抛 `TypeError`。
   */
  addTextField(): UITextField;
  /** 加进来的全部输入框，没有就是空数组。 */
  readonly textFields: UITextField[];
}

/**
 * 系统自带的分享动作。
 *
 * 第三方 App 的分享扩展不在这张表里。它们出现在 `complete` 事件的
 * `activityType` 里时，是扩展自己的标识符（一个带点的字符串）。
 */
type UIActivityType =
  | 'postToFacebook' | 'postToTwitter' | 'postToWeibo' | 'message' | 'mail' | 'print'
  | 'copyToPasteboard' | 'assignToContact' | 'saveToCameraRoll' | 'addToReadingList'
  | 'postToFlickr' | 'postToVimeo' | 'postToTencentWeibo' | 'airDrop' | 'openInIBooks'
  | 'markupAsPDF' | 'sharePlay' | 'collaborationInviteWithLink' | 'collaborationCopyLink'
  | 'addToHomeScreen';

/** 分享面板里可以整块隐藏的分区。`peopleSuggestions` 是顶上那一排推荐的联系人。 */
type UIActivitySectionTypes = 'peopleSuggestions';

/** 分享面板自己的事件名。只有一个：面板结束了。 */
type UIActivityViewControllerEventType = 'complete';

/**
 * 分享面板上每个事件名对应的事件对象：自己的 `complete`，加上页面的 `traitchange`
 * 和模态的三个。页面出现和消失的四个在分享面板上不派发。
 */
interface UIActivityViewControllerEventMap
  extends Omit<UIViewControllerEventMap, UIViewControllerAppearanceEventType> {
  'complete': UIActivityViewControllerCompletionEvent;
}

/**
 * `complete` 事件带的数据。
 */
declare class UIActivityViewControllerCompletionEvent extends Event {
  constructor(type: string, init?: EventInit & Partial<Pick<UIActivityViewControllerCompletionEvent, 'activityType' | 'completed' | 'activityError'>>);
  /**
   * 用户选了哪个动作。系统自带的是 `UIActivityType` 里的名字；第三方扩展是
   * 它自己的标识符；没选任何动作就关掉了是 `null`。
   */
  readonly activityType: UIActivityType | (string & {}) | null;
  /** `true`：选的动作做完了。`false`：没做，包括用户直接把面板关掉。 */
  readonly completed: boolean;
  /** 动作失败时系统给的错误，`code` 和 `domain` 是原值；没有就是 `null`。 */
  readonly activityError: NSError | null;
}

/**
 * 系统分享面板：把文字、网址、图片交给别的 App 或系统动作（拷贝、隔空投送、
 * 存到相册…）。
 *
 * 它是一个页面，用 `presentViewController()` 弹出来。要分享的东西在构造时
 * 给，之后不能换；**一个面板用一次**，每次分享新建一个。
 *
 * ```js
 * const sheet = new UIActivityViewController(['看看这个', new URL('https://example.com')]);
 * sheet.addEventListener('complete', (e) => {
 *   console.log(e.completed ? '分享出去了' : '没分享');
 * });
 * vc.presentViewController(sheet, { animated: true });
 * ```
 */
declare class UIActivityViewController extends UIViewController {
  /**
   * `activityItems` 里可以放字符串（文字）、`URL`（网址）、`UIImage`（图片）。
   * 别的东西抛 `TypeError`。
   */
  constructor(activityItems: ReadonlyArray<string | URL | UIImage>);
  addEventListener<K extends keyof UIActivityViewControllerEventMap>(
    type: K,
    callback: ((event: UIActivityViewControllerEventMap[K]) => void) | null,
    options?: AddEventListenerOptions,
  ): void;
  /** 别的名字当自定义事件：`dispatchEvent` 是公开 API，JS 可以派发自己的事件。 */
  addEventListener(type: string, callback: EventListener | null, options?: AddEventListenerOptions): void;
  removeEventListener<K extends keyof UIActivityViewControllerEventMap>(
    type: K,
    callback: ((event: UIActivityViewControllerEventMap[K]) => void) | null,
  ): void;
  removeEventListener(type: string, callback: EventListener | null): void;

  /** 不想出现在面板里的系统动作。默认 `null`，一个都不排除。 */
  excludedActivityTypes: UIActivityType[] | null;
  /** 整块隐藏的分区。默认空数组。 */
  excludedActivitySectionTypes: UIActivitySectionTypes[];
  /** 默认 `true`：系统可以把某一个动作放大显示在面板顶部。`false` 是不许。 */
  allowsProminentActivity: boolean;
}
