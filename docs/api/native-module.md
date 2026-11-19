---
type: reference
status: partial
---

# `NativeModule`

**`NativeModule`** 表示一个登记进 App 的原生模块：一段用 ObjC 或 Swift 写的代码，按一个名字提供一组方法和一组事件。从 [`application.nativeModules.get()`](native-modules/get.md) 拿到。

一个模块提供三样东西：

- **同步方法**：用 [`call()`](native-module/call.md) 调，原生执行完才返回，返回值就是原生给的值。
- **异步方法**：用 [`callAsync()`](native-module/callasync.md) 调，返回 Promise。
- **事件**：用 [`addEventListener()`](native-module/addeventlistener.md) 监听，事件对象的 `detail` 是原生给的数据。

模块的名字、方法名、事件名都是原生那一侧登记时定的，JS 这边从 [`name`](native-module/name.md)、[`methods`](native-module/methods.md)、[`events`](native-module/events.md) 读出来。

**继承关系**：`EventTarget` → `NativeModule`

怎么调、怎么处理错误和二进制，见指南[从 JS 调原生模块](../guides/call-native-modules.md)。

## 构造函数

不能用 `new` 创建：`new NativeModule()` 抛 `TypeError: Illegal constructor: NativeModule is created by the runtime, use application.nativeModules.get(name)`。从 [`application.nativeModules.get()`](native-modules/get.md) 拿到，同一个名字每次是同一个对象。

## 实例属性

这三个值在拿到模块对象之后不会变，所以没有变化通知。

| 属性 | 说明 |
| --- | --- |
| [`name`](native-module/name.md) <small>只读</small> | 登记时用的名字 |
| [`methods`](native-module/methods.md) <small>只读</small> | 同步方法名和异步方法名 |
| [`events`](native-module/events.md) <small>只读</small> | 这个模块会发的事件名 |

## 实例方法

| 方法 | 说明 |
| --- | --- |
| [`call()`](native-module/call.md) | 调一个同步方法，当场拿到返回值 |
| [`callAsync()`](native-module/callasync.md) | 调一个异步方法，返回 Promise |
| [`addEventListener()`](native-module/addeventlistener.md) | 监听模块的事件 |
| [`removeEventListener()`](native-module/removeeventlistener.md) | 不再监听 |

还继承 `EventTarget` 的 `dispatchEvent()`。

## 事件

事件由模块自己定义，名字列在 [`events`](native-module/events.md) 里。事件对象见 [`addEventListener()`](native-module/addeventlistener.md#事件对象)。

## 同步方法和异步方法

一个方法是同步的还是异步的，由原生那一侧登记时决定。同步方法只能用 `call()` 调，异步方法只能用 `callAsync()` 调。调错了当场抛 `TypeError`，报错里写明该用哪一个。

同步方法执行期间，JS 和界面都在等它返回。所以原生那一侧只把很快就能答的事做成同步方法（读一个已经在内存里的值、做一次小的计算），其余的做成异步方法。

## 能传什么值

参数、返回值、事件的 `detail` 都只能是下面这几种，可以互相嵌套：

| JS 里的值 | 传给原生 | 原生交回来 |
| --- | --- | --- |
| `null` | 可以 | 是 `null` |
| `true` / `false` | 可以 | 是布尔 |
| 有限的数 | 可以 | 是数 |
| 字符串 | 可以 | 是字符串 |
| 数组 | 可以 | 是数组 |
| 普通对象（`{}` 写出来的，或者没有原型的） | 可以 | 是普通对象 |
| `ArrayBuffer` | 可以 | 是 `ArrayBuffer` |
| `Uint8Array`、`DataView` 等视图 | 可以，传它覆盖的那一段字节 | 交回来的是 `ArrayBuffer`，不是视图 |
| `undefined` | 作参数或数组元素时变成 `null`；作对象的成员时等于没写这个成员 | 不会出现 |

别的值都不能传：函数、`NaN`、`Infinity`、`BigInt`、`Symbol`、`Date`、`Map`、`Set`、正则、`Error`、`Promise`、类的实例、原生对象（视图、颜色、`Blob` 等）、自己引用自己的结构、含有不成对代理项的字符串。传了当场抛 `TypeError`，原生那一侧的方法不会被调用，报错原文见 [`call()`](native-module/call.md#异常)。

- **对象成员的顺序不保证。** 传过去再交回来的对象，成员的先后可能和写的时候不一样。
- **整数超过 `Number.MAX_SAFE_INTEGER` 会丢精度。** 原生那一侧的 64 位整数交回来是 JS 的数。大整数让原生写成字符串。
- **同一个对象出现在两处可以传。** 到了原生是两份内容相同的值。
- **二进制可以放在数组和对象里面。** JS 拿到的 `ArrayBuffer` 是独立的一份，修改它不会影响原生那边的数据。

原生那一侧交回一个不在表里的值（比如一个日期对象）时，同步方法抛 `TypeError`，异步方法的 Promise 被拒绝，原因是 `TypeError`；事件带了这样的数据时，这个事件被丢掉，运行时输出一条警告，后面的事件照常到。值不会被换成别的东西交过来。

## 原生报的错

原生那一侧报的错在 JS 这边是一个 `Error`：同步方法抛出来，异步方法的 Promise 被拒绝。类型定义里它叫 `NativeModuleError`：

| 属性 | 类型 | 什么时候有 | 含义 |
| --- | --- | --- | --- |
| `name` | 字符串 | 总有 | 原生给的错误名。原生没有给名字时是 `'Error'` |
| `message` | 字符串 | 总有 | 原生给的说明 |
| `code` | 数 | 原生给了才有 | 原生给的错误码 |
| `domain` | 字符串 | 错误是 iOS 或第三方 SDK 产生的时候 | iOS 的错误域，比如 `'NSCocoaErrorDomain'`。它和 `code` 一起确定是哪一种错误 |

- `name` 是 `'TypeError'` 或 `'RangeError'` 时，错误对象是对应的那个类的实例，`err instanceof TypeError` 成立。别的名字都是 `Error` 的实例，靠 `err.name` 区分。
- 原生的方法执行时抛出了 ObjC 异常，JS 这边同样得到一个 `Error`，`name` 是异常的名字。App 不会因此退出。**未在模拟器验证。**
- 报错之后模块照常能用。

## 示例

先在项目里装上示例模块 `@nacrejs/example-module`，重新生成 `ios/`。它登记的名字是 `example`。

```js
/// <reference types="@nacrejs/types" />

const example = application.nativeModules.get('example');
console.log(example.name, example.methods.async.join(', '));

console.log(example.call('add', 1, 2));

example.callAsync('echoLater', 'hello', 500).then((value) => {
  console.log(value);
});
```

**效果**

- 先输出 `example` 和示例模块的异步方法名，再输出 `3`。
- 约半秒之后输出 `hello`。

## 对应的 iOS API

没有对应的系统 API。原生那一侧用运行时公开的头 `NacreModule.h` 登记方法和事件，见[写自己的原生模块](../guides/native-modules.md)。

## 参见

- [`application.nativeModules`](native-modules.md)：按名字拿到模块
- [从 JS 调原生模块](../guides/call-native-modules.md)：处理错误、传二进制、听事件、给模块包一层函数
- [运行时怎么工作](how-it-works.md)：JS 和界面在同一个线程上执行，同步方法执行期间界面在等
