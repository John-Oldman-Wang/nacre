---
type: reference
native: "UITextViewDelegate textView:shouldChangeTextInRange:replacementText:"
---

# `UITextView`：`beforeinput` 事件

**`beforeinput`** 事件在用户的输入即将改变多行输入的内容时派发：按键、换行、删除、粘贴。监听器里调 `preventDefault()`，这次修改不发生。

## 语法

```
input.addEventListener('beforeinput', (event) => { })
```

## 事件对象

[`UITextBeforeInputEvent`](../ui-text-before-input-event.md)，单行和多行输入框共用。`type` 是 `'beforeinput'`，`target` 是这块多行输入。可以取消（实测）。

另外带两个只读字段，描述这次修改打算把哪一段换成什么（实测）：

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| [`range`](../ui-text-before-input-event/range.md) | [`NSRange`](../ns-range.md) | 要被换掉的那一段。`location` 是起点，`length` 是长度，单位都是 UTF-16 码元，和 JS 字符串的下标一致 |
| [`replacementString`](../ui-text-before-input-event/replacementstring.md) | 字符串 | 要换上去的文字 |

几种修改各是什么样（来自 Apple 的文档，**未在真机验证**）：

| 用户的操作 | `range.length` | `replacementString` |
| --- | --- | --- |
| 在光标处打一个字 | 0 | 打的那个字 |
| 按回车换行 | 0 | `'\n'` |
| 按删除键删掉一个字 | 被删掉的长度 | 空串 |
| 选中一段之后粘贴 | 选中那一段的长度 | 粘贴的全部内容 |

修改之后的内容是 `input.text.slice(0, range.location) + replacementString + input.text.slice(range.location + range.length)`。

## 什么时候派发

- 用户的每次修改之前派发。监听器执行完，系统才决定这次修改做不做，所以被拦下的字符不会先显示出来。
- 调了 `preventDefault()`：内容不变。
- 没有调：照常修改，随后派发 [`input`](input-event.md)。
- 系统来问时监听器得到的字段、调不调 `preventDefault()` 交回给系统的答案，验收用例按系统的问法验过。真实的键盘输入**未在真机验证**。
- 用代码写 `text`、调 `insertText()` 和 `deleteBackward()` 都不派发。**未在真机验证。**
- 用拼音这类输入法时，还没选字的拼音字母也是一次次修改。这时它怎么派发**未在真机验证**，拦截它可能打断输入。
- 监听器是当场执行的。系统派发事件之后等监听器全部执行完，再决定做不做。
- 同一个事件有多个监听器时，只要有一个调了 `preventDefault()`，系统就不做。
- 监听器里抛出异常时，同一事件的其他监听器照常执行。异常在 [`application`](../application.md#没处理的异常不会让-app-退出) 上派发 `error`。抛异常不等于 `preventDefault()`。
- 最后一个监听器移除之后，系统不再派发这个事件，修改照常发生（实测）。
- 和滚动视图的事件可以同时监听，滚动事件照常派发（实测）。
- 在 `UITextView` 和 [`UITextField`](../ui-text-field/beforeinput-event.md) 上有。在别的视图上监听不报错，它被当成自定义事件，只有自己用 `dispatchEvent()` 派发时才会触发。

> **注意**：监听器执行期间系统在等。在监听器里只做判断，不做耗时的事。

## 示例

### 限制长度

```js
const input = new UITextView();
const LIMIT = 200;
input.addEventListener('beforeinput', (event) => {
  const { range, replacementString } = event;
  const next = input.text.slice(0, range.location) + replacementString +
    input.text.slice(range.location + range.length);
  if (next.length > LIMIT) {
    event.preventDefault();
  }
});
```

**效果**：内容已有 200 个 UTF-16 码元时，再按键没有反应。粘贴一段会让总长超过 200 的文字，整段都不进去。删除照常。**未在真机验证。**

### 不允许换行

```js
const input = new UITextView();
input.addEventListener('beforeinput', (event) => {
  if (event.replacementString.includes('\n')) {
    event.preventDefault();
  }
});
```

**效果**：按回车没有反应。粘贴的内容里有换行时，整段都不进去。**未在真机验证。**

## 对应的 iOS API

`UITextViewDelegate` 的 `textView:shouldChangeTextInRange:replacementText:` 返回 `NO`，对应这里调 `event.preventDefault()`。两个参数在 `event.range` 和 `event.replacementString`。

## 参见

- [限制输入的长度](../../guides/multiline-text.md#限制输入的长度)
- [`input`](input-event.md)：修改之后派发
- [`NSRange`](../ns-range.md)
