---
type: reference
native: CNContact.organizationName
---

# `CNContact`：`organizationName` 属性

**`organizationName`** 属性是联系人的公司或组织。

## 值

字符串。

- 只读。给它赋值抛 `TypeError`。
- 没填是空串。
- 联系人是选中那一刻的副本，这个值不会变，所以没有变化事件。
- 联系人没带这个字段时，读它抛 `TypeError: CNContact.organizationName is not available on this contact; check contact.isKeyAvailable("organizationName") first`，见[联系人带着哪些字段](../cn-contact.md#联系人带着哪些字段)。

只填了公司、没填姓名的联系人，[`CNContactFormatter.stringFromContact()`](../cn-contact-formatter/stringfromcontact.md) 的 `fullName` 给的是公司名。

## 示例

```js
const picker = new CNContactPickerViewController();
picker.addEventListener('contactselect', (event) => {
  const org = event.contact.organizationName;
  console.log(org === '' ? '没有填公司' : org);
});
```

**效果**：输出联系人的公司名；没填时输出 `没有填公司`。

## 对应的 iOS API

`CNContact.organizationName`。

## 参见

- [安装 `@nacrejs/contacts`](../contacts.md#先装上)
