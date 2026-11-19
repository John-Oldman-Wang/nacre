---
type: reference
web: URL.origin
---

# `URL`：`origin` 属性

**`origin`** 属性是地址的协议、主机和端口连在一起的部分。

## 值

字符串。

- 只读。给它赋值抛 `TypeError`。
- 只有 `http` 和 `https` 地址有值，其他协议一律是字符串 `'null'`。
- 协议的默认端口不出现。
- 例：`https://u:p@a.com:8080/p/q?x=1#f` 的 `origin` 是 `https://a.com:8080`。

## 示例

```js
console.log(new URL('https://a.com:443/x').origin);
console.log(new URL('wss://a.com/chat').origin);
```

**结果**：输出 `https://a.com`，然后 `null`。

## 和 Web 的差别

`ws:`、`wss:`、`ftp:` 地址的 `origin` 在浏览器里是协议加主机加端口，这里是 `'null'`。

## 参见

- [`protocol`](protocol.md)、[`host`](host.md)：组成 `origin` 的两部分
