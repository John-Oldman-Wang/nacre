// 枚举属性写错：不抛，打一条警告，值保持不变（2026-11-17 定）。
//
// 这张表是从类型定义里数出来的全部可写的枚举属性。每个属性做同一件事：
// 先换到一个不是初始值的取值（换得过去的话），再写一个不认识的值，看
//   - 没有抛
//   - 读回来还是写错之前的那个值
//   - 正好一条警告，里面有写错的那个值和「expected one of」
// 值是数组的（位掩码），写的是「原来的名字再加一个不认识的」：整次赋值不
// 生效，不是只应用认识的那几个。
//
// 方法参数和 options 里的枚举继续抛，表后面有几条对照。

/** @typedef {[string, boolean, string[]]} Row  属性名、是不是数组、类型定义里的取值 */

/** @type {[string, () => any, Row[]][]} */
const TARGETS = [
  ["CAAnimation", () => CABasicAnimation.animationWithKeyPath('opacity'), [
      ["fillMode", false, ["removed", "forwards", "backwards", "both"]],
  ]],
  ["CAGradientLayer", () => new CAGradientLayer(), [
      ["type", false, ["axial", "radial", "conic"]],
  ]],
  ["CAKeyframeAnimation", () => CAKeyframeAnimation.animationWithKeyPath('position'), [
      ["calculationMode", false, ["linear", "discrete", "paced", "cubic", "cubicPaced"]],
      ["rotationMode", false, ["auto", "autoReverse"]],
  ]],
  ["CALayer", () => new CALayer(), [
      ["cornerCurve", false, ["circular", "continuous"]],
      ["maskedCorners", true, ["minXMinY", "maxXMinY", "minXMaxY", "maxXMaxY"]],
  ]],
  ["CAPropertyAnimation", () => CABasicAnimation.animationWithKeyPath('opacity'), [
      ["keyPath", false, ["backgroundColor", "borderColor", "borderWidth", "bounds", "contents", "cornerRadius", "endPoint", "fillColor", "lineDashPhase", "lineWidth", "miterLimit", "opacity", "path", "position", "shadowColor", "shadowOffset", "shadowOpacity", "shadowRadius", "startPoint", "strokeColor", "strokeEnd", "strokeStart", "zPosition"]],
  ]],
  ["CAShapeLayer", () => new CAShapeLayer(), [
      ["fillRule", false, ["nonZero", "evenOdd"]],
      ["lineCap", false, ["butt", "round", "square"]],
      ["lineJoin", false, ["miter", "round", "bevel"]],
  ]],
  ["CNContactPickerViewController", () => new CNContactPickerViewController(), [
      ["displayedPropertyKeys", true, ["identifier", "namePrefix", "givenName", "middleName", "familyName", "previousFamilyName", "nameSuffix", "nickname", "organizationName", "departmentName", "jobTitle", "phoneticGivenName", "phoneticMiddleName", "phoneticFamilyName", "phoneticOrganizationName", "birthday", "nonGregorianBirthday", "note", "imageData", "thumbnailImageData", "imageDataAvailable", "contactType", "phoneNumbers", "emailAddresses", "postalAddresses", "dates", "urlAddresses", "contactRelations", "socialProfiles", "instantMessageAddresses"]],
  ]],
  ["NSMutableParagraphStyle", () => new NSMutableParagraphStyle(), [
      ["alignment", false, ["left", "center", "right", "justified", "natural"]],
      ["lineBreakMode", false, ["byWordWrapping", "byCharWrapping", "byClipping", "byTruncatingHead", "byTruncatingTail", "byTruncatingMiddle"]],
      ["baseWritingDirection", false, ["natural", "leftToRight", "rightToLeft"]],
  ]],
  ["NSTextContainer", () => new UITextView().textContainer, [
      ["lineBreakMode", false, ["byWordWrapping", "byCharWrapping", "byClipping", "byTruncatingHead", "byTruncatingTail", "byTruncatingMiddle"]],
  ]],
  ["UIActivityIndicatorView", () => new UIActivityIndicatorView(), [
      ["activityIndicatorViewStyle", false, ["medium", "large"]],
  ]],
  ["UIActivityViewController", () => new UIActivityViewController(['Nacre']), [
      ["excludedActivityTypes", true, ["postToFacebook", "postToTwitter", "postToWeibo", "message", "mail", "print", "copyToPasteboard", "assignToContact", "saveToCameraRoll", "addToReadingList", "postToFlickr", "postToVimeo", "postToTencentWeibo", "airDrop", "openInIBooks", "markupAsPDF", "sharePlay", "collaborationInviteWithLink", "collaborationCopyLink", "addToHomeScreen"]],
  ]],
  ["UIAlertController", () => UIAlertController.alertControllerWithTitle('t', { message: 'm', preferredStyle: 'alert' }), [
      ["severity", false, ["default", "critical"]],
  ]],
  ["UIBarButtonItem", () => new UIBarButtonItem({ title: 'A' }), [
      ["style", false, ["plain", "prominent", "done"]],
  ]],
  ["UIButton", () => UIButton.buttonWithType('system'), [
      ["role", false, ["normal", "primary", "cancel", "destructive"]],
  ]],
  ["UICollectionLayoutListConfiguration", () => new UICollectionLayoutListConfiguration('insetGrouped'), [
      ["headerMode", false, ["none", "firstItemInSection"]],
  ]],
  ["UIControl", () => new UIControl(), [
      ["contentHorizontalAlignment", false, ["center", "left", "right", "fill", "leading", "trailing"]],
      ["contentVerticalAlignment", false, ["center", "top", "bottom", "fill"]],
  ]],
  ["UIDatePicker", () => new UIDatePicker(), [
      ["datePickerMode", false, ["time", "date", "dateAndTime", "countDownTimer", "yearAndMonth"]],
      ["preferredDatePickerStyle", false, ["automatic", "wheels", "compact", "inline"]],
  ]],
  ["UIImagePickerController", () => new UIImagePickerController(), [
      ["cameraDevice", false, ["rear", "front"]],
      ["cameraFlashMode", false, ["off", "auto", "on"]],
  ]],
  ["UILabel", () => new UILabel(), [
      ["textAlignment", false, ["left", "center", "right", "justified", "natural"]],
      ["lineBreakMode", false, ["byWordWrapping", "byCharWrapping", "byClipping", "byTruncatingHead", "byTruncatingTail", "byTruncatingMiddle"]],
      ["baselineAdjustment", false, ["alignBaselines", "alignCenters", "none"]],
  ]],
  ["UIPageControl", () => new UIPageControl(), [
      ["backgroundStyle", false, ["automatic", "prominent", "minimal"]],
      ["direction", false, ["natural", "leftToRight", "rightToLeft", "topToBottom", "bottomToTop"]],
  ]],
  ["UIPanGestureRecognizer", () => new UIPanGestureRecognizer(), [
      ["allowedScrollTypesMask", true, ["discrete", "continuous"]],
  ]],
  ["UIProgressView", () => new UIProgressView(), [
      ["progressViewStyle", false, ["default", "bar"]],
  ]],
  ["UIScreenEdgePanGestureRecognizer", () => new UIScreenEdgePanGestureRecognizer(), [
      ["edges", true, ["top", "left", "bottom", "right"]],
  ]],
  ["UIScrollView", () => new UIScrollView(), [
      ["contentInsetAdjustmentBehavior", false, ["automatic", "scrollableAxes", "never", "always"]],
      ["indicatorStyle", false, ["default", "black", "white"]],
      ["keyboardDismissMode", false, ["none", "onDrag", "interactive", "onDragWithAccessory", "interactiveWithAccessory"]],
  ]],
  ["UISearchBar", () => new UISearchBar(), [
      ["barStyle", false, ["default", "black"]],
      ["searchBarStyle", false, ["default", "prominent", "minimal"]],
      ["keyboardType", false, ["default", "asciiCapable", "numbersAndPunctuation", "url", "numberPad", "phonePad", "namePhonePad", "emailAddress", "decimalPad", "twitter", "webSearch", "asciiCapableNumberPad", "alphabet"]],
      ["returnKeyType", false, ["default", "go", "google", "join", "next", "route", "search", "send", "yahoo", "done", "emergencyCall", "continue"]],
      ["keyboardAppearance", false, ["default", "dark", "light", "alert"]],
      ["autocapitalizationType", false, ["none", "words", "sentences", "allCharacters"]],
      ["autocorrectionType", false, ["default", "no", "yes"]],
      ["spellCheckingType", false, ["default", "no", "yes"]],
      ["textContentType", false, ["addressCity", "addressCityAndState", "addressState", "birthdate", "birthdateDay", "birthdateMonth", "birthdateYear", "cellularEID", "cellularIMEI", "cellularIMEI1", "cellularIMEI2", "cellularNAL", "countryName", "creditCardExpiration", "creditCardExpirationMonth", "creditCardExpirationYear", "creditCardFamilyName", "creditCardGivenName", "creditCardMiddleName", "creditCardName", "creditCardNumber", "creditCardSecurityCode", "creditCardType", "dateTime", "emailAddress", "familyName", "flightNumber", "fullStreetAddress", "givenName", "jobTitle", "location", "middleName", "name", "namePrefix", "nameSuffix", "newPassword", "nickname", "oneTimeCode", "organizationName", "password", "postalCode", "shipmentTrackingNumber", "streetAddressLine1", "streetAddressLine2", "sublocality", "telephoneNumber", "url", "username"]],
  ]],
  ["UISlider", () => new UISlider(), [
      ["sliderStyle", false, ["default", "thumbless"]],
  ]],
  ["UIStackView", () => new UIStackView(), [
      ["axis", false, ["horizontal", "vertical"]],
      ["distribution", false, ["fill", "fillEqually", "fillProportionally", "equalSpacing", "equalCentering"]],
      ["alignment", false, ["fill", "leading", "top", "firstBaseline", "center", "trailing", "bottom", "lastBaseline"]],
  ]],
  ["UISwipeGestureRecognizer", () => new UISwipeGestureRecognizer(), [
      ["direction", true, ["right", "left", "up", "down"]],
  ]],
  ["UITabBarController", () => new UITabBarController(), [
      ["tabBarMinimizeBehavior", false, ["automatic", "never", "onScrollDown", "onScrollUp"]],
  ]],
  ["UITextField", () => new UITextField(), [
      ["keyboardType", false, ["default", "asciiCapable", "numbersAndPunctuation", "url", "numberPad", "phonePad", "namePhonePad", "emailAddress", "decimalPad", "twitter", "webSearch", "asciiCapableNumberPad", "alphabet"]],
      ["returnKeyType", false, ["default", "go", "google", "join", "next", "route", "search", "send", "yahoo", "done", "emergencyCall", "continue"]],
      ["keyboardAppearance", false, ["default", "dark", "light", "alert"]],
      ["autocapitalizationType", false, ["none", "words", "sentences", "allCharacters"]],
      ["autocorrectionType", false, ["default", "no", "yes"]],
      ["spellCheckingType", false, ["default", "no", "yes"]],
      ["textContentType", false, ["addressCity", "addressCityAndState", "addressState", "birthdate", "birthdateDay", "birthdateMonth", "birthdateYear", "cellularEID", "cellularIMEI", "cellularIMEI1", "cellularIMEI2", "cellularNAL", "countryName", "creditCardExpiration", "creditCardExpirationMonth", "creditCardExpirationYear", "creditCardFamilyName", "creditCardGivenName", "creditCardMiddleName", "creditCardName", "creditCardNumber", "creditCardSecurityCode", "creditCardType", "dateTime", "emailAddress", "familyName", "flightNumber", "fullStreetAddress", "givenName", "jobTitle", "location", "middleName", "name", "namePrefix", "nameSuffix", "newPassword", "nickname", "oneTimeCode", "organizationName", "password", "postalCode", "shipmentTrackingNumber", "streetAddressLine1", "streetAddressLine2", "sublocality", "telephoneNumber", "url", "username"]],
      ["borderStyle", false, ["none", "line", "bezel", "roundedRect"]],
      ["clearButtonMode", false, ["never", "whileEditing", "unlessEditing", "always"]],
      ["textAlignment", false, ["left", "center", "right", "justified", "natural"]],
  ]],
  ["UITextView", () => new UITextView(), [
      ["textAlignment", false, ["left", "center", "right", "justified", "natural"]],
      ["keyboardType", false, ["default", "asciiCapable", "numbersAndPunctuation", "url", "numberPad", "phonePad", "namePhonePad", "emailAddress", "decimalPad", "twitter", "webSearch", "asciiCapableNumberPad", "alphabet"]],
      ["returnKeyType", false, ["default", "go", "google", "join", "next", "route", "search", "send", "yahoo", "done", "emergencyCall", "continue"]],
      ["keyboardAppearance", false, ["default", "dark", "light", "alert"]],
      ["autocapitalizationType", false, ["none", "words", "sentences", "allCharacters"]],
      ["autocorrectionType", false, ["default", "no", "yes"]],
      ["spellCheckingType", false, ["default", "no", "yes"]],
      ["textContentType", false, ["addressCity", "addressCityAndState", "addressState", "birthdate", "birthdateDay", "birthdateMonth", "birthdateYear", "cellularEID", "cellularIMEI", "cellularIMEI1", "cellularIMEI2", "cellularNAL", "countryName", "creditCardExpiration", "creditCardExpirationMonth", "creditCardExpirationYear", "creditCardFamilyName", "creditCardGivenName", "creditCardMiddleName", "creditCardName", "creditCardNumber", "creditCardSecurityCode", "creditCardType", "dateTime", "emailAddress", "familyName", "flightNumber", "fullStreetAddress", "givenName", "jobTitle", "location", "middleName", "name", "namePrefix", "nameSuffix", "newPassword", "nickname", "oneTimeCode", "organizationName", "password", "postalCode", "shipmentTrackingNumber", "streetAddressLine1", "streetAddressLine2", "sublocality", "telephoneNumber", "url", "username"]],
  ]],
  ["UIToolbar", () => new UIToolbar(), [
      ["barStyle", false, ["default", "black"]],
  ]],
  ["UIView", () => new UIView(), [
      ["overrideUserInterfaceStyle", false, ["unspecified", "light", "dark"]],
      ["contentMode", false, ["scaleToFill", "scaleAspectFit", "scaleAspectFill", "redraw", "center", "top", "bottom", "left", "right", "topLeft", "topRight", "bottomLeft", "bottomRight"]],
  ]],
  ["UIViewController", () => new UIViewController(), [
      ["modalPresentationStyle", false, ["automatic", "fullScreen", "pageSheet", "formSheet", "currentContext", "overFullScreen", "overCurrentContext", "popover", "custom", "none"]],
      ["modalTransitionStyle", false, ["coverVertical", "flipHorizontal", "crossDissolve", "partialCurl"]],
      ["overrideUserInterfaceStyle", false, ["unspecified", "light", "dark"]],
  ]],
  ["UNUserNotificationCenter", () => UNUserNotificationCenter.currentNotificationCenter(), [
      ["foregroundPresentationOptions", true, ["badge", "sound", "list", "banner"]],
  ]],
];

