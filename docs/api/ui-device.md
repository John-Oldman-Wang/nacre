---
type: reference
native: UIDevice
status: partial
---

# `UIDevice`

`UIDevice` 给出当前这台设备的信息：是什么设备、跑的是哪个版本的系统。

它相当于浏览器里的 `navigator`（`navigator.userAgent`、`navigator.platform` 那一部分）。有两点不同：

- **信息是分开的属性，不是一个要自己解析的字符串。** 系统版本直接读 `systemVersion`。
- **不能创建。** 整个 App 只有一个，从 `UIDevice.currentDevice` 取。

现在只有不会变化的几项信息，全部只读。

## 完整例子

下面的代码输出设备和系统的信息。它不需要界面，直接写在 `main.js` 顶层就能运行。

```js
const device = UIDevice.currentDevice;

console.log(device.systemName + ' ' + device.systemVersion);
console.log(device.model);
```

**效果**：在 iPhone 上，控制台输出两行，形如：

```
iOS 26.1
iPhone
```

## 常见用法

以下例子都沿用上面的 `device`。

### 只在某个系统版本以上才做某件事

`systemVersion` 是字符串。比较之前先取出主版本号转成数。

```js
const major = Number(device.systemVersion.split('.')[0]);

if (major >= 27) {
  console.log('可以用 iOS 27 的能力');
} else {
  console.log('走兼容的写法');
}
```

**效果**：在 iOS 27 以上输出 `可以用 iOS 27 的能力`，否则输出 `走兼容的写法`。

> **注意**：不要直接比较版本字符串。按字符串比较时 `'9.0' > '26.0'` 是 `true`，因为比的是第一个字符。

要同时比较次版本号，把每一段都转成数再逐段比：

```js
/**
 * @param {string} a
 * @param {string} b
 * @returns {number} a 比 b 新返回正数，旧返回负数，相同返回 0
 */
function compareVersion(a, b) {
  const x = a.split('.').map(Number);
  const y = b.split('.').map(Number);
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    const diff = (x[i] || 0) - (y[i] || 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

console.log(compareVersion(device.systemVersion, '26.2') >= 0);
```

**效果**：系统是 iOS 26.2 或更新时输出 `true`，否则输出 `false`。**这个例子未在模拟器验证。**

### 给这台设备一个稳定的标识

`identifierForVendor` 是一个 UUID 字符串。同一个开发者的 App 在同一台设备上读到的值相同，换一台设备就不同。

```js
const id = device.identifierForVendor;
if (id !== null) {
  console.log(id);
}
```

**效果**：输出一个 UUID，形如 `6F9619FF-8B86-D011-B42D-00C04FC964FF`，字母是大写。同一次运行里读多次，值相同。

有两点要知道：

- 这个开发者的 App 从设备上全部卸载之后再安装，值会变。它不是永久的设备编号。
- 设备重启后、第一次解锁之前读到的是 `null`，所以要先判断。**这一条未在模拟器验证。**

要一个卸载重装也不变的标识，自己生成一个（[`crypto.randomUUID()`](crypto.md)）存进 [Keychain](keychain.md)。

## 成员说明

### 继承关系

```
EventTarget
  └─ NSObject
       └─ UIDevice
```

### 取得

```js
const device = UIDevice.currentDevice;
```

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `UIDevice.currentDevice` | `UIDevice` | 类上的只读属性。每次读得到同一个对象 |

- `new UIDevice()` 抛 `TypeError: Illegal constructor: UIDevice is created by the runtime, not by new`

### 属性

全部只读。这些值在 App 运行期间不变，所以没有变化通知。

| 属性 | 类型 | 可读 | 可写 | 含义 |
| --- | --- | --- | --- | --- |
| `systemName` | 字符串 | 是 | 否 | 操作系统的名字。iPhone 上是 `'iOS'` |
| `systemVersion` | 字符串 | 是 | 否 | 操作系统的版本，形如 `'26.1'` 或 `'26.1.2'`。比较前先转成数，见[上面的例子](#只在某个系统版本以上才做某件事) |
| `model` | 字符串 | 是 | 否 | 设备的种类。iPhone 上是 `'iPhone'`。它不是具体的型号，分不出是 iPhone 14 还是 iPhone Air |
| `localizedModel` | 字符串 | 是 | 否 | `model` 按系统语言翻译后的写法 |
| `name` | 字符串 | 是 | 否 | 设备的名字。读不到用户在「设置」里给设备起的名字。真机上它和 `model` 相同，是 `'iPhone'`；模拟器上读到的是模拟器的名字，比如 `'iPhone Air'`（都是实测） |
| `userInterfaceIdiom` | 字符串 | 是 | 否 | 界面的类型，取值见下表 |
| `identifierForVendor` | 字符串或 `null` | 是 | 否 | 这个开发者的 App 在这台设备上共用的 UUID。见[上面的例子](#给这台设备一个稳定的标识) |

写这些属性抛 `TypeError`。

`userInterfaceIdiom` 的取值：

| 取值 | 含义 |
| --- | --- |
| `'phone'` | iPhone 的界面。Nacre 现在只支持 iPhone，所以读到的总是这个值 |
| `'pad'` | iPad 的界面 |
| `'tv'` | Apple TV 的界面 |
| `'carPlay'` | 车载界面 |
| `'mac'` | Mac 的界面 |
| `'vision'` | Apple Vision 的界面 |
| `'unspecified'` | 未指定 |

## 与 iOS 原生写法的对照

| ObjC | JS |
| --- | --- |
| `UIDevice.currentDevice` | `UIDevice.currentDevice` |
| `device.systemVersion` | `device.systemVersion` |
| `device.userInterfaceIdiom == UIUserInterfaceIdiomPhone` | `device.userInterfaceIdiom === 'phone'` |
| `device.identifierForVendor.UUIDString` | `device.identifierForVendor` |
| `if (@available(iOS 27.0, *))` | 取 `systemVersion` 的主版本号比较 |

## 还不能做的

| 想做的事 | 对应的原生能力 | 状态 |
| --- | --- | --- |
| 读电量和充电状态，并在变化时收到通知 | `batteryLevel`、`batteryState`、`isBatteryMonitoringEnabled` | 未实现 |
| 读设备的物理朝向（竖着、横着、面朝上），并在变化时收到通知 | `orientation`、`beginGeneratingDeviceOrientationNotifications` | 未实现 |
| 知道设备是否贴近了脸 | `proximityState`、`isProximityMonitoringEnabled` | 未实现 |
| 读具体的型号（iPhone 14、iPhone Air） | `uname()` 的 `machine` 字段 | 未实现 |
| 读用户给设备起的名字 | 需要 Apple 单独批准的权限 | 未实现 |

## 参见

- [`application`](application.md)：App 自己的信息，版本号、包名
- [`crypto`](crypto.md)：`randomUUID()`，自己生成标识时用
- [Keychain](keychain.md)：保存卸载重装也不丢的标识
