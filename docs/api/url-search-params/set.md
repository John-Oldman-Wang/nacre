---
type: reference
web: URLSearchParams.set()
---

# `URLSearchParams`：`set()` 方法

**`set()`** 方法把某个名字的参数设成一个值。

## 语法

```
set(name, value)
```

### 参数

**`name`**

参数名，字符串。不是字符串的值先转成字符串。

**`value`**

参数值，字符串。不是字符串的值先转成字符串。

### 返回值

无（`undefined`）。

### 异常

无。

## 说明

- 有同名参数时，第一个换成新值，位置不变；其余同名的被删掉。
- 没有同名参数时，加在末尾。
- 这个列表是某个 `URL` 的 [`searchParams`](../url/searchparams.md) 时，地址的 `search` 和 `href` 跟着变。

## 示例

```js
const q = new URLSearchParams('a=1&b=2&a=3');
q.set('a', '9');
console.log(q.toString());
```

**结果**：输出 `a=9&b=2`。

## 和 Web 的差别

和 Web 相同。

## 参见

- [`append()`](append.md)：追加而不是替换
