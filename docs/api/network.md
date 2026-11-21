---
type: reference
---

# `application.network`

**`application.network`** 表示设备此刻的网络状态：有没有连上网络、走的是哪种网络、这个网络是不是按流量计费。三项里有一项变了，它派发 [`change`](network/change-event.md) 事件。

`application.network` 在整个 App 里只有一个，任何时候都能用，包括脚本顶层。它的类是 `Network`。三个属性都是只读的，每次读到的是这一刻的状态。

「连上了」的意思是设备有一条可以用来建立连接的网络。它不保证某一台服务器连得上：`isConnected` 是 `true` 时，[`fetch()`](fetch.md) 仍然可能失败；失败时 `fetch()` 返回的 Promise 被拒绝。

在模拟器上，网络状态跟着运行模拟器的 Mac 走。

**继承关系**：[`EventTarget`](event-target.md) → `NSObject` → `Network`

## 构造函数

不能用 `new` 创建：`new Network()` 抛 `TypeError`，信息是 `Illegal constructor: Network is created by the runtime, not by new`。唯一的实例从 [`application`](application.md) 的 [`network`](application/network.md) 属性拿到。

## 实例属性

| 属性 | 说明 |
| --- | --- |
| [`isConnected`](network/isconnected.md) <small>只读</small> | 有没有连上网络 |
| [`type`](network/type.md) <small>只读</small> | 走的是哪种网络：`'wifi'`、`'cellular'`、`'wired'`、`'other'`，没连上时是 `'none'` |
| [`isExpensive`](network/isexpensive.md) <small>只读</small> | 这个网络是不是按流量计费，比如蜂窝数据、个人热点 |

## 实例方法

继承 [`EventTarget`](event-target.md) 的 [`addEventListener()`](event-target/addeventlistener.md)、[`removeEventListener()`](event-target/removeeventlistener.md)、[`dispatchEvent()`](event-target/dispatchevent.md)，用来监听下面的事件。

## 事件

| 事件 | 什么时候派发 |
| --- | --- |
| [`change`](network/change-event.md) | `isConnected`、`type`、`isExpensive` 里有一项变了 |

`application.network` 会派发的只有 `change` 这一个事件。监听别的名字不会报错：它被当成自定义事件，只有自己用 `dispatchEvent()` 派发时才会触发。

## 示例

网络状态不涉及界面，这段代码直接写在 `main.js` 顶层就能运行。

```js
const network = application.network;
console.log('连着网络:', network.isConnected, '类型:', network.type, '按流量计费:', network.isExpensive);

network.addEventListener('change', () => {
  console.log('网络变了，现在是', network.type);
});
```

**结果**

- 启动时输出一行当前的状态。验收用的模拟器上读到的是 `连着网络: true 类型: wifi 按流量计费: false`。
- 之后断网、连上网络或者换了网络，输出 `网络变了，现在是` 和新的类型。**未在模拟器验证。**

## 对应的 iOS API

iOS 的网络状态来自 Network 框架的 `nw_path_monitor`（Swift 里是 `NWPathMonitor`）。它不是 ObjC 的类，`Network` 和它的成员是 Nacre 定义的。

| iOS | JS |
| --- | --- |
| `nw_path_monitor_create()`、`nw_path_monitor_start()` | 不用写。直接读 `application.network` |
| `nw_path_get_status(path) == nw_path_status_satisfied` | `network.isConnected` |
| `nw_path_uses_interface_type(path, nw_interface_type_wifi)` 等 | `network.type` |
| `nw_path_is_expensive(path)` | `network.isExpensive` |
| `nw_path_monitor_set_update_handler()` | `network.addEventListener('change', …)` |

### 与浏览器的对照

这张表只供熟悉 Web 的人查对应关系，正文不依赖它。

| Web | `application.network` |
| --- | --- |
| `navigator.onLine` | `isConnected` |
| `navigator.connection.type` | `type` |
| `online`、`offline` 事件 | `change` 事件，回调里读 `isConnected` |

## 参见

- [`application`](application.md)：`network` 是它的属性
- [`fetch()`](fetch.md)：发请求。`isConnected` 是 `true` 时请求仍然可能失败
- [`WebSocket`](websocket.md)：长连接断开时有自己的 `close` 事件
