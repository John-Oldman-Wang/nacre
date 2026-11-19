---
type: reference
native: UITextView.selectable
---

# `UITextView`：`isSelectable` 属性

**`isSelectable`** 属性表示用户能不能选中文字。

## 值

布尔。

| 取值 | 效果 |
| --- | --- |
| `true` | 用户可以选中文字 |
| `false` | 不能选中 |

- 可读，可写。
- 默认值是 `true`。
- 和 [`isEditable`](iseditable.md) 互相带动（实测）：

| 写入 | 另一个属性 |
| --- | --- |
| `isSelectable = false` | `isEditable` 也变成 `false` |
| `isSelectable = true` | `isEditable` 不变，不会自己变回 `true` |
| `isEditable = true` | `isSelectable` 也变成 `true` |
| `isEditable = false` | `isSelectable` 不变 |

所以要「能选中但不能编辑」，只写 `isEditable = false`。

- 写别的类型的值时按真假转成布尔：`0` 是 `false`，`'false'` 是 `true`。
- 没有变化事件：改它的只有 App 自己的代码。

## 示例

```js
const input = new UITextView();
input.isSelectable = false;
console.log(input.isEditable);
```

**结果**：输出 `false`。

## 对应的 iOS API

`UITextView.selectable`（getter 是 `isSelectable`）。

## 参见

- [`isEditable`](iseditable.md)
