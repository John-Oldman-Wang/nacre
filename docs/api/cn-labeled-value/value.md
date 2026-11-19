---
type: reference
native: CNLabeledValue.value
---

# `CNLabeledValue`：`value` 属性

**`value`** 属性是这一项的值：一个电话号码，或者一个邮箱地址。

## 值

- 电话（来自 `phoneNumbers`）：[`CNPhoneNumber`](../cn-phone-number.md)。同一项上两次读是同一个对象。
- 邮箱（来自 `emailAddresses`）：字符串。

只读。给它赋值抛 `TypeError`。这个值不会变，所以没有变化事件。

## 示例

```js
const picker = new CNContactPickerViewController();
picker.addEventListener('contactselect', (event) => {
  const contact = event.contact;
  const firstPhone = contact.phoneNumbers[0];
  if (firstPhone !== undefined) {
    console.log(firstPhone.value.stringValue);
  }
  const firstEmail = contact.emailAddresses[0];
  if (firstEmail !== undefined) {
    console.log(firstEmail.value);
  }
});
```

**效果**：输出联系人的第一个电话和第一个邮箱，比如 `555-0100` 和 `alex@example.com`。没有的那一项不输出。

## 对应的 iOS API

`CNLabeledValue.value`。

## 参见

- [`CNPhoneNumber`](../cn-phone-number.md)
- [安装 `@nacrejs/contacts`](../contacts.md#先装上)
