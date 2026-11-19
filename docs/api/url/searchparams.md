---
type: reference
web: URL.searchParams
---

# `URL`：`searchParams` 属性

**`searchParams`** 属性是地址的查询参数，一个 [`URLSearchParams`](../url-search-params.md)。

## 值

[`URLSearchParams`](../url-search-params.md)。

- 只读。给它赋值抛 `TypeError`。它返回的对象可以修改。
- 每次读到的是同一个对象。
- 和 [`search`](search.md) 互相同步：改 `searchParams`，`search` 和 [`href`](href.md) 跟着变；改 `search` 或 `href`，`searchParams` 跟着变。
- 通过它写入的值会被编码：空格编码成 `+`，中文按 UTF-8 编码成 `%XX`。

## 示例

```js
const u = new URL('https://api.example.com/search');
u.searchParams.set('q', '中 文');
u.searchParams.append('k2', 'v2');
console.log(u.href);
console.log(u.searchParams === u.searchParams);
```

**结果**：输出 `https://api.example.com/search?q=%E4%B8%AD+%E6%96%87&k2=v2`，然后 `true`。

## 和 Web 的差别

和 Web 相同。

## 参见

- [`URLSearchParams`](../url-search-params.md)：查询参数的全部方法
- [`search`](search.md)：查询部分的文本
