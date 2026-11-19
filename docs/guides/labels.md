# 显示文字

这一篇讲怎么用 [`UILabel`](../api/ui-label.md) 显示文字：标题、多行说明、放不下时截断或缩小、量出文字需要多大、阴影。每个属性的细节在 [`UILabel`](../api/ui-label.md) 的参考页。字体和颜色的写法分别见[设置字体](fonts.md)和[设置颜色](colors.md)，一段里混用几种样式见[显示带样式的文字](attributed-text.md)。

## 推荐的做法

- **用约束定位标签，不约束高度。** 标签按文字、字体和行数算出自己需要多大。只约束位置，文字变长、字号变大、换了语言，标签的大小都自动调整。用 `frame` 定位时要自己量、自己写宽高，文字变了还要重新量。
- **多行文字：左右两边用约束确定宽度，[`numberOfLines`](../api/ui-label/numberoflines.md) 设成 `0`，不约束高度。** 标签的宽度由约束确定，高度随文字的行数增长。
- **文字放不下时按内容选处理方式：**

  | 处理方式 | 写法 | 适合 |
  | --- | --- | --- |
  | 截断 | 默认行为 | 标题、名字。只占一行，放不下的内容可以不显示 |
  | 换行 | `numberOfLines = 0`，或者一个大于 1 的数 | 正文、说明。内容要完整显示 |
  | 缩小字号 | `adjustsFontSizeToFitWidth = true` | 金额、数字。只占一行，并且内容必须完整显示 |

  内容需要完整显示的用换行；只是标识性的内容用截断；缩小字号只用在很短的单行文字上，因为缩小之后同一个页面上的字号不再一致。

## 第一个标签

从空白 App 开始，在屏幕上方放一行标题，标题下面放一段最多显示两行的说明文字。

```js
application.addEventListener('sceneconnect', (e) => {
  // 建窗口和页面。每个 App 都要有这几行
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 1. 创建标题，设文字
  const title = new UILabel();
  title.text = 'Hello, Nacre';

  // 2. 设字体、颜色、对齐
  title.font = UIFont.systemFontOfSize(34, { weight: 'bold' });   // 34 pt，粗体
  title.textColor = 'label';
  title.textAlignment = 'center';

  // 3. 创建说明文字，最多显示两行
  const body = new UILabel();
  body.text = '这是一段刻意写得很长的说明文字，用来演示多行排版、行数限制和' +
              '尾部截断。两行放不下的部分不显示，第二行的末尾是省略号。';
  body.font = UIFont.systemFontOfSize(15);
  body.textColor = 'secondaryLabel';
  body.numberOfLines = 2;

  // 4. 放到页面上。只约束位置和左右边距，不约束高度
  title.translatesAutoresizingMaskIntoConstraints = false;
  body.translatesAutoresizingMaskIntoConstraints = false;
  page.view.addSubview(title);
  page.view.addSubview(body);

  const safe = page.view.safeAreaLayoutGuide;
  NSLayoutConstraint.activateConstraints([
    title.topAnchor.constraintEqualToAnchor(safe.topAnchor, { constant: 16 }),
    title.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor, { constant: 24 }),
    title.trailingAnchor.constraintEqualToAnchor(safe.trailingAnchor, { constant: -24 }),

    body.topAnchor.constraintEqualToAnchor(title.bottomAnchor, { constant: 12 }),
    body.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor, { constant: 24 }),
    body.trailingAnchor.constraintEqualToAnchor(safe.trailingAnchor, { constant: -24 }),
  ]);
});
```

**效果**

- 屏幕上方、状态栏下面 16 pt 的位置，出现一行粗体的大字「Hello, Nacre」，水平居中。
- 标题下面 12 pt 的位置是一段灰色的小字，左右各离屏幕边缘 24 pt。
- 说明文字排成两行。第二行的末尾是「…」，后面的文字不显示。
- 两个标签的高度都没有写。标题的高度等于一行文字的高度，说明文字的高度等于两行文字的高度。
- 深色模式下，文字颜色自动换成浅色。

