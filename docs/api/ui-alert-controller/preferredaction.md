---
type: reference
native: UIAlertController.preferredAction
---

# `UIAlertController`：`preferredAction` 属性

**`preferredAction`** 属性是提示框里加粗显示的那个按钮。接了键盘时按回车触发的也是它。

## 值

[`UIAlertAction`](../ui-alert-action.md)，或者 `null`。

- 可读，可写。
- 默认值是 `null`，没有加粗的按钮。
- 必须是已经用 [`addAction()`](addaction.md) 加进这个弹窗的按钮，所以写在 `addAction()` 之后。
- 屏幕上的加粗效果和按回车的行为**未在模拟器验证**。
- 变化时不派发事件：它只有 App 自己能改。

### 写错时

- 给的不是 `UIAlertAction` 也不是 `null`：抛 `TypeError`。
- 给的按钮不在这个弹窗里：抛 `TypeError: preferredAction must be one of this alert's actions; add it with addAction() first`。

## 示例

```js
const alert = UIAlertController.alertControllerWithTitle('保存修改？', {
  preferredStyle: 'alert',
});
const save = UIAlertAction.actionWithTitle('保存', { style: 'default' });
alert.addAction(UIAlertAction.actionWithTitle('取消', { style: 'cancel' }));
alert.addAction(save);
alert.preferredAction = save;
```

**效果**（**未在模拟器验证**）：提示框里「保存」的标题加粗显示。接了键盘时按回车等于点它。

## 对应的 iOS API

`UIAlertController.preferredAction`。

## 参见

- [`addAction()`](addaction.md)
