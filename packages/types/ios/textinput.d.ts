// 输入框和键盘。
//
// UITextField **是 UIControl**，所以 16 个控件事件直接可用——
// 「文字变了」听 editingChanged 就行，不需要别的机制。

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
 * `editingDidBegin` / `editingChanged` / `editingDidEnd` / `editingDidEndOnExit`。
 */
declare class UITextField extends UIControl {
  constructor();

  text: string;
  placeholder: string | null;
  /** 正在编辑（已经是 first responder 且键盘起来了）。 */
  readonly isEditing: boolean;

  keyboardType: UIKeyboardType;
  returnKeyType: UIReturnKeyType;
  keyboardAppearance: UIKeyboardAppearance;
  /** 没有内容时回车键变灰。 */
  enablesReturnKeyAutomatically: boolean;

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
