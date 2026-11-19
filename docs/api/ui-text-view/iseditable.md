---
type: reference
native: UITextView.editable
---

# `UITextView`：`isEditable` 属性

**`isEditable`** 属性表示用户能不能修改内容。

## 值

布尔。

| 取值 | 效果 |
| --- | --- |
| `true` | 用户可以修改内容 |
| `false` | 用户不能修改，点它不弹键盘。仍然可以长按选中文字并拷贝，内容超过高度时可以滚动。**未在模拟器验证** |

- 可读，可写。
- 默认值是 `true`。
- 只限制用户。代码写 `text`、调 `insertText()` 和 `deleteBackward()` 照样改得动（实测）。
- 和 [`isSelectable`](isselectable.md) 互相带动：写 `isEditable = true`，`isSelectable` 也变成 `true`；写 `isEditable = false`，`isSelectable` 不变（实测）。
- 是 `false` 时，`becomeFirstResponder()` 仍然返回 `true`，但不派发 `focus`，失焦时也不派发 `blur`（实测，量的时候没有键盘）。
- 写别的类型的值时按真假转成布尔：`0` 是 `false`，`'false'` 是 `true`。
- 没有变化事件：改它的只有 App 自己的代码。

## 示例

```js
const input = new UITextView();
input.isEditable = false;
input.text = '很长的一段说明文字……';
console.log(input.isSelectable);
```

**效果**：控制台输出 `true`。用户点它不会弹出键盘，但可以选中文字。**未在模拟器验证。**

## 对应的 iOS API

`UITextView.editable`（getter 是 `isEditable`）。

## 参见

- [`isSelectable`](isselectable.md)
