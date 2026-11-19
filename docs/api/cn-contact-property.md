---
type: reference
native: CNContactProperty
status: partial
---

# `CNContactProperty`

**`CNContactProperty`** 表示用户在联系人详情里选中的那一项：哪个联系人的哪个字段的哪个值。比如用户点了 Alex Chen 的手机号码，它说明联系人是 Alex Chen、字段是电话、值是那个号码。

它由选择器的 [`contactpropertyselect`](contacts/contactpropertyselect-event.md) 事件交给 App。

要先装 `@nacrejs/contacts`，装法见 [`CNContactPickerViewController`](contacts.md#先装上)。

**继承关系**：`EventTarget` → `NSObject` → `CNContactProperty`

## 构造函数

不能用 `new` 创建，只能从 [`contactpropertyselect`](contacts/contactpropertyselect-event.md) 事件的 `contactProperty` 拿到。

`new CNContactProperty()` 抛 `TypeError: Illegal constructor: CNContactProperty is a read-only value handed over by CNContactPickerViewController, not created by new`。

## 实例属性

都是只读的。还继承 `NSObject` 的属性。

| 属性 | 说明 |
| --- | --- |
| [`contact`](cn-contact-property/contact.md) <small>只读</small> | 这一项属于哪个联系人 |
| [`key`](cn-contact-property/key.md) <small>只读</small> | 字段名，比如 `'phoneNumbers'` |
| [`value`](cn-contact-property/value.md) <small>只读</small> | 选中的值 |
| [`identifier`](cn-contact-property/identifier.md) <small>只读</small> | 选中的是带标签的值里的一项时，那一项的标识 |
| [`label`](cn-contact-property/label.md) <small>只读</small> | 选中的是带标签的值里的一项时，那一项的标签原文 |

## 示例

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/contacts" />

const picker = new CNContactPickerViewController();
picker.addEventListener('contactpropertyselect', (event) => {
  const property = event.contactProperty;
  const value = property.value;
  const text = value instanceof CNPhoneNumber ? value.stringValue : value;
  console.log(property.key, text);
});
```

**效果**：用户在详情里点了一个电话时输出 `phoneNumbers 555-0100`；点了一个邮箱时输出 `emailAddresses alex@example.com`；点了地址、生日这类字段时输出字段名和 `null`。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `property.contact`、`key`、`value`、`identifier`、`label` | 相同 |

## 还不能做的

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 选中地址、生日这类字段时拿到值 | `value` 是 `CNPostalAddress`、`NSDateComponents`。未实现，`value` 是 `null`；`key` 仍然说明选的是哪种字段 |

## 参见

- [`contactpropertyselect`](contacts/contactpropertyselect-event.md)：它从这里来
- [`CNContact`](cn-contact.md)：`contact` 的类型
- [`CNLabeledValue`](cn-labeled-value.md)：`identifier` 和 `label` 对应的那一项
