# 做一个多行输入框

这一篇讲怎么用 [`UITextView`](../api/ui-text-view.md) 做多行输入：读写内容、显示占位文字、跟着内容长高、只读展示、收起键盘、避开键盘。每个属性、方法和事件的细节在 [`UITextView`](../api/ui-text-view.md) 的参考页。单行输入见[做一个输入框](text-fields.md)。

## 推荐的做法

- **一定要设 `font`。** 新建的多行输入没有设字体，文字比系统标准的 17 pt 正文小（实测：一行字时它想要的高度是 30 pt，设成 17 pt 的字之后是 36 pt）。
- **给它底色和圆角。** 新建的多行输入底色是页面的底色，没有边框，放到页面上看不出哪里可以点。
- **设 `keyboardDismissMode = 'onDrag'`，或者提供一个收键盘的按钮（放在 [`inputAccessoryView`](#在键盘上方放一个完成按钮) 里）。** 否则键盘弹出之后没有办法收起。
- **靠近屏幕底部时，把它所在的容器的底边约束到 `keyboardLayoutGuide.topAnchor`。** 见[让它不被键盘挡住](#让它不被键盘挡住)。
- **内容变化用 `input` 监听，结束输入时用 `blur` 保存。**

## 第一个多行输入框

从空白 App 开始，在屏幕上方放一块多行输入，下面一行字显示内容的长度。

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

下面各节沿用 `input` 和 `page` 这两个变量。单独试某一节时，先写这几行：

```js
const page = new UIViewController();
const input = new UITextView();
page.view.addSubview(input);
```

## 键盘怎么收起

键盘跟着焦点走：多行输入成为 first responder 时键盘弹出，它不再是 first responder 时键盘收起，见[焦点](../api/ui-text-field.md#焦点)。

多行输入里回车是换行，所以不能像单行输入框那样靠回车收键盘。有三种办法：

| 办法 | 写法 |
| --- | --- |
| 用户往下拖动文字时收起 | `input.keyboardDismissMode = 'onDrag'` |
| 在键盘上方放一个「完成」按钮 | 把带按钮的工具条写给 `input.inputAccessoryView`，按钮的回调里调 `input.resignFirstResponder()`，见[在键盘上方放一个「完成」按钮](#在键盘上方放一个完成按钮) |
| 点空白处收起 | 给页面加点按手势，回调里调 `page.view.endEditing(true)`，见[点空白处收起键盘](text-fields.md#点空白处收起键盘) |

三种办法的实际效果**未在模拟器验证**。验收用例验证的是：`keyboardDismissMode` 和 `inputAccessoryView` 能写入并读回；用代码调 `resignFirstResponder()` 之后它不再是 first responder，并派发 `blur`。

## 读出和写入内容

```js
console.log(input.text.length);
input.text = '第一行\n第二行';
console.log(input.hasText);
```

**效果**：第一行输出当前内容的长度。没有内容时 `text` 是空字符串 `''`，不是 `null`。第二行把内容换成两行字，换行就是字符串里的 `\n`。第三行输出 `true`。

写 `text` 之后光标在内容的末尾（实测）。写 `null` 或 `undefined` 得到空字符串。写 `text` 不派发 `input`。

## 限制输入的长度

```js
const LIMIT = 200;
input.addEventListener('input', () => {
  if (input.text.length > LIMIT) {
    input.text = input.text.slice(0, LIMIT);
  }
});
```

**效果**：内容超过 200 个 UTF-16 码元时，多出来的部分被去掉。写 `text` 不派发 `input`，所以回调不会因此再执行一次。截断之后光标在末尾。

在字符显示之前拦住它，目前做不到，见[还不能做的](../api/ui-text-view.md#还不能做的)。用户会先看到多出来的字，随后它消失；这一点**未在模拟器验证**。

## 显示占位文字

多行输入没有 `placeholder` 属性。做法是在它上面叠一个[标签](../api/ui-label.md)，没有内容时显示，有内容时隐藏。

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

## 做一个跟着内容长高的输入框

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

## 只读地展示一段长文字

```js
input.isEditable = false;
input.text = '很长的一段说明文字……';
```

**效果**：用户点它不会弹出键盘，不能修改内容，但仍然可以长按选中文字并拷贝，内容超过高度时可以滚动。**未在模拟器验证。**

连选中也不允许时，再加一句 `input.isSelectable = false`。

`isEditable` 只限制用户。代码写 `text`、调 `insertText()` 和 `deleteBackward()` 照样改得动（实测）。

## 读写光标的位置和选中的范围

```js
const range = input.selectedRange;
console.log(range.location, range.length);

input.selectedRange = new NSRange(0, 0);                  // 光标放到开头
input.selectedRange = new NSRange(0, input.text.length);  // 全选
const selected = input.text.slice(range.location, range.location + range.length);
```

**效果**：`selectedRange` 是一个 [`NSRange`](../api/ns-range.md)：`location` 是起点，`length` 是选中了多少。`length` 是 0 表示没有选中文字，只有一个光标，位置是 `location`。最后一行取出选中的那段文字。

选中的范围在屏幕上显示成什么样**未在模拟器验证**。

多行输入没有在输入时也能读写选区，这几行不需要先聚焦。

## 光标动了的时候得到通知

```js
input.addEventListener('selectionchange', () => {
  const range = input.selectedRange;
  console.log('光标在 ' + range.location + '，选中了 ' + range.length + ' 个码元');
});

input.selectedRange = new NSRange(0, 3);
```

**效果**：最后一行执行之后，控制台输出 `光标在 0，选中了 3 个码元`（实测代码写 `selectedRange` 会派发）。用户移动光标、拖动选区、打字时同样各输出一行，这一部分**未在模拟器验证**。

事件对象不带选区，在回调里读 `input.selectedRange`。回调是稍后执行的，读到的是回调执行那一刻的选区。

## 在光标处插入文字

```js
input.insertText('😀');
```

**效果**：在光标的位置插入一个表情，光标移到它后面。有选中的文字时，选中的部分被换成这个表情。派发一次 `input`（实测）。

## 滚到某一段文字

```js
input.scrollRangeToVisible(new NSRange(input.text.length, 0));
```

**效果**：滚动到内容的末尾。实测一块 200 × 60 pt、内容 40 行的多行输入，调用之后 `contentOffset.y` 从 0 变成 788。

## 文字离四边多远

```js
input.textContainerInset = new UIEdgeInsets(12, 12, 12, 12);
input.textContainer.lineFragmentPadding = 0;
```

**效果**：文字离四边各 12 pt。

文字到左右两边的距离由两个值相加得到：`textContainerInset` 的左、右，加上 `textContainer.lineFragmentPadding`。默认值是 0 加 5，所以新建的多行输入文字离左边 5 pt。把 `lineFragmentPadding` 设成 0 之后，左右的距离就只由 `textContainerInset` 决定。

## 最多显示几行

```js
input.isScrollEnabled = false;
input.isEditable = false;
input.textContainer.maximumNumberOfLines = 3;
input.textContainer.lineBreakMode = 'byTruncatingTail';
```

**效果**：只排出前三行，第三行排不下时以省略号结尾（**省略号未在模拟器验证**）。`text` 里的内容不变，只是多出来的不显示。实测六行 17 pt 的字，不限行数时它想要的高度是 138 pt，限成两行之后是 57 pt。

## 让它不被键盘挡住

键盘盖在页面上面，页面的大小和位置不变。靠近屏幕底部的多行输入会被键盘盖住。把它（或者它所在的容器）的底边约束到页面的 `keyboardLayoutGuide` 的顶边：

```js
input.bottomAnchor
  .constraintEqualToAnchor(page.view.keyboardLayoutGuide.topAnchor, { constant: -16 })
  .isActive = true;
```

**效果**：键盘收起时，它的底边在安全区底边上方 16 pt。键盘弹出时，它的底边在键盘顶边上方 16 pt。**未在模拟器验证。**

`keyboardLayoutGuide` 的说明见[输入框和键盘](text-fields.md#键盘避让一条约束)。

## 在键盘上方放一个「完成」按钮

`inputAccessoryView` 是键盘弹出时贴在键盘上面的一个视图，跟着键盘一起出现和消失。多行输入里回车是换行，收键盘的按钮通常放在这里。

```js
const bar = new UIToolbar();
const done = UIBarButtonItem.systemItem('done');
done.addEventListener('click', () => input.resignFirstResponder());
bar.items = [UIBarButtonItem.flexibleSpace(), done];
bar.sizeToFit();
input.inputAccessoryView = bar;
```

**效果**：点多行输入弹出键盘，键盘上面多一条[工具条](../api/ui-toolbar.md)，右端是「完成」。点它，键盘收起，工具条跟着消失。**这个例子未在模拟器验证**；验收用例里有「聚焦之后这个视图出现在屏幕上」的断言，它们写完之后还没有运行过。

`bar.sizeToFit()` 让工具条量出自己的高度。新建的工具条高度是 0，不调这一句它不占位置。

这个属性和[单行输入框](text-fields.md#在键盘上方放一排按钮)上的同名属性相同：可以是任何视图，同一个视图可以给几个输入框，正在输入时换当场生效。

## 用代码聚焦和失焦

```js
const ok = input.becomeFirstResponder();
// ……
input.resignFirstResponder();
```

**效果**：第一行让它聚焦，键盘弹出，随后派发 `focus`。`ok` 是 `false` 表示系统拒绝了，什么都没有发生，什么时候会被拒绝见[输入框和键盘](../api/ui-text-field.md#焦点)。最后一行让它失焦，键盘收起，随后派发 `blur`。

`isEditable` 是 `false` 时，`becomeFirstResponder()` 仍然返回 `true`，但不派发 `focus`，失焦时也不派发 `blur`（实测，量的时候没有键盘）。

## 参见

- [`UITextView`](../api/ui-text-view.md)：全部属性、方法和事件
- [`NSRange`](../api/ns-range.md)、[`NSTextContainer`](../api/ns-text-container.md)
- [做一个输入框](text-fields.md)：单行输入、焦点、避开键盘
- [`UILabel`](../api/ui-label.md)：占位文字用到的标签
