---
type: reference
native: UIDevice.currentDevice
---

# `UIDevice.currentDevice` 静态属性

**`UIDevice.currentDevice`** 静态属性是运行 App 的这台设备。

## 值

`UIDevice`。

- 只读。给它赋值抛 `TypeError`。
- 每次读得到同一个对象。
- `UIDevice` 不能用 `new` 创建，这是拿到实例的唯一途径。`new UIDevice()` 抛 `TypeError: Illegal constructor: UIDevice is created by the runtime, not by new`。

## 示例

```js
const current = UIDevice.currentDevice;
console.log(current === UIDevice.currentDevice);
```

**结果**：输出 `true`。

## 对应的 iOS API

`UIDevice.currentDevice`。

## 参见

- [`UIDevice`](../ui-device.md)
