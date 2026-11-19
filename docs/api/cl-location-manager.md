---
type: reference
native: CLLocationManager
status: partial
---

# `CLLocationManager`

**`CLLocationManager`** 表示 App 向系统要位置的一个入口。通过它可以问用户同不同意 App 使用定位、取一次当前的位置、持续接收位置的更新。

定位这一组有四个类型，各有一页：

- `CLLocationManager`：这一页。
- [`CLLocation`](cl-location.md)：一个位置。经纬度、海拔、各个量的误差、速度、移动方向，以及这个位置是什么时候量的。
- [`CLLocationCoordinate2D`](cl-location-coordinate-2d.md)：经纬度，单位是度。
- [`CLLocationError`](cl-location-error.md)：定位出错时得到的 `Error`。

这一组只包括「使用 App 期间」的定位：App 在前台、用户正在用它的时候取位置。

> **注意**：成员的形状、默认值、写错时的报错，以及已经授权时取一次位置、收到位置更新的事件，在模拟器（iPhone Air）的验收里验过。授权提示框、用户拒绝之后的行为、位置多久来一次，来自 Apple 的头文件和文档，逐条标了「未在模拟器验证」。

**继承关系**：`EventTarget` → `NSObject` → `CLLocationManager`

怎么申请授权、取位置、处理出错，见指南[取用户的位置](../guides/get-location.md)。

## 先装上

定位不在核心里，要先装 `@nacrejs/core-location` 这个包才有。没装的时候全局上没有 `CLLocationManager`，类型检查也会报找不到这个名字。三步。

**1. 装包。**

```bash
npm install @nacrejs/core-location
```

**效果**：下次生成 `ios/` 时，工程里多嵌一个 `NacreCoreLocation.framework`。不装的项目，产物里没有它。

**2. 写一句给用户看的说明。** 系统问用户同不同意定位时，提示框里会显示一句由 App 提供的话，说明为什么要用位置。这句话写在 `nacre.config.json` 里，键名是系统规定的 `NSLocationWhenInUseUsageDescription`：

```json
{
  "name": "Shop",
  "bundleId": "com.example.shop",
  "ios": {
    "infoPlist": {
      "NSLocationWhenInUseUsageDescription": "Show stores near you"
    }
  }
}
```

**效果**：装了这个包却没写这一句，生成 `ios/` 时报错并停下：

```
nacre: @nacrejs/core-location needs NSLocationWhenInUseUsageDescription in Info.plist: a sentence shown to the user explaining why the app needs this permission. Put it in ios.infoPlist in nacre.config.json
```

