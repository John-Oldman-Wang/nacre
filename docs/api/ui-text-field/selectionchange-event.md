---
type: reference
native: "UITextFieldDelegate textFieldDidChangeSelection:"
---

# `UITextField`：`selectionchange` 事件

**`selectionchange`** 事件在输入框的选区或者光标的位置变了时派发。

## 语法

```
field.addEventListener('selectionchange', (event) => { })
```

## 事件对象

`Event`。`type` 是 `'selectionchange'`，`target` 是这个输入框。事件对象不带选区，在回调里读 [`selectedRange`](selectedrange.md)。不能取消，`event.cancelable` 是 `false`。

## 什么时候派发

| 什么引起的 | 派发吗 |
| --- | --- |
| 用户点了一下把光标移到别处、拖动选区、双击选中一个词 | 派发。**未在模拟器验证** |
| 用户打字、删除（光标跟着动了） | 派发。**未在模拟器验证** |
| 输入框正在输入时，代码写 `selectedRange` | 派发（实测） |
| 输入框没有在输入时，代码写 `selectedRange` | **未在模拟器验证**，不要依赖它派发或者不派发 |
| 输入框开始输入、结束输入、代码写 `text` | **未在模拟器验证**，不要依赖它派发或者不派发 |

- 回调不是在选区变化的那一刻同步执行，而是稍后执行，见[回调的执行时机](../ui-control.md#回调的执行时机)。回调里读到的是执行那一刻的选区，不是事件发生那一刻的。
- 选区连着变了几次时，回调可能执行几次，每次读到的都是最新的选区。
- 没有监听器时没有开销。

## 示例

```js
const field = new UITextField();
field.addEventListener('selectionchange', (event) => {
  const range = field.selectedRange;
  console.log(event.type, event.target === field, range.location, range.length);
});
```

**效果**：选区每变一次输出一行，前两项是 `selectionchange` 和 `true`。

## 对应的 iOS API

`UITextFieldDelegate` 的 `textFieldDidChangeSelection:`。

## 参见

- [`selectedRange`](selectedrange.md)
- [`UITextView` 的 `selectionchange`](../ui-text-view/selectionchange-event.md)
