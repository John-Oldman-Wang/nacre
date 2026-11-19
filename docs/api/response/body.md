---
type: reference
web: Response.body
---

# `Response`：`body` 属性

**`body`** 属性是响应内容的流，用来在内容还没下载完时一块一块地读。

## 值

[`ReadableStream`](../readable-stream.md)，或者 `null`。

- 只读。给它赋值抛 `TypeError`。
- 每次读到的是同一个对象。
- 每一块是一个 `Uint8Array`。
- 响应没有内容时是 `null`：`HEAD` 请求的响应，状态码是 204、205、304 的响应，以及没给 `body` 的 [`new Response()`](constructor.md)。所以用之前要先判断。
- 自己创建的 `Response` 的 `body` 也是流，内容一块给完。

`body` 和四个读取方法读的是同一份内容，互相排斥，规则见[响应内容只能读一次](../response.md#响应内容只能读一次)。只读取 `body` 这个属性、不拿读取器，没有影响。

### 内存

- 读得比下载慢时，没读走的内容在内存里攒到约 1 MB，这个请求就被暂停，读走之后自动继续。见[读得慢时请求会暂停](../../guides/streaming-response.md#读得慢时请求会暂停)。
- 拿到 `Response` 之后一直不读，下载照常进行，内容全部留在内存里。暂停只发生在开始用 `read()` 读之后。
- 不再需要剩下的内容时，调 [`cancel()`](../readable-stream/cancel.md) 或者从 `for await` 里 `break`，请求立即停止。读到一半就不再使用的流，在被回收时请求也会停止，但回收的时间不确定，所以不要依赖它。

## 示例

### 用 `for await` 读

```js
async function main() {
  const res = await fetch('https://httpbin.org/drip?duration=3&numbytes=30&delay=0');
  if (res.body === null) throw new Error('这个响应没有内容');

  let received = 0;
  for await (const chunk of res.body) {
    received += chunk.byteLength;
  }
  console.log(received);
}
main();
```

**结果**：这个测试地址在 3 秒里陆续发出 30 个字节。3 秒后输出 `30`。**未在模拟器验证。**

### 自己创建的响应

```js
async function main() {
  const res = new Response('abc');
  if (res.body === null) throw new Error('没有内容');
  const reader = res.body.getReader();
  const first = await reader.read();
  const second = await reader.read();
  console.log(first.value, second.done);
}
main();
```

**结果**：输出一个内容是 `97, 98, 99` 的 `Uint8Array` 和 `true`。

## 和 Web 的差别

- 来自 `fetch()` 的流，在开始用 `read()` 读之后才限制缓冲。Web 在没有读的时候也限制，下载会停下来等。
- 没有 `Content-Length` 的响应，服务器发到一半正常关闭连接时不报错，读到已经到达的部分之后正常结束。Web 会报错。

## 参见

- [`ReadableStream`](../readable-stream.md)：流的成员
- [边下载边读响应](../../guides/streaming-response.md)：大文件、下载进度、服务器推送的写法
