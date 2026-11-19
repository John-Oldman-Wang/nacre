---
type: reference
native: CNContact
status: partial
---

# `CNContact`

**`CNContact`** 表示通讯录里的一个联系人：姓名、公司、电话、邮箱。它由[通讯录选择器](contacts.md)在用户选中之后交给 App。

它是选中那一刻的副本，只读。用户之后在通讯录里改了这个联系人，App 手里的不会变，也收不到通知。

要先装 `@nacrejs/contacts`，装法见 [`CNContactPickerViewController`](contacts.md#先装上)。能力包是什么，见[核心和能力包](capabilities.md)。

**继承关系**：`EventTarget` → `NSObject` → `CNContact`

## 构造函数

不能用 `new` 创建，只能从选择器的事件里拿到：[`contactselect`](contacts/contactselect-event.md) 的 `contact`、[`contactsselect`](contacts/contactsselect-event.md) 的 `contacts`、[`CNContactProperty`](cn-contact-property.md) 的 `contact`。

`new CNContact()` 抛 `TypeError: Illegal constructor: CNContact is a read-only value handed over by CNContactPickerViewController, not created by new`。

## 实例属性

都是只读的。还继承 `NSObject` 的属性。

| 属性 | 说明 |
| --- | --- |
| [`identifier`](cn-contact/identifier.md) <small>只读</small> | 这个联系人在这台设备上的标识 |
| [`givenName`](cn-contact/givenname.md) <small>只读</small> | 名 |
| [`familyName`](cn-contact/familyname.md) <small>只读</small> | 姓 |
| [`organizationName`](cn-contact/organizationname.md) <small>只读</small> | 公司或组织 |
| [`phoneNumbers`](cn-contact/phonenumbers.md) <small>只读</small> | 电话，带标签 |
| [`emailAddresses`](cn-contact/emailaddresses.md) <small>只读</small> | 邮箱，带标签 |

## 实例方法

| 方法 | 说明 |
| --- | --- |
| [`isKeyAvailable()`](cn-contact/iskeyavailable.md) | 这个联系人带没带某个字段 |

## 联系人带着哪些字段

系统交给 App 的联系人不保证带着所有字段。读一个没带的字段抛 `TypeError`，报错里给出该先问的那一句：

```
CNContact.givenName is not available on this contact; check contact.isKeyAvailable("givenName") first
```

`givenName`、`familyName`、`organizationName`、`phoneNumbers`、`emailAddresses` 读之前都会这样检查。选择器交回来的联系人是否总是带着这些字段，还没有验证；拿不准时先用 [`isKeyAvailable()`](cn-contact/iskeyavailable.md) 问。

## 字段名

[`isKeyAvailable()`](cn-contact/iskeyavailable.md) 和选择器的 [`displayedPropertyKeys`](contacts/displayedpropertykeys.md) 用的名字。它们是联系人在系统里的全部字段，比 `CNContact` 上现在能读的成员多：没做成成员的字段照样可以让详情页显示。

| 字段名 | 含义 |
| --- | --- |
| `'identifier'` | 标识 |
| `'namePrefix'`、`'givenName'`、`'middleName'`、`'familyName'`、`'previousFamilyName'`、`'nameSuffix'`、`'nickname'` | 称谓、名、中间名、姓、曾用姓、后缀、昵称 |
| `'phoneticGivenName'`、`'phoneticMiddleName'`、`'phoneticFamilyName'`、`'phoneticOrganizationName'` | 名、中间名、姓、公司的注音 |
| `'organizationName'`、`'departmentName'`、`'jobTitle'` | 公司、部门、职位 |
| `'phoneNumbers'`、`'emailAddresses'`、`'postalAddresses'`、`'urlAddresses'` | 电话、邮箱、地址、网址 |
| `'birthday'`、`'nonGregorianBirthday'`、`'dates'` | 生日、农历等其他历法的生日、纪念日等日期 |
| `'contactRelations'`、`'socialProfiles'`、`'instantMessageAddresses'` | 关系人、社交账号、即时通信账号 |
| `'note'` | 备注 |
| `'imageData'`、`'thumbnailImageData'`、`'imageDataAvailable'` | 头像、头像的缩略图、有没有头像 |
| `'contactType'` | 是个人还是组织 |

## 示例

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/contacts" />

const picker = new CNContactPickerViewController();
picker.addEventListener('contactselect', (event) => {
  const contact = event.contact;
  console.log(contact.familyName, contact.givenName, contact.organizationName);
  for (const item of contact.phoneNumbers) {
    console.log(item.value.stringValue);
  }
});
```

**效果**：选择器弹出、用户选了一个联系人之后，第一行输出姓、名、公司（没填的是空串），接着每行一个电话。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `contact.givenName`、`contact.phoneNumbers` | 相同 |
| `contact.phoneNumbers[0].value.stringValue` | 相同 |
| `[contact isKeyAvailable:CNContactEmailAddressesKey]` | `contact.isKeyAvailable('emailAddresses')` |

## 参见

- [`CNContactPickerViewController`](contacts.md)：联系人从这里来
- [`CNLabeledValue`](cn-labeled-value.md)：`phoneNumbers` 和 `emailAddresses` 里每一项的类型
- [`CNContactFormatter`](cn-contact-formatter.md)：把姓名拼成一行
