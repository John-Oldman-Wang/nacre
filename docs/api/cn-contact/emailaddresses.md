---
type: reference
native: CNContact.emailAddresses
---

# `CNContact`：`emailAddresses` 属性

**`emailAddresses`** 属性是联系人的全部邮箱。每一项是一个 [`CNLabeledValue`](../cn-labeled-value.md)，它的 `value` 是邮箱地址字符串。

## 值

`CNLabeledValue<string>` 的数组。

- 只读。给它赋值抛 `TypeError`。
- 按通讯录里的顺序。没有邮箱是空数组。
- 联系人是选中那一刻的副本，这个值不会变，所以没有变化事件。
- 联系人没带这个字段时，读它抛 `TypeError: CNContact.emailAddresses is not available on this contact; check contact.isKeyAvailable("emailAddresses") first`。

## 示例

```js
const picker = new CNContactPickerViewController();
picker.addEventListener('contactselect', (event) => {
  const contact = event.contact;
  if (contact.isKeyAvailable('emailAddresses')) {
    console.log(contact.emailAddresses.map((item) => item.value).join(', '));
  }
});
```

**效果**：输出联系人的全部邮箱，用逗号隔开，比如 `alex@example.com, alex@work.example.com`。没有邮箱时输出空行。

## 对应的 iOS API

`CNContact.emailAddresses`。

## 参见

- [`CNLabeledValue`](../cn-labeled-value.md)：每一项的类型
- [安装 `@nacrejs/contacts`](../contacts.md#先装上)
