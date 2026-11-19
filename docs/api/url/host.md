---
type: reference
web: URL.host
---

# `URL`：`host` 属性

**`host`** 属性是地址的主机加端口。

## 值

字符串。

- 可读，可写。
- 读出的主机是小写。
- 端口是协议的默认端口时不出现，见 [`port`](port.md)。
- 例：`https://u:p@a.com:8080/p/q?x=1#f` 的 `host` 是 `a.com:8080`。

### 写错时

赋值后整个地址重新解析一遍。新值让地址不合法时，这次赋值不生效，地址保持原样，不抛异常。

## 示例

```js
const u = new URL('https://EXAMPLE.com:443/x');
console.log(u.host);
u.host = 'b.com:8080';
console.log(u.href);
```

**结果**：输出 `example.com`，然后 `https://b.com:8080/x`。第二行**未在模拟器验证**。

## 和 Web 的差别

非 ASCII 的域名不会转成 `xn--` 开头的形式，见 [`hostname`](hostname.md)。

## 参见

- [`hostname`](hostname.md)：只要主机，不要端口
- [`port`](port.md)：只要端口
