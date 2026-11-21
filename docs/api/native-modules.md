---
type: reference
status: partial
---

# `application.nativeModules`

**`application.nativeModules`** 表示登记进这个 App 的全部原生模块。一个原生模块是一段用 ObjC 或 Swift 写的代码，按一个名字登记进来，提供一组可以从 JS 调用的方法和一组事件。App 团队自己的原生代码、只提供原生 SDK 的第三方服务（风控、崩溃收集、支付这一类），都通过它提供给 JS。

`application.nativeModules` 在整个 App 里只有一个，任何时候都能用，包括脚本顶层。它的类是 `NativeModules`。用 [`get()`](native-modules/get.md) 按名字拿到一个模块，得到的是一个 [`NativeModule`](native-module.md) 对象；调方法、听事件都在 `NativeModule` 上。

模块跟着 npm 包进来。提供原生模块的包和[能力包](capabilities.md)是同一种包：装上之后重新生成一次 `ios/`，它的原生代码就被编进 App，模块在 App 启动时登记好。没装的包，它的模块不存在。

这类包通常自带一层 JS，把 `call('方法名', …)` 包成普通的函数。用包的人调的是那些函数，不用直接碰 `application.nativeModules`。直接用它的是写这类包的人。

**继承关系**：`NativeModules` 不继承任何类。

JS 这一侧怎么调、怎么处理错误和二进制，见指南[从 JS 调原生模块](../guides/call-native-modules.md)。原生那一侧怎么写、怎么做成包，见[写自己的原生模块](../guides/native-modules.md)。

## 构造函数

不能用 `new` 创建：`new NativeModules()` 抛 `TypeError: Illegal constructor: NativeModules is created by the runtime, not by new`。唯一的实例从 [`application`](application.md) 的 `nativeModules` 属性拿到，每次读是同一个对象，没有 setter。

## 属性

| 属性 | 说明 |
| --- | --- |
| [`names`](native-modules/names.md) <small>只读</small> | 登记了的模块名，按名字排序 |

## 函数

| 函数 | 说明 |
| --- | --- |
| [`has()`](native-modules/has.md) | 某个名字的模块登记过没有 |
| [`get()`](native-modules/get.md) | 按名字拿到一个模块 |

## 示例

下面用示例模块 `@nacrejs/example-module`。它登记的名字是 `example`，方法大多是把收到的值原样交回来。先在项目里装上它，重新生成 `ios/`。

```js
/// <reference types="@nacrejs/types" />

const modules = application.nativeModules;
console.log(modules.names.join(', '));

const example = modules.get('example');
console.log(example.methods.sync.join(', '));

// 同步方法：当场拿到返回值
console.log(example.call('add', 1, 2));

// 异步方法：返回 Promise
example.callAsync('echoLater', 'hello', 500).then((value) => {
  console.log('500 毫秒之后：', value);
});

// 事件
example.addEventListener('tick', (e) => {
  console.log('收到 tick，数据是', JSON.stringify(e.detail));
});
example.call('emit', 'tick', { n: 1 });
```

**效果**

- 控制台依次输出登记了的模块名（其中有 `example`）、示例模块的同步方法名、`3`、`收到 tick，数据是 {"n":1}`。
- 约半秒之后输出 `500 毫秒之后： hello`。

这段代码没有作为一个整体在模拟器运行过。其中用到的每个成员都在验收用例里运行过。

## 对应的 iOS API

原生那一侧用运行时公开的头 `NacreModule.h` 登记模块，没有对应的系统 API。原生那一侧的写法见[写自己的原生模块](../guides/native-modules.md)。

## 参见

- [`NativeModule`](native-module.md)：一个模块，调方法、听事件、能传什么值、原生报的错
- [从 JS 调原生模块](../guides/call-native-modules.md)：确认模块在不在、处理错误、传二进制、给模块包一层函数
- [写自己的原生模块](../guides/native-modules.md)：原生那一侧怎么写、怎么登记、怎么做成包
- [核心和能力包](capabilities.md)：包是怎么装进项目的
- [`application`](application.md)：`nativeModules` 所在的对象
