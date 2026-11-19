---
type: reference
native: "-[UIAlertController addAction:]"
---

# `UIAlertController`：`addAction()` 方法

**`addAction()`** 方法往弹窗上加一个按钮。

## 语法

```
addAction(action)
```

### 参数

**`action`**

一个 [`UIAlertAction`](../ui-alert-action.md)，用 [`UIAlertAction.actionWithTitle()`](../ui-alert-action/actionwithtitle.md) 创建。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

- 给的不是 `UIAlertAction`：`addAction needs a UIAlertAction`。
- 弹窗里已经有一个取消样式的按钮，又加一个：`addAction: an alert can have only one action with the cancel style`。

## 说明

- 按钮在弹窗上的顺序是加进来的顺序；取消样式的按钮由系统安排位置。提示框里两个按钮左右排，三个以上上下排，**未在模拟器验证**。
- 加进来的按钮由弹窗保留。JS 这边不再保留它的引用，它和它的监听器也不会丢。
- 同一个按钮加两次，系统不拒绝，[`actions`](actions.md) 里出现两个。不要这样用。
- 弹窗已经在屏幕上之后再加按钮，会发生什么**未在模拟器验证**。在弹出之前把按钮加完。

## 示例

```js
const alert = UIAlertController.alertControllerWithTitle('提示', {
  preferredStyle: 'alert',
});
alert.addAction(UIAlertAction.actionWithTitle('好', { style: 'default' }));
console.log(alert.actions.length);
```

**结果**：控制台输出 `1`。

## 对应的 iOS API

`-[UIAlertController addAction:]`。

## 参见

- [`UIAlertAction`](../ui-alert-action.md)
- [`actions`](actions.md)
- [`preferredAction`](preferredaction.md)
