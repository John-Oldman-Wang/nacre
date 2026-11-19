---
type: reference
native: UITextView
status: partial
---

# `UITextView`

**`UITextView`** 表示一块可以输入多行文字的区域。用户点它，系统键盘弹出；按回车是换行，不会结束输入。App 从 [`text`](ui-text-view/text.md) 读出全部内容，从 [`selectedRange`](ui-text-view/selectedrange.md) 读出光标的位置和选中的范围，通过事件得知内容变了、光标动了、输入开始和结束了。

多行输入是[滚动视图](ui-scroll-view.md)：内容超过它自己的高度时可以上下滚动，滚动视图的属性和事件它都有。把 `isScrollEnabled` 设成 `false` 之后，它不再滚动，而是文字有几行就要多高。它不是[控件](ui-control.md)，没有 `isEnabled`，也没有控件的那 16 个事件。只要一行的输入用 [`UITextField`](ui-text-field.md)。

和单行输入框相比：

| | `UITextField` | `UITextView` |
| --- | --- | --- |
| 行数 | 一行 | 多行，按回车换行 |
| 父类 | 控件 | 滚动视图 |
| 内容变了 | `input` 事件 | `input` 事件 |
| 开始、结束输入 | `focus`、`blur` | `focus`、`blur` |
| 按回车 | 派发 `return` | 换行，不派发事件 |
| 占位文字 | `placeholder` 属性 | 没有，要自己叠一个标签 |
| 边框 | `borderStyle` 有四种样式 | 没有可用的边框样式，用底色和圆角 |
| 在修改之前拦下 | `beforeinput` 等可取消的事件 | 没有 |
| 光标和选中的范围 | `selectedRange` | `selectedRange` |
| 光标或选区动了 | `selectionchange` 事件 | `selectionchange` 事件 |

九个键盘设置（`keyboardType`、`textContentType` 等）两边相同。

这一组页面里标「实测」的行为，是用不带界面的小程序在模拟器（iPhone Air，iOS 27.2）上量的。屏幕上的样子和真实键盘的行为标了「**未在模拟器验证**」。

**继承关系**：`EventTarget` → `NSObject` → `UIResponder` → [`UIView`](ui-view.md) → [`UIScrollView`](ui-scroll-view.md) → `UITextView`

和它一起用的两个类：[`NSRange`](ns-range.md) 表示一段文字的范围，[`NSTextContainer`](ns-text-container.md) 表示文字排版的区域。

怎么做占位文字、跟着内容长高的输入框、收起键盘，见指南[做一个多行输入框](../guides/multiline-text.md)。

## 构造函数

[`UITextView()`](ui-text-view/constructor.md)

创建一块多行输入。没有内容，没有设字体，大小是 0。

## 实例属性

还继承 [`UIScrollView`](ui-scroll-view.md) 和 [`UIView`](ui-view.md) 的属性。多行输入常用的继承属性是 [`isScrollEnabled`](ui-scroll-view/isscrollenabled.md)、[`keyboardDismissMode`](ui-scroll-view/keyboarddismissmode.md)、[`contentOffset`](ui-scroll-view/contentoffset.md)、`backgroundColor`、`isFirstResponder`。

内容：

| 属性 | 说明 |
| --- | --- |
| [`text`](ui-text-view/text.md) | 全部内容 |
| [`attributedText`](ui-text-view/attributedtext.md) | 带样式的内容 |
| [`hasText`](ui-text-view/hastext.md) <small>只读</small> | 是否有内容 |
| [`clearsOnInsertion`](ui-text-view/clearsoninsertion.md) | 插入文字时是否换掉全部内容 |
| [`allowsEditingTextAttributes`](ui-text-view/allowseditingtextattributes.md) | 是否允许用户改文字的样式 |
| [`dataDetectorTypes`](ui-text-view/datadetectortypes.md) | 把哪几类内容变成可以点的链接 |

外观：

| 属性 | 说明 |
| --- | --- |
| [`font`](ui-text-view/font.md) | 文字的字体 |
| [`textColor`](ui-text-view/textcolor.md) | 文字的颜色 |
| [`textAlignment`](ui-text-view/textalignment.md) | 文字靠哪边 |
| [`textContainerInset`](ui-text-view/textcontainerinset.md) | 文字离四边多远 |
| [`textContainer`](ui-text-view/textcontainer.md) <small>只读</small> | 文字排版的区域 |
| [`usesStandardTextScaling`](ui-text-view/usesstandardtextscaling.md) | 是否按标准的比例缩放文字 |

行为：

