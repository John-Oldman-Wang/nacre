---
type: reference
native: "UITextFieldDelegate textField:shouldChangeCharactersInRange:replacementString:"
---

# `UITextField`：`beforeinput` 事件

**`beforeinput`** 事件在用户的输入即将改变内容时派发：按键、删除、粘贴。监听器里调 `preventDefault()`，这次修改不发生。

## 语法

```
field.addEventListener('beforeinput', (event) => { })
```

## 事件对象

`UITextFieldBeforeInputEvent`。`type` 是 `'beforeinput'`，`target` 是这个输入框。可以取消。

另外带两个只读字段，描述这次修改打算把哪一段换成什么：

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| `range` | [`NSRange`](../ns-range.md) | 要被换掉的那一段。`location` 是起点，`length` 是长度，单位都是 UTF-16 码元，和 JS 字符串的下标一致 |
| `replacementString` | 字符串 | 要换上去的文字 |

三种修改各是什么样（来自 Apple 的文档，**未在模拟器验证**）：

| 用户的操作 | `range.length` | `replacementString` |
| --- | --- | --- |
| 在光标处打一个字 | 0 | 打的那个字 |
| 按删除键删掉一个字 | 被删掉的长度 | 空串 |
| 选中一段之后粘贴 | 选中那一段的长度 | 粘贴的全部内容 |

修改之后的内容是 `field.text.slice(0, range.location) + replacementString + field.text.slice(range.location + range.length)`。

## 什么时候派发

- 用户的每次修改之前派发。监听器执行完，系统才决定这次修改做不做，所以被拦下的字符不会先显示出来。
- 调了 `preventDefault()`：内容不变。
- 用代码写 `text`、调 `insertText()` 和 `deleteBackward()` 都不派发。后两个**未在模拟器验证**。
- 只有真实的键盘输入会触发，自动跑的验收触发不了，**未在模拟器验证**。
- 用拼音这类输入法时，还没选字的拼音字母也是一次次修改。这时它怎么派发**未在模拟器验证**，拦截它可能打断输入。
- 监听器是当场执行的。系统派发事件之后等监听器全部执行完，再决定做不做。
- 同一个事件有多个监听器时，只要有一个调了 `preventDefault()`，系统就不做。
- 监听器里抛出异常时，同一事件的其他监听器照常执行。异常在 [`application`](../application.md#没处理的异常不会让-app-退出) 上派发 `error`。抛异常不等于 `preventDefault()`。
- 最后一个监听器移除之后，系统不再派发这个事件。
- 在 `UITextField` 和 [`UITextView`](../ui-text-view/beforeinput-event.md) 上有。在别的控件上监听不报错，但系统不会派发。

> **注意**：监听器执行期间系统在等。在监听器里只做判断，不做耗时的事。

## 示例

### 限制长度

```js
const field = new UITextField();
field.addEventListener('beforeinput', (event) => {
  const { range, replacementString } = event;
  const next = field.text.slice(0, range.location) + replacementString +
    field.text.slice(range.location + range.length);
  if (next.length > 6) {
    event.preventDefault();
  }
});
```

**效果**：输入框里已有 6 个字符时，再按键没有反应。粘贴一段会让总长超过 6 的文字，整段都不进去。删除照常。**未在模拟器验证。**

### 只允许数字

```js
const field = new UITextField();
field.addEventListener('beforeinput', (event) => {
  if (/[^0-9]/.test(event.replacementString)) {
    event.preventDefault();
  }
});
```

**效果**：按数字键照常输入，按别的键没有反应。粘贴的内容里只要有一个不是数字的字符，整段都不进去。**未在模拟器验证。**

## 对应的 iOS API

`UITextFieldDelegate` 的 `textField:shouldChangeCharactersInRange:replacementString:` 返回 `NO`，对应这里调 `event.preventDefault()`。两个参数在 `event.range` 和 `event.replacementString`。

## 参见

- [限制输入长度或过滤字符](../../guides/text-fields.md#限制输入长度或过滤字符)
- [`NSRange`](../ns-range.md)
