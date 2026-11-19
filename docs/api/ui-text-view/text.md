---
type: reference
native: UITextView.text
---

# `UITextView`：`text` 属性

**`text`** 属性是多行输入里的全部内容。

## 值

字符串，换行是 `\n`。

- 可读，可写。
- 默认值是空字符串 `''`。没有内容时是 `''`，不是 `null`。
- 写 `null` 或 `undefined` 得到 `''`。
- 写完之后光标在内容的末尾（实测）。
- 用户的输入改变内容时派发 [`input`](input-event.md)。用代码写 `text` 不派发 `input`（实测）。所以写了 `text` 之后，依赖内容的界面要自己更新一次；在 `input` 的回调里写 `text` 也不会再次触发回调。
- 写过 [`attributedText`](attributedtext.md) 之后再写 `text`，原来的样式被去掉（实测）。

## 示例

```js
const input = new UITextView();
input.text = '第一行\n第二行';
console.log(input.text.length, input.hasText);
```

**结果**：输出 `7 true`。多行输入里显示两行字。

## 对应的 iOS API

`UITextView.text`。

## 参见

- [`insertText()`](inserttext.md)：按用户打字的方式改内容
- [`input`](input-event.md) 事件
