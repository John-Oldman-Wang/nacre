---
type: reference
native: CNContactPickerViewController.displayedPropertyKeys
---

# `CNContactPickerViewController`：`displayedPropertyKeys` 属性

**`displayedPropertyKeys`** 属性决定联系人详情里显示哪些字段。

## 值

[字段名](../cn-contact.md#字段名)的数组，或者 `null`。

| 取值 | 效果 |
| --- | --- |
| `null` | 详情里显示全部字段 |
| 字段名的数组，比如 `['phoneNumbers']` | 详情里只显示这些字段 |

- 可读，可写。
- 默认值是 `null`。写 `undefined` 也得到 `null`。
- 只对「选某一项」的选法（监听 [`contactpropertyselect`](contactpropertyselect-event.md)）有意义：单选和多选不进详情。
- 可以写 `CNContact` 上没有做成成员的字段名，比如 `'postalAddresses'`：详情里照样显示它，只是 App 读不到它的值。
- 只有 App 自己能改它，所以没有变化事件。

### 写错时

- 数组里有不认识的名字、或者有不是字符串的项：不抛异常，整次赋值不生效，属性保持原来的值，控制台输出一条警告。数组里写对的字段名不会被单独应用。警告是：

  ```
  [Nacre] displayedPropertyKeys has no value "phone"; expected one of: identifier / namePrefix / givenName / …, ignored
  ```

  省略号处列出全部字段名。
- 给的不是数组也不是 `null`：抛 `TypeError`，原来的值不变。`got` 后面是实际给的值：

  ```
  displayedPropertyKeys must be an array of contact key names or null, got "phoneNumbers"
  ```

## 示例

```js
const picker = new CNContactPickerViewController();
picker.displayedPropertyKeys = ['phoneNumbers', 'emailAddresses'];
console.log(picker.displayedPropertyKeys);
```

**效果**：输出 `["phoneNumbers", "emailAddresses"]`。弹出之后，联系人详情里只有电话和邮箱。

## 对应的 iOS API

`CNContactPickerViewController.displayedPropertyKeys`。键名常量 `CNContactPhoneNumbersKey` 写成 `'phoneNumbers'`，其余同理，见[字段名](../cn-contact.md#字段名)。

## 参见

- [`contactpropertyselect`](contactpropertyselect-event.md)：点详情里的一项
- [让用户选一个电话号码](../../guides/pick-contact.md#让用户选一个电话号码)
- [安装 `@nacrejs/contacts`](../contacts.md#先装上)
