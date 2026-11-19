---
type: reference
native: UITextField.secureTextEntry
---

# `UITextField`：`isSecureTextEntry` 属性

**`isSecureTextEntry`** 属性表示是否把内容显示成圆点，用于密码。

## 值

布尔。

| 取值 | 效果 |
| --- | --- |
| `true` | 打的每个字显示成圆点。`text` 读到的仍然是真实内容 |
| `false` | 正常显示 |

- 可读，可写。
- 默认值是 `false`。
- 可以随时改，用来做「显示密码」的开关。
- 显示成圆点**未在模拟器验证**。
- 写别的类型的值时按真假转成布尔：`0` 是 `false`，`'false'` 是 `true`。
- 没有变化事件：改它的只有 App 自己的代码。

## 示例

```js
const field = new UITextField();
field.isSecureTextEntry = true;
field.textContentType = 'password';
```

**效果**：打的每个字显示成圆点。**未在模拟器验证。**

## 对应的 iOS API

`UITextField.secureTextEntry`（getter 是 `isSecureTextEntry`）。

## 参见

- [`textContentType`](textcontenttype.md)
