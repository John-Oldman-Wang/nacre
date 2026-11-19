---
type: reference
native: CNContactFormatter
status: partial
---

# `CNContactFormatter`

**`CNContactFormatter`** 把联系人的姓名拼成一行。名和姓谁在前、中间有没有空格，由系统按姓名本身的文字和用户的设置定：中文、日文的姓在前，英文的名在前。

要先装 `@nacrejs/contacts`，装法见 [`CNContactPickerViewController`](contacts.md#先装上)。

**继承关系**：`EventTarget` → `NSObject` → `CNContactFormatter`

## 构造函数

不能用 `new` 创建。它只有一个静态方法。

`new CNContactFormatter()` 抛 `TypeError: Illegal constructor: CNContactFormatter has no instances here; use CNContactFormatter.stringFromContact(contact, { style })`。

## 静态方法

[`CNContactFormatter.stringFromContact()`](cn-contact-formatter/stringfromcontact.md)

把一个联系人的姓名或姓名的注音拼成一行。

## 示例

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/contacts" />

const picker = new CNContactPickerViewController();
picker.addEventListener('contactselect', (event) => {
  const name = CNContactFormatter.stringFromContact(event.contact, { style: 'fullName' });
  console.log(name === null ? '（没有名字）' : name);
});
```

**效果**：选中名是 Alex、姓是 Chen 的联系人时输出 `Alex Chen`；选中名是「小明」、姓是「陈」的联系人时输出 `陈小明`。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[CNContactFormatter stringFromContact:contact style:CNContactFormatterStyleFullName]` | `CNContactFormatter.stringFromContact(contact, { style: 'fullName' })` |

## 参见

- [`CNContact`](cn-contact.md)：`givenName`、`familyName`
- [让用户选联系人](../guides/pick-contact.md)：显示姓名用它，不要自己拼
