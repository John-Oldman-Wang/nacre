---
type: reference
native: "-[CNContactPickerDelegate contactPicker:didSelectContactProperty:]"
---

# `CNContactPickerViewController`：`contactpropertyselect` 事件

**`contactpropertyselect`** 事件在用户进入一个联系人的详情、点了其中一项（一个电话、一个邮箱）时派发。监听它，选择器就是「选某一项」的选法。

## 语法

```
picker.addEventListener('contactpropertyselect', (event) => { })
```

## 事件对象

[`CNContactPickerContactPropertyEvent`](../cn-contact-picker-contact-property-event.md)，多一个只读字段：

**[`contactProperty`](../cn-contact-picker-contact-property-event/contactproperty.md)**

用户选中的那一项，[`CNContactProperty`](../cn-contact-property.md)：哪个联系人、哪个字段、哪个值。

`target` 是这个选择器。不能取消，`preventDefault()` 不起作用。

## 什么时候派发

- 用户点一个联系人，选择器进入这个联系人的详情；用户再点详情里的一项，派发这个事件，选择器随即由系统关掉。
- 详情里显示哪些字段由 [`displayedPropertyKeys`](displayedpropertykeys.md) 决定。
- 同时监听了 [`contactsselect`](contactsselect-event.md) 时选择器是多选的，这个事件不会来。
- 一个选择器弹出一次，最多派发一次。

这些行为**未在模拟器验证**。

## 示例

```js
const page = new UIViewController();
const picker = new CNContactPickerViewController();
picker.displayedPropertyKeys = ['phoneNumbers'];
picker.addEventListener('contactpropertyselect', (event) => {
  const property = event.contactProperty;
  if (property.value instanceof CNPhoneNumber) {
    console.log(property.value.stringValue);
  }
});
page.presentViewController(picker, { animated: true });
```

**效果**：点一个联系人，详情里只有电话那几行；点其中一个号码，选择器关掉，控制台输出这个号码，比如 `555-0100`。

## 对应的 iOS API

`-[CNContactPickerDelegate contactPicker:didSelectContactProperty:]`。一次选几项的 `contactPicker:didSelectContactProperties:` 还没有提供。

## 参见

- [`CNContactProperty`](../cn-contact-property.md)
- [让用户选一个电话号码](../../guides/pick-contact.md#让用户选一个电话号码)
- [安装 `@nacrejs/contacts`](../contacts.md#先装上)
