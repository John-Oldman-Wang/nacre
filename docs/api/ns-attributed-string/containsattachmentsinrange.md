---
type: reference
native: "-[NSAttributedString containsAttachmentsInRange:]"
---

# `NSAttributedString`：`containsAttachmentsInRange()` 方法

**`containsAttachmentsInRange()`** 方法判断一段文字里有没有附件。

## 语法

```
containsAttachmentsInRange(range)
```

### 参数

**`range`**

要检查的范围，[`NSRange`](../ns-attributed-string.md#范围怎么写) 或 `{ location, length }`。

### 返回值

布尔。这一段里有附件是 `true`，否则是 `false`。

### 异常

**`TypeError`**

`range` 越界：`containsAttachmentsInRange range {8, 9} is out of bounds; the string length is 10`。

## 示例

```js
const text = new NSMutableAttributedString('评分 ');
text.appendAttributedString(NSAttributedString.attributedStringWithAttachment(new NSTextAttachment()));
console.log(text.containsAttachmentsInRange(new NSRange(0, 3)));
console.log(text.containsAttachmentsInRange(new NSRange(0, text.length)));
```

**结果**：依次输出 `false` 和 `true`。**未在模拟器验证。**

## 对应的 iOS API

`-[NSAttributedString containsAttachmentsInRange:]`。

## 参见

- [`NSTextAttachment`](../ns-text-attachment.md)
