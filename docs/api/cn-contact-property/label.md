---
type: reference
native: CNContactProperty.label
---

# `CNContactProperty`：`label` 属性

**`label`** 属性在选中的是带标签的值里的一项时，是那一项的标签原文。

## 值

字符串，或者 `null`。

- 选中的是带标签的值里的一项时，等于那一项 [`CNLabeledValue`](../cn-labeled-value.md) 的 `label`；那一项没有标签时是 `null`。
- 否则是 `null`。
- 系统自带的标签是一个记号，显示之前用 [`CNLabeledValue.localizedStringForLabel()`](../cn-labeled-value/localizedstringforlabel.md) 换一下。
- 只读。给它赋值抛 `TypeError`。
- 这个值不会变，所以没有变化事件。

## 示例

```js
const picker = new CNContactPickerViewController();
picker.addEventListener('contactpropertyselect', (event) => {
  const label = event.contactProperty.label;
  console.log(label === null ? '（没有标签）' : CNLabeledValue.localizedStringForLabel(label));
});
```

**效果**：用户点了一个手机号码时，中文系统上输出 `手机`。

## 对应的 iOS API

`CNContactProperty.label`。

## 参见

- [标签的原文](../cn-labeled-value.md#标签的原文)
- [安装 `@nacrejs/contacts`](../contacts.md#先装上)
