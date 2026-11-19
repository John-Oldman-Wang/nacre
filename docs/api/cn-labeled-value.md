---
type: reference
native: CNLabeledValue
status: partial
---

# `CNLabeledValue`

**`CNLabeledValue`** 表示联系人的一个电话或一个邮箱，连同它的标签。一个联系人可以有几个电话、几个邮箱，通讯录里每一个都带一个标签：手机、住宅、工作，或者用户自己起的名字。

[`CNContact`](cn-contact.md) 的 `phoneNumbers` 和 `emailAddresses` 是它的数组。

要先装 `@nacrejs/contacts`，装法见 [`CNContactPickerViewController`](contacts.md#先装上)。

**继承关系**：`EventTarget` → `NSObject` → `CNLabeledValue`

## 构造函数

不能用 `new` 创建，只能从 [`CNContact`](cn-contact.md) 的 `phoneNumbers`、`emailAddresses` 里拿到。

`new CNLabeledValue()` 抛 `TypeError: Illegal constructor: CNLabeledValue is a read-only value handed over by CNContactPickerViewController, not created by new`。

## 静态方法

[`CNLabeledValue.localizedStringForLabel()`](cn-labeled-value/localizedstringforlabel.md)

把标签的原文换成当前语言下给人看的写法。

## 实例属性

都是只读的。还继承 `NSObject` 的属性。

| 属性 | 说明 |
| --- | --- |
| [`value`](cn-labeled-value/value.md) <small>只读</small> | 值。电话是 `CNPhoneNumber`，邮箱是字符串 |
| [`label`](cn-labeled-value/label.md) <small>只读</small> | 标签的原文。没有标签是 `null` |
| [`identifier`](cn-labeled-value/identifier.md) <small>只读</small> | 这一项在这台设备上的标识 |

## 标签的原文

标签的原文分两种：

- **系统自带的标签**存的是一个记号，不是给人看的文字。在 macOS 上量到的几个（同一个系统框架，iOS 上未验证）：`_$!<Mobile>!$_`（手机）、`_$!<Home>!$_`（住宅）、`_$!<Work>!$_`（工作）、`_$!<Main>!$_`（主要）、`_$!<Other>!$_`（其他），以及 `iPhone`。
- **用户自己起的标签**存的就是用户输入的文字。

[`CNLabeledValue.localizedStringForLabel()`](cn-labeled-value/localizedstringforlabel.md) 两种都能处理：系统自带的换成当前语言下的写法，用户自己起的原样还回来。所以显示标签之前先用它换一下。

## 示例

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/contacts" />

const picker = new CNContactPickerViewController();
picker.addEventListener('contactselect', (event) => {
  for (const item of event.contact.phoneNumbers) {
    const label = item.label === null ? '' : CNLabeledValue.localizedStringForLabel(item.label);
    console.log(label, item.value.stringValue);
  }
});
```

**效果**：每行输出一个电话的标签和号码，比如中文系统上是 `手机 555-0100`。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `labeledValue.value`、`label`、`identifier` | 相同 |
| `[CNLabeledValue localizedStringForLabel:label]` | `CNLabeledValue.localizedStringForLabel(label)` |

## 还不能做的

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 判断一个标签是不是「手机」 | `CNLabelPhoneNumberMobile` 等常量。未实现，现在只能和标签的原文比较 |

## 参见

- [`CNContact`](cn-contact.md)：`phoneNumbers` 和 `emailAddresses`
- [`CNPhoneNumber`](cn-phone-number.md)：电话那一项的 `value`
