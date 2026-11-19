---
type: reference
web: URLSearchParams.sort()
---

# `URLSearchParams`：`sort()` 方法

**`sort()`** 方法按名字给参数排序。

## 语法

```
sort()
```

### 参数

无。

### 返回值

无（`undefined`）。

### 异常

无。

## 示例

```js
const q = new URLSearchParams('b=1&a=2&b=0&a=1');
q.sort();
console.log(q.toString());
```

**结果**：输出 `a=2&a=1&b=1&b=0`。名字按 UTF-16 码元的顺序比较；同名的保持原来的先后。**未在模拟器验证。**

## 和 Web 的差别

和 Web 相同。

## 参见

- [`toString()`](tostring.md)
