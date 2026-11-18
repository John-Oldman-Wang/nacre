---
type: reference
native: UITextField
status: partial
---

# `UITextField`

**`UITextField`** 表示一个单行输入框。用户点它，系统键盘从屏幕底部弹出，输入的文字显示在框里。App 从 `text` 属性读出框里的内容，从 `selectedRange` 读出光标的位置和选中的范围，通过事件得知内容变了、光标动了、输入开始和结束了、用户按了回车。

输入框是[控件](ui-control.md)，也是[视图](ui-view.md)。禁用和事件来自控件，位置、大小、底色来自视图。输入框只有一行，按回车不会换行。多行输入用 [`UITextView`](ui-text-view.md)。

## 键盘什么时候弹出，怎么收起

键盘没有单独的「显示」「隐藏」方法。键盘跟着 first responder 走。first responder 是 iOS 里「当前接收键盘输入的那个对象」，同一时刻最多只有一个。输入框成为 first responder 时键盘弹出，它不再是 first responder 时键盘收起。

| 想做的事 | 怎么发生 |
| --- | --- |
| 键盘弹出 | 用户点输入框。或者代码调用 `field.becomeFirstResponder()` |
| 键盘收起 | 代码调用 `field.resignFirstResponder()`，或者调用 `page.view.endEditing(true)` |

