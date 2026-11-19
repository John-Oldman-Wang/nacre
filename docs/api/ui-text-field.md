---
type: reference
native: UITextField
status: partial
---

# `UITextField`

**`UITextField`** 表示一个单行输入框。用户点它，系统键盘从屏幕底部弹出，输入的文字显示在框里。App 从 [`text`](ui-text-field/text.md) 读出框里的内容，从 [`selectedRange`](ui-text-field/selectedrange.md) 读出光标的位置和选中的范围，通过事件得知内容变了、光标动了、输入开始和结束了、用户按了回车。

输入框只有一行，按回车不会换行。多行输入用 [`UITextView`](ui-text-view.md)。

新建的输入框没有边框、没有内容、没有占位文字，放到页面上看不出哪里可以点。边框用 [`borderStyle`](ui-text-field/borderstyle.md) 设。输入框没有内建的长度限制、格式校验和只读模式：[`keyboardType`](ui-text-field/keyboardtype.md) 只决定弹出哪种键盘，不校验内容；要在修改发生之前拦下它，监听 [`beforeinput`](ui-text-field/beforeinput-event.md)。

键盘弹出时盖在页面上面，页面的大小和位置不变。让内容避开键盘用视图的 `keyboardLayoutGuide`，它是一个 [`UIKeyboardLayoutGuide`](ui-keyboard-layout-guide.md)。

输入框是[控件](ui-control.md)：禁用和 `focus`、`input`、`return`、`blur` 这些事件来自 `UIControl`。控件又是[视图](ui-view.md)：位置、大小、底色来自 `UIView`。

**继承关系**：`EventTarget` → `NSObject` → `UIResponder` → [`UIView`](ui-view.md) → [`UIControl`](ui-control.md) → `UITextField`

怎么做一个能用的输入框、怎么收起键盘、怎么不被键盘挡住、怎么做表单，见指南[做一个输入框](../guides/text-fields.md)。

## 构造函数

[`UITextField()`](ui-text-field/constructor.md)

创建一个输入框。没有边框，没有内容，大小是 0。

## 实例属性

还继承 [`UIControl`](ui-control.md) 和 [`UIView`](ui-view.md) 的属性。输入框常用的继承属性是 `isEnabled`、`isFirstResponder`、`tintColor`、`keyboardLayoutGuide`。

内容：

| 属性 | 说明 |
| --- | --- |
| [`text`](ui-text-field/text.md) | 框里的内容 |
| [`placeholder`](ui-text-field/placeholder.md) | 没有内容时显示的提示 |
| [`attributedText`](ui-text-field/attributedtext.md) | 带样式的内容 |
| [`attributedPlaceholder`](ui-text-field/attributedplaceholder.md) | 带样式的提示 |
| [`isEditing`](ui-text-field/isediting.md) <small>只读</small> | 是否正在输入 |
| [`hasText`](ui-text-field/hastext.md) <small>只读</small> | 是否有内容 |
| [`clearsOnBeginEditing`](ui-text-field/clearsonbeginediting.md) | 每次开始输入时是否清空原有内容 |
| [`clearsOnInsertion`](ui-text-field/clearsoninsertion.md) | 插入文字时是否换掉全部内容 |
| [`allowsEditingTextAttributes`](ui-text-field/allowseditingtextattributes.md) | 是否允许用户改文字的样式 |

选区：

| 属性 | 说明 |
| --- | --- |
| [`selectedRange`](ui-text-field/selectedrange.md) | 选中的范围，或者光标的位置 |

键盘：

| 属性 | 说明 |
| --- | --- |
| [`keyboardType`](ui-text-field/keyboardtype.md) | 弹出哪种键盘 |
| [`returnKeyType`](ui-text-field/returnkeytype.md) | 回车键上显示什么字 |
| [`keyboardAppearance`](ui-text-field/keyboardappearance.md) | 键盘的明暗 |
| [`enablesReturnKeyAutomatically`](ui-text-field/enablesreturnkeyautomatically.md) | 没有内容时回车键是否变灰 |
| [`inputAccessoryView`](ui-text-field/inputaccessoryview.md) | 键盘弹出时贴在键盘上面的视图 |
| [`inputView`](ui-text-field/inputview.md) | 代替系统键盘弹出的视图 |
| [`allowsNumberPadPopover`](ui-text-field/allowsnumberpadpopover.md) | 是否允许用数字键盘的浮层 |

输入行为：

