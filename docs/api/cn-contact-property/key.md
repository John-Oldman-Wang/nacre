---
type: reference
native: CNContactProperty.key
---

# `CNContactProperty`：`key` 属性

**`key`** 属性是选中的这一项属于哪个字段。

## 值

字符串，[字段名](../cn-contact.md#字段名)之一：用户点的是电话就是 `'phoneNumbers'`，是邮箱就是 `'emailAddresses'`。

- 只读。给它赋值抛 `TypeError`。
- 选中地址、生日这类还没暴露值的字段时，[`value`](value.md) 是 `null`，`key` 仍然说明选的是哪种字段。
- 这个值不会变，所以没有变化事件。

## 示例

```js
const picker = new CNContactPickerViewController();
picker.addEventListener('contactpropertyselect', (event) => {
  console.log(event.contactProperty.key);
});
```

**效果**：用户点了一个电话时输出 `phoneNumbers`。

## 对应的 iOS API

`CNContactProperty.key`。原生的值是 `CNContactPhoneNumbersKey` 这类常量，这里是去掉前缀和 `Key` 后缀的字段名。

## 参见

- [字段名](../cn-contact.md#字段名)
- [安装 `@nacrejs/contacts`](../contacts.md#先装上)
