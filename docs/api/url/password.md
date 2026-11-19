---
type: reference
web: URL.password
---

# `URL`：`password` 属性

**`password`** 属性是地址里的密码，也就是用户名后面、`@` 前面的那一段。

## 值

字符串。

- 可读，可写。
- 地址里没有密码时是空字符串。
- 没有用户名时，[`href`](href.md) 里不出现密码。
- 例：`https://u:p@a.com:8080/p/q?x=1#f` 的 `password` 是 `p`。

### 写错时

赋值后整个地址重新解析一遍。新值让地址不合法时，这次赋值不生效，地址保持原样，不抛异常。

## 示例

```js
const u = new URL('https://u:p@a.com/');
console.log(u.username, u.password);
```

**结果**：输出 `u p`。

## 和 Web 的差别

和 Web 相同。

## 参见

- [`username`](username.md)：地址里的用户名
