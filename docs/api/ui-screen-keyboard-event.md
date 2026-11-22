---
type: reference
native: UIScreenKeyboardEvent
---

# `UIScreenKeyboardEvent`

**`UIScreenKeyboardEvent`** 表示屏幕键盘出现、收起或者改变位置大小。

[`UIScreen`](ui-screen.md) 的三个键盘事件是它。它带着键盘在动画开始和结束时的位置，以及动画的时长，让界面跟着键盘一起动。

**继承关系**：[`Event`](event.md) → `UIScreenKeyboardEvent`

## 构造函数

[`UIScreenKeyboardEvent()`](ui-screen-keyboard-event/constructor.md)

创建一个 `UIScreenKeyboardEvent`。运行时派发下面这些事件时自己创建它；App 的代码可以用它建一个事件对象，用 [`dispatchEvent()`](event-target/dispatchevent.md) 派发出去，试一试监听器。

## 实例属性

还继承 [`Event`](event.md) 的属性，最常用的是 `type` 和 `target`。下表的属性都是只读的，给它们赋值抛 `TypeError`。

| 属性 | 说明 |
| --- | --- |
| [`frame`](ui-screen-keyboard-event/frame.md) <small>只读</small> | 动画结束时键盘的位置 |
| [`previousFrame`](ui-screen-keyboard-event/previousframe.md) <small>只读</small> | 动画开始时键盘的位置 |
| [`duration`](ui-screen-keyboard-event/duration.md) <small>只读</small> | 键盘动画的时长 |

这些属性在原型上，不在事件对象自己身上：`Object.keys(event)` 和 `{ ...event }` 拿不到它们，要一个一个读。见[带字段的事件](event.md#带字段的事件)。

## 哪些事件是这个类

| 对象 | 事件 |
| --- | --- |
| [`UIScreen`](ui-screen.md) | [`keyboardshow`](ui-screen/keyboardshow-event.md)、[`keyboardhide`](ui-screen/keyboardhide-event.md)、[`keyboardchange`](ui-screen/keyboardchange-event.md) |

不能取消：`cancelable` 是 `false`，`preventDefault()` 不起作用。iPhone 上 App 占满整个屏幕，屏幕坐标和窗口里的坐标相同。

## 示例

```js
application.addEventListener('sceneconnect', (connect) => {
  connect.scene.screen.addEventListener('keyboardshow', (e) => {
    console.log(e instanceof UIScreenKeyboardEvent, e.frame.y, e.duration);
  });
});
```

**效果**：键盘出现时，输出 `true`、键盘上边缘的纵坐标和动画的时长。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `UIKeyboardWillShowNotification` | `keyboardshow` |
| `UIKeyboardWillHideNotification` | `keyboardhide` |
| `UIKeyboardWillChangeFrameNotification` | `keyboardchange` |
| `userInfo[UIKeyboardFrameEndUserInfoKey]` | `event.frame` |
| `userInfo[UIKeyboardFrameBeginUserInfoKey]` | `event.previousFrame` |
| `userInfo[UIKeyboardAnimationDurationUserInfoKey]` | `event.duration` |

## 参见

- [`UIScreen`](ui-screen.md)：派发这些事件的对象
- [`UIKeyboardLayoutGuide`](ui-keyboard-layout-guide.md)：不写代码，用约束让界面避开键盘
