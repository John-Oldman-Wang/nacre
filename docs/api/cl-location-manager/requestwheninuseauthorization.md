---
type: reference
native: "-[CLLocationManager requestWhenInUseAuthorization]"
---

# `CLLocationManager`：`requestWhenInUseAuthorization()` 方法

**`requestWhenInUseAuthorization()`** 方法向用户申请「使用 App 期间」的定位。

## 语法

```
requestWhenInUseAuthorization()
```

### 参数

无。

### 返回值

`Promise`，兑现成申请之后的[授权状态](authorizationstatus.md)，字符串。

- 状态是 `'notDetermined'` 时，系统弹出提示框，里面是 `nacre.config.json` 里写的 `NSLocationWhenInUseUsageDescription`。用户选完，Promise 兑现成新的状态。提示框的样子和选项由系统决定。**未在模拟器验证。**
- 状态已经不是 `'notDetermined'` 时，当场兑现成现在的状态，不弹提示框。系统对每个 App 只问一次。
- 同时调用几次，提示框只出现一次，几个 Promise 一起兑现。

Promise 被拒绝时得到 [`CLLocationError`](../cl-location-error.md)：

| `name` | 什么时候 |
| --- | --- |
| `'InvalidStateError'` | Info.plist 里没有 `NSLocationWhenInUseUsageDescription`。用 Nacre 的命令行工具生成的工程不会出现这种情况，它在生成时就检查了 |
| `'InvalidStateError'` | App 在后台。系统只在用户正在用 App 时才问 |
| `'CLError'` | 系统报告提示框没有展示给用户。**未在模拟器验证** |

两种 `'InvalidStateError'` 的 `message`：

- `requestWhenInUseAuthorization: NSLocationWhenInUseUsageDescription is missing from Info.plist, so the system will not ask; add it under ios.infoPlist in nacre.config.json`
- `requestWhenInUseAuthorization: the app is in the background, and the system only asks while the app is in use`

### 异常

无。出错都从 Promise 拒绝。

## 说明

- 每次要用位置之前都调一次是安全的：问过了就不再弹。
- 用户拒绝之后，App 没有办法再弹提示框，只有用户自己去系统的「设置」里改。
- 用户可以选「允许一次」，这时兑现成 `'authorizedWhenInUse'`。**未在模拟器验证。**

## 示例

```js
const manager = new CLLocationManager();
manager.requestWhenInUseAuthorization().then((status) => {
  console.log(status);
});
```

**效果**：状态已经确定时当场输出现在的状态。状态是 `'notDetermined'` 时系统弹出提示框，用户选完之后输出新的状态（**未在模拟器验证**）。

## 对应的 iOS API

`-[CLLocationManager requestWhenInUseAuthorization]`。ObjC 里结果从委托的 `locationManagerDidChangeAuthorization:` 来，这里从返回的 Promise 来。

## 参见

- [`authorizationStatus`](authorizationstatus.md)：五种状态
- [`authorizationchange`](authorizationchange-event.md)：状态变了的通知
- [取用户的位置](../../guides/get-location.md#什么时候申请授权)：什么时候申请效果最好
- [安装 `@nacrejs/core-location`](../cl-location-manager.md#先装上)
