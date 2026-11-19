---
type: reference
web: Request.json()
---

# `Request`：`json()` 方法

**`json()`** 方法读出构造时给的请求体，按 UTF-8 解码之后按 JSON 解析。

## 语法

```
json()
```

### 参数

无。

### 返回值

`Promise`，完成时得到解析好的值。

### 异常

返回的 `Promise` 在请求体已经读过时被拒绝：

**`TypeError`**

`Body has already been read`。

**`SyntaxError`**

请求体不是合法的 JSON。没有请求体时得到空串，空串不是合法的 JSON，也是这个异常。

## 示例

```js
async function main() {
  const req = new Request('https://httpbin.org/post', { method: 'POST', body: '{"a":1}' });
  const data = await req.json();
  console.log(data.a);
}
main();
```

**结果**：输出 `1`。

## 和 Web 的差别

和 Web 相同。

## 参见

- [`Response` 的 `json()`](../response/json.md)
