---
type: reference
native: CNPhoneNumber
status: partial
---

# `CNPhoneNumber`

**`CNPhoneNumber`** 表示一个电话号码。

它出现在两处：[`CNContact`](cn-contact.md) 的 `phoneNumbers` 里每一项的 `value`，以及用户在联系人详情里点了一个电话时 [`CNContactProperty`](cn-contact-property.md) 的 `value`。

要先装 `@nacrejs/contacts`，装法见 [`CNContactPickerViewController`](contacts.md#先装上)。

**继承关系**：`EventTarget` → `NSObject` → `CNPhoneNumber`

## 构造函数

不能用 `new` 创建，只能从联系人里拿到。

`new CNPhoneNumber()` 抛 `TypeError: Illegal constructor: CNPhoneNumber is a read-only value handed over by CNContactPickerViewController, not created by new`。

## 实例属性

还继承 `NSObject` 的属性。

| 属性 | 说明 |
| --- | --- |
| [`stringValue`](cn-phone-number/stringvalue.md) <small>只读</small> | 用户在通讯录里填的原文 |

## 示例

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/contacts" />

const picker = new CNContactPickerViewController();
picker.addEventListener('contactpropertyselect', (event) => {
  const value = event.contactProperty.value;
  if (value instanceof CNPhoneNumber) {
    console.log(value.stringValue);
  }
});
```

**效果**：用户在联系人详情里点了一个电话时，输出这个号码。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `phoneNumber.stringValue` | `phoneNumber.stringValue` |

## 参见

- [`CNLabeledValue`](cn-labeled-value.md)：电话连同它的标签
- [`CNContact`](cn-contact.md)：`phoneNumbers`
