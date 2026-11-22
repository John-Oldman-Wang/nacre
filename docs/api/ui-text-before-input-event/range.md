---
type: reference
native: UITextBeforeInputEvent.range
---

# `UITextBeforeInputEvent`：`range` 属性

**`range`** 属性是要被换掉的那一段。

## 值

[`NSRange`](../ns-range.md)。`location` 是起点，`length` 是长度，单位都是 UTF-16 码元，和 JS 字符串的下标一致。

- 只读。给它赋值抛 `TypeError`。
- 插入时 `length` 是 0。
- 删除时 `length` 是被删掉的长度。
- 选中一段之后粘贴时，是选中的那一段。
- 用 [`new`](constructor.md) 创建时没给，是 `null`。

## 示例

```js
const field = new UITextField();
field.addEventListener('beforeinput', (e) => {
  const next = field.text.slice(0, e.range.location) + e.replacementString +
    field.text.slice(e.range.location + e.range.length);
  console.log('改完会是', next);
});
```

**效果**：每次输入前，输出修改之后的内容。只有真实的键盘输入会派发，**未在模拟器验证**。

## 对应的 iOS API

`textField:shouldChangeCharactersInRange:replacementString:`、`textView:shouldChangeTextInRange:replacementText:` 的参数 `range`。

## 参见

- [`UITextBeforeInputEvent`](../ui-text-before-input-event.md)
