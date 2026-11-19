---
type: reference
native: UITextField.selectedTextRange
---

# `UITextField`：`selectedRange` 属性

**`selectedRange`** 属性是输入框里选中的范围。没有选中文字时，它是光标的位置。

## 值

[`NSRange`](../ns-range.md)：`location` 是起点，`length` 是长度，单位是 UTF-16 码元，和 JS 字符串的下标相同。`length` 是 0 表示没有选中文字，只有一个光标。

- 可读，可写。
- 每次读出来是一个新的 `NSRange`，字段只读。
- 写入时可以给 `NSRange`，也可以给普通对象 `{ location, length }`。字段按整数转，小数向零取整。
- 输入框没有在输入时也能读写，写进去的读得回来（实测）。这时屏幕上看不到光标和选中的底色。
- 选区变了时派发 [`selectionchange`](selectionchange-event.md)。

不同情况下的值：

| 情况 | `selectedRange` |
| --- | --- |
| 新建的输入框，从没输入过 | `(0, 0)`。用代码写了 `text` 之后还是 `(0, 0)`，不会移到末尾 |
| 没有在输入时写 `(0, 3)` | 读回来是 `(0, 3)` |
| 正在输入 | 屏幕上光标的位置，或者选中的那一段 |

没有在输入时写下的选区，在输入框开始输入之后是否保留，以及输入结束之后选区停在哪里，**未在模拟器验证**，不要依赖。要控制用户看到的光标位置，在输入框开始输入之后写：在 `becomeFirstResponder()` 返回 `true` 之后，或者在 `focus` 的回调里。

写入的范围超出内容时不抛错（实测，正在输入时）：

| 内容是 10 个码元时写入 | 读回来 |
| --- | --- |
| `(100, 5)`：起点超出 | `(10, 0)`，光标在末尾 |
| `(2, 100)`：长度超出 | `(2, 0)`，起点不变，长度变成 0 |

所以全选要写 `new NSRange(0, field.text.length)`，不能给一个很大的长度。

把光标放在一个表情的两个码元中间不会抛错，也不会被纠正，见[选区和光标](../ui-text-field.md#选区和光标)。

### 写错时

- 缺字段：`TypeError: selectedRange is missing length, or it is not a finite number`
- 不是对象，包括 `null`：`TypeError: selectedRange needs an object with all of: location, length`
- 负数：`TypeError: selectedRange.location must be a non-negative integer`

抛错之后选区不变。

## 示例

### 读出选中的文字

```js
const field = new UITextField();
field.text = 'hello world';
field.selectedRange = new NSRange(0, 5);

const range = field.selectedRange;
console.log(range.location, range.length);
console.log(field.text.slice(range.location, range.location + range.length));
```

**结果**：输出 `0 5` 和 `hello`。

### 把光标放到末尾

```js
const field = new UITextField();
field.text = 'hello';
field.selectedRange = { location: field.text.length, length: 0 };
```

**效果**：光标在 `hello` 后面。屏幕上只有在输入框正在输入时才看得到光标。

## 对应的 iOS API

`UITextField.selectedTextRange`，再用 `offsetFromPosition:toPosition:` 换成偏移。JS 里直接是从内容开头数的 `NSRange`，没有 `UITextRange` 和 `UITextPosition`。

## 参见

- [`selectionchange`](selectionchange-event.md) 事件
- [`NSRange`](../ns-range.md)
- [`UITextView` 的 `selectedRange`](../ui-text-view/selectedrange.md)：写法相同
