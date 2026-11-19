---
type: reference
web: Request.clone()
---

# `Request`：`clone()` 方法

**`clone()`** 方法返回这个请求的一份独立副本。

## 语法

```
clone()
```

### 参数

无。

### 返回值

新的 `Request`。地址、方法、请求头和请求体都和原来的相同。副本的请求体也能读、也能发送。`signal` 和原来的是同一个。

### 异常

**`TypeError`**

请求体已经读过：`Cannot clone a Request whose body has already been read`。

## 示例

```js
async function main() {
  const req = new Request('https://httpbin.org/post', { method: 'POST', body: 'hello' });
  const copy = req.clone();
  console.log(await req.text(), await copy.text());
}
main();
```

**结果**：输出 `hello hello`。

## 和 Web 的差别

和 Web 相同。

## 参见

- [`Request()`](constructor.md)
