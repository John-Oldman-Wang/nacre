// iOS 原生符号。规则见 types/ios.d.ts 的说明。
//
// 两个条状的视图：工具条和搜索框。

/**
 * 条的明暗样式。
 *
 * - `'default'` —— 跟随系统的浅色或深色
 * - `'black'` —— 深色的条
 *
 * ObjC 里另外两个值（`blackOpaque` / `blackTranslucent`）从 iOS 13 起废弃，没有接。
 */
type UIBarStyle = 'default' | 'black';

/**
 * 搜索框的样式。
 *
 * - `'default'` —— 现在等于 `'prominent'`
 * - `'prominent'` —— 搜索框带自己的背景
 * - `'minimal'` —— 没有背景，只有输入框
 */
type UISearchBarStyle = 'default' | 'prominent' | 'minimal';

/**
 * 搜索框的事件。
 *
 * - `'focus'` —— 开始输入（拿到了焦点，键盘弹出）
 * - `'blur'` —— 结束输入（交出了焦点）
 * - `'input'` —— 用户改了文字，包括点清空按钮。用代码写 `text` 不派发
 * - `'search'` —— 点了键盘上的「搜索」
 * - `'cancel'` —— 点了取消按钮
 * - `'bookmarkclick'` —— 点了书签按钮
 * - `'resultslistclick'` —— 点了结果列表按钮
 * - `'scopechange'` —— 用户换了范围按钮。用代码写 `selectedScopeButtonIndex` 不派发
 */
type UISearchBarEventType =
  | 'focus' | 'blur' | 'input' | 'search'
  | 'cancel' | 'bookmarkclick' | 'resultslistclick'
  | 'scopechange';

/** 搜索框上每个事件名对应的事件对象。 */
interface UISearchBarEventMap extends UIViewEventMap {
  'focus': Event;
  'blur': Event;
  'input': Event;
  'search': Event;
  'cancel': Event;
  'bookmarkclick': Event;
  'resultslistclick': Event;
  'scopechange': Event;
}

/**
 * 工具条：一横条，里面从左到右排着 `UIBarButtonItem`。
 *
 * ```js
 * const toolbar = new UIToolbar();
 * const add = UIBarButtonItem.systemItem('add');
 * add.addEventListener('click', () => createNote());
 * toolbar.items = [add, UIBarButtonItem.flexibleSpace(), UIBarButtonItem.systemItem('trash')];
 * ```
 *
 * 新建的工具条 `frame` 是 0 × 0。它自己想要的高是 48 pt，宽没有主意：用
 * Auto Layout 定位时只约束左右和上（或下），不用给高；用 `frame` 定位时
 * 给了宽之后调一次 `sizeToFit()`。
 *
 * 它不是控件，自己没有事件。点击来自里面的每个 `UIBarButtonItem`。
 */
declare class UIToolbar extends UIView {
  constructor();

  /**
   * 工具条上的项，从左到右。默认是空数组。
   *
   * 读出来的是一份快照，往里 `push` 不影响工具条；要改就整个重新赋值。
   * 写 `null` 是清空。项之间的空白用 `UIBarButtonItem.flexibleSpace()` 和
   * `fixedSpace()` 这两种项来占。
   */
  get items(): UIBarButtonItem[];
  set items(value: readonly UIBarButtonItem[] | null);
  /**
   * 换一组项。`animated` 为 `true` 时新加的淡入、去掉的淡出、留下的挪到
   * 新位置；`items` 属性当场就是新的那一组。
   */
  setItems(items: readonly UIBarButtonItem[] | null, options?: { animated?: boolean }): void;

  /** 默认 `'default'`。 */
  barStyle: UIBarStyle;
  /** 条的背景是不是半透明的。默认 `true`。 */
  isTranslucent: boolean;

  /**
   * 项的颜色（文字和图标）。读出来永远有值，没设过时是从外层视图继承来的
   * 颜色；写 `null` 是退回继承。
   */
  get tintColor(): string;
  set tintColor(value: ColorValue | null);
  /** 条自己的底色。默认 `null`，用系统的背景。 */
  get barTintColor(): string | null;
  set barTintColor(value: ColorValue | null);
}

/**
 * 搜索框：一个带放大镜图标的输入框，外加可选的取消按钮、书签按钮和一排
 * 范围按钮。
 *
 * ```js
 * const search = new UISearchBar();
 * search.placeholder = '搜索城市';
 * search.addEventListener('input', () => filter(search.text));
 * search.addEventListener('search', () => {
 *   search.resignFirstResponder();   // 收起键盘
 *   runSearch(search.text);
 * });
 * ```
 *
 * 新建的搜索框 `frame` 是 0 × 0。它自己想要的高是 64 pt（有 `prompt` 时
 * 98，显示范围条时 111），宽没有主意：用 Auto Layout 定位时只约束左右和上，
 * 不用给高。
 *
 * 它不是控件。事件来自它自己（见 `UISearchBarEventType`），不带数据：收到
 * 事件时读 `text` 和 `selectedScopeButtonIndex`。
 *
 * 弹出和收起键盘用继承来的 `becomeFirstResponder()` / `resignFirstResponder()`。
 */
declare class UISearchBar extends UIView {
  constructor();

