---
type: reference
native: application.network
---

# `Application`：`network` 属性

**`network`** 属性是设备网络状态的入口：有没有连上网络、走的是哪种网络、是不是按流量计费。

## 值

`Network`。它的属性和事件见[网络状态](../network.md)。

- 只读。给它赋值抛 `TypeError`。
- 每次读到的都是同一个对象。

## 示例

```js
console.log(application.network === application.network);
console.log(application.network.isConnected);
```

**结果**：控制台先输出 `true`。第二行在设备连着网络时输出 `true`。

## 对应的 iOS API

见[网络状态](../network.md)。

## 参见

- [网络状态](../network.md)
