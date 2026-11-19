---
type: reference
web: URL.pathname
---

# `URL`：`pathname` 属性

**`pathname`** 属性是地址的路径。

## 值

字符串。

- 可读，可写。
- 至少是 `/`：没有路径的地址读出 `/`。
- 读出的路径里 `.` 和 `..` 已被化简，空格编码成 `%20`，已经编码过的部分保持原样。路径里的中文等非 ASCII 字符会被怎样编码，**未在模拟器验证**。
- 写入时开头的 `/` 可以省略，会自动补上。
- 例：`https://u:p@a.com:8080/p/q?x=1#f` 的 `pathname` 是 `/p/q`。

### 写错时

赋值后整个地址重新解析一遍。新值让地址不合法时，这次赋值不生效，地址保持原样，不抛异常。

## 示例

```js
const w = new URL('https://a.com/p');
w.pathname = 'q';
console.log(w.href);
```

**结果**：输出 `https://a.com/q`。

## 和 Web 的差别

和 Web 相同。

## 参见

- [地址会被整理成统一的写法](../url.md#地址会被整理成统一的写法)
