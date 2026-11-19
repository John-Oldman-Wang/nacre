---
type: reference
web: Headers()
---

# `Headers()` 构造函数

**`Headers()`** 构造函数创建一组请求头或响应头。

## 语法

```
new Headers([init])
```

### 参数

**`init`**

可选。初始内容。不传、传 `null` 或 `undefined` 得到空的一组。

| 写法 | 例 | 说明 |
| --- | --- | --- |
| 普通对象 | `{ Accept: 'a' }` | 每个属性一个头 |
| 数组 | `[['Accept', 'a'], ['Accept', 'b']]` | 可以表示同名的多个值。每一项必须正好是两个元素 |
| 另一个 `Headers` | | 复制一份，两者之后互不影响 |

对象和数组里的每一项按 [`append()`](append.md) 加入，名字和值的检查规则相同。

### 返回值

新建的 `Headers`。

### 异常

**`TypeError`**

- 数组写法里有一项不是正好两个元素的数组：`Headers in array form needs every entry to be [name, value]`
- 名字不合法：`Invalid header name: "坏 名字"`
- 值的中间有 NUL、回车或换行：`Header value cannot contain NUL, CR or LF`

## 示例

```js
const h = new Headers({ 'Content-Type': 'application/json' });
console.log(h.get('content-type'));
```

**结果**：输出 `application/json`。

## 和 Web 的差别

不限制名字：`Host`、`Cookie`、`Origin` 这些名字都可以设置。浏览器在发请求时禁止或忽略这些名字。

## 参见

- [`append()`](append.md)：名字和值的检查规则
- [`fetch()`](../fetch.md)：把 `Headers` 作请求头
