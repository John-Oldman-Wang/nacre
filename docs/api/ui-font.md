---
type: reference
native: UIFont
status: partial
---

# `UIFont`

**`UIFont`** 表示一个字体。一个 `UIFont` 对象同时确定三件事：用哪种字体、字号多大、笔画多粗。把它赋给 [`UILabel`](ui-label.md) 这类显示文字的视图的 `font` 属性，文字就用这个字体显示。

字体对象不可变：创建之后字号和粗细都不能改。要换字号，就再取一个字体对象，重新赋给 `font`。`UIFont` 不派发任何事件；所有属性的值在对象存在期间不会变，所以没有变化通知。

**继承关系**：`EventTarget` → `NSObject` → `UIFont`

怎么给文字选字体、跟随系统文字大小，见指南[设置字体](../guides/fonts.md)。

## 构造函数

不能用 `new` 创建，也不能被继承。`new UIFont()` 抛：

```
TypeError: Illegal constructor: UIFont is created by the runtime, not by new
```

字体对象全部通过下面的静态方法得到。继承的限制见[原生类](native-classes.md)。

## 静态方法

系统字体：

| 方法 | 说明 |
| --- | --- |
| [`UIFont.systemFontOfSize()`](ui-font/systemfontofsize.md) | 系统字体，可以指定粗细 |
| [`UIFont.boldSystemFontOfSize()`](ui-font/boldsystemfontofsize.md) | 粗体的系统字体 |
| [`UIFont.italicSystemFontOfSize()`](ui-font/italicsystemfontofsize.md) | 斜体的系统字体 |
| [`UIFont.monospacedSystemFontOfSize()`](ui-font/monospacedsystemfontofsize.md) | 系统的等宽字体，所有字符等宽 |
| [`UIFont.monospacedDigitSystemFontOfSize()`](ui-font/monospaceddigitsystemfontofsize.md) | 系统字体，只有数字等宽 |

其他来源：

| 方法 | 说明 |
| --- | --- |
| [`UIFont.preferredFontForTextStyle()`](ui-font/preferredfontfortextstyle.md) | 按用途取系统字体，字号取决于用户的文字大小设置 |
| [`UIFont.fontWithName()`](ui-font/fontwithname.md) | 按名字取系统里装着的其他字体。取不到时返回 `null` |

有哪些字体：

| 成员 | 说明 |
| --- | --- |
| [`UIFont.familyNames`](ui-font/familynames.md) <small>只读</small> | 能用的全部字体家族的名字 |
| [`UIFont.fontNamesForFamilyName()`](ui-font/fontnamesforfamilyname.md) | 一个家族里各个字体的名字，可以传给 `fontWithName()` |

## 实例属性

还继承 `NSObject` 的属性。全部只读，给它们赋值抛 `TypeError`。

| 属性 | 说明 |
| --- | --- |
| [`familyName`](ui-font/familyname.md) <small>只读</small> | 字体家族名 |
| [`fontName`](ui-font/fontname.md) <small>只读</small> | 具体字体名 |
| [`pointSize`](ui-font/pointsize.md) <small>只读</small> | 字号 |
| [`ascender`](ui-font/ascender.md) <small>只读</small> | 基线到字体最高处的距离 |
| [`descender`](ui-font/descender.md) <small>只读</small> | 基线到字体最低处的距离 |
| [`capHeight`](ui-font/capheight.md) <small>只读</small> | 大写字母的高度 |
| [`xHeight`](ui-font/xheight.md) <small>只读</small> | 小写字母 x 的高度 |
| [`lineHeight`](ui-font/lineheight.md) <small>只读</small> | 一行文字的高度 |
| [`leading`](ui-font/leading.md) <small>只读</small> | 字体建议的行间额外间距 |

## 字号的单位

字号的单位是点（[pt](units.md)），和视图的位置、大小用同一种单位。没有其他单位可选。标签不设字体时用的是 17 pt 的系统字体。

字号是一个固定的数。`UIFont.systemFontOfSize(17)` 得到的字体永远是 17 pt，不随屏幕大小变化，也不随用户的系统设置变化。

## 字体从哪里来

