---
type: reference
web: URLSearchParams.entries()
---

# `URLSearchParams`：`entries()` 方法

**`entries()`** 方法返回一个迭代器，按列表顺序给出每个参数的 `[名字, 值]`。

## 语法

```
entries()
```

### 参数

无。

### 返回值

迭代器，每一项是 `[名字, 值]` 两个字符串组成的数组。

### 异常

无。

## 说明

`for...of` 直接遍历 `URLSearchParams` 等于遍历 `entries()`。列表在遍历期间被修改时，遍历的仍是开始时的那一份。**未在模拟器验证。**

## 示例

```js
const q = new URLSearchParams('a=1&b=2');
for (const [name, value] of q) {
  console.log(name, value);
}
```

**结果**：输出 `a 1` 和 `b 2`。**未在模拟器验证。**

## 和 Web 的差别

和 Web 相同。

## 参见

- [`forEach()`](foreach.md)
