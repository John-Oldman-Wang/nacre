// 输入框和键盘。
//
// UITextField **是 UIControl**，所以 16 个控件事件直接可用——
// 「文字变了」听 input 就行，不需要别的机制。

/** 键盘长什么样。 */
type UIKeyboardType =
  | 'default' | 'asciiCapable' | 'numbersAndPunctuation' | 'url' | 'numberPad'
  | 'phonePad' | 'namePhonePad' | 'emailAddress' | 'decimalPad' | 'twitter'
  | 'webSearch' | 'asciiCapableNumberPad' | 'alphabet';

/** 回车键上印什么字。 */
type UIReturnKeyType =
  | 'default' | 'go' | 'google' | 'join' | 'next' | 'route' | 'search'
  | 'send' | 'yahoo' | 'done' | 'emergencyCall' | 'continue';

type UITextAutocapitalizationType = 'none' | 'words' | 'sentences' | 'allCharacters';
type UITextAutocorrectionType = 'default' | 'no' | 'yes';
type UITextSpellCheckingType = 'default' | 'no' | 'yes';
type UIKeyboardAppearance = 'default' | 'dark' | 'light' | 'alert';
type UITextBorderStyle = 'none' | 'line' | 'bezel' | 'roundedRect';
/** 清空按钮什么时候出现。 */
type UITextFieldViewMode = 'never' | 'whileEditing' | 'unlessEditing' | 'always';

/**
 * 这个框装的是什么。它不影响键盘长什么样，而是让系统替用户填：
 *
 * - `'username'` + `'password'`：密码自动填充，键盘上方出现钥匙串里的账号
 * - `'newPassword'`：注册页，系统生成强密码并提议保存
 * - `'oneTimeCode'`：短信验证码自动填充
 * - `'emailAddress'` / `'telephoneNumber'` / `'name'`：从通讯录提建议
 *
 * 不配就全都没有，用户得手打。
 */
type UITextContentType =
  | 'addressCity'
  | 'addressCityAndState'
  | 'addressState'
  | 'birthdate'
  | 'birthdateDay'
  | 'birthdateMonth'
  | 'birthdateYear'
  | 'cellularEID'
  | 'cellularIMEI'
  | 'cellularIMEI1'
  | 'cellularIMEI2'
  | 'cellularNAL'
  | 'countryName'
  | 'creditCardExpiration'
  | 'creditCardExpirationMonth'
  | 'creditCardExpirationYear'
  | 'creditCardFamilyName'
  | 'creditCardGivenName'
  | 'creditCardMiddleName'
  | 'creditCardName'
  | 'creditCardNumber'
  | 'creditCardSecurityCode'
  | 'creditCardType'
  | 'dateTime'
  | 'emailAddress'
  | 'familyName'
  | 'flightNumber'
  | 'fullStreetAddress'
  | 'givenName'
  | 'jobTitle'
  | 'location'
  | 'middleName'
  | 'name'
  | 'namePrefix'
  | 'nameSuffix'
  | 'newPassword'
  | 'nickname'
  | 'oneTimeCode'
  | 'organizationName'
  | 'password'
  | 'postalCode'
  | 'shipmentTrackingNumber'
  | 'streetAddressLine1'
  | 'streetAddressLine2'
  | 'sublocality'
  | 'telephoneNumber'
  | 'url'
  | 'username';

/**
 * 单行输入框。
 *
 * 它是 `UIControl`，所以[那 16 个事件](ui-control.md)直接可用：
 * `focus` / `input` / `blur` / `return`。
 */
/**
 * 输入框上「系统来问要不要」的五个事件。它们是**可取消**的，而且是当场派发的：
 * 监听器执行完，系统才决定做不做。在监听器里调 `preventDefault()` 就是「不要」。
 *
 * | 事件 | 系统在问 | 取消的效果 |
 * | --- | --- | --- |
 * | `beforefocus` | 要不要开始编辑 | 不进入编辑，`becomeFirstResponder()` 返回 `false` |
 * | `beforeblur` | 要不要结束编辑 | 焦点留在输入框上，`resignFirstResponder()` 返回 `false` |
 * | `beforeinput` | 这次修改让不让发生 | 文字不变。事件对象是 `UITextBeforeInputEvent` |
 * | `beforeclear` | 点了清除按钮，让不让清 | 不清空 |
 * | `beforereturn` | 按了回车，要不要按默认的处理 | 忽略这次回车 |
 */
type UITextFieldShouldEventType =
  | 'beforefocus'
  | 'beforeblur'
  | 'beforeinput'
  | 'beforeclear'
  | 'beforereturn';

/**
 * 选区或者光标的位置变了。用户移动光标、拖动选区、打字，以及代码写
 * `selectedRange`，都会派发。事件对象上不带选区，读 `event.target.selectedRange`；
 * 事件延后一轮派发，读到的是那一刻的选区。不可取消。
 */
type UITextFieldSelectionEventType = 'selectionchange';

