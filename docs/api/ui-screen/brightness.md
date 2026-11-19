---
type: reference
native: UIScreen.brightness
---

# `UIScreen`：`brightness` 属性

**`brightness`** 属性是屏幕的亮度。

## 值

数，没有单位：`0` 是最暗，`1` 是最亮。

- 可读，可写。
- 读到的是系统此刻的亮度。在 iPhone Air 模拟器（iOS 27.2）上读到 `0.5`。
- 写入改的是整台设备的屏幕亮度。按 iOS 的说明，App 设的亮度保持到设备锁屏。写入后屏幕的样子**未在模拟器验证**。
- 用户在控制中心调了亮度，派发 [`brightnesschange`](brightnesschange-event.md) 事件。

扫码付款、出示二维码这类页面常把亮度调到 `1`，离开页面时把读到的原值写回去。

### 写错时

写 `0` 到 `1` 以外的数抛 `TypeError`，亮度不变：

```
TypeError: brightness must be between 0 and 1, got 1.5
```

写转不成数的值抛 `TypeError`：

```
TypeError: brightness must be a finite number, got "bright"
```

能转成数的值照 [参数转换](../native-classes.md) 的规矩转：`'0.5'` 当 `0.5`。

## 示例

```js
application.addEventListener('sceneconnect', (e) => {
  const screen = e.scene.screen;
  console.log(screen.brightness);
});
```

**结果**：在 iPhone Air 模拟器（iOS 27.2）上输出 `0.5`。

## 对应的 iOS API

`UIScreen.brightness`。写 0 到 1 以外的值，ObjC 里不报错，这里抛 `TypeError`。

## 参见

- [`UIScreen`](../ui-screen.md)
- [`wantsSoftwareDimming`](wantssoftwaredimming.md)
- [`brightnesschange`](brightnesschange-event.md)
