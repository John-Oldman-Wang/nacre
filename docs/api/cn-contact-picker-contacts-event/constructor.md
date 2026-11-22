---
type: reference
native: CNContactPickerContactsEvent()
---

# `CNContactPickerContactsEvent()` 构造函数

**`CNContactPickerContactsEvent()`** 构造函数创建一个 `CNContactPickerContactsEvent`。

## 语法

```
new CNContactPickerContactsEvent(type)
new CNContactPickerContactsEvent(type, { contacts, cancelable })
```

### 参数

**`type`**

事件名，字符串。

**`options.contacts`**

可选，对应 [`contacts`](contacts.md) 属性。要能迭代（数组、`Set`……），转成一个新数组；别的抛 `TypeError`。不传是 空数组。

**`options.cancelable`**

布尔值，可选，默认 `false`。

### 返回值

新建的 `CNContactPickerContactsEvent`。

### 异常

**`TypeError`**

- 某个字段的值转换不了，见上面各个参数。
- 没传事件名：`Failed to construct 'CNContactPickerContactsEvent': 1 argument required, but only 0 present.`
- 不带 `new`，当成函数调用。

## 示例

```js
const event = new CNContactPickerContactsEvent('contactsselect');
console.log(event.type, event.contacts.length);
```

**结果**：控制台输出 `contactsselect 0`。

## 对应的 iOS API

没有对应的系统 API。系统的通知到来时，运行时把通知带的值放进事件对象。

## 参见

- [`CNContactPickerContactsEvent`](../cn-contact-picker-contacts-event.md)
- [`dispatchEvent()`](../event-target/dispatchevent.md)：把自己建的事件派发出去
