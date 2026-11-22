---
type: reference
native: CNContactPickerContactsEvent.contacts
---

# `CNContactPickerContactsEvent`：`contacts` 属性

**`contacts`** 属性是用户勾选的联系人。

## 值

[`CNContact`](../cn-contact.md) 的数组。

- 只读。给它赋值抛 `TypeError`。
- 一个都没勾就点「完成」时是不是空数组，**未在模拟器验证**。
- 用 [`new`](constructor.md) 创建时没给，是 空数组。

## 示例

```js
const page = new UIViewController();
const picker = new CNContactPickerViewController();
picker.addEventListener('contactsselect', (e) => {
  console.log('选了 ' + e.contacts.length + ' 个');
});
page.presentViewController(picker, { animated: true });
```

**效果**：用户勾选几个联系人、点了「完成」，输出选了几个。**未在模拟器验证。**

## 对应的 iOS API

`contactPicker:didSelectContacts:` 的参数 `contacts`。

## 参见

- [`CNContactPickerContactsEvent`](../cn-contact-picker-contacts-event.md)
