# 随机数

← [实现原理](README.md)

`crypto.getRandomValues()` 和 `crypto.randomUUID()`。上层 API，名字和行为照搬 Web——Node、Deno、浏览器都有这个全局，生态里的库默认它存在。

## 随机源归宿主，检查和拼装归 JS

| 层 | 管什么 |
| --- | --- |
| JS（`nacre.js`） | Web 规定的三项检查（是不是类型数组、是不是整数类型、有没有超过 65536 字节）；UUID 的拼装 |
| 引擎（C++） | 从 `ArrayBufferView` 取出**视图覆盖的那段字节**，指给宿主 |
| 宿主（`NacreCrypto.mm`） | `SecRandomCopyBytes` |

引擎那一层没有用 `arc4random_buf`，虽然它在 Apple 和 Android 的 libc 里都有、能让引擎自己搞定。理由是「随机源」是系统能力，按第 1 节的分法该由宿主给；而且 `SecRandomCopyBytes` 是 Apple 给密码学用途指定的入口，Android 那边将来也有自己指定的那一个。引擎只留一个 `fill_random(bytes, length)` 的口子。

**宿主失败时抛 `OperationError`，不拿别的随机源顶上。** 悄悄降级成一个弱一些的源，错了没人知道。

## 填的是视图，不是 buffer

`new Uint8Array(buffer, 4, 8)` 和 `subarray(4, 12)` 这种视图，`Buffer()->GetBackingStore()->Data()` 给的是**整个 buffer 的起点**。少加一个 `ByteOffset()`，就会把视图范围以外的字节也写掉——而且测试里用一整个数组永远测不出来。所以验收用例专门有一组：16 字节的数组只填中间 8 个，核对两头的 8 个字节还是 0。

## 65536 字节的上限照搬了

这个上限在 Web 里的来由是防止一次调用耗尽熵池、卡住页面，对我们并不成立（`SecRandomCopyBytes` 没有这个问题）。照搬的理由只有一条：**库是按这个上限写的**。放宽它不会让任何现有代码受益，收紧或者改掉报错的名字则会让按 Web 行为写的 `try / catch` 失效。

## 错误是改了名字的 `Error`

Web 抛的是 `DOMException`（`QuotaExceededError`、`TypeMismatchError`）。我们没有这个类，照 `fetch` 的 `AbortError` 的做法：`new Error(message)` 再把 `name` 改掉。按 `err.name` 判断的代码照常工作，按 `instanceof DOMException` 判断的不行。

## `randomUUID()` 在 JS 里拼

它就是 16 个随机字节改 6 个位（版本号 4、变体 10），所以直接复用上面的随机源，没有去调 `NSUUID`。少一次过桥，而且 Android 不用再写一遍。

## 没做的

`crypto.subtle`。摘要和签名 JS 自己算得出来，但 jitless 下慢，该走 CommonCrypto——那是单独的一步，文件已经留好了（`NacreCrypto.mm`）。
