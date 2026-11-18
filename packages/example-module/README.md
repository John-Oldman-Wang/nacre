# `@nacrejs/example-module`

一个示例原生模块。它有两个用处：

- 给[写自己的原生模块](../../docs/guides/native-modules.md)当能直接看的例子。原生那一半是用 Swift 写的，只用运行时公开的接口（`import Nacre`）。
- 给验收当被调的模块（`acceptance/src/steps/native-modules.js`）。所以它的方法大多是把值原样交回去、故意报错、在后台线程上兑现这一类。

```
packages/example-module/
├─ index.js                          包自己的 JS：普通的 npm 包代码，把模块的方法包成函数
├─ index.d.ts                        类型
├─ nacre-ios.json                    清单：它的 framework 叫什么、要 App 链接哪个系统框架
└─ NacreExampleModule.xcframework/   预编译的 framework（构建产物，不提交）
```

原生那一半的源码在 `ios/Capabilities/ExampleModule/ExampleModule.swift`，它是运行时工程里的一个 target（`NacreExampleModule`）。第三方的模块没有这一层：它们的原生代码在自己的工程里编成 xcframework，放进自己的包，清单里也不写 `target`。

## 它登记了什么

模块名是 `example`。

| | 名字 |
| --- | --- |
| 同步方法 | `echo`、`echoAll`、`argumentCount`、`typeOf`、`isMainThread`、`add`、`bytes`、`cachedByte`、`sha256`、`fail`、`failWithNSError`、`unsupported`、`nonFinite`、`emit`、`emitUnsupported` |
| 异步方法 | `echoAsync`、`echoLater`、`threads`、`failLater`、`bytesAsync`、`cachedBytesAsync`、`nestedBytesAsync`、`settleTwice`、`resolveThenReject`、`drop`、`unsupportedAsync`、`emitLater` |
| 事件 | `tick`、`data` |

每个方法做什么，看源码里各自上面那一行注释。

## 怎么用

```js
import { sha256 } from '@nacrejs/example-module';

const digest = sha256(new Uint8Array([97, 98, 99]));
console.log(digest.byteLength);
```

**效果**（未在模拟器验证）：控制台输出 `32`。

不走包的 JS，直接按名字拿模块也可以：`application.nativeModules.get('example')`，见 [API 文档](../../docs/api/native-modules.md)。
