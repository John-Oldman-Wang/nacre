---
type: reference
native: "-[NSAttributedString enumerateAttributesInRange:options:usingBlock:]"
---

# `NSAttributedString`：`enumerateAttributesInRange()` 方法

**`enumerateAttributesInRange()`** 方法把一段文字按「属性相同的连续一段」切开，每一段调一次回调。

## 语法

```
enumerateAttributesInRange(range, callback)
```

### 参数

**`range`**

要遍历的范围，[`NSRange`](../ns-attributed-string.md#范围怎么写) 或 `{ location, length }`。

**`callback`**

函数 `callback(attributes, range)`。`attributes` 是这一段的全部属性，形状和 [`attributesAtIndex()`](attributesatindex.md) 读出来的相同；`range` 是这一段的范围，一个 `NSRange`。

### 返回值

无（`undefined`）。

- 回调是当场同步执行的，方法返回时已经全部调完，从前往后。
- 没有中途停下的办法。
- 遍历的是调用那一刻的内容。回调里改这个富文本，不影响这一轮收到的段。
- 回调里抛的异常原样传给调用方。

### 异常

**`TypeError`**

- `range` 越界：`enumerateAttributesInRange range {8, 9} is out of bounds; the string length is 10`。
- 没给回调：`enumerateAttributesInRange needs a callback function, got …`。

## 示例

```js
const text = new NSMutableAttributedString('合计 ¥128');
text.addAttribute('kern', { value: 2, range: new NSRange(3, 4) });
text.enumerateAttributesInRange(new NSRange(0, text.length), (attributes, range) => {
  console.log(range.location, range.length, Object.keys(attributes).join(','));
});
```

**结果**：控制台输出两行，`0 3 ` 和 `3 4 kern`。

## 对应的 iOS API

`-[NSAttributedString enumerateAttributesInRange:options:usingBlock:]`。`options`（倒序遍历等）和 block 的 `stop` 出参没有提供。

## 参见

- [`attributesAtIndex()`](attributesatindex.md)
