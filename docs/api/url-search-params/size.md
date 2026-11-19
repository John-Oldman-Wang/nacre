---
type: reference
web: URLSearchParams.size
---

# `URLSearchParams`：`size` 属性

**`size`** 属性是列表里参数的个数。

## 值

数，个数。

- 只读。给它赋值抛 `TypeError`。
- 同名的参数分别计数：`a=1&b=2&a=3` 的 `size` 是 3。
- 列表变化时没有事件通知：只有 App 自己的代码能改它。

## 示例

```js
const q = new URLSearchParams('a=1&b=2&a=3');
console.log(q.size);
```

**结果**：输出 `3`。

## 和 Web 的差别

和 Web 相同。

## 参见

- [`getAll()`](getall.md)：同名的全部值
