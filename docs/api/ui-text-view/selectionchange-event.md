---
type: reference
native: "UITextViewDelegate textViewDidChangeSelection:"
---

# `UITextView`：`selectionchange` 事件

**`selectionchange`** 事件在多行输入的选区或者光标的位置变了时派发。

## 语法

```
input.addEventListener('selectionchange', (event) => { })
```

## 事件对象

`Event`。`type` 是 `'selectionchange'`，`target` 是这块多行输入。事件对象不带选区，读 [`selectedRange`](selectedrange.md)。不能取消，`event.cancelable` 是 `false`。

## 什么时候派发

| 什么引起的 | 派发吗 |
| --- | --- |
| 用户点了一下把光标移到别处、拖动选区、双击选中一个词 | 派发。**未在模拟器验证** |
| 用户打字、删除（光标跟着动了） | 派发。**未在模拟器验证** |
| 代码调 `insertText()`（光标移到插入的内容后面） | 派发（实测） |
| 代码写 `selectedRange` | 派发，没有在输入时也一样（实测） |
| 代码写 `text`（写完光标在末尾） | **未在模拟器验证**，不要依赖它派发或者不派发 |

- 回调稍后执行，读到的是执行那一刻的选区，不是事件发生那一刻的。
- 选区连着变了几次时，回调可能执行几次，每次读到的都是最新的选区。
- 没有监听器时没有开销。

## 示例

```js
const input = new UITextView();
input.text = 'hello world';
input.addEventListener('selectionchange', (event) => {
  console.log(event.type, event.target === input, String(input.selectedRange));
});
input.selectedRange = new NSRange(2, 3);
```

**结果**：输出 `selectionchange true NSRange(2, 3)`。

## 对应的 iOS API

`UITextViewDelegate` 的 `textViewDidChangeSelection:`。

## 参见

- [`selectedRange`](selectedrange.md)
- [`UITextField` 的 `selectionchange`](../ui-text-field/selectionchange-event.md)
