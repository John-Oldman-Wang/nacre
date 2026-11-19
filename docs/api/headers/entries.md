---
type: reference
web: Headers.entries()
---

# `Headers`：`entries()` 方法

**`entries()`** 方法返回一个迭代器，依次给出每个头的 `[名字, 值]`。

## 语法

```
entries()
```

### 参数

无。

### 返回值

迭代器，每一项是 `[名字, 值]` 两个字符串组成的数组。按名字的字母顺序给出，和加入的先后无关。名字都是小写。同名的多个值用 `, ` 连成一项；`Set-Cookie` 例外，有几条就出现几次。

### 异常

无。

## 说明

`for...of` 直接遍历 `Headers` 等于遍历 `entries()`。

## 示例

```js
const h = new Headers({ 'Content-Type': 'application/json', Accept: 'a' });
for (const [name, value] of h) {
  console.log(name, value);
}
```

**结果**：输出 `accept a` 和 `content-type application/json`。

## 和 Web 的差别

和 Web 相同。

## 参见

- [`keys()`](keys.md)
- [`values()`](values.md)
- [`forEach()`](foreach.md)
