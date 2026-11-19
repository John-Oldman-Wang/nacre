---
type: reference
native: CLLocationManager.authorizationStatus
---

# `CLLocationManager`：`authorizationStatus` 属性

**`authorizationStatus`** 属性表示用户同不同意 App 使用定位。读它不会弹出任何东西。

## 值

字符串，下面五个之一：

| 取值 | 含义 | 能取位置吗 |
| --- | --- | --- |
| `'notDetermined'` | 还没问过用户 | 不能 |
| `'authorizedWhenInUse'` | 用户同意 App 在使用期间定位 | 能 |
| `'denied'` | 用户拒绝了，或者整个系统的定位服务被关掉了 | 不能 |
| `'restricted'` | 设备上的限制不允许定位（家长控制、企业管理），用户自己改不了 | 不能 |
| `'authorizedAlways'` | 用户允许 App 任何时候定位。这个包不会申请它，用户在系统设置里手动改成「始终」时读得到 | 能 |

- 只读。给它赋值抛 `TypeError`。
- 没有默认值，取决于用户的选择。
- 用户选了「允许一次」时是 `'authorizedWhenInUse'`，App 下次启动时回到 `'notDetermined'`。**未在模拟器验证。**
- 变了的时候派发 [`authorizationchange`](authorizationchange-event.md)。用户在系统设置里改了之后收到事件这一条**未在模拟器验证**。

## 示例

```js
const manager = new CLLocationManager();
const status = manager.authorizationStatus;
if (status === 'notDetermined') {
  console.log('还没问过');
} else if (status === 'denied' || status === 'restricted') {
  console.log('不能定位');
} else {
  console.log('可以定位');
}
```

**效果**：控制台输出三行里的一行。不弹提示框。

## 对应的 iOS API

`CLLocationManager.authorizationStatus`。`kCLAuthorizationStatusAuthorizedWhenInUse` 写成 `'authorizedWhenInUse'`，其余同理。

## 参见

- [`requestWhenInUseAuthorization()`](requestwheninuseauthorization.md)：向用户申请
- [授权](../cl-location-manager.md#授权)
- [安装 `@nacrejs/core-location`](../cl-location-manager.md#先装上)