这段代码没有作为一个整体在模拟器运行过。其中用到的每个 API 都在验收用例里运行过。

四步分别是：创建并设文字、设外观、设行数、放到页面上。`safe` 是安全区的 layout guide，表示屏幕上不被刘海、状态栏和底部横条遮挡的那块区域，见 [`UIView`](../api/ui-view.md)。约束的写法见 [Auto Layout](../api/auto-layout.md)。

下面的例子都沿用这里的 `title`、`body`、`page` 和 `safe`。单独试某一节时，先写这几行：

```js
const page = new UIViewController();
const title = new UILabel();
const body = new UILabel();
page.view.addSubview(title);
page.view.addSubview(body);
const safe = page.view.safeAreaLayoutGuide;
```

## 改文字

```js
title.text = '新的标题';
```

**效果**：标签显示的文字立刻换成「新的标题」。用约束定位时，标签的大小跟着新文字重新计算，不需要手动刷新布局。大小自动变化这一点**未在模拟器验证**。

写 `null` 清空文字：

```js
title.text = null;
```

**效果**：标签不显示任何文字。**未在模拟器验证。**

`text` 接受任何值，不是字符串的值按 `String()` 转成字符串：`title.text = 5` 显示「5」。

> **注意**：标签显示过富文本（写过 [`attributedText`](../api/ui-label/attributedtext.md)）之后再写 `text`，文字换成新的，但原来富文本里的样式会留着。这种标签要改内容就继续写 `attributedText`。

## 改字体、字号和粗细

字体是一个 [`UIFont`](../api/ui-font.md) 对象，字号和粗细都在创建它时确定。`UIFont` 不能修改，要换字号或粗细，创建一个新的再赋值。

```js
title.font = UIFont.systemFontOfSize(20, { weight: 'semibold' });
```

**效果**：文字变成 20 pt、半粗体的系统字体。

等宽字体：

```js
title.font = UIFont.monospacedSystemFontOfSize(20, { weight: 'medium' });
```

**效果**：每个字符占相同的宽度，适合显示数字和代码。

其他字体的写法见[设置字体](fonts.md)。

## 改颜色

```js
title.textColor = '#FF3B30';
```

**效果**：文字变成红色。

颜色写成字符串。可以用 `'#RRGGBB'`，也可以用 `'systemRed'`、`'label'` 这类系统颜色名。系统颜色名会随深色模式自动变化。读出来的也是字符串：

```js
title.textColor = '#336699';
console.log(title.textColor);
```

**效果**：控制台输出 `#336699`。

颜色写错时不抛异常，只在控制台输出一条警告，文字保持原来的颜色。全部写法见[设置颜色](colors.md)。

## 对齐

```js
title.textAlignment = 'center';
```

**效果**：文字在标签的宽度内水平居中。

对齐是在标签自己的宽度内进行的。标签的宽度刚好等于文字宽度时，几种对齐看起来没有差别。上面的例子里标题的左右两边都有约束，标签比文字宽，居中才看得出来。取值见 [`textAlignment`](../api/ui-label/textalignment.md)。

## 显示多行文字

这是多行文字的推荐写法：左右两边用约束确定宽度，行数设成不限，不约束高度。

```js
const para = new UILabel();
para.text = '一段比较长的文字，一行放不下。标签的宽度由左右两条约束确定，' +
            '文字在这个宽度内换行，标签的高度等于全部行的总高度。';
para.numberOfLines = 0;
para.translatesAutoresizingMaskIntoConstraints = false;
page.view.addSubview(para);

NSLayoutConstraint.activateConstraints([
  para.topAnchor.constraintEqualToAnchor(body.bottomAnchor, { constant: 12 }),
  para.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor, { constant: 24 }),
  para.trailingAnchor.constraintEqualToAnchor(safe.trailingAnchor, { constant: -24 }),
]);
```

**效果**：说明文字下面 12 pt 的位置出现这段文字，左右各离屏幕边缘 24 pt。文字全部显示，需要几行就排几行。标签的高度随行数增长。**这段代码未在模拟器验证。**

`numberOfLines` 是最多显示几行，默认是 `1`。`0` 的含义是「不限」，不是「零行」。