| 属性 | 说明 |
| --- | --- |
| [`isEditable`](ui-text-view/iseditable.md) | 用户能不能修改内容 |
| [`isSelectable`](ui-text-view/isselectable.md) | 用户能不能选中文字 |
| [`selectedRange`](ui-text-view/selectedrange.md) | 选中的范围，或者光标的位置 |
| [`isFindInteractionEnabled`](ui-text-view/isfindinteractionenabled.md) | 是否打开系统的查找和替换 |
| [`isWritingToolsActive`](ui-text-view/iswritingtoolsactive.md) <small>只读</small> | 写作工具是否正在工作 |
| [`writingToolsBehavior`](ui-text-view/writingtoolsbehavior.md) | 写作工具能做到哪一步 |
| [`allowedWritingToolsResultOptions`](ui-text-view/allowedwritingtoolsresultoptions.md) | 写作工具可以写回哪几种内容 |

键盘：

| 属性 | 说明 |
| --- | --- |
| [`keyboardType`](ui-text-view/keyboardtype.md) | 弹出哪种键盘 |
| [`returnKeyType`](ui-text-view/returnkeytype.md) | 回车键上显示什么字 |
| [`keyboardAppearance`](ui-text-view/keyboardappearance.md) | 键盘的明暗 |
| [`enablesReturnKeyAutomatically`](ui-text-view/enablesreturnkeyautomatically.md) | 没有内容时回车键是否变灰 |
| [`isSecureTextEntry`](ui-text-view/issecuretextentry.md) | 按密码的方式输入 |
| [`autocapitalizationType`](ui-text-view/autocapitalizationtype.md) | 自动大写的规则 |
| [`autocorrectionType`](ui-text-view/autocorrectiontype.md) | 是否自动纠错 |
| [`spellCheckingType`](ui-text-view/spellcheckingtype.md) | 是否检查拼写 |
| [`textContentType`](ui-text-view/textcontenttype.md) | 这里装的是什么内容，用于自动填充 |
| [`smartQuotesType`](ui-text-view/smartquotestype.md) | 是否把直引号换成弯引号 |
| [`smartDashesType`](ui-text-view/smartdashestype.md) | 是否把连续的短横线换成破折号 |
| [`smartInsertDeleteType`](ui-text-view/smartinsertdeletetype.md) | 粘贴和删除时是否自动调整空格 |
| [`inlinePredictionType`](ui-text-view/inlinepredictiontype.md) | 是否在光标后面显示预测的文字 |
| [`mathExpressionCompletionType`](ui-text-view/mathexpressioncompletiontype.md) | 是否自动算出算式的结果 |
| [`allowsNumberPadPopover`](ui-text-view/allowsnumberpadpopover.md) | 是否允许用数字键盘的浮层 |
| [`inputAccessoryView`](ui-text-view/inputaccessoryview.md) | 键盘弹出时贴在键盘上面的视图 |
| [`inputView`](ui-text-view/inputview.md) | 代替系统键盘弹出的视图 |

## 实例方法

