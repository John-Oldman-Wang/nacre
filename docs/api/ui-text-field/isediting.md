---
type: reference
native: UITextField.editing
---

# `UITextField`：`isEditing` 属性

**`isEditing`** 属性表示输入框是否正在输入。

## 值

布尔。

| 取值 | 含义 |
| --- | --- |
| `true` | 正在输入：输入框是 first responder |
| `false` | 没有在输入 |

- 只读。给它赋值抛 `TypeError`。
- 新建的输入框是 `false`。
- 变成 `true` 时派发 `focus`，变成 `false` 时派发 `blur`。
- 在 `sceneconnect` 的回调里直接调 `becomeFirstResponder()` 时，它是 `true`，但不派发 `focus`（实测）。

## 示例

```js
const field = new UITextField();
field.addEventListener('focus', () => console.log(field.isEditing));
field.addEventListener('blur', () => console.log(field.isEditing));
```

**效果**：输入框开始输入时输出 `true`，结束输入时输出 `false`。

## 对应的 iOS API

`UITextField.editing`（getter 是 `isEditing`）。

## 参见

- [焦点](../ui-text-field.md#焦点)
