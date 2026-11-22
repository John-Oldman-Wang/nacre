---
type: reference
native: UITextBeforeInputEvent.replacementString
---

# `UITextBeforeInputEvent`：`replacementString` 属性

**`replacementString`** 属性是要换上去的文字。

## 值

字符串。

- 只读。给它赋值抛 `TypeError`。
- 打字时是打的那个字。
- 删除时是空串。
- 粘贴时是整段粘贴的内容。
- 多行输入里按回车换行时是 `'\n'`。
- 用 [`new`](constructor.md) 创建时没给，是 空串。

## 示例

```js
const code = new UITextField();
code.addEventListener('beforeinput', (e) => {
  if (!/^[0-9]*$/.test(e.replacementString)) {
    e.preventDefault();
  }
});
```

**效果**：`code` 里只能输入数字，打字母或粘贴带字母的内容没有反应。**未在模拟器验证。**

## 对应的 iOS API

`textField:shouldChangeCharactersInRange:replacementString:` 的 `string`、`textView:shouldChangeTextInRange:replacementText:` 的 `text`。

## 参见

- [`UITextBeforeInputEvent`](../ui-text-before-input-event.md)
