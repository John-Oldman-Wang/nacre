# 两端共用的内置脚本

`parts/` 下是两端共用的内置脚本：事件的基础（`00-core.js`）和 Web 标准那批。平台把它们和自己的内置脚本合在一起，**按文件名排序**执行（文件名前面的数字定顺序），每个是一个函数表达式，用同一个 `ctx` 调一次。

它们依赖平台提供两样东西：原生入口（`ctx.native` 上的函数，C++ 一侧实现），和平台的内置脚本先放进 `ctx` 的助手（`00-core.js` 自己放的那几样不用平台管）。iOS 现在全都提供；新平台照这张表提供，这些文件一字不改就能跑。

| 文件 | 定义的全局名字 | 要的原生入口（`native.*`） | 要 `ctx` 上的 |
| --- | --- | --- | --- |
| `00-core.js` | `Event`、`EventTarget`；往 `ctx` 放 `Event`、`EventTarget`、`define`、`defineField`、`has`、`initWrapper`、`kHandle`、`kListeners`、`kSubscribe` 和原生入口 `native`（从引擎挂的 `globalThis.__nacre_native` 取，平台的 `25-globals.js` 最后把它从全局摘掉） | `reportError`（监听器抛的异常交给它） | 无 |
| `05-dom-exception.js` | `DOMException`；往 `ctx` 放 `DOMException` 和建错误的唯一入口 `makeError`（平台特有的错误由平台放的 `ctx.makePlatformError` 建，没放就是 `Error` 加 `name`） | `setErrorFactory`（引擎拒绝 Promise、同步报错时用它建错误） | `define`、`native` |
| `05-events.js` | `CustomEvent`、`MessageEvent`、`CloseEvent`、`ErrorEvent`、`PromiseRejectionEvent`；往 `ctx` 放定义事件类的 `defineEventClass` 和登记表 `eventClasses`（平台的事件类也用它，原生发事件时按类名在这里找） | 无 | `Event`、`define` |
| `06-websocket.js` | `WebSocket` | 无（走桥：`WebSocket` 是一个原生类） | `EventTarget`、`constructNative`、`defineNativeClass`、`finalCheck`、`kSubscribe`、`nativeCall`、`nativeCallAsync`、`nativeGet`、`nativeSet`、`ownOne`、`requireNative`、`subscribeNative`、`toInteger`、`toTextOrNull`、`application` |
| `22-url.js` | `URL`、`URLSearchParams`、`Headers` | `parseURL` | `define`、`has`、`native` |
| `23-fetch.js` | `fetch`、`Request`、`Response`、`Blob`、`AbortController`、`AbortSignal`、`ReadableStream`、`ReadableStreamDefaultReader` | `createBlob`、`fetchStart`、`fetchCancel`、`fetchReadBody`、`fetchRelease`、`readObjectAsync` | `Event`、`EventTarget`、`URL`、`URLSearchParams`、`define`、`defineNativeClass`、`finalCheck`、`has`、`kHandle`、`nativeGet`、`requireNative`、`native` |
| `24-timer.js` | `setTimeout`、`setInterval`、`clearTimeout`、`clearInterval`、`queueMicrotask`、`performance`、`Performance` | `addTimer`、`removeTimer`、`now`、`timeOrigin` | `define`、`native` |
| `25-crypto.js` | `crypto`、`Crypto` | `randomFill` | `define`、`native` |
| `26-intl.js` | `Intl`（数字的格式化） | 无（走类方法的通道 `nativeClassCallValue`，平台要认它用的类名） | `define`、`nativeClassCallValue`；往 `ctx.intl` 放东西给下一个 |
| `27-intl-date.js` | `Intl.DateTimeFormat` 一组 | 无 | `define`、`ctx.intl` |
| `28-web-globals.js` | `TextEncoder`、`TextDecoder`、`atob`、`btoa`、`structuredClone` | `utf`、`base`、`structuredClone` | `define`、`kHandle`、`kListeners`、`native`；可选的 `ctx.platformCloneClasses`（平台自己的纯 JS 类，`structuredClone` 要拒绝克隆它们） |

顺序上的要求：`ctx` 上的这些东西要在用到它们的文件之前放好。`00-core` 排在最前，放事件、`define`、`has`、`kHandle`、`native` 这些。平台放的：iOS 上是 `05-ns-error`（`makePlatformError`：建 `NSError`）、`01-bridge`（桥的助手和参数转换）、`02-struct`（`platformCloneClasses`）和 `21-application`（`application`）；`22-url` 自己把 `URL`、`URLSearchParams` 放进 `ctx` 给 `23-fetch` 用；平台自己的 `25-globals.js` 在 `25-crypto.js` 之后把 `Application`、`application` 挂上全局、把 `__nacre_native` 从全局摘掉。

这张表是 2026-11-21 拆出来时照代码列的。改了哪个文件用到的原生入口或 `ctx`，同一步改这张表。
