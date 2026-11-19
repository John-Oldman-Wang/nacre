---
type: reference
native: NSMutableParagraphStyle
status: partial
---

# `NSMutableParagraphStyle`

**`NSMutableParagraphStyle`** 表示一组可以改的段落样式。它有 [`NSParagraphStyle`](ns-paragraph-style.md) 的全部属性，在它上面都可写。设好之后作为 `paragraphStyle` 属性放进[富文本](ns-attributed-string.md)。

放进富文本的是当时的一份副本：之后再改这个对象，已经建好的富文本不变。所以先把样式设好，再建富文本，最后交给视图。

`NSMutableParagraphStyle` 不派发事件。它的值只会被 App 自己的代码修改，所以没有变化通知。

**继承关系**：`EventTarget` → `NSObject` → [`NSParagraphStyle`](ns-paragraph-style.md) → `NSMutableParagraphStyle`

调行距和对齐的写法见指南[显示带样式的文字](../guides/attributed-text.md)。

## 构造函数

[`NSMutableParagraphStyle()`](ns-mutable-paragraph-style/constructor.md)

创建一个可以改的段落样式，属性都是默认值。

## 实例属性

全部可读、可写。默认值和 [`NSParagraphStyle`](ns-paragraph-style.md) 的默认样式相同。

| 属性 | 说明 |
| --- | --- |
| [`alignment`](ns-mutable-paragraph-style/alignment.md) | 对齐 |
| [`lineSpacing`](ns-mutable-paragraph-style/linespacing.md) | 行与行之间额外加的距离 |
| [`paragraphSpacing`](ns-mutable-paragraph-style/paragraphspacing.md) | 这一段结束后空出的距离 |
| [`paragraphSpacingBefore`](ns-mutable-paragraph-style/paragraphspacingbefore.md) | 这一段开始前空出的距离 |
| [`firstLineHeadIndent`](ns-mutable-paragraph-style/firstlineheadindent.md) | 第一行左边缩进多少 |
| [`headIndent`](ns-mutable-paragraph-style/headindent.md) | 第一行以外的各行左边缩进多少 |
| [`tailIndent`](ns-mutable-paragraph-style/tailindent.md) | 行的右边界 |
| [`lineBreakMode`](ns-mutable-paragraph-style/linebreakmode.md) | 一行放不下时怎么处理 |
| [`minimumLineHeight`](ns-mutable-paragraph-style/minimumlineheight.md) | 行高的下限 |
| [`maximumLineHeight`](ns-mutable-paragraph-style/maximumlineheight.md) | 行高的上限 |
| [`lineHeightMultiple`](ns-mutable-paragraph-style/lineheightmultiple.md) | 行高是字体自然行高的几倍 |
| [`baseWritingDirection`](ns-mutable-paragraph-style/basewritingdirection.md) | 这一段从哪边开始排 |
| [`hyphenationFactor`](ns-mutable-paragraph-style/hyphenationfactor.md) | 断字的积极程度 |
| [`defaultTabInterval`](ns-mutable-paragraph-style/defaulttabinterval.md) | 制表符之间的默认间隔 |
| [`allowsDefaultTighteningForTruncation`](ns-mutable-paragraph-style/allowsdefaulttighteningfortruncation.md) | 截断之前是否先收紧字距 |

写错时的规则：

- 除 `tailIndent` 以外的长度和倍数不能是负数：`TypeError: lineSpacing must be a non-negative number`。
- `hyphenationFactor` 超出范围：`TypeError: hyphenationFactor must be between 0 and 1`。
- `alignment`、`lineBreakMode`、`baseWritingDirection` 写了表里没有的值时不抛异常：属性保持原来的值，控制台输出一条警告，警告里列出可选的值。

## 实例方法

还继承 [`NSParagraphStyle`](ns-paragraph-style.md) 的 `copy()` 和 `mutableCopy()`。

| 方法 | 说明 |
| --- | --- |
| [`setParagraphStyle()`](ns-mutable-paragraph-style/setparagraphstyle.md) | 把另一个段落样式的全部属性值抄过来 |

## 示例

### 居中、加大行距

```js
const style = new NSMutableParagraphStyle();
style.alignment = 'center';
style.lineSpacing = 8;

const label = new UILabel();
label.numberOfLines = 0;
label.attributedText = new NSAttributedString('第一行\n第二行', {
  font: UIFont.systemFontOfSize(17),
  paragraphStyle: style,
});
```

**效果**（未在模拟器验证）：两行文字居中，两行之间比平常多空 8 pt。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[[NSMutableParagraphStyle alloc] init]` | `new NSMutableParagraphStyle()` |
| `style.alignment = NSTextAlignmentCenter` | `style.alignment = 'center'` |
| `style.lineBreakMode = NSLineBreakByTruncatingTail` | `style.lineBreakMode = 'byTruncatingTail'` |
| `[style setParagraphStyle:other]` | `style.setParagraphStyle(other)` |

## 参见

- [`NSParagraphStyle`](ns-paragraph-style.md)
- [`NSAttributedString`](ns-attributed-string.md)：`paragraphStyle` 属性
- [显示带样式的文字](../guides/attributed-text.md)
