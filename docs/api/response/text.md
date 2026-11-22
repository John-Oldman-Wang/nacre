---
type: reference
web: Response.text()
---

# `Response`：`text()` 方法

**`text()`** 方法读出全部响应内容，按 UTF-8 解码成字符串。

## 语法

```
text()
```

### 参数

无。

### 返回值

`Promise`。内容全部下载完之后完成，得到字符串。

- 一律按 UTF-8 解码，不看响应头里声明的编码。其它编码的文本用 [`arrayBuffer()`](arraybuffer.md) 读出字节，自己解码。
- 内容不是合法的 UTF-8 时得到空串 `''`，不报错。
- 没有内容的响应得到空串。

### 异常

返回的 `Promise` 在这些情况下被拒绝：

**`TypeError`**

- 内容已经读过：`Body has already been read`。
- [`body`](body.md) 上有读取器：`Body is locked: response.body has a reader`。
- 下载中途网络中断：`message` 以 `Network request failed: ` 开头。

**[`DOMException`](../dom-exception.md)，`name` 是 `'AbortError'`**

下载中途请求被取消，或者 `AbortSignal.timeout()` 到了时间。

## 说明

解码在后台进行，解码大文本时不会卡住界面。内容在下载的那一份之外再生成一份字符串。

## 示例

```js
async function main() {
  const res = await fetch('https://httpbin.org/range/16');
  const text = await res.text();
  console.log(text);
}
main();
```

**结果**：输出 `abcdefghijklmnop`。

## 和 Web 的差别

Web 按响应声明的编码解码，不合法的字节换成替换字符。Nacre 一律按 UTF-8 解码，不合法时得到空串。

## 参见

- [`json()`](json.md)
- [四种读法怎么选](../response.md#四种读法怎么选)
