---
type: reference
native: UIAlertController.actions
---

# `UIAlertController`：`actions` 属性

**`actions`** 属性是加到弹窗上的全部按钮。

## 值

[`UIAlertAction`](../ui-alert-action.md) 的数组，按加进来的顺序排。

- 只读。给它赋值抛 `TypeError`。加按钮用 [`addAction()`](addaction.md)。
- 默认值是空数组。
- 读回来的按钮和加进去的是同一个对象，挂在它上面的监听器和自己的数据都还在，即使加进去之后 JS 这边没有再保留它的引用。

## 示例

```js
const alert = UIAlertController.alertControllerWithTitle('选一个', {
  preferredStyle: 'alert',
});
alert.addAction(UIAlertAction.actionWithTitle('好', { style: 'default' }));
alert.addAction(UIAlertAction.actionWithTitle('取消', { style: 'cancel' }));
console.log(alert.actions.map((a) => a.title).join(','));
```

**结果**：控制台输出 `好,取消`。

## 对应的 iOS API

`UIAlertController.actions`。

## 参见

- [`addAction()`](addaction.md)
- [`UIAlertAction`](../ui-alert-action.md)
