---
type: reference
native: UILabel
status: partial
---

# `UILabel`

**`UILabel`** 表示屏幕上一段只读的文字，称为标签。标题、说明、列表里每一行的文字都由标签显示。用户能看到标签上的文字，不能编辑、选中或复制它。

一个标签显示一段文字。整段文字用同一种字体、同一种颜色，不能让其中几个字加粗或换颜色。文字里可以同时有中文和英文，验收用的界面里标签显示的就是中英文混排的文字。表情符号能否正常显示**未在模拟器验证**。

标签的文字由 `text` 属性给出。改了 `text`、`font` 或其他属性之后，屏幕上的文字自动更新，不需要调用任何刷新方法。

## 文字放不下时

**标签默认只显示一行。** 文字比标签宽时不换行，放不下的部分在末尾换成省略号「…」。一段很长的文字只显示出一行，原因就是这个默认值。

文字放不下时有三种处理方式，由不同的属性控制：

| 处理方式 | 写法 | 适合 |
| --- | --- | --- |
| 截断 | 默认行为。省略号的位置由 `lineBreakMode` 决定 | 标题、名字。只占一行，放不下的内容可以不显示 |
| 换行 | `numberOfLines = 0`（不限行数），或者一个大于 1 的数（最多这么多行） | 正文、说明。内容要完整显示 |
| 缩小字号 | `adjustsFontSizeToFitWidth = true` | 金额、数字。只占一行，并且内容必须完整显示 |

推荐的选择：内容需要完整显示的用换行；只是标识性的内容用截断；缩小字号只用在很短的单行文字上，因为缩小之后同一个页面上的字号不再一致。

