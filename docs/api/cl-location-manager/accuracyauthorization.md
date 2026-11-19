---
type: reference
native: CLLocationManager.accuracyAuthorization
---

# `CLLocationManager`：`accuracyAuthorization` 属性

**`accuracyAuthorization`** 属性表示用户给 App 的是精确位置还是大概位置。

## 值

字符串，下面两个之一：

| 取值 | 含义 |
| --- | --- |
| `'fullAccuracy'` | 精确位置 |
| `'reducedAccuracy'` | 大概位置：误差在 5 公里左右，更新得更少，收到的位置可能是 20 分钟以前的。这三个数来自 Apple 的头文件，**未在模拟器验证** |

- 只读。给它赋值抛 `TypeError`。
- 没有默认值，取决于用户的选择。App 不能要求用户给精确位置。
- 变了的时候派发 [`authorizationchange`](authorizationchange-event.md)。

## 示例

```js
const manager = new CLLocationManager();
if (manager.accuracyAuthorization === 'reducedAccuracy') {
  console.log('只有大概位置，不显示到门牌号');
}
```

**效果**：用户只给了大概位置时输出一行。

## 对应的 iOS API

`CLLocationManager.accuracyAuthorization`。`CLAccuracyAuthorizationFullAccuracy` 写成 `'fullAccuracy'`，`CLAccuracyAuthorizationReducedAccuracy` 写成 `'reducedAccuracy'`。

## 参见

- [`desiredAccuracy`](desiredaccuracy.md)：`'reduced'` 时得到的和用户只给了大概位置时一样
- [安装 `@nacrejs/core-location`](../cl-location-manager.md#先装上)
