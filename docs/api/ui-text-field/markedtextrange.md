---
type: reference
native: UITextField.markedTextRange
---

# `UITextField`：`markedTextRange` 属性

**`markedTextRange`** 属性是输入框里输入法正在组字的那一段。没有在组字时，它是 `null`。

组字是用拼音这类输入法打字时、用户还没选字的阶段：比如打「你」时先敲出 `ni`，这时 `ni` 已经在输入框的内容里，系统在它下面画一条下划线，等用户从候选里选字。选完字之后，这一段换成选中的字，组字结束。

## 值

[`NSRange`](../ns-range.md) 或 `null`。

正在组字时是 `NSRange`：`location` 是组字那一段的起点，`length` 是它的长度，单位是 UTF-16 码元，从内容开头数，和 [`selectedRange`](selectedrange.md) 相同。所以 `field.text.slice(location, location + length)` 就是还没选字的那段拼音。

没有在组字时是 `null`。输入框没有在输入时也是 `null`。

- 只读。给它赋值抛 `TypeError`。
- 每次读出来是一个新的 `NSRange`。
- 组字中的文字算在 [`text`](text.md) 里：敲出 `ni` 时，`text` 是 `'ni'`。
- 组字的每一步都派发 [`input`](../ui-control/input-event.md)，在回调里读它就知道这一次是不是还在组字。

不同情况下的值（实测）：

| 情况 | `markedTextRange` |
| --- | --- |
| 没有在输入 | `null` |
| 空的输入框里敲出 `ni` | `(0, 2)`，`text` 是 `'ni'` |
| 接着敲出 `nih` | `(0, 3)` |
| 敲出 `ni` 之后派发的 `input` 的回调里 | `(0, 2)` |
| 组字结束之后 | `null` |

上表是用代码照输入法的做法模拟组字测出来的，**未用真实的输入法验证**。

## 示例

### 边打边搜时跳过组字中的输入

```js
const field = new UITextField();
field.placeholder = '搜索';

/** @param {string} query */
function search(query) {
  console.log('搜索：', query);
}

field.addEventListener('input', () => {
  if (field.markedTextRange !== null) {
    return;
  }
  search(field.text);
});
```

**效果**：用拼音打「你好」时，敲出 `n`、`ni`、`nih` 这些还没选字的输入不触发搜索；选完字、内容变成「你好」时输出 `搜索： 你好`。用英文键盘打字时，每个字符触发一次搜索。**未用真实的键盘和输入法验证。**

### 读出还没选字的拼音

```js
const field = new UITextField();
field.addEventListener('input', () => {
  const range = field.markedTextRange;
  if (range !== null) {
    console.log(field.text.slice(range.location, range.location + range.length));
  }
});
```

**效果**：组字中每敲一个字母，输出一次当前还没选字的那段拼音，比如 `ni`、`nih`。**未用真实的输入法验证。**

## 对应的 iOS API

`UITextField.markedTextRange`（`UITextInput` 协议的属性）。ObjC 里它是 `UITextRange`，要用 `offsetFromPosition:toPosition:` 换成偏移；JS 里直接是从内容开头数的 `NSRange`，没在组字时是 `null`（ObjC 里是 `nil`）。

## 参见

- [`selectedRange`](selectedrange.md)：选中的范围，表示方法相同
- [`input`](../ui-control/input-event.md) 事件
- [`NSRange`](../ns-range.md)
- [`UITextView` 的 `markedTextRange`](../ui-text-view/markedtextrange.md)：写法相同
