---
type: reference
native: CNPhoneNumber.stringValue
---

# `CNPhoneNumber`：`stringValue` 属性

**`stringValue`** 属性是电话号码的文字。

## 值

字符串。

- 只读。给它赋值抛 `TypeError`。
- 是用户在通讯录里填的原文，没有规整过：可能带空格、横线、括号、国家码。拿去拨号或者发给服务器之前，App 自己规整。
- 这个值不会变，所以没有变化事件。

## 示例

```js
const picker = new CNContactPickerViewController();
picker.addEventListener('contactselect', (event) => {
  for (const item of event.contact.phoneNumbers) {
    const digits = item.value.stringValue.replace(/[^\d+]/g, '');
    console.log(item.value.stringValue, '→', digits);
  }
});
```

**效果**：每行输出一个号码的原文和去掉空格、横线、括号之后的结果，比如 `(555) 010-0100 → 5550100100`。

## 对应的 iOS API

`CNPhoneNumber.stringValue`。

## 参见

- [`CNLabeledValue`](../cn-labeled-value.md)
- [安装 `@nacrejs/contacts`](../contacts.md#先装上)