三种方式可以组合：先换行，行数用完之后截断；先缩小，缩到下限之后截断。规则见[行数、换行和截断](#行数换行和截断)。

## 标签的大小

标签按自己的文字、字体和行数算出需要多大，这个大小叫固有尺寸。要不要给标签写宽高，取决于用哪种方式定位：

| 定位方式 | 要不要写宽高 | 文字变了之后 |
| --- | --- | --- |
| [Auto Layout](auto-layout.md) 约束 | 不要。只约束位置，系统按固有尺寸决定大小 | 大小自动跟着变 |
| 直接写 `frame` | 要。新建的标签宽高是 0，不写就看不到文字 | 大小不变，要自己重新量、重新写 |

**推荐用约束定位标签**，并且不约束高度。这样文字变长、字号变大、换了语言，标签的大小都自动调整。

多行文字的标准写法是：用约束确定标签的左右两边，把 `numberOfLines` 设成 `0`，不约束高度。标签的宽度由约束确定，高度随文字的行数增长。代码见[显示多行文字](#显示多行文字)。

「标签的大小随文字自动调整」来自 iOS 的定义，验收用例没有专门的断言，**未在模拟器验证**。固有尺寸本身的数值是实测的，见[量出文字需要多大](#量出文字需要多大)。

## 其他会想到的问题

- **用户调大系统字号后，文字会跟着变吗？** 不会自动变。标签的字号由 `font` 决定，`font` 不变字号就不变。要跟随，用 [`UIFont`](ui-font.md) 的文本样式取字体，并在系统设置变化时重新赋值，写法见 [`UIFont`](ui-font.md)。
- **深色模式下要不要换文字颜色？** 默认的文字颜色是语义色 `label`，浅色模式下是黑色，深色模式下是白色，自动切换。自己设颜色时用语义色或 `light-dark()`，同样自动切换，见[颜色](ui-color.md)。
- **标签能响应点按吗？** 默认不能。标签的 `isUserInteractionEnabled` 默认是 `false`，触摸会落到它后面的视图上。要响应点按，把它设成 `true` 再加一个手势识别器，见[手势识别器](ui-gesture-recognizer.md)。需要按下时有反馈的，用 [`UIButton`](ui-button.md)。
- **文字能垂直靠上吗？** 标签比文字高时，文字在标签内垂直居中，没有垂直对齐的属性（**未在模拟器验证**）。不约束高度时标签的高度等于文字的高度，不存在这个问题。

## 完整例子

下面的代码从空白 App 开始，在屏幕上方放一行标题，标题下面放一段最多显示两行的说明文字。

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

四步分别是：创建并设文字、设外观、设行数、放到页面上。第 4 步里的 `safe` 是安全区的 layout guide，表示屏幕上不被刘海、状态栏和底部横条遮挡的那块区域，见 [`UIView`](ui-view.md)。约束的写法见 [Auto Layout](auto-layout.md)。

## 常见用法

以下例子都沿用上面的 `title`、`body`、`page` 和 `safe`。

### 改文字

```js
title.text = '新的标题';
```

**效果**：标签显示的文字立刻换成「新的标题」。用约束定位时，标签的大小跟着新文字重新计算，不需要手动刷新布局。大小自动变化这一点**未在模拟器验证**。

写 `null` 清空文字：

```js
title.text = null;
```

**效果**：标签不显示任何文字。**未在模拟器验证。**

`text` 接受任何值，不是字符串的值按 `String()` 转成字符串：`title.text = 5` 显示「5」。`null` 和 `undefined` 表示没有文字。

### 改字体、字号和粗细

字体是一个 [`UIFont`](ui-font.md) 对象，字号和粗细都在创建它时确定。

```js
title.font = UIFont.systemFontOfSize(20, { weight: 'semibold' });
```

**效果**：文字变成 20 pt、半粗体的系统字体。

`UIFont` 不能修改。要换字号或粗细，创建一个新的 `UIFont` 再赋值。

等宽字体：

```js
title.font = UIFont.monospacedSystemFontOfSize(20, { weight: 'medium' });
```

**效果**：每个字符占相同的宽度，适合显示数字和代码。

其他字体的写法见 [`UIFont`](ui-font.md)。

### 改颜色

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

颜色写错时不抛异常，只在控制台输出一条警告，文字保持原来的颜色。全部写法和规则见[颜色](ui-color.md)。

### 对齐

```js
title.textAlignment = 'center';
```

**效果**：文字在标签的宽度内水平居中。

对齐是在标签自己的宽度内进行的。标签的宽度刚好等于文字宽度时，三种对齐看起来没有差别。完整例子里标题的左右两边都有约束，标签比文字宽，居中才看得出来。

取值见 [`textAlignment` 的取值](#textalignment-的取值)。

### 显示多行文字

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

三处容易漏掉：

- 没有改 `numberOfLines`。它是 `1` 时文字不换行。
- 没有确定宽度。标签的宽度没有被约束确定时，固有尺寸按「全部文字排成一行」计算（**未在模拟器验证**），文字不会换行。
- 约束了高度。高度被约束之后，放不下的行不显示。

### 限制最多显示几行

```js
body.numberOfLines = 3;
```

**效果**：文字在标签的宽度内自动换行，最多显示 3 行。3 行放不下时，第 3 行的末尾显示「…」。文字不足 3 行时，有几行显示几行。

### 放不下时怎么截断

`lineBreakMode` 决定放不下的文字怎么处理。默认在末尾显示省略号。

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

全部取值见 [`lineBreakMode` 的取值](#linebreakmode-的取值)。

### 文字太长时自动缩小

单行文字放不下时，可以让标签缩小字号，而不是截断。

```js
title.numberOfLines = 1;
title.adjustsFontSizeToFitWidth = true;
title.minimumScaleFactor = 0.5;
```

**效果**：文字放得下时按原字号显示。放不下时字号自动缩小，直到整行放得下，最小缩到原字号的一半。缩到一半仍然放不下，再按 `lineBreakMode` 截断。**未在模拟器验证。**

`title.font` 读出来的仍然是原来的字体，不反映缩小后的字号。**未在模拟器验证。**

使用时把 `minimumScaleFactor` 明确设成一个大于 0 的值，给缩小设一个下限。

### 量出文字需要多大

标签可以算出自己显示全部文字需要多大。结果是同步返回的，不是回调，也不是 Promise。

```js
const heading = new UILabel();
heading.text = 'Hello, Nacre';
heading.font = UIFont.systemFontOfSize(34, { weight: 'bold' });

const size = heading.intrinsicContentSize;
console.log(size.width, size.height);
```

**效果**：控制台输出文字的宽和高，单位是 [pt](units.md)。这段文字和字体实测是宽 188.33、高 40.67。

`intrinsicContentSize` 是固有尺寸：不限制宽度时，文字需要多大。要问「宽度最多这么多时需要多大」，用 `sizeThatFits()`：

```js
const need = body.sizeThatFits(new CGSize(300, 9999));
console.log(need.width, need.height);
```

**效果**：控制台输出 `body` 在宽度不超过 300 pt 时需要的宽和高。结果受 `numberOfLines` 限制。

行数限制对结果的影响，实测同一段文字、15 pt 系统字体、同一个宽度上限：

| `numberOfLines` | `sizeThatFits()` 的结果 |
| --- | --- |
| `2` | 宽 343，高 36 |
| `0` | 宽 343，高 71.67 |

这两个方法都不改变标签。标签不需要先加到页面上，新建之后就可以量。

### 用 `frame` 定位时让标签刚好容纳文字

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

### 多行文字用 `frame` 定位时算高度

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

### 多行文字配合约束时指定换行宽度

用约束定位时，系统需要标签的固有尺寸来决定标签的高度。多行标签的固有尺寸依赖宽度，`preferredMaxLayoutWidth` 给出计算固有尺寸时使用的换行宽度。

```js
body.numberOfLines = 0;
body.preferredMaxLayoutWidth = 320;
console.log(body.intrinsicContentSize.height);
```

**效果**：控制台输出文字按 320 pt 的宽度换行后的总高度。**未在模拟器验证。**

标签的宽度已经被约束确定时（比如完整例子里左右两边都有约束），一般不需要设这个属性，系统按约束得到的宽度换行。只约束了位置、没有约束宽度的多行标签才需要它。详见[多行文字和宽度](#多行文字和宽度)。

### 加文字阴影

```js
title.shadowColor = 'rgba(0,0,0,.25)';
title.shadowOffset = new CGSize(0, 2);
```

**效果**：每个字的正下方 2 pt 处多出一份同样形状的、半透明黑色的文字。阴影的边缘是清晰的，没有模糊。**未在模拟器验证。**

`shadowOffset` 的 `width` 是向右的偏移，`height` 是向下的偏移，单位是 [pt](units.md)。负数表示向左、向上。

文字阴影没有模糊半径。要边缘模糊的阴影，用图层的阴影属性，见 [`CALayer`](ca-layer.md)。

### 让文字显示成不可用的样子

```js
title.isEnabled = false;
```

**效果**：文字变淡，表示这项内容当前不可用。设回 `true` 恢复。**未在模拟器验证。**

### 临时换一种文字颜色

`highlightedTextColor` 是标签处于高亮状态时的文字颜色。高亮状态由 `isHighlighted` 控制，系统不会自动切换它。

```js
title.highlightedTextColor = 'systemYellow';
title.isHighlighted = true;
```

**效果**：文字变成黄色。把 `isHighlighted` 设回 `false`，文字恢复成 `textColor` 的颜色。**未在模拟器验证。**

## 固有尺寸

固有尺寸是视图按自己的内容算出来的大小。普通的 `UIView` 没有内容，没有固有尺寸。`UILabel` 的内容是文字，它的固有尺寸由四样东西决定：`text`、`font`、`numberOfLines`、`preferredMaxLayoutWidth`。

固有尺寸是一个可以读的值（`intrinsicContentSize`）。它只在用约束定位时自动生效：

| 定位方式 | 标签的大小从哪里来 |
| --- | --- |
| [Auto Layout](auto-layout.md) 约束 | 没有约束宽或高时，系统使用固有尺寸。所以只约束位置就够了 |
| 直接写 `frame` | 完全由 `frame` 决定。固有尺寸不会自动生效，要自己量再写进去 |

约束和固有尺寸冲突时（比如约束出来的宽度比文字窄），约束优先，文字按 `numberOfLines` 和 `lineBreakMode` 换行或截断。

标签多大程度上坚持固有尺寸，由内容优先级决定，见 [`UIView`](ui-view.md)。`UILabel` 的默认值和普通 `UIView` 一样：不愿被拉大的优先级是 250，不愿被压小的优先级是 750（实测）。

## 行数、换行和截断

三样东西共同决定文字怎么排：

| | 作用 |
| --- | --- |
| 标签的宽度 | 一行能放多少字 |
| `numberOfLines` | 最多排几行。`0` 是不限 |
| `lineBreakMode` | 排到最后一行还放不下时，怎么处理剩下的文字 |

规则是：

- `numberOfLines` 是 `1` 时不换行。放不下就按 `lineBreakMode` 处理。
- `numberOfLines` 大于 1 或等于 `0` 时，文字在标签的宽度内自动换行。
- 标签的高度不够显示 `numberOfLines` 行时，只显示放得下的行数，最后一行按 `lineBreakMode` 处理。**未在模拟器验证。**
- 标签的高度比文字高时，文字在标签内垂直居中。`UILabel` 没有垂直对齐的属性。**未在模拟器验证。**
- `adjustsFontSizeToFitWidth` 是 `true` 时，先缩小字号，缩到 `minimumScaleFactor` 的下限仍然放不下，再按 `lineBreakMode` 处理。**未在模拟器验证。**

## 多行文字和宽度

单行文字的大小是确定的。多行文字不是：同一段文字可以排成一行很宽，也可以排成很多行很窄。所以量多行文字时必须给出宽度。给宽度的途径有三个：

| 场景 | 宽度从哪里来 |
| --- | --- |
| 调 `sizeThatFits(size)` | 参数 `size.width` |
| 用约束定位，标签的宽度被约束确定 | 约束算出的宽度 |
| 用约束定位，标签的宽度没有被约束确定 | `preferredMaxLayoutWidth` |

`preferredMaxLayoutWidth` 是 `0`（默认值）并且没有其他途径给出宽度时，固有尺寸按「全部文字排成一行」计算。**未在模拟器验证。**

## 成员说明

### 继承关系

```
EventTarget → NSObject → UIResponder → UIView → UILabel
```

[`UIView`](ui-view.md) 的成员全部可用：位置和大小、底色、透明度、隐藏、图层、约束。本页不重复列出。

`UILabel` 自己不派发任何事件。本页的属性都只会被 App 的代码修改，所以没有变化通知。

### 创建

#### `new UILabel()`

创建一个标签。没有参数。

```js
const label = new UILabel();
```

- 新标签的 `text` 是 `null`，`frame` 是 `(0, 0, 0, 0)`，没有父视图。
- **出错**：`UILabel` 不能被继承。`class Title extends UILabel {}` 之后 `new Title()` 抛 `TypeError: Illegal constructor: Title extends UILabel, but subclassing native classes is not supported yet`。要给标签附加自己的逻辑，用组合，见[原生类](native-classes.md)。

### 文字和外观

| 属性 | 类型 | 可读 | 可写 | 默认值 | 含义 |
| --- | --- | --- | --- | --- | --- |
| `text` | 字符串或 `null` | 是 | 是 | `null` | 显示的文字。`null` 表示没有文字。写入不是字符串的值时按 `String()` 转 |
| `font` | [`UIFont`](ui-font.md) | 是 | 是 | 系统字体，17 pt | 字体，包含字号和粗细。写 `null` 恢复默认值。读出来不会是 `null` |
| `textColor` | [颜色](ui-color.md)字符串 | 是 | 是 | 系统的 `label` 颜色 | 文字颜色。写入时也接受 `UIColor` 对象。写 `null` 恢复默认值（**未在模拟器验证**）。读出来不会是 `null` |
| `textAlignment` | 字符串 | 是 | 是 | `'natural'` | 文字在标签宽度内的水平对齐，取值见[下表](#textalignment-的取值) |

- `font` 读出来的对象就是写进去的那一个：`label.font === 写入的对象` 是 `true`。
- `font` 写入的不是 `UIFont` 对象也不是 `null` 时抛 `TypeError`，比如 `label.font = 'Helvetica'`。
- 颜色属性读出来的字符串和写入的字符串相同：写 `'#336699'`，读回 `'#336699'`。
- 颜色属性写入不合法的颜色时不抛异常。控制台输出一条警告，比如 `[Nacre] textColor: "#GGG" is not a valid color, ignored`，颜色保持原值。这条规则对 `textColor`、`highlightedTextColor`、`shadowColor` 都适用。

#### `textAlignment` 的取值

| 取值 | 效果 |
| --- | --- |
| `'left'` | 靠左 |
| `'center'` | 居中 |
| `'right'` | 靠右 |
| `'justified'` | 两端对齐：除最后一行外，每行的文字拉开到占满整行。只对多行文字有意义。**未在模拟器验证** |
| `'natural'` | 按系统语言的书写方向：从左往右的语言靠左，从右往左的语言（阿拉伯语、希伯来语）靠右 |

写入表外的值时抛 `TypeError: textAlignment has no value "middle"; expected one of: …`，省略号处列出全部可用的值。

### 行数和截断

| 属性 | 类型 | 可读 | 可写 | 默认值 | 含义 |
| --- | --- | --- | --- | --- | --- |
| `numberOfLines` | 整数 | 是 | 是 | `1` | 最多显示几行，单位是行。`0` 表示不限行数 |
| `lineBreakMode` | 字符串 | 是 | 是 | `'byTruncatingTail'` | 文字放不下时怎么处理，取值见[下表](#linebreakmode-的取值) |

`numberOfLines` 写入的值先转成数再向零取整：`'2'` 得到 `2`。转不成有限数的值（`'abc'`、`undefined`）抛 `TypeError`。

#### `lineBreakMode` 的取值

| 取值 | 效果 |
| --- | --- |
| `'byTruncatingTail'` | 末尾放不下的部分换成「…」 |
| `'byTruncatingHead'` | 开头的部分换成「…」，保留结尾。**未在模拟器验证** |
| `'byTruncatingMiddle'` | 中间的部分换成「…」，保留开头和结尾。**未在模拟器验证** |
| `'byClipping'` | 放不下的部分不显示，没有省略号。**未在模拟器验证** |
| `'byWordWrapping'` | 在单词的边界换行。最后一行放不下的部分不显示，没有省略号。**未在模拟器验证** |
| `'byCharWrapping'` | 在任意字符之间换行，可以把一个单词拆开。最后一行放不下的部分不显示，没有省略号。**未在模拟器验证** |

写入表外的值时抛 `TypeError: lineBreakMode has no value "ellipsis"; expected one of: …`。

### 自动缩小字号

| 属性 | 类型 | 可读 | 可写 | 默认值 | 含义 |
| --- | --- | --- | --- | --- | --- |
| `adjustsFontSizeToFitWidth` | 布尔 | 是 | 是 | `false` | `true`：文字放不下时缩小字号，直到放得下或者达到 `minimumScaleFactor` 的下限。`false`：字号不变，放不下就按 `lineBreakMode` 处理 |
| `minimumScaleFactor` | 数 | 是 | 是 | `0` | 字号最小缩到原字号的多少，0 到 1 的比例，没有单位。`0.5` 表示最小缩到一半。只在 `adjustsFontSizeToFitWidth` 是 `true` 时起作用 |
| `baselineAdjustment` | 字符串 | 是 | 是 | `'alignBaselines'` | 字号缩小之后，文字在垂直方向上怎么摆放，取值见下表。只在 `adjustsFontSizeToFitWidth` 是 `true` 时起作用 |

这三个属性的默认值和效果都**未在模拟器验证**。

| `baselineAdjustment` 的取值 | 效果 |
| --- | --- |
| `'alignBaselines'` | 缩小后的文字，基线保持在原字号时基线的位置。基线是一行文字里字母底部对齐的那条线 |
| `'alignCenters'` | 缩小后的文字在标签内垂直居中 |
| `'none'` | 缩小后的文字贴着标签的顶部 |

写入表外的值时抛 `TypeError: baselineAdjustment has no value "middle"; expected one of: …`。

### 尺寸

| 属性 | 类型 | 可读 | 可写 | 默认值 | 含义 |
| --- | --- | --- | --- | --- | --- |
| `preferredMaxLayoutWidth` | 数 | 是 | 是 | `0` | 多行标签计算固有尺寸时使用的换行宽度，单位 [pt](units.md)。`0` 表示不指定。见[多行文字和宽度](#多行文字和宽度) |

量文字用的成员继承自 `UIView`，在标签上的含义如下。完整说明见 [`UIView`](ui-view.md)。

| 成员 | 在标签上返回什么 |
| --- | --- |
| `intrinsicContentSize` | 只读的 `CGSize`，单位 [pt](units.md)。文字的固有尺寸。同步读出 |
| `sizeThatFits(size)` | `CGSize`，单位 [pt](units.md)。宽度不超过 `size.width` 时文字需要的大小，受 `numberOfLines` 限制。同步返回，不改变标签 |
| `sizeToFit()` | 无返回值。把标签的大小改成刚好容纳文字，位置不变 |

`sizeThatFits(size)` 的 `size` 可以是 `CGSize`，也可以是 `{ width, height }`。缺字段时抛 `TypeError: sizeThatFits is missing width, or it is not a finite number`。

### 阴影

| 属性 | 类型 | 可读 | 可写 | 默认值 | 含义 |
| --- | --- | --- | --- | --- | --- |
| `shadowColor` | [颜色](ui-color.md)字符串或 `null` | 是 | 是 | `null` | 文字阴影的颜色。`null` 表示没有阴影。写入时也接受 `UIColor` 对象 |
| `shadowOffset` | `CGSize` | 是 | 是 | `(0, -1)` | 阴影相对文字的偏移，单位 [pt](units.md)。`width` 向右为正，`height` 向下为正。默认值是向上 1 pt（**未在模拟器验证**） |

- `shadowOffset` 写入时可以给 `CGSize`，也可以给 `{ width, height }`。
- `shadowOffset` 读出来的 `CGSize` 是只读的。要改偏移，赋一个新的值，见[结构体](structs.md)。
- **出错**：
  - `shadowOffset` 给的不是对象：`TypeError: shadowOffset needs an object with all of: width, height`
  - 缺字段，或字段不是有限的数：`TypeError: shadowOffset is missing height, or it is not a finite number`

### 状态

| 属性 | 类型 | 可读 | 可写 | 默认值 | 含义 |
| --- | --- | --- | --- | --- | --- |
| `isEnabled` | 布尔 | 是 | 是 | `true` | `true`：文字正常显示。`false`：文字变淡，表示不可用（**未在模拟器验证**）。它只改变外观 |
| `isHighlighted` | 布尔 | 是 | 是 | `false` | `true`：文字用 `highlightedTextColor` 显示（**未在模拟器验证**）。`false`：文字用 `textColor` 显示。系统不会自动修改它 |
| `highlightedTextColor` | [颜色](ui-color.md)字符串或 `null` | 是 | 是 | `null` | `isHighlighted` 是 `true` 时的文字颜色。`null` 表示高亮时颜色不变。写入时也接受 `UIColor` 对象 |

以下属性继承自 `UIView`，但 `UILabel` 的默认值不同：

| 属性 | `UIView` 的默认值 | `UILabel` 的默认值 | 影响 |
| --- | --- | --- | --- |
| `isUserInteractionEnabled` | `true` | `false` | 标签默认不接收触摸，触摸落到它后面的视图上 |

### 通用的出错情况

属性名拼错时运行时不报错（类型检查会报错）。在不是由构造函数创建的对象上调用会抛 `Illegal invocation`。这些对所有视图都一样，见 [`UIView`](ui-view.md)。

## 与 iOS 原生写法的对照

这张表给照着 Apple 的文档或 iOS 示例代码写的人查对应的 JS 写法。

| ObjC | JS |
| --- | --- |
| `[[UILabel alloc] init]` | `new UILabel()` |
| `label.text = @"Hello"` | `label.text = 'Hello'` |
| `label.font = [UIFont systemFontOfSize:34 weight:UIFontWeightBold]` | `label.font = UIFont.systemFontOfSize(34, { weight: 'bold' })` |
| `label.textColor = UIColor.labelColor` | `label.textColor = 'label'` |
| `label.textAlignment = NSTextAlignmentCenter` | `label.textAlignment = 'center'` |
| `label.lineBreakMode = NSLineBreakByTruncatingTail` | `label.lineBreakMode = 'byTruncatingTail'` |
| `label.numberOfLines = 0` | `label.numberOfLines = 0` |
| `label.adjustsFontSizeToFitWidth = YES` | `label.adjustsFontSizeToFitWidth = true` |
| `label.baselineAdjustment = UIBaselineAdjustmentAlignCenters` | `label.baselineAdjustment = 'alignCenters'` |
| `label.highlighted = YES` | `label.isHighlighted = true` |
| `label.enabled = NO` | `label.isEnabled = false` |
| `label.shadowOffset = CGSizeMake(0, -1)` | `label.shadowOffset = new CGSize(0, -1)` |
| `[label sizeThatFits:CGSizeMake(402, 999)]` | `label.sizeThatFits(new CGSize(402, 999))` |

规则有三条：

- 枚举写成字符串：ObjC 常量去掉类型前缀，首字母小写。`NSTextAlignmentCenter` 是 `'center'`，`NSLineBreakByTruncatingTail` 是 `'byTruncatingTail'`。见[枚举](enums.md)。
- 颜色写成字符串，不用 `UIColor` 的常量。
- ObjC 里声明成 `getter=isXxx` 的布尔属性，JS 用 `isXxx` 这个名字读和写。

## 与浏览器写法的对照

这张表给熟悉 HTML 和 CSS 的人查对应关系。

| HTML / CSS | `UILabel` |
| --- | --- |
| `<span>`、`<p>` 里的纯文本 | `text` |
| 默认自动换行 | 默认只显示一行。换行要设 `numberOfLines` |
| `-webkit-line-clamp: 3` | `numberOfLines = 3` |
| `text-overflow: ellipsis` | `lineBreakMode = 'byTruncatingTail'`（默认值） |
| `text-overflow: clip` | `lineBreakMode = 'byClipping'` |
| `text-align` | `textAlignment` |
| `text-shadow`，带模糊半径 | `shadowColor` 和 `shadowOffset`，没有模糊半径 |
| 在文字中间嵌套 `<b>`、`<span style>` | 不支持。整段文字只有一种字体和颜色 |
| 用户可以选中和复制文字 | 不可以 |
| 元素按内容收缩后的大小 | `intrinsicContentSize`，只在用约束定位时自动生效 |

## 还不能做的

| 想做的事 | 对应的原生能力 | 状态 |
| --- | --- | --- |
| 一段文字里混用多种字体、颜色、下划线 | `attributedText` | 未实现 |
| 调整行间距、段间距、首行缩进 | `attributedText` 的段落样式 | 未实现 |
| 用户在系统设置里调整文字大小后，标签自动换成新字号 | `adjustsFontForContentSizeCategory` | 未实现。替代写法是在系统设置变化时重新给 `font` 赋值，见 [`UIFont`](ui-font.md) |
| 细调换行和截断时的排版 | `lineBreakStrategy`、`allowsDefaultTighteningForTruncation` | 未实现 |
| 让文字垂直靠上或靠下 | 原生没有这个属性 | 做法是不约束标签的高度，让它等于文字的高度，再用约束或 `frame` 摆放标签 |
| 让用户选中和复制文字 | `UITextView` | 未实现 |
| 让用户编辑文字 | `UITextField`、`UITextView` | 单行输入见 [`UITextField`](ui-text-field.md)。多行输入未实现 |

## 参见

- [`UIView`](ui-view.md)：标签的父类，位置、大小、底色、约束都在那里
- [`UIFont`](ui-font.md)：字体、字号、粗细的全部写法，以及跟随系统文字大小的写法
- [颜色](ui-color.md)：颜色字符串的全部写法，写错时的行为
- [Auto Layout](auto-layout.md)：用约束定位，固有尺寸在约束里怎么起作用
- [手势识别器](ui-gesture-recognizer.md)：让标签响应点按
- [`UIButton`](ui-button.md)：按钮上的文字由一个 `UILabel` 显示，通过 `titleLabel` 取到
- [`UITextField`](ui-text-field.md)：可以编辑的单行文字
- [枚举](enums.md)：枚举字符串的命名规则
- [单位](units.md)：pt 是什么
