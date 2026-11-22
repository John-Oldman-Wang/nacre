---
type: reference
native: UITextViewLinkClickEvent
---

# `UITextViewLinkClickEvent`

**`UITextViewLinkClickEvent`** 表示用户点了多行文字里的一个链接，在系统打开它之前。

[`UITextView`](ui-text-view.md) 的 [`linkclick`](ui-text-view/linkclick-event.md) 事件是它，带着链接的地址和它在文字里的那一段。监听器调 `preventDefault()`，系统就不打开这个链接，由 App 自己处理。

**继承关系**：[`Event`](event.md) → `UITextViewLinkClickEvent`

## 构造函数

[`UITextViewLinkClickEvent()`](ui-text-view-link-click-event/constructor.md)

创建一个 `UITextViewLinkClickEvent`。运行时派发下面这些事件时自己创建它；App 的代码可以用它建一个事件对象，用 [`dispatchEvent()`](event-target/dispatchevent.md) 派发出去，试一试监听器。

## 实例属性

还继承 [`Event`](event.md) 的属性，最常用的是 `type` 和 `target`。下表的属性都是只读的，给它们赋值抛 `TypeError`。

| 属性 | 说明 |
| --- | --- |
| [`url`](ui-text-view-link-click-event/url.md) <small>只读</small> | 链接的地址 |
| [`range`](ui-text-view-link-click-event/range.md) <small>只读</small> | 链接在文字里的那一段 |

这些属性在原型上，不在事件对象自己身上：`Object.keys(event)` 和 `{ ...event }` 拿不到它们，要一个一个读。见[带字段的事件](event.md#带字段的事件)。

## 哪些事件是这个类

| 对象 | 事件 |
| --- | --- |
| [`UITextView`](ui-text-view.md) | [`linkclick`](ui-text-view/linkclick-event.md) |

可以取消：`cancelable` 是 `true`，调了 `preventDefault()`，系统不打开这个链接。

## 示例

```js
const terms = new UITextView();
terms.isEditable = false;
terms.attributedText = new NSAttributedString('阅读《用户协议》', { link: 'https://example.com/terms' });
terms.addEventListener('linkclick', (e) => {
  console.log(e instanceof UITextViewLinkClickEvent, e.url);
  e.preventDefault();
});
```

**效果**：点 `《用户协议》`，输出 `true https://example.com/terms`，系统不打开这个网址。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `textView:primaryActionForTextItem:defaultAction:` | `linkclick` 事件 |
| `textItem.link` | `event.url` |
| `textItem.range` | `event.range` |
| 返回 `nil` | 调 `event.preventDefault()` |

## 参见

- [`linkclick`](ui-text-view/linkclick-event.md)：什么时候派发
- [`UITextView`](ui-text-view.md)
