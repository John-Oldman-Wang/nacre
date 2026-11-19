---
type: reference
native: CLLocation.timestamp
---

# `CLLocation`：`timestamp` 属性

**`timestamp`** 属性是这个位置是什么时候量的。

## 值

`Date`。

- 只读。给它赋值抛 `TypeError`。
- 总是有值，是有效的时间。
- 每次读得到一个新的 `Date`。修改读出来的 `Date` 不影响位置。
- 连续更新开始后收到的第一个位置可能是系统以前存下的，它的时间比现在早。

## 示例

```js
const manager = new CLLocationManager();
manager.requestLocation().then((here) => {
  const ageSeconds = (Date.now() - here.timestamp.getTime()) / 1000;
  console.log('这个位置是 ' + ageSeconds.toFixed(0) + ' 秒以前量的');
}, () => {});
```

**效果**：输出这个位置量了多少秒。

## 对应的 iOS API

`CLLocation.timestamp`。ObjC 里是 `NSDate`，这里是 `Date`。

## 参见

- [取用户的位置](../../guides/get-location.md#挑出可用的位置)：去掉太旧的位置
- [安装 `@nacrejs/core-location`](../cl-location-manager.md#先装上)
