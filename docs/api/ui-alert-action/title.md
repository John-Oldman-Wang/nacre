---
type: reference
native: UIAlertAction.title
---

# `UIAlertAction`：`title` 属性

**`title`** 属性是弹窗按钮上的字。

## 值

字符串。

- 只读。给它赋值抛 `TypeError`。
- 值是创建时 [`actionWithTitle()`](actionwithtitle.md) 给的。创建时给 `null` 或 `undefined` 的，这里是空串。
- 要换标题，新建一个按钮。

## 示例

```js
const ok = UIAlertAction.actionWithTitle('知道了', { style: 'default' });
console.log(ok.title);
```

**结果**：控制台输出 `知道了`。

## 对应的 iOS API

`UIAlertAction.title`。

## 参见

- [`style`](style.md)