按语言各写一句的写法见[配置 App](../guides/project-config.md#写权限文案)。

**3. 让类型进来。** 在入口文件顶上加一行：

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/core-location" />
```

**效果**：编辑器里 `CLLocationManager` 有了补全和检查。少了这一行，`tsc` 报 `Cannot find name 'CLLocationManager'`。

## 构造函数

[`CLLocationManager()`](cl-location-manager/constructor.md)

创建一个定位的入口。推荐整个 App 只建一个。

## 实例属性

还继承 `NSObject` 的属性。

| 属性 | 说明 |
| --- | --- |
| [`authorizationStatus`](cl-location-manager/authorizationstatus.md) <small>只读</small> | 用户同不同意 App 使用定位 |
| [`accuracyAuthorization`](cl-location-manager/accuracyauthorization.md) <small>只读</small> | 用户给的是精确位置还是大概位置 |
| [`desiredAccuracy`](cl-location-manager/desiredaccuracy.md) | 希望位置准到多少米以内 |
| [`distanceFilter`](cl-location-manager/distancefilter.md) | 连续更新时，移动多远才报一次新位置 |
| [`location`](cl-location-manager/location.md) <small>只读</small> | 最近一次的位置 |

## 实例方法

还继承 `EventTarget` 的 `addEventListener()`、`removeEventListener()`、`dispatchEvent()`。

| 方法 | 说明 |
| --- | --- |
| [`requestWhenInUseAuthorization()`](cl-location-manager/requestwheninuseauthorization.md) | 向用户申请「使用 App 期间」的定位。返回 Promise |
| [`requestLocation()`](cl-location-manager/requestlocation.md) | 取一次位置。返回 Promise |
| [`startUpdatingLocation()`](cl-location-manager/startupdatinglocation.md) | 开始连续更新，位置从 `locationupdate` 事件来 |
| [`stopUpdatingLocation()`](cl-location-manager/stopupdatinglocation.md) | 停止连续更新 |

## 事件

用 `addEventListener()` 监听。三个事件都不能取消，回调在事件发生之后的下一轮执行。

| 事件 | 什么时候派发 |
| --- | --- |
| [`locationupdate`](cl-location-manager/locationupdate-event.md) | 有新的位置 |
| [`locationerror`](cl-location-manager/locationerror-event.md) | 定位出错 |
| [`authorizationchange`](cl-location-manager/authorizationchange-event.md) | 授权状态或者精确与否变了；`manager` 建好之后也有一次 |

系统派发的是这三个。监听别的名字不会报错：它被当成自定义事件，只有自己用 `dispatchEvent()` 派发时才会触发。出错的事件叫 `locationerror`，在这里监听 `error` 收不到任何东西。

## 授权

App 不能直接读位置，要先得到用户的同意。同意与否记在**授权状态**里，从 [`authorizationStatus`](cl-location-manager/authorizationstatus.md) 读，读它不会弹出任何东西。只有 `'authorizedWhenInUse'` 和 `'authorizedAlways'` 两种状态能取位置。

[`requestWhenInUseAuthorization()`](cl-location-manager/requestwheninuseauthorization.md) 向用户申请。系统对每个 App 只问一次：状态是 `'notDetermined'` 时弹出提示框，之后再调用不弹，当场给出现在的状态。用户拒绝之后，App 没有办法再弹提示框，只有用户自己去系统的「设置」里改。

用户还可以决定给 App 的是精确位置还是大概位置，从 [`accuracyAuthorization`](cl-location-manager/accuracyauthorization.md) 读。App 不能要求用户给精确位置。

授权状态和精确与否都可能在 App 运行期间改变（用户切到「设置」里改了）。变了的时候派发 [`authorizationchange`](cl-location-manager/authorizationchange-event.md)。

## 取一次和连续更新

| 方式 | 方法 | 位置从哪来 | 什么时候停 |
| --- | --- | --- | --- |
| 取一次 | [`requestLocation()`](cl-location-manager/requestlocation.md) | Promise 兑现成一个 [`CLLocation`](cl-location.md) | 系统拿到一个位置之后自己停下 |
| 连续更新 | [`startUpdatingLocation()`](cl-location-manager/startupdatinglocation.md) | 每次有新位置派发 [`locationupdate`](cl-location-manager/locationupdate-event.md) | 调 [`stopUpdatingLocation()`](cl-location-manager/stopupdatinglocation.md) 才停，期间定位硬件一直开着 |

同一个 `manager` 上两种方式不能同时用：正在连续更新时调 `requestLocation()`，Promise 被拒绝，`name` 是 `'InvalidStateError'`；`requestLocation()` 还没结算时调 `startUpdatingLocation()` 或 `stopUpdatingLocation()`，那一次被取消，Promise 被拒绝，`name` 是 `'AbortError'`。

## `manager` 什么时候被回收

正在连续更新的 `manager`（`startUpdatingLocation()` 之后、`stopUpdatingLocation()` 之前），以及有 Promise 还没结算的 `manager`，由运行时保留，不会因为代码里没有变量指向它而停止工作。

其他时候 `manager` 和普通对象一样：没有变量指向它，它就会被回收，挂在它上面的监听器也跟着消失。只监听 `authorizationchange` 而不做别的时，要把 `manager` 存在一个长期存在的变量里。

## 示例

### 点按钮取一次位置

下面的代码从空白 App 开始，屏幕中间放一行字和一个按钮。点按钮时申请授权，然后取一次位置显示出来。

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/core-location" />

// 整个 App 用一个，存在顶层
const manager = new CLLocationManager();
// 误差 100 米以内就够用了：比默认的最高精度定位更快、更省电
manager.desiredAccuracy = 100;

application.addEventListener('sceneconnect', (e) => {
  // 建窗口和页面。每个 App 都要有这几行
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 1. 一行字和一个按钮
  const label = new UILabel();
  label.text = '还没有位置';
  label.numberOfLines = 0;
  label.textAlignment = 'center';
  const button = UIButton.buttonWithType('system');
  button.setTitle('我在哪', { forState: ['normal'] });
  for (const view of [label, button]) {
    view.translatesAutoresizingMaskIntoConstraints = false;
    page.view.addSubview(view);
  }
  NSLayoutConstraint.activateConstraints([
    label.centerXAnchor.constraintEqualToAnchor(page.view.centerXAnchor),
    label.centerYAnchor.constraintEqualToAnchor(page.view.centerYAnchor),
    button.centerXAnchor.constraintEqualToAnchor(page.view.centerXAnchor),
    button.topAnchor.constraintEqualToAnchor(label.bottomAnchor, { constant: 16 }),
  ]);

  button.addEventListener('click', async () => {
    // 2. 申请授权。问过了就当场得到现在的状态，不会重复弹
    const status = await manager.requestWhenInUseAuthorization();
    if (status !== 'authorizedWhenInUse' && status !== 'authorizedAlways') {
      label.text = '没有定位权限（' + status + '）';
      return;
    }

    // 3. 取一次位置
    label.text = '正在定位…';
    try {
      const here = await manager.requestLocation();
      label.text = here.coordinate.latitude.toFixed(5) + ', ' +
                   here.coordinate.longitude.toFixed(5) +
                   '\n误差 ' + here.horizontalAccuracy + ' m';
    } catch (err) {
      label.text = '定位失败：' + (err instanceof Error ? err.name : String(err));
    }
  });
});
```

**效果**（未在模拟器验证）

- 屏幕中间显示「还没有位置」，下面是蓝色的「我在哪」。
- 第一次点按钮，系统弹出提示框，里面有 `nacre.config.json` 里写的那句说明。
- 用户同意之后，文字变成「正在定位…」，几秒后变成两行：经纬度（小数点后五位），和「误差 … m」。
- 用户拒绝，文字变成「没有定位权限（denied）」。之后再点按钮不再弹提示框，文字不变。
- 取不到位置时，文字变成「定位失败：LocationUnknownError」。

### 持续接收位置

```js
const tracker = new CLLocationManager();
tracker.addEventListener('locationupdate', (e) => {
  const latest = e.locations[e.locations.length - 1];
  console.log(latest.coordinate.latitude, latest.coordinate.longitude);
});
tracker.startUpdatingLocation();
```

**效果**：已经授权、并且系统有位置时，每次有新位置输出一行纬度和经度，直到调 `tracker.stopUpdatingLocation()`。

更多写法见指南[取用户的位置](../guides/get-location.md)。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[[CLLocationManager alloc] init]` | `new CLLocationManager()` |
| `manager.authorizationStatus`（`kCLAuthorizationStatusAuthorizedWhenInUse`） | `manager.authorizationStatus`（`'authorizedWhenInUse'`） |
| `manager.accuracyAuthorization`（`CLAccuracyAuthorizationFullAccuracy`） | `manager.accuracyAuthorization`（`'fullAccuracy'`） |
| `[manager requestWhenInUseAuthorization]`，结果从委托来 | `manager.requestWhenInUseAuthorization()`，返回 Promise |
| `manager.desiredAccuracy = kCLLocationAccuracyBest` | `manager.desiredAccuracy = 'best'` |
| `manager.desiredAccuracy = kCLLocationAccuracyBestForNavigation` | `manager.desiredAccuracy = 'bestForNavigation'` |
| `manager.desiredAccuracy = kCLLocationAccuracyReduced` | `manager.desiredAccuracy = 'reduced'` |
| `manager.desiredAccuracy = kCLLocationAccuracyHundredMeters` | `manager.desiredAccuracy = 100` |
| `manager.distanceFilter = kCLDistanceFilterNone` | `manager.distanceFilter = 'none'` |
| `manager.location` | `manager.location` |
| `[manager startUpdatingLocation]` / `[manager stopUpdatingLocation]` | `manager.startUpdatingLocation()` / `manager.stopUpdatingLocation()` |
| `[manager requestLocation]`，结果从委托来 | `manager.requestLocation()`，返回 Promise |
| `manager.delegate = self` | 不需要，用 `addEventListener` |
| `locationManager:didUpdateLocations:` | `locationupdate` 事件，`e.locations` |
| `locationManager:didFailWithError:` | `locationerror` 事件，`e.error` |
| `locationManagerDidChangeAuthorization:` | `authorizationchange` 事件 |
| `error.code == kCLErrorDenied` | `error.name === 'NotAllowedError'` |

## 参见

- [取用户的位置](../guides/get-location.md)：申请授权、取一次、连续更新、处理出错的完整写法
- [`CLLocation`](cl-location.md)：位置的类型
- [`CLLocationError`](cl-location-error.md)：出错时的 `name` 各表示什么
- [配置 App](../guides/project-config.md)：`NSLocationWhenInUseUsageDescription` 写在哪，怎么按语言各写一句
- [核心和能力包](capabilities.md)：哪些能力要单独装，装了之后还要做什么
- [枚举](enums.md)：授权状态这类取值为什么是字符串，写错了会怎样
- [运行时怎么工作](how-it-works.md)：事件的回调为什么在下一轮执行
