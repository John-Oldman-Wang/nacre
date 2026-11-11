---
type: reference
native: UITextField
status: partial
---

# `UITextField`

`UITextField` 是单行输入框：用户点它，系统键盘弹出，打的字显示在框里。

它相当于 HTML 的 `<input type="text">`。对应关系如下：

| Web | Nacre | 差别 |
| --- | --- | --- |
| `input.value` | `field.text` | 没有内容时是空字符串，不是 `null` |
| `placeholder` | `placeholder` | 没设时读到 `null` |
| `type="password"` | `isSecureTextEntry = true` | 是一个布尔属性，不是一种类型 |
| `inputmode` | `keyboardType` | 只决定弹出哪种键盘，不校验内容 |
| `autocomplete` | `textContentType` | 取值是 iOS 定的一组名字 |
| `enterkeyhint` | `returnKeyType` | 只改回车键上的字，不改行为 |
| `input` 事件 | `editingChanged` 事件 | 事件对象不带内容，要读 `field.text` |
| `focus` / `blur` 事件 | `editingDidBegin` / `editingDidEnd` 事件 | — |
| `el.focus()` / `el.blur()` | `becomeFirstResponder()` / `resignFirstResponder()` | 有返回值，表示是否成功 |
| `disabled` | `isEnabled = false` | — |

另外有四点和 Web 不同：

