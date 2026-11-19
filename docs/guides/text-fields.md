# 做一个输入框

这一篇讲怎么用 [`UITextField`](../api/ui-text-field.md) 做单行输入：读出内容、响应输入、弹出和收起键盘、不被键盘挡住、限制输入、做一个登录表单。每个属性、方法和事件的细节在 [`UITextField`](../api/ui-text-field.md) 的参考页。多行输入见[做一个多行输入框](multiline-text.md)，搜索框见[做一个搜索框](search.md)。

## 推荐的做法

- **边框用 `borderStyle = 'roundedRect'`。** 这是系统标准的输入框外观，文字左右自带间距。要别的外观时把输入框放进一个容器，见[自己画边框和底色](#自己画边框和底色)。
- **表单的底边约束到 `keyboardLayoutGuide.topAnchor`。** 一条约束同时适用于键盘弹出和收起两种情况，见[键盘避让：一条约束](#键盘避让一条约束)。
- **同时提供两种收起键盘的方式：按回车和点空白处。** 数字键盘这类键盘上没有回车键，只靠回车收不起来。
- **多个输入框时，回车跳到下一个，最后一个回车提交。** 用 `returnKeyType` 把回车键上的字设成对应的 `'next'` 和 `'done'`。
- **账号和密码框设 `textContentType`。** 系统据此提供自动填充，用户不用手打。
- **按内容设 `keyboardType`，账号和邮箱关掉自动大写和自动纠错。**

这几条合在一起的写法见[做一个表单页](#做一个表单页)。

## 第一个输入框

从空白 App 开始，在屏幕上方放一个输入框。用户每打一个字，下面的文字跟着变。按回车收起键盘。

```js
application.addEventListener('sceneconnect', (e) => {
  // 建窗口和页面。每个 App 都要有这几行
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 1. 创建输入框，设置外观
  const field = new UITextField();
  field.placeholder = '输入你的名字';   // 没有内容时显示的提示
  field.borderStyle = 'roundedRect';    // 圆角边框。不设就没有边框
  field.returnKeyType = 'done';         // 回车键上显示「完成」

  // 2. 创建一行文字，用来显示输入的内容
  const greeting = new UILabel();
  greeting.text = '你好';

  // 3. 内容每变一次，更新那行文字
  field.addEventListener('input', () => {
    greeting.text = field.text === '' ? '你好' : `你好，${field.text}`;
  });

  // 4. 按回车时收起键盘，并读出最终内容
  field.addEventListener('return', () => {
    field.resignFirstResponder();
    console.log('输入的是：' + field.text);
  });

  // 5. 放到页面上：输入框在顶部，左右各留 16 pt；文字在它下面
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

这段代码没有作为一个整体在模拟器运行过。其中用到的每个 API 都在验收用例里运行过。**上面四条里的外观（边框、占位文字的颜色、回车键上的字）和「每打一个字派发一次 `input`」未在模拟器验证。**

> **注意**：模拟器连着电脑的硬件键盘时，屏幕上的软键盘不弹出。这是模拟器的行为。要看到软键盘，在模拟器菜单里关掉硬件键盘连接。

五步分别是：创建并设外观、准备显示内容的地方、监听内容变化、处理回车、放到页面上。下面的每种用法都是在这五步上改，沿用 `field` 和 `page` 这两个变量。单独试某一节时，先写这几行：

```js
const page = new UIViewController();
const field = new UITextField();
page.view.addSubview(field);
```

## 新建的输入框为什么看不见

新建的输入框没有边框，没有内容，没有占位文字。把它放到页面上，看不出哪里可以点。

| 原因 | 处理 |
| --- | --- |
| 没有边框 | 设 [`borderStyle`](../api/ui-text-field/borderstyle.md)，默认是 `'none'` |
| 用约束定位，没给宽度 | 约束左右两边，或者给一个固定宽度。高度可以不给，输入框按字体算出自己的高度 |
| 用 `frame` 定位，没给宽高 | 宽高都要自己给，不给的话宽高是 0 |

## 收起键盘

键盘没有单独的「显示」「隐藏」方法，它跟着焦点走：输入框成为 first responder 时键盘弹出，它不再是 first responder 时键盘收起。first responder 是「当前接收键盘输入的那个对象」，见[焦点](../api/ui-text-field.md#焦点)。

| 想做的事 | 怎么发生 |
| --- | --- |
| 键盘弹出 | 用户点输入框。或者代码调用 `field.becomeFirstResponder()` |
| 键盘收起 | 代码调用 `field.resignFirstResponder()`，或者调用 `page.view.endEditing(true)` |

键盘的收起要由 App 的代码完成。用户点输入框以外的地方，键盘不会自己收起。**未在模拟器验证。** 所以每个带输入框的页面都要提供收起键盘的方式，常用的两种是[按回车时收起](#按回车时提交并收起键盘)和[点空白处收起](#点空白处收起键盘)。输入框放在滚动视图里时，还可以让用户[拖动内容时收起](scrolling.md#拖动列表时收起键盘)。

收起键盘有三种写法，结果相同：

| 写法 | 什么时候用 |
| --- | --- |
| `field.resignFirstResponder()` | 知道是哪个输入框 |
| `page.view.endEditing(true)` | 不知道是哪个，或者页面上有多个输入框 |
| 在 `return` 的回调里调上面任意一个 | 用户按回车时收起 |

## 能不能限制输入的内容

输入框没有内建的长度限制、格式校验和只读模式。

- `keyboardType` 只决定弹出哪种键盘，不校验内容。用户仍然可以粘贴别的字符。
- 限制长度、过滤字符，监听 [`beforeinput`](../api/ui-text-field/beforeinput-event.md)：系统在每次修改发生之前派发它，监听器里调 `preventDefault()`，这次修改就不发生。见[限制输入长度或过滤字符](#限制输入长度或过滤字符)。
- 不让输入框进入编辑、不让它失去焦点，监听 [`beforefocus`](../api/ui-text-field/beforefocus-event.md) 和 [`beforeblur`](../api/ui-text-field/beforeblur-event.md)。

## 读出用户输入的内容

```js
const name = field.text;
console.log(name.length);
```

**效果**：`field.text` 是框里当前的全部内容。没有内容时是空字符串 `''`，不是 `null`，可以直接取 `length`。

用代码写 `field.text = '张三'` 会把框里的内容换掉。用代码改 `text` 不派发 `input`，这个事件只在用户的输入改变内容时派发。**未在模拟器验证。** 要让代码的修改也派发 `input`，用 [`insertText()`](#用代码在光标处插入文字)。

写入的值不是字符串时按字符串转换。写 `null` 或 `undefined` 得到空字符串。

## 显示占位文字

```js
field.placeholder = '请输入账号';
```

**效果**：框里没有内容时显示这行提示，用户打第一个字后提示消失。**提示的颜色未在模拟器验证。**

设成 `null` 去掉提示。

## 实时响应输入变化

```js
field.addEventListener('input', () => {
  console.log('现在是：' + field.text);
});
```

**效果**：用户每打一个字、删一个字、粘贴一段文字，回调执行一次。**未在模拟器验证。**

事件对象的 `type` 是事件名，`target` 是这个输入框。事件对象不带内容，内容从 `field.text` 读。

回调在内容变化之后才执行，回调里读到的 `field.text` 是执行时的内容。用户打字很快时，一次回调里读到的内容可能已经包含了后面几次按键。**未在模拟器验证。**

使用中文拼音这类输入法时，用户还没选字的拼音字母是否算进 `text`、这期间是否派发 `input`，**未在模拟器验证**。

## 按回车时提交并收起键盘

```js
field.addEventListener('return', () => {
  field.resignFirstResponder();
  console.log('提交：' + field.text);
});
```

**效果**：用户按回车键，回调执行，键盘收起。验收用例里用的是这个写法；**用户真实按回车未在模拟器验证。**

单行输入框里按回车不会插入换行。

不调用 `resignFirstResponder()` 时，按回车后键盘是否留在屏幕上，**未在模拟器验证**。要收起键盘就在回调里明确调用它。

多个输入框时，在回调里让下一个输入框聚焦，键盘不收起，见[做一个表单页](#做一个表单页)。

## 做密码输入框

```js
field.isSecureTextEntry = true;
```

**效果**：打的每个字显示成圆点。`field.text` 读到的仍然是真实内容。**显示成圆点未在模拟器验证。**

## 让密码框可以切换显示明文

`isSecureTextEntry` 可以随时改。放一个按钮，点击时把它取反。

```js
const toggle = UIButton.buttonWithType('system');
toggle.setTitle('显示', { forState: ['normal'] });
toggle.addEventListener('click', () => {
  field.isSecureTextEntry = !field.isSecureTextEntry;
  toggle.setTitle(field.isSecureTextEntry ? '显示' : '隐藏', { forState: ['normal'] });
});
```

**效果**：点一下按钮，框里的圆点变成真实的文字，按钮上的字变成「隐藏」。再点一下变回圆点。按钮还需要加到页面上并定位，写法见 [`UIButton`](../api/ui-button.md)。**这个例子未在模拟器验证。**

## 弹出数字键盘或邮箱键盘

```js
field.keyboardType = 'numberPad';
```

**效果**：点输入框时弹出只有 0 到 9 的数字键盘。**未在模拟器验证。**

常用的几种：

| 想输入什么 | 取值 |
| --- | --- |
| 整数（验证码、数量） | `'numberPad'` |
| 带小数点的数（金额） | `'decimalPad'` |
| 邮箱 | `'emailAddress'` |
| 电话号码 | `'phonePad'` |
| 网址 | `'url'` |

全部 13 个取值见 [`keyboardType`](../api/ui-text-field/keyboardtype.md)。

> **注意**：`keyboardType` 只决定弹出哪种键盘，不校验内容。用户仍然可以粘贴别的字符进来，连着硬件键盘时也能打任何字符。需要校验时在 `input` 里检查 `field.text`。
>
> `'numberPad'`、`'decimalPad'`、`'phonePad'` 这几种键盘上没有回车键，用户没法按回车收起键盘。要另外提供收起键盘的方式，见[点空白处收起键盘](#点空白处收起键盘)和[在键盘上方放一排按钮](#在键盘上方放一排按钮)。**没有回车键这一点未在模拟器验证。**

## 改回车键上的字

```js
field.returnKeyType = 'search';
```

**效果**：键盘右下角的回车键上显示「搜索」。**未在模拟器验证。**

它只改键上的字，不改行为。不管显示什么字，按下去都是派发 `return`。全部取值见 [`returnKeyType`](../api/ui-text-field/returnkeytype.md)。

想让回车键在没有内容时不能按：

```js
field.enablesReturnKeyAutomatically = true;
```

**效果**：框里没有内容时回车键是灰色，按不动。打了字之后自动变成可按。**未在模拟器验证。**

## 让系统自动填充账号和密码

告诉系统每个框装的是什么，系统就能替用户填。

```js
const account = new UITextField();
account.placeholder = '账号';
account.textContentType = 'username';

const secret = new UITextField();
secret.placeholder = '密码';
secret.textContentType = 'password';
secret.isSecureTextEntry = true;
```

**效果**：点其中一个框时，键盘上方多出一栏，列出系统里保存过的账号。用户选一个，两个框一起填好。**未在模拟器验证。**

注册页面里新密码的框用 `'newPassword'`，系统会提议生成一个强密码。**未在模拟器验证。**

## 让系统自动填充短信验证码

```js
const code = new UITextField();
code.keyboardType = 'numberPad';
code.textContentType = 'oneTimeCode';
```

**效果**：手机收到带验证码的短信后，键盘上方出现这个验证码，用户点一下就填进框里。**未在模拟器验证。**

`textContentType` 的全部 48 个取值见 [`textContentType` 的取值](../api/ui-text-field/textcontenttype.md)。

## 关闭自动纠错和首字母大写

输入账号、邮箱、代码这类内容时，系统的自动修正会帮倒忙。

```js
field.autocapitalizationType = 'none';   // 不自动大写
field.autocorrectionType = 'no';         // 不自动纠错
field.spellCheckingType = 'no';          // 不在拼错的词下面画红线
```

**效果**：用户打什么就是什么。默认情况下，系统会把每句话的第一个字母改成大写，并且把它认为拼错的词替换掉。**未在模拟器验证。**

## 显示右侧的清除按钮

```js
field.clearButtonMode = 'whileEditing';
```

**效果**：输入框正在输入并且有内容时，右侧出现一个圆形的 × 按钮。点它清空全部内容。**未在模拟器验证。**

`'always'` 是一直显示，`'unlessEditing'` 是只在没有输入时显示，`'never'` 是不显示。

## 用代码聚焦和失焦

```js
const ok = field.becomeFirstResponder();   // 聚焦，键盘弹出
console.log(ok, field.isFirstResponder);

field.resignFirstResponder();              // 失焦，键盘收起
```

**效果**：`becomeFirstResponder()` 成功时返回 `true`，输入框开始输入，`isFirstResponder` 和 `isEditing` 都变成 `true`。`resignFirstResponder()` 之后两者都变回 `false`。

`becomeFirstResponder()` 可能被系统拒绝，这时返回 `false`，什么都不发生。所以不要忽略返回值。什么时候会被拒绝见 [first responder](../api/ui-text-field.md#焦点)。

## 读写光标的位置和选中的范围

```js
field.text = 'hello world';
field.selectedRange = new NSRange(0, 5);   // 选中 hello

const range = field.selectedRange;
console.log(range.location, range.length);
console.log(field.text.slice(range.location, range.location + range.length));

field.selectedRange = new NSRange(field.text.length, 0);   // 光标放到末尾
```

**效果**：输出 `0 5` 和 `hello`。

- `selectedRange` 是一个 [`NSRange`](../api/ns-range.md)：`location` 是起点，`length` 是选中了多少，单位是 UTF-16 码元，和 JS 字符串的下标相同。`length` 是 0 表示没有选中文字，只有一个光标。
- 输入框没有在输入时也能读写选区，写进去的读得回来（实测）。这时屏幕上看不到光标和选中的底色。
- 没有在输入时写的选区，到输入框开始输入之后还在不在，**未在模拟器验证**。要让用户看到光标在某个位置，在输入框开始输入之后再写，见下一节。

## 用代码在光标处插入文字

`insertText()` 按用户打字的方式改内容：插在光标的位置；有选中的文字时，换掉选中的部分。做一排「快捷输入」的按钮时用它，不用自己拼字符串、算光标。

```js
const domain = UIButton.buttonWithType('system');
domain.setTitle('@example.com', { forState: ['normal'] });
domain.addEventListener('click', () => {
  field.insertText('@example.com');
});
```

**效果**：点这个按钮，输入框里光标所在的位置插入 `@example.com`，光标移到它后面；有选中的文字时，选中的部分被换掉。监听了 `input` 的回调会执行一次。**未在模拟器验证**；验收用例里有对应的断言，它们写完之后还没有运行过。

删除用 `deleteBackward()`，效果和用户按一次删除键相同。

和直接写 `text` 的区别：

| | `field.text = …` | `insertText()` / `deleteBackward()` |
| --- | --- | --- |
| 改哪里 | 整个内容换掉 | 只改光标或选区那一处 |
| 派发 `input` | 不派发 | 派发 |
| 派发 `beforeinput` | 不派发 | 不派发 |

这张表里 `insertText()` / `deleteBackward()` 那一列**未在模拟器验证**。

## 开始输入时全选原有内容

```js
field.addEventListener('focus', () => {
  field.selectedRange = new NSRange(0, field.text.length);
});
```

**效果**：输入框开始输入时，里面的内容全部选中，用户直接打字就换掉原来的内容。**未在模拟器验证**，用户用手指点输入框时系统会不会随后把光标放到点的位置，没有量过。

## 光标动了的时候得到通知

```js
field.addEventListener('selectionchange', () => {
  const range = field.selectedRange;
  console.log('光标在 ' + range.location + '，选中了 ' + range.length + ' 个码元');
});
```

**效果**：代码写 `selectedRange` 时控制台输出一行（实测）。用户移动光标、拖动选区、打字时同样各输出一行，这一部分**未在模拟器验证**。

事件对象不带选区，在回调里读 `field.selectedRange`。回调是稍后执行的，读到的是回调执行那一刻的选区。

## 页面刚出现时自动聚焦

聚焦要等页面已经显示出来。页面显示出来时派发 `appear`，在它的回调里聚焦：

```js
page.addEventListener('appear', () => {
  field.becomeFirstResponder();
}, { once: true });
```

**效果**：页面的转场动画结束后，输入框自动开始输入，键盘弹出。

- 验收用例里验证过模态弹出的页面：在这个回调里调 `becomeFirstResponder()` 返回 `true`，输入框成为 first responder。窗口的根页面**未在模拟器验证**。
- `{ once: true }` 让它只在页面第一次出现时聚焦。不写的话，每次回到这个页面都会聚焦。
- `appear` 见 [`UIViewController`](../api/ui-view-controller.md#页面的出现和消失)。

不要在别的时机聚焦，两条都来自实测：

- **在 `sceneconnect` 的回调里直接调 `becomeFirstResponder()` 太早。** 它返回 `true`，`isEditing` 也是 `true`，但是 `focus` 事件不派发。
- **页面正在切换时会被拒绝。** 模态页面弹出或关闭的动画期间，`becomeFirstResponder()` 返回 `false`。

## 点空白处收起键盘

没有回车键的键盘（比如数字键盘）需要另一种收起方式。常见的做法是点输入框以外的地方收起。

推荐的写法是在页面的根视图上加一个点按的[手势识别器](../api/ui-gesture-recognizer.md)。识别器接收根视图和它所有子视图上的点按，所以回调里要先查出点到了哪个视图，点在输入框和按钮上时不收键盘。

```js
const dismiss = new UITapGestureRecognizer();
dismiss.cancelsTouchesInView = false;   // 不取消视图自己正在处理的触摸
dismiss.addEventListener('ended', (e) => {
  const { location } = /** @type {UIGestureRecognizerEvent} */ (e);
  if (location === null) return;
  // 点在控件（输入框、按钮）或它们的子视图上：不收键盘
  for (let v = page.view.hitTest(location); v !== null; v = v.superview) {
    if (v instanceof UIControl) return;
  }
  page.view.endEditing(true);
});
page.view.addGestureRecognizer(dismiss);
```

**效果**：点页面上控件以外的地方，键盘收起。点输入框和按钮时键盘不收起，它们照常响应。**这个例子未在模拟器验证。**

`page.view.endEditing(true)` 让页面里正在输入的那个输入框失焦。不需要知道是哪一个。

这个写法不需要改动页面的视图结构，页面上有文字、图片这些不是控件的视图时，点它们也能收起键盘。

另一种写法不用手势识别器：在页面最底层放一个铺满的 [`UIControl`](../api/ui-control.md)，用它接收点击。它只在点到没有别的视图的空白处时有效，点在文字和图片上是否有效取决于这些视图是否接收触摸。

```js
const backdrop = new UIControl();
backdrop.translatesAutoresizingMaskIntoConstraints = false;
page.view.insertSubview(backdrop, { atIndex: 0 });   // 放在所有内容的后面
NSLayoutConstraint.activateConstraints([
  backdrop.topAnchor.constraintEqualToAnchor(page.view.topAnchor),
  backdrop.bottomAnchor.constraintEqualToAnchor(page.view.bottomAnchor),
  backdrop.leadingAnchor.constraintEqualToAnchor(page.view.leadingAnchor),
  backdrop.trailingAnchor.constraintEqualToAnchor(page.view.trailingAnchor),
]);

backdrop.addEventListener('touchupinside', () => {
  page.view.endEditing(true);
});
```

**效果**：点页面上没有别的控件的地方，键盘收起。点输入框和按钮不受影响，因为它们在 `backdrop` 的前面。**这个例子未在模拟器验证。**

## 在键盘上方放一排按钮

`inputAccessoryView` 是键盘弹出时贴在键盘上面的一个视图，跟着键盘一起出现和消失。放一条[工具条](../api/ui-toolbar.md)，就得到键盘上方的一排按钮。数字键盘没有回车键，「完成」按钮通常放在这里。

```js
const amount = new UITextField();
amount.keyboardType = 'decimalPad';

const bar = new UIToolbar();
const done = UIBarButtonItem.systemItem('done');
done.addEventListener('click', () => amount.resignFirstResponder());
bar.items = [UIBarButtonItem.flexibleSpace(), done];
bar.sizeToFit();
amount.inputAccessoryView = bar;
```

**效果**：点输入框弹出数字键盘，键盘上面多一条工具条，右端是「完成」。点它，键盘收起，工具条跟着消失。**这个例子未在模拟器验证**；验收用例里有「输入框聚焦之后这个视图出现在屏幕上」的断言，它们写完之后还没有运行过。

`bar.sizeToFit()` 让工具条量出自己的高度。新建的工具条高度是 0，不调这一句它不占位置。

`inputAccessoryView` 可以是任何[视图](../api/ui-view.md)，不限于工具条。它的宽度由系统拉到和键盘一样宽，高度用它自己的。

几个输入框可以用同一个视图：

```js
const account = new UITextField();
const secret = new UITextField();
account.inputAccessoryView = bar;
secret.inputAccessoryView = bar;
done.addEventListener('click', () => page.view.endEditing(true));
```

**效果**：两个输入框的键盘上方是同一条工具条。点「完成」，正在输入的那一个结束输入。**未在模拟器验证。**

输入框正在输入时也可以换：写入新的视图后，键盘上方当场换成新的；写 `null` 当场去掉。输入框不会因此失去焦点。**未在模拟器验证。**

## 让输入框不被键盘挡住

把内容的底边约束到 `keyboardLayoutGuide` 的顶边。下面的例子在屏幕底部放一个输入框。

```js
const input = new UITextField();
input.borderStyle = 'roundedRect';
input.placeholder = '说点什么';
input.translatesAutoresizingMaskIntoConstraints = false;
page.view.addSubview(input);

const area = page.view.safeAreaLayoutGuide;
const keyboard = page.view.keyboardLayoutGuide;
NSLayoutConstraint.activateConstraints([
  input.leadingAnchor.constraintEqualToAnchor(area.leadingAnchor, { constant: 16 }),
  input.trailingAnchor.constraintEqualToAnchor(area.trailingAnchor, { constant: -16 }),
  // 这一条负责避开键盘
  input.bottomAnchor.constraintEqualToAnchor(keyboard.topAnchor, { constant: -16 }),
]);
```

**效果**

- 键盘收起时，输入框在屏幕底部，底边在安全区底边上方 16 pt。
- 键盘弹出时，输入框上移到键盘上方 16 pt。键盘收起后回到原位。验收用例只在软键盘真的弹出时检查上移；iOS 27.2 的模拟器上软键盘没有弹出，**在这个系统上未在模拟器验证**。

原理见[键盘避让：一条约束](#键盘避让一条约束)。

## 禁用输入框

```js
field.isEnabled = false;
```

**效果**：点输入框没有反应，键盘不弹出。设回 `true` 恢复。**未在模拟器验证。**

`isEnabled` 继承自 [`UIControl`](../api/ui-control.md)。

## 自己画边框和底色

`borderStyle` 只有四种固定的样子。想要别的样子，把输入框放进一个容器，边框、底色、圆角设在容器上。

```js
const box = new UIView();
box.backgroundColor = 'secondarySystemBackground';
box.layer.cornerRadius = 12;
box.translatesAutoresizingMaskIntoConstraints = false;
page.view.addSubview(box);

const inner = new UITextField();
inner.placeholder = '搜索';
inner.translatesAutoresizingMaskIntoConstraints = false;
box.addSubview(inner);

const boxArea = page.view.safeAreaLayoutGuide;
NSLayoutConstraint.activateConstraints([
  box.topAnchor.constraintEqualToAnchor(boxArea.topAnchor, { constant: 100 }),
  box.leadingAnchor.constraintEqualToAnchor(boxArea.leadingAnchor, { constant: 16 }),
  box.trailingAnchor.constraintEqualToAnchor(boxArea.trailingAnchor, { constant: -16 }),
  box.heightAnchor.constraintEqualToConstant(56),
  // 输入框在容器里左右各缩进 12 pt，垂直居中
  inner.leadingAnchor.constraintEqualToAnchor(box.leadingAnchor, { constant: 12 }),
  inner.trailingAnchor.constraintEqualToAnchor(box.trailingAnchor, { constant: -12 }),
  inner.centerYAnchor.constraintEqualToAnchor(box.centerYAnchor),
]);
```

**效果**：一个高 56 pt 的浅灰色圆角矩形，圆角半径 12 pt。文字从距离左边 12 pt 的地方开始。

输入框自己没有内边距属性。`borderStyle` 是 `'none'` 时文字紧贴输入框的左边，所以用容器留出间距。

## 改文字的字体、颜色和对齐

```js
field.font = UIFont.systemFontOfSize(20);
field.textColor = 'systemBlue';
field.textAlignment = 'center';
```

**效果**：框里的文字是 20 pt、蓝色、水平居中。**未在模拟器验证。**

字体见 [`UIFont`](../api/ui-font.md)，颜色的写法见[颜色](../api/ui-color.md)。

## 限制输入长度或过滤字符

输入框没有最大长度的属性。监听 `beforeinput`，在修改发生之前决定让不让它发生。

```js
field.addEventListener('beforeinput', (event) => {
  const { range, replacementString } = event;
  // 这次修改如果发生，输入框里会是什么
  const next = field.text.slice(0, range.location) + replacementString +
    field.text.slice(range.location + range.length);
  if (next.length > 6) {
    event.preventDefault();
  }
});
```

**效果**：输入框里已有 6 个字符时，再按键没有反应，字符不出现。粘贴一段会让总长超过 6 的文字，整段都不进去。删除照常。**未在模拟器验证**：这个事件只有真实的键盘输入会触发，自动跑的验收触发不了。

- `range` 是要被换掉的那一段，`replacementString` 是要换上去的文字，见 [`beforeinput` 带的数据](../api/ui-text-field/beforeinput-event.md)。
- 监听器执行完，系统才决定这次修改做不做。所以被拦下的字符不会先显示出来。
- 用代码写 `field.text`、调 `insertText()` 和 `deleteBackward()` 都不派发 `beforeinput`。后两个**未在模拟器验证**。

只允许数字的写法相同，换一个判断：

```js
field.addEventListener('beforeinput', (event) => {
  if (/[^0-9]/.test(event.replacementString)) {
    event.preventDefault();
  }
});
```

**效果**：按数字键照常输入，按别的键没有反应。粘贴的内容里只要有一个不是数字的字符，整段都不进去。**未在模拟器验证**，原因同上。

> **注意**：用拼音这类输入法时，还没选字的拼音字母也是一次次修改。这时 `beforeinput` 怎么派发**未在模拟器验证**，拦截它可能打断输入。

## 不让输入框失去焦点

内容不合格时把焦点留在输入框上，监听 `beforeblur`。

```js
field.addEventListener('beforeblur', (event) => {
  if (field.text === '') {
    event.preventDefault();
  }
});

field.becomeFirstResponder();
console.log(field.resignFirstResponder());
```

**效果**：输入框是空的，控制台输出 `false`，焦点还在输入框上，键盘不收起。输入了内容之后再调，输出 `true`。

- `preventDefault()` 之后 `resignFirstResponder()` 返回 `false`。
- `view.endEditing(true)` 是强制的，这时系统怎么处理**未在模拟器验证**。

## 做一个表单页

下面是一个登录表单：两个输入框和一个按钮。它包含[推荐的做法](#推荐的做法)里的全部几条。

```js
// 1. 账号框：回车键显示「下一项」
const account = new UITextField();
account.placeholder = '账号';
account.borderStyle = 'roundedRect';
account.textContentType = 'username';
account.autocapitalizationType = 'none';
account.autocorrectionType = 'no';
account.returnKeyType = 'next';

// 2. 密码框：回车键显示「完成」
const secret = new UITextField();
secret.placeholder = '密码';
secret.borderStyle = 'roundedRect';
secret.textContentType = 'password';
secret.isSecureTextEntry = true;
secret.returnKeyType = 'done';

const submit = UIButton.buttonWithType('system');
submit.setTitle('登录', { forState: ['normal'] });

// 3. 提交：先收起键盘，再读内容
function login() {
  page.view.endEditing(true);
  console.log('登录：' + account.text + '，密码长度 ' + secret.text.length);
}

// 4. 回车：账号框跳到密码框，密码框提交
account.addEventListener('return', () => {
  secret.becomeFirstResponder();
});
secret.addEventListener('return', login);
submit.addEventListener('click', login);

// 5. 点空白处收起键盘
const dismissTap = new UITapGestureRecognizer();
dismissTap.cancelsTouchesInView = false;
dismissTap.addEventListener('ended', (e) => {
  const { location } = /** @type {UIGestureRecognizerEvent} */ (e);
  if (location === null) return;
  for (let v = page.view.hitTest(location); v !== null; v = v.superview) {
    if (v instanceof UIControl) return;
  }
  page.view.endEditing(true);
});
page.view.addGestureRecognizer(dismissTap);

// 6. 布局：两个输入框在顶部，按钮的底边跟着键盘
for (const v of [account, secret, submit]) {
  v.translatesAutoresizingMaskIntoConstraints = false;
  page.view.addSubview(v);
}
const safeArea = page.view.safeAreaLayoutGuide;
const keyboardGuide = page.view.keyboardLayoutGuide;
NSLayoutConstraint.activateConstraints([
  account.topAnchor.constraintEqualToAnchor(safeArea.topAnchor, { constant: 24 }),
  account.leadingAnchor.constraintEqualToAnchor(safeArea.leadingAnchor, { constant: 16 }),
  account.trailingAnchor.constraintEqualToAnchor(safeArea.trailingAnchor, { constant: -16 }),
  secret.topAnchor.constraintEqualToAnchor(account.bottomAnchor, { constant: 12 }),
  secret.leadingAnchor.constraintEqualToAnchor(account.leadingAnchor),
  secret.trailingAnchor.constraintEqualToAnchor(account.trailingAnchor),
  submit.centerXAnchor.constraintEqualToAnchor(safeArea.centerXAnchor),
  submit.bottomAnchor.constraintEqualToAnchor(keyboardGuide.topAnchor, { constant: -16 }),
]);
```

**效果**

- 页面顶部是账号框和密码框，左右各留 16 pt。「登录」按钮在屏幕底部，底边在安全区底边上方 16 pt。
- 点账号框，键盘弹出，「登录」按钮上移到键盘上方 16 pt。
- 在账号框里按回车，光标跳到密码框，键盘不收起。
- 在密码框里按回车，或者点「登录」，键盘收起，控制台输出一行 `登录：` 加账号和密码长度。
- 点输入框和按钮以外的地方，键盘收起。

**这个例子没有作为一个整体在模拟器运行过。** 其中每个属性的读写、`becomeFirstResponder()`、`endEditing()`、`keyboardLayoutGuide` 的约束在验收用例里运行过。在 `return` 的回调里让另一个输入框聚焦时键盘不收起，**未在模拟器验证**。

## 键盘避让：一条约束

键盘从屏幕底部弹出，盖在页面上面。页面的大小和位置不变，被盖住的内容就看不到了。

每个视图有一个 `keyboardLayoutGuide` 属性。它是一个 layout guide，也就是不显示的矩形，只用来对齐。这个矩形代表键盘占的区域：

- **键盘收起时**，它的顶边在安全区的底边。安全区是屏幕上不被刘海和底部横条遮挡的区域，见 [`UIView`](../api/ui-view.md)。
- **键盘弹出时**，它的顶边在键盘的顶边。

所以把内容的底边约束到它的顶边，两种情况都是对的：

```js
const guide = page.view.keyboardLayoutGuide;
field.translatesAutoresizingMaskIntoConstraints = false;
field.bottomAnchor
  .constraintEqualToAnchor(guide.topAnchor, { constant: -16 })
  .isActive = true;
```

**效果**：键盘收起时，输入框的底边在安全区底边上方 16 pt（验收用例里核对过）。键盘弹出时，输入框的底边在键盘上方 16 pt。验收用例只在软键盘真的弹出时检查这一条；iOS 27.2 的模拟器上软键盘没有弹出，**在这个系统上未在模拟器验证**。

不需要监听键盘的弹出和收起，也不需要计算键盘的高度。位置由系统随键盘一起更新。**移动过程和键盘动画同步这一点未在模拟器验证。**

页面内容很长、放在[滚动视图](../api/ui-scroll-view.md)里时，把滚动视图的底边约束到 `keyboardLayoutGuide.topAnchor`。键盘弹出时滚动视图变矮，里面的内容仍然能滚到。**未在模拟器验证。**

实测：键盘收起时，`page.view.keyboardLayoutGuide.layoutFrame.height` 是 34 pt，等于屏幕底部横条占的安全区高度。可以用这个高度判断软键盘是否真的出现了。

约束的写法见 [Auto Layout](../api/auto-layout.md)。

## 自己算位置时：监听键盘的事件

不用约束、自己给视图设 `frame` 时，监听屏幕上的 [`keyboardchange`](../api/ui-screen/keyboardchange-event.md) 事件。事件带着键盘动画结束时的位置 `frame`，键盘的高度是 `frame.height`。

```js
const screen = e.scene.screen;   // 写在 sceneconnect 的回调里
screen.addEventListener('keyboardchange', (event) => {
  const keyboard = /** @type {UIScreenKeyboardEvent} */ (event);
  const top = Math.min(keyboard.frame.y, screen.bounds.height);
  field.frame = new CGRect(16, top - 16 - 40, 358, 40);
});
```

**效果**：键盘弹出时输入框跟着键盘一起往上移，停在键盘上方 16 pt；键盘收起时一起回到底部。两者同时开始、同时停下（实测：监听器里改的位置自动带上了和键盘相同的动画）。

**改动要在监听器里当场做完。** 监听器执行的那一刻正处在键盘的动画里，这时候设的 `frame`、改的约束才会跟着键盘动。放进 `setTimeout` 或者别的稍后执行的回调里，视图会直接跳到终点。

只要弹出或者只要收起的那一刻，分别监听 [`keyboardshow`](../api/ui-screen/keyboardshow-event.md) 和 [`keyboardhide`](../api/ui-screen/keyboardhide-event.md)。


## 参见

- [`UITextField`](../api/ui-text-field.md)：全部属性、方法和事件
- [`UIKeyboardLayoutGuide`](../api/ui-keyboard-layout-guide.md)：键盘所占的区域
- [`NSRange`](../api/ns-range.md)：选区的类型
- [手势识别器](../api/ui-gesture-recognizer.md)：点空白处收起键盘用到的点按识别器
- [`UIToolbar`](../api/ui-toolbar.md)：键盘上方的一排按钮
- [做一个能滚动的页面](scrolling.md)：表单很长时放进滚动视图
- [做一个多行输入框](multiline-text.md)
