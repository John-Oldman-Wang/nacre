---
type: reference
native: CNContactPickerContactPropertyEvent.contactProperty
---

# `CNContactPickerContactPropertyEvent`：`contactProperty` 属性

**`contactProperty`** 属性是用户在联系人详情里选中的那一项。

## 值

[`CNContactProperty`](../cn-contact-property.md)：哪个联系人、哪个字段、哪个值。

- 只读。给它赋值抛 `TypeError`。
- 用 [`new`](constructor.md) 创建时没给，是 `null`。

## 示例

```js
const page = new UIViewController();
const picker = new CNContactPickerViewController();
picker.addEventListener('contactpropertyselect', (e) => {
  if (e.contactProperty.value instanceof CNPhoneNumber) {
    console.log(e.contactProperty.value.stringValue);
  }
});
page.presentViewController(picker, { animated: true });
```

**效果**：用户在联系人详情里点了一个电话号码，输出这个号码；点别的项不输出。**未在模拟器验证。**

## 对应的 iOS API

`contactPicker:didSelectContactProperty:` 的参数 `contactProperty`。

## 参见

- [`CNContactPickerContactPropertyEvent`](../cn-contact-picker-contact-property-event.md)
