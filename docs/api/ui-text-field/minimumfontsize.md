---
type: reference
native: UITextField.minimumFontSize
---

# `UITextField`：`minimumFontSize` 属性

**`minimumFontSize`** 属性是 [`adjustsFontSizeToFitWidth`](adjustsfontsizetofitwidth.md) 为 `true` 时允许缩到的最小字号。

## 值

数，单位是 [pt](../units.md)。

- 可读，可写。
- 默认值是 `0`。**未在模拟器验证。**
- `adjustsFontSizeToFitWidth` 是 `false` 时不起作用。
- 没有变化事件：改它的只有 App 自己的代码。

## 示例

```js
const field = new UITextField();
field.adjustsFontSizeToFitWidth = true;
field.minimumFontSize = 12;
console.log(field.minimumFontSize);
```

**效果**：控制台输出 `12`。

## 对应的 iOS API

`UITextField.minimumFontSize`。

## 参见

- [`adjustsFontSizeToFitWidth`](adjustsfontsizetofitwidth.md)
