---
type: reference
native: UILabel
status: partial
---

# `UILabel`

**`UILabel`** 表示屏幕上一段只读的文字，称为标签。标题、说明、列表里每一行的文字都由标签显示。用户能看到标签上的文字，不能编辑、选中或复制它。

一个标签显示一段文字。用 [`text`](ui-label/text.md) 设置时，整段文字用同一种字体、同一种颜色；要让其中几个字加粗或换颜色，用 [`attributedText`](ui-label/attributedtext.md) 设一段[富文本](ns-attributed-string.md)。文字里可以同时有中文和英文，验收用的界面里标签显示的就是中英文混排的文字。表情符号能否正常显示**未在模拟器验证**。

改了 `text`、`font` 或其他属性之后，屏幕上的文字自动更新，不需要调用任何刷新方法。

`UILabel` 自己不派发任何事件。它的属性都只会被 App 的代码修改，所以没有变化通知。

**继承关系**：`EventTarget` → `NSObject` → `UIResponder` → [`UIView`](ui-view.md) → `UILabel`

怎么用标签显示标题、多行说明、量文字大小，见指南[显示文字](../guides/labels.md)。

## 构造函数

[`UILabel()`](ui-label/constructor.md)

创建一个没有文字、宽高是 0 的标签。

## 实例属性

