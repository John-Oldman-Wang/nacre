---
type: reference
native: UIBarItem.tag
---

# `UIBarItem`：`tag` 属性

**`tag`** 属性是给自己用的编号。系统不看它。

## 值

整数。

- 可读，可写。
- 默认值是 `0`。
- 写入时按 `Number(v)` 转换后向零取整；转不成有限的数抛 `TypeError`。
- 变化时不派发事件：它只会被代码改变。

## 示例

```js
const item = new UIBarButtonItem({ title: '第二个' });
item.tag = 2;
console.log(item.tag);
```

**结果**：控制台输出 `2`。

## 对应的 iOS API

`UIBarItem.tag`。

## 参见

- [`UIBarItem`](../ui-bar-item.md)
