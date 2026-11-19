---
type: reference
---

# `NativeModule`：`call()` 方法

**`call()`** 方法调这个模块的一个同步方法，原生执行完才返回，返回值就是原生给的值。

同步方法执行期间，JS 和界面都在等它返回。

## 语法

```
call(method, ...args)
```

### 参数

**`method`**

方法名，字符串。必须是 [`methods.sync`](methods.md) 里的。不是字符串时先转成字符串。

**`args`**

传给原生的参数，个数不限。每一个都必须是[能传的值](../native-module.md#能传什么值)。

### 返回值

原生给的值，见[能传什么值](../native-module.md#能传什么值)。原生没有返回值时是 `null`。

### 异常

**`TypeError`**

下面几种情况下，原生那一侧的方法没有被调用：

- 没给方法名：`call: a method name is required`。
- 模块没有这个方法：`call: native module "example" has no method "nope"; sync methods: …; async methods: …`，列出全部方法名。
- 这个方法是异步的：`call: "echoLater" is an async method of native module "example"; use callAsync("echoLater", …) instead`。
- 参数里有不能传的值，报错里写明是第几个参数的哪个位置：`example.echo: argument 1.list[1].fn is a function; only null, booleans, finite numbers, strings, arrays, plain objects and ArrayBuffers (or views on them) can be passed to a native module`。
- 不是在模块对象上调的（比如把 `call` 取下来单独调）：`call: Illegal invocation`。

原生已经执行之后：

- 原生交回了不能传的值：`TypeError`。

**原生给的错误**

原生报了错时，抛出原生给的那个错误，见[原生报的错](../native-module.md#原生报的错)。

## 示例

### 调一个同步方法

```js
const example = application.nativeModules.get('example');
console.log(example.call('add', 1, 2));
```

**结果**：输出 `3`。

### 传不能传的值

```js
const example = application.nativeModules.get('example');
try {
  example.call('echo', /** @type {any} */ ({ list: [1, { fn() {} }] }));
} catch (err) {
  console.log(String(err));
}
```

**结果**：输出 `TypeError: example.echo: argument 1.list[1].fn is a function; only null, booleans, finite numbers, strings, arrays, plain objects and ArrayBuffers (or views on them) can be passed to a native module`。

### 原生报错

```js
const example = application.nativeModules.get('example');
try {
  example.call('fail', 'NotFound', 'no such thing', 404);
} catch (err) {
  const e = /** @type {NativeModuleError} */ (err);
  console.log(e.name, e.message, e.code);
}
```

**结果**：输出 `NotFound no such thing 404`。

## 对应的 iOS API

没有对应的系统 API。原生那一侧怎么登记同步方法，见[写自己的原生模块](../../guides/native-modules.md)。

## 参见

- [`callAsync()`](callasync.md)：调异步方法
- [能传什么值](../native-module.md#能传什么值)
- [原生报的错](../native-module.md#原生报的错)
