---
type: reference
web: URL.href
---

# `URL`：`href` 属性

**`href`** 属性是完整的地址文本。

## 值

字符串。

- 可读，可写。
- 读出的是[整理过的写法](../url.md#地址会被整理成统一的写法)，可能和传给构造函数的文本不同。
- 写入一个新地址时，所有部分都换成新地址的；[`searchParams`](searchparams.md) 跟着变。
- 例：`https://u:p@a.com:8080/p/q?x=1#f` 的 `href` 就是这一整串。

### 写错时

写入解析不了的地址抛 `TypeError`，地址保持原样：

```
Invalid URL: "…"
```

写入时也不能用相对地址：没有起点可以参照。

## 示例

```js
const u = new URL('https://a.com/p?x=1');
u.href = 'https://b.com/q';
console.log(u.href, u.searchParams.get('x'));
```

**结果**：输出 `https://b.com/q null`。

## 和 Web 的差别

非 ASCII 的域名不会转成 `xn--` 开头的形式，见 [`hostname`](hostname.md)。

## 参见

- [`toString()`](tostring.md)：返回同一个值
- [`URL()`](constructor.md)：解析地址
