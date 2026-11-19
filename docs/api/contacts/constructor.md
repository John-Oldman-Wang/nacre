---
type: reference
native: "-[CNContactPickerViewController init]"
---

# `CNContactPickerViewController()` 构造函数

**`CNContactPickerViewController()`** 构造函数创建一个通讯录选择器。

## 语法

```
new CNContactPickerViewController()
```

### 参数

无。

### 返回值

新建的 `CNContactPickerViewController`。每次调用得到一个新的对象。它还没有被弹出（`presentingViewController` 是 `null`），[`displayedPropertyKeys`](displayedpropertykeys.md) 是 `null`。

一个选择器用一次。用过一次之后再弹第二次会怎样没有验证，每次选都新建一个。

### 异常

**`TypeError`**

继承它再 `new`：原生类都不能继承，见[原生类](../native-classes.md)。

## 示例

```js
const picker = new CNContactPickerViewController();
console.log(picker instanceof UIViewController, picker.displayedPropertyKeys);
```

**结果**：输出 `true null`。

## 对应的 iOS API

`[[CNContactPickerViewController alloc] init]`。

## 参见

- [选法](../contacts.md#选法)：弹出之前先监听一个事件
- [安装 `@nacrejs/contacts`](../contacts.md#先装上)
