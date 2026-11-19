---
type: reference
native: NSParagraphStyle
status: partial
---

# `NSParagraphStyle`

**`NSParagraphStyle`** 表示一组段落样式：对齐、行距、段距、缩进、换行方式。它作为 `paragraphStyle` 属性放进[富文本](ns-attributed-string.md)，对它覆盖到的整个段落生效。一个段落是两个换行符之间的文字。

`NSParagraphStyle` 的属性全部只读。要设值，建一个 [`NSMutableParagraphStyle`](ns-mutable-paragraph-style.md)，或者调 [`mutableCopy()`](ns-paragraph-style/mutablecopy.md)。

段落样式放进富文本时，放的是当时的一份副本。之后再改那个 `NSMutableParagraphStyle`，已经建好的富文本不变。从富文本读回来的段落样式也是副本。

`NSParagraphStyle` 不派发事件，它的值不会变，所以没有变化通知。

**继承关系**：`EventTarget` → `NSObject` → `NSParagraphStyle`

调行距和对齐的写法见指南[显示带样式的文字](../guides/attributed-text.md)。

## 构造函数

[`NSParagraphStyle()`](ns-paragraph-style/constructor.md)

创建一个默认样式，和 `NSParagraphStyle.defaultParagraphStyle` 的值相同。

## 静态属性

[`NSParagraphStyle.defaultParagraphStyle`](ns-paragraph-style/defaultparagraphstyle.md) <small>只读</small>

系统的默认段落样式。

## 实例属性

还继承 `NSObject` 的属性。全部只读，给它们赋值抛 `TypeError`。

| 属性 | 说明 |
| --- | --- |
| [`alignment`](ns-paragraph-style/alignment.md) <small>只读</small> | 对齐 |
| [`lineSpacing`](ns-paragraph-style/linespacing.md) <small>只读</small> | 行与行之间额外加的距离 |
| [`paragraphSpacing`](ns-paragraph-style/paragraphspacing.md) <small>只读</small> | 这一段结束后空出的距离 |
| [`paragraphSpacingBefore`](ns-paragraph-style/paragraphspacingbefore.md) <small>只读</small> | 这一段开始前空出的距离 |
| [`firstLineHeadIndent`](ns-paragraph-style/firstlineheadindent.md) <small>只读</small> | 第一行左边缩进多少 |
| [`headIndent`](ns-paragraph-style/headindent.md) <small>只读</small> | 第一行以外的各行左边缩进多少 |
| [`tailIndent`](ns-paragraph-style/tailindent.md) <small>只读</small> | 行的右边界 |
| [`lineBreakMode`](ns-paragraph-style/linebreakmode.md) <small>只读</small> | 一行放不下时怎么处理 |
| [`minimumLineHeight`](ns-paragraph-style/minimumlineheight.md) <small>只读</small> | 行高的下限 |
| [`maximumLineHeight`](ns-paragraph-style/maximumlineheight.md) <small>只读</small> | 行高的上限 |
| [`lineHeightMultiple`](ns-paragraph-style/lineheightmultiple.md) <small>只读</small> | 行高是字体自然行高的几倍 |
| [`baseWritingDirection`](ns-paragraph-style/basewritingdirection.md) <small>只读</small> | 这一段从哪边开始排 |
| [`hyphenationFactor`](ns-paragraph-style/hyphenationfactor.md) <small>只读</small> | 断字的积极程度 |
| [`defaultTabInterval`](ns-paragraph-style/defaulttabinterval.md) <small>只读</small> | 制表符之间的默认间隔 |
| [`allowsDefaultTighteningForTruncation`](ns-paragraph-style/allowsdefaulttighteningfortruncation.md) <small>只读</small> | 截断之前是否先收紧字距 |

## 实例方法

| 方法 | 说明 |
| --- | --- |
| [`copy()`](ns-paragraph-style/copy.md) | 一份值相同、不可改的副本 |
| [`mutableCopy()`](ns-paragraph-style/mutablecopy.md) | 一份值相同、可以改的副本 |

## 示例

```js
const style = NSParagraphStyle.defaultParagraphStyle;
console.log(style.alignment, style.lineSpacing, style.lineBreakMode);
```

**结果**：控制台输出 `natural 0 byWordWrapping`。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `NSParagraphStyle.defaultParagraphStyle` | `NSParagraphStyle.defaultParagraphStyle` |
| `style.alignment = NSTextAlignmentCenter` | `style.alignment = 'center'`（在 `NSMutableParagraphStyle` 上） |
| `[style mutableCopy]` | `style.mutableCopy()` |

## 参见

- [`NSMutableParagraphStyle`](ns-mutable-paragraph-style.md)：可以改的段落样式
- [`NSAttributedString`](ns-attributed-string.md)：`paragraphStyle` 属性
- [显示带样式的文字](../guides/attributed-text.md)
