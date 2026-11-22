---
type: reference
native: CNContactPickerContactPropertyEvent()
---

# `CNContactPickerContactPropertyEvent()` 构造函数

**`CNContactPickerContactPropertyEvent()`** 构造函数创建一个 `CNContactPickerContactPropertyEvent`。

## 语法

```
new CNContactPickerContactPropertyEvent(type)
new CNContactPickerContactPropertyEvent(type, { contactProperty, cancelable })
```

### 参数

**`type`**

事件名，字符串。

**`options.contactProperty`**

可选，对应 [`contactProperty`](contactproperty.md) 属性。要是一个 `CNContactProperty`，也可以是 `null`，不转；别的抛 `TypeError`。不传是 `null`。

**`options.cancelable`**

布尔值，可选，默认 `false`。

### 返回值

新建的 `CNContactPickerContactPropertyEvent`。

### 异常

**`TypeError`**

- 某个字段的值转换不了，见上面各个参数。
- 没传事件名：`Failed to construct 'CNContactPickerContactPropertyEvent': 1 argument required, but only 0 present.`
- 不带 `new`，当成函数调用。

## 示例

```js
const event = new CNContactPickerContactPropertyEvent('contactpropertyselect');
console.log(event.type, event.contactProperty);
```

**结果**：控制台输出 `contactpropertyselect null`。

## 对应的 iOS API

没有对应的系统 API。系统的通知到来时，运行时把通知带的值放进事件对象。

## 参见

- [`CNContactPickerContactPropertyEvent`](../cn-contact-picker-contact-property-event.md)
- [`dispatchEvent()`](../event-target/dispatchevent.md)：把自己建的事件派发出去
