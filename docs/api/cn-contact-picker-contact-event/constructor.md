---
type: reference
native: CNContactPickerContactEvent()
---

# `CNContactPickerContactEvent()` 构造函数

**`CNContactPickerContactEvent()`** 构造函数创建一个 `CNContactPickerContactEvent`。

## 语法

```
new CNContactPickerContactEvent(type)
new CNContactPickerContactEvent(type, { contact, cancelable })
```

### 参数

**`type`**

事件名，字符串。

**`options.contact`**

可选，对应 [`contact`](contact.md) 属性。要是一个 `CNContact`，也可以是 `null`，不转；别的抛 `TypeError`。不传是 `null`。

**`options.cancelable`**

布尔值，可选，默认 `false`。

### 返回值

新建的 `CNContactPickerContactEvent`。

### 异常

**`TypeError`**

- 某个字段的值转换不了，见上面各个参数。
- 没传事件名：`Failed to construct 'CNContactPickerContactEvent': 1 argument required, but only 0 present.`
- 不带 `new`，当成函数调用。

## 示例

```js
const event = new CNContactPickerContactEvent('contactselect');
console.log(event.type, event.contact);
```

**结果**：控制台输出 `contactselect null`。

## 对应的 iOS API

没有对应的系统 API。系统的通知到来时，运行时把通知带的值放进事件对象。

## 参见

- [`CNContactPickerContactEvent`](../cn-contact-picker-contact-event.md)
- [`dispatchEvent()`](../event-target/dispatchevent.md)：把自己建的事件派发出去
