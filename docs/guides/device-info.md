# 读设备和系统的信息

这一篇讲怎么用 [`UIDevice`](../api/ui-device.md) 判断系统版本、给这台设备一个标识。每个属性的细节在 [`UIDevice`](../api/ui-device.md) 的参考页。

## 推荐的做法

- **判断系统版本只用来做降级，不用来猜能力。** 某个能力只在新系统上才有时，读 [`systemVersion`](../api/ui-device/systemversion.md) 的主版本号，低版本上走另一条路径。比较时用数，不用字符串。
- **版本号读一次，保存成数。** 这些值在运行期间不变，在脚本开头算好主版本号，后面直接用变量，不需要每次重新读和重新拆。
- **要标识用户，不要用设备标识。** [`identifierForVendor`](../api/ui-device/identifierforvendor.md) 在卸载重装后会变，换手机后也不同。登录状态、用户身份应该来自服务器发的令牌。`identifierForVendor` 适合做的是统计「有多少台设备」、给未登录的设备一个临时编号这类允许偶尔变化的用途。

## 第一个例子

下面的代码输出设备和系统的信息。它不需要界面，写在 `main.js` 顶层。

```js
const device = UIDevice.currentDevice;

console.log(device.systemName + ' ' + device.systemVersion);
console.log(device.model);
console.log(device.userInterfaceIdiom);
```

**结果**：在 iPhone 上，控制台输出三行，形如 `iOS 26.1`、`iPhone`、`phone`。

验收用例是在 `sceneconnect` 的回调里读这些属性的。写在脚本顶层读**未在模拟器验证**。

下面各节沿用这里的 `device`。

## 只在某个系统版本以上才做某件事

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

## 给这台设备一个标识

```js
const id = device.identifierForVendor;
if (id !== null) {
  console.log(id);
}
```

**结果**：输出一个 UUID，形如 `6F9619FF-8B86-D011-B42D-00C04FC964FF`，字母是大写。同一次运行里读多次，值相同。

读到的可能是 `null`：设备重启后、用户第一次解锁之前，系统还给不出这个值，所以用之前要先判断。这个值在什么情况下会变，见 [`identifierForVendor`](../api/ui-device/identifierforvendor.md)。

要一个不依赖系统规则的标识，自己生成一个（[`crypto.randomUUID()`](../api/crypto.md)）保存起来。保存在[本地存储](../api/storage.md)里的值在 App 被卸载时一起删除（**未在模拟器验证**，来自 iOS 的定义）。保存在 [Keychain](../api/keychain.md)（要先装 `@nacrejs/keychain`）里的值在卸载后是否保留，Apple 没有承诺，不能依赖。需要跨卸载、跨设备都不变的标识时，只能由服务器按账号发放。

## 参见

- [`UIDevice`](../api/ui-device.md)
- [`crypto`](../api/crypto.md)
- [本地存储](../api/storage.md)、[Keychain](../api/keychain.md)
