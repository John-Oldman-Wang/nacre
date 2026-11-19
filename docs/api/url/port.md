---
type: reference
web: URL.port
---

# `URL`：`port` 属性

**`port`** 属性是地址的端口，写成字符串。

## 值

字符串。

- 可读，可写。
- 端口是协议的默认端口时读出空字符串。有默认端口的协议：`http` 80、`https` 443、`ws` 80、`wss` 443、`ftp` 21。
- 地址里没写端口时也是空字符串。
- 写入空字符串去掉端口。写入数字先转成字符串。
- 例：`https://u:p@a.com:8080/p/q?x=1#f` 的 `port` 是 `8080`。

### 写错时

赋值后整个地址重新解析一遍。新值让地址不合法时，这次赋值不生效，地址保持原样，不抛异常。

## 示例

```js
const u = new URL('https://a.com:443/');
console.log(JSON.stringify(u.port));
u.port = '8443';
console.log(u.host);
```

**结果**：输出 `""`，然后 `a.com:8443`。第二行**未在模拟器验证**。

## 和 Web 的差别

和 Web 相同。

## 参见

- [`host`](host.md)：主机加端口