- **没有默认的边框和大小。** 新建的输入框没有边框，放到页面上看不出哪里能点。边框用 `borderStyle` 设，宽度用约束给。
- **按回车不会提交表单。** iOS 没有表单。按回车时派发 `editingDidEndOnExit` 事件，做什么由你的代码决定。
- **键盘会挡住内容，页面不会自动上移。** 移动端浏览器会把正在输入的框滚到可见位置，iOS 不会。要用[一条约束](#键盘避让一条约束)让内容跟着键盘移动。
- **没有 `maxlength`、`pattern`、`required`、`readonly`。** 限制和校验要在事件回调里自己做，见[限制输入长度](#限制输入长度或过滤字符)。

这一页分三部分：先给一个[能直接运行的完整例子](#完整例子)，再按[你想做的事](#常见用法)给出写法和效果，最后是[每个成员的说明](#成员说明)。

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
  field.addEventListener('editingChanged', () => {
    greeting.text = field.text === '' ? '你好' : `你好，${field.text}`;
  });

  // 4. 按回车时收起键盘，并读出最终内容
  field.addEventListener('editingDidEndOnExit', () => {
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

这段代码没有作为一个整体在模拟器运行过。其中用到的每个 API 都在验收用例里运行过。**上面四条里的外观（边框、占位文字的颜色、回车键上的字）和「每打一个字派发一次 `editingChanged`」未在模拟器验证。**

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

用代码写 `field.text = '张三'` 会把框里的内容换掉。**用代码改 `text` 不派发 `editingChanged`**，这一点和 Web 里改 `value` 不触发 `input` 事件相同。**未在模拟器验证。**

### 显示占位文字

```js
field.placeholder = '请输入账号';
```

**效果**：框里没有内容时显示这行提示，用户打第一个字后提示消失。**提示的颜色未在模拟器验证。**

设成 `null` 去掉提示。

### 实时响应输入变化

```js
field.addEventListener('editingChanged', () => {
  console.log('现在是：' + field.text);
});
```

**效果**：用户每打一个字、删一个字、粘贴一段文字，回调执行一次。**未在模拟器验证。**

事件对象只有 `type` 和 `target`（就是这个输入框），不带内容。内容从 `field.text` 读。

### 按回车时提交并收起键盘

```js
field.addEventListener('editingDidEndOnExit', () => {
  field.resignFirstResponder();
  console.log('提交：' + field.text);
});
```

**效果**：用户按回车键，回调执行，键盘收起。**未在模拟器验证。**

单行输入框里按回车不会插入换行。

### 做密码输入框

```js
field.isSecureTextEntry = true;
```

**效果**：打的每个字显示成圆点。`field.text` 读到的仍然是真实内容。**显示成圆点未在模拟器验证。**

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

> **注意**：`keyboardType` 只决定弹出哪种键盘，不校验内容。用户仍然可以粘贴别的字符进来，连着硬件键盘时也能打任何字符。需要校验时在 `editingChanged` 里检查 `field.text`。
>
> `'numberPad'`、`'decimalPad'`、`'phonePad'` 这几种键盘上没有回车键，用户没法按回车收起键盘。要另外提供收起键盘的方式，见[点空白处收起键盘](#点空白处收起键盘)。**没有回车键这一点未在模拟器验证。**

### 改回车键上的字

```js
field.returnKeyType = 'search';
```

**效果**：键盘右下角的回车键上显示「搜索」。**未在模拟器验证。**

它只改键上的字，不改行为。不管显示什么字，按下去都是派发 `editingDidEndOnExit`。全部取值见 [`returnKeyType`](#returnkeytype)。

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

### 页面刚出现时自动聚焦

iOS 里合适的时机是「页面已经显示出来」。这个时机现在没有对应的事件，见[还不能做的](#还不能做的)。目前的做法是用定时器等待，并检查返回值，不成功就过一会儿重试。

```js
/**
 * @param {UITextField} target 要聚焦的输入框
 * @param {number} attemptsLeft 还能重试几次
 */
function focusWhenReady(target, attemptsLeft) {
  if (target.becomeFirstResponder()) return;
  if (attemptsLeft > 0) {
    setTimeout(() => focusWhenReady(target, attemptsLeft - 1), 100);
  }
}

setTimeout(() => focusWhenReady(field, 30), 0);
```

**效果**：页面显示出来之后，输入框自动开始输入，键盘弹出。最多重试 30 次，约 3 秒，之后放弃。**这个例子未在模拟器验证。**

这个做法有三个限制，都来自实测：

- **在 `sceneconnect` 的回调里直接调 `becomeFirstResponder()` 太早。** 它返回 `true`，`isEditing` 也是 `true`，但是 `editingDidBegin` 事件不派发。
- **页面正在切换时会被拒绝。** 模态页面弹出或关闭的动画期间，`becomeFirstResponder()` 返回 `false`。所以要重试。
- **不要用一个固定的延迟。** 主线程忙的时候，定时器会晚很多才执行，固定的时长对不上。要像上面这样检查结果再决定是否重试。

### 点空白处收起键盘

没有回车键的键盘（比如数字键盘）需要另一种收起方式。常见的做法是点输入框以外的地方收起。

Nacre 还没有手势识别。可以在页面最底层放一个铺满的 [`UIControl`](ui-control.md)，用它接收点击。

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

backdrop.addEventListener('touchUpInside', () => {
  page.view.endEditing(true);
});
```

**效果**：点页面上没有别的控件的地方，键盘收起。点输入框和按钮不受影响，因为它们在 `backdrop` 的前面。**这个例子未在模拟器验证。**

`page.view.endEditing(true)` 让页面里正在输入的那个输入框失焦。不需要知道是哪一个。

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
- 键盘弹出时，输入框上移到键盘上方 16 pt。键盘收起后回到原位。**键盘弹出时上移未在模拟器验证**（验收时软键盘没有弹出）。

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

没有 `maxlength`。现在能做的是在内容变化之后改回去。

```js
field.addEventListener('editingChanged', () => {
  if (field.text.length > 6) {
    field.text = field.text.slice(0, 6);
  }
});
```

**效果**：内容超过 6 个字符时，多出来的部分被去掉。**未在模拟器验证。**

这个做法有两个缺点：

- 多出来的字符会先显示出来，再被去掉。回调不是在按键的那一刻同步执行的，见[事件](#事件)。
- 用拼音这类输入法时，还没选字的拼音字母也算在 `text` 里。这时截断会打断输入。**未在模拟器验证。**

在字符显示之前拦截它，现在做不到，见[还不能做的](#还不能做的)。

## first responder：焦点

**first responder** 是 iOS 里「当前接收键盘输入的那个对象」，相当于 Web 的焦点。同一时刻最多只有一个。

| Web | Nacre |
| --- | --- |
| `el.focus()` | `field.becomeFirstResponder()` |
| `el.blur()` | `field.resignFirstResponder()` |
| `document.activeElement === el` | `field.isFirstResponder` |
| `focus` 事件 | `editingDidBegin` 事件 |
| `blur` 事件 | `editingDidEnd` 事件 |

和 Web 的差别：

- **键盘和 first responder 是绑定的。** 输入框成为 first responder，键盘弹出。它不再是 first responder，键盘收起。没有单独「显示键盘」「隐藏键盘」的方法。
- **聚焦可能失败。** `focus()` 没有返回值，`becomeFirstResponder()` 返回布尔，`false` 表示系统拒绝了。
- **聚焦发生在手指按下的那一刻。** 实测：用户点输入框时，手指刚按下输入框就成为 first responder。Web 是手指抬起、`click` 之后才聚焦。
- **点别处不会自动失焦。** Web 里点页面空白处，输入框失去焦点。iOS 里输入框保持 first responder，键盘留在屏幕上，直到有代码让它失焦，或者用户点了另一个输入框。

`becomeFirstResponder()` 被拒绝的情况：

| 情况 | 结果 | 依据 |
| --- | --- | --- |
| 页面正在切换（模态页面弹出或关闭的动画期间） | 返回 `false` | 实测 |
| 在 `sceneconnect` 的回调里，页面还没显示出来 | 返回 `true`，`isEditing` 是 `true`，但不派发 `editingDidBegin` | 实测 |
| 页面已经显示，没有切换在进行 | 返回 `true`，随后派发 `editingDidBegin` | 实测 |
| 输入框还没加到页面上 | 返回 `false` | **未在模拟器验证** |

收起键盘有三种写法，结果相同：

| 写法 | 什么时候用 |
| --- | --- |
| `field.resignFirstResponder()` | 知道是哪个输入框 |
| `page.view.endEditing(true)` | 不知道是哪个，或者页面上有多个输入框 |
| 在 `editingDidEndOnExit` 的回调里调上面任意一个 | 用户按回车时收起 |

## 键盘避让：一条约束

键盘从屏幕底部弹出，盖在页面上面。页面的大小和位置不变，被盖住的内容就看不到了。

每个视图有一个 `keyboardLayoutGuide` 属性。它是一个 layout guide，也就是不显示的矩形，只用来对齐。这个矩形代表键盘占的区域：

- **键盘收起时**，它的顶边在[安全区](ui-view.md#安全区)的底边。
- **键盘弹出时**，它的顶边在键盘的顶边。

所以把内容的底边约束到它的顶边，两种情况都是对的：

```js
const guide = page.view.keyboardLayoutGuide;
field.translatesAutoresizingMaskIntoConstraints = false;
field.bottomAnchor
  .constraintEqualToAnchor(guide.topAnchor, { constant: -16 })
  .isActive = true;
```

**效果**：键盘收起时，输入框的底边在安全区底边上方 16 pt。键盘弹出时，输入框的底边在键盘上方 16 pt。**键盘弹出时的位置未在模拟器验证。**

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
| `text` | 字符串 | 是 | 是 | `''` | 框里的内容。没有内容时是空字符串，不是 `null`。用户输入引起的变化派发 `editingChanged` |
| `placeholder` | 字符串或 `null` | 是 | 是 | `null` | 没有内容时显示的提示。`null` 表示没有提示 |
| `isEditing` | 布尔 | 是 | 否 | `false` | `true`：输入框正在输入，它是 first responder。`false`：没有在输入。变化时派发 `editingDidBegin` 和 `editingDidEnd` |
| `clearsOnBeginEditing` | 布尔 | 是 | 是 | `false`（**未在模拟器验证**） | `true`：每次开始输入时清空原有内容。`false`：保留原有内容 |

### 键盘

| 属性 | 类型 | 可读 | 可写 | 默认值 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `keyboardType` | 字符串 | 是 | 是 | `'default'` | 弹出哪种键盘。取值见[下面](#keyboardtype) |
| `returnKeyType` | 字符串 | 是 | 是 | `'default'` | 回车键上显示什么字。取值见[下面](#returnkeytype) |
| `enablesReturnKeyAutomatically` | 布尔 | 是 | 是 | `false` | `true`：没有内容时回车键变灰、不能按。`false`：回车键一直能按 |
| `keyboardAppearance` | 字符串 | 是 | 是 | `'default'`（**未在模拟器验证**） | 键盘的明暗。取值见[下面](#keyboardappearance) |

这些属性没有变化通知。它们只由你的代码修改。

以下各表里取值的效果都**未在模拟器验证**。验收用例验证的是：每个属性能写入并读回，写错时抛错。

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

这个属性只改键上的字。所有取值按下去的行为都相同：派发 `editingDidEndOnExit`。

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

### 写错取值时的报错

上面所有取值是字符串的属性，写入不在表里的值都抛 `TypeError`，报错信息里列出全部可用的值：

```js
try {
  // @ts-expect-error 故意写错
  field.keyboardType = 'numeric';
} catch (err) {
  console.log(String(err));
}
```

**效果**：控制台输出 `TypeError: keyboardType has no value "numeric"; expected one of: …`，省略号处是 13 个可用的值。

`textColor` 是例外。写入不认识的颜色字符串时不抛错，运行时在控制台输出一条警告，保留原来的颜色。见[颜色](ui-color.md)。

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
| `isFirstResponder` | 布尔 | 是 | 否 | `true`：这个对象现在是 first responder。`false`：不是。新建的输入框是 `false`。输入框上的变化派发 `editingDidBegin` 和 `editingDidEnd` |
| `canBecomeFirstResponder` | 布尔 | 是 | 否 | `true`：这个对象可以成为 first responder。`false`：不可以，`becomeFirstResponder()` 会返回 `false`。输入框是 `true`，普通的 `UIView` 是 `false`。**这两个值未在模拟器验证** |

让一棵视图树里的输入框失焦用 `endEditing()`，它定义在 `UIView` 上，见 [`UIView` 的键盘一节](ui-view.md#键盘)。

### 键盘的 layout guide

`view.keyboardLayoutGuide` 的类型是 `UIKeyboardLayoutGuide`。它继承自 `UITrackingLayoutGuide`，再继承自 `UILayoutGuide`，所以有 `topAnchor` 等全部锚点和 `layoutFrame`。用法见[键盘避让：一条约束](#键盘避让一条约束)。

它由系统创建，不能 `new`。同一个视图每次读 `keyboardLayoutGuide` 得到的是同一个对象。

| 属性 | 类型 | 可读 | 可写 | 默认值 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `followsUndockedKeyboard` | 布尔 | 是 | 是 | `false` | `true`：iPad 上键盘浮动或拆分时，guide 也跟着键盘。`false`：只在键盘停靠在屏幕底部时跟着。Nacre 现在只支持 iPhone，iPhone 的键盘一直是停靠的 |
| `keyboardDismissPadding` | 数字，单位 [pt](units.md) | 是 | 是 | `0` | 用户向下拖动内容来收起键盘时，手指距离键盘顶边多远就开始收起。拖动收起键盘这项能力还没暴露，所以这个值现在没有可见的效果 |

### 事件

用 `addEventListener()` 监听。输入框用到的是这四个：

| 事件 | 什么时候派发 | Web 的对应物 |
| --- | --- | --- |
| `editingDidBegin` | 输入框成为 first responder，开始输入 | `focus` |
| `editingChanged` | 用户的输入让内容变了一次 | `input` |
| `editingDidEndOnExit` | 用户按了回车键 | 没有。接近监听 `keydown` 里的 Enter |
| `editingDidEnd` | 输入框不再是 first responder，结束输入 | `blur` |

一次典型的输入派发这些事件：

| 用户的操作 | 派发 |
| --- | --- |
| 点输入框 | `editingDidBegin`。实测在手指按下的那一刻 |
| 打三个字 | `editingChanged` 三次。**未在模拟器验证** |
| 按回车 | `editingDidEndOnExit`。**未在模拟器验证** |
| 键盘收起 | `editingDidEnd` |

`editingDidEndOnExit` 和 `editingDidEnd` 谁先谁后**未在模拟器验证**。

用代码调 `becomeFirstResponder()` 和 `endEditing()` 时，同样派发 `editingDidBegin` 和 `editingDidEnd`。这一点在验收用例里验证过。

- 事件对象只有 `type` 和 `target` 两个字段。不带输入的内容，也不带按了哪个键。
- 事件不能取消，`preventDefault()` 不起作用。所以不能用它阻止某个字符进入输入框。
- 回调不是在事件发生的那一刻同步执行，而是排到主线程的下一轮任务里执行。主线程忙的时候会晚到。
- 没有 Web 里 `change` 事件的对应物。「用户输入完了」用 `editingDidEnd`。
- 监听不认识的事件名会抛 `TypeError`。

完整的 16 个事件见 [`UIControl`](ui-control.md)。

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
| `[field addTarget:self action:@selector(changed) forControlEvents:UIControlEventEditingChanged]` | `field.addEventListener('editingChanged', changed)` |
| `[field becomeFirstResponder]` | `field.becomeFirstResponder()` |
| `[field resignFirstResponder]` | `field.resignFirstResponder()` |
| `field.isFirstResponder` | `field.isFirstResponder` |
| `[view endEditing:YES]` | `view.endEditing(true)` |
| `view.keyboardLayoutGuide.topAnchor` | `view.keyboardLayoutGuide.topAnchor` |

枚举的换算规则：去掉类型前缀，首字母小写。`UIKeyboardTypeEmailAddress` 写成 `'emailAddress'`。见[枚举](enums.md)。

`UITextFieldDelegate` 的方法和 JS 的对应：

| ObjC 的 delegate 方法 | JS |
| --- | --- |
| `textFieldDidBeginEditing:` | `editingDidBegin` 事件 |
| `textFieldDidChangeSelection:` 里读内容 | `editingChanged` 事件 |
| `textFieldDidEndEditing:` | `editingDidEnd` 事件 |
| `textFieldShouldReturn:` 里收键盘 | `editingDidEndOnExit` 事件里调 `resignFirstResponder()` |
| `textField:shouldChangeCharactersInRange:replacementString:` | 未实现 |
| `textFieldShouldBeginEditing:`、`textFieldShouldEndEditing:`、`textFieldShouldClear:` | 未实现 |

## 还不能做的

| 想做的事 | 对应的原生能力 | 状态 |
| --- | --- | --- |
| 多行输入 | `UITextView` | 未实现 |
| 在字符显示之前拦截：限制长度、只允许数字 | `textField:shouldChangeCharactersInRange:replacementString:` | 未实现。这个方法要求立刻返回一个布尔，运行时还不能同步回调 JS。现在只能[事后改回去](#限制输入长度或过滤字符) |
| 阻止输入框开始输入、结束输入、被清空 | `textFieldShouldBeginEditing:` 等 | 未实现，原因同上 |
| 页面出现时自动聚焦，不用定时器 | `viewDidAppear:` | 未实现。页面的生命周期还没暴露。现在的做法见[页面刚出现时自动聚焦](#页面刚出现时自动聚焦) |
| 读写光标位置和选中的范围 | `selectedTextRange` 等 `UITextInput` 的成员 | 未实现 |
| 文字里混用多种字体和颜色；改占位文字的颜色 | `attributedText`、`attributedPlaceholder` | 未实现 |
| 在键盘上方加自己的工具条 | `inputAccessoryView` | 未实现 |
| 把系统键盘换成自己的视图 | `inputView` | 未实现 |
| 在输入框左侧或右侧放图标 | `leftView`、`rightView` | 未实现 |
| 设置文字到边框的内边距 | 覆写 `textRectForBounds:` | 未实现。现在的做法见[自己画边框和底色](#自己画边框和底色) |
| 用手势点空白处收起键盘 | `UITapGestureRecognizer` | 未实现。现在的做法见[点空白处收起键盘](#点空白处收起键盘) |
| 拖动滚动视图时收起键盘 | `UIScrollView.keyboardDismissMode` | 未实现 |
| 得知键盘弹出、收起的时刻和键盘的高度 | `UIKeyboardWillShowNotification` 等通知 | 未实现。避开键盘用 `keyboardLayoutGuide`，不需要这些 |
| 让键盘的 guide 不包含底部安全区 | `UIKeyboardLayoutGuide.usesBottomSafeArea` | 没有暴露。实测写入 `true` 后读回来仍是 `false` |
| 按离边缘的远近自动启用和停用约束 | `UITrackingLayoutGuide` 的方法 | 未实现 |

## 参见

- [`UIControl`](ui-control.md)：输入框的父类，`isEnabled` 和全部 16 个事件
- [`UIView`](ui-view.md)：`endEditing()`、`keyboardLayoutGuide` 和安全区
- [Auto Layout](auto-layout.md)：约束和 layout guide 的写法
- [`UIScrollView`](ui-scroll-view.md)：表单很长时放进滚动视图
- [`UIFont`](ui-font.md)、[颜色](ui-color.md)：`font` 和 `textColor` 的取值
- [定时器](timers.md)：自动聚焦用到的 `setTimeout`
- [枚举](enums.md)：字符串取值的规则
- [单位](units.md)
- [实现原理：输入框](../internals/text-input.md)
- [实现原理：事件](../internals/events.md)：点输入框时聚焦时机的实测
