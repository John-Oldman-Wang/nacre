---
type: reference
native: CNContact.givenName
---

# `CNContact`：`givenName` 属性

**`givenName`** 属性是联系人的名。

## 值

字符串。

- 只读。给它赋值抛 `TypeError`。
- 没填是空串。
- 联系人是选中那一刻的副本，这个值不会变，所以没有变化事件。
- 联系人没带这个字段时，读它抛 `TypeError: CNContact.givenName is not available on this contact; check contact.isKeyAvailable("givenName") first`，见[联系人带着哪些字段](../cn-contact.md#联系人带着哪些字段)。

姓名要显示成一行时，用 [`CNContactFormatter.stringFromContact()`](../cn-contact-formatter/stringfromcontact.md)，不要自己把 `familyName` 和 `givenName` 拼起来：名和姓谁在前因语言而异。

## 示例

```js
const picker = new CNContactPickerViewController();
picker.addEventListener('contactselect', (event) => {
  console.log(event.contact.givenName);
});
```

**效果**：选中联系人 Alex Chen 时输出 `Alex`。

## 对应的 iOS API

`CNContact.givenName`。

## 参见

- [`familyName`](familyname.md)：姓
- [`CNContactFormatter.stringFromContact()`](../cn-contact-formatter/stringfromcontact.md)
- [安装 `@nacrejs/contacts`](../contacts.md#先装上)
