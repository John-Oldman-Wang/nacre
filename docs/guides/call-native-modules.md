# 从 JS 调原生模块

这一篇讲 JS 这一侧怎么用原生模块：确认模块在不在、调方法、处理原生报的错、传二进制、听事件、给模块包一层函数。用到的是 [`application.nativeModules`](../api/native-modules.md) 和 [`NativeModule`](../api/native-module.md)。原生那一侧怎么写、怎么做成包，见[写自己的原生模块](native-modules.md)。

## 推荐的做法

- **写提供原生模块的包时，在包自己的 JS 里把方法包成函数。** 用包的人调普通的函数，不需要知道模块名和方法名，参数和返回值的类型也能写清楚。写法见[给模块包一层函数](#给模块包一层函数)。
- **不确定模块装没装时，先用 [`has()`](../api/native-modules/has.md) 问。** 直接 [`get()`](../api/native-modules/get.md) 一个没登记的名字会抛 `TypeError`。
- **同步方法只用来做很快就能答的事。** 同步方法执行期间，JS 和界面都在等它返回。
- **大块二进制让原生作为异步方法的返回值交回来。** 这种情况下不经过编码，只复制一次，见[传二进制和收二进制](#传二进制和收二进制)。

## 第一个例子

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

下面各节沿用这里的 `example`。

## 先确认模块在不在

```js
if (application.nativeModules.has('example')) {
  console.log(application.nativeModules.get('example').name);
} else {
  console.log('这个 App 没有装示例模块');
}
```

**效果**：装了 `@nacrejs/example-module` 的项目输出 `example`，没装的输出 `这个 App 没有装示例模块`。

## 处理原生报的错

原生那一侧报错时，同步方法把错误抛出来，异步方法的 Promise 被拒绝。两种情况拿到的都是一个 `Error`，`name` 和 `message` 是原生给的，原生给了错误码的还有 `code`。

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

**效果**：控制台输出 `NotFound no such thing 404`，随后输出 `Offline no network false`。

错误对象上有什么，见[原生报的错](../api/native-module.md#原生报的错)。报错之后模块照常能用。

## 传二进制和收二进制

二进制用 `ArrayBuffer` 或者它的视图（`Uint8Array` 等）传过去，原生那一侧收到的是字节。原生交回来的二进制在 JS 这边是 `ArrayBuffer`。

```js
const digest = example.call('sha256', new Uint8Array([97, 98, 99]));
if (digest instanceof ArrayBuffer) {
  console.log(digest.byteLength);
}
```

**效果**：控制台输出 `32`。

- 二进制可以放在数组和对象里面。
- 传一个视图时只传它覆盖的那一段字节，不是整个底层的 `ArrayBuffer`。
- JS 拿到的 `ArrayBuffer` 是独立的一份，修改它不会影响原生那边的数据。
- 数据量大（几百 KB 以上）时，让原生把它作为异步方法的返回值直接交回来：这种情况下不经过编码，只复制一次。其余情况每一块都要编码一次再解码一次，数据越大越慢。具体的耗时**未实测**。

## 传日期、`Map` 这类值

参数只能是 `null`、布尔、有限的数、字符串、数组、普通对象和二进制，见[能传什么值](../api/native-module.md#能传什么值)。日期、`Map` 这类值先自己转成能传的形式。

```js
const when = new Date();
const tags = new Map([['a', 1]]);
example.call('echo', { at: when.getTime(), tags: Array.from(tags) });
```

**效果**：原生收到 `{ at: 毫秒数, tags: [['a', 1]] }`。直接传 `when` 或 `tags` 会当场抛 `TypeError`，原生的方法不会被调用。

## 听事件和不再听

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

**效果**：控制台先输出 `emit 已经返回`，再输出 `tick 1`。一秒之后监听器被移除，之后的 `tick` 事件不再有输出。

- 事件不是在原生发出的那一刻送到的：运行时把它排到当前这段 JS 执行完之后。所以监听器的回调不会插到正在执行的代码中间。
- 没有监听器的时候原生发的事件不会保留。之后再加监听器，收不到加之前发的那些。

## 给模块包一层函数

写一个提供原生模块的包时，在包自己的 JS 里把方法包成函数，把参数和返回值的类型写清楚。

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

## 参见

- [`application.nativeModules`](../api/native-modules.md)：按名字拿到模块
- [`NativeModule`](../api/native-module.md)：调方法、听事件、能传什么值、原生报的错
- [写自己的原生模块](native-modules.md)：原生那一侧
