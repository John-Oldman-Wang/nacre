---
type: reference
web: Request.method
---

# `Request`：`method` 属性

**`method`** 属性是请求方法，大写。

## 值

字符串，比如 `'GET'`、`'POST'`。

- 可读，不可写。
- 构造时没给是 `'GET'`。
- 构造时给的方法名转成大写：`'post'` 变成 `'POST'`。

## 示例

```js
const req = new Request('https://httpbin.org/post', { method: 'post' });
console.log(req.method);
```

**结果**：输出 `POST`。

## 和 Web 的差别

所有方法名都转成大写。Web 只把 `DELETE`、`GET`、`HEAD`、`OPTIONS`、`POST`、`PUT` 转成大写，`'patch'` 保持原样。**来自代码，未在模拟器验证。**

## 参见

- [`Request()`](constructor.md)