| 属性 | 说明 |
| --- | --- |
| [`isSecureTextEntry`](ui-text-field/issecuretextentry.md) | 把内容显示成圆点，用于密码 |
| [`autocapitalizationType`](ui-text-field/autocapitalizationtype.md) | 自动大写的规则 |
| [`autocorrectionType`](ui-text-field/autocorrectiontype.md) | 是否自动纠错 |
| [`spellCheckingType`](ui-text-field/spellcheckingtype.md) | 是否检查拼写 |
| [`textContentType`](ui-text-field/textcontenttype.md) | 框里装的是什么内容，系统据此自动填充 |
| [`smartQuotesType`](ui-text-field/smartquotestype.md) | 是否把直引号换成弯引号 |
| [`smartDashesType`](ui-text-field/smartdashestype.md) | 是否把连续的短横线换成破折号 |
| [`smartInsertDeleteType`](ui-text-field/smartinsertdeletetype.md) | 粘贴和删除时是否自动调整空格 |
| [`inlinePredictionType`](ui-text-field/inlinepredictiontype.md) | 是否在光标后面显示预测的文字 |
| [`mathExpressionCompletionType`](ui-text-field/mathexpressioncompletiontype.md) | 是否自动算出算式的结果 |
| [`writingToolsBehavior`](ui-text-field/writingtoolsbehavior.md) | 写作工具能做到哪一步 |
| [`allowedWritingToolsResultOptions`](ui-text-field/allowedwritingtoolsresultoptions.md) | 写作工具可以写回哪几种内容 |

外观：

| 属性 | 说明 |
| --- | --- |
| [`borderStyle`](ui-text-field/borderstyle.md) | 边框的样子 |
| [`clearButtonMode`](ui-text-field/clearbuttonmode.md) | 右侧的清除按钮什么时候显示 |
| [`textAlignment`](ui-text-field/textalignment.md) | 文字的水平对齐 |
| [`font`](ui-text-field/font.md) | 文字的字体和字号 |
| [`textColor`](ui-text-field/textcolor.md) | 文字的颜色 |
| [`adjustsFontSizeToFitWidth`](ui-text-field/adjustsfontsizetofitwidth.md) | 内容比框宽时是否缩小字号 |
| [`minimumFontSize`](ui-text-field/minimumfontsize.md) | 缩小字号时最小到多少 |
| [`background`](ui-text-field/background.md) | 背景图 |
| [`disabledBackground`](ui-text-field/disabledbackground.md) | 禁用时的背景图 |
| [`leftView`](ui-text-field/leftview.md) | 框里左端的视图 |
| [`leftViewMode`](ui-text-field/leftviewmode.md) | 左端的视图什么时候显示 |
| [`rightView`](ui-text-field/rightview.md) | 框里右端的视图 |
| [`rightViewMode`](ui-text-field/rightviewmode.md) | 右端的视图什么时候显示 |

## 实例方法

