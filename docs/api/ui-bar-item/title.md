---
type: reference
native: UIBarItem.title
---

# `UIBarItem`：`title` 属性

**`title`** 属性是导航条按钮或标签上的文字。

## 值

字符串，或者 `null`。

- 可读，可写。
- 默认值是 `null`。用构造参数 `{ title }` 创建的按钮是给的那个值。
- 写入的不是字符串时按 `String()` 转；写 `null` 或 `undefined` 得到 `null`。
- 用了 [`customView`](../ui-bar-button-item/customview.md) 的按钮不显示它。
- 变化时不派发事件：它只会被代码改变。

## 示例

```js
const item = new UIBarButtonItem();
console.log(item.title);
item.title = '完成';
console.log(item.title);
```

**结果**：先输出 `null`，再输出 `完成`。

## 对应的 iOS API

`UIBarItem.title`。

## 参见

- [`image`](image.md)
