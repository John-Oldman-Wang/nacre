---
type: reference
native: CNContact.phoneNumbers
---

# `CNContact`：`phoneNumbers` 属性

**`phoneNumbers`** 属性是联系人的全部电话。每一项是一个 [`CNLabeledValue`](../cn-labeled-value.md)，它的 `value` 是 [`CNPhoneNumber`](../cn-phone-number.md)，`label` 是这个电话的标签（手机、住宅、工作……）。

## 值

`CNLabeledValue<CNPhoneNumber>` 的数组。

- 只读。给它赋值抛 `TypeError`。
- 按通讯录里的顺序。没有电话是空数组。
- 联系人是选中那一刻的副本，这个值不会变，所以没有变化事件。
- 同一个联系人上两次读，数组里是同一批对象，可以用 `===` 比较。
- 联系人没带这个字段时，读它抛 `TypeError: CNContact.phoneNumbers is not available on this contact; check contact.isKeyAvailable("phoneNumbers") first`。

## 示例

```js
const picker = new CNContactPickerViewController();
picker.addEventListener('contactselect', (event) => {
  const lines = event.contact.phoneNumbers.map((item) => {
    const label = item.label === null
      ? ''
      : CNLabeledValue.localizedStringForLabel(item.label) + ' ';
    return label + item.value.stringValue;
  });
  console.log(lines.join('\n'));
});
```

**效果**：每行一个电话，前面是标签在当前语言下的写法，比如中文系统上是 `手机 555-0100`、`工作 555-0199`。

## 对应的 iOS API

`CNContact.phoneNumbers`。

## 参见

- [`CNLabeledValue`](../cn-labeled-value.md)：每一项的类型
- [`CNPhoneNumber`](../cn-phone-number.md)：号码本身
- [安装 `@nacrejs/contacts`](../contacts.md#先装上)
