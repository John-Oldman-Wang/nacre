---
type: reference
native: "nw_path_get_status == nw_path_status_satisfied"
---

# `Network`：`isConnected` 属性

**`isConnected`** 属性表示设备此刻有没有连上网络。

## 值

布尔值。

| 取值 | 含义 |
| --- | --- |
| `true` | 设备有一条可以用来建立连接的网络。[`type`](type.md) 是 `'none'` 以外的值 |
| `false` | 没有可用的网络，比如 Wi-Fi 和蜂窝数据都不可用。`type` 是 `'none'` |

- 只读。给它赋值抛 `TypeError`。
- 每次读到的是这一刻的状态。
- `true` 不保证某一台服务器连得上：请求仍然可能失败。
- `isConnected` 和 `type` 总是一致的：`isConnected` 是 `false` 时 `type` 是 `'none'`，反过来也一样（验收用例里核对过当时的值）。
- 验收用的模拟器上读到的是 `true`。断网时读到 `false`，**未在模拟器验证**。

### 怎么得知它变了

它变了时，[`application.network`](../network.md) 派发 [`change`](change-event.md)。

## 示例

```js
const network = application.network;
if (!network.isConnected) {
  console.log('没有网络');
}
network.addEventListener('change', () => {
  console.log(network.isConnected ? '连上了' : '断开了');
});
```

**效果**：启动时没有网络，输出 `没有网络`。之后网络连上或断开时，输出 `连上了` 或 `断开了`；网络只是换了一种、一直连着时，输出 `连上了`。断开和连上时的输出**未在模拟器验证**。

## 对应的 iOS API

Network 框架里 `nw_path_get_status(path)` 等于 `nw_path_status_satisfied`。Swift 里是 `NWPathMonitor` 给出的 `path.status == .satisfied`。

## 参见

- [`type`](type.md)、[`isExpensive`](isexpensive.md)
- [`change`](change-event.md)