| 来源 | 写法 | 取不到时 |
| --- | --- | --- |
| 系统字体 | `systemFontOfSize()` 等五个方法 | 一定取得到 |
| 按用途取的系统字体，字号跟随用户设置 | `preferredFontForTextStyle()` | 一定取得到 |
| 系统里装着的其他字体，按名字取 | `fontWithName()` | 返回 `null`，不抛异常 |

「系统字体」是 iOS 界面默认使用的字体。它一定存在，取字体的方法不会返回 `null`，并且有九种粗细可选。

`fontWithName()` 没有回退列表：一次只能指定一个名字，取不到时换成什么由 App 的代码决定。要知道有哪些名字可以用，读 [`familyNames`](ui-font/familynames.md) 和 [`fontNamesForFamilyName()`](ui-font/fontnamesforfamilyname.md)。

能用的字体都是系统自带的。

## 字重

字重是笔画的粗细。`systemFontOfSize()`、`monospacedSystemFontOfSize()`、`monospacedDigitSystemFontOfSize()` 的 `weight` 接受九个名字，按从细到粗排列：

| 取值 | 效果 |
| --- | --- |
| `'ultraLight'` | 最细 |
| `'thin'` | 比 `'ultraLight'` 粗一级 |
| `'light'` | 比常规细一级 |
| `'regular'` | 常规粗细。不传 `weight` 时用它 |
| `'medium'` | 比常规粗一级 |
| `'semibold'` | 半粗体 |
| `'bold'` | 粗体 |
| `'heavy'` | 比粗体粗一级 |
| `'black'` | 最粗 |

只能写这九个名字，不能写数字。写了不认识的名字抛 `TypeError`，不会退回 `'regular'`：

```
TypeError: weight has no value "extrabold"; expected one of: ultraLight / thin / light / regular / medium / semibold / bold / heavy / black
```

## 文本样式

文本样式是按用途命名的一组字体，[`preferredFontForTextStyle()`](ui-font/preferredfontfortextstyle.md) 接受这些名字。每种样式的字号和粗细由系统规定，并且随用户的文字大小设置变化。用户调整文字大小时，每种样式各自变化多少也由系统规定。

| 取值 | 用途 |
| --- | --- |
| `'largeTitle'` | 页面顶部的大标题 |
| `'title1'` | 一级标题 |
| `'title2'` | 二级标题 |
| `'title3'` | 三级标题 |
| `'headline'` | 段落的小标题 |
| `'subheadline'` | 小标题下面的副标题 |
| `'body'` | 正文 |
| `'callout'` | 标注文字 |
| `'footnote'` | 脚注 |
| `'caption1'` | 图片或控件的说明文字 |
| `'caption2'` | 更小一级的说明文字 |

每种样式在当前设置下的具体字号，用 `pointSize` 读。

## 动态字体

