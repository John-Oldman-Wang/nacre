---
type: reference
web: URL.hash
---

# `URL`：`hash` 属性

**`hash`** 属性是地址的片段部分，带开头的 `#`。

## 值

字符串。

- 可读，可写。
- 没有片段时是空字符串。
- 写入时开头的 `#` 可以省略，会自动补上。写入空字符串或 `'#'` 去掉片段。
- 写入的内容原样放进地址，不做编码。
- 例：`https://u:p@a.com:8080/p/q?x=1#f` 的 `hash` 是 `#f`。

## 示例

```js
const w = new URL('https://a.com/p');
w.hash = 'top';
console.log(w.href);
```

**结果**：输出 `https://a.com/p#top`。

## 和 Web 的差别

浏览器在写入时会把空格等字符编码，这里原样写入。

## 参见

- [地址会被整理成统一的写法](../url.md#地址会被整理成统一的写法)
