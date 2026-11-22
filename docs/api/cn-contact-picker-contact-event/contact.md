---
type: reference
native: CNContactPickerContactEvent.contact
---

# `CNContactPickerContactEvent`：`contact` 属性

**`contact`** 属性是用户选中的联系人。

## 值

[`CNContact`](../cn-contact.md)。

- 只读。给它赋值抛 `TypeError`。
- 用 [`new`](constructor.md) 创建时没给，是 `null`。

## 示例

```js
const page = new UIViewController();
const picker = new CNContactPickerViewController();
picker.addEventListener('contactselect', (e) => {
  const name = CNContactFormatter.stringFromContact(e.contact, { style: 'fullName' });
  console.log(name ?? '（没有名字）');
});
page.presentViewController(picker, { animated: true });
```

**效果**：用户点了一个联系人，输出他的全名。**未在模拟器验证。**

## 对应的 iOS API

`contactPicker:didSelectContact:` 的参数 `contact`。

## 参见

- [`CNContactPickerContactEvent`](../cn-contact-picker-contact-event.md)
