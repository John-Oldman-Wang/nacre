---
type: reference
native: "-[CNContactPickerDelegate contactPickerDidCancel:]"
---

# `CNContactPickerViewController`：`cancel` 事件

**`cancel`** 事件在用户没选就点了「取消」时派发。

## 语法

```
picker.addEventListener('cancel', (event) => { })
```

## 事件对象

`Event`，没有多出的字段。`target` 是这个选择器。不能取消，`preventDefault()` 不起作用。

## 什么时候派发

- 用户点了「取消」。选择器随即由系统关掉。
- 和选法无关：三种选法下都会派发。
- 派发了它，就不会再派发三个「选中了」的事件。
- 用代码 `dismissViewController()` 关掉选择器时派不派发，没有验证。

这些行为**未在模拟器验证**。

## 示例

```js
const page = new UIViewController();
const picker = new CNContactPickerViewController();
picker.addEventListener('contactselect', () => {
  console.log('选了');
});
picker.addEventListener('cancel', () => {
  console.log('没有选');
});
page.presentViewController(picker, { animated: true });
```

**效果**：用户点「取消」，选择器关掉，控制台输出 `没有选`。

## 对应的 iOS API

`-[CNContactPickerDelegate contactPickerDidCancel:]`。

## 参见

- [选择器什么时候结束](../contacts.md#选择器什么时候结束)
- [安装 `@nacrejs/contacts`](../contacts.md#先装上)
