---
type: reference
native: UITextView
status: partial
---

# `UITextView`

**`UITextView`** 表示一块可以输入多行文字的区域。用户点它，系统键盘弹出；按回车是换行，不会结束输入。App 从 `text` 属性读出全部内容，从 `selectedRange` 读出光标的位置和选中的范围，通过事件得知内容变了、光标动了、输入开始和结束了。

多行输入是[滚动视图](ui-scroll-view.md)，也是[视图](ui-view.md)。内容超过它自己的高度时可以上下滚动，滚动视图的属性和事件它都有。它不是[控件](ui-control.md)，没有 `isEnabled`，也没有控件的那 16 个事件。只要一行的输入用 [`UITextField`](ui-text-field.md)。

这一页里标「实测」的行为，是用不带界面的小程序在模拟器（iPhone Air，iOS 27.2）上量的。验收用例还没有在 App 里运行过，所以屏幕上的样子和真实键盘的行为都标了「**未在模拟器验证**」。

## 它和单行输入框差在哪

| | `UITextField` | `UITextView` |
| --- | --- | --- |
| 行数 | 一行 | 多行，按回车换行 |
| 父类 | 控件 | 滚动视图 |
| 内容变了 | `input` 事件 | `input` 事件 |
| 开始、结束输入 | `focus`、`blur` | `focus`、`blur` |
| 按回车 | 派发 `return` | 换行，不派发事件 |
| 占位文字 | `placeholder` 属性 | 没有，要自己叠一个标签，见[显示占位文字](#显示占位文字) |
| 边框 | `borderStyle` 有四种样式 | 没有可用的边框样式，用底色和圆角，见[完整例子](#完整例子) |
| 光标和选中的范围 | `selectedRange` | `selectedRange` |
| 光标或选区动了 | `selectionchange` 事件 | `selectionchange` 事件 |

键盘的那九个属性（`keyboardType`、`textContentType` 等）两边相同。

## 键盘怎么收起

键盘跟着 first responder 走。first responder 是 iOS 里「当前接收键盘输入的那个对象」，同一时刻最多只有一个。多行输入成为 first responder 时键盘弹出，它不再是 first responder 时键盘收起。详细的说明见[输入框和键盘](ui-text-field.md#first-responder焦点)。

多行输入里回车是换行，所以不能像单行输入框那样靠回车收键盘。有三种办法：

| 办法 | 写法 |
| --- | --- |
| 用户往下拖动文字时收起 | `input.keyboardDismissMode = 'onDrag'` |
| 在键盘上方放一个「完成」按钮 | 把带按钮的工具条写给 `input.inputAccessoryView`，按钮的回调里调 `input.resignFirstResponder()`，见[在键盘上方放一个「完成」按钮](#在键盘上方放一个完成按钮) |
| 点空白处收起 | 给页面加点按手势，回调里调 `page.view.endEditing(true)`，见[点空白处收起键盘](ui-text-field.md#点空白处收起键盘) |

三种办法的实际效果**未在模拟器验证**。验收用例验证的是：`keyboardDismissMode` 和 `inputAccessoryView` 能写入并读回；用代码调 `resignFirstResponder()` 之后它不再是 first responder，并派发 `blur`。

## 内容超出时：滚动，还是长高

默认情况下多行输入的大小由你给：用约束或 `frame` 定出宽和高，内容超过这个高度就在里面滚动。

把 `isScrollEnabled` 设成 `false` 之后，它不再滚动，而是有了自己想要的高度：文字有几行，它就要多高。用约束定位时只给左右和顶边，不给高度，它的高度跟着文字变（实测）。聊天输入框那种「打字时逐行长高」的效果就是这样做的，见[做一个跟着内容长高的输入框](#做一个跟着内容长高的输入框)。

## 代码改内容和用户改内容

| 怎么改的 | 派发 `input` 吗 |
| --- | --- |
| 用户打字、删除、粘贴 | 派发（**未在模拟器验证**） |
| `input.insertText('…')`、`input.deleteBackward()` | 派发（实测） |
| `input.text = '…'` | 不派发（实测） |

所以用代码写 `text` 之后，依赖内容的界面（字数、占位文字）要自己更新一次。反过来，在 `input` 的回调里写 `text` 不会再次触发回调。

## 推荐的做法

- **一定要设 `font`。** 新建的多行输入没有设字体，文字比系统标准的 17 pt 正文小（实测：一行字时它想要的高度是 30 pt，设成 17 pt 的字之后是 36 pt）。
- **给它底色和圆角。** 新建的多行输入底色是页面的底色，没有边框，放到页面上看不出哪里可以点。
- **设 `keyboardDismissMode = 'onDrag'`，或者提供一个收键盘的按钮（放在 [`inputAccessoryView`](#在键盘上方放一个完成按钮) 里）。** 否则键盘弹出之后没有办法收起。
- **靠近屏幕底部时，把它所在的容器的底边约束到 `keyboardLayoutGuide.topAnchor`。** 见[让它不被键盘挡住](#让它不被键盘挡住)。
- **内容变化用 `input` 监听，结束输入时用 `blur` 保存。**

## 完整例子

下面的代码从空白 App 开始，在屏幕上方放一块多行输入，下面一行字显示内容的长度。

```js
application.addEventListener('sceneconnect', (e) => {
  // 建窗口和页面。每个 App 都要有这几行
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 1. 创建多行输入，设置外观
  const input = new UITextView();
  input.font = UIFont.systemFontOfSize(17);            // 不设的话字很小
  input.backgroundColor = 'secondarySystemBackground'; // 灰色的底，看得出范围
  input.layer.cornerRadius = 10;
  input.keyboardDismissMode = 'onDrag';                // 往下拖动文字时收起键盘

  // 2. 一行文字，显示内容的长度
  const counter = new UILabel();
  counter.text = '长度 0';
  counter.textColor = 'secondaryLabel';

  // 3. 内容每变一次，更新那行文字
  input.addEventListener('input', () => {
    counter.text = '长度 ' + input.text.length;
  });

  // 4. 结束输入时读出全部内容
  input.addEventListener('blur', () => {
    console.log('输入的是：' + input.text);
  });

  // 5. 放到页面上：左右各留 16 pt，高 160 pt；那行字在它下面
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

## 常见用法

以下例子都假设已经有上面的 `input` 和 `page`。

### 读出和写入内容

```js
console.log(input.text.length);
input.text = '第一行\n第二行';
console.log(input.hasText);
```

**效果**：第一行输出当前内容的长度。没有内容时 `text` 是空字符串 `''`，不是 `null`。第二行把内容换成两行字，换行就是字符串里的 `\n`。第三行输出 `true`。

写 `text` 之后光标在内容的末尾（实测）。写 `null` 或 `undefined` 得到空字符串。写 `text` 不派发 `input`。

### 限制输入的长度

```js
const LIMIT = 200;
input.addEventListener('input', () => {
  if (input.text.length > LIMIT) {
    input.text = input.text.slice(0, LIMIT);
  }
});
```

**效果**：内容超过 200 个 UTF-16 码元时，多出来的部分被去掉。写 `text` 不派发 `input`，所以回调不会因此再执行一次。截断之后光标在末尾。

在字符显示之前拦住它，目前做不到，见[还不能做的](#还不能做的)。用户会先看到多出来的字，随后它消失；这一点**未在模拟器验证**。

### 显示占位文字

多行输入没有 `placeholder` 属性。做法是在它上面叠一个[标签](ui-label.md)，没有内容时显示，有内容时隐藏。

```js
const hint = new UILabel();
hint.text = '写点什么…';
hint.font = input.font;
hint.textColor = 'placeholderText';
hint.translatesAutoresizingMaskIntoConstraints = false;
input.addSubview(hint);
NSLayoutConstraint.activateConstraints([
  // 文字从离顶边 8 pt、离左边 5 pt 的地方开始，标签对上去
  hint.topAnchor.constraintEqualToAnchor(input.topAnchor, { constant: 8 }),
  hint.leadingAnchor.constraintEqualToAnchor(input.leadingAnchor, { constant: 5 }),
]);

const syncHint = () => { hint.isHidden = input.hasText; };
input.addEventListener('input', syncHint);
syncHint();
```

**效果**：没有内容时，左上角显示灰色的「写点什么…」。用户打了第一个字，它消失；内容删光，它重新出现。**外观未在模拟器验证。**

8 和 5 这两个数来自 `textContainerInset` 和 `lineFragmentPadding` 的默认值，见[文字离四边多远](#文字离四边多远)。改了那两个值，这里要跟着改。

用代码写 `input.text` 之后要自己调一次 `syncHint()`，因为写 `text` 不派发 `input`。

### 做一个跟着内容长高的输入框

```js
const composer = new UITextView();
composer.font = UIFont.systemFontOfSize(17);
composer.backgroundColor = 'secondarySystemBackground';
composer.layer.cornerRadius = 10;
composer.isScrollEnabled = false;   // 不滚动，高度跟着内容走
composer.translatesAutoresizingMaskIntoConstraints = false;
page.view.addSubview(composer);

const safe = page.view.safeAreaLayoutGuide;
NSLayoutConstraint.activateConstraints([
  composer.topAnchor.constraintEqualToAnchor(safe.topAnchor, { constant: 24 }),
  composer.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor, { constant: 16 }),
  composer.trailingAnchor.constraintEqualToAnchor(safe.trailingAnchor, { constant: -16 }),
  // 不给高度
]);
```

**效果**：没有内容时它是一行字的高度（17 pt 的字是 36 pt）。内容每多一行，它长高一行；删掉一行，它缩回去。实测 17 pt 的字：三行高 77 pt，五行高 118 pt，六行高 138 pt。

这一条在放进窗口之后才成立。没有放进窗口的多行输入，改了文字之后重新布局，高度还是原来的（实测）。

关掉滚动之后内容再多也不能滚，它会一直长高。

### 只读地展示一段长文字

```js
input.isEditable = false;
input.text = '很长的一段说明文字……';
```

**效果**：用户点它不会弹出键盘，不能修改内容，但仍然可以长按选中文字并拷贝，内容超过高度时可以滚动。**未在模拟器验证。**

连选中也不允许时，再加一句 `input.isSelectable = false`。

`isEditable` 只限制用户。代码写 `text`、调 `insertText()` 和 `deleteBackward()` 照样改得动（实测）。

### 读写光标的位置和选中的范围

```js
const range = input.selectedRange;
console.log(range.location, range.length);

input.selectedRange = new NSRange(0, 0);                  // 光标放到开头
input.selectedRange = new NSRange(0, input.text.length);  // 全选
const selected = input.text.slice(range.location, range.location + range.length);
```

**效果**：`selectedRange` 是一个 [`NSRange`](#nsrange)：`location` 是起点，`length` 是选中了多少。`length` 是 0 表示没有选中文字，只有一个光标，位置是 `location`。最后一行取出选中的那段文字。

选中的范围在屏幕上显示成什么样**未在模拟器验证**。

多行输入没有在输入时也能读写选区，这几行不需要先聚焦。

### 光标动了的时候得到通知

```js
input.addEventListener('selectionchange', () => {
  const range = input.selectedRange;
  console.log('光标在 ' + range.location + '，选中了 ' + range.length + ' 个码元');
});

input.selectedRange = new NSRange(0, 3);
```

**效果**：最后一行执行之后，控制台输出 `光标在 0，选中了 3 个码元`（实测代码写 `selectedRange` 会派发）。用户移动光标、拖动选区、打字时同样各输出一行，这一部分**未在模拟器验证**。

事件对象不带选区，在回调里读 `input.selectedRange`。回调是稍后执行的，读到的是回调执行那一刻的选区。

### 在光标处插入文字

```js
input.insertText('😀');
```

**效果**：在光标的位置插入一个表情，光标移到它后面。有选中的文字时，选中的部分被换成这个表情。派发一次 `input`（实测）。

### 滚到某一段文字

```js
input.scrollRangeToVisible(new NSRange(input.text.length, 0));
```

**效果**：滚动到内容的末尾。实测一块 200 × 60 pt、内容 40 行的多行输入，调用之后 `contentOffset.y` 从 0 变成 788。

### 文字离四边多远

```js
input.textContainerInset = new UIEdgeInsets(12, 12, 12, 12);
input.textContainer.lineFragmentPadding = 0;
```

**效果**：文字离四边各 12 pt。

文字到左右两边的距离由两个值相加得到：`textContainerInset` 的左、右，加上 `textContainer.lineFragmentPadding`。默认值是 0 加 5，所以新建的多行输入文字离左边 5 pt。把 `lineFragmentPadding` 设成 0 之后，左右的距离就只由 `textContainerInset` 决定。

### 最多显示几行

```js
input.isScrollEnabled = false;
input.isEditable = false;
input.textContainer.maximumNumberOfLines = 3;
input.textContainer.lineBreakMode = 'byTruncatingTail';
```

**效果**：只排出前三行，第三行排不下时以省略号结尾（**省略号未在模拟器验证**）。`text` 里的内容不变，只是多出来的不显示。实测六行 17 pt 的字，不限行数时它想要的高度是 138 pt，限成两行之后是 57 pt。

### 让它不被键盘挡住

键盘盖在页面上面，页面的大小和位置不变。靠近屏幕底部的多行输入会被键盘盖住。把它（或者它所在的容器）的底边约束到页面的 `keyboardLayoutGuide` 的顶边：

```js
input.bottomAnchor
  .constraintEqualToAnchor(page.view.keyboardLayoutGuide.topAnchor, { constant: -16 })
  .isActive = true;
```

**效果**：键盘收起时，它的底边在安全区底边上方 16 pt。键盘弹出时，它的底边在键盘顶边上方 16 pt。**未在模拟器验证。**

`keyboardLayoutGuide` 的说明见[输入框和键盘](ui-text-field.md#键盘避让一条约束)。

### 在键盘上方放一个「完成」按钮

`inputAccessoryView` 是键盘弹出时贴在键盘上面的一个视图，跟着键盘一起出现和消失。多行输入里回车是换行，收键盘的按钮通常放在这里。

```js
const bar = new UIToolbar();
const done = UIBarButtonItem.systemItem('done');
done.addEventListener('click', () => input.resignFirstResponder());
bar.items = [UIBarButtonItem.flexibleSpace(), done];
bar.sizeToFit();
input.inputAccessoryView = bar;
```

**效果**：点多行输入弹出键盘，键盘上面多一条[工具条](ui-toolbar.md)，右端是「完成」。点它，键盘收起，工具条跟着消失。**这个例子未在模拟器验证**；验收用例里有「聚焦之后这个视图出现在屏幕上」的断言，它们写完之后还没有运行过。

`bar.sizeToFit()` 让工具条量出自己的高度。新建的工具条高度是 0，不调这一句它不占位置。

这个属性和[单行输入框](ui-text-field.md#在键盘上方放一排按钮)上的同名属性相同：可以是任何视图，同一个视图可以给几个输入框，正在输入时换当场生效。

### 用代码聚焦和失焦

```js
const ok = input.becomeFirstResponder();
// ……
input.resignFirstResponder();
```

**效果**：第一行让它聚焦，键盘弹出，随后派发 `focus`。`ok` 是 `false` 表示系统拒绝了，什么都没有发生，什么时候会被拒绝见[输入框和键盘](ui-text-field.md#first-responder焦点)。最后一行让它失焦，键盘收起，随后派发 `blur`。

`isEditable` 是 `false` 时，`becomeFirstResponder()` 仍然返回 `true`，但不派发 `focus`，失焦时也不派发 `blur`（实测，量的时候没有键盘）。

## `NSRange`

`NSRange` 表示一段文字的范围，有两个字段：

| 字段 | 含义 |
| --- | --- |
| `location` | 这一段从哪里开始。0 是第一个字符之前 |
| `length` | 这一段有多长。0 表示一个位置，没有内容 |

**单位是 UTF-16 码元，和 JS 字符串的下标相同。** 所以 `text.slice(location, location + length)` 取出来的就是这一段，`text.length` 就是最大的 `location`。大多数字符占一个码元，表情和一部分汉字占两个：

```js
input.text = 'a😀b';
console.log(input.text.length);
input.selectedRange = new NSRange(1, 2);
```

**效果**：输出 `4`。`(1, 2)` 正好选中那个表情（实测）。

> **注意**：把光标放在一个表情的两个码元中间（上面的例子里是 `new NSRange(2, 0)`）不会被纠正。在那里插入文字会把表情拆成两半（实测）。自己算位置时要避开。

`NSRange` 是[结构体](structs.md)，规矩和 `CGRect` 那一组相同：

- **字段只读。** `range.location = 3` 抛 `TypeError: location is read-only: structs are values, assign a whole new one instead`。要改就整体换一个：`input.selectedRange = new NSRange(3, 0)`。
- **写入时可以给普通对象。** `input.selectedRange = { location: 3, length: 0 }` 和上面等价。读出来的永远是 `NSRange`。
- **每次读得到一个新对象。** `input.selectedRange === input.selectedRange` 是 `false`。
- **转成字符串**是 `NSRange(3, 0)`，过 `JSON.stringify` 是 `{"location":3,"length":0}`。

两个字段是非负整数：

| 给的值 | 结果 |
| --- | --- |
| 不给 | 0。`new NSRange()` 是 `(0, 0)` |
| 小数 | 向零取整。`new NSRange(1.9, 2.2)` 是 `(1, 2)` |
| 像数的字符串 | 按数转。`new NSRange('3', '4')` 是 `(3, 4)` |
| 负数 | 抛 `TypeError: NSRange location must be a non-negative integer, got -1` |
| 转不成有限的数 | 抛 `TypeError: NSRange location must be a finite number, got "abc"` |

## 成员说明

### 继承关系

`UITextView` → [`UIScrollView`](ui-scroll-view.md) → [`UIView`](ui-view.md) → `UIResponder` → `NSObject`

`contentOffset`、`isScrollEnabled`、滚动事件等继承自 `UIScrollView`。位置、底色、圆角、隐藏、`keyboardLayoutGuide` 等继承自 `UIView`。`becomeFirstResponder()` 等继承自 `UIResponder`，说明见[输入框和键盘](ui-text-field.md#first-responder)。这几部分不在这里重复。

`UITextView` 不能被继承。`class X extends UITextView {}` 在 `new X()` 时抛错，见[原生类](native-classes.md)。

### 创建

#### `new UITextView()`

创建一块多行输入。没有参数。

```js
const input = new UITextView();
```

新建的多行输入没有内容，没有设字体，底色是 `'systemBackground'`，大小是 0，可以编辑、可以选中、可以滚动（实测）。

### 内容

| 属性 | 类型 | 可读 | 可写 | 默认值 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `text` | 字符串 | 是 | 是 | `''` | 全部内容，换行是 `\n`。没有内容时是空字符串，不是 `null`。写 `null` 或 `undefined` 得到空字符串。写完光标在末尾。用户输入引起的变化派发 `input`，代码写它不派发 |
| `hasText` | 布尔 | 是 | 否 | `false` | `true`：有内容。`false`：内容是空的。没有单独的通知，在 `input` 的回调里读 |

#### `insertText()`

按用户打字的方式插入一段文字：插在光标的位置；有选中的文字时，换掉选中的部分。光标移到插入的内容后面。

```js
input.insertText('你好');
```

- **参数**：字符串。别的类型按 `String()` 转，`null` 和 `undefined` 当作空字符串。
- **返回**：无。
- 派发一次 `input`。插入空字符串什么都不改，但也派发（实测）。
- `isEditable` 是 `false` 时照样能插入（实测）。

#### `deleteBackward()`

按用户按删除键的方式删除：有选中的文字时删掉选中的部分，没有时删掉光标前面的一个字符。

```js
input.deleteBackward();
```

- **参数**：无。
- **返回**：无。
- 删掉了内容时派发一次 `input`。光标在开头、没有可删的内容时什么都不做，也不派发（实测）。

### 外观

| 属性 | 类型 | 可读 | 可写 | 默认值 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `font` | [`UIFont`](ui-font.md) 或 `null` | 是 | 是 | `null` | 文字的字体。`null` 表示没有设，这时文字比 17 pt 小。写 `null` 是撤回 |
| `textColor` | 字符串或 `null` | 是 | 是 | `'label'` | 文字的[颜色](ui-color.md)。写 `null` 之后读出来是 `null`。写入不认识的颜色字符串不抛错，运行时输出一条警告，保留原来的颜色 |
| `textAlignment` | 字符串 | 是 | 是 | `'natural'` | 文字靠哪边。`'left'`：靠左。`'center'`：居中。`'right'`：靠右。`'justified'`：两端对齐。`'natural'`：按文字的书写方向，中文和英文是靠左 |
| `textContainerInset` | `UIEdgeInsets`，单位 [pt](units.md) | 是 | 是 | 上下各 8，左右 0 | 文字离四边多远。写入时可以给普通对象 `{ top, left, bottom, right }` |
| `textContainer` | [`NSTextContainer`](#nstextcontainer) | 是 | 否 | — | 文字排版的区域。每次读得到同一个对象 |

这些属性没有变化通知，它们只由你的代码修改。取值的效果**未在模拟器验证**；验收用例验证的是每个属性能写入并读回，写错时属性保持原值并输出一条警告。

### 行为

| 属性 | 类型 | 可读 | 可写 | 默认值 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `isEditable` | 布尔 | 是 | 是 | `true` | `true`：用户可以修改内容。`false`：用户不能修改，点它不弹键盘。只限制用户，代码照样能改 |
| `isSelectable` | 布尔 | 是 | 是 | `true` | `true`：用户可以选中文字。`false`：不能选中 |

这两个属性会互相带动（实测）：

| 写入 | 另一个属性 |
| --- | --- |
| `isSelectable = false` | `isEditable` 也变成 `false` |
| `isSelectable = true` | `isEditable` 不变，不会自己变回 `true` |
| `isEditable = true` | `isSelectable` 也变成 `true` |
| `isEditable = false` | `isSelectable` 不变 |

所以要「能选中但不能编辑」，只写 `isEditable = false`。

### 选区

| 属性 | 类型 | 可读 | 可写 | 默认值 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `selectedRange` | [`NSRange`](#nsrange) | 是 | 是 | `(0, 0)` | 选中的范围。`length` 是 0 表示光标。写入时可以给普通对象 `{ location, length }`。变化时派发 [`selectionchange`](#selectionchange) |

写入超出内容的范围不抛错（实测，内容是 10 个字符时）：

| 写入 | 读回来 |
| --- | --- |
| `(100, 5)`：起点超出 | `(10, 0)`，光标在末尾 |
| `(2, 100)`：长度超出 | `(2, 0)`，起点不变，长度变成 0 |

写入时的报错：

- 缺字段：`TypeError: selectedRange is missing length, or it is not a finite number`
- 不是对象：`TypeError: selectedRange needs an object with all of: location, length`
- 负数：`TypeError: selectedRange.location must be a non-negative integer`

#### `scrollRangeToVisible()`

滚动到这一段文字看得见为止。

```js
input.scrollRangeToVisible(new NSRange(0, 0));
```

- **参数**：`NSRange`，或者普通对象 `{ location, length }`。
- **返回**：无。
- 范围超出内容时不抛错，也不滚动（实测）。
- 参数不对时的报错和写 `selectedRange` 相同，开头换成 `scrollRangeToVisible`。

### `NSTextContainer`

`NSTextContainer` 表示文字排版的区域。每个多行输入自带一个，从 `input.textContainer` 得到。它不能 `new`：`new NSTextContainer()` 抛 `TypeError: Illegal constructor: NSTextContainer is created by the runtime, not by new`。

| 属性 | 类型 | 可读 | 可写 | 默认值 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `lineFragmentPadding` | 数字，单位 [pt](units.md) | 是 | 是 | `5` | 每一行左右各空出多少。它加在 `textContainerInset` 的左、右之上 |
| `maximumNumberOfLines` | 数字，行数 | 是 | 是 | `0` | 最多排几行。`0` 表示不限。给小数向零取整。负数抛 `TypeError: maximumNumberOfLines must be a non-negative integer` |
| `lineBreakMode` | 字符串 | 是 | 是 | `'byWordWrapping'` | 一行排不下时怎么处理，取值见下表 |

| `lineBreakMode` 的取值 | 效果 |
| --- | --- |
| `'byWordWrapping'` | 在词的边界换行 |
| `'byCharWrapping'` | 在任意字符之间换行 |
| `'byClipping'` | 不换行，超出的部分不显示 |
| `'byTruncatingHead'` | 省略号在开头 |
| `'byTruncatingTail'` | 省略号在结尾 |
| `'byTruncatingMiddle'` | 省略号在中间 |

各个取值的显示效果**未在模拟器验证**。

### 键盘

这九个属性和 [`UITextField`](ui-text-field.md#键盘) 上的同名属性相同，取值的完整列表见那一页。

| 属性 | 类型 | 可读 | 可写 | 默认值 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `keyboardType` | 字符串 | 是 | 是 | `'default'` | 弹出哪种键盘。[取值](ui-text-field.md#keyboardtype) |
| `returnKeyType` | 字符串 | 是 | 是 | `'default'` | 回车键上显示什么字。[取值](ui-text-field.md#returnkeytype)。只改键上的字，按下去仍然是换行 |
| `keyboardAppearance` | 字符串 | 是 | 是 | `'default'` | 键盘的明暗：`'default'` 跟随系统，`'light'` 浅色，`'dark'` 深色。`'alert'` 是 `'dark'` 的旧名字，写得进去，读出来是 `'dark'` |
| `enablesReturnKeyAutomatically` | 布尔 | 是 | 是 | `false` | `true`：没有内容时回车键变灰、不能按。`false`：回车键一直能按 |
| `isSecureTextEntry` | 布尔 | 是 | 是 | `false` | `true`：按密码的方式输入。`false`：正常输入 |
| `autocapitalizationType` | 字符串 | 是 | 是 | `'sentences'` | 自动大写：`'none'` 不大写，`'words'` 每个词的首字母，`'sentences'` 每句的首字母，`'allCharacters'` 全部 |
| `autocorrectionType` | 字符串 | 是 | 是 | `'default'` | 自动纠错：`'default'` 由系统决定，`'no'` 关，`'yes'` 开 |
| `spellCheckingType` | 字符串 | 是 | 是 | `'default'` | 拼写检查：`'default'` 由系统决定，`'no'` 关，`'yes'` 开 |
| `textContentType` | 字符串或 `null` | 是 | 是 | `null` | 这里装的是什么，系统据此提供自动填充。[取值](ui-text-field.md#textcontenttype-的取值)。`null` 表示没配 |

键盘上方的视图：

| 属性 | 类型 | 可读 | 可写 | 默认值 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `inputAccessoryView` | [`UIView`](ui-view.md) 或 `null` | 是 | 是 | `null` | 键盘弹出时贴在键盘上面的视图。读回来的是写进去的那个对象。没有变化通知：它只有代码能改 |

- 写 `null` 或 `undefined` 是去掉。
- 写了不是视图的原生对象，抛 `TypeError: inputAccessoryView needs a UIView or null`；写了数、字符串等普通值，抛 `TypeError: inputAccessoryView needs a native object or null, got 5`。原值不变。
- 正在输入时写入，当场生效。**未在模拟器验证。**
- 其余的规则见[单行输入框的同名属性](ui-text-field.md#键盘)。

多行输入是滚动视图，所以还有滚动视图的 `keyboardDismissMode`：

| 属性 | 类型 | 可读 | 可写 | 默认值 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `keyboardDismissMode` | 字符串 | 是 | 是 | `'none'` | 用户拖动文字时要不要收起键盘，取值见下表 |

| `keyboardDismissMode` 的取值 | 效果 |
| --- | --- |
| `'none'` | 拖动时不收键盘 |
| `'onDrag'` | 一开始拖动就收起键盘 |
| `'interactive'` | 手指拖到键盘上之后，键盘跟着手指往下走，松手时决定收起还是弹回 |
| `'onDragWithAccessory'` | 同 `'onDrag'`，连同键盘上方的工具条一起收 |
| `'interactiveWithAccessory'` | 同 `'interactive'`，连同键盘上方的工具条一起算 |

这个属性继承自 [`UIScrollView`](ui-scroll-view.md#键盘)，普通的滚动视图和列表上也有。

上面各表里取值的效果都**未在模拟器验证**。验收用例验证的是：每个属性能写入并读回，写错时属性保持原值并输出一条警告。

### 写错取值时

取值是字符串的属性，写入不在表里的值都不抛异常：属性保持原来的值，控制台输出一条警告，警告里列出全部可用的值。

```js
input.keyboardDismissMode = 'onDrag';
// @ts-expect-error 故意写错
input.keyboardDismissMode = 'drag';
console.log(input.keyboardDismissMode);
```

**效果**

- 控制台输出警告 `[Nacre] keyboardDismissMode has no value "drag"; expected one of: none / onDrag / interactive / onDragWithAccessory / interactiveWithAccessory, ignored`。
- 接着输出 `onDrag`：写错的赋值没有生效，属性保持原来的值。

`textColor` 写错时同样是输出警告、保留原来的颜色，见[外观](#外观)。

### 事件

用 `addEventListener()` 监听。多行输入自己的事件有四个：

| 事件 | 什么时候派发 |
| --- | --- |
| `focus` | 它成为 first responder，开始输入 |
| `input` | 用户的输入改了内容，或者代码调了 `insertText()`、`deleteBackward()` |
| `selectionchange` | 选区或者光标的位置变了，见[下面](#selectionchange) |
| `blur` | 它不再是 first responder，结束输入 |

```js
input.addEventListener('focus', () => console.log('开始输入'));
input.addEventListener('input', () => console.log('现在是：' + input.text));
input.addEventListener('blur', () => console.log('结束输入'));
```

**效果**：用代码调 `becomeFirstResponder()` 和 `resignFirstResponder()` 时各输出一次「开始输入」和「结束输入」；调 `insertText()` 时输出一次内容（实测）。用户操作时的派发**未在模拟器验证**。

- 事件对象的 `type` 是事件名，`target` 是这块多行输入。事件对象不带内容，也不带改了哪里。内容读 `input.text`，光标读 `input.selectedRange`。
- 事件不能取消，`preventDefault()` 不起作用。所以不能用它阻止某个字符进入。
- 回调不是在事件发生的那一刻同步执行，而是稍后执行，见[回调的执行时机](ui-control.md#回调的执行时机)。调完 `insertText()` 的下一行，回调还没有执行。
- 回调里抛出异常不影响多行输入，同一事件的其他回调照常执行。异常在 [`application`](application.md#没处理的异常不会让-app-退出) 上派发 `error`；没有监听器取消时，控制台输出以 `Uncaught` 开头的日志。
- 没有监听器时没有开销。

滚动视图的八个事件（`scroll`、`dragbegin` 等，见[滚动事件](ui-scroll-view.md#滚动事件)）和所有视图都有的 `traitchange` 在多行输入上照常可用。这些事件可以和多行输入自己的四个事件同时监听，互不影响（实测）。

监听别的名字不会报错：它被当成自定义事件，只有自己用 `dispatchEvent()` 派发时才会触发。

#### `selectionchange`

多行输入的选区或者光标的位置变了时派发。

| 什么引起的 | 派发吗 |
| --- | --- |
| 用户点了一下把光标移到别处、拖动选区、双击选中一个词 | 派发。**未在模拟器验证** |
| 用户打字、删除（光标跟着动了） | 派发。**未在模拟器验证** |
| 代码调 `insertText()`（光标移到插入的内容后面） | 派发（实测） |
| 代码写 `selectedRange` | 派发，没有在输入时也一样（实测） |
| 代码写 `text`（写完光标在末尾） | **未在模拟器验证**，不要依赖它派发或者不派发 |

```js
input.addEventListener('selectionchange', (event) => {
  console.log(event.type, event.target === input, String(input.selectedRange));
});
input.selectedRange = new NSRange(2, 3);
```

**效果**：输出 `selectionchange true NSRange(2, 3)`。

- 事件对象不带选区，读 `input.selectedRange`。回调稍后执行，读到的是执行那一刻的选区，不是事件发生那一刻的。
- 选区连着变了几次时，回调可能执行几次，每次读到的都是最新的选区。
- 不能取消，`event.cancelable` 是 `false`。
- 没有监听器时没有开销。

## 与 iOS 原生写法的对照

如果你在看 Apple 的文档或 iOS 的示例代码，按这张表换成 JS 的写法。

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

枚举的换算规则：去掉类型前缀，首字母小写。见[枚举](enums.md)。

`UITextViewDelegate` 的方法和通知，与 JS 的对应：

| ObjC | JS |
| --- | --- |
| `textViewDidBeginEditing:`、`UITextViewTextDidBeginEditingNotification` | `focus` 事件 |
| `textViewDidChange:`、`UITextViewTextDidChangeNotification` | `input` 事件 |
| `textViewDidEndEditing:`、`UITextViewTextDidEndEditingNotification` | `blur` 事件 |
| `textViewDidChangeSelection:` | `selectionchange` 事件 |
| `textView:shouldChangeTextInRange:replacementText:` | 未实现 |
| `textViewShouldBeginEditing:`、`textViewShouldEndEditing:` | 未实现 |

## 与浏览器 `<textarea>` 的对照

这张表只用来查对应关系，给熟悉 HTML 表单的人用。

| 浏览器 | Nacre | 差别 |
| --- | --- | --- |
| `textarea.value` | `input.text` | — |
| `input` 事件 | `input` 事件 | 事件对象不带内容，要读 `input.text` |
| `focus` / `blur` 事件 | `focus` / `blur` 事件 | — |
| `selectionStart`、`selectionEnd` | `selectedRange` | 是起点加长度，不是起点加终点 |
| `setRangeText()` | `insertText()` | 只能换掉当前选中的部分 |
| `readonly` | `isEditable = false` | — |
| `placeholder` | 没有 | 叠一个标签，见[显示占位文字](#显示占位文字) |
| `maxlength` | 没有 | 在 `input` 的回调里截断 |
| `rows` | 没有 | 高度由约束决定，或者关掉滚动让它跟着内容走 |
| `selectionchange` 事件 | `selectionchange` 事件 | 派发在这块多行输入上，不在 `document` 上。事件对象不带选区，要读 `input.selectedRange` |

## 还不能做的

这一页没写到的成员，先查[补上的成员](view-additions.md#uitextview)：那一页只列名字和类型，还没有写效果，用法照 Apple 的文档。

| 想做的事 | 对应的原生能力 | 状态 |
| --- | --- | --- |
| 在字符显示之前拦截：限制长度、过滤字符 | `textView:shouldChangeTextInRange:replacementText:` | 未实现。单行输入框上对应的是 [`beforeinput`](ui-text-field.md) 事件，多行的还没有接。现在只能[事后改回去](#限制输入的长度) |
| 阻止开始输入、结束输入 | `textViewShouldBeginEditing:`、`textViewShouldEndEditing:` | 未实现，同上 |
| 设置之后输入的文字的样式；链接的样式 | `typingAttributes`、`linkTextAttributes` | 未实现 |
| 占位文字 | 无。`UITextView` 本身没有这项能力 | 叠一个标签，见[显示占位文字](#显示占位文字) |
| 把系统键盘换成自己的视图 | `inputView` | 未实现 |
| 把网址、电话号码自动变成可以点的链接 | `dataDetectorTypes` | 未实现 |
| 同时选中不相连的几段 | `selectedRanges` | 未实现 |
| 系统样式的边框 | `borderStyle`。iOS 上它只有 `none` 一个取值 | 没有暴露。用底色、圆角，或者[图层](ca-layer.md)的 `borderWidth` 和 `borderColor` |
| 自定义长按出来的菜单 | `editMenuForTextInRange:` 等 | 未实现 |
| 系统的查找和替换 | `findInteraction` | 未实现。开关 `isFindInteractionEnabled` 和写作工具的 `writingToolsBehavior` 在[补上的成员](view-additions.md#uitextview)里 |
| 自己建文字排版的区域，分栏排版 | `NSTextContainer` 的初始化方法、`NSLayoutManager` | 未实现 |

## 参见

- [输入框和键盘](ui-text-field.md)：单行输入、first responder、键盘避让、键盘属性的全部取值
- [`UIScrollView`](ui-scroll-view.md)：多行输入的父类，滚动的属性和事件
- [`UIView`](ui-view.md)：位置、底色、`endEditing()`、`keyboardLayoutGuide`
- [结构体](structs.md)：`NSRange` 遵循的规矩，`UIEdgeInsets`
- [Auto Layout](auto-layout.md)：约束的写法
- [`UILabel`](ui-label.md)：占位文字用到的标签；只显示、不需要选中的多行文字用它
- [`UIFont`](ui-font.md)、[颜色](ui-color.md)：`font` 和 `textColor` 的取值
- [富文本](ns-attributed-string.md)：文字里混用多种字体和颜色，用 `attributedText`
- [枚举](enums.md)：字符串取值的规则
- [单位](units.md)
- [实现原理：多行输入](../internals/text-view.md)
