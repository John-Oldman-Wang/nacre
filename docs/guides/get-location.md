# 取用户的位置

这一篇讲怎么用 [`CLLocationManager`](../api/cl-location-manager.md) 拿到用户的位置：申请授权、取一次位置、跟着用户移动持续接收、挑出可用的位置、处理出错。位置的类型是 [`CLLocation`](../api/cl-location.md)，出错时得到 [`CLLocationError`](../api/cl-location-error.md)。

开始之前要先装 `@nacrejs/core-location`，并在 `nacre.config.json` 里写 `NSLocationWhenInUseUsageDescription`，见 [`CLLocationManager`](../api/cl-location-manager.md#先装上)。

## 推荐的做法

- **整个 App 用一个 `manager`**，建好之后存在模块顶层的变量里。只挂了监听器的 `manager` 在没有变量指向它时会被回收，监听器跟着消失。
- **在用户做了需要位置的操作时再申请授权**（点了「附近的门店」），不要一启动就申请。用户这时知道 App 为什么要位置，更愿意同意；选「允许一次」的用户也正好用上这一次。
- **只要一个位置时用 [`requestLocation()`](../api/cl-location-manager/requestlocation.md)。** 系统拿到一个位置之后自己停下，不用记得关。[`startUpdatingLocation()`](../api/cl-location-manager/startupdatinglocation.md) 会一直开着定位硬件，直到调 `stopUpdatingLocation()`，期间一直耗电。
- **精度够用就行。** [`desiredAccuracy`](../api/cl-location-manager/desiredaccuracy.md) 默认是 `'best'`。找附近门店这类用途写 `100`（米），定位更快、更省电。

| 想做的事 | 用哪个 | 位置从哪来 |
| --- | --- | --- |
| 知道用户现在在哪：找附近的门店、填收货地址 | `requestLocation()` | Promise 兑现成一个 `CLLocation` |
| 跟着用户移动：记录跑步路线、导航 | `startUpdatingLocation()`，用完调 `stopUpdatingLocation()` | 每次有新位置，`manager` 派发 `locationupdate` 事件 |

## 第一个例子

从空白 App 开始，屏幕中间放一行字和一个按钮。点按钮时申请授权，然后取一次位置显示出来。

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

下面的例子都沿用这里的 `manager`。

## 什么时候申请授权

[`requestWhenInUseAuthorization()`](../api/cl-location-manager/requestwheninuseauthorization.md) 只在授权状态是 `'notDetermined'` 时弹提示框，之后再调用当场给出现在的状态。所以每次要用位置之前都调一次是安全的。

- **用户拒绝之后，App 没有办法再弹提示框。** 只有用户自己去系统的「设置」里改。App 能做的是在界面上说明为什么需要位置。
- **用户可以选「允许一次」。** 这时状态是 `'authorizedWhenInUse'`，App 下次启动时回到 `'notDetermined'`。**未在模拟器验证。**
- **App 在后台时申请会被拒绝**，`name` 是 `'InvalidStateError'`：系统只在用户正在用 App 时才问。

## 进页面时先看有没有权限

```js
const status = manager.authorizationStatus;
if (status === 'notDetermined') {
  console.log('还没问过，等用户点了相关的按钮再申请');
} else if (status === 'denied' || status === 'restricted') {
  console.log('不能定位，在界面上说明原因');
} else {
  console.log('可以定位');
}
```

**效果**：控制台输出三行里的一行。读 [`authorizationStatus`](../api/cl-location-manager/authorizationstatus.md) 不会弹提示框。

## 取一次位置

```js
manager.requestLocation().then(
  (here) => {
    console.log(here.coordinate.latitude, here.coordinate.longitude);
  },
  (err) => {
    console.log('没取到：' + err.name);
  });
```

**效果**：取到时输出纬度和经度两个数。没取到时输出 `没取到：` 加错误的名字。没有授权时输出 `没取到：NotAllowedError`，这一种不会弹提示框，也不等待。

取一次位置通常要几秒。系统定不出位置时 Promise 被拒绝，`name` 是 `'LocationUnknownError'`。**耗时和超时未在模拟器验证。**

## 持续接收位置

```js
manager.addEventListener('locationupdate', (e) => {
  const latest = e.locations[e.locations.length - 1];
  console.log(latest.coordinate.latitude, latest.coordinate.longitude,
              latest.timestamp.toISOString());
});
manager.startUpdatingLocation();

// 用完之后
manager.stopUpdatingLocation();
```

**效果**：`startUpdatingLocation()` 之后，每次有新位置输出一行：纬度、经度、测量的时间。`stopUpdatingLocation()` 之后不再输出（**未在模拟器验证**）。

- `e.locations` 是这一次报上来的位置，至少一个，**最后一个是最新的**。系统有时把几个位置一起报。
- 开始之后收到的第一个位置可能是系统以前存下的，不是刚量的。在意新旧时看 `timestamp`，见[挑出可用的位置](#挑出可用的位置)。
- 没有授权时 `startUpdatingLocation()` 不抛异常，也收不到位置。系统从 `locationerror` 事件报告，见[处理出错](#处理出错)。
- 离开用到位置的页面时调 `stopUpdatingLocation()`。不调的话定位一直开着。
- 正在连续更新时调 `requestLocation()`，Promise 被拒绝，`name` 是 `'InvalidStateError'`。要最新的位置，读事件里的 `e.locations`。

## 少报一些、省一点电

```js
manager.desiredAccuracy = 100;   // 误差 100 米以内就行
manager.distanceFilter = 50;     // 移动超过 50 米才报
```

**效果**：系统可以用更省电的方式定位，位置报得更少。写进去的值读回来不变。省电的程度**未在模拟器验证**。

`desiredAccuracy` 是希望的精度，不是保证。系统给的位置实际有多准，看每个位置的 [`horizontalAccuracy`](../api/cl-location/horizontalaccuracy.md)。

## 挑出可用的位置

```js
/** @param {CLLocation} location */
function usable(location) {
  // 经纬度无效
  if (location.horizontalAccuracy === null) return false;
  // 误差超过 200 米
  if (location.horizontalAccuracy > 200) return false;
  // 是 30 秒以前量的
  if (Date.now() - location.timestamp.getTime() > 30000) return false;
  return true;
}

manager.addEventListener('locationupdate', (e) => {
  const good = e.locations.filter(usable);
  if (good.length > 0) console.log('可用的位置', good.length, '个');
});
```

**效果**：只有误差在 200 米以内、30 秒以内量的位置才计数。**未在模拟器验证。**

位置里有八个量在系统量不出来时是 `null`，用之前先判断，见[位置里的 `null`](../api/cl-location.md#位置里的-null)。

## 监听授权的变化

```js
manager.addEventListener('authorizationchange', () => {
  console.log(manager.authorizationStatus, manager.accuracyAuthorization);
});
```

**效果**：授权状态或者精确与否改变时输出一行，比如 `denied fullAccuracy`。事件对象上没有这两个值，从 `manager` 上读。用户改了设置之后收到事件这一条**未在模拟器验证**。

`manager` 建好之后，系统会主动通知一次当前的状态。监听器要在 `new CLLocationManager()` 的同一段同步代码里加上才收得到这一次；像这里晚一些才加的监听器只收到之后的变化。

用户只给了大概位置时（[`accuracyAuthorization`](../api/cl-location-manager/accuracyauthorization.md) 是 `'reducedAccuracy'`），误差在 5 公里左右。App 不能要求用户给精确位置，界面上按大概位置来显示。

## 处理出错

```js
manager.addEventListener('locationerror', (e) => {
  if (e.error.name === 'NotAllowedError') {
    manager.stopUpdatingLocation();
    console.log('没有权限，停止定位');
  } else if (e.error.name === 'LocationUnknownError') {
    console.log('暂时定不出位置，系统会接着试');
  } else {
    const system = e.error instanceof NSError ? e.error : e.error.cause;
    console.log('定位出错', e.error.name, system?.domain, system?.code);
  }
});
```

**效果**（未在模拟器验证）：连续更新期间出错时输出三行里的一行。`'LocationUnknownError'` 是暂时的，不用停；`'NotAllowedError'` 表示没有权限，继续开着没有意义。

出错的事件叫 `locationerror`，不叫 `error`。监听 `error` 不报错，但收不到任何东西。每种 `name` 的含义见 [`CLLocationError`](../api/cl-location-error/name.md)。

## 判断位置是不是模拟的

```js
manager.requestLocation().then((here) => {
  const source = here.sourceInformation;
  if (source !== null && source.isSimulatedBySoftware) {
    console.log('这个位置是软件模拟的');
  }
}, () => {});
```

**效果**：位置来自模拟（模拟器里设的位置、开发者工具改的位置）时输出一行。**未在模拟器验证。**

## 在模拟器上试

模拟器没有定位硬件，位置是设出来的：在模拟器的菜单 Features → Location 里选一个，或者用命令设。没有设位置时取不到位置。**未在模拟器验证。**

模拟器里用命令设的位置没有海拔，`altitude` 读到 `null`。

## 参见

- [`CLLocationManager`](../api/cl-location-manager.md)：全部属性、方法和事件
- [`CLLocation`](../api/cl-location.md)：位置里每个量的含义
- [`CLLocationError`](../api/cl-location-error.md)：出错时的分类
- [配置 App](project-config.md#写权限文案)：权限文案怎么写、怎么按语言写
