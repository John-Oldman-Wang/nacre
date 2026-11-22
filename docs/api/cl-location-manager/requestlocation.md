---
type: reference
native: "-[CLLocationManager requestLocation]"
---

# `CLLocationManager`：`requestLocation()` 方法

**`requestLocation()`** 方法取一次当前的位置。系统按 [`desiredAccuracy`](desiredaccuracy.md) 去定位，拿到一个位置之后自己停下。

## 语法

```
requestLocation()
```

### 参数

无。

### 返回值

`Promise`，兑现成一个 [`CLLocation`](../cl-location.md)。

- 通常要几秒。**耗时和超时未在模拟器验证。**
- 上一次还没结算时再调一次，系统只定位一次，两个 Promise 得到同一个结果。
- 取到位置时也派发一次 [`locationupdate`](locationupdate-event.md)。

Promise 被拒绝时得到 [`CLLocationError`](../cl-location-error.md)：

| `name` | 什么时候 |
| --- | --- |
| `'NotAllowedError'` | 授权状态不是 `'authorizedWhenInUse'` 或 `'authorizedAlways'`。当场拒绝，不弹提示框，不等待。`cause.code` 是 1，`cause.domain` 是 `'kCLErrorDomain'` |
| `'InvalidStateError'` | 这个 `manager` 正在连续更新 |
| `'AbortError'` | 结算之前调了 `startUpdatingLocation()` 或 `stopUpdatingLocation()` |
| `'LocationUnknownError'` | 系统定不出位置。模拟器上没有设位置时就是这样。**未在模拟器验证** |
| `'NetworkError'`、`'NSError'` | 系统报告的其他错误。`'NetworkError'` 的系统错误码在 `cause.code`，`'NSError'` 的在 `code`。**未在模拟器验证** |

`'NotAllowedError'` 的 `message`：还没申请过时是 `requestLocation: location authorization has not been requested yet; call requestWhenInUseAuthorization() first`；其他状态是 `requestLocation: location access is denied` 这样，最后一个词是当前的状态。

`'InvalidStateError'` 的 `message`：`requestLocation: location updates are running; read the locationupdate event instead, or call stopUpdatingLocation() first`。

`'AbortError'` 的 `message`：`requestLocation was cancelled by ` 加上取消它的方法名。

### 异常

无。出错都从 Promise 拒绝。

## 说明

只要一个位置时用它，不用记得关。要跟着用户移动，用 [`startUpdatingLocation()`](startupdatinglocation.md)。

## 示例

```js
const manager = new CLLocationManager();
manager.requestLocation().then(
  (here) => {
    console.log(here.coordinate.latitude, here.coordinate.longitude);
  },
  (err) => {
    console.log('没取到：' + err.name);
  });
```

**效果**：取到时输出纬度和经度两个数。没取到时输出 `没取到：` 加错误的名字。没有授权时输出 `没取到：NotAllowedError`。

## 对应的 iOS API

`-[CLLocationManager requestLocation]`。ObjC 里结果从委托的 `locationManager:didUpdateLocations:` 或 `locationManager:didFailWithError:` 来，这里从返回的 Promise 来。

## 参见

- [`startUpdatingLocation()`](startupdatinglocation.md)：持续接收位置
- [`CLLocationError`](../cl-location-error.md)：错误的分类
- [安装 `@nacrejs/core-location`](../cl-location-manager.md#先装上)
