---
type: reference
web: Request.text()
---

# `Request`：`text()` 方法

**`text()`** 方法读出构造时给的请求体，按 UTF-8 解码成字符串。

## 语法

```
text()
```

### 参数

无。

### 返回值

`Promise`，完成时得到字符串。没有请求体时得到空串 `''`。

### 异常

返回的 `Promise` 在请求体已经读过时被拒绝：

**`TypeError`**

`Body has already been read`。

## 示例

```js
async function main() {
  const req = new Request('https://httpbin.org/post', { method: 'POST', body: 'hello' });
  console.log(await req.text());
}
main();
```

**结果**：输出 `hello`。

## 和 Web 的差别

和 Web 相同。

## 参见

- [`Response` 的 `text()`](../response/text.md)
