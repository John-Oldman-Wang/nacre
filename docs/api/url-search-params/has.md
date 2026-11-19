---
type: reference
web: URLSearchParams.has()
---

# `URLSearchParams`：`has()` 方法

**`has()`** 方法判断列表里有没有某个参数。

## 语法

```
has(name[, value])
```

### 参数

**`name`**

参数名，字符串。不是字符串的值先转成字符串。

**`value`**

可选。传了它，要求名字和值都相同。

### 返回值

布尔。

### 异常

无。

## 示例

```js
const q = new URLSearchParams('a=1&b=2');
console.log(q.has('a'), q.has('a', '2'), q.has('c'));
```

**结果**：输出 `true false false`。**未在模拟器验证。**

## 和 Web 的差别

和 Web 相同。

## 参见

- [`get()`](get.md)
