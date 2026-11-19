---
type: reference
native: "-[CNContactPickerDelegate contactPicker:didSelectContacts:]"
---

# `CNContactPickerViewController`：`contactsselect` 事件

**`contactsselect`** 事件在多选的选择器上、用户勾选完点了「完成」时派发。监听它，选择器就是多选的。

## 语法

```
picker.addEventListener('contactsselect', (event) => { })
```

## 事件对象

`Event`，多一个字段：

**`contacts`**

用户勾选的联系人，[`CNContact`](../cn-contact.md) 的数组。一个都没勾就点「完成」时是不是空数组，没有验证。

`target` 是这个选择器。不能取消，`preventDefault()` 不起作用。

## 什么时候派发

- 用户点了「完成」。选择器随即由系统关掉。
- 监听了它，选择器就是多选的：每个联系人前面有一个勾选框。同时监听的 [`contactselect`](contactselect-event.md)、[`contactpropertyselect`](contactpropertyselect-event.md) 不会来。
- 一个选择器弹出一次，最多派发一次。

这些行为**未在模拟器验证**。

## 示例

```js
const page = new UIViewController();
const picker = new CNContactPickerViewController();
picker.addEventListener('contactsselect', (event) => {
  const names = event.contacts.map((contact) =>
    CNContactFormatter.stringFromContact(contact, { style: 'fullName' }));
  console.log('选了 ' + names.length + ' 个：' + names.join('、'));
});
page.presentViewController(picker, { animated: true });
```

**效果**：列表里每个联系人前面有一个勾选框，右上角有「完成」。勾两个再点「完成」，选择器关掉，控制台输出 `选了 2 个：Alex Chen、Sam Rivera`。

## 对应的 iOS API

`-[CNContactPickerDelegate contactPicker:didSelectContacts:]`。

## 参见

- [选法](../contacts.md#选法)
- [一次选几个联系人](../../guides/pick-contact.md#一次选几个联系人)
- [安装 `@nacrejs/contacts`](../contacts.md#先装上)
