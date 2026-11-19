---
type: reference
native: CNContact.familyName
---

# `CNContact`：`familyName` 属性

**`familyName`** 属性是联系人的姓。

## 值

字符串。

- 只读。给它赋值抛 `TypeError`。
- 没填是空串。
- 联系人是选中那一刻的副本，这个值不会变，所以没有变化事件。
- 联系人没带这个字段时，读它抛 `TypeError: CNContact.familyName is not available on this contact; check contact.isKeyAvailable("familyName") first`，见[联系人带着哪些字段](../cn-contact.md#联系人带着哪些字段)。

姓名要显示成一行时，用 [`CNContactFormatter.stringFromContact()`](../cn-contact-formatter/stringfromcontact.md)。

## 示例

```js
const picker = new CNContactPickerViewController();
picker.addEventListener('contactselect', (event) => {
  console.log(event.contact.familyName);
});
```

**效果**：选中联系人 Alex Chen 时输出 `Chen`。

## 对应的 iOS API

`CNContact.familyName`。

## 参见

- [`givenName`](givenname.md)：名
- [安装 `@nacrejs/contacts`](../contacts.md#先装上)
