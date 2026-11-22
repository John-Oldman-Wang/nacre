---
type: reference
native: CNContactPickerContactEvent
---

# `CNContactPickerContactEvent`

**`CNContactPickerContactEvent`** 表示用户在系统的选联系人界面里点了一个联系人。

[`CNContactPickerViewController`](contacts.md) 的 [`contactselect`](contacts/contactselect-event.md) 事件是它，[`contact`](cn-contact-picker-contact-event/contact.md) 是选中的联系人。

它属于 `@nacrejs/contacts` 这个包，装法见 [`CNContactPickerViewController`](contacts.md#先装上)。

**继承关系**：[`Event`](event.md) → `CNContactPickerContactEvent`

## 构造函数

[`CNContactPickerContactEvent()`](cn-contact-picker-contact-event/constructor.md)

创建一个 `CNContactPickerContactEvent`。运行时派发下面这些事件时自己创建它；App 的代码可以用它建一个事件对象，用 [`dispatchEvent()`](event-target/dispatchevent.md) 派发出去，试一试监听器。

## 实例属性

还继承 [`Event`](event.md) 的属性，最常用的是 `type` 和 `target`。下表的属性都是只读的，给它们赋值抛 `TypeError`。

| 属性 | 说明 |
| --- | --- |
| [`contact`](cn-contact-picker-contact-event/contact.md) <small>只读</small> | 用户选中的联系人 |

这些属性在原型上，不在事件对象自己身上：`Object.keys(event)` 和 `{ ...event }` 拿不到它们，要一个一个读。见[带字段的事件](event.md#带字段的事件)。

## 哪些事件是这个类

| 对象 | 事件 |
| --- | --- |
| [`CNContactPickerViewController`](contacts.md) | [`contactselect`](contacts/contactselect-event.md) |

不能取消：`cancelable` 是 `false`，`preventDefault()` 不起作用。派发之后选择器由系统关掉。

## 示例

```js
const page = new UIViewController();
const picker = new CNContactPickerViewController();
picker.addEventListener('contactselect', (e) => {
  console.log(e instanceof CNContactPickerContactEvent);
});
page.presentViewController(picker, { animated: true });
```

**效果**：用户在选择器里选好之后，输出 `true`。**未在模拟器验证。**

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `contactPicker:didSelectContact:` | `contactselect` 事件 |
| 参数 `contact` | `event.contact` |

## 参见

- [`CNContactPickerViewController`](contacts.md)：派发这个事件的对象
- [`contactselect`](contacts/contactselect-event.md)：什么时候派发
