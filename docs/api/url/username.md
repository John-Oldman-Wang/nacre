---
type: reference
web: URL.username
---

# `URL`：`username` 属性

**`username`** 属性是地址里的用户名，也就是 `@` 前面、冒号前面的那一段。

## 值

字符串。

- 可读，可写。
- 地址里没有用户名时是空字符串。
- 例：`https://u:p@a.com:8080/p/q?x=1#f` 的 `username` 是 `u`。

### 写错时

赋值后整个地址重新解析一遍。新值让地址不合法时，这次赋值不生效，地址保持原样，不抛异常。

## 示例

```js
const u = new URL('https://a.com/');
u.username = 'me';
console.log(u.href);
```

**结果**：输出 `https://me@a.com/`。**未在模拟器验证。**

## 和 Web 的差别

和 Web 相同。

## 参见

- [`password`](password.md)：地址里的密码
