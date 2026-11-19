---
type: reference
web: URL.search
---

# `URL`：`search` 属性

**`search`** 属性是地址的查询部分，带开头的 `?`。

## 值

字符串。

- 可读，可写。
- 没有查询时是空字符串。
- 写入时开头的 `?` 可以省略，会自动补上。写入空字符串或 `'?'` 去掉查询。
- **写入的内容原样放进地址，不做编码。** 值里有空格、`&`、`=`、中文时，改用 [`searchParams`](searchparams.md)，它负责编码。
- 写入后 [`searchParams`](searchparams.md) 跟着变；改 `searchParams` 后 `search` 也跟着变。
- 例：`https://u:p@a.com:8080/p/q?x=1#f` 的 `search` 是 `?x=1`。

## 示例

```js
const u = new URL('https://a.com/?k=1');
u.search = 'z=9';
console.log(u.search, u.searchParams.get('z'));
```

**结果**：输出 `?z=9 9`。

## 和 Web 的差别

浏览器在写入时会把空格等字符编码，这里原样写入。

## 参见

- [`searchParams`](searchparams.md)：按名字读写查询参数
