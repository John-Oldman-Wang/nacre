---
type: reference
native: nw_path_is_expensive
---

# `Network`：`isExpensive` 属性

**`isExpensive`** 属性表示设备此刻走的网络是不是按流量计费，比如蜂窝数据、连着手机开的个人热点。

## 值

布尔值。

| 取值 | 含义 |
| --- | --- |
| `true` | 系统认为这个网络按流量计费。走蜂窝数据、连着个人热点时是 `true` |
| `false` | 不按流量计费，比如普通的 Wi-Fi。没连上网络时也是 `false` |

- 只读。给它赋值抛 `TypeError`。
- 每次读到的是这一刻的状态。
- 哪些网络算按流量计费由系统判断，App 改不了。
- 验收用的模拟器上读到的是 `false`。`true` 的情况和没连上网络时的值**未在模拟器验证**。

### 怎么得知它变了

它变了时，[`application.network`](../network.md) 派发 [`change`](change-event.md)。

## 示例

```js
const network = application.network;
const quality = network.isExpensive ? 'low' : 'high';
console.log('图片清晰度:', quality);
```

**效果**：走 Wi-Fi 时输出 `图片清晰度: high`，走蜂窝数据时输出 `图片清晰度: low`。验收用的模拟器上输出 `图片清晰度: high`；走蜂窝数据时的输出**未在模拟器验证**。

## 对应的 iOS API

Network 框架的 `nw_path_is_expensive()`。Swift 里是 `NWPathMonitor` 给出的 `path.isExpensive`。

## 参见

- [`isConnected`](isconnected.md)、[`type`](type.md)
- [`change`](change-event.md)
