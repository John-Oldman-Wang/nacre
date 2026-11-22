# 报错：DOMException、NSError 和一个建错误的入口

2026-11-22 定，同一天实现。之前的做法是「Web 用 `DOMException`，我们没有那个类，`new Error()` 再改 `name`」，散在 `fetch`、`crypto`、`structuredClone`、引擎的拒绝和各能力包里。

## 规矩

| 情况 | 抛什么 |
| --- | --- |
| 参数类型不对 | `TypeError` |
| 超出范围 | `RangeError` |
| 出错的含义 Web 上有名字（中止、超时、没权限、找不到、状态不对……） | `DOMException`，`name` 用 Web 的。系统给的原值建成 `NSError` 挂在 `cause` 上 |
| 出错的含义是 iOS 特有的（面容 ID 被锁定、这一刻定不出位置） | `NSError`，`name` 是我们的分类名，映射不到时是 `'NSError'`；`domain`、`code` 是它自己的字段 |
| 原生模块（第三方 Swift）报的错 | 不归这条管，还是 `Error` 加 `name`、`code`、`domain`，由模块作者定 |

判据和事件名同一条：Web 上有含义相同的就用它的名字，含义不同的不借。

## 为什么这么定

**`DOMException` 名字里的 DOM 是历史。** 它出自 1998 年的 DOM 规范，现在定义在 Web IDL 里，`fetch`、`crypto`、`AbortController`、`WebSocket` 都用它报错，大多和文档无关。Node.js（v17 起）、Deno、Bun、Cloudflare Workers 这些没有 DOM 的运行时全局上都有它。加这个类就是为了 `e instanceof DOMException` 和社区库里的 `new DOMException(msg, 'AbortError')` 能跑，换个名字等于白加，再留别名就是一个东西两个名字。讨论时考虑过改名，没改。

**原值挂在 `cause` 上，不挂在错误本身。** 原来是 `err.code` / `err.domain`。`DOMException` 自带标准的 `code`（老数字码，`AbortError` 是 20），两个会撞。`cause` 是 ECMAScript 的标准字段，正好表达「这个错误是那个错误引起的」：上层给分类（`name`），底层不丢事实（`cause.domain`、`cause.code`）——两层 API 的分工落到错误上。

**`NSError` 是一个类，不是 `Error` 加字段。** 底层照实映射 iOS：iOS 开发者拿到的是 `NSError`，JS 这边也是；能 `instanceof`。不能 `new`：它只由运行时从系统的错误建出来。

**不给 `userInfo`。** NSError 的附加信息字典，值可以是任何对象（`NSURL`、另一个 NSError、框架的私有对象）。讨论过「能转成 JSON 的给出来」，用户定了不给：没必要。

**兜底的名字合成一个。** 原来各包各起：`LAError`、`CLError`、`UNError`、`PhotosError`（底层，改成 `NSError`），`FileError`、`KeychainError`（上层，改成 Web 的 `OperationError`）。

## 怎么实现的

**一个入口：`ctx.makeError(name, message, detail)`**，在 `core/builtin/parts/05-dom-exception.js`。三条路都走它，同一个名字在哪条路上出来都是同一个类：

| 路 | 怎么到工厂 |
| --- | --- |
| 原生拒绝 Promise（`Engine::RejectCall`） | 引擎调 `native.setErrorFactory` 登记的那个函数，`detail` 是原生给的 `{domain, code}` |
| 原生同步报错（宿主往 `error` 里写一句话） | 默认还是 `TypeError`。开头带 `\x01名字\x01` 标记的，引擎把名字和说明交给工厂。能力包用 `NacreNamedError(@"RangeError", message)` 包一下 |
| 内置脚本自己报错 | 直接 `new ctx.DOMException(...)` 或 `ctx.makeError(...)` |

工厂按名字分：`TypeError`、`RangeError` 建那两个类；Web IDL 错误名字表里的建 `DOMException`，有 `domain` 时用平台的工厂建一个错误挂在 `cause` 上；别的名字交给平台（`ctx.makePlatformError`，iOS 的 `05-ns-error.js` 放的，建 `NSError`）。core 不认识 `NSError`：平台没放工厂时退回 `Error` 加 `name`。

**同步路上为什么用字符串标记，不改接口。** 宿主的 `std::string* error` 出口有十几个调用点、几十个写入点，改成结构体要动整条分发链。标记以 `\x01` 开头，正常的报错文字不会以它开头。

**`structuredClone` 的 `DataCloneError` 在 C++ 里抛。** V8 的序列化委托 `ThrowDataCloneError` 要当场抛一个值，C++ 不认识 `DOMException`。内置脚本把建它的函数作为第三个参数传给 `native.structuredClone`。踩过一次：工厂在自己的 `TryCatch` 里调，抛要放在那个作用域外面，否则会被它接住、跟着它一起丢掉。

**扫码的同步报错按异常名分。** AVFoundation 抛的 NSException：`NSRangeException`（变焦超出范围，实测）→ `RangeError`；`NSGenericException`（没锁就写、没有手电筒、不支持的对焦方式，按异常名分不开）→ `DOMException` `InvalidStateError`；其余 → `TypeError`。报错文字是 `<成员名>: the system refused (<系统给的原因>)`，不替系统猜原因。

## DOMException 的细节

照 Web IDL：`name`、`message`、`code` 是原型上的只读 getter（`#` 私有字段存值），25 个老常量在类上和原型上各一份，`Symbol.toStringTag` 是 `'DOMException'`，原型接在 `Error.prototype` 上，可以继承。一处不照搬：`message` 传 `null` 给空串（我们的转换规则），Web 是 `'null'`。

## 验证（iPhone 14 真机，iOS 27.2）

- 新步骤 `errors` 测两个类本身；`fetch`、`fileSystem`、`keychain`、`webSocket`、`webView`、`coreLocation`、`localAuthentication`、`push`、`webGlobals`、`avCapture`、`pageOverrides` 加了「是哪个类」「原值在 `cause` 上」的断言。先跑看到失败（`DOMException is not defined`），实现后 17 步 1693 条全过。
- 实测：读不存在的文件是 `DOMException` `NotFoundError`（`code` 8），`cause` 是 `NSError`，`NSCocoaErrorDomain` 260；没锁就写变焦是 `InvalidStateError`；变焦写 100000 是 `RangeError`；`AbortSignal.timeout()` 的 `reason` 是 `TimeoutError`（`code` 23）；`webContents` 停掉的加载 `cause.code` 是 -999。
- 没在真机上触发过的：钥匙串、相册、通知、面容 ID 的系统错误走 `cause` 和 `NSError` 的那几支（照代码，和文件读写同一条路）。
