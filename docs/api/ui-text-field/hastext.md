---
type: reference
native: UITextField.hasText
---

# `UITextField`：`hasText` 属性

**`hasText`** 属性表示输入框里有没有内容。

## 值

布尔。

| 取值 | 含义 |
| --- | --- |
| `true` | 有内容 |
| `false` | 内容是空的 |

- 只读。给它赋值抛 `TypeError`。
- 默认值是 `false`。
- 没有单独的变化通知，在 `input` 的回调里读。
- 和 [`UITextView`](../ui-text-view.md) 上的同名属性写法相同。

## 示例

```js
const field = new UITextField();
field.text = 'a';
console.log(field.hasText);
```

**结果**：输出 `true`。

## 对应的 iOS API

`UITextField.hasText`（`UIKeyInput` 协议）。

## 参见

- [`text`](text.md)