/**
 * 单行和多行输入框的 `beforeinput` 的事件对象：这次修改打算把哪一段换成什么。
 */
declare class UITextBeforeInputEvent extends Event {
  constructor(type: string, init?: EventInit & Partial<Pick<UITextBeforeInputEvent, 'range' | 'replacementString'>>);
  /**
   * 要被换掉的那一段，单位是 UTF-16 码元，和 JS 字符串的下标一致。
   * 插入时 `length` 是 0；删除时是被删掉的长度。
   */
  readonly range: NSRange;
  /** 要换上去的文字。删除时是空串；粘贴时是整段粘贴的内容。 */
  readonly replacementString: string;
}

/**
 * 单行输入框上每个事件名对应的事件对象：控件的那些，加上五个可取消的
 * `before…` 事件（见 `UITextFieldShouldEventType`）和选区变化的 `selectionchange`。
 */
interface UITextFieldEventMap extends UIControlEventMap {
  'beforefocus': Event;
  'beforeblur': Event;
  'beforeinput': UITextBeforeInputEvent;
  'beforeclear': Event;
  'beforereturn': Event;
  'selectionchange': Event;
}

declare class UITextField extends UIControl {
  constructor();

  addEventListener<K extends keyof UITextFieldEventMap>(
    type: K,
    callback: ((event: UITextFieldEventMap[K]) => void) | null,
    options?: AddEventListenerOptions,
  ): void;
  removeEventListener<K extends keyof UITextFieldEventMap>(
    type: K,
    callback: ((event: UITextFieldEventMap[K]) => void) | null,
  ): void;

  text: string;
  placeholder: string | null;
  /** 正在编辑（已经是 first responder 且键盘起来了）。 */
  readonly isEditing: boolean;
  /** 有没有内容。 */
  readonly hasText: boolean;
  /**
   * 按用户打字的规矩改内容：插在光标处（`selectedRange`），有选区就换掉选中的
   * 那一段。和写 `text` 不同，它派发 `input`。
   */
  insertText(text: string): void;
  /** 有选区就删掉选中的，没有就删光标前面那一个。光标在开头时什么都不做。 */
  deleteBackward(): void;

  /**
   * 选中的范围，单位是 UTF-16 码元，和 JS 字符串的下标一致；`length` 为 0
   * 就是光标。形状和 `UITextView.selectedRange` 一样。
   *
   * 不在编辑时也读得到、写得进去；从没编辑过的输入框是 `(0, 0)`。
   * 越界不抛：位置超了停在末尾，长度超了变成 0。
   */
  get selectedRange(): NSRange;
  set selectedRange(value: NSRangeLike);

  keyboardType: UIKeyboardType;
  returnKeyType: UIReturnKeyType;
  keyboardAppearance: UIKeyboardAppearance;
  /** 没有内容时回车键变灰。 */
  enablesReturnKeyAutomatically: boolean;
  /**
   * 键盘弹出时贴在键盘上面的视图，最常见的是放一个 `UIToolbar`。默认 `null`。
   * 读回来的是写进去的那个对象。同一个视图可以给几个输入框；正在输入时换，
   * 当场生效。写了不是视图的值抛 `TypeError`。
   */
  inputAccessoryView: UIView | null;

  isSecureTextEntry: boolean;
  autocapitalizationType: UITextAutocapitalizationType;
  autocorrectionType: UITextAutocorrectionType;
  spellCheckingType: UITextSpellCheckingType;
  /** 没配过是 `null`。 */
  textContentType: UITextContentType | null;
  clearsOnBeginEditing: boolean;

  borderStyle: UITextBorderStyle;
  clearButtonMode: UITextFieldViewMode;
  textAlignment: NSTextAlignment;
  adjustsFontSizeToFitWidth: boolean;
  minimumFontSize: number;
  font: UIFont;
  get textColor(): string;
  set textColor(value: ColorValue | null);
}

/**
 * ObjC 里有这一层，但它那组「按边缘远近自动启停约束」的方法还没做。
 */
declare class UITrackingLayoutGuide extends UILayoutGuide {
  /** protected 而不是 private：自己不可构造，但 UIKeyboardLayoutGuide 要继承它。 */
  protected constructor();
}

/**
 * 键盘避让。**收起时它贴安全区底边，弹出时贴键盘顶边**，所以一条约束
 * 管两种状态：
 *
 * ```js
 * field.bottomAnchor
 *   .constraintEqualToAnchor(view.keyboardLayoutGuide.topAnchor, { constant: -16 })
 *   .isActive = true;
 * ```
 */
declare class UIKeyboardLayoutGuide extends UITrackingLayoutGuide {
  private constructor();
  /** iPad 的浮动/拆分键盘也跟。默认 `false`。 */
  followsUndockedKeyboard: boolean;
  /** 下滑收键盘时提前多少开始。默认 `0`。 */
  keyboardDismissPadding: number;
}
