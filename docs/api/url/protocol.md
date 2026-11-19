---
type: reference
web: URL.protocol
---

# `URL`：`protocol` 属性

**`protocol`** 属性是地址的协议，带结尾的冒号。

## 值

字符串。

- 可读，可写。
- 读出的是小写，带结尾的冒号，比如 `https:`。
- 写入时结尾的冒号可以省略，会自动补上。
- 例：`https://u:p@a.com:8080/p/q?x=1#f` 的 `protocol` 是 `https:`。

### 写错时

赋值后整个地址重新解析一遍。新值让地址不合法时，这次赋值不生效，地址保持原样，不抛异常。

## 示例

```js
const u = new URL('http://a.com/x');
u.protocol = 'https';
console.log(u.href);
```

**结果**：输出 `https://a.com/x`。

## 和 Web 的差别

和 Web 相同。

## 参见

- [地址会被整理成统一的写法](../url.md#地址会被整理成统一的写法)