## 文字只显示一行的原因

一段很长的文字只显示出一行，通常是以下原因之一：

| 原因 | 处理 |
| --- | --- |
| 没有改 `numberOfLines`。它是 `1` 时文字不换行 | 设成 `0` 或大于 1 的数 |
| 没有确定宽度。标签的宽度没有被约束确定时，固有尺寸按「全部文字排成一行」计算（**未在模拟器验证**），文字不会换行 | 约束左右两边，或者设 [`preferredMaxLayoutWidth`](../api/ui-label/preferredmaxlayoutwidth.md) |
| 约束了高度。高度被约束之后，放不下的行不显示 | 去掉高度约束 |

## 限制最多显示几行

```js
body.numberOfLines = 3;
```

**效果**：文字在标签的宽度内自动换行，最多显示 3 行。3 行放不下时，第 3 行的末尾显示「…」。文字不足 3 行时，有几行显示几行。

## 放不下时换一种截断方式

[`lineBreakMode`](../api/ui-label/linebreakmode.md) 决定放不下的文字怎么处理。默认在末尾显示省略号。

```js
body.numberOfLines = 1;
body.lineBreakMode = 'byTruncatingMiddle';
```

**效果**：文字只显示一行。开头和结尾保留，中间的部分换成「…」。适合显示文件名、地址这类两端都有信息的内容。**未在模拟器验证。**

不要省略号，直接截掉：

```js
body.lineBreakMode = 'byClipping';
```

**效果**：放不下的部分不显示，没有省略号。**未在模拟器验证。**

## 文字太长时自动缩小

单行文字放不下时，可以让标签缩小字号，而不是截断。

```js
title.numberOfLines = 1;
title.adjustsFontSizeToFitWidth = true;
title.minimumScaleFactor = 0.5;
```

**效果**：文字放得下时按原字号显示。放不下时字号自动缩小，直到整行放得下，最小缩到原字号的一半。缩到一半仍然放不下，再按 `lineBreakMode` 截断。**未在模拟器验证。**

`title.font` 读出来的仍然是原来的字体，不反映缩小后的字号。**未在模拟器验证。**

把 [`minimumScaleFactor`](../api/ui-label/minimumscalefactor.md) 明确设成一个大于 0 的值，给缩小设一个下限。

## 量出文字需要多大

标签可以算出自己显示全部文字需要多大。结果是同步返回的，不是回调，也不是 Promise。

```js
const heading = new UILabel();
heading.text = 'Hello, Nacre';
heading.font = UIFont.systemFontOfSize(34, { weight: 'bold' });

const size = heading.intrinsicContentSize;
console.log(size.width, size.height);
```

**效果**：控制台输出文字的宽和高，单位是 [pt](../api/units.md)。这段文字和字体实测是宽 188.33、高 40.67。

`intrinsicContentSize` 是固有尺寸：不限制宽度时，文字需要多大。要问「宽度最多这么多时需要多大」，用 `sizeThatFits()`：

```js
const need = body.sizeThatFits(new CGSize(300, 9999));
console.log(need.width, need.height);
```

**效果**：控制台输出 `body` 在宽度不超过 300 pt 时需要的宽和高。结果受 `numberOfLines` 限制。

这两个成员都不改变标签。标签不需要先加到页面上，新建之后就可以量。

## 用 `frame` 定位时让标签刚好容纳文字

不用约束、直接写 `frame` 时，标签不会自己变大。新建的标签宽高是 0，屏幕上看不到文字。先量，再写 `frame`：

```js
const note = new UILabel();
note.text = '共 3 条';

const fit = note.intrinsicContentSize;
note.frame = new CGRect(24, 300, fit.width, fit.height);
page.view.addSubview(note);
```

**效果**：距屏幕左边 24 pt、距顶部 300 pt 的位置出现「共 3 条」，标签的大小刚好等于文字的大小。

`note.sizeToFit()` 一步完成「量出大小并改成这个大小」，位置不变。

之后改了 `text` 或 `font`，标签的大小不会跟着变，要重新量一次再写 `frame`。

