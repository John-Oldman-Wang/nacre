---
type: reference
native: CNContactProperty.contact
---

# `CNContactProperty`：`contact` 属性

**`contact`** 属性是选中的这一项属于哪个联系人。

## 值

[`CNContact`](../cn-contact.md)。

- 只读。给它赋值抛 `TypeError`。
- 这个值不会变，所以没有变化事件。

## 示例

```js
const picker = new CNContactPickerViewController();
picker.addEventListener('contactpropertyselect', (event) => {
  const property = event.contactProperty;
  const name = CNContactFormatter.stringFromContact(property.contact, { style: 'fullName' });
  console.log(name ?? '（没有名字）');
});
```

**效果**：输出选中的这一项所属联系人的姓名，比如 `Alex Chen`。

## 对应的 iOS API

`CNContactProperty.contact`。

## 参见

- [`CNContact`](../cn-contact.md)
- [安装 `@nacrejs/contacts`](../contacts.md#先装上)