还继承 [`UIScrollView`](ui-scroll-view.md) 和 [`UIView`](ui-view.md) 的方法。多行输入常用的继承方法是 `becomeFirstResponder()`、`resignFirstResponder()`，说明见 [`UITextField` 的焦点](ui-text-field.md#焦点)。

| 方法 | 说明 |
| --- | --- |
| [`insertText()`](ui-text-view/inserttext.md) | 按用户打字的方式在光标处插入文字 |
| [`deleteBackward()`](ui-text-view/deletebackward.md) | 按用户按删除键的方式删除 |
| [`scrollRangeToVisible()`](ui-text-view/scrollrangetovisible.md) | 滚动到一段文字看得见为止 |

## 事件

用 `addEventListener()` 监听。多行输入自己的事件有四个：

| 事件 | 什么时候派发 |
| --- | --- |
| [`focus`](ui-text-view/focus-event.md) | 它成为 first responder，开始输入 |
| [`input`](ui-text-view/input-event.md) | 用户的输入改了内容，或者代码调了 `insertText()`、`deleteBackward()` |
| [`selectionchange`](ui-text-view/selectionchange-event.md) | 选区或者光标的位置变了 |
| [`blur`](ui-text-view/blur-event.md) | 它不再是 first responder，结束输入 |
| [`scroll`](ui-scroll-view/scroll-event.md) 等 | 滚动视图的八个事件，继承自 [`UIScrollView`](ui-scroll-view.md#事件) |
| `traitchange` | [外观特征](ui-trait-collection.md)变化，继承自 `UIView` |

四个事件共同的规则：

- 事件对象的 `type` 是事件名，`target` 是这块多行输入。事件对象不带内容，也不带改了哪里。内容读 `text`，光标读 `selectedRange`。
- 不能取消，`preventDefault()` 不起作用。所以不能用它阻止某个字符进入。
- 回调不是在事件发生的那一刻同步执行，而是稍后执行，见[回调的执行时机](ui-control.md#回调的执行时机)。调完 `insertText()` 的下一行，回调还没有执行。
- 回调里抛出异常不影响多行输入，同一事件的其他回调照常执行。异常在 [`application`](application.md#没处理的异常不会让-app-退出) 上派发 `error`；没有监听器取消时，控制台输出以 `Uncaught` 开头的日志。
- 没有监听器时没有开销。
- 滚动视图的事件可以和这四个同时监听，互不影响（实测）。
- 监听别的名字不会报错：它被当成自定义事件，只有自己用 `dispatchEvent()` 派发时才会触发。

## 代码改内容和用户改内容

| 怎么改的 | 派发 `input` 吗 |
| --- | --- |
| 用户打字、删除、粘贴 | 派发（**未在模拟器验证**） |
| `insertText()`、`deleteBackward()` | 派发（实测） |
| 写 `text` | 不派发（实测） |

所以用代码写 `text` 之后，依赖内容的界面（字数、占位文字）要自己更新一次。反过来，在 `input` 的回调里写 `text` 不会再次触发回调。

## 大小

默认情况下多行输入的大小由 App 给：用约束或 `frame` 定出宽和高，内容超过这个高度就在里面滚动。

把 [`isScrollEnabled`](ui-scroll-view/isscrollenabled.md) 设成 `false` 之后，它不再滚动，而是有了自己想要的高度：文字有几行，它就要多高。用约束定位时只给左右和顶边，不给高度，它的高度跟着文字变（实测）。这一条在放进窗口之后才成立：没有放进窗口的多行输入，改了文字之后重新布局，高度还是原来的（实测）。

实测 17 pt 的字：一行 36 pt，三行 77 pt，五行 118 pt，六行 138 pt。没有设字体时一行是 30 pt。

## 示例

### 带字数的多行输入

从空白 App 开始，在屏幕上方放一块多行输入，下面一行字显示内容的长度。

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const input = new UITextView();
  input.font = UIFont.systemFontOfSize(17);
  input.backgroundColor = 'secondarySystemBackground';
  input.layer.cornerRadius = 10;
  input.keyboardDismissMode = 'onDrag';

  const counter = new UILabel();
  counter.text = '长度 0';
  counter.textColor = 'secondaryLabel';

  input.addEventListener('input', () => {
    counter.text = '长度 ' + input.text.length;
  });
  input.addEventListener('blur', () => {
    console.log('输入的是：' + input.text);
  });

  input.translatesAutoresizingMaskIntoConstraints = false;
  counter.translatesAutoresizingMaskIntoConstraints = false;
  page.view.addSubview(input);
  page.view.addSubview(counter);
  const safe = page.view.safeAreaLayoutGuide;
  NSLayoutConstraint.activateConstraints([
    input.topAnchor.constraintEqualToAnchor(safe.topAnchor, { constant: 24 }),
    input.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor, { constant: 16 }),
    input.trailingAnchor.constraintEqualToAnchor(safe.trailingAnchor, { constant: -16 }),
    input.heightAnchor.constraintEqualToConstant(160),
    counter.topAnchor.constraintEqualToAnchor(input.bottomAnchor, { constant: 8 }),
    counter.leadingAnchor.constraintEqualToAnchor(input.leadingAnchor),
  ]);
});
```

**效果**

- 屏幕上方出现一块灰色的圆角区域，下面一行灰色的字「长度 0」。
- 点灰色区域，键盘弹出，区域里出现光标。
- 每打一个字，下面那行字里的数字跟着变。按回车换到下一行。
- 文字超过 160 pt 的高度之后，可以在区域里上下滚动。
- 手指按住文字往下拖，键盘收起，控制台输出 `输入的是：` 加上全部内容。

这段代码没有作为一个整体在模拟器运行过，上面五条**未在模拟器验证**。其中每个属性的读写、`input` 和 `blur` 的派发在不带界面的小程序里量过。

> **注意**：模拟器连着电脑的硬件键盘时，屏幕上的软键盘不弹出。这是模拟器的行为。要看到软键盘，在模拟器菜单里关掉硬件键盘连接。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[[UITextView alloc] init]` | `new UITextView()` |
| `view.text` | `input.text` |
| `view.hasText` | `input.hasText` |
| `[view insertText:@"你好"]` | `input.insertText('你好')` |
| `[view deleteBackward]` | `input.deleteBackward()` |
| `view.font = [UIFont systemFontOfSize:17]` | `input.font = UIFont.systemFontOfSize(17)` |
| `view.textColor = UIColor.labelColor` | `input.textColor = 'label'` |
| `view.textAlignment = NSTextAlignmentCenter` | `input.textAlignment = 'center'` |
| `view.textContainerInset = UIEdgeInsetsMake(12, 12, 12, 12)` | `input.textContainerInset = new UIEdgeInsets(12, 12, 12, 12)` |
| `view.textContainer.lineFragmentPadding = 0` | `input.textContainer.lineFragmentPadding = 0` |
| `view.textContainer.maximumNumberOfLines = 3` | `input.textContainer.maximumNumberOfLines = 3` |
| `view.editable = NO` | `input.isEditable = false` |
| `view.selectable = NO` | `input.isSelectable = false` |
| `view.selectedRange = NSMakeRange(0, 5)` | `input.selectedRange = new NSRange(0, 5)` |
| `[view scrollRangeToVisible:range]` | `input.scrollRangeToVisible(range)` |
| `view.keyboardDismissMode = UIScrollViewKeyboardDismissModeOnDrag` | `input.keyboardDismissMode = 'onDrag'` |
| `view.inputAccessoryView = toolbar` | `input.inputAccessoryView = toolbar` |
| 换了 `inputAccessoryView` 之后调 `[view reloadInputViews]` | 不需要。写 `inputAccessoryView` 当场生效 |
| `view.scrollEnabled = NO` | `input.isScrollEnabled = false` |

枚举的写法：去掉类型前缀，首字母小写。见[枚举](enums.md)。

`UITextViewDelegate` 的方法和通知，与 JS 的对应：

| ObjC | JS |
| --- | --- |
| `textViewDidBeginEditing:`、`UITextViewTextDidBeginEditingNotification` | `focus` 事件 |
| `textViewDidChange:`、`UITextViewTextDidChangeNotification` | `input` 事件 |
| `textViewDidEndEditing:`、`UITextViewTextDidEndEditingNotification` | `blur` 事件 |
| `textViewDidChangeSelection:` | `selectionchange` 事件 |
| `textView:shouldChangeTextInRange:replacementText:` | 没有对应 |
| `textViewShouldBeginEditing:`、`textViewShouldEndEditing:` | 没有对应 |

### 与浏览器 `<textarea>` 的对照

这张表只用来查对应关系，给熟悉 HTML 表单的人用。

| 浏览器 | Nacre | 差别 |
| --- | --- | --- |
| `textarea.value` | `input.text` | — |
| `input` 事件 | `input` 事件 | 事件对象不带内容，要读 `input.text` |
| `focus` / `blur` 事件 | `focus` / `blur` 事件 | — |
| `selectionStart`、`selectionEnd` | `selectedRange` | 是起点加长度，不是起点加终点 |
| `setRangeText()` | `insertText()` | 只能换掉当前选中的部分 |
| `readonly` | `isEditable = false` | — |
| `placeholder` | 没有 | 叠一个标签 |
| `maxlength` | 没有 | 在 `input` 的回调里截断 |
| `rows` | 没有 | 高度由约束决定，或者关掉滚动让它跟着内容走 |
| `selectionchange` 事件 | `selectionchange` 事件 | 派发在这块多行输入上，不在 `document` 上。事件对象不带选区，要读 `input.selectedRange` |

## 还不能做的

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 在字符显示之前拦截：限制长度、过滤字符 | `textView:shouldChangeTextInRange:replacementText:`。单行输入框上对应的是 [`beforeinput`](ui-text-field/beforeinput-event.md)，多行的还没有接。现在只能[事后改回去](../guides/multiline-text.md#限制输入的长度) |
| 阻止开始输入、结束输入 | `textViewShouldBeginEditing:`、`textViewShouldEndEditing:` |
| 设置之后输入的文字的样式；链接的样式 | `typingAttributes`、`linkTextAttributes` |
| 占位文字 | 无。`UITextView` 本身没有这项能力，叠一个标签，见[显示占位文字](../guides/multiline-text.md#显示占位文字) |
| 同时选中不相连的几段 | `selectedRanges` |
| 系统样式的边框 | `borderStyle`。iOS 上它只有 `none` 一个取值。用底色、圆角，或者[图层](ca-layer.md)的 `borderWidth` 和 `borderColor` |
| 自定义长按出来的菜单 | `editMenuForTextInRange:` 等 |
| 调出系统的查找面板 | `findInteraction`。开关 [`isFindInteractionEnabled`](ui-text-view/isfindinteractionenabled.md) 有 |
| 自己建文字排版的区域，分栏排版 | `NSTextContainer` 的初始化方法、`NSLayoutManager` |

## 参见

- [做一个多行输入框](../guides/multiline-text.md)：占位文字、长高、只读、收起键盘、避开键盘
- [`UITextField`](ui-text-field.md)：单行输入、焦点、键盘设置
- [`UIScrollView`](ui-scroll-view.md)：多行输入的父类，滚动的属性和事件
- [`NSRange`](ns-range.md)、[`NSTextContainer`](ns-text-container.md)
- [`UILabel`](ui-label.md)：只显示、不需要选中的多行文字用它
- [富文本](ns-attributed-string.md)：`attributedText` 的类型
- [实现原理：多行输入](../internals/text-view.md)
