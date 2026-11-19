---
type: reference
web: TextEncoder.encoding
---

# `TextEncoder`：`encoding` 属性

**`encoding`** 属性是编码器使用的编码。

## 值

字符串，总是 `'utf-8'`。

- 只读。给它赋值抛 `TypeError`。
- 它不会变，所以没有变化通知。

## 示例

```js
console.log(new TextEncoder().encoding);
```

**结果**：输出 `utf-8`。**未在模拟器验证。**

## 和 Web 的差别

和 Web 相同。

## 参见

- [`TextDecoder.encoding`](../text-decoder/encoding.md)
