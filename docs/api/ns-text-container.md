---
type: reference
native: NSTextContainer
---

# `NSTextContainer`

**`NSTextContainer`** 表示 [`UITextView`](ui-text-view.md) 里文字排版的区域：每行左右空多少、最多排几行、一行排不下时怎么处理。

每个多行输入自带一个，从 [`textContainer`](ui-text-view/textcontainer.md) 得到，每次读得到同一个对象。改它的属性，多行输入里的排版跟着变。

**继承关系**：`EventTarget` → `NSObject` → `NSTextContainer`

## 构造函数

不能用 `new` 创建。`new NSTextContainer()` 抛 `TypeError: Illegal constructor: NSTextContainer is created by the runtime, not by new`。从 `UITextView` 的 `textContainer` 拿到它。

## 实例属性

| 属性 | 说明 |
| --- | --- |
| [`lineFragmentPadding`](ns-text-container/linefragmentpadding.md) | 每一行左右各空出多少 |
| [`maximumNumberOfLines`](ns-text-container/maximumnumberoflines.md) | 最多排几行 |
| [`lineBreakMode`](ns-text-container/linebreakmode.md) | 一行排不下时怎么处理 |

## 文字离边多远

文字到多行输入左右两边的距离由两个值相加得到：`UITextView` 的 [`textContainerInset`](ui-text-view/textcontainerinset.md) 的左、右，加上 `lineFragmentPadding`。默认值是 0 加 5，所以新建的多行输入文字离左边 5 pt。上下的距离只由 `textContainerInset` 决定，默认上下各 8 pt。

## 示例

### 最多显示三行

```js
const input = new UITextView();
input.isScrollEnabled = false;
input.isEditable = false;
input.textContainer.maximumNumberOfLines = 3;
input.textContainer.lineBreakMode = 'byTruncatingTail';
```

**效果**：只排出前三行，第三行排不下时以省略号结尾（**省略号未在模拟器验证**）。`text` 里的内容不变，只是多出来的不显示。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `textView.textContainer` | `input.textContainer` |
| `container.lineFragmentPadding = 0` | `container.lineFragmentPadding = 0` |
| `container.maximumNumberOfLines = 3` | `container.maximumNumberOfLines = 3` |
| `container.lineBreakMode = NSLineBreakByTruncatingTail` | `container.lineBreakMode = 'byTruncatingTail'` |

## 还不能做的

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 自己建文字排版的区域，分栏排版 | `NSTextContainer` 的初始化方法、`NSLayoutManager` |
| 让文字绕开一块区域 | `exclusionPaths` |

## 参见

- [`UITextView`](ui-text-view.md)
- [做一个多行输入框](../guides/multiline-text.md)
