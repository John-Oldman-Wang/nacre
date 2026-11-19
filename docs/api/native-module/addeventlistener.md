---
type: reference
---

# `NativeModule`：`addEventListener()` 方法

**`addEventListener()`** 方法监听这个模块发的事件。用法和别的 `EventTarget` 相同，事件对象多一个 `detail`，是原生给的数据。

## 语法

```
addEventListener(type, callback[, options])
```

### 参数

**`type`**

事件名，字符串。模块会发的事件名列在 [`events`](events.md) 里。

不在 `events` 里的名字也可以监听，不会报错：它被当成自定义事件，原生那边不会派发，只有自己用 `dispatchEvent()` 派发时才触发。

**`callback`**

事件来了时调用的函数，收到一个[事件对象](#事件对象)。传 `null` 什么都不做。

**`options`** <small>可选</small>

和 `EventTarget` 的 `addEventListener()` 相同，比如 `{ once: true }`。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

`type` 以 `@` 开头：`addEventListener has no value "@x"; names starting with @ are reserved for the runtime`。

## 事件对象

`Event`，多一个字段：

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| `type` | 字符串 | 事件名 |
| `target` | `NativeModule` | 发事件的模块 |
| `detail` | 见[能传什么值](../native-module.md#能传什么值) | 原生给的数据。原生没给时是 `null` |

事件不能取消：`cancelable` 是 `false`，调 `preventDefault()` 没有作用。类型定义里事件对象叫 `NativeModuleEvent`。

## 说明

- **事件不是在原生发出的那一刻送到的。** 它要等当前这段 JS 执行完才送到，所以回调不会插到正在执行的代码中间。
- **连着发的几个事件按发的先后到。**
- **没有监听器的时候原生发的事件不会保留。** 之后再加监听器，收不到加之前发的那些。
- 原生在后台线程上发的事件也照常送到，回调在主线程上执行。

## 示例

```js
const example = application.nativeModules.get('example');
example.addEventListener('tick', (e) => {
  console.log('tick', JSON.stringify(e.detail));
});
example.call('emit', 'tick', { n: 1 });
console.log('emit 已经返回');
```

**结果**：先输出 `emit 已经返回`，再输出 `tick {"n":1}`。

## 对应的 iOS API

没有对应的系统 API。原生那一侧怎么发事件，见[写自己的原生模块](../../guides/native-modules.md)。

## 参见

- [`removeEventListener()`](removeeventlistener.md)
- [`events`](events.md)
