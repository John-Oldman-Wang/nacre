---
type: reference
native: "-[CNContact isKeyAvailable:]"
---

# `CNContact`：`isKeyAvailable()` 方法

**`isKeyAvailable()`** 方法回答这个联系人带没带某个字段。读一个没带的字段会抛 `TypeError`，拿不准时先用它问。

## 语法

```
isKeyAvailable(key)
```

### 参数

**`key`**

[字段名](../cn-contact.md#字段名)，字符串，比如 `'emailAddresses'`。

### 返回值

布尔。

- `true`：这个联系人带着这个字段，可以读。
- `false`：没带。

### 异常

**`TypeError`**

不认识的字段名：`isKeyAvailable has no value "phone"; expected one of: …`，后面列出全部字段名。

## 示例

```js
const picker = new CNContactPickerViewController();
picker.addEventListener('contactselect', (event) => {
  const contact = event.contact;
  if (contact.isKeyAvailable('emailAddresses')) {
    console.log(contact.emailAddresses.length);
  }
});
```

**效果**：联系人带着邮箱字段时，输出邮箱的个数。

## 对应的 iOS API

`-[CNContact isKeyAvailable:]`。键名常量 `CNContactEmailAddressesKey` 写成 `'emailAddresses'`，其余同理。

## 参见

- [联系人带着哪些字段](../cn-contact.md#联系人带着哪些字段)
- [安装 `@nacrejs/contacts`](../contacts.md#先装上)
