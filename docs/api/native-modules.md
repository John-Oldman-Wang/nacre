---
type: reference
status: partial
---

# 原生模块 `application.nativeModules`

**`application.nativeModules`** 表示登记进这个 App 的全部原生模块。一个原生模块是一段用 ObjC 或 Swift 写的代码，按一个名字登记进来，提供一组可以从 JS 调用的方法和一组事件。App 团队自己的原生代码、只提供原生 SDK 的第三方服务（风控、崩溃收集、支付这一类），都通过它提供给 JS。

`application.nativeModules` 在整个 App 里只有一个，任何时候都能用，包括脚本顶层。它的类是 `NativeModules`，不能用 `new` 创建。用 `get(name)` 按名字拿到一个模块，得到的是一个 `NativeModule` 对象。

一个模块提供三样东西：

- **同步方法**：`module.call('方法名', ...参数)`，原生执行完才返回，返回值就是原生给的值。
- **异步方法**：`module.callAsync('方法名', ...参数)`，返回 Promise。
- **事件**：`module.addEventListener('事件名', 回调)`，事件对象的 `detail` 是原生给的数据。

这一页讲 JS 这一侧怎么用。原生那一侧怎么写、怎么做成包，见[写自己的原生模块](../guides/native-modules.md)。

> **注意**：这一页的「效果」都还没有在模拟器上验证。它们来自代码，以及一个不经过模拟器的探针（见[实现原理](../internals/native-modules.md#验证)）。

## 模块从哪里来

模块跟着 npm 包进来。提供原生模块的包和[能力包](capabilities.md)是同一种包：装上之后重新生成一次 `ios/`，它的原生代码就被编进 App，模块在 App 启动时登记好。没装的包，它的模块不存在：`has()` 返回 `false`，`get()` 抛 `TypeError`。

这类包通常自带一层 JS，把 `call('方法名', …)` 包成普通的函数。用包的人调的是那些函数，不用直接碰 `application.nativeModules`。直接用它的是写这类包的人。

模块的名字、方法名、事件名都是原生那一侧登记时定的。JS 这边可以读出来：`application.nativeModules.names`、`module.methods`、`module.events`。

## 同步方法和异步方法不能混着调

一个方法是同步的还是异步的，由原生那一侧登记时决定。同步方法只能用 `call()` 调，异步方法只能用 `callAsync()` 调。调错了当场抛 `TypeError`，报错里写明该用哪一个。

同步方法执行期间，JS 和界面都在等它返回。所以原生那一侧只把很快就能答的事做成同步方法（读一个已经在内存里的值、做一次小的计算），其余的做成异步方法。

## 完整例子

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

**效果**（未在模拟器验证）：控制台依次输出登记了的模块名（其中有 `example`）、示例模块的同步方法名、`3`、`收到 tick，数据是 {"n":1}`，约半秒之后输出 `500 毫秒之后： hello`。

## 常见用法

下面的例子沿用完整例子里的 `example`。

### 先确认模块在不在

```js
if (application.nativeModules.has('example')) {
  const example = application.nativeModules.get('example');
  console.log(example.name);
} else {
  console.log('这个 App 没有装示例模块');
}
```

**效果**（未在模拟器验证）：装了 `@nacrejs/example-module` 的项目输出 `example`，没装的输出 `这个 App 没有装示例模块`。

不先确认就直接 `get()` 一个没登记的名字，会抛 `TypeError`，报错里列出登记了哪些名字，见 [`get()`](#get)。

### 处理原生报的错

原生那一侧报错时，同步方法把错误抛出来，异步方法的 Promise 被拒绝。两种情况拿到的都是一个 `Error`，`name` 和 `message` 是原生给的。

```js
try {
  example.call('fail', 'NotFound', 'no such thing', 404);
} catch (err) {
  const e = /** @type {NativeModuleError} */ (err);
  console.log(e.name, e.message, e.code);
}

example.callAsync('failLater', 'Offline', 'no network').catch((err) => {
  const e = /** @type {NativeModuleError} */ (err);
  console.log(e.name, e.message, 'code' in e);
});
```

**效果**（未在模拟器验证）：控制台输出 `NotFound no such thing 404`，随后输出 `Offline no network false`。

错误对象上有什么，见[原生报的错](#原生报的错)。

### 传二进制和收二进制

二进制用 `ArrayBuffer` 或者它的视图（`Uint8Array` 等）传过去，原生那一侧收到的是字节。原生交回来的二进制在 JS 这边是 `ArrayBuffer`。

```js
const digest = example.call('sha256', new Uint8Array([97, 98, 99]));
if (digest instanceof ArrayBuffer) {
  console.log(digest.byteLength);
}
```

**效果**（未在模拟器验证）：控制台输出 `32`。

二进制可以放在数组和对象里面。传一个视图时只传它覆盖的那一段字节，不是整个底层的 `ArrayBuffer`。

数据量大（几百 KB 以上）时，让原生把它作为异步方法的返回值直接交回来：这种情况下不经过编码，只复制一次。JS 拿到的 `ArrayBuffer` 是独立的一份，修改它不会影响原生那边的数据。其余情况（参数里的二进制、同步方法的返回值、事件的数据、嵌在数组和对象里的二进制）每一块都要编码一次再解码一次，数据越大越慢。具体的耗时**未实测**。

### 听事件和不再听

```js
/** @param {NativeModuleEvent} e */
const onTick = (e) => {
  console.log('tick', e.detail);
};
example.addEventListener('tick', onTick);
example.call('emit', 'tick', 1);
console.log('emit 已经返回');

setTimeout(() => {
  example.removeEventListener('tick', onTick);
}, 1000);
```

**效果**（未在模拟器验证）：控制台先输出 `emit 已经返回`，再输出 `tick 1`。一秒之后监听器被移除，之后的 `tick` 事件不再有输出。

事件不是在原生发出的那一刻送到的：运行时把它排到当前这段 JS 执行完之后。所以监听器的回调不会插到正在执行的代码中间。

没有监听器的时候原生发的事件不会保留。之后再加监听器，收不到加之前发的那些。

### 给模块包一层函数

写一个提供原生模块的包时，推荐在包自己的 JS 里把方法包成函数，把参数和返回值的类型写清楚。用包的人不需要知道模块名和方法名。

```js
const native = () => application.nativeModules.get('example');

/**
 * @param {ArrayBuffer | ArrayBufferView} data
 * @returns {ArrayBuffer}
 */
export function sha256(data) {
  return /** @type {ArrayBuffer} */ (native().call('sha256', data));
}
```

**效果**：用包的人写 `sha256(bytes)`，得到 `ArrayBuffer`。

`get()` 对同一个名字每次返回同一个对象，所以每次调用时现取就可以，不需要自己保存。

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

别的值都不能传：函数、`NaN`、`Infinity`、`BigInt`、`Symbol`、`Date`、`Map`、`Set`、正则、`Error`、`Promise`、类的实例、原生对象（视图、颜色、`Blob` 等）、自己引用自己的结构、含有不成对代理项的字符串。传了当场抛 `TypeError`，原生那一侧的方法不会被调用。报错里写明是第几个参数的哪个位置：

```js
try {
  example.call('echo', /** @type {any} */ ({ list: [1, { fn() {} }] }));
} catch (err) {
  console.log(String(err));
}
```

**效果**（未在模拟器验证）：控制台输出 `TypeError: example.echo: argument 1.list[1].fn is a function; only null, booleans, finite numbers, strings, arrays, plain objects and ArrayBuffers (or views on them) can be passed to a native module`。

要传日期、`Map` 这类值，先自己转成上面能传的形式（时间戳、数组）。

几条要知道的：

- **对象成员的顺序不保证。** 传过去再交回来的对象，成员的先后可能和写的时候不一样。不要依赖它。
- **整数超过 `Number.MAX_SAFE_INTEGER` 会丢精度。** 原生那一侧的 64 位整数交回来是 JS 的数。大整数让原生写成字符串。
- **同一个对象出现在两处可以传。** 到了原生是两份内容相同的值。

原生那一侧交回一个不在表里的值（比如一个日期对象）时，同步方法抛 `TypeError`，异步方法的 Promise 被拒绝，原因是 `TypeError`；事件带了这样的数据时，这个事件被丢掉，运行时输出一条警告。值不会被换成别的东西交过来。

## 原生报的错

原生那一侧报的错在 JS 这边是一个 `Error`。类型定义里它叫 `NativeModuleError`：

| 属性 | 类型 | 什么时候有 | 含义 |
| --- | --- | --- | --- |
| `name` | 字符串 | 总有 | 原生给的错误名。原生没有给名字时是 `'Error'` |
| `message` | 字符串 | 总有 | 原生给的说明 |
| `code` | 数 | 原生给了才有 | 原生给的错误码 |
| `domain` | 字符串 | 错误是 iOS 或第三方 SDK 产生的时候 | iOS 的错误域，比如 `'NSCocoaErrorDomain'`。它和 `code` 一起确定是哪一种错误 |

`name` 是 `'TypeError'` 或 `'RangeError'` 时，错误对象是对应的那个类的实例，`err instanceof TypeError` 成立。别的名字都是 `Error` 的实例，靠 `err.name` 区分。

原生的方法执行时抛出了 ObjC 异常，JS 这边同样得到一个 `Error`，`name` 是异常的名字。App 不会因此退出。**未在模拟器验证。**

异步方法在原生那一侧既没有交结果也没有报错、就把这次调用丢开了的时候，Promise 会被拒绝，`message` 里有 `finished without calling resolve or reject`。Promise 不会一直不结束。

## 成员说明

### `NativeModules`

`application.nativeModules` 的类。不能 `new`：

```js
try {
  // @ts-expect-error 不能 new
  new NativeModules();
} catch (err) {
  console.log(String(err));
}
```

**效果**（未在模拟器验证）：控制台输出 `TypeError: Illegal constructor: NativeModules is created by the runtime, not by new`。

| 属性 | 类型 | 可读 | 可写 | 含义 | 变化通知 |
| --- | --- | --- | --- | --- | --- |
| `names` | 字符串数组 | 是 | 否 | 登记了的模块名，按名字排序。数组是冻结的。每次读得到的是当时的情况 | 没有。模块在 App 启动时登记，之后一般不变 |

#### `has()`

```js
application.nativeModules.has('example');
```

| | |
| --- | --- |
| 参数 | `name`：模块名。不是字符串时先转成字符串 |
| 返回值 | 布尔。登记过是 `true`，没登记过是 `false` |
| 出错情况 | 没有 |

#### `get()`

```js
const example = application.nativeModules.get('example');
```

| | |
| --- | --- |
| 参数 | `name`：模块名。不是字符串时先转成字符串 |
| 返回值 | `NativeModule`。同一个名字每次返回同一个对象 |
| 出错情况 | 没登记过的名字抛 `TypeError`：`nativeModules.get: no native module named "nope"; registered modules: example`。一个模块都没登记时最后是 `registered modules: none` |

### `NativeModule`

一个模块。继承自 `EventTarget`。不能 `new`，只能从 `get()` 拿到。

| 属性 | 类型 | 可读 | 可写 | 含义 |
| --- | --- | --- | --- | --- |
| `name` | 字符串 | 是 | 否 | 登记时用的名字 |
| `methods` | 对象 | 是 | 否 | `{ sync, async }`：同步方法名的数组和异步方法名的数组，各自按名字排序。对象和两个数组都是冻结的，每次读是同一个对象 |
| `events` | 字符串数组 | 是 | 否 | 这个模块会发的事件名，按名字排序。数组是冻结的 |

这三个值在拿到模块对象之后不会变，所以没有变化通知。

#### `call()`

```js
const sum = example.call('add', 1, 2);
```

| | |
| --- | --- |
| 参数 | `method`：方法名。后面是传给原生的参数，个数不限，见[能传什么值](#能传什么值) |
| 返回值 | 原生给的值。原生没有返回值时是 `null` |
| 出错情况 | 都是当场抛，见下表 |

| 情况 | 抛什么 |
| --- | --- |
| 没给方法名 | `TypeError`：`call: a method name is required` |
| 模块没有这个方法 | `TypeError`：`call: native module "example" has no method "nope"; sync methods: …; async methods: …`，列出全部方法名 |
| 这个方法是异步的 | `TypeError`：`call: "echoLater" is an async method of native module "example"; use callAsync("echoLater", …) instead` |
| 参数里有不能传的值 | `TypeError`，写明是哪个参数的哪个位置 |
| 原生报了错 | 原生给的那个错误，见[原生报的错](#原生报的错) |
| 原生交回了不能传的值 | `TypeError` |

前四种情况下，原生那一侧的方法没有被调用。

#### `callAsync()`

```js
example.callAsync('echoLater', 'hello', 500).then((value) => {
  console.log(value);
});
```

| | |
| --- | --- |
| 参数 | 和 `call()` 相同 |
| 返回值 | `Promise`。兑现的值是原生给的值，原生没给时是 `null`。原生报错时被拒绝，原因见[原生报的错](#原生报的错) |
| 出错情况 | 没给方法名、模块没有这个方法、这个方法是同步的、参数里有不能传的值：**当场抛** `TypeError`，不返回 Promise。报错的写法和 `call()` 对应（方法是同步的时候提示改用 `call("方法名", …)`） |

原生那一侧即使当场就交了结果，Promise 也是在当前这段 JS 执行完之后才兑现。

#### `addEventListener()` 和 `removeEventListener()`

用法和别的 `EventTarget` 相同。事件名只能是 `events` 里列出的：

模块没有声明过的事件名也可以监听，不会报错：它被当成自定义事件，原生那边不会派发，只有自己用 `dispatchEvent()` 派发时才触发。

### 事件对象

模块的事件是 `Event`，多一个字段：

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| `type` | 字符串 | 事件名 |
| `target` | `NativeModule` | 发事件的模块 |
| `detail` | 见[能传什么值](#能传什么值) | 原生给的数据。原生没给时是 `null` |

事件不能取消：`cancelable` 是 `false`，调 `preventDefault()` 没有作用。

## 还不能做的

| 想做的事 | 状态 |
| --- | --- |
| 把 JS 的函数传给原生，让原生之后回调 | 不支持。函数不能作参数。用事件代替：原生发事件，JS 监听 |
| 把原生对象（视图、图片）传给模块，或者让模块交回一个原生对象 | 不支持。模块只能收发上面表里的值 |
| 模块提供一个可以放进界面的视图 | 不支持 |
| 让模块收到 App 级的系统回调（推送令牌、从别的 App 跳转进来的 URL） | 未实现 |
| 把 App 自己目录里的原生源码直接编进 App，不做成包 | 未实现。现在模块要做成一个带预编译 framework 的 npm 包 |
| 用 CocoaPods 或 Swift Package Manager 引第三方 SDK | 不支持。第三方 SDK 要以预编译的 `.xcframework` 随包带上 |

## 参见

- [写自己的原生模块](../guides/native-modules.md)：原生那一侧怎么写、怎么登记、怎么做成包
- [核心和能力包](capabilities.md)：包是怎么装进项目的
- [`application`](application.md)：`nativeModules` 所在的对象
- [运行时怎么工作](how-it-works.md)：JS 和界面在同一个线程上执行，同步方法执行期间界面在等
- [实现原理：原生模块](../internals/native-modules.md)：为什么分两层、值是怎么传的、验证到了什么
