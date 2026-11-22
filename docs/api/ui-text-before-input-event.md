---
type: reference
native: UITextBeforeInputEvent
---

# `UITextBeforeInputEvent`

**`UITextBeforeInputEvent`** 表示用户对输入框内容的一次修改，在修改生效之前。

单行输入框 [`UITextField`](ui-text-field.md) 和多行输入 [`UITextView`](ui-text-view.md) 的 `beforeinput` 都是它。它说明这次修改打算把哪一段换成什么；监听器调 `preventDefault()`，这次修改就不做。

**继承关系**：[`Event`](event.md) → `UITextBeforeInputEvent`

## 构造函数

[`UITextBeforeInputEvent()`](ui-text-before-input-event/constructor.md)

创建一个 `UITextBeforeInputEvent`。运行时派发下面这些事件时自己创建它；App 的代码可以用它建一个事件对象，用 [`dispatchEvent()`](event-target/dispatchevent.md) 派发出去，试一试监听器。

## 实例属性

还继承 [`Event`](event.md) 的属性，最常用的是 `type` 和 `target`。下表的属性都是只读的，给它们赋值抛 `TypeError`。

| 属性 | 说明 |
| --- | --- |
| [`range`](ui-text-before-input-event/range.md) <small>只读</small> | 要被换掉的那一段 |
| [`replacementString`](ui-text-before-input-event/replacementstring.md) <small>只读</small> | 要换上去的文字 |

这些属性在原型上，不在事件对象自己身上：`Object.keys(event)` 和 `{ ...event }` 拿不到它们，要一个一个读。见[带字段的事件](event.md#带字段的事件)。

## 哪些事件是这个类

| 对象 | 事件 |
| --- | --- |
| [`UITextField`](ui-text-field.md) | [`beforeinput`](ui-text-field/beforeinput-event.md) |
| [`UITextView`](ui-text-view.md) | [`beforeinput`](ui-text-view/beforeinput-event.md) |

可以取消：`cancelable` 是 `true`，调了 `preventDefault()`，内容不变。监听器是当场执行的，系统等监听器全部执行完再决定改不改。

## 示例

```js
const field = new UITextField();
field.addEventListener('beforeinput', (e) => {
  console.log(e instanceof UITextBeforeInputEvent, e.range.location, e.replacementString);
  const next = field.text.slice(0, e.range.location) + e.replacementString +
    field.text.slice(e.range.location + e.range.length);
  if (next.length > 6) {
    e.preventDefault();
  }
});
```

**效果**：每次输入前输出 `true`、修改的起点和换上去的文字。内容超过 6 个字的修改不生效。只有真实的键盘输入会派发。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `textField:shouldChangeCharactersInRange:replacementString:` | `UITextField` 的 `beforeinput` |
| `textView:shouldChangeTextInRange:replacementText:` | `UITextView` 的 `beforeinput` |
| 参数 `range` | `event.range` |
| 参数 `string`、`text` | `event.replacementString` |
| 返回 `NO` | 调 `event.preventDefault()` |

## 参见

- [`UITextField`](ui-text-field.md)、[`UITextView`](ui-text-view.md)：派发这个事件的对象
- [做一个输入框](../guides/text-fields.md)
