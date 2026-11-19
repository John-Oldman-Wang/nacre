---
type: reference
web: Headers.values()
---

# `Headers`：`values()` 方法

**`values()`** 方法返回一个迭代器，依次给出每个头的值。

## 语法

```
values()
```

### 参数

无。

### 返回值

迭代器，每一项是一个字符串。顺序和 [`entries()`](entries.md) 相同：按名字的字母顺序给出，和加入的先后无关。名字都是小写。同名的多个值用 `, ` 连成一项；`Set-Cookie` 例外，有几条就出现几次。

### 异常

无。

## 示例

```js
const h = new Headers({ 'Content-Type': 'application/json', Accept: 'a' });
console.log(Array.from(h.values()));
```

**结果**：输出 `['a', 'application/json']`。**未在模拟器验证。**

## 和 Web 的差别

和 Web 相同。

## 参见

- [`entries()`](entries.md)