键盘的收起要由 App 的代码完成。用户点输入框以外的地方，键盘不会自己收起。**未在模拟器验证。** 所以每个带输入框的页面都要提供收起键盘的方式，常用的两种是[按回车时收起](#按回车时提交并收起键盘)和[点空白处收起](#点空白处收起键盘)。输入框放在滚动视图里时，还可以让用户[拖动内容时收起](ui-scroll-view.md#拖动列表时收起键盘)。

`becomeFirstResponder()` 可能被系统拒绝，这时它返回 `false`，键盘不弹出。什么时候被拒绝见 [first responder：焦点](#first-responder焦点)。

## 键盘会不会挡住输入框

会。键盘盖在页面上面，页面的大小和位置不变。位于屏幕下半部分的内容在键盘弹出后被盖住，系统不会自动把它移到看得见的位置。**不做处理时被盖住这一点未在模拟器验证。**

处理的办法是一条约束：把内容的底边约束到 `keyboardLayoutGuide` 的顶边，内容就跟着键盘上下移动，见[键盘避让：一条约束](#键盘避让一条约束)。不需要监听键盘的弹出和收起，也不需要知道键盘的高度。

位于屏幕上方、键盘盖不到的输入框不需要处理。

## 新建的输入框是什么样

新建的输入框没有边框，没有内容，没有占位文字。把它放到页面上，看不出哪里可以点。

- **边框**用 `borderStyle` 设，默认是 `'none'`。
- **高度**可以不给，输入框按字体算出自己的高度。
- **宽度**要给。用约束固定左右两边，或者给一个固定宽度，见[位置和大小](#位置和大小)。

## 能不能限制输入的内容

输入框没有内建的长度限制、格式校验和只读模式。

- `keyboardType` 只决定弹出哪种键盘，不校验内容。用户仍然可以粘贴别的字符。
- 限制长度、过滤字符，监听 `beforeinput` 事件：系统在每次修改发生之前派发它，监听器里调 `preventDefault()`，这次修改就不发生。见[限制输入长度或过滤字符](#限制输入长度或过滤字符)。
- 不让输入框进入编辑、不让它失去焦点，监听 `beforefocus` 和 `beforeblur`，见[可取消的事件](#可取消的事件)。

## 推荐的做法

- **边框用 `borderStyle = 'roundedRect'`。** 这是系统标准的输入框外观，文字左右自带间距。要别的外观时把输入框放进一个容器，见[自己画边框和底色](#自己画边框和底色)。
- **表单的底边约束到 `keyboardLayoutGuide.topAnchor`。** 一条约束同时适用于键盘弹出和收起两种情况。
- **同时提供两种收起键盘的方式：按回车和点空白处。** 数字键盘这类键盘上没有回车键，只靠回车收不起来。
- **多个输入框时，回车跳到下一个，最后一个回车提交。** 用 `returnKeyType` 把回车键上的字设成对应的 `'next'` 和 `'done'`。
- **账号和密码框设 `textContentType`。** 系统据此提供自动填充，用户不用手打。
- **按内容设 `keyboardType`，账号和邮箱关掉自动大写和自动纠错。**

这几条合在一起的写法见[做一个表单页](#做一个表单页)。

## 完整例子

下面的代码从空白 App 开始，在屏幕上方放一个输入框。用户每打一个字，下面的文字跟着变。按回车收起键盘。

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

五步分别是：创建并设外观、准备显示内容的地方、监听内容变化、处理回车、放到页面上。后面的每种用法都是在这五步上改。

## 常见用法

以下例子都假设已经有上面的 `field` 和 `page`。

### 读出用户输入的内容

```js
const name = field.text;
console.log(name.length);
```

**效果**：`field.text` 是框里当前的全部内容。没有内容时是空字符串 `''`，不是 `null`，可以直接取 `length`。

用代码写 `field.text = '张三'` 会把框里的内容换掉。用代码改 `text` 不派发 `input`，这个事件只在用户的输入改变内容时派发。**未在模拟器验证。** 要让代码的修改也派发 `input`，用 [`insertText()`](#用代码在光标处插入文字)。

写入的值不是字符串时按字符串转换。写 `null` 或 `undefined` 得到空字符串。

### 显示占位文字

```js
field.placeholder = '请输入账号';
```

**效果**：框里没有内容时显示这行提示，用户打第一个字后提示消失。**提示的颜色未在模拟器验证。**

设成 `null` 去掉提示。

### 实时响应输入变化

```js
field.addEventListener('input', () => {
  console.log('现在是：' + field.text);
});
```

**效果**：用户每打一个字、删一个字、粘贴一段文字，回调执行一次。**未在模拟器验证。**

事件对象的 `type` 是事件名，`target` 是这个输入框。事件对象不带内容，内容从 `field.text` 读。

回调在内容变化之后才执行，回调里读到的 `field.text` 是执行时的内容。用户打字很快时，一次回调里读到的内容可能已经包含了后面几次按键。**未在模拟器验证。**

使用中文拼音这类输入法时，用户还没选字的拼音字母是否算进 `text`、这期间是否派发 `input`，**未在模拟器验证**。

### 按回车时提交并收起键盘

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

### 做密码输入框

```js
field.isSecureTextEntry = true;
```

**效果**：打的每个字显示成圆点。`field.text` 读到的仍然是真实内容。**显示成圆点未在模拟器验证。**

### 让密码框可以切换显示明文

`isSecureTextEntry` 可以随时改。放一个按钮，点击时把它取反。

```js
const toggle = UIButton.buttonWithType('system');
toggle.setTitle('显示', { forState: ['normal'] });
toggle.addEventListener('click', () => {
  field.isSecureTextEntry = !field.isSecureTextEntry;
  toggle.setTitle(field.isSecureTextEntry ? '显示' : '隐藏', { forState: ['normal'] });
});
```

**效果**：点一下按钮，框里的圆点变成真实的文字，按钮上的字变成「隐藏」。再点一下变回圆点。按钮还需要加到页面上并定位，写法见 [`UIButton`](ui-button.md)。**这个例子未在模拟器验证。**

### 弹出数字键盘或邮箱键盘

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

全部 13 个取值见 [`keyboardType`](#keyboardtype)。

> **注意**：`keyboardType` 只决定弹出哪种键盘，不校验内容。用户仍然可以粘贴别的字符进来，连着硬件键盘时也能打任何字符。需要校验时在 `input` 里检查 `field.text`。
>
> `'numberPad'`、`'decimalPad'`、`'phonePad'` 这几种键盘上没有回车键，用户没法按回车收起键盘。要另外提供收起键盘的方式，见[点空白处收起键盘](#点空白处收起键盘)和[在键盘上方放一排按钮](#在键盘上方放一排按钮)。**没有回车键这一点未在模拟器验证。**

### 改回车键上的字

```js
field.returnKeyType = 'search';
```

**效果**：键盘右下角的回车键上显示「搜索」。**未在模拟器验证。**

它只改键上的字，不改行为。不管显示什么字，按下去都是派发 `return`。全部取值见 [`returnKeyType`](#returnkeytype)。

想让回车键在没有内容时不能按：

```js
field.enablesReturnKeyAutomatically = true;
```

**效果**：框里没有内容时回车键是灰色，按不动。打了字之后自动变成可按。**未在模拟器验证。**

### 让系统自动填充账号和密码

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

### 让系统自动填充短信验证码

```js
const code = new UITextField();
code.keyboardType = 'numberPad';
code.textContentType = 'oneTimeCode';
```

**效果**：手机收到带验证码的短信后，键盘上方出现这个验证码，用户点一下就填进框里。**未在模拟器验证。**

`textContentType` 的全部 48 个取值见 [`textContentType` 的取值](#textcontenttype-的取值)。

### 关闭自动纠错和首字母大写

输入账号、邮箱、代码这类内容时，系统的自动修正会帮倒忙。

```js
field.autocapitalizationType = 'none';   // 不自动大写
field.autocorrectionType = 'no';         // 不自动纠错
field.spellCheckingType = 'no';          // 不在拼错的词下面画红线
```

**效果**：用户打什么就是什么。默认情况下，系统会把每句话的第一个字母改成大写，并且把它认为拼错的词替换掉。**未在模拟器验证。**

### 显示右侧的清除按钮

```js
field.clearButtonMode = 'whileEditing';
```

**效果**：输入框正在输入并且有内容时，右侧出现一个圆形的 × 按钮。点它清空全部内容。**未在模拟器验证。**

`'always'` 是一直显示，`'unlessEditing'` 是只在没有输入时显示，`'never'` 是不显示。

### 用代码聚焦和失焦

```js
const ok = field.becomeFirstResponder();   // 聚焦，键盘弹出
console.log(ok, field.isFirstResponder);

field.resignFirstResponder();              // 失焦，键盘收起
```

**效果**：`becomeFirstResponder()` 成功时返回 `true`，输入框开始输入，`isFirstResponder` 和 `isEditing` 都变成 `true`。`resignFirstResponder()` 之后两者都变回 `false`。

`becomeFirstResponder()` 可能被系统拒绝，这时返回 `false`，什么都不发生。所以不要忽略返回值。什么时候会被拒绝见 [first responder](#first-responder焦点)。

### 读写光标的位置和选中的范围

```js
field.text = 'hello world';
field.selectedRange = new NSRange(0, 5);   // 选中 hello

const range = field.selectedRange;
console.log(range.location, range.length);
console.log(field.text.slice(range.location, range.location + range.length));

field.selectedRange = new NSRange(field.text.length, 0);   // 光标放到末尾
```

**效果**：输出 `0 5` 和 `hello`。

- `selectedRange` 是一个 [`NSRange`](ui-text-view.md#nsrange)：`location` 是起点，`length` 是选中了多少，单位是 UTF-16 码元，和 JS 字符串的下标相同。`length` 是 0 表示没有选中文字，只有一个光标。
- 输入框没有在输入时也能读写选区，写进去的读得回来（实测）。这时屏幕上看不到光标和选中的底色。
- 没有在输入时写的选区，到输入框开始输入之后还在不在，**未在模拟器验证**。要让用户看到光标在某个位置，在输入框开始输入之后再写，见下一节。

### 用代码在光标处插入文字

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

### 开始输入时全选原有内容

```js
field.addEventListener('focus', () => {
  field.selectedRange = new NSRange(0, field.text.length);
});
```

**效果**：输入框开始输入时，里面的内容全部选中，用户直接打字就换掉原来的内容。**未在模拟器验证**，用户用手指点输入框时系统会不会随后把光标放到点的位置，没有量过。

### 光标动了的时候得到通知

```js
field.addEventListener('selectionchange', () => {
  const range = field.selectedRange;
  console.log('光标在 ' + range.location + '，选中了 ' + range.length + ' 个码元');
});
```

**效果**：代码写 `selectedRange` 时控制台输出一行（实测）。用户移动光标、拖动选区、打字时同样各输出一行，这一部分**未在模拟器验证**。

事件对象不带选区，在回调里读 `field.selectedRange`。回调是稍后执行的，读到的是回调执行那一刻的选区。

### 页面刚出现时自动聚焦

聚焦要等页面已经显示出来。页面显示出来时派发 `appear`，在它的回调里聚焦：

```js
page.addEventListener('appear', () => {
  field.becomeFirstResponder();
}, { once: true });
```

**效果**：页面的转场动画结束后，输入框自动开始输入，键盘弹出。

- 验收用例里验证过模态弹出的页面：在这个回调里调 `becomeFirstResponder()` 返回 `true`，输入框成为 first responder。窗口的根页面**未在模拟器验证**。
- `{ once: true }` 让它只在页面第一次出现时聚焦。不写的话，每次回到这个页面都会聚焦。
- `appear` 见 [`UIViewController`](ui-view-controller.md#页面的出现和消失)。

不要在别的时机聚焦，两条都来自实测：

- **在 `sceneconnect` 的回调里直接调 `becomeFirstResponder()` 太早。** 它返回 `true`，`isEditing` 也是 `true`，但是 `focus` 事件不派发。
- **页面正在切换时会被拒绝。** 模态页面弹出或关闭的动画期间，`becomeFirstResponder()` 返回 `false`。

### 点空白处收起键盘

没有回车键的键盘（比如数字键盘）需要另一种收起方式。常见的做法是点输入框以外的地方收起。

推荐的写法是在页面的根视图上加一个点按的[手势识别器](ui-gesture-recognizer.md)。识别器接收根视图和它所有子视图上的点按，所以回调里要先查出点到了哪个视图，点在输入框和按钮上时不收键盘。

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

另一种写法不用手势识别器：在页面最底层放一个铺满的 [`UIControl`](ui-control.md)，用它接收点击。它只在点到没有别的视图的空白处时有效，点在文字和图片上是否有效取决于这些视图是否接收触摸。

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

### 在键盘上方放一排按钮

`inputAccessoryView` 是键盘弹出时贴在键盘上面的一个视图，跟着键盘一起出现和消失。放一条[工具条](ui-toolbar.md)，就得到键盘上方的一排按钮。数字键盘没有回车键，「完成」按钮通常放在这里。

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

`inputAccessoryView` 可以是任何[视图](ui-view.md)，不限于工具条。它的宽度由系统拉到和键盘一样宽，高度用它自己的。

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

### 让输入框不被键盘挡住

把内容的底边约束到 `keyboardLayoutGuide` 的顶边。下面的例子在屏幕底部放一个输入框。

```js
const input = new UITextField();
input.borderStyle = 'roundedRect';
input.placeholder = '说点什么';
input.translatesAutoresizingMaskIntoConstraints = false;
page.view.addSubview(input);

const safe = page.view.safeAreaLayoutGuide;
const keyboard = page.view.keyboardLayoutGuide;
NSLayoutConstraint.activateConstraints([
  input.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor, { constant: 16 }),
  input.trailingAnchor.constraintEqualToAnchor(safe.trailingAnchor, { constant: -16 }),
  // 这一条负责避开键盘
  input.bottomAnchor.constraintEqualToAnchor(keyboard.topAnchor, { constant: -16 }),
]);
```

**效果**

- 键盘收起时，输入框在屏幕底部，底边在安全区底边上方 16 pt。
- 键盘弹出时，输入框上移到键盘上方 16 pt。键盘收起后回到原位。验收用例只在软键盘真的弹出时检查上移；iOS 27.2 的模拟器上软键盘没有弹出，**在这个系统上未在模拟器验证**。

原理见[键盘避让：一条约束](#键盘避让一条约束)。

### 禁用输入框

```js
field.isEnabled = false;
```

**效果**：点输入框没有反应，键盘不弹出。设回 `true` 恢复。**未在模拟器验证。**

`isEnabled` 继承自 [`UIControl`](ui-control.md)。

### 自己画边框和底色

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

const safe = page.view.safeAreaLayoutGuide;
NSLayoutConstraint.activateConstraints([
  box.topAnchor.constraintEqualToAnchor(safe.topAnchor, { constant: 100 }),
  box.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor, { constant: 16 }),
  box.trailingAnchor.constraintEqualToAnchor(safe.trailingAnchor, { constant: -16 }),
  box.heightAnchor.constraintEqualToConstant(56),
  // 输入框在容器里左右各缩进 12 pt，垂直居中
  inner.leadingAnchor.constraintEqualToAnchor(box.leadingAnchor, { constant: 12 }),
  inner.trailingAnchor.constraintEqualToAnchor(box.trailingAnchor, { constant: -12 }),
  inner.centerYAnchor.constraintEqualToAnchor(box.centerYAnchor),
]);
```

**效果**：一个高 56 pt 的浅灰色圆角矩形，圆角半径 12 pt。文字从距离左边 12 pt 的地方开始。

输入框自己没有内边距属性。`borderStyle` 是 `'none'` 时文字紧贴输入框的左边，所以用容器留出间距。

### 改文字的字体、颜色和对齐

```js
field.font = UIFont.systemFontOfSize(20);
field.textColor = 'systemBlue';
field.textAlignment = 'center';
```

**效果**：框里的文字是 20 pt、蓝色、水平居中。**未在模拟器验证。**

字体见 [`UIFont`](ui-font.md)，颜色的写法见[颜色](ui-color.md)。

### 限制输入长度或过滤字符

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

- `range` 是要被换掉的那一段，`replacementString` 是要换上去的文字，见 [`beforeinput` 带的数据](#beforeinput-带的数据)。
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

### 不让输入框失去焦点

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

### 做一个表单页

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

## first responder：焦点

**first responder** 是 iOS 里「当前接收键盘输入的那个对象」，也就是焦点所在的对象。同一时刻最多只有一个。

| 想做的事 | 写法 |
| --- | --- |
| 让输入框聚焦 | `field.becomeFirstResponder()` |
| 让输入框失焦 | `field.resignFirstResponder()` |
| 判断输入框是否聚焦 | `field.isFirstResponder` |
| 得知输入框聚焦了 | `focus` 事件 |
| 得知输入框失焦了 | `blur` 事件 |

关于 first responder 有四件事要知道：

- **键盘和 first responder 是绑定的。** 输入框成为 first responder，键盘弹出。它不再是 first responder，键盘收起。没有单独「显示键盘」「隐藏键盘」的方法。
- **聚焦可能失败。** `becomeFirstResponder()` 返回布尔值，`false` 表示系统拒绝了，什么都没有发生。所以不要忽略返回值。
- **用户点输入框时，聚焦发生在手指按下的那一刻**，不等手指抬起（实测）。
- **点别处不会自动失焦。** 输入框保持 first responder，键盘留在屏幕上，直到有代码让它失焦，或者用户点了另一个输入框。**未在模拟器验证。**

`becomeFirstResponder()` 在不同情况下的结果：

| 情况 | 结果 | 依据 |
| --- | --- | --- |
| 页面已经显示，没有切换在进行 | 返回 `true`，随后派发 `focus` | 实测 |
| 输入框已经是 first responder | 返回 `true` | 验收用例依赖这一点反复调用，没有单独的断言 |
| 页面正在切换（模态页面弹出或关闭的动画期间） | 返回 `false` | 实测 |
| 在 `sceneconnect` 的回调里，页面还没显示出来 | 返回 `true`，`isEditing` 是 `true`，但不派发 `focus` | 实测 |
| 输入框还没加到页面上 | 返回 `false` | **未在模拟器验证** |

收起键盘有三种写法，结果相同：

| 写法 | 什么时候用 |
| --- | --- |
| `field.resignFirstResponder()` | 知道是哪个输入框 |
| `page.view.endEditing(true)` | 不知道是哪个，或者页面上有多个输入框 |
| 在 `return` 的回调里调上面任意一个 | 用户按回车时收起 |

## 选区和光标

选区是输入框里选中的那一段文字。没有选中文字时，选区是一个长度为 0 的位置，也就是光标。`selectedRange` 用一个 [`NSRange`](ui-text-view.md#nsrange) 表示它：`location` 是起点，`length` 是长度，单位是 UTF-16 码元，和 JS 字符串的下标相同，所以 `field.text.slice(location, location + length)` 就是选中的文字。读写的写法和 [`UITextView`](ui-text-view.md) 的 `selectedRange` 相同。

输入框任何时候都有选区，没有在输入时也读得到、写得进去（实测）：

| 情况 | `selectedRange` |
| --- | --- |
| 新建的输入框，从没输入过 | `(0, 0)`。用代码写了 `text` 之后还是 `(0, 0)`，不会移到末尾 |
| 没有在输入时写 `(0, 3)` | 读回来是 `(0, 3)` |
| 正在输入 | 屏幕上光标的位置，或者选中的那一段 |

没有在输入时屏幕上不显示光标和选中的底色，所以这时写选区看不到变化。写下的选区在输入框开始输入之后是否保留，以及输入结束之后选区停在哪里，**未在模拟器验证**，不要依赖。要控制用户看到的光标位置，在输入框开始输入之后写：在 `becomeFirstResponder()` 返回 `true` 之后，或者在 `focus` 的回调里。

写入的范围超出内容时不抛错，规则和 `UITextView` 相同（实测，正在输入时）：

| 内容是 10 个码元时写入 | 读回来 |
| --- | --- |
| `(100, 5)`：起点超出 | `(10, 0)`，光标在末尾 |
| `(2, 100)`：长度超出 | `(2, 0)`，起点不变，长度变成 0 |

全选要写 `new NSRange(0, field.text.length)`，不能给一个很大的长度。

表情和一部分汉字占两个码元。把光标放在这两个码元中间不会抛错，也不会被纠正：内容是 `'a😀b'` 时写 `(2, 0)`，读回来还是 `(2, 0)`（实测）。多行输入上实测在这样的位置插入文字会把这个字符拆成两半。自己算位置时要避开。

选区变了时派发 `selectionchange`，见[事件](#事件)。

## 键盘避让：一条约束

键盘从屏幕底部弹出，盖在页面上面。页面的大小和位置不变，被盖住的内容就看不到了。

每个视图有一个 `keyboardLayoutGuide` 属性。它是一个 layout guide，也就是不显示的矩形，只用来对齐。这个矩形代表键盘占的区域：

- **键盘收起时**，它的顶边在安全区的底边。安全区是屏幕上不被刘海和底部横条遮挡的区域，见 [`UIView`](ui-view.md)。
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

页面内容很长、放在[滚动视图](ui-scroll-view.md)里时，把滚动视图的底边约束到 `keyboardLayoutGuide.topAnchor`。键盘弹出时滚动视图变矮，里面的内容仍然能滚到。**未在模拟器验证。**

实测：键盘收起时，`page.view.keyboardLayoutGuide.layoutFrame.height` 是 34 pt，等于屏幕底部横条占的安全区高度。可以用这个高度判断软键盘是否真的出现了。

约束的写法见 [Auto Layout](auto-layout.md)。

## 位置和大小

输入框是视图，定位方式和其他视图一样，见 [Auto Layout](auto-layout.md)。输入框特有的有两点：

- **用约束时，高度可以不给，宽度要自己给。** 输入框按字体算出自己的高度。宽度不给时，它按内容算宽度，内容是空的就很窄，并且会随着输入变宽。所以要约束左右两边，或者给一个固定宽度。**未在模拟器验证。**
- **用 `frame` 时，宽高都要自己给。** 不给的话宽高是 0，屏幕上什么都没有。

所有尺寸的单位都是[点（pt）](units.md)。

## 成员说明

### 继承关系

`UITextField` → [`UIControl`](ui-control.md) → [`UIView`](ui-view.md) → `UIResponder` → `NSObject`

`isEnabled`、`addEventListener()` 等继承自 `UIControl`。位置、底色、圆角、隐藏等继承自 `UIView`。这两部分不在这里重复，见各自的页面。

`UITextField` 不能被继承。`class X extends UITextField {}` 在 `new X()` 时抛错，见[原生类](native-classes.md)。

### 创建

#### `new UITextField()`

创建一个输入框。没有参数。

```js
const field = new UITextField();
```

新建的输入框没有边框、没有内容、没有占位文字，大小是 0。

### 内容

| 属性 | 类型 | 可读 | 可写 | 默认值 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `text` | 字符串 | 是 | 是 | `''` | 框里的内容。没有内容时是空字符串，不是 `null`。用户输入引起的变化派发 `input` |
| `placeholder` | 字符串或 `null` | 是 | 是 | `null` | 没有内容时显示的提示。`null` 表示没有提示 |
| `isEditing` | 布尔 | 是 | 否 | `false` | `true`：输入框正在输入，它是 first responder。`false`：没有在输入。变化时派发 `focus` 和 `blur` |
| `hasText` | 布尔 | 是 | 否 | `false` | `true`：有内容。`false`：内容是空的。没有单独的通知，在 `input` 的回调里读 |
| `clearsOnBeginEditing` | 布尔 | 是 | 是 | `false`（**未在模拟器验证**） | `true`：每次开始输入时清空原有内容。`false`：保留原有内容 |

#### `insertText()`

按用户打字的方式插入一段文字：插在光标的位置（[`selectedRange`](#选区)）；有选中的文字时，换掉选中的部分。光标移到插入的内容后面。

```js
field.insertText('你好');
```

- **参数**：字符串。别的类型按 `String()` 转，`null` 和 `undefined` 当作空字符串。
- **返回**：无。
- 派发一次 `input`。不派发 `beforeinput`：那个事件只问用户的输入。
- 输入框没有在输入时也能调，插在 `selectedRange` 的位置。从没输入过的输入框 `selectedRange` 是 `(0, 0)`，所以插在开头；要插在末尾，先把 `selectedRange` 写成 `new NSRange(field.text.length, 0)`。

上面几条行为**未在模拟器验证**。

#### `deleteBackward()`

按用户按删除键的方式删除：有选中的文字时删掉选中的部分，没有时删掉光标前面的一个字符。

```js
field.deleteBackward();
```

- **参数**：无。
- **返回**：无。
- 光标在开头并且没有选中文字时，什么都不做。
- 删掉了内容时派发一次 `input`，不派发 `beforeinput`。

上面几条行为**未在模拟器验证**。

这两个方法和 `hasText` 与 [`UITextView`](ui-text-view.md#内容) 上的同名成员写法相同。

### 选区

| 属性 | 类型 | 可读 | 可写 | 默认值 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `selectedRange` | [`NSRange`](ui-text-view.md#nsrange) | 是 | 是 | `(0, 0)` | 选中的范围，单位是 UTF-16 码元。`length` 是 0 表示光标。输入框没有在输入时也能读写。写入时可以给普通对象 `{ location, length }`。变化时派发 `selectionchange` |

读出来的每次是一个新的 `NSRange`，字段只读。

写入时的规则（概念见[选区和光标](#选区和光标)）：

- 字段按整数转，小数向零取整。
- 范围超出内容时不抛错：起点超出时光标停在末尾，长度超出时长度变成 0。
- 缺字段：`TypeError: selectedRange is missing length, or it is not a finite number`
- 不是对象，包括 `null`：`TypeError: selectedRange needs an object with all of: location, length`
- 负数：`TypeError: selectedRange.location must be a non-negative integer`

抛错之后选区不变。

### 键盘

| 属性 | 类型 | 可读 | 可写 | 默认值 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `keyboardType` | 字符串 | 是 | 是 | `'default'` | 弹出哪种键盘。取值见[下面](#keyboardtype) |
| `returnKeyType` | 字符串 | 是 | 是 | `'default'` | 回车键上显示什么字。取值见[下面](#returnkeytype) |
| `enablesReturnKeyAutomatically` | 布尔 | 是 | 是 | `false` | `true`：没有内容时回车键变灰、不能按。`false`：回车键一直能按 |
| `keyboardAppearance` | 字符串 | 是 | 是 | `'default'`（**未在模拟器验证**） | 键盘的明暗。取值见[下面](#keyboardappearance) |
| `inputAccessoryView` | [`UIView`](ui-view.md) 或 `null` | 是 | 是 | `null` | 键盘弹出时贴在键盘上面的视图。读回来的是写进去的那个对象。用法见[在键盘上方放一排按钮](#在键盘上方放一排按钮) |

这些属性没有变化通知。它们只由你的代码修改。

`inputAccessoryView` 的写入规则：

- 写 `null` 或 `undefined` 是去掉。
- 写了不是视图的原生对象，抛 `TypeError: inputAccessoryView needs a UIView or null`；写了数、字符串等普通值，抛 `TypeError: inputAccessoryView needs a native object or null, got 5`。原值不变。
- 同一个视图可以写给几个输入框，也可以同时写给[搜索框](ui-search-bar.md)和[多行输入](ui-text-view.md)。
- 输入框正在输入时写入，当场生效。**未在模拟器验证。**
- 写进去的视图不要再用 `addSubview()` 放进页面：键盘弹出时系统把它放到键盘上方，它在页面里原来的位置就没有了。**未在模拟器验证。**

以下各表里取值的效果都**未在模拟器验证**。验收用例验证的是：每个属性能写入并读回，写错时属性保持原值并输出一条警告。

#### `keyboardType`

| 取值 | 弹出的键盘 |
| --- | --- |
| `'default'` | 当前输入法的标准键盘 |
| `'asciiCapable'` | 只能输入英文字母、数字和符号的键盘 |
| `'numbersAndPunctuation'` | 标准键盘，打开时显示数字和标点那一页 |
| `'url'` | 输入网址用：有 `.`、`/`、`.com` 键，没有空格键 |
| `'numberPad'` | 只有 0 到 9 |
| `'phonePad'` | 电话拨号键盘：0 到 9、`*`、`#` |
| `'namePhonePad'` | 输入人名或电话号码用：字母键盘，可以切到拨号键盘 |
| `'emailAddress'` | 输入邮箱用：有 `@` 和 `.` 键 |
| `'decimalPad'` | 0 到 9 加一个小数点 |
| `'twitter'` | 标准键盘加上 `@` 和 `#` 键 |
| `'webSearch'` | 输入搜索词或网址用：有空格键和 `.` 键 |
| `'asciiCapableNumberPad'` | 只有 0 到 9，并且只输出 ASCII 数字 |
| `'alphabet'` | `'asciiCapable'` 的旧名字，效果相同 |

#### `returnKeyType`

键上显示的字跟随系统语言。下表给出每个取值表示的意思。

| 取值 | 回车键表示 |
| --- | --- |
| `'default'` | 换行（键上是「换行」或 return） |
| `'go'` | 前往 |
| `'google'` | 搜索（旧的取值，显示为搜索） |
| `'join'` | 加入 |
| `'next'` | 下一项 |
| `'route'` | 路线 |
| `'search'` | 搜索 |
| `'send'` | 发送 |
| `'yahoo'` | 搜索（旧的取值，显示为搜索） |
| `'done'` | 完成 |
| `'emergencyCall'` | 紧急呼叫 |
| `'continue'` | 继续 |

这个属性只改键上的字。所有取值按下去的行为都相同：派发 `return`。

#### `keyboardAppearance`

| 取值 | 效果 |
| --- | --- |
| `'default'` | 跟随系统当前的浅色或深色外观 |
| `'light'` | 一直是浅色键盘 |
| `'dark'` | 一直是深色键盘 |
| `'alert'` | `'dark'` 的旧名字，效果相同 |

### 输入行为

| 属性 | 类型 | 可读 | 可写 | 默认值 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `isSecureTextEntry` | 布尔 | 是 | 是 | `false` | `true`：内容显示成圆点，用于密码。`false`：正常显示 |
| `autocapitalizationType` | 字符串 | 是 | 是 | `'sentences'` | 自动大写的规则。取值见下面 |
| `autocorrectionType` | 字符串 | 是 | 是 | `'default'` | 是否自动纠错。取值见下面 |
| `spellCheckingType` | 字符串 | 是 | 是 | `'default'`（**未在模拟器验证**） | 是否检查拼写。取值见下面 |
| `textContentType` | 字符串或 `null` | 是 | 是 | `null` | 这个框装的是什么内容，系统据此自动填充。取值见 [`textContentType` 的取值](#textcontenttype-的取值)。写 `null` 清除 |

`autocapitalizationType` 的取值：

| 取值 | 效果 |
| --- | --- |
| `'none'` | 不自动大写 |
| `'words'` | 每个单词的第一个字母大写 |
| `'sentences'` | 每句话的第一个字母大写 |
| `'allCharacters'` | 所有字母大写 |

`autocorrectionType` 和 `spellCheckingType` 的取值相同：

| 取值 | `autocorrectionType` | `spellCheckingType` |
| --- | --- | --- |
| `'default'` | 由系统按输入的内容决定 | 由系统按输入的内容决定 |
| `'no'` | 不自动替换系统认为拼错的词 | 不在拼错的词下面画红线 |
| `'yes'` | 自动替换 | 画红线 |

### 外观

| 属性 | 类型 | 可读 | 可写 | 默认值 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `borderStyle` | 字符串 | 是 | 是 | `'none'` | 边框的样子。取值见下面 |
| `clearButtonMode` | 字符串 | 是 | 是 | `'never'` | 右侧的清除按钮什么时候显示。取值见下面 |
| `textAlignment` | `'left'` \| `'center'` \| `'right'` \| `'justified'` \| `'natural'` | 是 | 是 | 未验证 | 文字在框里的水平对齐。`'natural'` 跟随语言的书写方向：中文和英文靠左，阿拉伯文靠右 |
| `font` | [`UIFont`](ui-font.md) | 是 | 是 | 未验证 | 文字的字体和字号 |
| `textColor` | [颜色](ui-color.md)字符串 | 是 | 是 | 未验证 | 文字的颜色。写入时可以是颜色字符串、`UIColor` 对象或 `null`，读出来是字符串 |
| `adjustsFontSizeToFitWidth` | 布尔 | 是 | 是 | `false`（**未在模拟器验证**） | `true`：内容比框宽时缩小字号，最小到 `minimumFontSize`。`false`：字号不变，内容超出时横向滚动 |
| `minimumFontSize` | 数字，单位 [pt](units.md) | 是 | 是 | `0`（**未在模拟器验证**） | `adjustsFontSizeToFitWidth` 是 `true` 时允许缩到的最小字号 |

`borderStyle` 的取值：

| 取值 | 效果 |
| --- | --- |
| `'none'` | 没有边框，没有底色。文字紧贴输入框的左边 |
| `'line'` | 一圈细的直角线框 |
| `'bezel'` | 一圈带内凹效果的直角边框 |
| `'roundedRect'` | 圆角矩形边框，带底色，文字左右有内边距。系统标准的输入框样子 |

`clearButtonMode` 的取值：

| 取值 | 清除按钮什么时候显示 |
| --- | --- |
| `'never'` | 不显示 |
| `'whileEditing'` | 正在输入并且有内容时 |
| `'unlessEditing'` | 没有在输入并且有内容时 |
| `'always'` | 有内容时一直显示 |

`borderStyle` 和 `clearButtonMode` 各取值画出来的样子**未在模拟器验证**。

### `textContentType` 的取值

`textContentType` 说明这个框装的是什么内容。它不改变键盘的样子。系统据此在键盘上方给出建议，或者直接替用户填。

一共 48 个取值。下表「系统做什么」一列**未在模拟器验证**。

| 分类 | 取值 | 内容 | 系统做什么 |
| --- | --- | --- | --- |
| 账号 | `'username'` | 用户名 | 和 `'password'` 配对，填充保存过的账号 |
| | `'password'` | 已有的密码 | 同上 |
| | `'newPassword'` | 新设的密码 | 提议生成强密码并保存 |
| | `'oneTimeCode'` | 一次性验证码 | 填充短信里的验证码 |
| 联系方式 | `'emailAddress'` | 邮箱 | 建议用户自己的邮箱 |
| | `'telephoneNumber'` | 电话号码 | 建议用户自己的号码 |
| | `'url'` | 网址 | |
| 姓名 | `'name'` | 全名 | 建议用户自己的姓名 |
| | `'namePrefix'` | 称谓前缀，比如「Dr.」 | |
| | `'givenName'` | 名 | |
| | `'middleName'` | 中间名 | |
| | `'familyName'` | 姓 | |
| | `'nameSuffix'` | 称谓后缀，比如「Jr.」 | |
| | `'nickname'` | 昵称 | |
| | `'jobTitle'` | 职位 | |
| | `'organizationName'` | 公司或组织名 | |
| 地址 | `'location'` | 地点名 | 填充保存过的地址 |
| | `'fullStreetAddress'` | 完整的街道地址 | 同上 |
| | `'streetAddressLine1'` | 街道地址第一行 | 同上 |
| | `'streetAddressLine2'` | 街道地址第二行 | 同上 |
| | `'addressCity'` | 城市 | 同上 |
| | `'addressState'` | 省或州 | 同上 |
| | `'addressCityAndState'` | 城市加省或州 | 同上 |
| | `'sublocality'` | 区 | 同上 |
| | `'countryName'` | 国家 | 同上 |
| | `'postalCode'` | 邮政编码 | 同上 |
| 银行卡 | `'creditCardNumber'` | 卡号 | 填充保存过的卡，或者用相机扫卡号 |
| | `'creditCardName'` | 持卡人全名 | 填充保存过的卡 |
| | `'creditCardGivenName'` | 持卡人的名 | 同上 |
| | `'creditCardMiddleName'` | 持卡人的中间名 | 同上 |
| | `'creditCardFamilyName'` | 持卡人的姓 | 同上 |
| | `'creditCardExpiration'` | 有效期 | 同上 |
| | `'creditCardExpirationMonth'` | 有效期的月 | 同上 |
| | `'creditCardExpirationYear'` | 有效期的年 | 同上 |
| | `'creditCardSecurityCode'` | 安全码 | 同上 |
| | `'creditCardType'` | 卡的类型 | 同上 |
| 日期 | `'birthdate'` | 生日 | |
| | `'birthdateDay'` | 生日的日 | |
| | `'birthdateMonth'` | 生日的月 | |
| | `'birthdateYear'` | 生日的年 | |
| | `'dateTime'` | 日期和时间 | |
| 物流和出行 | `'shipmentTrackingNumber'` | 快递单号 | |
| | `'flightNumber'` | 航班号 | |
| 设备 | `'cellularEID'` | eSIM 的 EID | |
| | `'cellularIMEI'` | 设备的 IMEI | |
| | `'cellularIMEI1'` | 第一个 IMEI | |
| | `'cellularIMEI2'` | 第二个 IMEI | |
| | `'cellularNAL'` | 蜂窝网络的 NAL | |

「系统做什么」留空的，这里没有可靠的说明。

### 写错取值时

上面所有取值是字符串的属性，写入不在表里的值都不抛异常：属性保持原来的值，控制台输出一条警告，警告里列出全部可用的值。

```js
field.keyboardType = 'numberPad';
// @ts-expect-error 故意写错
field.keyboardType = 'numeric';
console.log(field.keyboardType);
```

**效果**

- 控制台输出警告 `[Nacre] keyboardType has no value "numeric"; expected one of: …, ignored`，省略号处是 13 个可用的值。
- 接着输出 `numberPad`：写错的赋值没有生效，属性保持原来的值。

`textColor` 写入不认识的颜色字符串时同样不抛错，运行时在控制台输出一条警告，保留原来的颜色。见[颜色](ui-color.md)。

### first responder

以下四个成员定义在 `UIResponder` 上，所有视图都有。概念见 [first responder：焦点](#first-responder焦点)。

#### `becomeFirstResponder()`

让这个对象成为 first responder。对输入框来说就是聚焦：光标出现，键盘弹出。

```js
const ok = field.becomeFirstResponder();
if (!ok) {
  console.log('系统拒绝了，稍后再试');
}
```

- **参数**：无。
- **返回**：布尔。`true` 表示已经成为 first responder。`false` 表示系统拒绝了，什么都没有发生。
- 什么时候被拒绝见 [first responder：焦点](#first-responder焦点)里的表。

#### `resignFirstResponder()`

让这个对象不再是 first responder。对输入框来说就是失焦：光标消失，键盘收起。

```js
field.resignFirstResponder();
```

- **参数**：无。
- **返回**：布尔。`true` 表示已经不是 first responder。对象本来就不是 first responder 时的返回值**未在模拟器验证**。

#### `isFirstResponder` 和 `canBecomeFirstResponder`

| 属性 | 类型 | 可读 | 可写 | 说明 |
| --- | --- | --- | --- | --- |
| `isFirstResponder` | 布尔 | 是 | 否 | `true`：这个对象现在是 first responder。`false`：不是。新建的输入框是 `false`。输入框上的变化派发 `focus` 和 `blur` |
| `canBecomeFirstResponder` | 布尔 | 是 | 否 | `true`：这个对象可以成为 first responder。`false`：不可以，`becomeFirstResponder()` 会返回 `false`。输入框是 `true`，普通的 `UIView` 是 `false`。**这两个值未在模拟器验证** |

让一棵视图树里的输入框失焦用 `endEditing()`，它定义在 `UIView` 上，见 [`UIView`](ui-view.md)。

### 键盘的 layout guide

`view.keyboardLayoutGuide` 的类型是 `UIKeyboardLayoutGuide`。它继承自 `UITrackingLayoutGuide`，再继承自 `UILayoutGuide`，所以有 `topAnchor` 等全部锚点和 `layoutFrame`。用法见[键盘避让：一条约束](#键盘避让一条约束)。

它由系统创建，不能 `new`。同一个视图每次读 `keyboardLayoutGuide` 得到的是同一个对象。

| 属性 | 类型 | 可读 | 可写 | 默认值 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `followsUndockedKeyboard` | 布尔 | 是 | 是 | `false` | `true`：iPad 上键盘浮动或拆分时，guide 也跟着键盘。`false`：只在键盘停靠在屏幕底部时跟着。Nacre 现在只支持 iPhone，iPhone 的键盘一直是停靠的 |
| `keyboardDismissPadding` | 数字，单位 [pt](units.md) | 是 | 是 | `0` | 用户向下拖动内容来收起键盘时，手指距离键盘顶边多远就开始收起。配合滚动视图的 [`keyboardDismissMode`](ui-scroll-view.md#键盘) 设成 `'interactive'` 时起作用，效果**未在模拟器验证** |

### 事件

用 `addEventListener()` 监听。事件有三组：控件事件告诉你发生了什么，[`selectionchange`](#selectionchange) 告诉你光标或选区动了，[可取消的事件](#可取消的事件)在事情发生之前问你要不要。

控件事件里输入框用到的是这四个：

| 事件 | 什么时候派发 |
| --- | --- |
| `focus` | 输入框成为 first responder，开始输入 |
| `input` | 用户的输入让内容变了一次 |
| `return` | 用户按了回车键。和可取消的 [`beforereturn`](#可取消的事件) 是一对：`beforereturn` 在回车生效之前派发、可以取消，`return` 是事后的通知、不能取消。取消了 `beforereturn` 之后 `return` 还派不派发，**未在模拟器验证** |
| `blur` | 输入框不再是 first responder，结束输入 |

一次典型的输入派发这些事件：

| 用户的操作 | 派发 |
| --- | --- |
| 点输入框 | `focus`。实测在手指按下的那一刻 |
| 打三个字 | `input` 三次。**未在模拟器验证** |
| 按回车 | `return`。**未在模拟器验证** |
| 键盘收起 | `blur` |

`return` 和 `blur` 谁先谁后**未在模拟器验证**。

用代码调 `becomeFirstResponder()` 和 `endEditing()` 时，同样派发 `focus` 和 `blur`。这一点在验收用例里验证过。

- 事件对象的 `type` 是事件名，`target` 是这个输入框。这四个事件的对象不带输入的内容，不带按了哪个键，也不带触点位置。
- 这四个事件不能取消，`preventDefault()` 不起作用。要阻止某件事发生，用[可取消的事件](#可取消的事件)。
- 这四个事件的回调不是在事件发生的那一刻同步执行，而是稍后执行，见[回调的执行时机](ui-control.md#回调的执行时机)。
- 「用户输入完了」用 `blur`。没有「内容确认修改」这样单独的事件。
- 回调里抛出异常不影响输入框，同一事件的其他回调照常执行。异常在 [`application`](application.md#没处理的异常不会让-app-退出) 上派发 `error`；没有监听器取消时，控制台输出以 `Uncaught` 开头的日志。
- 系统派发的是 [`UIControl`](ui-control.md#控件事件) 列出的 16 个控件事件、`traitchange`、`selectionchange` 和下面五个可取消的事件。监听别的名字不会报错：它被当成自定义事件，只有自己用 `dispatchEvent()` 派发时才会触发，见[事件名的限制](ui-control.md#事件名的限制)。

完整的 16 个事件见 [`UIControl`](ui-control.md)。

### `selectionchange`

输入框的选区或者光标的位置变了时派发。

| 什么引起的 | 派发吗 |
| --- | --- |
| 用户点了一下把光标移到别处、拖动选区、双击选中一个词 | 派发。**未在模拟器验证** |
| 用户打字、删除（光标跟着动了） | 派发。**未在模拟器验证** |
| 输入框正在输入时，代码写 `selectedRange` | 派发（实测） |
| 输入框没有在输入时，代码写 `selectedRange` | **未在模拟器验证**，不要依赖它派发或者不派发 |
| 输入框开始输入、结束输入、代码写 `text` | **未在模拟器验证**，不要依赖它派发或者不派发 |

```js
field.addEventListener('selectionchange', (event) => {
  console.log(event.type, event.target === field, field.selectedRange);
});
```

**效果**：选区每变一次输出一行，前两项是 `selectionchange` 和 `true`。

- 事件对象的 `type` 是 `'selectionchange'`，`target` 是这个输入框。事件对象不带选区，读 `field.selectedRange`。
- 回调不是在选区变化的那一刻同步执行，而是稍后执行，见[回调的执行时机](ui-control.md#回调的执行时机)。回调里读到的是执行那一刻的选区，不是事件发生那一刻的。
- 选区连着变了几次时，回调可能执行几次，每次读到的都是最新的选区。
- 不能取消，`event.cancelable` 是 `false`。
- 没有监听器时没有开销。

### 可取消的事件

这五个事件是系统在做一件事之前派发的。监听器里调 `event.preventDefault()`，系统就不做这件事。没有监听器，或者监听器都没调 `preventDefault()`，系统照常做。

| 事件 | 什么时候派发 | `preventDefault()` 的效果 |
| --- | --- | --- |
| `beforefocus` | 输入框即将成为 first responder：用户点了它，或者代码调了 `becomeFirstResponder()` | 不进入编辑，键盘不弹出，`becomeFirstResponder()` 返回 `false` |
| `beforeblur` | 输入框即将不再是 first responder | 焦点留在输入框上，`resignFirstResponder()` 返回 `false` |
| `beforeinput` | 用户的输入即将改变内容：按键、删除、粘贴 | 内容不变。**未在模拟器验证** |
| `beforeclear` | 用户点了右侧的清除按钮 | 不清空。**未在模拟器验证** |
| `beforereturn` | 用户按了回车键 | 输入框不按默认方式处理这次回车。**未在模拟器验证** |

后三个只有真实的触摸和键盘输入会触发，自动跑的验收触发不了，所以标了未验证。

这五个事件和控件事件有三点不同：

- **监听器是当场执行的。** 系统派发事件之后等监听器全部执行完，再决定做不做。代码调 `becomeFirstResponder()` 时，监听器在这个调用返回之前就执行完了。
- **`event.cancelable` 是 `true`。** `preventDefault()` 起作用。
- **同步的事件排在延后的事件前面。** 实测聚焦一次的顺序是 `beforefocus` → `focus`。

其余的相同：

- 事件对象的 `type` 是事件名，`target` 是这个输入框。
- 同一个事件有多个监听器时，只要有一个调了 `preventDefault()`，系统就不做。
- 监听器里抛出异常时，同一事件的其他监听器照常执行。异常在 [`application`](application.md#没处理的异常不会让-app-退出) 上派发 `error`；没有监听器取消时，控制台输出以 `Uncaught` 开头的日志。抛异常不等于 `preventDefault()`：实测监听器抛了，输入框照常拿到焦点。
- 最后一个监听器移除之后，系统不再派发这个事件。

> **注意**：监听器执行期间系统在等。在监听器里只做判断，不做耗时的事，否则每次按键都会卡一下。

这五个事件只在 `UITextField` 上有。在别的控件上监听不报错，但系统不会派发。

### `beforeinput` 带的数据

`beforeinput` 的事件对象多两个只读字段，描述这次修改打算把哪一段换成什么：

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| `range` | [`NSRange`](ui-text-view.md#nsrange) | 要被换掉的那一段。`location` 是起点，`length` 是长度，单位都是 UTF-16 码元，和 JS 字符串的下标一致 |
| `replacementString` | `string` | 要换上去的文字 |

三种修改各是什么样（来自 Apple 的文档，**未在模拟器验证**）：

| 用户的操作 | `range.length` | `replacementString` |
| --- | --- | --- |
| 在光标处打一个字 | 0 | 打的那个字 |
| 按删除键删掉一个字 | 被删掉的长度 | 空串 |
| 选中一段之后粘贴 | 选中那一段的长度 | 粘贴的全部内容 |

修改之后的内容可以这样算出来：

```js
const next = field.text.slice(0, range.location) + replacementString +
  field.text.slice(range.location + range.length);
```

**效果**：`next` 是这次修改如果发生，输入框里的全部内容。

## 与 iOS 原生写法的对照

如果你在看 Apple 的文档或 iOS 的示例代码，按这张表换成 JS 的写法。

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

枚举的换算规则：去掉类型前缀，首字母小写。`UIKeyboardTypeEmailAddress` 写成 `'emailAddress'`。见[枚举](enums.md)。

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

`UITextRange` 和 `UITextPosition` 没有暴露：ObjC 里用它们表示选区的两端，JS 里选区直接是从内容开头数的 `NSRange`。

ObjC 的后五个方法返回布尔，JS 里换成可取消的事件：返回 `NO` 对应 `preventDefault()`，返回 `YES` 对应什么都不做。

## 与浏览器 `<input>` 的对照

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
| `maxlength`、`pattern`、`required`、`readonly` | 没有 | 在 `input` 的回调里自己检查 |
| 表单的提交 | 没有 | 按回车派发 `return`，做什么由回调决定 |

## 还不能做的

这一页没写到的成员，先查[补上的成员](view-additions.md#uitextfield)：那一页只列名字和类型，还没有写效果，用法照 Apple 的文档。

| 想做的事 | 对应的原生能力 | 状态 |
| --- | --- | --- |
| 多行输入 | `UITextView` | 已实现，见 [`UITextView`](ui-text-view.md) |
| 得知输入法正在组字的那一段（拼音还没选字时） | `markedTextRange` | 未实现 |
| 按屏幕上的位置找到文字的位置，或者反过来 | `closestPositionToPoint:`、`caretRectForPosition:` 等 `UITextInput` 的成员 | 未实现 |
| 设置文字到边框的内边距 | 覆写 `textRectForBounds:` | 未实现。现在的做法见[自己画边框和底色](#自己画边框和底色) |
| 得知键盘弹出、收起的时刻和键盘的高度 | `UIKeyboardWillShowNotification` 等通知 | 未实现。避开键盘用 `keyboardLayoutGuide`，不需要这些 |
| 让键盘的 guide 不包含底部安全区 | `UIKeyboardLayoutGuide.usesBottomSafeArea` | 没有暴露。实测写入 `true` 后读回来仍是 `false` |
| 按离边缘的远近自动启用和停用约束 | `UITrackingLayoutGuide` 的方法 | 未实现 |

## 参见

- [`UIControl`](ui-control.md)：输入框的父类，`isEnabled` 和全部 16 个事件
- [`UIView`](ui-view.md)：`endEditing()`、`keyboardLayoutGuide` 和安全区
- [Auto Layout](auto-layout.md)：约束和 layout guide 的写法
- [`UIScrollView`](ui-scroll-view.md)：表单很长时放进滚动视图
- [手势识别器](ui-gesture-recognizer.md)：点空白处收起键盘用到的点按识别器
- [`UIButton`](ui-button.md)：表单里的提交按钮
- [`UIFont`](ui-font.md)、[颜色](ui-color.md)：`font` 和 `textColor` 的取值
- [富文本](ns-attributed-string.md)：内容和占位文字里混用字体和颜色，用 `attributedText` 和 `attributedPlaceholder`
- [`UIViewController`](ui-view-controller.md#页面的出现和消失)：自动聚焦用到的 `appear` 事件
- [枚举](enums.md)：字符串取值的规则
- [单位](units.md)
- [实现原理：输入框](../internals/text-input.md)
- [实现原理：事件](../internals/events.md)：点输入框时聚焦时机的实测