「动态字体」是 iOS 的一项系统功能：用户在系统的「设置 → 显示与亮度 → 文字大小」里选一个档位，各个 App 的文字跟着变大或变小。[文本样式](#文本样式)是 App 接入这项功能的方式。

三条规则：

- **只有 `preferredFontForTextStyle()` 得到的字体跟随设置。** `systemFontOfSize(17)`、`fontWithName()` 等指定字号的方法永远是指定的字号。
- **跟随发生在创建的时刻。** `preferredFontForTextStyle('body')` 返回的是「此刻的设置下」的正文字体。它仍然是一个不可变的对象，用户之后改了设置，这个对象的 `pointSize` 不变，已经用了它的标签也不变。
- **要在 App 运行期间跟着变，需要重新赋值。** 用户改了设置后，[`application`](application.md) 派发 `contentsizecategorychange` 事件，在回调里重新调用 `preferredFontForTextStyle()` 并赋给 `font`。写法见指南[设置字体](../guides/fonts.md)。

当前的档位可以从 `application.contentSizeCategory` 读到。视图和场景的 `traitchange` 事件也会在文字大小变化时派发，见 [`UITraitCollection`](ui-trait-collection.md)。

间距、图标大小这些[点值](units.md)不会跟着文字大小设置变化。

## 字体度量

一行文字在竖直方向上分成几段，字体对象上的度量属性给出每一段的高度。

```
        ┬ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─   最高处
        │  ascender
        │        ┬ capHeight（大写字母的高度）
        │        │    ┬ xHeight（小写 x 的高度）
基线 ───┴────────┴────┴─────────
        │  descender
        ┴ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─   最低处
```

- **基线**：字母站立的那条线。`g`、`y` 这类字母有一部分在基线以下。
- [`ascender`](ui-font/ascender.md)、[`descender`](ui-font/descender.md)：基线到字体最高处、最低处的距离。
- [`capHeight`](ui-font/capheight.md)、[`xHeight`](ui-font/xheight.md)：大写字母、小写 x 的高度。
- [`lineHeight`](ui-font/lineheight.md)：一行文字的高度。
- [`leading`](ui-font/leading.md)：字体建议的行与行之间的额外间距。

这些值都随字号变化，单位都是 [pt](units.md)。它们只和字体有关，和文字内容无关。一段具体的文字占多宽多高，读显示它的标签的 `intrinsicContentSize`，见 [`UILabel`](ui-label.md)。

## 相等

系统对相同参数的系统字体返回同一个对象，所以 `UIFont.systemFontOfSize(17) === UIFont.systemFontOfSize(17)` 是 `true`。字体赋给标签再读回来，得到的也是原来那个对象。

`fontWithName()` 取两次是否得到同一个对象没有保证。比较指定名字的字体，比较 `fontName` 和 `pointSize`。

## 哪些地方接受字体

| 属性 | 说明 |
| --- | --- |
| [`UILabel`](ui-label.md) 的 [`font`](ui-label/font.md) | 标签的字体。写入接受 `UIFont` 或 `null` |
| [`UITextField`](ui-text-field.md) 的 `font` | 输入框的字体 |
| [`UIButton`](ui-button.md) 的 `titleLabel.font` | 按钮文字的字体，写法同 `UILabel` |
| [`NSAttributedString`](ns-attributed-string.md) 的 `font` 属性 | 富文本里某一段的字体 |

## 示例

### 五种字体

从空白 App 开始，在页面上从上到下放五行文字，每行用一种字体。

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const column = new UIStackView();
  column.translatesAutoresizingMaskIntoConstraints = false;
  column.axis = 'vertical';
  column.spacing = 12;
  page.view.addSubview(column);

  const title = new UILabel();
  title.text = 'Hello, Nacre';
  title.font = UIFont.systemFontOfSize(34, { weight: 'bold' });
  column.addArrangedSubview(title);

  const body = new UILabel();
  body.text = 'The quick brown fox';
  body.font = UIFont.systemFontOfSize(17);
  column.addArrangedSubview(body);

  const italic = new UILabel();
  italic.text = 'The quick brown fox';
  italic.font = UIFont.italicSystemFontOfSize(17);
  column.addArrangedSubview(italic);

  const code = new UILabel();
  code.text = 'const x = 0123456789;';
  code.font = UIFont.monospacedSystemFontOfSize(17);
  column.addArrangedSubview(code);

  const note = new UILabel();
  note.text = 'Footnote text';
  note.font = UIFont.preferredFontForTextStyle('footnote');
  column.addArrangedSubview(note);

  console.log(title.font.fontName, title.font.pointSize);

  const safe = page.view.safeAreaLayoutGuide;
  NSLayoutConstraint.activateConstraints([
    column.topAnchor.constraintEqualToAnchor(safe.topAnchor, { constant: 16 }),
    column.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor, { constant: 16 }),
    column.trailingAnchor.constraintEqualToAnchor(safe.trailingAnchor, { constant: -16 }),
  ]);
});
```

**效果**

- 第一行「Hello, Nacre」是粗体的大字，字号 34 pt。
- 第二行是常规粗细的 17 pt 文字。
- 第三行和第二行同样大小，字形向右倾斜。**未在模拟器验证。**
- 第四行每个字符占的宽度相同，字母和数字上下对齐成列。
- 第五行比第二行小。用户在系统设置里把文字调大后重新启动 App，这一行跟着变大，前四行不变。**未在模拟器验证。**
- 控制台输出 `.SFUI-Bold 34`。

这段代码没有作为一个整体在模拟器运行过。其中 `systemFontOfSize()`、`monospacedSystemFontOfSize()`、`preferredFontForTextStyle()`、`fontName`、`pointSize` 在验收用例里运行过，`italicSystemFontOfSize()` 没有。

更多写法见指南[设置字体](../guides/fonts.md)。

## 对应的 iOS API

方法名取 ObjC 方法名的第一段。其余各段放进 options 对象，键名就是 ObjC 的段名。字重和文本样式的常量去掉前缀、首字母小写后作为字符串。

| ObjC | JS |
| --- | --- |
| `[UIFont systemFontOfSize:17]` | `UIFont.systemFontOfSize(17)` |
| `[UIFont systemFontOfSize:28 weight:UIFontWeightBold]` | `UIFont.systemFontOfSize(28, { weight: 'bold' })` |
| `[UIFont boldSystemFontOfSize:17]` | `UIFont.boldSystemFontOfSize(17)` |
| `[UIFont italicSystemFontOfSize:17]` | `UIFont.italicSystemFontOfSize(17)` |
| `[UIFont monospacedSystemFontOfSize:20 weight:UIFontWeightMedium]` | `UIFont.monospacedSystemFontOfSize(20, { weight: 'medium' })` |
| `[UIFont monospacedDigitSystemFontOfSize:17 weight:UIFontWeightRegular]` | `UIFont.monospacedDigitSystemFontOfSize(17, { weight: 'regular' })` |
| `[UIFont fontWithName:@"Helvetica" size:17]` | `UIFont.fontWithName('Helvetica', { size: 17 })` |
| `[UIFont preferredFontForTextStyle:UIFontTextStyleBody]` | `UIFont.preferredFontForTextStyle('body')` |
| `UIFontWeightSemibold` | `'semibold'` |
| `UIFontTextStyleLargeTitle` | `'largeTitle'` |
| `font.familyName`、`font.fontName`、`font.pointSize` | 同名属性 |
| `font.ascender`、`font.descender`、`font.capHeight`、`font.xHeight`、`font.lineHeight`、`font.leading` | 同名属性 |
| `UIContentSizeCategoryDidChangeNotification` | `application.addEventListener('contentsizecategorychange', …)` |

两处和原生不同：

- 原生的 `monospacedSystemFontOfSize:weight:` 和 `monospacedDigitSystemFontOfSize:weight:` 必须传字重。JS 里 `weight` 可以省略，省略时是 `'regular'`。
- 原生的字重是浮点数常量，可以写任意中间值。JS 只接受九个名字。

### 与浏览器写法的对照

| CSS | 这里 |
| --- | --- |
| `font-family`、`font-size`、`font-weight`、`font-style` 四个属性 | 合在一个 `UIFont` 对象里，赋给 `font` |
| `font-family: system-ui` | `UIFont.systemFontOfSize(size)` |
| `font-family: monospace` | `UIFont.monospacedSystemFontOfSize(size)` |
| `font-variant-numeric: tabular-nums` | `UIFont.monospacedDigitSystemFontOfSize(size)` |
| `font-weight: 100`–`900` | 九个字重名。每一级和 CSS 的数值是否一一对应没有核对过 |
| `font-family: A, B, sans-serif` 回退列表 | 没有。`fontWithName()` 取不到时返回 `null` |
| `px`、`em`、`rem` | 只有 pt |
| `line-height` | 没有对应的可写属性。`lineHeight` 是只读的字体度量。富文本的段落样式能调行距，见 [`NSParagraphStyle`](ns-paragraph-style.md) |
| Canvas 的 `measureText()` | 字体的高度信息读 `UIFont` 的度量属性，一段文字的宽高读标签的 `intrinsicContentSize` |

## 参见

- [设置字体](../guides/fonts.md)：粗细、斜体、等宽、跟随系统文字大小、指定名字的字体
- [`UILabel`](ui-label.md)：显示文字的视图，`font` 属性在它上面
- [`UIButton`](ui-button.md)：按钮文字的字体通过 `titleLabel` 设
- [`application`](application.md)：`contentSizeCategory` 和 `contentsizecategorychange` 事件
- [枚举](enums.md)：字符串取值的通用规则，写错时怎么报错
- [单位](units.md)：pt 是什么
