---
type: reference
native: UILayoutGuide.identifier
---

# `UILayoutGuide`：`identifier` 属性

**`identifier`** 属性是给 layout guide 起的名字，只用于调试时辨认。

## 值

字符串。

- 可读，可写。
- 默认值**未在模拟器验证**。
- 写入 `null` 或 `undefined` 得到 `''`，其他值转成字符串。和约束的 [`identifier`](../auto-layout/identifier.md) 不同，它不会是 `null`。

## 示例

```js
const spacer = new UILayoutGuide();
spacer.identifier = 'spacer';
console.log(spacer.identifier);
```

**结果**：输出 `spacer`。

## 对应的 iOS API

`UILayoutGuide.identifier`。

## 参见

- [`NSLayoutConstraint.identifier`](../auto-layout/identifier.md)
