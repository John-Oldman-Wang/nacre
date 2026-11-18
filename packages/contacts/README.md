# `@nacrejs/contacts`

Nacre 的通讯录选择器：让用户从通讯录里选联系人。**装了才有 `CNContactPickerViewController` 这一组类。**

用的是系统的选择器。它在系统自己的进程里运行，App 只拿得到用户选中的联系人，**不需要通讯录权限**：装这个包的项目不用在 `nacre.config.json` 里写权限文案，清单里 `requires.infoPlist` 是空的。

```
packages/contacts/
├─ index.d.ts                  类型：选择器、联系人那一组只读的值、姓名的格式化
├─ nacre-ios.json              清单：这是一个能力包、它的 framework 叫什么、它不要项目写任何键
└─ NacreContacts.xcframework/  预编译的 framework（构建产物，不提交）
```

源码不在这里，在 `ios/Capabilities/Contacts/`。`ios/` 下是源码，`packages/` 下是交付出去的东西。

## 怎么用

见 [API 文档](../../docs/api/contacts.md)。装上、加一行类型引用，就能用。

## 这个包不做的

读整个通讯录、新建和修改联系人、通讯录的变化通知。这三样都要用 `CNContactStore`，用了它项目就必须写 `NSContactsUsageDescription`，而这个包的目的是不需要权限。

## 没装的时候

| | |
| --- | --- |
| 生成的工程 | 不嵌 `NacreContacts.framework`，产物里没有它，也不链接系统的 Contacts 和 ContactsUI |
| 运行时 | 全局没有 `CNContactPickerViewController`、`CNContact` 这些类 |
| 类型检查 | 写到这些类报 `Cannot find name` |

---

← 返回[项目说明](../../docs/project.md) ・ [实现原理](../../docs/internals/contacts.md) ・ [能力包是怎么搭的](../../docs/internals/capabilities.md)