  /** 输入框里的文字。没输入过是空串。用代码写它不派发 `input`。 */
  text: string;
  /**
   * 没有内容时显示的灰字。默认 `null`。
   *
   * 写 `null` 和写空串都是清掉它。清掉之后读回来是 `null` 还是空串，取决于
   * 清掉它的那一次写的是哪一种；判断「有没有」用 `!search.placeholder`。
   */
  placeholder: string | null;
  /** 输入框上面的一行说明。默认 `null`。有它的搜索框更高（98 pt）。 */
  prompt: string | null;
  /**
   * 搜索框里的那个输入框。它的 `text`、`placeholder` 和九个键盘设置
   * （`keyboardType`、`returnKeyType`……）和搜索框的是同一份：写哪一边，
   * 另一边都读得到。
   *
   * 它的 `clearButtonMode` 默认是 `'always'`。
   */
  readonly searchTextField: UITextField;

  /**
   * 键盘的布局。默认 `'default'`。
   *
   * 这九个键盘设置和 `UITextField`、`UITextView` 上的同名属性是同一组，
   * 取值也一样。写了不认识的值不抛：打一条警告，原值不变。
   */
  keyboardType: UIKeyboardType;
  /** 回车键上印什么字。搜索框上默认是 `'search'`（「搜索」）。 */
  returnKeyType: UIReturnKeyType;
  /**
   * 键盘是浅色还是深色。默认 `'default'`，跟随系统。
   * `'alert'` 是 `'dark'` 的别名：写得进去，读出来是 `'dark'`。
   */
  keyboardAppearance: UIKeyboardAppearance;
  /** 没有内容时回车键变灰。搜索框上默认是 `true`。 */
  enablesReturnKeyAutomatically: boolean;
  /** 把输入的字显示成圆点。默认 `false`。 */
  isSecureTextEntry: boolean;
  /** 自动大写。默认 `'sentences'`。 */
  autocapitalizationType: UITextAutocapitalizationType;
  /** 自动纠错。搜索框上默认是 `'no'`。 */
  autocorrectionType: UITextAutocorrectionType;
  /** 拼写检查。默认 `'default'`。 */
  spellCheckingType: UITextSpellCheckingType;
  /** 告诉系统这里填的是什么内容，用于自动填充。没配过是 `null`，写 `null` 清掉。 */
  textContentType: UITextContentType | null;

  /** 默认 `'default'`。 */
  barStyle: UIBarStyle;
  /** 默认 `'default'`。 */
  searchBarStyle: UISearchBarStyle;
  /** 条的背景是不是半透明的。默认 `true`。 */
  isTranslucent: boolean;
  /**
   * 默认 `true`。写 `false`：整个搜索框不收触摸（`isUserInteractionEnabled`
   * 跟着变成 `false`），里面的输入框也跟着禁用。
   */
  isEnabled: boolean;

  /** 显示取消按钮。默认 `false`。 */
  showsCancelButton: boolean;
  /** 带动画地显示或隐藏取消按钮。 */
  setShowsCancelButton(showsCancelButton: boolean, options?: { animated?: boolean }): void;
  /** 在输入框右端显示书签按钮。默认 `false`。 */
  showsBookmarkButton: boolean;
  /** 在输入框右端显示结果列表按钮。默认 `false`。 */
  showsSearchResultsButton: boolean;
  /** 结果列表按钮是不是选中的样子。默认 `false`。 */
  isSearchResultsButtonSelected: boolean;

  /**
   * 范围按钮的标题：输入框下面的一排分段按钮。默认是空数组。
   *
   * 读出来的是一份快照。写了标题不会自己显示出来，还要 `showsScopeBar = true`，
   * 并且至少要有两个标题。写 `null` 是清空。
   */
  get scopeButtonTitles(): string[];
  set scopeButtonTitles(value: readonly string[] | null);
  /**
   * 选中的是第几个范围按钮，从 0 数。默认 0。
   *
   * 超出范围的值不报错，照样存下来、读回来就是它。标题清空之后它是 -1。
   * 用代码写它不派发 `scopechange`。
   */
  selectedScopeButtonIndex: number;
  /** 显示范围条。默认 `false`。显示之后搜索框想要的高变成 111 pt。 */
  showsScopeBar: boolean;
  /** 带动画地显示或隐藏范围条。 */
  setShowsScopeBar(showsScopeBar: boolean, options?: { animated?: boolean }): void;

  /**
   * 光标和按钮的颜色。读出来永远有值，没设过时是从外层视图继承来的颜色；
   * 写 `null` 是退回继承。
   */
  get tintColor(): string;
  set tintColor(value: ColorValue | null);
  /** 条自己的底色。默认 `null`，用系统的背景。 */
  get barTintColor(): string | null;
  set barTintColor(value: ColorValue | null);

  /**
   * 键盘弹出时贴在键盘上面的视图。默认 `null`。常见的做法是放一个
   * `UIToolbar`，上面一个「完成」按钮。
   */
  inputAccessoryView: UIView | null;

  /**
   * 事件名只能是表里的这些：写错了类型检查会报。运行时不拒绝不认识的名字，
   * 当自定义事件（只有自己 `dispatchEvent` 才会收到）。
   */
  addEventListener<K extends keyof UISearchBarEventMap>(
    type: K,
    callback: ((event: UISearchBarEventMap[K]) => void) | null,
    options?: AddEventListenerOptions,
  ): void;
  removeEventListener<K extends keyof UISearchBarEventMap>(
    type: K,
    callback: ((event: UISearchBarEventMap[K]) => void) | null,
  ): void;
}
