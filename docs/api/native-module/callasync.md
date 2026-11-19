---
type: reference
---

# `NativeModule`：`callAsync()` 方法

**`callAsync()`** 方法调这个模块的一个异步方法，返回一个 Promise。原生那一侧执行期间 JS 照常往下跑。

## 语法

```
callAsync(method, ...args)
```

### 参数

**`method`**

方法名，字符串。必须是 [`methods.async`](methods.md) 里的。不是字符串时先转成字符串。

**`args`**

传给原生的参数，个数不限。每一个都必须是[能传的值](../native-module.md#能传什么值)。

### 返回值

`Promise`。

- 兑现的值是原生给的值，原生没给时是 `null`。
- 原生报错时被拒绝，原因见[原生报的错](../native-module.md#原生报的错)。
- 原生交回了不能传的值时被拒绝，原因是 `TypeError`。
- 原生那一侧既没有交结果也没有报错、就把这次调用丢开了的时候，被拒绝，`message` 里有 `finished without calling resolve or reject`。Promise 不会一直不结束。
- 原生那一侧交了两次结果时，第一次算数。

原生那一侧即使当场就交了结果，Promise 也是在当前这段 JS 执行完之后才兑现。

### 异常

**`TypeError`**

下面几种情况**当场抛**，不返回 Promise，原生那一侧的方法没有被调用：

- 没给方法名：`callAsync: a method name is required`。
- 模块没有这个方法：`callAsync: native module "example" has no method "nope"; sync methods: …; async methods: …`。
- 这个方法是同步的：`callAsync: "add" is a sync method of native module "example"; use call("add", …) instead`。
- 参数里有不能传的值，报错的写法和 [`call()`](call.md#异常) 相同。

## 说明

数据量大（几百 KB 以上）的二进制，让原生把它作为异步方法的返回值直接交回来：这种情况下不经过编码，只复制一次。其余情况（参数里的二进制、同步方法的返回值、事件的数据、嵌在数组和对象里的二进制）每一块都要编码一次再解码一次，数据越大越慢。具体的耗时**未实测**。

## 示例

### 调一个异步方法

```js
const example = application.nativeModules.get('example');
example.callAsync('echoLater', 'hello', 500).then((value) => {
  console.log(value);
});
console.log('callAsync 已经返回');
```

**结果**：先输出 `callAsync 已经返回`，约半秒之后输出 `hello`。

### 原生报错

```js
const example = application.nativeModules.get('example');
example.callAsync('failLater', 'Offline', 'no network').catch((err) => {
  const e = /** @type {NativeModuleError} */ (err);
  console.log(e.name, e.message, 'code' in e);
});
```

**结果**：输出 `Offline no network false`。原生没给错误码，所以没有 `code`。

## 对应的 iOS API

没有对应的系统 API。原生那一侧怎么登记异步方法，见[写自己的原生模块](../../guides/native-modules.md)。

## 参见

- [`call()`](call.md)：调同步方法
- [原生报的错](../native-module.md#原生报的错)
