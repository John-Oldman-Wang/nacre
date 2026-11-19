---
type: reference
native: "-[UIAlertController addTextFieldWithConfigurationHandler:]"
---

# `UIAlertController`：`addTextField()` 方法

**`addTextField()`** 方法往提示框里加一个输入框，并把它返回。

## 语法

```
addTextField()
```

### 参数

无。

### 返回值

新加的 [`UITextField`](../ui-text-field.md)。它也是 [`textFields`](textfields.md) 的最后一个。

拿到之后照常配置（`placeholder`、`isSecureTextEntry`、键盘类型…），用户点按钮之后从它的 `text` 读结果。

### 异常

**`TypeError`**

在底部菜单（`preferredStyle` 是 `'actionSheet'`）上调用：`addTextField: text fields can only be added to an alert whose preferredStyle is "alert"`。

## 说明

- 可以加多个输入框，它们从上到下按加进来的顺序排列。**未在模拟器验证。**
- 提示框出现时键盘弹起。**未在模拟器验证。**

## 示例

```js
const alert = UIAlertController.alertControllerWithTitle('给相册起个名字', {
  preferredStyle: 'alert',
});
const field = alert.addTextField();
field.placeholder = '相册名';

const save = UIAlertAction.actionWithTitle('保存', { style: 'default' });
save.addEventListener('click', () => {
  console.log('名字是', field.text);
});
alert.addAction(save);
```

**效果**（**未在模拟器验证**）

- 弹出后，提示框里标题下面有一个输入框，里面是灰色的「相册名」。
- 输入 `旅行`，点「保存」，提示框消失，控制台输出 `名字是 旅行`。

## 对应的 iOS API

`-[UIAlertController addTextFieldWithConfigurationHandler:]`。ObjC 把新输入框交给配置用的 block；这里直接把它当返回值。

## 参见

- [`textFields`](textfields.md)
- [`UITextField`](../ui-text-field.md)
