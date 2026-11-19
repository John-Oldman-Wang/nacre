---
type: reference
web: URL.parse()
---

# `URL.parse()` 静态方法

**`URL.parse()`** 静态方法解析一串地址文本，解析不了时返回 `null`。它不抛异常。

## 语法

```
URL.parse(url[, base])
```

### 参数

**`url`**

地址文本，或者 `URL`。

**`base`**

可选。解析相对地址的起点。和 [`URL()`](constructor.md) 的 `base` 相同。

### 返回值

能解析时返回新建的 `URL`，不能时返回 `null`。返回值可能是 `null`，用之前先判空。

### 异常

无。

## 示例

```js
const parsed = URL.parse('https://a.com/x');
if (parsed) {
  console.log(parsed.pathname);
}
console.log(URL.parse('/x'));
```

**结果**：输出 `/x`，然后 `null`。

## 和 Web 的差别

相对地址没有起点时返回 `null`，原因见 [`URL()`](constructor.md)。

## 参见

- [`URL.canParse()`](canparse.md)：只判断，不要结果
