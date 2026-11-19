---
type: reference
native: UIScreen.potentialEDRHeadroom
---

# `UIScreen`：`potentialEDRHeadroom` 属性

**`potentialEDRHeadroom`** 属性是这块屏幕最多能显示的最亮白色比普通白色亮几倍。

## 值

数，没有单位：亮度的倍数，不小于 `1`。

- 只读。给它赋值抛 `TypeError`。
- `1` 表示这块屏幕不能显示比普通白色更亮的内容。在 iPhone Air 模拟器（iOS 27.2）上是 `1`。
- 不小于 [`currentEDRHeadroom`](currentedrheadroom.md)。
- 按 iOS 的说明，参考显示模式的状态变了时它可能跟着变，可以在 [`referencedisplaymodestatuschange`](referencedisplaymodestatuschange-event.md) 里重新读。**未在模拟器验证。**

## 示例

```js
application.addEventListener('sceneconnect', (e) => {
  const screen = e.scene.screen;
  console.log(screen.potentialEDRHeadroom);
});
```

**结果**：在 iPhone Air 模拟器（iOS 27.2）上输出 `1`。

## 对应的 iOS API

`UIScreen.potentialEDRHeadroom`。

## 参见

- [`currentEDRHeadroom`](currentedrheadroom.md)
