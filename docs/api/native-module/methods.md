---
type: reference
---

# `NativeModule`：`methods` 属性

**`methods`** 属性列出这个模块的方法名，分成同步的和异步的两组。

## 值

对象 `{ sync, async }`：

- `sync`：同步方法名的数组，按名字排序。这些方法用 [`call()`](call.md) 调。
- `async`：异步方法名的数组，按名字排序。这些方法用 [`callAsync()`](callasync.md) 调。

说明：

- 只读。给它赋值抛 `TypeError`。
- 对象和两个数组都是冻结的。
- 每次读是同一个对象。
- 拿到模块对象之后不会变，没有变化通知。

## 示例

```js
const example = application.nativeModules.get('example');
console.log(example.methods.sync.includes('add'));
console.log(example.methods.async.includes('echoLater'));
console.log(example.methods === example.methods);
```

**结果**：依次输出 `true`、`true`、`true`。

## 对应的 iOS API

没有对应的系统 API。方法名和同步异步是原生那一侧登记时定的。

## 参见

- [同步方法和异步方法](../native-module.md#同步方法和异步方法)
