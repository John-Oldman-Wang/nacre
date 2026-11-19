---
type: reference
native: CNContactProperty.value
---

# `CNContactProperty`：`value` 属性

**`value`** 属性是用户选中的那个值。

## 值

取决于用户点的是哪种字段：

| 字段 | 值 |
| --- | --- |
| 电话 | [`CNPhoneNumber`](../cn-phone-number.md) |
| 邮箱、网址 | 字符串 |
| 地址、生日、日期这类 | `null`：这些类型还没有暴露 |

- 只读。给它赋值抛 `TypeError`。
- 这个值不会变，所以没有变化事件。
- 类型因字段而异，用之前先用 `instanceof` 或 `typeof` 判断。用 [`displayedPropertyKeys`](../contacts/displayedpropertykeys.md) 把详情限制成一种字段，用户就点不到别的字段。

## 示例

```js
const picker = new CNContactPickerViewController();
picker.displayedPropertyKeys = ['phoneNumbers', 'emailAddresses'];
picker.addEventListener('contactpropertyselect', (event) => {
  const value = event.contactProperty.value;
  if (value instanceof CNPhoneNumber) {
    console.log('电话：' + value.stringValue);
  } else if (typeof value === 'string') {
    console.log('邮箱：' + value);
  }
});
```

**效果**：用户点了一个电话时输出 `电话：555-0100`，点了一个邮箱时输出 `邮箱：alex@example.com`。

## 对应的 iOS API

`CNContactProperty.value`。原生的值是 `CNPostalAddress`、`NSDateComponents` 的，这里是 `null`。

## 参见

- [`key`](key.md)：是哪种字段
- [安装 `@nacrejs/contacts`](../contacts.md#先装上)
