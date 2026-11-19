---
type: reference
native: UITextField.clearsOnBeginEditing
---

# `UITextField`：`clearsOnBeginEditing` 属性

**`clearsOnBeginEditing`** 属性表示每次开始输入时是否清空原有内容。

## 值

布尔。

| 取值 | 效果 |
| --- | --- |
| `true` | 每次开始输入时清空原有内容 |
| `false` | 保留原有内容 |

- 可读，可写。
- 默认值是 `false`。**未在模拟器验证。**
- 两种取值的效果**未在模拟器验证**。
- 写别的类型的值时按真假转成布尔：`0` 是 `false`，`'false'` 是 `true`。
- 没有变化事件：改它的只有 App 自己的代码。

## 示例

```js
const field = new UITextField();
field.clearsOnBeginEditing = true;
```

**效果**：用户每次点输入框开始输入时，原来的内容被清空。**未在模拟器验证。**

## 对应的 iOS API

`UITextField.clearsOnBeginEditing`。

## 参见

- [`clearsOnInsertion`](clearsoninsertion.md)
