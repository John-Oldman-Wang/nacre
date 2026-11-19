---
type: reference
web: URL.canParse()
---

# `URL.canParse()` 静态方法

**`URL.canParse()`** 静态方法判断一串文本能不能解析成地址。它不抛异常。

## 语法

```
URL.canParse(url[, base])
```

### 参数

**`url`**

地址文本，或者 `URL`。

**`base`**

可选。解析相对地址的起点。和 [`URL()`](constructor.md) 的 `base` 相同。

### 返回值

布尔。能解析返回 `true`，不能返回 `false`。

### 异常

无。

## 示例

```js
console.log(URL.canParse('/x'));
console.log(URL.canParse('https://a.com/x'));
console.log(URL.canParse('/x', 'https://a.com'));
```

**结果**：依次输出 `false`、`true`、`true`。第三行**未在模拟器验证**。

## 和 Web 的差别

相对地址没有起点时返回 `false`，原因见 [`URL()`](constructor.md)。

## 参见

- [`URL.parse()`](parse.md)：能解析时直接拿到结果
