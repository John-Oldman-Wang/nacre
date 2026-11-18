---
type: reference
native: NSAttributedString
status: partial
---

# 富文本（`NSAttributedString`）

**`NSAttributedString`** 表示一段带样式的文字：一个字符串，加上每一段上的一组**属性**。属性规定这一段用什么字体、什么颜色、有没有下划线、字距多大。同一个字符串里不同的段可以有不同的属性，所以一行文字里可以混用几种字号和颜色。

富文本自己不显示。把它交给标签、输入框、按钮，由它们显示：

| 显示在哪 | 写法 |
| --- | --- |
| [标签](ui-label.md) | `label.attributedText = text` |
| [单行输入框](ui-text-field.md) | `field.attributedText = text`、`field.attributedPlaceholder = text` |
| [多行输入](ui-text-view.md) | `textView.attributedText = text` |
| [按钮](ui-button.md) | `button.setAttributedTitle(text, { forState: ['normal'] })` |

这一页讲六个类：

| 类 | 是什么 |
| --- | --- |
| `NSAttributedString` | 富文本。建好之后内容不能改 |
| `NSMutableAttributedString` | 可以改的富文本：给某一段加属性、拼接、换文字 |
| `NSParagraphStyle` | 段落样式：对齐、行距、段距、缩进。属性只读 |
| `NSMutableParagraphStyle` | 可以改的段落样式 |
| `NSShadow` | 文字的阴影 |
| `NSTextAttachment` | 附件：在一个字符的位置上显示一张图片 |

> **注意**：这一页讲的读写行为（建富文本、读写属性、改内容、量尺寸、四种视图上的读写）在模拟器的验收里运行过（iPhone Air，iOS 27.2）。**屏幕上显示成什么样没有核对**：各处「效果」里标着未在模拟器验证的，说的都是画面，依据是 Apple 的头文件和文档。

## 范围怎么写

