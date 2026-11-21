---
type: reference
native: nw_path_monitor_set_update_handler
---

# `Network`：`change` 事件

**`change`** 事件在网络状态变了之后派发：[`isConnected`](isconnected.md)、[`type`](type.md)、[`isExpensive`](isexpensive.md) 三项里有一项变了。

## 语法

```
application.network.addEventListener('change', (event) => { })
```

## 事件对象

`Event`。只有 `type` 和 `target`（`application.network`），不带新的状态。不能取消。

## 什么时候派发

- **事件不说明是哪一项变了。** 回调里读三个属性，得到的是变化之后的状态。
- 三项都没变时不派发。比如从一个 Wi-Fi 换到另一个 Wi-Fi，三项都没变，就没有事件。
- App 启动时拿到第一份网络状态，不算变化，不派发。
- 在事情发生之后、当前这段 JS 执行完之后派发。回调不会在一次读属性的中途被调用。
- 没有监听器时不派发。属性照样随时读得到最新的状态。
- 监听 `change` 不报错，这一点在验收用例里验证过。断网、连上网络、换一种网络时事件来不来，**未在模拟器验证**：模拟器跟着运行它的 Mac 的网络走，验收改不了网络。

## 示例

```js
const network = application.network;
const onChange = () => {
  console.log('网络变了:', network.isConnected, network.type, network.isExpensive);
};
network.addEventListener('change', onChange);
```

**效果**：关掉 Wi-Fi 改走蜂窝数据时，输出一行 `网络变了: true cellular true`。**未在模拟器验证。**

不再需要时用 `network.removeEventListener('change', onChange)` 移除。

## 对应的 iOS API

Network 框架的 `nw_path_monitor_set_update_handler()`。系统每给出一条新的网络路径就调一次那个回调；这里只在三项里有一项变了时才派发 `change`。

## 参见

- [`isConnected`](isconnected.md)、[`type`](type.md)、[`isExpensive`](isexpensive.md)
- [`application.network`](../network.md)
