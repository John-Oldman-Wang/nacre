---
type: reference
native: CLLocationManager
status: partial
---

# 定位：`CLLocationManager`

**`CLLocationManager`** 表示 App 向系统要位置的一个入口。通过它可以问用户同不同意 App 使用定位、取一次当前的位置、持续接收位置的更新。

位置是一个 **`CLLocation`**：经纬度（`coordinate`）、海拔、各个量的误差、速度、移动方向，以及这个位置是什么时候量的。经纬度是一个 **`CLLocationCoordinate2D`**，单位是度。

这一页只包括「使用 App 期间」的定位：App 在前台、用户正在用它的时候取位置。App 退到后台之后继续定位、进出某个区域时通知、指南针，都还不能做，见[还不能做的](#还不能做的)。

> **注意**：定位不在核心里，要先装 `@nacrejs/core-location` 这个包才有。没装的时候全局上没有 `CLLocationManager`，类型检查也会报找不到这个名字。怎么装见下面「[先装上](#先装上)」。

> **注意**：成员的形状、默认值、写错时的报错，以及已经授权时取一次位置、收到位置更新的事件，在模拟器（iPhone Air）的验收里验过。授权提示框、用户拒绝之后的行为、位置多久来一次，来自 Apple 的头文件和文档，逐条标了「未在模拟器验证」。

## 先装上

三步。

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

**效果**：装了这个包却没写这一句，生成 `ios/` 时报错并停下，报错里点名这个键。按语言各写一句的写法见[配置 App](../guides/project-config.md#写权限文案)。

**3. 让类型进来。** 在入口文件顶上加一行：

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/core-location" />
```

**效果**：编辑器里 `CLLocationManager` 有了补全和检查。少了这一行，`tsc` 报 `Cannot find name 'CLLocationManager'`。

## 用户同不同意

App 不能直接读位置，要先得到用户的同意。同意与否记在**授权状态**里，随时可以从 `manager.authorizationStatus` 读到，读它不会弹出任何东西。

| `authorizationStatus` | 含义 | 能取位置吗 |
| --- | --- | --- |
| `'notDetermined'` | 还没问过用户 | 不能 |
| `'authorizedWhenInUse'` | 用户同意 App 在使用期间定位 | 能 |
| `'denied'` | 用户拒绝了，或者整个系统的定位服务被关掉了 | 不能 |
| `'restricted'` | 设备上的限制不允许定位（家长控制、企业管理），用户自己改不了 | 不能 |
| `'authorizedAlways'` | 用户允许 App 任何时候定位。这个包不会申请它，用户在系统设置里手动改成「始终」时读得到 | 能 |

`requestWhenInUseAuthorization()` 向用户申请。它返回 Promise，兑现的值是申请之后的授权状态。

- **提示框只在状态是 `'notDetermined'` 时出现。** 用户选完，Promise 兑现成新的状态。提示框的样子和选项由系统决定。**未在模拟器验证。**
- **系统对每个 App 只问一次。** 状态已经不是 `'notDetermined'` 时，调用当场兑现成现在的状态，不弹提示框。所以每次要用位置之前都调一次是安全的。
- **用户拒绝之后，App 没有办法再弹提示框。** 只有用户自己去系统的「设置」里改。App 能做的是在界面上说明为什么需要位置。
- **用户可以选「允许一次」。** 这时状态是 `'authorizedWhenInUse'`，App 下次启动时状态回到 `'notDetermined'`。**未在模拟器验证。**
- **App 在后台时申请会被拒绝**，`name` 是 `'InvalidStateError'`：系统只在用户正在用 App 时才问。

用户还可以决定给 App 的是**精确位置**还是**大概位置**，从 `manager.accuracyAuthorization` 读：`'fullAccuracy'` 是精确位置；`'reducedAccuracy'` 是大概位置，误差在 5 公里左右，更新得更少，收到的位置可能是 20 分钟以前的（这三个数来自 Apple 的头文件，**未在模拟器验证**）。App 不能要求用户给精确位置。

授权状态和精确与否都可能在 App 运行期间改变（用户切到「设置」里改了）。变了的时候 `manager` 派发 `authorizationchange` 事件。

## 取一次，还是持续接收

| 想做的事 | 用哪个 | 位置从哪来 |
| --- | --- | --- |
| 知道用户现在在哪：找附近的门店、填收货地址 | `requestLocation()` | Promise 兑现成一个 `CLLocation` |
| 跟着用户移动：记录跑步路线、导航 | `startUpdatingLocation()`，用完调 `stopUpdatingLocation()` | 每次有新位置，`manager` 派发 `locationupdate` 事件 |

**只要一个位置时用 `requestLocation()`。** 系统拿到一个位置之后自己停下，不用记得关。连续更新会一直开着定位硬件，直到调 `stopUpdatingLocation()`，期间一直耗电。

两种方式不能同时用：正在连续更新时调 `requestLocation()`，Promise 被拒绝，`name` 是 `'InvalidStateError'`；`requestLocation()` 还没结算时调 `startUpdatingLocation()` 或 `stopUpdatingLocation()`，那一次被取消，Promise 被拒绝，`name` 是 `'AbortError'`。

取一次位置通常要几秒。系统定不出位置时 Promise 被拒绝，`name` 是 `'LocationUnknownError'`。**耗时和超时未在模拟器验证。**

## 要不要自己留着 `manager`

正在连续更新的 `manager`（`startUpdatingLocation()` 之后、`stopUpdatingLocation()` 之前），以及有 Promise 还没结算的 `manager`，由运行时保留，不会因为代码里没有变量指向它而停止工作。

其他时候 `manager` 和普通对象一样：没有变量指向它，它就会被回收，挂在它上面的监听器也跟着消失。只监听 `authorizationchange` 而不做别的时，要把 `manager` 存在一个长期存在的变量里。

**推荐整个 App 用一个 `manager`**，建好之后存在模块顶层的变量里。

## 模拟器上的位置

模拟器没有定位硬件，位置是设出来的：在模拟器的菜单 Features → Location 里选一个，或者用命令设。没有设位置时取不到位置。**未在模拟器验证。**

## 完整例子

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

## 常见用法

以下例子都假设已经有上面的 `manager`。

### 进页面时先看有没有权限

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

**效果**：控制台输出三行里的一行。读 `authorizationStatus` 不会弹提示框。

**推荐在用户做了需要位置的操作时再申请**（点了「附近的门店」），不要一启动就申请。用户这时知道 App 为什么要位置，更愿意同意；选「允许一次」的用户也正好用上这一次。

### 取一次位置

```js
manager.requestLocation().then(
  (here) => {
    console.log(here.coordinate.latitude, here.coordinate.longitude);
  },
  (err) => {
    console.log('没取到：' + err.name);
  });
```

**效果**：取到时输出纬度和经度两个数。没取到时输出 `没取到：` 加错误的名字。没有授权时输出 `没取到：NotAllowedError`，这一种不会弹提示框，也不等待。取到位置的那一条**未在模拟器验证**。

### 持续接收位置

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

**效果**（未在模拟器验证）：`startUpdatingLocation()` 之后，每次有新位置输出一行：纬度、经度、测量的时间。`stopUpdatingLocation()` 之后不再输出。

- `e.locations` 是这一次报上来的位置，至少一个，**最后一个是最新的**。系统有时把几个位置一起报。
- 开始之后收到的第一个位置可能是系统以前存下的，不是刚量的。在意新旧时看 `timestamp`，见[挑出可用的位置](#挑出可用的位置)。
- 没有授权时 `startUpdatingLocation()` 不抛异常，也收不到位置。系统从 `locationerror` 事件报告，见[处理出错](#处理出错)。
- 离开用到位置的页面时调 `stopUpdatingLocation()`。不调的话定位一直开着。

### 少报一些、省一点电

```js
manager.desiredAccuracy = 100;   // 误差 100 米以内就行
manager.distanceFilter = 50;     // 移动超过 50 米才报
```

**效果**：系统可以用更省电的方式定位，位置报得更少。写进去的值读回来不变。省电的程度**未在模拟器验证**。

`desiredAccuracy` 是希望的精度，不是保证。系统给的位置实际有多准，看每个位置的 `horizontalAccuracy`。

### 挑出可用的位置

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

### 监听授权的变化

```js
manager.addEventListener('authorizationchange', () => {
  console.log(manager.authorizationStatus, manager.accuracyAuthorization);
});
```

**效果**：授权状态或者精确与否改变时输出一行，比如 `denied fullAccuracy`。事件对象上没有这两个值，从 `manager` 上读。用户改了设置之后收到事件这一条**未在模拟器验证**。

`manager` 建好之后，系统会主动通知一次当前的状态。监听器要在 `new CLLocationManager()` 的同一段同步代码里加上才收得到这一次；晚一些才加的监听器只收到之后的变化。这一条来自 Mac 上的实测，**未在模拟器验证**。

### 处理出错

```js
manager.addEventListener('locationerror', (e) => {
  if (e.error.name === 'NotAllowedError') {
    manager.stopUpdatingLocation();
    console.log('没有权限，停止定位');
  } else if (e.error.name === 'LocationUnknownError') {
    console.log('暂时定不出位置，系统会接着试');
  } else {
    console.log('定位出错', e.error.name, e.error.code);
  }
});
```

**效果**（未在模拟器验证）：连续更新期间出错时输出三行里的一行。`'LocationUnknownError'` 是暂时的，不用停；`'NotAllowedError'` 表示没有权限，继续开着没有意义。

出错的事件叫 `locationerror`，不叫 `error`。监听 `error` 不报错，但收不到任何东西。

### 判断位置是不是模拟的

```js
manager.requestLocation().then((here) => {
  const source = here.sourceInformation;
  if (source !== null && source.isSimulatedBySoftware) {
    console.log('这个位置是软件模拟的');
  }
}, () => {});
```

**效果**：位置来自模拟（模拟器里设的位置、开发者工具改的位置）时输出一行。**未在模拟器验证。**

## 概念

### 位置里的 `null`

`CLLocation` 里有八个量在系统量不出来时是 `null`：`horizontalAccuracy`、`verticalAccuracy`、`altitude`、`ellipsoidalAltitude`、`speed`、`speedAccuracy`、`course`、`courseAccuracy`。

| 是 `null` 的量 | 说明什么 |
| --- | --- |
| `horizontalAccuracy` | 这个位置的经纬度无效，不要用 `coordinate` |
| `verticalAccuracy`、`altitude`、`ellipsoidalAltitude` | 海拔量不出来。这三个量总是一起是 `null`，或者一起有值 |
| `speed`、`speedAccuracy` | 速度量不出来 |
| `course`、`courseAccuracy` | 方向量不出来。设备没在移动时就是这样 |

用这些量之前先判断是不是 `null`。其余的量（`coordinate`、`timestamp`）总是有值。

```js
manager.addEventListener('locationupdate', (e) => {
  const latest = e.locations[e.locations.length - 1];
  if (latest.altitude === null) {
    console.log('没有海拔');
  } else {
    console.log('海拔 ' + latest.altitude.toFixed(1) + ' 米');
  }
});
```

**效果**：每次位置更新输出一行。系统量出了海拔时输出海拔（米，保留一位小数），量不出来时输出「没有海拔」。模拟器里用命令设的位置没有海拔，输出的是「没有海拔」。

### 位置是值

`CLLocation` 和 `CLLocationCoordinate2D` 是只读的值：字段不能改，也不能加字段，写了会抛 `TypeError`。

每次读 `manager.location` 得到一个新的 `CLLocation` 对象。比较两个位置是不是同一个，比较它们的字段，不要用 `===`。

`location.timestamp` 每次读得到一个新的 `Date`。修改读出来的 `Date` 不影响位置。

## 成员说明

### `CLLocationManager`

`new CLLocationManager()` 创建，没有参数。它不能被继承。

**属性**

| 属性 | 类型 | 可读 | 可写 | 默认值 | 含义 |
| --- | --- | --- | --- | --- | --- |
| `authorizationStatus` | `CLAuthorizationStatus` | 是 | 否 | 取决于用户 | 授权状态，五个取值见[用户同不同意](#用户同不同意)。变了的时候派发 `authorizationchange` |
| `accuracyAuthorization` | `CLAccuracyAuthorization` | 是 | 否 | 取决于用户 | `'fullAccuracy'`：用户给的是精确位置。`'reducedAccuracy'`：用户给的是大概位置，误差在 5 公里左右。变了的时候派发 `authorizationchange` |
| `desiredAccuracy` | 数（米）或 `'best'`、`'bestForNavigation'`、`'reduced'` | 是 | 是 | `'best'` | 希望的精度，见下表。只有 App 自己能改，没有变化通知 |
| `distanceFilter` | 数（米）或 `'none'` | 是 | 是 | `'none'` | 连续更新时，设备移动超过这个距离才报新位置。`'none'`：每次移动都报。只有 App 自己能改，没有变化通知 |
| `location` | `CLLocation` 或 `null` | 是 | 否 | `null` | 最近一次的位置。还没定过位、或者没有授权时是 `null`。新位置到来时派发 `locationupdate`（连续更新期间） |

`desiredAccuracy` 的取值：

| 取值 | 效果 |
| --- | --- |
| 一个不小于 0 的数 | 希望误差在这么多米以内。常用 `10`、`100`、`1000`、`3000`。数越大越省电、定位越快 |
| `'best'` | 设备能给的最高精度 |
| `'bestForNavigation'` | 比 `'best'` 更高，为导航准备，耗电最多 |
| `'reduced'` | 只要大概位置，和用户只给了大概位置时得到的一样 |

写 `desiredAccuracy` 和 `distanceFilter` 时，看起来像数的字符串按数处理（`'50'` 是 50）。

写了不认识的名字时不抛异常：属性保持原来的值，控制台输出一条警告。

| 写法 | 警告 |
| --- | --- |
| `desiredAccuracy` 写不认识的名字，`'fast'` | `[Nacre] desiredAccuracy has no value "fast"; expected one of: best / bestForNavigation / reduced, ignored` |
| `distanceFilter` 写不认识的名字，`'all'` | `[Nacre] distanceFilter has no value "all"; expected one of: none, ignored` |

写了负数或者转不成数的值时抛 `TypeError`，原来的值不变：

| 写法 | 报错信息 |
| --- | --- |
| 负数，`-1` | `desiredAccuracy must be a non-negative number of meters or one of: best / bestForNavigation / reduced` |
| 转不成有限的数，`NaN`、`undefined` | `desiredAccuracy must be a finite number, got NaN` |

**方法**

#### `requestWhenInUseAuthorization()`

申请「使用 App 期间」的定位。没有参数。返回 `Promise<CLAuthorizationStatus>`，兑现的值是申请之后的授权状态。

```js
manager.requestWhenInUseAuthorization().then((status) => {
  console.log(status);
});
```

**效果**：状态已经确定时当场输出现在的状态。状态是 `'notDetermined'` 时系统弹出提示框，用户选完之后输出新的状态（**未在模拟器验证**）。

Promise 被拒绝的情况：

| `name` | 什么时候 |
| --- | --- |
| `'InvalidStateError'` | Info.plist 里没有 `NSLocationWhenInUseUsageDescription`。用 Nacre 的命令行工具生成的工程不会出现这种情况，它在生成时就检查了 |
| `'InvalidStateError'` | App 在后台 |
| `'CLError'` | 系统报告提示框没有展示给用户。**未在模拟器验证** |

同时调用几次，提示框只出现一次，几个 Promise 一起兑现。

#### `requestLocation()`

取一次位置。没有参数。返回 `Promise<CLLocation>`。

```js
manager.requestLocation().then(
  (here) => { console.log(here.horizontalAccuracy); },
  (err) => { console.log(err.name); });
```

**效果**：取到时输出这个位置的误差（米），没取到时输出错误的名字。

Promise 被拒绝的情况：

| `name` | 什么时候 |
| --- | --- |
| `'NotAllowedError'` | 授权状态不是 `'authorizedWhenInUse'` 或 `'authorizedAlways'`。当场拒绝，不弹提示框 |
| `'InvalidStateError'` | 这个 `manager` 正在连续更新 |
| `'AbortError'` | 结算之前调了 `startUpdatingLocation()` 或 `stopUpdatingLocation()` |
| `'LocationUnknownError'` | 系统定不出位置。**未在模拟器验证** |
| `'NetworkError'`、`'CLError'` | 系统报告的其他错误，`code` 是系统的错误码。**未在模拟器验证** |

上一次还没结算时再调一次，系统只定位一次，两个 Promise 得到同一个结果。

#### `startUpdatingLocation()`

开始连续更新。没有参数，没有返回值。位置从 `locationupdate` 事件来。已经在更新时再调一次没有额外的效果。

#### `stopUpdatingLocation()`

停止连续更新，并取消还没结算的 `requestLocation()`。没有参数，没有返回值。没在更新时调用不报错。

两个方法的例子见[持续接收位置](#持续接收位置)。

**事件**

| 事件名 | 什么时候派发 | 事件对象上多出的字段 |
| --- | --- | --- |
| `locationupdate` | 有新的位置：连续更新期间，以及 `requestLocation()` 取到位置时 | `locations`：`CLLocation` 的数组，至少一个，最后一个最新 |
| `locationerror` | 定位出错 | `error`：[`CLLocationError`](#cllocationerror) |
| `authorizationchange` | 授权状态或者精确与否变了；`manager` 建好之后也有一次 | 没有。从 `manager` 上读 |

三个事件都不能取消。回调在事件发生之后的下一轮执行。

系统派发的是这三个。监听别的名字不会报错：它被当成自定义事件，只有自己用 `dispatchEvent()` 派发时才会触发。出错的事件叫 `locationerror`，在这里监听 `error` 收不到任何东西。

### `CLLocation`

不能用 `new` 创建，`new CLLocation()` 抛 `TypeError`，信息以 `Illegal constructor` 开头。位置从 `manager.location`、`requestLocation()` 和 `locationupdate` 事件得到。

所有字段可读、不可写。

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| `coordinate` | `CLLocationCoordinate2D` | 经纬度 |
| `altitude` | 数（米）或 `null` | 海拔，相对平均海平面。高于海平面是正数，低于是负数 |
| `ellipsoidalAltitude` | 数（米）或 `null` | 海拔，相对 WGS 84 椭球面（卫星定位直接量出的那个高度） |
| `horizontalAccuracy` | 数（米）或 `null` | 经纬度的误差半径：真实位置在以 `coordinate` 为圆心、这个数为半径的圆里。数越小越准 |
| `verticalAccuracy` | 数（米）或 `null` | 海拔的误差 |
| `speed` | 数（米每秒）或 `null` | 移动的速度 |
| `speedAccuracy` | 数（米每秒）或 `null` | 速度的误差 |
| `course` | 数（度）或 `null` | 移动的方向。正北是 0，顺时针增加，正东是 90，范围 0 到 359.9 |
| `courseAccuracy` | 数（度）或 `null` | 方向的误差 |
| `timestamp` | `Date` | 这个位置是什么时候量的 |
| `sourceInformation` | 对象或 `null` | 这个位置的来源。`isSimulatedBySoftware`（布尔）：`true` 是软件模拟的，`false` 是真实量到的。`isProducedByAccessory`（布尔）：`true` 来自外接的配件（车机、外接定位器），`false` 来自设备自己 |

哪些量会是 `null`、是 `null` 时说明什么，见[位置里的 `null`](#位置里的-null)。

### `CLLocationCoordinate2D`

`new CLLocationCoordinate2D(latitude, longitude)` 创建。两个参数都是数，单位是度；转不成有限的数时抛 `TypeError`。不检查范围。

| 字段 | 类型 | 可读 | 可写 | 含义 |
| --- | --- | --- | --- | --- |
| `latitude` | 数（度） | 是 | 否 | 纬度。北纬是正数，南纬是负数，范围 -90 到 90 |
| `longitude` | 数（度） | 是 | 否 | 经度。东经是正数，西经是负数，范围 -180 到 180 |

```js
const c = new CLLocationCoordinate2D(39.9042, 116.4074);
console.log(JSON.stringify(c));
```

**效果**：输出 `{"latitude":39.9042,"longitude":116.4074}`。

### `CLLocationError`

定位出错时的 `Error` 对象：两个 Promise 被拒绝时得到它，`locationerror` 事件的 `error` 字段也是它。

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| `name` | 字符串 | 错误的分类，见下表 |
| `message` | 字符串 | 一句说明。系统给的错误是系统的文字，跟随系统语言 |
| `code` | 数 | 系统的错误码。`'AbortError'` 和 `'InvalidStateError'` 不是系统给的，`code` 是 0 |
| `domain` | 字符串 | `'kCLErrorDomain'`。`'AbortError'` 和 `'InvalidStateError'` 是空字符串 |

| `name` | 含义 | 谁给出的 |
| --- | --- | --- |
| `'NotAllowedError'` | 没有授权 | 系统，或者运行时在调用系统之前判断出来。两种情况 `code` 都是 1，`domain` 都是 `'kCLErrorDomain'` |
| `'LocationUnknownError'` | 这一刻定不出位置 | 系统（`code` 是 0） |
| `'NetworkError'` | 网络问题 | 系统（`code` 是 2） |
| `'CLError'` | 系统报告的其他错误，看 `code` | 系统 |
| `'AbortError'` | `requestLocation()` 被取消 | 运行时 |
| `'InvalidStateError'` | 现在不能做这件事 | 运行时 |

`name` 是 `'LocationUnknownError'` 和 `'AbortError'` 时 `code` 都是 0，用 `name` 区分，不要只看 `code`。

## 与 iOS 原生写法的对照

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
| `location.horizontalAccuracy < 0`（无效） | `location.horizontalAccuracy === null` |
| `location.speed < 0`、`location.course < 0`（无效） | `location.speed === null`、`location.course === null` |
| `location.timestamp`（`NSDate`） | `location.timestamp`（`Date`） |
| `CLLocationCoordinate2DMake(lat, lon)` | `new CLLocationCoordinate2D(lat, lon)` |
| `error.code == kCLErrorDenied` | `error.name === 'NotAllowedError'` |

## 还不能做的

下面这些都没有。表里的方法，调用会抛「不是函数」的 `TypeError`；属性，读到的是 `undefined`，写入不报错也不起作用；类，读它的名字会抛 `ReferenceError`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 申请「始终」定位 | `requestAlwaysAuthorization` |
| App 退到后台之后继续定位 | `allowsBackgroundLocationUpdates`、`pausesLocationUpdatesAutomatically`、`showsBackgroundLocationIndicator`、`activityType`，以及后台模式的工程配置 |
| 位置有大的变化时才唤醒 App | `startMonitoringSignificantLocationChanges` |
| 进出某个区域时得到通知（地理围栏） | `startMonitoringForRegion:`、`CLCircularRegion`、`CLMonitor` |
| 指南针：设备朝向哪个方向 | `startUpdatingHeading`、`heading`、`CLHeading` |
| 用户只给了大概位置时，临时申请一次精确位置 | `requestTemporaryFullAccuracyAuthorizationWithPurposeKey:` |
| 查整个系统的定位服务开没开 | `+locationServicesEnabled`。关着的时候 `authorizationStatus` 是 `'denied'` |
| 经纬度和地址互相转换 | `CLGeocoder`、`CLPlacemark` |
| 算两个位置之间的距离 | `distanceFromLocation:` |
| 位置在建筑的第几层 | `CLLocation.floor` |
| 自己造一个 `CLLocation` | `initWithLatitude:longitude:` 一组 |

## 参见

- [配置 App](../guides/project-config.md)：`NSLocationWhenInUseUsageDescription` 写在哪，怎么按语言各写一句。
- [核心和能力包](capabilities.md)：哪些能力要单独装，装了之后还要做什么。
- [`UIButton`](ui-button.md)：完整例子里用按钮触发申请。
- [枚举](enums.md)：授权状态这类取值为什么是字符串，写错了会怎样。
- [运行时怎么工作](how-it-works.md)：事件的回调为什么在下一轮执行。
- [实现原理：定位](../internals/core-location.md)：位置为什么是值、Promise 怎么保证结算、谁拿着 `manager`。
