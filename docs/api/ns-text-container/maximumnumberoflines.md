---
type: reference
native: NSTextContainer.maximumNumberOfLines
---

# `NSTextContainer`：`maximumNumberOfLines` 属性

**`maximumNumberOfLines`** 属性是最多排几行。

## 值

非负整数，是行数。

- 可读，可写。
- 默认值是 `0`，表示不限。
- 超出的行不显示，`text` 本身不会被截掉。
- 给小数向零取整。
- 实测六行 17 pt 的字，不限行数时多行输入想要的高度是 138 pt，限成两行之后是 57 pt。要它变矮，同时把 `isScrollEnabled` 设成 `false`。
- 没有变化事件：改它的只有 App 自己的代码。

### 写错时

负数：抛 `TypeError: maximumNumberOfLines must be a non-negative integer`。

## 示例

```js
const input = new UITextView();
input.isScrollEnabled = false;
input.textContainer.maximumNumberOfLines = 3;
input.textContainer.lineBreakMode = 'byTruncatingTail';
```

**效果**：只排出前三行，第三行排不下时以省略号结尾。**省略号未在模拟器验证。**

## 对应的 iOS API

`NSTextContainer.maximumNumberOfLines`。

## 参见

- [`lineBreakMode`](linebreakmode.md)
