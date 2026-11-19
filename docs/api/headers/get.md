---
type: reference
web: Headers.get()
---

# `Headers`：`get()` 方法

**`get()`** 方法返回某个名字的值。

## 语法

```
get(name)
```

### 参数

**`name`**

头的名字，字符串，不区分大小写。不是字符串的值先转成字符串。

### 返回值

字符串。有多个值时用 `, `（逗号加空格）连成一个字符串。没有这个名字返回 `null`。

### 异常

**`TypeError`**

名字不合法：`Invalid header name: "坏 名字"`。名字只能由字母、数字和 ``!#$%&'*+-.^_`|~`` 这些符号组成，不能为空。

## 说明

`Set-Cookie` 的值里本身可能有逗号，连成一个字符串之后分不开。读它用 [`getSetCookie()`](getsetcookie.md)。

## 示例

```js
const h = new Headers();
h.append('Accept', 'a');
h.append('accept', 'b');
console.log(h.get('ACCEPT'), h.get('X-None'));
```

**结果**：输出 `a, b null`。

## 和 Web 的差别

和 Web 相同。

## 参见

- [`getSetCookie()`](getsetcookie.md)
- [`has()`](has.md)
