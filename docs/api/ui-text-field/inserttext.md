---
type: reference
native: "-[UITextField insertText:]"
---

# `UITextField`：`insertText()` 方法

**`insertText()`** 方法按用户打字的方式插入一段文字：插在光标的位置（[`selectedRange`](selectedrange.md)）；有选中的文字时，换掉选中的部分。光标移到插入的内容后面。

## 语法

```
insertText(text)
```

### 参数

**`text`**

要插入的文字，字符串。别的类型按 `String()` 转，`null` 和 `undefined` 当作空字符串。

### 返回值

无（`undefined`）。

### 异常

无。

## 说明

- 派发一次 `input`。不派发 `beforeinput`：那个事件只问用户的输入。
- 输入框没有在输入时也能调，插在 `selectedRange` 的位置。从没输入过的输入框 `selectedRange` 是 `(0, 0)`，所以插在开头；要插在末尾，先把 `selectedRange` 写成 `new NSRange(field.text.length, 0)`。
- 和 [`UITextView`](../ui-text-view/inserttext.md) 上的同名方法写法相同。

和直接写 `text` 的区别：

| | `field.text = …` | `insertText()` / `deleteBackward()` |
| --- | --- | --- |
| 改哪里 | 整个内容换掉 | 只改光标或选区那一处 |
| 派发 `input` | 不派发 | 派发 |
| 派发 `beforeinput` | 不派发 | 不派发 |

上面几条里 `insertText()` 的行为**未在模拟器验证**。

## 示例

```js
const field = new UITextField();
field.text = '你好';
field.selectedRange = new NSRange(field.text.length, 0);
field.insertText('，世界');
console.log(field.text);
```

**结果**：输出 `你好，世界`。**未在模拟器验证**；验收用例里有对应的断言，它们写完之后还没有运行过。

## 对应的 iOS API

`-[UITextField insertText:]`（`UIKeyInput` 协议）。

## 参见

- [`deleteBackward()`](deletebackward.md)
- [`text`](text.md)：整个换掉内容
