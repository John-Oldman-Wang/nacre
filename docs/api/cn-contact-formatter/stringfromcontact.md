---
type: reference
native: "+[CNContactFormatter stringFromContact:style:]"
---

# `CNContactFormatter.stringFromContact()` 静态方法

**`CNContactFormatter.stringFromContact()`** 静态方法把一个联系人的姓名拼成一行。

## 语法

```
CNContactFormatter.stringFromContact(contact, { style })
```

### 参数

**`contact`**

一个 [`CNContact`](../cn-contact.md)。

**`options.style`**

拼哪一组字段，必填：

| 取值 | 效果 |
| --- | --- |
| `'fullName'` | 姓名。名是 Alex、姓是 Chen 的联系人得到 `Alex Chen`；名是「小明」、姓是「陈」的联系人得到 `陈小明`。只填了公司的联系人得到公司名 |
| `'phoneticFullName'` | 姓名的注音（通讯录里给姓和名填的拼音或读音）。没填注音时是 `null` |

`fullName` 的三个结果是在 macOS 上用同一个系统框架量的，iOS 上**未验证**。

### 返回值

字符串，或者 `null`。这个联系人没有可拼的内容时是 `null`：比如姓名和公司都没填的联系人，`fullName` 给的是 `null`。

### 异常

**`TypeError`**

- `style` 没写或者写错：`style has no value "short"; expected one of: fullName / phoneticFullName`
- 第一个参数不是联系人：`stringFromContact needs a CNContact`
- 联系人没带拼姓名要用的字段：`stringFromContact: this contact does not carry the name fields this style needs`

## 示例

```js
const picker = new CNContactPickerViewController();
picker.addEventListener('contactselect', (event) => {
  const contact = event.contact;
  const name = CNContactFormatter.stringFromContact(contact, { style: 'fullName' });
  const phonetic = CNContactFormatter.stringFromContact(contact, { style: 'phoneticFullName' });
  console.log(name ?? '（没有名字）', phonetic ?? '（没有注音）');
});
```

**效果**：选中「陈小明」、注音填了 Chen Xiaoming 的联系人时，输出 `陈小明 Chen Xiaoming`。只填了公司的联系人，第一项是公司名。**注音那一项未在模拟器验证。**

## 对应的 iOS API

`+[CNContactFormatter stringFromContact:style:]`。`CNContactFormatterStyleFullName` 写成 `'fullName'`，`CNContactFormatterStylePhoneticFullName` 写成 `'phoneticFullName'`。

## 参见

- [`CNContact`](../cn-contact.md)
- [安装 `@nacrejs/contacts`](../contacts.md#先装上)
