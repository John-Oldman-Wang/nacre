---
type: reference
native: UIDevice
status: partial
---

# `UIDevice`

**`UIDevice`** 表示运行 App 的这台设备。从它读到设备的种类、操作系统的名字和版本，以及一个用来区分设备的标识。

整个 App 只有一个 `UIDevice` 对象，由运行时提供，从 `UIDevice.currentDevice` 取。它不能用 `new` 创建，每次读 `UIDevice.currentDevice` 得到的是同一个对象。

现在提供的七项信息全部只读，在 App 运行期间不会变化，所以没有变化通知，读一次保存下来即可。电量、设备的物理朝向这类会变化的状态还读不到，见[还不能做的](#还不能做的)。

## 读到的是什么

各项信息的含义和容易误解的地方：

- **`systemVersion` 是字符串**，形如 `'26.1'` 或 `'26.1.2'`，不是数。直接比较两个版本字符串会得到错误的结果：`'9.0' > '26.0'` 是 `true`，因为字符串比较从第一个字符开始。比较之前要先把每一段转成数，写法见[只在某个系统版本以上才做某件事](#只在某个系统版本以上才做某件事)。
- **`model` 是设备的种类，不是具体的型号。** iPhone 上它是 `'iPhone'`，分不出 iPhone 14 和 iPhone Air。具体的型号现在读不到。
- **`name` 读不到用户给设备起的名字。** 真机（iPhone 14）上实测它是 `'iPhone'`，和 `model` 相同。模拟器上实测它是模拟器的名字，比如 `'iPhone Air'`。所以不要拿 `name` 显示「某某的 iPhone」，也不要用它判断机型。
- **`identifierForVendor` 不是永久的设备编号。** 它是一个 UUID 字符串，同一个开发者的所有 App 在同一台设备上读到的值相同。这个开发者的 App 从设备上全部卸载后再安装，值会变。详见[给这台设备一个标识](#给这台设备一个标识)。

## 推荐的做法

**判断系统版本只用来做降级，不用来猜能力。** 某个能力只在新系统上才有时，读 `systemVersion` 的主版本号，低版本上走另一条路径。主版本号一行就能取到，比较时用数，不用字符串。

**版本号读一次，保存成数。** 这些值在运行期间不变，在脚本开头算好主版本号，后面直接用变量，不需要每次重新读和重新拆。

**要标识用户，不要用设备标识。** `identifierForVendor` 在卸载重装后会变，换手机后也不同。登录状态、用户身份应该来自服务器发的令牌。`identifierForVendor` 适合做的是统计「有多少台设备」、给未登录的设备一个临时编号这类允许偶尔变化的用途。

## 完整例子

下面的代码输出设备和系统的信息。它不需要界面，写在 `main.js` 顶层。

```js
const device = UIDevice.currentDevice;

console.log(device.systemName + ' ' + device.systemVersion);
console.log(device.model);
console.log(device.userInterfaceIdiom);
```

**结果**：在 iPhone 上，控制台输出三行，形如：

```
iOS 26.1
iPhone
phone
```

验收用例是在 `sceneconnect` 的回调里读这些属性的。写在脚本顶层读**未在模拟器验证**。

## 常见用法

以下例子都沿用上面的 `device`。

### 只在某个系统版本以上才做某件事

`systemVersion` 的第一段是主版本号。取出来转成数再比较：

```js
const major = Number(device.systemVersion.split('.')[0]);

if (major >= 27) {
  console.log('可以用 iOS 27 的能力');
} else {
  console.log('走兼容的写法');
}
```

**结果**：在 iOS 27 以上输出 `可以用 iOS 27 的能力`，否则输出 `走兼容的写法`。

主版本号不会小于 26：运行时支持的最低系统是 iOS 26，更低的系统上 App 装不上。

> **注意**：不要直接比较版本字符串。按字符串比较时 `'9.0' > '26.0'` 是 `true`。

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

**结果**：系统是 iOS 26.2 或更新时输出 `true`，否则输出 `false`。**这个例子未在模拟器验证。**

### 给这台设备一个标识

```js
const id = device.identifierForVendor;
if (id !== null) {
  console.log(id);
}
```

**结果**：输出一个 UUID，形如 `6F9619FF-8B86-D011-B42D-00C04FC964FF`，字母是大写。同一次运行里读多次，值相同。

这个值什么时候相同、什么时候变：

| 情况 | 值 |
| --- | --- |
| 同一次运行里读多次 | 相同（已验证） |
| App 重新启动、系统重启 | 相同。**未在模拟器验证**，来自 iOS 的定义 |
| 同一个开发者的另一个 App，在同一台设备上 | 相同。**未在模拟器验证** |
| 这个开发者的 App 全部卸载后再安装 | 变了。**未在模拟器验证** |
| 换一台设备 | 不同 |

读到的可能是 `null`：设备重启后、用户第一次解锁之前，系统还给不出这个值。所以用之前要先判断。这种情况**未在模拟器验证**，来自 iOS 的定义。

要一个不依赖系统规则的标识，自己生成一个（[`crypto.randomUUID()`](crypto.md)）保存起来。保存在[本地存储](storage.md)里的值在 App 被卸载时一起删除（**未在模拟器验证**，来自 iOS 的定义）。保存在 [Keychain](keychain.md) 里的值在卸载后是否保留，Apple 没有承诺，不能依赖。需要跨卸载、跨设备都不变的标识时，只能由服务器按账号发放。

## 成员说明

### 继承关系

```
EventTarget
  └─ NSObject
       └─ UIDevice
```

### 取得

```js
const current = UIDevice.currentDevice;
console.log(current === UIDevice.currentDevice);
```

**结果**：输出 `true`。

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
| `model` | 字符串 | 是 | 否 | 设备的种类。iPhone 上是 `'iPhone'`，模拟器上也是。它不是具体的型号 |
| `localizedModel` | 字符串 | 是 | 否 | `model` 按系统语言翻译后的写法。系统语言是英文时实测是 `'iPhone'`；其他语言下的值**未在模拟器验证** |
| `name` | 字符串 | 是 | 否 | 设备的名字。读不到用户在「设置」里给设备起的名字。真机上实测是 `'iPhone'`；模拟器上实测是模拟器的名字，比如 `'iPhone Air'` |
| `userInterfaceIdiom` | 字符串 | 是 | 否 | 界面的类型，取值见下表 |
| `identifierForVendor` | 字符串或 `null` | 是 | 否 | 这个开发者的 App 在这台设备上共用的 UUID，字母大写。见[上面的例子](#给这台设备一个标识) |

给这些属性赋值抛 `TypeError`，原值不变。

`userInterfaceIdiom` 的取值：

| 取值 | 含义 |
| --- | --- |
| `'phone'` | iPhone 的界面。运行时现在只支持 iPhone，所以读到的总是这个值 |
| `'pad'` | iPad 的界面 |
| `'tv'` | Apple TV 的界面 |
| `'carPlay'` | 车载界面 |
| `'mac'` | Mac 的界面 |
| `'vision'` | Apple Vision 的界面 |
| `'unspecified'` | 未指定 |

`'phone'` 以外的取值**未在模拟器验证**。

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
- [本地存储](storage.md)、[Keychain](keychain.md)：保存自己生成的标识
- [`UITraitCollection`](ui-trait-collection.md)：屏幕是几倍的、深色还是浅色，这些不在 `UIDevice` 上
