---
type: reference
native: UITextField.adjustsFontSizeToFitWidth
---

# `UITextField`：`adjustsFontSizeToFitWidth` 属性

**`adjustsFontSizeToFitWidth`** 属性表示内容比框宽时是否缩小字号。

## 值

布尔。

| 取值 | 效果 |
| --- | --- |
| `true` | 内容比框宽时缩小字号，最小到 [`minimumFontSize`](minimumfontsize.md) |
| `false` | 字号不变，内容超出时横向滚动 |

- 可读，可写。
- 默认值是 `false`。**未在模拟器验证。**
- 两种取值的效果**未在模拟器验证**。
- 写别的类型的值时按真假转成布尔：`0` 是 `false`，`'false'` 是 `true`。
- 没有变化事件：改它的只有 App 自己的代码。

## 示例

```js
const field = new UITextField();
field.adjustsFontSizeToFitWidth = true;
field.minimumFontSize = 12;
```

**效果**：内容放不下时字号逐渐缩小，最小到 12 pt。**未在模拟器验证。**

## 对应的 iOS API

`UITextField.adjustsFontSizeToFitWidth`。

## 参见

- [`minimumFontSize`](minimumfontsize.md)
