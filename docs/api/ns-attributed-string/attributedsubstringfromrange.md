---
type: reference
native: "-[NSAttributedString attributedSubstringFromRange:]"
---

# `NSAttributedString`：`attributedSubstringFromRange()` 方法

**`attributedSubstringFromRange()`** 方法取出一段，属性跟着走。

## 语法

```
attributedSubstringFromRange(range)
```

### 参数

**`range`**

要取的范围，[`NSRange`](../ns-attributed-string.md#范围怎么写) 或 `{ location, length }`。

### 返回值

新的 `NSAttributedString`，内容是这一段的文字和它们的属性。原来的富文本不变。

### 异常

**`TypeError`**

`range` 越界：`attributedSubstringFromRange range {8, 9} is out of bounds; the string length is 10`。

## 示例

```js
const text = new NSAttributedString('合计 ¥128', { kern: 2 });
const part = text.attributedSubstringFromRange(new NSRange(3, 4));
console.log(part.string, part.attribute('kern', { atIndex: 0 }));
```

**结果**：控制台输出 `¥128 2`。

## 对应的 iOS API

`-[NSAttributedString attributedSubstringFromRange:]`。

## 参见

- [范围怎么写](../ns-attributed-string.md#范围怎么写)
