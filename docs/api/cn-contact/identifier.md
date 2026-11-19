---
type: reference
native: CNContact.identifier
---

# `CNContact`：`identifier` 属性

**`identifier`** 属性是这个联系人在这台设备上的标识。

## 值

字符串，非空。

- 只读。给它赋值抛 `TypeError`。
- 联系人是选中那一刻的副本，这个值不会变，所以没有变化事件。
- 可以保存下来，用来认出下次选中的是不是同一个联系人。
- 它只在这台设备上有意义。

## 示例

```js
const picker = new CNContactPickerViewController();
let lastId = '';
picker.addEventListener('contactselect', (event) => {
  console.log(event.contact.identifier === lastId ? '还是上次那个人' : '换了一个人');
  lastId = event.contact.identifier;
});
```

**效果**：选中的联系人和上次相同时输出 `还是上次那个人`，否则输出 `换了一个人`。

## 对应的 iOS API

`CNContact.identifier`。

## 参见

- [`CNContact`](../cn-contact.md)
- [安装 `@nacrejs/contacts`](../contacts.md#先装上)
