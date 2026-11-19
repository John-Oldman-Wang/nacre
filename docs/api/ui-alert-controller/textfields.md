---
type: reference
native: UIAlertController.textFields
---

# `UIAlertController`：`textFields` 属性

**`textFields`** 属性是加到提示框里的全部输入框。

## 值

[`UITextField`](../ui-text-field.md) 的数组，按加进来的顺序排。

- 只读。给它赋值抛 `TypeError`。加输入框用 [`addTextField()`](addtextfield.md)。
- 默认值是空数组。底部菜单上永远是空数组。
- 弹窗关掉之后输入框还在，`text` 是用户输入的内容。在按钮的 `click` 回调里从这里读结果。
- 读回来的输入框和 `addTextField()` 返回的是同一个对象，挂在它上面的自己的数据都还在。

## 示例

```js
const alert = UIAlertController.alertControllerWithTitle('登录', {
  preferredStyle: 'alert',
});
alert.addTextField().placeholder = '用户名';
alert.addTextField().placeholder = '密码';
console.log(alert.textFields.length);
```

**结果**：控制台输出 `2`。

## 对应的 iOS API

`UIAlertController.textFields`。ObjC 里没有输入框时是 `nil`，这里是空数组。

## 参见

- [`addTextField()`](addtextfield.md)
