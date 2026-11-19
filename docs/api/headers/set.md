---
type: reference
web: Headers.set()
---

# `Headers`：`set()` 方法

**`set()`** 方法把某个名字设成一个值。原来的同名值全部被覆盖。

## 语法

```
set(name, value)
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
h.append('Accept', 'b');
h.set('accept', 'c');
console.log(h.get('Accept'));
```

**结果**：输出 `c`。**未在模拟器验证。**

## 和 Web 的差别

不限制名字：`Host`、`Cookie`、`Origin` 这些名字都可以设置。浏览器在发请求时禁止或忽略这些名字。

## 参见

- [`append()`](append.md)：追加而不是覆盖