还继承 [`UIControl`](ui-control.md) 和 [`UIView`](ui-view.md) 的方法。输入框常用的继承方法是 `becomeFirstResponder()`、`resignFirstResponder()`、`addEventListener()`，见[焦点](#焦点)。

改内容：

| 方法 | 说明 |
| --- | --- |
| [`insertText()`](ui-text-field/inserttext.md) | 按用户打字的方式在光标处插入文字 |
| [`deleteBackward()`](ui-text-field/deletebackward.md) | 按用户按删除键的方式删除 |

算各部分的位置。这几个方法返回输入框按给定的范围摆放某一部分时用的矩形：

| 方法 | 说明 |
| --- | --- |
| [`borderRectForBounds()`](ui-text-field/borderrectforbounds.md) | 边框的矩形 |
| [`textRectForBounds()`](ui-text-field/textrectforbounds.md) | 显示文字的矩形 |
| [`placeholderRectForBounds()`](ui-text-field/placeholderrectforbounds.md) | 显示提示的矩形 |
| [`editingRectForBounds()`](ui-text-field/editingrectforbounds.md) | 正在输入时文字的矩形 |
| [`clearButtonRectForBounds()`](ui-text-field/clearbuttonrectforbounds.md) | 清除按钮的矩形 |
| [`leftViewRectForBounds()`](ui-text-field/leftviewrectforbounds.md) | 左端视图的矩形 |
| [`rightViewRectForBounds()`](ui-text-field/rightviewrectforbounds.md) | 右端视图的矩形 |

## 事件

用 `addEventListener()` 监听。输入框的事件有三组：控件事件告诉 App 发生了什么，`selectionchange` 告诉 App 光标或选区动了，可取消的事件在事情发生之前问 App 要不要。

控件事件继承自 [`UIControl`](ui-control.md#事件)，输入框用到的是这四个：

| 事件 | 什么时候派发 |
| --- | --- |
| [`focus`](ui-control/focus-event.md) | 输入框成为 first responder，开始输入 |
| [`input`](ui-control/input-event.md) | 用户的输入让内容变了一次 |
| [`return`](ui-control/return-event.md) | 用户按了回车键 |
| [`blur`](ui-control/blur-event.md) | 输入框不再是 first responder，结束输入 |

输入框自己的事件：

| 事件 | 什么时候派发 |
| --- | --- |
| [`selectionchange`](ui-text-field/selectionchange-event.md) | 选区或光标的位置变了 |
| [`beforefocus`](ui-text-field/beforefocus-event.md) | 即将开始输入。可以取消 |
| [`beforeblur`](ui-text-field/beforeblur-event.md) | 即将结束输入。可以取消 |
| [`beforeinput`](ui-text-field/beforeinput-event.md) | 用户的输入即将改变内容。可以取消 |
| [`beforeclear`](ui-text-field/beforeclear-event.md) | 用户点了清除按钮，即将清空。可以取消 |
| [`beforereturn`](ui-text-field/beforereturn-event.md) | 用户按了回车键，即将按默认方式处理。可以取消 |

系统派发的是 [`UIControl`](ui-control.md#事件) 列出的 16 个控件事件、`traitchange`、`selectionchange` 和五个可取消的事件。监听别的名字不会报错：它被当成自定义事件，只有自己用 `dispatchEvent()` 派发时才会触发，见[事件名的限制](ui-control.md#事件)。

## 焦点

**first responder** 是 iOS 里「当前接收键盘输入的那个对象」，也就是焦点所在的对象。同一时刻最多只有一个。键盘跟着 first responder 走：输入框成为 first responder 时键盘弹出，它不再是 first responder 时键盘收起。没有单独「显示键盘」「隐藏键盘」的方法。

| 想做的事 | 写法 |
| --- | --- |
| 让输入框聚焦 | `field.becomeFirstResponder()` |
| 让输入框失焦 | `field.resignFirstResponder()`，或者 `page.view.endEditing(true)` |
| 判断输入框是否聚焦 | `field.isFirstResponder` |
| 得知输入框聚焦了、失焦了 | `focus`、`blur` 事件 |

这几个成员定义在 `UIResponder` 和 `UIView` 上，所有视图都有：

- **`becomeFirstResponder()`** 返回布尔。`true` 表示已经成为 first responder；`false` 表示系统拒绝了，什么都没有发生，键盘不弹出。
- **`resignFirstResponder()`** 返回布尔。`true` 表示已经不是 first responder。对象本来就不是 first responder 时的返回值**未在模拟器验证**。
- **`isFirstResponder`** 只读。新建的输入框是 `false`。
- **`canBecomeFirstResponder`** 只读。输入框是 `true`，普通的 `UIView` 是 `false`。**这两个值未在模拟器验证。**
- **`endEditing(true)`** 让一棵视图树里正在输入的那个输入框失焦，不需要知道是哪一个。

`becomeFirstResponder()` 在不同情况下的结果：

| 情况 | 结果 | 依据 |
| --- | --- | --- |
| 页面已经显示，没有切换在进行 | 返回 `true`，随后派发 `focus` | 实测 |
| 输入框已经是 first responder | 返回 `true` | 验收用例依赖这一点反复调用，没有单独的断言 |
| 页面正在切换（模态页面弹出或关闭的动画期间） | 返回 `false` | 实测 |
| 在 `sceneconnect` 的回调里，页面还没显示出来 | 返回 `true`，`isEditing` 是 `true`，但不派发 `focus` | 实测 |
| 输入框还没加到页面上 | 返回 `false` | **未在模拟器验证** |

另外两件事：

- **用户点输入框时，聚焦发生在手指按下的那一刻**，不等手指抬起（实测）。
- **点别处不会自动失焦。** 输入框保持 first responder，键盘留在屏幕上，直到有代码让它失焦，或者用户点了另一个输入框。**未在模拟器验证。**

## 一次输入派发哪些事件

| 用户的操作 | 派发 |
| --- | --- |
| 点输入框 | `focus`。实测在手指按下的那一刻 |
| 打三个字 | `input` 三次。**未在模拟器验证** |
| 按回车 | `return`。**未在模拟器验证** |
| 键盘收起 | `blur` |

可取消的事件排在对应的控件事件前面：实测聚焦一次的顺序是 `beforefocus` → `focus`。

`return` 和 `blur` 谁先谁后**未在模拟器验证**。用代码调 `becomeFirstResponder()` 和 `endEditing()` 时同样派发 `focus` 和 `blur`，这一点在验收用例里验证过。

控件事件的规则：

- 事件对象的 `type` 是事件名，`target` 是这个输入框。事件对象不带输入的内容，不带按了哪个键，也不带触点位置。内容从 `field.text` 读。
- 不能取消，`preventDefault()` 不起作用。要阻止某件事发生，用可取消的事件。
- 回调不是在事件发生的那一刻同步执行，而是稍后执行，见[回调的执行时机](ui-control.md#回调的执行时机)。回调里读到的 `field.text` 是执行时的内容；用户打字很快时，一次回调里读到的内容可能已经包含了后面几次按键。**未在模拟器验证。**
- 用代码改 `text` 不派发 `input`，这个事件只在用户的输入改变内容时派发。**未在模拟器验证。**
- 「用户输入完了」用 `blur`。没有「内容确认修改」这样单独的事件。
- 使用中文拼音这类输入法时，用户还没选字的拼音字母是否算进 `text`、这期间是否派发 `input`，**未在模拟器验证**。
- 回调里抛出异常不影响输入框，同一事件的其他回调照常执行。异常在 [`application`](application.md#没处理的异常不会让-app-退出) 上派发 `error`；没有监听器取消时，控制台输出以 `Uncaught` 开头的日志。

## 选区和光标

选区是输入框里选中的那一段文字。没有选中文字时，选区是一个长度为 0 的位置，也就是光标。[`selectedRange`](ui-text-field/selectedrange.md) 用一个 [`NSRange`](ns-range.md) 表示它：`location` 是起点，`length` 是长度，单位是 UTF-16 码元，和 JS 字符串的下标相同，所以 `field.text.slice(location, location + length)` 就是选中的文字。

输入框任何时候都有选区，没有在输入时也读得到、写得进去（实测）。没有在输入时屏幕上不显示光标和选中的底色。

表情和一部分汉字占两个码元。把光标放在这两个码元中间不会抛错，也不会被纠正：内容是 `'a😀b'` 时写 `(2, 0)`，读回来还是 `(2, 0)`（实测）。多行输入上实测在这样的位置插入文字会把这个字符拆成两半。自己算位置时要避开。

## 大小

输入框是视图，定位方式和其他视图一样，见 [Auto Layout](auto-layout.md)。所有尺寸的单位都是[点（pt）](units.md)。

- **用约束时，高度可以不给，宽度要自己给。** 输入框按字体算出自己的高度。宽度不给时，它按内容算宽度，内容是空的就很窄，并且会随着输入变宽。所以要约束左右两边，或者给一个固定宽度。**未在模拟器验证。**
- **用 `frame` 时，宽高都要自己给。** 不给的话宽高是 0，屏幕上什么都没有。

## 示例

### 输入名字

从空白 App 开始，在屏幕上方放一个输入框。用户每打一个字，下面的文字跟着变。按回车收起键盘。

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const field = new UITextField();
  field.placeholder = '输入你的名字';
  field.borderStyle = 'roundedRect';
  field.returnKeyType = 'done';

  const greeting = new UILabel();
  greeting.text = '你好';

  field.addEventListener('input', () => {
    greeting.text = field.text === '' ? '你好' : `你好，${field.text}`;
  });
  field.addEventListener('return', () => {
    field.resignFirstResponder();
    console.log('输入的是：' + field.text);
  });

  field.translatesAutoresizingMaskIntoConstraints = false;
  greeting.translatesAutoresizingMaskIntoConstraints = false;
  page.view.addSubview(field);
  page.view.addSubview(greeting);
  const safe = page.view.safeAreaLayoutGuide;
  NSLayoutConstraint.activateConstraints([
    field.topAnchor.constraintEqualToAnchor(safe.topAnchor, { constant: 24 }),
    field.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor, { constant: 16 }),
    field.trailingAnchor.constraintEqualToAnchor(safe.trailingAnchor, { constant: -16 }),
    greeting.topAnchor.constraintEqualToAnchor(field.bottomAnchor, { constant: 16 }),
    greeting.leadingAnchor.constraintEqualToAnchor(field.leadingAnchor),
  ]);
});
```

**效果**

- 屏幕上方出现一个圆角边框的输入框，里面是灰色的「输入你的名字」。下面一行字是「你好」。
- 点输入框，键盘从屏幕底部弹出，框里出现光标。
- 每打一个字，下面那行字变成「你好，」加上框里的内容。内容删光后变回「你好」。
- 按键盘右下角的回车键，键盘收起，控制台输出 `输入的是：` 加上框里的内容。

这段代码没有作为一个整体在模拟器运行过。其中用到的每个 API 都在验收用例里运行过。**外观（边框、占位文字的颜色、回车键上的字）和「每打一个字派发一次 `input`」未在模拟器验证。**

> **注意**：模拟器连着电脑的硬件键盘时，屏幕上的软键盘不弹出。这是模拟器的行为。要看到软键盘，在模拟器菜单里关掉硬件键盘连接。

### 密码框

```js
const secret = new UITextField();
secret.placeholder = '密码';
secret.borderStyle = 'roundedRect';
secret.textContentType = 'password';
secret.isSecureTextEntry = true;
secret.returnKeyType = 'done';
```

**效果**：打的每个字显示成圆点。点输入框时，系统可能在键盘上方列出保存过的账号。**未在模拟器验证。**

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[[UITextField alloc] init]` | `new UITextField()` |
| `field.text` | `field.text` |
| `field.placeholder = @"账号"` | `field.placeholder = '账号'` |
| `field.secureTextEntry = YES` | `field.isSecureTextEntry = true` |
| `field.keyboardType = UIKeyboardTypeNumberPad` | `field.keyboardType = 'numberPad'` |
| `field.returnKeyType = UIReturnKeyDone` | `field.returnKeyType = 'done'` |
| `field.textContentType = UITextContentTypeOneTimeCode` | `field.textContentType = 'oneTimeCode'` |
| `field.autocapitalizationType = UITextAutocapitalizationTypeNone` | `field.autocapitalizationType = 'none'` |
| `field.autocorrectionType = UITextAutocorrectionTypeNo` | `field.autocorrectionType = 'no'` |
| `field.borderStyle = UITextBorderStyleRoundedRect` | `field.borderStyle = 'roundedRect'` |
| `field.clearButtonMode = UITextFieldViewModeWhileEditing` | `field.clearButtonMode = 'whileEditing'` |
| `field.textColor = UIColor.labelColor` | `field.textColor = 'label'` |
| `field.editing` | `field.isEditing` |
| `field.hasText` | `field.hasText` |
| `[field insertText:@"你好"]` | `field.insertText('你好')` |
| `[field deleteBackward]` | `field.deleteBackward()` |
| `field.inputAccessoryView = toolbar` | `field.inputAccessoryView = toolbar` |
| 换了 `inputAccessoryView` 之后调 `[field reloadInputViews]` | 不需要。写 `inputAccessoryView` 当场生效 |
| `field.selectedTextRange`，再用 `offsetFromPosition:toPosition:` 换成偏移 | `field.selectedRange` |
| `field.selectedTextRange = [field textRangeFromPosition:start toPosition:end]` | `field.selectedRange = new NSRange(location, length)` |
| `[field addTarget:self action:@selector(changed) forControlEvents:UIControlEventEditingChanged]` | `field.addEventListener('input', changed)` |
| `[field becomeFirstResponder]` | `field.becomeFirstResponder()` |
| `[field resignFirstResponder]` | `field.resignFirstResponder()` |
| `field.isFirstResponder` | `field.isFirstResponder` |
| `[view endEditing:YES]` | `view.endEditing(true)` |
| `view.keyboardLayoutGuide.topAnchor` | `view.keyboardLayoutGuide.topAnchor` |

枚举的写法：去掉类型前缀，首字母小写。`UIKeyboardTypeEmailAddress` 写成 `'emailAddress'`。见[枚举](enums.md)。

`UITextFieldDelegate` 的方法和 JS 的对应：

| ObjC 的 delegate 方法 | JS |
| --- | --- |
| `textFieldDidBeginEditing:` | `focus` 事件 |
| `textFieldDidChangeSelection:` | `selectionchange` 事件 |
| `textFieldDidEndEditing:` | `blur` 事件 |
| `textFieldShouldReturn:` 里收键盘 | `return` 事件里调 `resignFirstResponder()` |
| `textFieldShouldBeginEditing:` 返回 `NO` | `beforefocus` 事件里调 `event.preventDefault()` |
| `textFieldShouldEndEditing:` 返回 `NO` | `beforeblur` 事件里调 `event.preventDefault()` |
| `textField:shouldChangeCharactersInRange:replacementString:` 返回 `NO` | `beforeinput` 事件里调 `event.preventDefault()`。两个参数在 `event.range` 和 `event.replacementString` |
| `textFieldShouldClear:` 返回 `NO` | `beforeclear` 事件里调 `event.preventDefault()` |
| `textFieldShouldReturn:` 返回 `NO` | `beforereturn` 事件里调 `event.preventDefault()` |

`UITextRange` 和 `UITextPosition` 没有提供：ObjC 里用它们表示选区的两端，JS 里选区直接是从内容开头数的 `NSRange`。

### 与浏览器 `<input>` 的对照

这张表只用来查对应关系，给熟悉 HTML 表单的人用。

| 浏览器 | Nacre | 差别 |
| --- | --- | --- |
| `input.value` | `field.text` | 没有内容时是空字符串，不是 `null` |
| `placeholder` | `placeholder` | 没设时读到 `null` |
| `type="password"` | `isSecureTextEntry = true` | 是一个布尔属性，不是一种类型 |
| `inputmode` | `keyboardType` | 只决定弹出哪种键盘，不校验内容 |
| `autocomplete` | `textContentType` | 取值是 iOS 定的一组名字 |
| `enterkeyhint` | `returnKeyType` | 只改回车键上的字，不改行为 |
| `input` 事件 | `input` 事件 | 事件对象不带内容，要读 `field.text` |
| `focus` / `blur` 事件 | `focus` / `blur` 事件 | — |
| `keydown` 里判断 Enter | `return` 事件 | — |
| `el.focus()` / `el.blur()` | `becomeFirstResponder()` / `resignFirstResponder()` | 有返回值，表示是否成功 |
| `document.activeElement === el` | `field.isFirstResponder` | — |
| `selectionStart`、`selectionEnd`、`setSelectionRange()` | `selectedRange` | 是起点加长度，不是起点加终点 |
| `selectionchange` 事件 | `selectionchange` 事件 | 事件对象不带选区，要读 `field.selectedRange` |
| `disabled` | `isEnabled = false` | — |
| `maxlength`、`pattern`、`required`、`readonly` | 没有 | 在 `beforeinput` 或 `input` 的回调里自己检查 |
| 表单的提交 | 没有 | 按回车派发 `return`，做什么由回调决定 |

## 还不能做的

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 得知输入法正在组字的那一段（拼音还没选字时） | `markedTextRange` |
| 按屏幕上的位置找到文字的位置，或者反过来 | `closestPositionToPoint:`、`caretRectForPosition:` 等 `UITextInput` 的成员 |
| 改文字到边框的内边距 | 覆写 `textRectForBounds:`。现在的做法见[自己画边框和底色](../guides/text-fields.md#自己画边框和底色) |
| 得知键盘弹出、收起的时刻和键盘的高度 | `UIKeyboardWillShowNotification` 等通知。避开键盘用 `keyboardLayoutGuide`，不需要这些 |
| 设置密码规则 | `passwordRules` |

## 参见

- [做一个输入框](../guides/text-fields.md)：读内容、收起键盘、避开键盘、限制输入、表单页
- [`UIControl`](ui-control.md)：输入框的父类，`isEnabled` 和全部 16 个事件
- [`UIView`](ui-view.md)：`endEditing()`、`keyboardLayoutGuide` 和安全区
- [`UIKeyboardLayoutGuide`](ui-keyboard-layout-guide.md)：让内容避开键盘
- [`NSRange`](ns-range.md)：`selectedRange` 的类型
- [`UITextView`](ui-text-view.md)：多行输入
- [`UISearchBar`](ui-search-bar.md)：搜索框，里面是一个输入框
- [富文本](ns-attributed-string.md)：`attributedText` 和 `attributedPlaceholder` 的类型
- [实现原理：输入框](../internals/text-input.md)
- [实现原理：事件](../internals/events.md)：点输入框时聚焦时机的实测