## 多行文字用 `frame` 定位时算高度

多行文字的高度取决于宽度：同一段文字，宽度大时行数少，宽度小时行数多。所以要先确定宽度，再问高度。

```js
const width = page.view.bounds.width - 48;   // 左右各留 24 pt

const block = new UILabel();
block.text = '一段比较长的文字，一行放不下，需要按给定的宽度换行之后才知道有多高。';
block.numberOfLines = 0;

const blockSize = block.sizeThatFits(new CGSize(width, 9999));
block.frame = new CGRect(24, 340, width, blockSize.height);
page.view.addSubview(block);
```

**效果**：文字在 `width` 的宽度内换行，全部显示。标签的高度刚好等于这些行的总高度。

`sizeThatFits()` 的高度给一个很大的数，表示高度不设上限。

## 多行文字配合约束时指定换行宽度

只约束了位置、没有约束宽度的多行标签，用 [`preferredMaxLayoutWidth`](../api/ui-label/preferredmaxlayoutwidth.md) 告诉它按多宽换行。

```js
body.numberOfLines = 0;
body.preferredMaxLayoutWidth = 320;
console.log(body.intrinsicContentSize.height);
```

**效果**：控制台输出文字按 320 pt 的宽度换行后的总高度。**未在模拟器验证。**

标签的宽度已经被约束确定时，一般不需要设这个属性，系统按约束得到的宽度换行。

## 加文字阴影

```js
title.shadowColor = 'rgba(0,0,0,.25)';
title.shadowOffset = new CGSize(0, 2);
```

**效果**：每个字的正下方 2 pt 处多出一份同样形状的、半透明黑色的文字。阴影的边缘是清晰的，没有模糊。**未在模拟器验证。**

文字阴影没有模糊半径。要边缘模糊的阴影，用图层的阴影属性，见[用图层画圆角、阴影、渐变和形状](layers.md)。

## 让文字显示成不可用的样子

```js
title.isEnabled = false;
```

**效果**：文字变淡，表示这项内容当前不可用。设回 `true` 恢复。**未在模拟器验证。**

## 临时换一种文字颜色

[`highlightedTextColor`](../api/ui-label/highlightedtextcolor.md) 是标签处于高亮状态时的文字颜色。高亮状态由 `isHighlighted` 控制，系统不会自动切换它。

```js
title.highlightedTextColor = 'systemYellow';
title.isHighlighted = true;
```

**效果**：文字变成黄色。把 `isHighlighted` 设回 `false`，文字恢复成 `textColor` 的颜色。**未在模拟器验证。**

## 跟随系统文字大小

标签的字号由 `font` 决定，`font` 不变字号就不变。用户在系统设置里调大文字后，标签不会自动变。要跟随，用 [`UIFont`](../api/ui-font.md) 的文本样式取字体，并在系统设置变化时重新赋值，写法见[设置字体](fonts.md)。

## 深色模式下的文字颜色

默认的文字颜色是语义色 `label`，浅色模式下是黑色，深色模式下是白色，自动切换。自己设颜色时用语义色或 `light-dark()`，同样自动切换，见[设置颜色](colors.md)。

## 让标签响应点按

标签的 `isUserInteractionEnabled` 默认是 `false`，触摸会落到它后面的视图上。要响应点按，把它设成 `true` 再加一个手势识别器，见[手势识别器](../api/ui-gesture-recognizer.md)。需要按下时有反馈的，用 [`UIButton`](../api/ui-button.md)。

## 让文字垂直靠上

标签比文字高时，文字在标签内垂直居中，没有垂直对齐的属性（**未在模拟器验证**）。不约束高度时标签的高度等于文字的高度，不存在这个问题。

## 参见

- [`UILabel`](../api/ui-label.md)：全部属性
- [`UIFont`](../api/ui-font.md)、[设置字体](fonts.md)
- [`UIColor`](../api/ui-color.md)、[设置颜色](colors.md)
- [显示带样式的文字](attributed-text.md)：一段文字里混用多种字体、颜色、下划线
- [Auto Layout](../api/auto-layout.md)：用约束定位
