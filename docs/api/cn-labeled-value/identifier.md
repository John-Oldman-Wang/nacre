---
type: reference
native: CNLabeledValue.identifier
---

# `CNLabeledValue`：`identifier` 属性

**`identifier`** 属性是这一项在这台设备上的标识。

## 值

字符串。

- 只读。给它赋值抛 `TypeError`。
- 这个值不会变，所以没有变化事件。
- 用户在联系人详情里点了一个电话或邮箱时，[`CNContactProperty`](../cn-contact-property.md) 的 `identifier` 就是那一项的这个值。

## 示例

```js
const picker = new CNContactPickerViewController();
picker.addEventListener('contactpropertyselect', (event) => {
  const property = event.contactProperty;
  const item = property.contact.phoneNumbers.find((p) => p.identifier === property.identifier);
  console.log(item === undefined ? '不是电话' : item.value.stringValue);
});
```

**效果**：用户在详情里点了一个电话时，在联系人的 `phoneNumbers` 里找到同一项，输出它的号码。**未在模拟器验证。**

## 对应的 iOS API

`CNLabeledValue.identifier`。

## 参见

- [`CNContactProperty`](../cn-contact-property.md)
- [安装 `@nacrejs/contacts`](../contacts.md#先装上)
