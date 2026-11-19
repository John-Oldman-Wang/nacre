---
type: reference
web: URLSearchParams.delete()
---

# `URLSearchParams`：`delete()` 方法

**`delete()`** 方法删掉某个名字的参数。

## 语法

```
delete(name[, value])
```

### 参数

**`name`**

参数名，字符串。不是字符串的值先转成字符串。

**`value`**

可选。传了它，只删名字和值都相同的。

### 返回值

无（`undefined`）。

### 异常

无。

## 说明

没传 `value` 时，同名的全部删掉。这个列表是某个 `URL` 的 [`searchParams`](../url/searchparams.md) 时，地址跟着变。

## 示例

```js
const q = new URLSearchParams('a=9&b=2&c=3&a=1');
q.delete('a');
console.log(q.toString());
q.delete('c', '4');
console.log(q.toString());
```

**结果**：输出 `b=2&c=3`，然后还是 `b=2&c=3`：值不同，没有删。第二行**未在模拟器验证**。

## 和 Web 的差别

和 Web 相同。

## 参见

- [`set()`](set.md)
