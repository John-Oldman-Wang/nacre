---
type: reference
native: UITextView.secureTextEntry
---

# `UITextView`：`isSecureTextEntry` 属性

**`isSecureTextEntry`** 属性表示是否按密码的方式输入。

## 值

布尔。

| 取值 | 效果 |
| --- | --- |
| `true` | 按密码的方式输入 |
| `false` | 正常输入 |

- 可读，可写。
- 默认值是 `false`。
- 写别的类型的值时按真假转成布尔：`0` 是 `false`，`'false'` 是 `true`。
- 取值的效果**未在模拟器验证**。验收用例验证的是：能写入并读回，写错时属性保持原值并输出一条警告。
- 没有变化事件：改它的只有 App 自己的代码。

## 示例

```js
const input = new UITextView();
input.isSecureTextEntry = true;
```

**效果**：按密码的方式输入。画面上的样子**未在模拟器验证**。

## 对应的 iOS API

`UITextView.secureTextEntry`（getter 是 `isSecureTextEntry`）。

## 参见

- [`UITextField` 的 `isSecureTextEntry`](../ui-text-field/issecuretextentry.md)：单行输入框上的同名属性
