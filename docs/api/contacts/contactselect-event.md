---
type: reference
native: "-[CNContactPickerDelegate contactPicker:didSelectContact:]"
---

# `CNContactPickerViewController`：`contactselect` 事件

**`contactselect`** 事件在单选的选择器上、用户点了一个联系人时派发。监听它，选择器就是单选的。

## 语法

```
picker.addEventListener('contactselect', (event) => { })
```

## 事件对象

`Event`，多一个字段：

**`contact`**

用户选中的联系人，[`CNContact`](../cn-contact.md)。

`target` 是这个选择器。不能取消，`preventDefault()` 不起作用。

## 什么时候派发

- 用户点了一个联系人。选择器随即由系统关掉，App 不用调 `dismissViewController()`。
- 同时监听了 [`contactsselect`](contactsselect-event.md) 时选择器是多选的，这个事件不会来。
- 同时监听了 [`contactpropertyselect`](contactpropertyselect-event.md) 时系统怎么选，Apple 的文档没有说明。
- 一个选择器弹出一次，最多派发一次。

这些行为**未在模拟器验证**。

## 示例

```js
const page = new UIViewController();
const picker = new CNContactPickerViewController();
picker.addEventListener('contactselect', (event) => {
  const name = CNContactFormatter.stringFromContact(event.contact, { style: 'fullName' });
  console.log(name ?? '（没有名字）');
});
page.presentViewController(picker, { animated: true });
```

**效果**：用户点联系人 Alex Chen，选择器关掉，控制台输出 `Alex Chen`。

## 对应的 iOS API

`-[CNContactPickerDelegate contactPicker:didSelectContact:]`。ObjC 里实现了这个委托方法选择器就是单选的；这里是监听了这个事件。

## 参见

- [选法](../contacts.md#选法)
- [`CNContact`](../cn-contact.md)
- [安装 `@nacrejs/contacts`](../contacts.md#先装上)
