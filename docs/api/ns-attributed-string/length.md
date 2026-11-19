---
type: reference
native: NSAttributedString.length
---

# `NSAttributedString`：`length` 属性

**`length`** 属性是富文本的长度。

## 值

整数，UTF-16 码元的个数，和 `string.length` 相等。一个表情符号占两个，一个附件占一个。

- 只读。给它赋值抛 `TypeError`。
- 范围和下标都按这个单位算，见[范围怎么写](../ns-attributed-string.md#范围怎么写)。

## 示例

```js
const text = new NSAttributedString('合计 ¥128');
console.log(text.length, text.length === text.string.length);
```

**结果**：控制台输出 `7 true`。

## 对应的 iOS API

`NSAttributedString.length`。

## 参见

- [`string`](string.md)
