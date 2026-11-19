---
type: reference
native: UIScreen.currentEDRHeadroom
---

# `UIScreen`：`currentEDRHeadroom` 属性

**`currentEDRHeadroom`** 属性是屏幕此刻能显示的最亮白色比普通白色亮几倍。超出普通白色的亮度用来显示 HDR 内容。

## 值

数，没有单位：亮度的倍数，不小于 `1`。

- 只读。给它赋值抛 `TypeError`。
- `1` 表示此刻没有余量，HDR 内容按普通亮度显示。在 iPhone Air 模拟器（iOS 27.2）上是 `1`。
- 它随屏幕的状态和此刻有没有在显示 HDR 内容变化，不超过 [`potentialEDRHeadroom`](potentialedrheadroom.md)。
- 没有变化通知：iOS 不发这个值的通知，需要时再读。

## 示例

```js
application.addEventListener('sceneconnect', (e) => {
  const screen = e.scene.screen;
  console.log(screen.currentEDRHeadroom);
});
```

**结果**：在 iPhone Air 模拟器（iOS 27.2）上输出 `1`。

## 对应的 iOS API

`UIScreen.currentEDRHeadroom`。

## 参见

- [`potentialEDRHeadroom`](potentialedrheadroom.md)
