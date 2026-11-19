---
type: reference
native: CNContactProperty.identifier
---

# `CNContactProperty`：`identifier` 属性

**`identifier`** 属性在选中的是带标签的值里的一项（某一个电话、某一个邮箱）时，是那一项的标识。

## 值

字符串，或者 `null`。

- 选中的是带标签的值里的一项时，等于那一项 [`CNLabeledValue`](../cn-labeled-value.md) 的 `identifier`。
- 否则是 `null`。
- 只读。给它赋值抛 `TypeError`。
- 这个值不会变，所以没有变化事件。

## 示例

```js
const picker = new CNContactPickerViewController();
picker.addEventListener('contactpropertyselect', (event) => {
  console.log(event.contactProperty.identifier);
});
```

**效果**：用户点了一个电话时输出那一项的标识（一个字符串）。

## 对应的 iOS API

`CNContactProperty.identifier`。

## 参见

- [`CNLabeledValue` 的 `identifier`](../cn-labeled-value/identifier.md)
- [安装 `@nacrejs/contacts`](../contacts.md#先装上)
