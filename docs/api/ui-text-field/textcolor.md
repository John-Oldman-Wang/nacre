---
type: reference
native: UITextField.textColor
---

# `UITextField`：`textColor` 属性

**`textColor`** 属性是框里文字的颜色。

## 值

[颜色](../ui-color.md)字符串。

- 可读，可写。写入时可以是颜色字符串、`UIColor` 对象或 `null`，读出来是字符串。
- 默认值**未在模拟器验证**。
- 没有变化事件：改它的只有 App 自己的代码。

### 写错时

写入不认识的颜色字符串：不抛异常，控制台输出一条警告，保留原来的颜色，见[颜色](../ui-color.md#写错不抛打警告)。

## 示例

```js
const field = new UITextField();
field.textColor = 'systemBlue';
```

**效果**：框里的文字是蓝色。**未在模拟器验证。**

## 对应的 iOS API

`UITextField.textColor`。`UIColor.labelColor` 写成 `'label'`，见[颜色](../ui-color.md)。

## 参见

- [颜色](../ui-color.md)
- [`font`](font.md)
