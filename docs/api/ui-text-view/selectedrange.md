---
type: reference
native: UITextView.selectedRange
---

# `UITextView`：`selectedRange` 属性

**`selectedRange`** 属性是多行输入里选中的范围。没有选中文字时，它是光标的位置。

## 值

[`NSRange`](../ns-range.md)：`location` 是起点，`length` 是长度，单位是 UTF-16 码元，和 JS 字符串的下标相同。`length` 是 0 表示没有选中文字，只有一个光标。

- 可读，可写。
- 默认值是 `(0, 0)`。
- 每次读出来是一个新的 `NSRange`。
- 写入时可以给 `NSRange`，也可以给普通对象 `{ location, length }`。
- 没有在输入时也能读写，不需要先聚焦。
- 写 [`text`](text.md) 之后光标在末尾（实测）。
- 选区变了时派发 [`selectionchange`](selectionchange-event.md)。
- 选中的范围在屏幕上显示成什么样**未在模拟器验证**。

写入超出内容的范围不抛错（实测，内容是 10 个字符时）：

| 写入 | 读回来 |
| --- | --- |
| `(100, 5)`：起点超出 | `(10, 0)`，光标在末尾 |
| `(2, 100)`：长度超出 | `(2, 0)`，起点不变，长度变成 0 |

### 写错时

- 缺字段：`TypeError: selectedRange is missing length, or it is not a finite number`
- 不是对象：`TypeError: selectedRange needs an object with all of: location, length`
- 负数：`TypeError: selectedRange.location must be a non-negative integer`

## 示例

```js
const input = new UITextView();
input.text = 'hello world';
input.selectedRange = new NSRange(0, 5);
const range = input.selectedRange;
console.log(input.text.slice(range.location, range.location + range.length));
input.selectedRange = new NSRange(0, input.text.length);
```

**结果**：输出 `hello`。最后一行全选。

## 对应的 iOS API

`UITextView.selectedRange`。`NSMakeRange(0, 5)` 写成 `new NSRange(0, 5)`。

## 参见

- [`NSRange`](../ns-range.md)
- [`selectionchange`](selectionchange-event.md) 事件
- [`UITextField` 的 `selectedRange`](../ui-text-field/selectedrange.md)：写法相同
