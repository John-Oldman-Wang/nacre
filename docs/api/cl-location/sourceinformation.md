---
type: reference
native: CLLocation.sourceInformation
---

# `CLLocation`：`sourceInformation` 属性

**`sourceInformation`** 属性说明这个位置是怎么来的：是不是软件模拟的，是不是来自外接的配件。

## 值

一个对象，或者 `null`。系统没给来源时是 `null`。

对象有两个字段，都是布尔，都只读：

**`isSimulatedBySoftware`**

`true`：这个位置是软件模拟的（模拟器里设的位置、开发者工具改的位置）。`false`：真实量到的。

**`isProducedByAccessory`**

`true`：这个位置来自外接的配件（车机、外接定位器）。`false`：来自设备自己。

- 只读。给它赋值抛 `TypeError`。对象本身被冻结，改它的字段不生效。
- 同一个 `CLLocation` 上每次读得到同一个对象。
- 模拟器上读到的是什么**未在模拟器验证**。

## 示例

```js
const manager = new CLLocationManager();
manager.requestLocation().then((here) => {
  const source = here.sourceInformation;
  if (source !== null && source.isSimulatedBySoftware) {
    console.log('这个位置是软件模拟的');
  }
}, () => {});
```

**效果**：位置来自模拟时输出一行。**未在模拟器验证。**

## 对应的 iOS API

`CLLocation.sourceInformation`，类型是 `CLLocationSourceInformation`。这里是一个普通的冻结对象，不是类。

## 参见

- [安装 `@nacrejs/core-location`](../cl-location-manager.md#先装上)
