---
type: reference
web: Response.json()
---

# `Response`：`json()` 方法

**`json()`** 方法读出全部响应内容，按 UTF-8 解码之后按 JSON 解析。

## 语法

```
json()
```

### 参数

无。

### 返回值

`Promise`。内容全部下载完之后完成，得到解析好的值。

### 异常

返回的 `Promise` 在这些情况下被拒绝：

**`SyntaxError`**

内容不是合法的 JSON。没有内容的响应得到空串，空串不是合法的 JSON，也是这个异常。

**`TypeError`**

- 内容已经读过：`Body has already been read`。
- [`body`](body.md) 上有读取器：`Body is locked: response.body has a reader`。
- 下载中途网络中断：`message` 以 `Network request failed: ` 开头。

**`name` 是 `'AbortError'` 的 `Error`**

下载中途请求被取消，或者 `AbortSignal.timeout()` 到了时间。

## 说明

内容在下载的那一份之外，再生成一份字符串和解析出的对象。内容很大时用 [`body`](body.md) 一块一块读。

## 示例

```js
async function main() {
  const res = await fetch('https://httpbin.org/get');
  const data = await res.json();
  console.log(data.url);
}
main();
```

**结果**：输出 `https://httpbin.org/get`。`data` 是解析好的普通对象。

## 和 Web 的差别

内容一律按 UTF-8 解码。不合法的 UTF-8 解码成空串，于是以 `SyntaxError` 被拒绝。

## 参见

- [`text()`](text.md)
- [四种读法怎么选](../response.md#四种读法怎么选)