const BAD = '__nope__';

/** @param {unknown} v */
const show = (v) => (Array.isArray(v) ? '[' + v.join(',') + ']' : String(v));

/**
 * 接住这段代码期间的 console.warn。
 * @param {() => void} fn
 * @returns {string[]}
 */
function warningsDuring(fn) {
  /** @type {string[]} */
  const seen = [];
  const original = console.warn;
  console.warn = (...args) => { seen.push(args.map(String).join(' ')); };
  try { fn(); } finally { console.warn = original; }
  return seen;
}

/** @param {import("../main.js").StepContext} ctx */
export function stepEnumProperties(ctx) {
  const { assert } = ctx;
  console.log('--- 枚举属性写错：不抛，警告，值不变 ---');
  let checked = 0;
  for (const [className, make, rows] of TARGETS) {
    /** @type {any} */
    let target;
    try {
      target = make();
    } catch (err) {
      console.log('  ! ' + className + ' 在这台设备上建不出来（' +
                  (err instanceof Error ? err.message : String(err)).slice(0, 60) + '），它的枚举属性未验证');
      continue;
    }
    for (const [prop, isArray, values] of rows) {
      const name = className + '.' + prop;
      /** @type {unknown} */
      let initial;
      try {
        initial = target[prop];
      } catch (err) {
        console.log('  ! ' + name + ' 在这台设备上读不了（' +
                    (err instanceof Error ? err.message : String(err)).slice(0, 60) + '），未验证');
        continue;
      }
      // 换到一个不是初始值的取值：这样「值不变」验的是写错之前的值，不是默认值。
      // 有的属性在这个状态下换不过去（系统不接受），那就留在初始值上验
      if (!isArray) {
        for (const candidate of values) {
          if (candidate === initial) continue;
          try {
            target[prop] = candidate;
            if (target[prop] === candidate) break;
          } catch (err) { /* 这个取值在这里不能用，试下一个 */ }
        }
      }
      const before = show(target[prop]);
      /** @type {string} */
      let outcome;
      try {
        const warnings = warningsDuring(() => {
          target[prop] = isArray ? [...(/** @type {string[] | null} */ (target[prop]) || []), BAD] : BAD;
        });
        const after = show(target[prop]);
        const relevant = warnings.filter((w) => w.includes(BAD) && w.includes('expected one of'));
        outcome = (after === before ? '值不变' : '值变成了 ' + after + '（原来是 ' + before + '）') +
                  '，警告 ' + relevant.length + ' 条' +
                  (warnings.length === relevant.length ? '' : '（另有 ' + (warnings.length - relevant.length) + ' 条别的警告）');
      } catch (err) {
        outcome = '抛了 ' + (err instanceof Error ? err.name + ': ' + err.message : String(err)).slice(0, 80);
      }
      assert('枚举写错 ' + name, outcome, '值不变，警告 1 条');
      checked++;
    }
  }
  console.log('  枚举属性一共验了 ' + checked + ' 个');

  // ---- 别的写错方式 ----
  const label = new UILabel();
  label.textAlignment = 'center';
  for (const [what, bad] of /** @type {[string, unknown][]} */ ([
    ['null', null], ['数', 5], ['对象', {}], ['大小写不对', 'Center'], ['空串', ''],
  ])) {
    /** @type {string} */
    let outcome;
    try {
      const warnings = warningsDuring(() => { /** @type {any} */ (label).textAlignment = bad; });
      outcome = label.textAlignment + '，警告 ' + warnings.length + ' 条';
    } catch (err) {
      outcome = '抛了 ' + (err instanceof Error ? err.name : String(err));
    }
    assert('枚举写错：给' + what + '也是不抛、值不变', outcome, 'center，警告 1 条');
  }
  {
    const warnings = warningsDuring(() => { label.textAlignment = 'right'; });
    assert('写对的时候没有警告，照常生效', label.textAlignment + '，警告 ' + warnings.length + ' 条', 'right，警告 0 条');
  }
  {
    // 值是数组的属性给的不是数组：这不是「不认识的取值」，是类型不对，照旧抛
    const layer = new CALayer();
    let thrown = '没抛';
    // @ts-expect-error 故意给字符串
    try { layer.maskedCorners = 'minXMinY'; } catch (err) { thrown = err instanceof Error ? err.name : String(err); }
    assert('值是数组的枚举属性给了字符串：类型不对，照旧抛', thrown, 'TypeError');
  }

  // ---- 对照：方法参数和 options 里的枚举继续抛 ----
  /** @param {() => unknown} fn */
  const thrownName = (fn) => {
    try { fn(); return '没抛'; }
    catch (err) { return err instanceof Error ? err.name : String(err); }
  };
  assert('对照：options 里的枚举写错照旧抛（字重）',
         // @ts-expect-error 故意写错
         thrownName(() => UIFont.systemFontOfSize(17, { weight: 'bolt' })), 'TypeError');
  assert('对照：方法参数里的枚举写错照旧抛（按钮的状态）',
         // @ts-expect-error 故意写错
         thrownName(() => UIButton.buttonWithType('system').setTitle('x', { forState: 'pressed' })), 'TypeError');
  assert('对照：构造参数里的枚举写错照旧抛（列表的外观）',
         // @ts-expect-error 故意写错
         thrownName(() => new UICollectionLayoutListConfiguration('fancy')), 'TypeError');
  assert('对照：富文本属性里的线型写错照旧抛',
         // @ts-expect-error 故意写错
         thrownName(() => new NSAttributedString('a', { underlineStyle: ['wavy'] })), 'TypeError');
}
