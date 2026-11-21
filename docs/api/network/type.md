---
type: reference
native: nw_path_uses_interface_type
---

# `Network`：`type` 属性

**`type`** 属性表示设备此刻走的是哪种网络。

## 值

字符串，五个值之一：

| 取值 | 含义 |
| --- | --- |
| `'wifi'` | 走 Wi-Fi |
| `'cellular'` | 走蜂窝数据 |
| `'wired'` | 走有线网络，比如通过转接头插了网线 |
| `'other'` | 连着网络，但走的不是上面三种 |
| `'none'` | 没连上网络。[`isConnected`](isconnected.md) 是 `false` 时就是这个值 |

- 只读。给它赋值抛 `TypeError`。
- 每次读到的是这一刻的状态。
- 网络同时用到几种时，按 `'wifi'`、`'cellular'`、`'wired'` 的顺序取第一个用到的。
- `type` 是 `'none'` 和 `isConnected` 是 `false` 总是同时成立。
- 验收用的模拟器上读到的是 `'wifi'`。`'cellular'`、`'wired'`、`'other'`、`'none'` 这几个值**未在模拟器验证**。

### 怎么得知它变了

它变了时，[`application.network`](../network.md) 派发 [`change`](change-event.md)。

## 示例

```js
const network = application.network;
const label = new UILabel();
function showType() {
  label.text = network.type === 'none' ? '没有网络' : '网络：' + network.type;
}
showType();
network.addEventListener('change', showType);
```

**效果**：`label` 显示当前的网络，比如 `网络：wifi`；网络换了之后跟着更新，断网时显示 `没有网络`。启动时的显示在验收用的模拟器上是 `网络：wifi`；跟着更新**未在模拟器验证**。

## 对应的 iOS API

Network 框架的 `nw_path_uses_interface_type()`，依次传 `nw_interface_type_wifi`、`nw_interface_type_cellular`、`nw_interface_type_wired`。Swift 里是 `NWPathMonitor` 给出的 `path.usesInterfaceType(_:)`。

## 参见

- [`isConnected`](isconnected.md)、[`isExpensive`](isexpensive.md)
- [`change`](change-event.md)
