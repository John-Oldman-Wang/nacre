---
type: reference
native: CNLabeledValue.label
---

# `CNLabeledValue`：`label` 属性

**`label`** 属性是这一项的标签的原文，比如「手机」「工作」。

## 值

字符串，或者 `null`。

- 只读。给它赋值抛 `TypeError`。
- 这一项没有标签是 `null`。
- 系统自带的标签存的是一个记号，比如手机是 `'_$!<Mobile>!$_'`，不能直接给用户看。显示之前用 [`CNLabeledValue.localizedStringForLabel()`](localizedstringforlabel.md) 换一下，见[标签的原文](../cn-labeled-value.md#标签的原文)。
- 这个值不会变，所以没有变化事件。

## 示例

```js
const picker = new CNContactPickerViewController();
picker.addEventListener('contactselect', (event) => {
  for (const item of event.contact.phoneNumbers) {
    console.log(item.label === null ? '（没有标签）' : CNLabeledValue.localizedStringForLabel(item.label));
  }
});
```

**效果**：每行输出一个电话的标签，比如中文系统上是 `手机`；没有标签的输出 `（没有标签）`。

## 对应的 iOS API

`CNLabeledValue.label`。

## 参见

- [`CNLabeledValue.localizedStringForLabel()`](localizedstringforlabel.md)
- [安装 `@nacrejs/contacts`](../contacts.md#先装上)
