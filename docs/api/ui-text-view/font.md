---
type: reference
native: UITextView.font
---

# `UITextView`：`font` 属性

**`font`** 属性是文字的字体。

## 值

[`UIFont`](../ui-font.md)，或者 `null`。

- 可读，可写。
- 默认值是 `null`，表示没有设。这时用系统的默认字体，文字比系统标准的 17 pt 正文小：实测一行字时多行输入想要的高度是 30 pt，设成 17 pt 的字之后是 36 pt。
- 写 `null` 是撤回到没有设的状态。
- 新建的多行输入一定要设它。
- 没有变化事件：改它的只有 App 自己的代码。

## 示例

```js
const input = new UITextView();
input.font = UIFont.systemFontOfSize(17);
```

**效果**：文字是 17 pt 的系统字体。

## 对应的 iOS API

`UITextView.font`。

## 参见

- [`UIFont`](../ui-font.md)