给某一段加属性时要说明是哪一段，用 [`NSRange`](ui-text-view.md#选区)：从第几个位置开始、多长。位置和长度的单位是 UTF-16 码元，和 JS 字符串的下标是同一个单位，所以 `'合计 ¥128'.indexOf('¥')` 得到的数可以直接用。一个表情符号占两个。

```js
new NSRange(3, 4);              // 从下标 3 开始的 4 个码元
{ location: 3, length: 4 };     // 写入时也收这种普通对象
```

范围超出文字的长度时抛 `TypeError`，报错里带着范围和文字的长度：

```
TypeError: addAttributes range {8, 9} is out of bounds; the string length is 10
```

## 富文本交出去之后再改，界面不会跟着变

视图拿走的是**赋值那一刻的内容**。之后再改同一个 `NSMutableAttributedString`，视图上显示的不变，要重新赋值一次。

段落样式和阴影也是这样：放进富文本的是当时的一份副本，之后再改那个 `NSMutableParagraphStyle` 或 `NSShadow`，已经建好的富文本不变。

所以推荐的顺序是：**先把样式对象设好，再建富文本，最后交给视图**。要改就重新建一个再赋值。

从视图上读回来的富文本（`label.attributedText`）是一份不可改的快照，每次读可能是不同的对象。比较两个富文本的内容用 `isEqualToAttributedString()`，不要用 `===`。

## 完整例子

下面的代码从空白 App 开始，在屏幕上显示一行价格：前面是普通的小字，价格是红色大字，原价是灰色带删除线。

```js
application.addEventListener('sceneconnect', (e) => {
  // 建窗口和页面。每个 App 都要有这几行
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 1. 一段一段建，每一段有自己的属性
  const text = new NSMutableAttributedString('到手价 ', {
    font: UIFont.systemFontOfSize(15),
    foregroundColor: 'label',
  });
  text.appendAttributedString(new NSAttributedString('¥128', {
    font: UIFont.boldSystemFontOfSize(26),
    foregroundColor: 'systemRed',
  }));
  text.appendAttributedString(new NSAttributedString('  ¥199', {
    font: UIFont.systemFontOfSize(13),
    foregroundColor: 'secondaryLabel',
    strikethroughStyle: ['single'],
  }));

  // 2. 交给标签显示
  const label = new UILabel();
  label.attributedText = text;

  // 3. 放到页面上，位置定在正中
  label.translatesAutoresizingMaskIntoConstraints = false;
  page.view.addSubview(label);
  NSLayoutConstraint.activateConstraints([
    label.centerXAnchor.constraintEqualToAnchor(page.view.centerXAnchor),
    label.centerYAnchor.constraintEqualToAnchor(page.view.centerYAnchor),
  ]);
});
```

**效果**（未在模拟器验证）

- 屏幕正中出现一行字：「到手价」是 15 pt 的普通字，「¥128」是 26 pt 的红色粗体，「¥199」是 13 pt 的灰色字，中间划着一条线。
- 三段的底边对齐在同一条基线上。

## 常见用法

以下例子都假设已经有一个加到页面上的标签 `label`。

### 整段文字用同一组属性

```js
label.attributedText = new NSAttributedString('重要通知', {
  font: UIFont.boldSystemFontOfSize(17),
  foregroundColor: '#ff3b30',
  kern: 2,
});
```

**效果**（未在模拟器验证）：四个字是红色粗体，字与字之间比平常多空 2 pt。

### 只给其中一段加样式

先用整段文字建一个可改的富文本，再用 `addAttribute()` 给一段加属性。

```js
const source = '合计 ¥128.00';
const text = new NSMutableAttributedString(source, { font: UIFont.systemFontOfSize(17) });
const start = source.indexOf('¥');
text.addAttribute('foregroundColor', {
  value: 'systemRed',
  range: new NSRange(start, source.length - start),
});
label.attributedText = text;
```

**效果**（未在模拟器验证）：「合计」是默认的颜色，「¥128.00」是红色。

`addAttribute()` 只动这一个属性，这一段原来的字体不变。

### 下划线和删除线

`underlineStyle` 和 `strikethroughStyle` 的值是数组，里面写线型，可以再加一种虚线。

```js
const text = new NSMutableAttributedString('实线 双线 虚线', {
  font: UIFont.systemFontOfSize(17),
});
text.addAttribute('underlineStyle', { value: ['single'], range: new NSRange(0, 2) });
text.addAttribute('underlineStyle', { value: ['double'], range: new NSRange(3, 2) });
text.addAttributes(
  { underlineStyle: ['single', 'patternDash'], underlineColor: 'systemRed' },
  { range: new NSRange(6, 2) },
);
label.attributedText = text;
```

**效果**：「实线」下面一条线，「虚线」下面一条红色的虚线。「双线」是上下两条线，靠上的一条贴着字的底边，靠下的一条能不能看见取决于标签的高度，见下面第一条。

> **注意**：标签的高度正好等于文字的高度时，双线靠下的那一条看不见。17 pt 的字，标签自己算出来的高度是 20.33 pt，而双线的第二条画在这个范围的外面，标签不画范围外面的东西。给标签一个更高的高度就能看到两条线，比如加一条高度约束：`label.heightAnchor.constraintEqualToConstant(28)`。粗线（`'thick'`）的底边也会被切掉一点。

> **注意**：虚线的一划的长度跟着字号走。17 pt 的字，`'patternDash'` 的一划大约一个汉字宽，两个字下面只有两划、中间一个小缺口，一眼看去像实线。要短一些的间隔用 `'patternDot'`。

不写 `underlineColor` 时，线的颜色和文字相同。

### 调行距和对齐

行距、对齐、缩进属于段落样式。建一个 `NSMutableParagraphStyle`，设好之后作为 `paragraphStyle` 属性放进去。

```js
const style = new NSMutableParagraphStyle();
style.alignment = 'center';
style.lineSpacing = 8;

label.numberOfLines = 0;
label.attributedText = new NSAttributedString('第一行\n第二行', {
  font: UIFont.systemFontOfSize(17),
  paragraphStyle: style,
});
```

**效果**（未在模拟器验证）：两行文字居中，两行之间比平常多空 8 pt。

段落样式对它覆盖到的整个段落生效。一个段落是两个换行符之间的文字。

### 文字里插一张图片

图片要先包成附件，再用附件建一个只有一个字符的富文本，拼到文字中间。

```js
const star = UIImage.systemImageNamed('star.fill');
if (star !== null) {
  const attachment = NSTextAttachment.textAttachmentWithImage(star);
  attachment.bounds = new CGRect(0, -3, 18, 18);

  const text = new NSMutableAttributedString('评分 ', { font: UIFont.systemFontOfSize(17) });
  text.appendAttributedString(NSAttributedString.attributedStringWithAttachment(attachment));
  text.appendAttributedString(new NSAttributedString(' 4.8'));
  label.attributedText = text;
}
```

**效果**（未在模拟器验证）：「评分」和「4.8」之间有一颗 18 × 18 pt 的星，比文字的基线低 3 pt。

`bounds` 的原点在文字的基线上，`y` 为负是往下移。不设 `bounds` 时图片按自己的大小显示，底边贴着基线。

### 改占位文字的颜色

```js
const field = new UITextField();
field.attributedPlaceholder = new NSAttributedString('请输入手机号', {
  foregroundColor: 'systemOrange',
});
```

**效果**（未在模拟器验证）：输入框为空时显示橙色的「请输入手机号」。

### 按钮上用富文本做标题

```js
const button = UIButton.buttonWithType('system');
button.setAttributedTitle(new NSAttributedString('空心字', {
  font: UIFont.boldSystemFontOfSize(22),
  strokeWidth: 3,
  strokeColor: 'systemIndigo',
}), { forState: ['normal'] });
```

**效果**（未在模拟器验证）：按钮上的字只有靛蓝色的轮廓，中间不填色。

某个状态设了富文本标题之后，这个状态下不再显示 `setTitle()` 给的文字，`setTitleColor()` 的颜色也不起作用。

### 量一段富文本要占多大

排成一行用 `size()`。限定宽度、让它折行，用 `boundingRectWithSize()`，并且 `options` 要带 `'usesLineFragmentOrigin'`。

```js
const text = new NSAttributedString('一段比较长的文字，一行放不下的时候会折行。', {
  font: UIFont.systemFontOfSize(17),
});
const oneLine = text.size();
const wrapped = text.boundingRectWithSize(
  new CGSize(200, Number.MAX_VALUE),
  { options: ['usesLineFragmentOrigin'] },
);
console.log(oneLine.width, Math.ceil(wrapped.height));
```

**效果**（未在模拟器验证）：控制台输出两个数。第一个是排成一行的宽度，第二个是限宽 200 pt 时需要的高度，都以 pt 为单位。

不限高度时把高度写成 `Number.MAX_VALUE`。量出来的数带小数，用作视图的大小时向上取整。

## 属性

写属性时用一个对象，键是属性的名字。读出来也是同样形状的对象，没有的属性不出现在里面。

| 名字 | 值 | 说明 |
| --- | --- | --- |
| `font` | [`UIFont`](ui-font.md) | 字体。不带时系统用 12 pt 的 Helvetica |
| `foregroundColor` | [颜色](ui-color.md) | 文字颜色。不带时是黑色 |
| `backgroundColor` | [颜色](ui-color.md) | 文字背后的底色。不带时没有底色 |
| `paragraphStyle` | `NSParagraphStyle` | 段落样式，见[段落样式](#nsparagraphstyle-和-nsmutableparagraphstyle) |
| `kern` | 数，[pt](units.md) | 字距调整。正数拉开，负数收紧 |
| `tracking` | 数，[pt](units.md) | 字间距。和 `kern` 的差别是它会关掉被拉断的连字 |
| `ligature` | 整数 | 连字（比如 fi 连成一个字形）。`1` 用字体默认的连字，`0` 不用 |
| `underlineStyle` | 线型名的数组 | 下划线，取值见[线型](#线型) |
| `underlineColor` | [颜色](ui-color.md) | 下划线的颜色。不带时和文字颜色相同 |
| `strikethroughStyle` | 线型名的数组 | 删除线，取值见[线型](#线型) |
| `strikethroughColor` | [颜色](ui-color.md) | 删除线的颜色。不带时和文字颜色相同 |
| `strokeWidth` | 数，字号的百分比 | 描边的粗细。`0` 不描边；正数只描边、不填充，得到空心字；负数既描边又填充。空心字常用 `3` |
| `strokeColor` | [颜色](ui-color.md) | 描边的颜色。不带时和文字颜色相同 |
| `shadow` | `NSShadow` | 阴影，见 [`NSShadow`](#nsshadow) |
| `baselineOffset` | 数，[pt](units.md) | 相对基线上移多少。负数是下移 |
| `link` | 字符串 | 链接的地址。写入时也收 [`URL`](url.md) 对象 |
| `attachment` | `NSTextAttachment` | 这个字符的位置上显示的附件 |

写属性时的规矩：

- **值是 `undefined` 的键视为没带。**
- **名字写错抛 `TypeError`**，报错里列出全部能用的名字：`NSAttributedString has no attribute "colour"; expected one of: font / paragraphStyle / …`
- **颜色写错不抛。** 认不出的颜色字符串打一条警告，这个键不生效，其他键照常。这和别处写颜色的规矩一样，见[颜色](ui-color.md)。颜色的值写 `null` 会抛：不要这个颜色就不带这个键。
- **数按数转。** `kern: '2'` 得到 2；转不成数的抛 `TypeError`。
- **字体、段落样式、阴影、附件必须是对应的类**，否则抛 `TypeError`，例如 `font must be a UIFont, got "Helvetica"`。

读出来的值：颜色是字符串；字体和附件是写进去的那个对象；段落样式和阴影是副本。

### 线型

`underlineStyle` 和 `strikethroughStyle` 的值是数组，三类各选至多一个：

| 取值 | 效果 |
| --- | --- |
| `'single'` | 一条细线 |
| `'thick'` | 一条粗线 |
| `'double'` | 两条细线 |
| `'patternDot'` | 点线 |
| `'patternDash'` | 虚线 |
| `'patternDashDot'` | 一划一点交替 |
| `'patternDashDotDot'` | 一划两点交替 |
| `'byWord'` | 只画在词的下面，空格下面不画 |

前三个是线型，中间四个是虚线的样式（不写是实线），最后一个可以和前面的任意组合。空数组 `[]` 表示不画线。

- 写了两个线型，或者两个虚线样式：`TypeError: underlineStyle takes at most one of single / thick / double`
- 写的不是数组：`TypeError: underlineStyle must be an array of style names, got "single"`
- 名字不认识：`TypeError: underlineStyle has no value "wavy"; expected one of: …`

## 成员说明

### `NSAttributedString`

#### 创建

| 写法 | 得到 |
| --- | --- |
| `new NSAttributedString()` | 没有文字的富文本 |
| `new NSAttributedString(string)` | 不带属性的文字 |
| `new NSAttributedString(string, attributes)` | 整段文字用同一组属性 |
| `new NSAttributedString(other)` | 照另一个富文本抄一份 |
| `NSAttributedString.attributedStringWithAttachment(attachment, { attributes })` | 只含一个附件的富文本，长度是 1。`attributes` 可以不给 |

- `string` 按字符串转：数字 `5` 得到 `'5'`，`null` 和 `undefined` 得到空串。
- `attributes` 给 `null` 等于没给。给的不是对象抛 `TypeError`。
- `attributedStringWithAttachment()` 的第一个参数不是 `NSTextAttachment` 时抛 `TypeError`。

这个类不能继承，`class X extends NSAttributedString` 在 `new X()` 时抛 `TypeError`，见[原生类](native-classes.md)。

#### 属性

| 属性 | 类型 | 可读 | 可写 | 说明 |
| --- | --- | --- | --- | --- |
| `string` | 字符串 | 是 | 否 | 不带属性的文字。附件的位置上是字符 `'￼'` |
| `length` | 整数，码元的个数 | 是 | 否 | 长度，和 `string.length` 相等 |

#### 读属性

| 方法 | 返回 |
| --- | --- |
| `attributesAtIndex(index)` | 第 `index` 个码元上的全部属性，一个对象 |
| `attribute(name, { atIndex })` | 第 `atIndex` 个码元上名叫 `name` 的属性，没有是 `null` |
| `enumerateAttributesInRange(range, callback)` | 无。把 `range` 里的文字按「属性相同的连续一段」切开，每一段调一次 `callback(attributes, range)` |

```js
const text = new NSMutableAttributedString('合计 ¥128');
text.addAttribute('kern', { value: 2, range: new NSRange(3, 4) });

text.attributesAtIndex(0);                    // {}
text.attributesAtIndex(3);                    // { kern: 2 }
text.attribute('kern', { atIndex: 3 });       // 2
text.attribute('font', { atIndex: 3 });       // null

text.enumerateAttributesInRange(new NSRange(0, text.length), (attributes, range) => {
  console.log(range.location, range.length, Object.keys(attributes).join(','));
});
```

**效果**：控制台输出两行，`0 3 ` 和 `3 4 kern`。

- `enumerateAttributesInRange()` 的回调是当场同步执行的，方法返回时已经全部调完，从前往后。没有中途停下的办法。回调里抛的异常原样传给调用方。
- 遍历的是调用那一刻的内容。回调里改这个富文本，不影响这一轮收到的段。
- **出错**：下标或范围越界、没给 `atIndex`、属性名不认识、没给回调，都抛 `TypeError`。

#### 取一段、比较、副本

| 方法 | 返回 | 说明 |
| --- | --- | --- |
| `attributedSubstringFromRange(range)` | `NSAttributedString` | 取出一段，属性跟着走 |
| `isEqualToAttributedString(other)` | 布尔 | 文字和每一处的属性都相同才是 `true` |
| `containsAttachmentsInRange(range)` | 布尔 | 这一段里有没有附件 |
| `copy()` | `NSAttributedString` | 一份内容相同、不可改的副本 |
| `mutableCopy()` | `NSMutableAttributedString` | 一份内容相同、可以改的副本。改副本不影响原来的 |

#### 量尺寸

| 方法 | 返回 | 说明 |
| --- | --- | --- |
| `size()` | [`CGSize`](structs.md)，pt | 排成一行需要多大 |
| `boundingRectWithSize(size, { options })` | [`CGRect`](structs.md)，pt | 限定在 `size` 里排需要多大 |

`options` 是数组，不给等于空数组：

| 取值 | 效果 |
| --- | --- |
| `'usesLineFragmentOrigin'` | 按多行排。量多行文字必须带它，不带时按一行算 |
| `'usesFontLeading'` | 行高算上字体自带的行间距 |
| `'usesDeviceMetrics'` | 按字形实际画出来的范围算，而不是排版用的范围 |
| `'truncatesLastVisibleLine'` | 放不下时最后一行按截断算 |

- **出错**：`size` 缺字段、`options` 不是数组、选项名不认识，都抛 `TypeError`。

### `NSMutableAttributedString`

`NSMutableAttributedString` 有 `NSAttributedString` 的全部成员，创建的写法也相同，另外多出下面这些修改的方法。它们都没有返回值；范围越界、缺必填的选项、参数类型不对时抛 `TypeError`。

| 方法 | 做什么 |
| --- | --- |
| `addAttribute(name, { value, range })` | 给 `range` 加一个属性。同名的被覆盖，其他属性不动 |
| `addAttributes(attributes, { range })` | 给 `range` 加一组属性。同名的被覆盖，其他属性不动 |
| `setAttributes(attributes, { range })` | 把 `range` 的属性**整个换成**这一组，原来的其他属性被去掉。`attributes` 给 `null` 是清空 |
| `removeAttribute(name, { range })` | 去掉 `range` 里的一个属性。本来没有也不报错 |
| `appendAttributedString(other)` | 把另一个富文本接在末尾 |
| `insertAttributedString(other, { atIndex })` | 插在第 `atIndex` 个码元前面。`atIndex` 等于长度时是接在末尾 |
| `replaceCharactersInRange(range, { withString })` | 把 `range` 里的文字换成字符串。新文字沿用被换掉那一段第一个字符的属性 |
| `replaceCharactersInRange(range, { withAttributedString })` | 把 `range` 里的文字换成另一个富文本，属性用它自己的 |
| `deleteCharactersInRange(range)` | 删掉 `range` 里的文字 |
| `setAttributedString(other)` | 把全部内容换成另一个富文本的内容 |

```js
const text = new NSMutableAttributedString('abc', { kern: 3 });
text.replaceCharactersInRange(new NSRange(1, 1), { withString: 'XYZ' });
text.string;                          // 'aXYZc'
text.insertAttributedString(new NSAttributedString('>'), { atIndex: 0 });
text.deleteCharactersInRange(new NSRange(0, 1));
```

报错的原文举例：

```
TypeError: addAttribute needs { range }
TypeError: addAttribute needs { value }
TypeError: replaceCharactersInRange needs { withString } or { withAttributedString }
TypeError: appendAttributedString needs an NSAttributedString, got "尾巴"
TypeError: insertAttributedString atIndex 99 is out of bounds; the string length is 10
```

### `NSParagraphStyle` 和 `NSMutableParagraphStyle`

`new NSParagraphStyle()` 和 `NSParagraphStyle.defaultParagraphStyle` 得到的都是默认样式，属性全部只读。要设值就建 `new NSMutableParagraphStyle()`，下表的属性在它上面都可写。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `alignment` | `'left'` \| `'center'` \| `'right'` \| `'justified'` \| `'natural'` | `'natural'` | 对齐。`'justified'` 是两端对齐，`'natural'` 按文字的书写方向 |
| `lineSpacing` | 数，[pt](units.md) | `0` | 行与行之间额外加的距离 |
| `paragraphSpacing` | 数，[pt](units.md) | `0` | 这一段结束后空出的距离 |
| `paragraphSpacingBefore` | 数，[pt](units.md) | `0` | 这一段开始前空出的距离 |
| `firstLineHeadIndent` | 数，[pt](units.md) | `0` | 第一行左边缩进多少 |
| `headIndent` | 数，[pt](units.md) | `0` | 第一行以外的各行左边缩进多少 |
| `tailIndent` | 数，[pt](units.md) | `0` | 行的右边界。正数从左边量起；`0` 或负数从右边量起，`-16` 是右边留 16 pt |
| `lineBreakMode` | [`NSLineBreakMode`](enums.md) | `'byWordWrapping'` | 一行放不下时怎么处理 |
| `minimumLineHeight` | 数，[pt](units.md) | `0` | 行高的下限。`0` 是不限 |
| `maximumLineHeight` | 数，[pt](units.md) | `0` | 行高的上限。`0` 是不限 |
| `lineHeightMultiple` | 数，倍数 | `0` | 行高是字体自然行高的几倍。`0` 是不调整 |
| `baseWritingDirection` | `'natural'` \| `'leftToRight'` \| `'rightToLeft'` | `'natural'` | 这一段从哪边开始排。`'natural'` 按文字内容判断 |
| `hyphenationFactor` | 数，0 到 1 | `0` | 断字的积极程度。`0` 不断字，`1` 尽量断 |
| `defaultTabInterval` | 数，[pt](units.md) | `0` | 制表符之间的默认间隔 |
| `allowsDefaultTighteningForTruncation` | 布尔 | `false`（**未在模拟器验证**） | `true` 时文字要被截断之前，系统先把字距收紧一点试试；`false` 时不收紧 |

在 `NSParagraphStyle` 上这些属性可读、不可写，写入抛 `TypeError`。在 `NSMutableParagraphStyle` 上可读、可写。

- 除 `tailIndent` 以外的长度和倍数不能是负数：`TypeError: lineSpacing must be a non-negative number`
- `hyphenationFactor` 超出范围：`TypeError: hyphenationFactor must be between 0 and 1`
- `alignment`、`lineBreakMode`、`baseWritingDirection` 写了表里没有的值时不抛异常：属性保持原来的值，控制台输出一条警告，警告里列出可选的值，比如 `[Nacre] alignment has no value "middle"; expected one of: left / center / right / justified / natural, ignored`。

| 方法 | 在哪个类上 | 返回 | 说明 |
| --- | --- | --- | --- |
| `copy()` | 两个都有 | `NSParagraphStyle` | 一份值相同、不可改的副本 |
| `mutableCopy()` | 两个都有 | `NSMutableParagraphStyle` | 一份值相同、可以改的副本 |
| `setParagraphStyle(other)` | `NSMutableParagraphStyle` | 无 | 把另一个段落样式的全部属性值抄过来 |

### `NSShadow`

用 `new NSShadow()` 创建，设好之后作为 `shadow` 属性放进富文本。

| 属性 | 类型 | 可读 | 可写 | 默认值 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `shadowOffset` | [`CGSize`](structs.md)，pt | 是 | 是 | `(0, 0)` | 阴影相对文字偏多少。`width` 为正是往右，`height` 为正是往下 |
| `shadowBlurRadius` | 数，[pt](units.md) | 是 | 是 | `0` | 模糊半径。`0` 是边缘清晰的阴影。不能是负数 |
| `shadowColor` | [颜色](ui-color.md)或 `null` | 是 | 是 | 三分之一不透明的黑色 | 阴影的颜色。`null` 是不画阴影 |

```js
const shadow = new NSShadow();
shadow.shadowOffset = new CGSize(0, 1);
shadow.shadowBlurRadius = 2;
shadow.shadowColor = 'rgba(0, 0, 0, 0.4)';
label.attributedText = new NSAttributedString('带阴影', { shadow });
```

**效果**（未在模拟器验证）：文字下方 1 pt 处有一层淡淡的、边缘模糊的黑色阴影。

### `NSTextAttachment`

| 写法 | 得到 |
| --- | --- |
| `NSTextAttachment.textAttachmentWithImage(image)` | 显示这张图片的附件。`image` 不是 [`UIImage`](ui-image.md) 时抛 `TypeError` |
| `new NSTextAttachment()` | 空的附件，之后设 `image` |

| 属性 | 类型 | 可读 | 可写 | 默认值 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `image` | [`UIImage`](ui-image.md) 或 `null` | 是 | 是 | `null` | 显示的图片 |
| `bounds` | [`CGRect`](structs.md)，pt | 是 | 是 | 全是 `0` | 图片画在哪、画多大。原点在文字的基线上，`y` 为负是往下移。全是 `0` 表示用图片自己的大小 |

附件要先变成富文本才能和文字拼在一起，见[文字里插一张图片](#文字里插一张图片)。

### 视图上的成员

| 成员 | 类型 | 可读 | 可写 | 说明 |
| --- | --- | --- | --- | --- |
| `UILabel.attributedText` | `NSAttributedString` 或 `null` | 是 | 是 | 带样式的文字。没有内容时是 `null` |
| `UITextField.attributedText` | `NSAttributedString` 或 `null` | 是 | 是 | 带样式的内容 |
| `UITextField.attributedPlaceholder` | `NSAttributedString` 或 `null` | 是 | 是 | 带样式的占位文字 |
| `UITextView.attributedText` | `NSAttributedString` 或 `null` | 是 | 是 | 带样式的内容。写 `null` 是清空 |
| `UIButton.currentAttributedTitle` | `NSAttributedString` 或 `null` | 是 | 否 | 当前状态下实际显示的带样式标题 |

`attributedText` 和 `text` 是同一份内容的两种读写方式。写了 `attributedText`，`text` 读出来是其中的纯文字。反过来，写过 `attributedText` 之后再写 `text`，三种视图不一样：

| 视图 | 再写 `text` 之后 |
| --- | --- |
| `UILabel` | 文字换成新的，**原来富文本里的样式留着**。比如原来带下划线，新文字也带下划线 |
| `UITextView` | 文字换成新的，原来的样式被去掉 |
| `UITextField` | 文字换成新的。原来的样式留不留着**未在模拟器验证** |

所以标签显示过富文本之后，要改内容就继续写 `attributedText`：赋一个新的富文本，内容和样式一起换掉。先写 `attributedText = null` 再写 `text` 能不能去掉样式，**未在模拟器验证**。

```js
label.attributedText = new NSAttributedString('促销', { underlineStyle: ['single'] });
label.text = '已结束';
const now = label.attributedText;
console.log(now === null ? 'null' : (now.attributesAtIndex(0).underlineStyle || []).join(','));
```

**效果**：控制台输出 `single`。标签上的字换成了「已结束」，下划线还在。

`attributedPlaceholder` 和 `placeholder` 也是同一份内容：写了其中一个，另一个读出来的文字跟着变。

代码写 `attributedText` 不派发 `input` 事件，和代码写 `text` 一样。

按钮按状态设置，写法和 [`setTitle()`](ui-button.md#文字颜色图片) 相同：

| 方法 | 说明 |
| --- | --- |
| `setAttributedTitle(title, { forState })` | 给这些状态设带样式的标题。`title` 给 `null` 是去掉，这个状态回到使用 `normal` 的 |
| `attributedTitleForState(state)` | 读这个状态用的带样式标题。参数是一个状态名 |

`attributedTitleForState()` 对没有单独设过的状态返回 `normal` 的那个，和 [`titleForState()`](ui-button.md#文字颜色图片) 一样。`normal` 也没设过时返回 `null`。

```js
button.setAttributedTitle(new NSAttributedString('提交'), { forState: ['normal'] });

button.attributedTitleForState('normal');     // 内容是「提交」的富文本
button.attributedTitleForState('disabled');   // 也是「提交」：没单独设过，返回 normal 的
```

读回来的是一份快照，和写进去的不一定是同一个对象，比较内容用 `isEqualToAttributedString()`。

- **出错**：
  - 写入的值不是富文本：`TypeError: attributedText needs a native object or null, got "纯文字"`
  - 写入的是别的原生对象：`TypeError: attributedText needs a NSAttributedString or null`
  - 没传 `forState`：`TypeError: setAttributedTitle needs { forState }`

## 与 iOS 原生写法的对照

| ObjC | JS |
| --- | --- |
| `[[NSAttributedString alloc] initWithString:@"x" attributes:@{NSFontAttributeName: font}]` | `new NSAttributedString('x', { font })` |
| `[[NSMutableAttributedString alloc] initWithAttributedString:other]` | `new NSMutableAttributedString(other)` |
| `NSForegroundColorAttributeName: UIColor.systemRedColor` | `foregroundColor: 'systemRed'` |
| `NSUnderlineStyleAttributeName: @(NSUnderlineStyleSingle \| NSUnderlineStylePatternDash)` | `underlineStyle: ['single', 'patternDash']` |
| `[text addAttribute:NSKernAttributeName value:@2 range:NSMakeRange(0, 3)]` | `text.addAttribute('kern', { value: 2, range: new NSRange(0, 3) })` |
| `[text setAttributes:attrs range:range]` | `text.setAttributes(attrs, { range })` |
| `[text removeAttribute:NSKernAttributeName range:range]` | `text.removeAttribute('kern', { range })` |
| `[text appendAttributedString:other]` | `text.appendAttributedString(other)` |
| `[text insertAttributedString:other atIndex:0]` | `text.insertAttributedString(other, { atIndex: 0 })` |
| `[text replaceCharactersInRange:range withString:@"x"]` | `text.replaceCharactersInRange(range, { withString: 'x' })` |
| `[text attributesAtIndex:0 effectiveRange:NULL]` | `text.attributesAtIndex(0)` |
| `[text attribute:NSFontAttributeName atIndex:0 effectiveRange:NULL]` | `text.attribute('font', { atIndex: 0 })` |
| `[text enumerateAttributesInRange:range options:0 usingBlock:^…]` | `text.enumerateAttributesInRange(range, (attributes, range) => { … })` |
| `[text boundingRectWithSize:size options:NSStringDrawingUsesLineFragmentOrigin context:nil]` | `text.boundingRectWithSize(size, { options: ['usesLineFragmentOrigin'] })` |
| `CGFLOAT_MAX` | `Number.MAX_VALUE` |
| `[NSTextAttachment textAttachmentWithImage:image]` | `NSTextAttachment.textAttachmentWithImage(image)` |
| `[NSAttributedString attributedStringWithAttachment:attachment]` | `NSAttributedString.attributedStringWithAttachment(attachment)` |
| `style.alignment = NSTextAlignmentCenter` | `style.alignment = 'center'` |
| `label.attributedText = text` | `label.attributedText = text` |
| `[button setAttributedTitle:text forState:UIControlStateNormal]` | `button.setAttributedTitle(text, { forState: ['normal'] })` |

## 还不能做的

| 想做的事 | 对应的原生能力 | 状态 |
| --- | --- | --- |
| 把 HTML 或 Markdown 转成富文本 | `initWithData:options:documentAttributes:error:`、`initWithMarkdown:…` | 未实现 |
| 自己控制文字怎么排、读每一行的位置 | TextKit：`NSLayoutManager`、`NSTextLayoutManager`、`NSTextStorage` | 未实现 |
| 点文本视图里的链接时得到通知、决定要不要打开 | `UITextViewDelegate` 的链接相关方法 | 未实现 |
| 设置输入框里接下来打的字用什么样式；改链接的样式 | `typingAttributes`、`defaultTextAttributes`、`linkTextAttributes` | 未实现 |
| 读一个属性连续生效的范围 | `attributesAtIndex:effectiveRange:` 的出参 | 用 `enumerateAttributesInRange()` 代替 |
| 遍历时中途停下、从后往前遍历、只遍历某一个属性 | `enumerateAttributesInRange:` 的 `stop` 和 `options`、`enumerateAttribute:inRange:…` | 未实现 |
| 放自己起名字的属性 | 任意字符串作键 | 未实现。写入时名字不认识会抛；读出时不认识的键不出现 |
| 倾斜、横向拉伸、竖排、凸版效果、文字高亮、书写方向覆盖 | `NSObliquenessAttributeName`、`NSExpansionAttributeName`、`NSVerticalGlyphFormAttributeName`、`NSTextEffectAttributeName`、`NSTextHighlightStyleAttributeName`、`NSWritingDirectionAttributeName` | 未实现。前三个系统已经标为将废弃 |
| 制表位、列表、按 CJK 规则断行的策略 | `tabStops`、`textLists`、`lineBreakStrategy` | 未实现 |
| 附件显示文件、显示一个视图；调附件左右的间距 | `initWithData:ofType:`、`NSTextAttachmentViewProvider`、`lineLayoutPadding` | 未实现 |
| 把富文本直接画到图片或图层上 | `drawAtPoint:`、`drawInRect:` | 未实现 |
| 改 `string` 而保留属性 | `mutableString` | 用 `replaceCharactersInRange()` 代替 |

## 参见

- [`UILabel`](ui-label.md)、[`UITextField`](ui-text-field.md)、[`UITextView`](ui-text-view.md)、[`UIButton`](ui-button.md)：显示富文本的四种视图
- [`UIFont`](ui-font.md)：`font` 属性的值
- [颜色](ui-color.md)：颜色怎么写，写错了会怎样
- [`UIImage`](ui-image.md)：附件里的图片
- [结构体](structs.md)：`CGSize`、`CGRect`
- [单位](units.md)
- [实现原理：富文本](../internals/attributed-string.md)