还继承 [`UIView`](ui-view.md) 的属性。标签常用的继承属性是 `frame`、`backgroundColor`、`isHidden`、`intrinsicContentSize`。`isUserInteractionEnabled` 在标签上的默认值是 `false`，和普通视图不同，见[触摸](#触摸)。

文字和外观：

| 属性 | 说明 |
| --- | --- |
| [`text`](ui-label/text.md) | 显示的文字 |
| [`attributedText`](ui-label/attributedtext.md) | 带样式的文字，一段里可以混用几种字体和颜色 |
| [`font`](ui-label/font.md) | 字体，包含字号和粗细 |
| [`textColor`](ui-label/textcolor.md) | 文字颜色 |
| [`textAlignment`](ui-label/textalignment.md) | 文字在标签宽度内的水平对齐 |

行数和截断：

| 属性 | 说明 |
| --- | --- |
| [`numberOfLines`](ui-label/numberoflines.md) | 最多显示几行。`0` 表示不限 |
| [`lineBreakMode`](ui-label/linebreakmode.md) | 文字放不下时怎么处理 |
| [`preferredMaxLayoutWidth`](ui-label/preferredmaxlayoutwidth.md) | 多行标签计算固有尺寸时使用的换行宽度 |

自动缩小字号：

| 属性 | 说明 |
| --- | --- |
| [`adjustsFontSizeToFitWidth`](ui-label/adjustsfontsizetofitwidth.md) | 文字放不下时是否缩小字号 |
| [`minimumScaleFactor`](ui-label/minimumscalefactor.md) | 字号最小缩到原字号的多少 |
| [`baselineAdjustment`](ui-label/baselineadjustment.md) | 字号缩小之后，文字在垂直方向上怎么摆放 |

阴影和状态：

| 属性 | 说明 |
| --- | --- |
| [`shadowColor`](ui-label/shadowcolor.md) | 文字阴影的颜色 |
| [`shadowOffset`](ui-label/shadowoffset.md) | 文字阴影相对文字的偏移 |
| [`isEnabled`](ui-label/isenabled.md) | 是否显示成可用的样子 |
| [`isHighlighted`](ui-label/ishighlighted.md) | 是否处于高亮状态 |
| [`highlightedTextColor`](ui-label/highlightedtextcolor.md) | 高亮状态下的文字颜色 |

## 实例方法

`UILabel` 自己没有声明方法。量文字大小用继承自 [`UIView`](ui-view.md) 的方法，它们在标签上的含义如下：

| 成员 | 在标签上返回什么 |
| --- | --- |
| `intrinsicContentSize` | 只读的 `CGSize`，单位 [pt](units.md)。文字的[固有尺寸](#固有尺寸)。同步读出 |
| `sizeThatFits(size)` | `CGSize`，单位 [pt](units.md)。宽度不超过 `size.width` 时文字需要的大小，受 `numberOfLines` 限制。同步返回，不改变标签 |
| `sizeToFit()` | 无返回值。把标签的大小改成刚好容纳文字，位置不变 |

`sizeThatFits(size)` 的 `size` 可以是 `CGSize`，也可以是 `{ width, height }`。缺字段时抛 `TypeError: sizeThatFits is missing width, or it is not a finite number`。

这两个量尺寸的成员都不改变标签。标签不需要先加到页面上，新建之后就可以量。

## 文字放不下时

**标签默认只显示一行。** 文字比标签宽时不换行，放不下的部分在末尾换成省略号「…」。

文字放不下时有三种处理方式，由不同的属性控制：

| 处理方式 | 写法 |
| --- | --- |
| 截断 | 默认行为。省略号的位置由 [`lineBreakMode`](ui-label/linebreakmode.md) 决定 |
| 换行 | [`numberOfLines`](ui-label/numberoflines.md) 设成 `0`（不限行数），或者一个大于 1 的数（最多这么多行） |
| 缩小字号 | [`adjustsFontSizeToFitWidth`](ui-label/adjustsfontsizetofitwidth.md) 设成 `true` |

三种方式可以组合：先换行，行数用完之后截断；先缩小，缩到下限之后截断。哪种内容该用哪种，见指南[显示文字](../guides/labels.md)。

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

## 固有尺寸

固有尺寸是视图按自己的内容算出来的大小。普通的 `UIView` 没有内容，没有固有尺寸。`UILabel` 的内容是文字，它的固有尺寸由四样东西决定：`text`、`font`、`numberOfLines`、`preferredMaxLayoutWidth`。

固有尺寸是一个可以读的值（`intrinsicContentSize`）。它只在用约束定位时自动生效：

| 定位方式 | 标签的大小从哪里来 |
| --- | --- |
| [Auto Layout](auto-layout.md) 约束 | 没有约束宽或高时，系统使用固有尺寸。所以只约束位置就够了 |
| 直接写 `frame` | 完全由 `frame` 决定。新建的标签宽高是 0。固有尺寸不会自动生效，要自己量再写进去 |

约束和固有尺寸冲突时（比如约束出来的宽度比文字窄），约束优先，文字按 `numberOfLines` 和 `lineBreakMode` 换行或截断。

标签多大程度上坚持固有尺寸，由内容优先级决定，见 [`UIView`](ui-view.md)。`UILabel` 的默认值和普通 `UIView` 一样：不愿被拉大的优先级是 250，不愿被压小的优先级是 750（实测）。

「标签的大小随文字自动调整」来自 iOS 的定义，验收用例没有专门的断言，**未在模拟器验证**。固有尺寸本身的数值是实测的。

## 多行文字和宽度

单行文字的大小是确定的。多行文字不是：同一段文字可以排成一行很宽，也可以排成很多行很窄。所以量多行文字时必须给出宽度。给宽度的途径有三个：

| 场景 | 宽度从哪里来 |
| --- | --- |
| 调 `sizeThatFits(size)` | 参数 `size.width` |
| 用约束定位，标签的宽度被约束确定 | 约束算出的宽度 |
| 用约束定位，标签的宽度没有被约束确定 | [`preferredMaxLayoutWidth`](ui-label/preferredmaxlayoutwidth.md) |

`preferredMaxLayoutWidth` 是 `0`（默认值）并且没有其他途径给出宽度时，固有尺寸按「全部文字排成一行」计算。**未在模拟器验证。**

## 触摸

以下属性继承自 `UIView`，但 `UILabel` 的默认值不同：

| 属性 | `UIView` 的默认值 | `UILabel` 的默认值 | 影响 |
| --- | --- | --- | --- |
| `isUserInteractionEnabled` | `true` | `false` | 标签默认不接收触摸，触摸落到它后面的视图上 |

要让标签响应点按，把它设成 `true` 再加一个[手势识别器](ui-gesture-recognizer.md)。

## 出错的情况

- 属性名拼错时运行时不报错（类型检查会报错）。在不是由构造函数创建的对象上调用会抛 `Illegal invocation`。这些对所有视图都一样，见 [`UIView`](ui-view.md)。
- 枚举属性（`textAlignment`、`lineBreakMode`、`baselineAdjustment`）和颜色属性写错时不抛异常，控制台输出一条警告，属性保持原值。各自的警告原文在成员页上。

## 示例

### 标题和两行说明

从空白 App 开始，在屏幕上方放一行标题，标题下面放一段最多显示两行的说明文字。

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const title = new UILabel();
  title.text = 'Hello, Nacre';
  title.font = UIFont.systemFontOfSize(34, { weight: 'bold' });
  title.textAlignment = 'center';

  const body = new UILabel();
  body.text = '这是一段刻意写得很长的说明文字，用来演示多行排版、行数限制和' +
              '尾部截断。两行放不下的部分不显示，第二行的末尾是省略号。';
  body.font = UIFont.systemFontOfSize(15);
  body.textColor = 'secondaryLabel';
  body.numberOfLines = 2;

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

`safe` 是安全区的 layout guide，表示屏幕上不被刘海、状态栏和底部横条遮挡的那块区域，见 [`UIView`](ui-view.md)。约束的写法见 [Auto Layout](auto-layout.md)。

更多写法见指南[显示文字](../guides/labels.md)。

## 对应的 iOS API

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
| `label.attributedText = text` | `label.attributedText = text` |
| `[label sizeThatFits:CGSizeMake(402, 999)]` | `label.sizeThatFits(new CGSize(402, 999))` |

规则有三条：

- 枚举写成字符串：ObjC 常量去掉类型前缀，首字母小写。`NSTextAlignmentCenter` 是 `'center'`，`NSLineBreakByTruncatingTail` 是 `'byTruncatingTail'`。见[枚举](enums.md)。
- 颜色写成字符串，不用 `UIColor` 的常量。
- ObjC 里声明成 `getter=isXxx` 的布尔属性，JS 用 `isXxx` 这个名字读和写。

### 与浏览器写法的对照

| HTML / CSS | `UILabel` |
| --- | --- |
| `<span>`、`<p>` 里的纯文本 | `text` |
| 默认自动换行 | 默认只显示一行。换行要设 `numberOfLines` |
| `-webkit-line-clamp: 3` | `numberOfLines = 3` |
| `text-overflow: ellipsis` | `lineBreakMode = 'byTruncatingTail'`（默认值） |
| `text-overflow: clip` | `lineBreakMode = 'byClipping'` |
| `text-align` | `textAlignment` |
| `text-shadow`，带模糊半径 | `shadowColor` 和 `shadowOffset`，没有模糊半径 |
| 在文字中间嵌套 `<b>`、`<span style>` | `attributedText` |
| 用户可以选中和复制文字 | 不可以 |
| 元素按内容收缩后的大小 | `intrinsicContentSize`，只在用约束定位时自动生效 |

## 参见

- [显示文字](../guides/labels.md)：多行、截断、自动缩小、量大小、阴影的写法
- [`UIView`](ui-view.md)：标签的父类，位置、大小、底色、约束都在那里
- [`UIFont`](ui-font.md)：`font` 的值
- [`UIColor`](ui-color.md)：颜色字符串的全部写法，写错时的行为
- [`NSAttributedString`](ns-attributed-string.md)：`attributedText` 的值
- [Auto Layout](auto-layout.md)：固有尺寸在约束里怎么起作用
- [`UIButton`](ui-button.md)：按钮上的文字由一个 `UILabel` 显示，通过 `titleLabel` 取到
- [`UITextField`](ui-text-field.md)：可以编辑的单行文字
- [单位](units.md)：pt 是什么
