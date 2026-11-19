---
type: reference
native: UIAlertAction.style
---

# `UIAlertAction`：`style` 属性

**`style`** 属性是弹窗按钮的样式。

## 值

字符串，`'default'`、`'cancel'`、`'destructive'` 之一。每个取值的效果见[按钮的三种样式](../ui-alert-action.md#按钮的三种样式)。

- 只读。给它赋值抛 `TypeError`。
- 值是创建时 [`actionWithTitle()`](actionwithtitle.md) 的 `options.style`。要换样式，新建一个按钮。

## 示例

```js
const cancel = UIAlertAction.actionWithTitle('取消', { style: 'cancel' });
console.log(cancel.style);
```

**结果**：控制台输出 `cancel`。

## 对应的 iOS API

`UIAlertAction.style`。`UIAlertActionStyleCancel` 写成 `'cancel'`，其余同理。

## 参见

- [`title`](title.md)
