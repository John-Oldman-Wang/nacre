---
type: reference
native: NSAttributedString
status: partial
---

# `NSAttributedString`

**`NSAttributedString`** 表示一段带样式的文字，称为富文本：一个字符串，加上每一段上的一组[属性](#富文本的属性)。属性规定这一段用什么字体、什么颜色、有没有下划线、字距多大。同一个字符串里不同的段可以有不同的属性，所以一行文字里可以混用几种字号和颜色。

`NSAttributedString` 建好之后内容不能改。要给某一段加属性、拼接、换文字，用它的子类 [`NSMutableAttributedString`](ns-mutable-attributed-string.md)。

富文本自己不显示。把它交给标签、输入框、按钮，由它们显示：

| 显示在哪 | 写法 |
| --- | --- |
| [`UILabel`](ui-label.md) | [`label.attributedText = text`](ui-label/attributedtext.md) |
| [`UITextField`](ui-text-field.md) | `field.attributedText = text`、`field.attributedPlaceholder = text` |
| [`UITextView`](ui-text-view.md) | `textView.attributedText = text` |
| [`UIButton`](ui-button.md) | [`button.setAttributedTitle(text, { forState: ['normal'] })`](ui-button/setattributedtitle.md) |

和富文本一起用的几个类：

| 类 | 是什么 |
| --- | --- |
| [`NSMutableAttributedString`](ns-mutable-attributed-string.md) | 可以改的富文本 |
| [`NSParagraphStyle`](ns-paragraph-style.md) | 段落样式：对齐、行距、段距、缩进。属性只读 |
| [`NSMutableParagraphStyle`](ns-mutable-paragraph-style.md) | 可以改的段落样式 |
| [`NSShadow`](ns-shadow.md) | 文字的阴影 |
| [`NSTextAttachment`](ns-text-attachment.md) | 附件：在一个字符的位置上显示一张图片 |

> **注意**：这一组类的读写行为（建富文本、读写属性、改内容、量尺寸、四种视图上的读写）在模拟器的验收里运行过（iPhone Air，iOS 27.2）。**屏幕上显示成什么样没有核对**：各处「效果」里标着未在模拟器验证的，说的都是画面，依据是 Apple 的头文件和文档。

`NSAttributedString` 不派发事件。它的内容不会变，所以没有变化通知。

**继承关系**：`EventTarget` → `NSObject` → `NSAttributedString`

怎么用富文本做混排的价格、下划线、行距、图文混排，见指南[显示带样式的文字](../guides/attributed-text.md)。

## 构造函数

[`NSAttributedString()`](ns-attributed-string/constructor.md)

创建一段富文本：空的、不带属性的文字、整段用同一组属性的文字，或者照另一个富文本抄一份。

## 静态方法

[`NSAttributedString.attributedStringWithAttachment()`](ns-attributed-string/attributedstringwithattachment.md)

创建一个只含一个附件的富文本，长度是 1。用来把图片插进文字里。

## 实例属性

还继承 `NSObject` 的属性。

| 属性 | 说明 |
| --- | --- |
| [`string`](ns-attributed-string/string.md) <small>只读</small> | 不带属性的文字 |
| [`length`](ns-attributed-string/length.md) <small>只读</small> | 长度，UTF-16 码元的个数 |

## 实例方法

还继承 `NSObject` 的方法。

读属性：

| 方法 | 说明 |
| --- | --- |
| [`attributesAtIndex()`](ns-attributed-string/attributesatindex.md) | 某个位置上的全部属性 |
| [`attribute()`](ns-attributed-string/attribute.md) | 某个位置上的一个属性 |
| [`enumerateAttributesInRange()`](ns-attributed-string/enumerateattributesinrange.md) | 按「属性相同的连续一段」逐段遍历 |

取一段、比较：

| 方法 | 说明 |
| --- | --- |
| [`attributedSubstringFromRange()`](ns-attributed-string/attributedsubstringfromrange.md) | 取出一段，属性跟着走 |
| [`isEqualToAttributedString()`](ns-attributed-string/isequaltoattributedstring.md) | 文字和每一处的属性是否都相同 |
| [`containsAttachmentsInRange()`](ns-attributed-string/containsattachmentsinrange.md) | 一段里有没有附件 |

量尺寸：

| 方法 | 说明 |
| --- | --- |
| [`size()`](ns-attributed-string/size.md) | 排成一行需要多大 |
| [`boundingRectWithSize()`](ns-attributed-string/boundingrectwithsize.md) | 限定在一个大小里排需要多大 |

副本：

| 方法 | 说明 |
| --- | --- |
| [`copy()`](ns-attributed-string/copy.md) | 一份内容相同、不可改的副本 |
| [`mutableCopy()`](ns-attributed-string/mutablecopy.md) | 一份内容相同、可以改的副本 |

## 范围怎么写

给某一段加属性时要说明是哪一段，用 [`NSRange`](ui-text-view/selectedrange.md)：从第几个位置开始、多长。位置和长度的单位是 UTF-16 码元，和 JS 字符串的下标是同一个单位，所以 `'合计 ¥128'.indexOf('¥')` 得到的数可以直接用。一个表情符号占两个。

```js
const a = new NSRange(3, 4);              // 从下标 3 开始的 4 个码元
const b = { location: 3, length: 4 };     // 写入时也收这种普通对象
```

范围超出文字的长度时抛 `TypeError`，报错里带着范围和文字的长度：

```
TypeError: addAttributes range {8, 9} is out of bounds; the string length is 10
```

## 交出去之后再改，界面不会跟着变

视图拿走的是**赋值那一刻的内容**。之后再改同一个 `NSMutableAttributedString`，视图上显示的不变，要重新赋值一次。

段落样式和阴影也是这样：放进富文本的是当时的一份副本，之后再改那个 `NSMutableParagraphStyle` 或 `NSShadow`，已经建好的富文本不变。

从视图上读回来的富文本（比如 [`label.attributedText`](ui-label/attributedtext.md)）是一份不可改的快照，每次读可能是不同的对象。比较两个富文本的内容用 [`isEqualToAttributedString()`](ns-attributed-string/isequaltoattributedstring.md)，不要用 `===`。

## 富文本的属性

写属性时用一个对象，键是属性的名字。读出来也是同样形状的对象，没有的属性不出现在里面。

| 名字 | 值 | 说明 |
| --- | --- | --- |
| `font` | [`UIFont`](ui-font.md) | 字体。不带时系统用 12 pt 的 Helvetica |
| `foregroundColor` | [颜色](ui-color.md) | 文字颜色。不带时是黑色 |
| `backgroundColor` | [颜色](ui-color.md) | 文字背后的底色。不带时没有底色 |
| `paragraphStyle` | [`NSParagraphStyle`](ns-paragraph-style.md) | 段落样式，见 [`NSParagraphStyle`](ns-paragraph-style.md) |
| `kern` | 数，[pt](units.md) | 字距调整。正数拉开，负数收紧 |
| `tracking` | 数，[pt](units.md) | 字间距。和 `kern` 的差别是它会关掉被拉断的连字 |
| `ligature` | 整数 | 连字（比如 fi 连成一个字形）。`1` 用字体默认的连字，`0` 不用 |
| `underlineStyle` | 线型名的数组 | 下划线，取值见[线型](#线型) |
| `underlineColor` | [颜色](ui-color.md) | 下划线的颜色。不带时和文字颜色相同 |
| `strikethroughStyle` | 线型名的数组 | 删除线，取值见[线型](#线型) |
| `strikethroughColor` | [颜色](ui-color.md) | 删除线的颜色。不带时和文字颜色相同 |
| `strokeWidth` | 数，字号的百分比 | 描边的粗细。`0` 不描边；正数只描边、不填充，得到空心字；负数既描边又填充。空心字常用 `3` |
| `strokeColor` | [颜色](ui-color.md) | 描边的颜色。不带时和文字颜色相同 |
| `shadow` | [`NSShadow`](ns-shadow.md) | 阴影 |
| `baselineOffset` | 数，[pt](units.md) | 相对基线上移多少。负数是下移 |
| `link` | 字符串 | 链接的地址。写入时也收 [`URL`](url.md) 对象 |
| `attachment` | [`NSTextAttachment`](ns-text-attachment.md) | 这个字符的位置上显示的附件 |

写属性时的规矩：

- **值是 `undefined` 的键视为没带。**
- **名字写错抛 `TypeError`**，报错里列出全部能用的名字：`NSAttributedString has no attribute "colour"; expected one of: font / paragraphStyle / …`
- **颜色写错不抛。** 认不出的颜色字符串打一条警告，这个键不生效，其他键照常。这和别处写颜色的规矩一样，见 [`UIColor`](ui-color.md)。颜色的值写 `null` 会抛：不要这个颜色就不带这个键。
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

## 示例

### 一行价格

从空白 App 开始，在屏幕上显示一行价格：前面是普通的小字，价格是红色大字，原价是灰色带删除线。

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

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

  const label = new UILabel();
  label.attributedText = text;

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

更多写法见指南[显示带样式的文字](../guides/attributed-text.md)。

## 对应的 iOS API

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

## 参见

- [显示带样式的文字](../guides/attributed-text.md)：一段加样式、下划线、行距、图文混排、量尺寸
- [`NSMutableAttributedString`](ns-mutable-attributed-string.md)：可以改的富文本
- [`UILabel`](ui-label.md)、[`UITextField`](ui-text-field.md)、[`UITextView`](ui-text-view.md)、[`UIButton`](ui-button.md)：显示富文本的四种视图
- [`UIFont`](ui-font.md)：`font` 属性的值
- [`UIColor`](ui-color.md)：颜色怎么写，写错了会怎样
- [结构体](structs.md)：`CGSize`、`CGRect`
- [单位](units.md)
