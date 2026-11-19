---
type: reference
native: UIDevice.systemVersion
---

# `UIDevice`：`systemVersion` 属性

**`systemVersion`** 属性是操作系统的版本。

## 值

字符串，形如 `'26.1'` 或 `'26.1.2'`，不是数。

- 只读。给它赋值抛 `TypeError`，原值不变。
- App 运行期间不变，所以没有变化通知。
- 主版本号不会小于 26：运行时支持的最低系统是 iOS 26，更低的系统上 App 装不上。

> **注意**：不要直接比较版本字符串。字符串比较从第一个字符开始，`'9.0' > '26.0'` 是 `true`。先把每一段转成数再比，写法见[比较系统版本](../../guides/device-info.md#只在某个系统版本以上才做某件事)。

## 示例

```js
const major = Number(UIDevice.currentDevice.systemVersion.split('.')[0]);
console.log(major >= 27 ? '可以用 iOS 27 的能力' : '走兼容的写法');
```

**结果**：在 iOS 27 以上输出 `可以用 iOS 27 的能力`，否则输出 `走兼容的写法`。

## 对应的 iOS API

`UIDevice.systemVersion`。ObjC 里判断系统版本常用 `@available(iOS 27.0, *)`，这里取 `systemVersion` 的主版本号比较。

## 参见

- [读设备和系统的信息](../../guides/device-info.md)：逐段比较版本号
- [`systemName`](systemname.md)
