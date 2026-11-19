---
type: reference
web: URL.hostname
---

# `URL`：`hostname` 属性

**`hostname`** 属性是地址的主机，不带端口。

## 值

字符串。

- 可读，可写。
- 读出的是小写。
- 写入时端口保持不变。
- 例：`https://u:p@a.com:8080/p/q?x=1#f` 的 `hostname` 是 `a.com`。

### 写错时

赋值后整个地址重新解析一遍。新值让地址不合法时，这次赋值不生效，地址保持原样，不抛异常。

## 示例

```js
const u = new URL('https://a.com:8080/x');
u.hostname = 'b.com';
console.log(u.host);
```

**结果**：输出 `b.com:8080`。**未在模拟器验证。**

## 和 Web 的差别

非 ASCII 的域名在浏览器里转成 `xn--` 开头的形式：`https://例え.jp` 的 `hostname` 是 `xn--r8jz45g.jp`。这里是 `%E4%BE%8B%E3%81%88.jp`。这条来自和 Chrome 的对比测试，验收用例里没有断言。用这样的地址发请求能否成功，**未在模拟器验证**。

## 参见

- [`host`](host.md)：主机加端口
