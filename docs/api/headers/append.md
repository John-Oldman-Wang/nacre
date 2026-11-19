---
type: reference
web: Headers.append()
---

# `Headers`：`append()` 方法

**`append()`** 方法给某个名字追加一个值。原来的同名值保留。

## 语法

```
append(name, value)
```

### 参数

**`name`**

头的名字，字符串，不区分大小写。不是字符串的值先转成字符串。

**`value`**

头的值，字符串。不是字符串的值先转成字符串。首尾的空白（空格、制表符、回车、换行）被去掉：`'  v  '` 存进去是 `'v'`。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

名字不合法：`Invalid header name: "坏 名字"`。名字只能由字母、数字和 ``!#$%&'*+-.^_`|~`` 这些符号组成，不能为空。

值的中间有 NUL、回车或换行：`Header value cannot contain NUL, CR or LF`。

## 示例

```js
const h = new Headers();
h.append('Accept', 'a');
h.append('accept', 'b');
console.log(h.get('ACCEPT'));
```

**结果**：输出 `a, b`。同名的多个值读出来时用 `, ` 连成一个字符串。

## 和 Web 的差别

不限制名字：`Host`、`Cookie`、`Origin` 这些名字都可以设置。浏览器在发请求时禁止或忽略这些名字。

## 参见

- [`set()`](set.md)：覆盖而不是追加
- [`getSetCookie()`](getsetcookie.md)
