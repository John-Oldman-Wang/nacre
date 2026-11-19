---
type: reference
web: TextDecoder.ignoreBOM
---

# `TextDecoder`：`ignoreBOM` 属性

**`ignoreBOM`** 属性表示是否保留开头的 [BOM](../text-decoder.md#bom)。

## 值

布尔，创建时给的 `ignoreBOM`，默认 `false`。

- `true`：保留开头的 BOM，解出来的字符串以 U+FEFF 开头。
- `false`：去掉开头的一个 BOM。

- 只读。给它赋值抛 `TypeError`。
- 创建之后不会变，所以没有变化通知。

## 示例

```js
console.log(new TextDecoder('utf-8', { ignoreBOM: true }).ignoreBOM);
```

**结果**：输出 `true`。**未在模拟器验证。**

## 和 Web 的差别

和 Web 相同。

## 参见

- [`TextDecoder()`](constructor.md)
