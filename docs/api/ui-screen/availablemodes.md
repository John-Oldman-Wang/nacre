---
type: reference
native: UIScreen.availableModes
---

# `UIScreen`：`availableModes` 属性

**`availableModes`** 属性是这块屏幕支持的全部显示模式。

## 值

[`UIScreenMode`](../ui-screen-mode.md) 的数组。

- 只读。给它赋值抛 `TypeError`。
- 至少有一个。在 iPhone Air 模拟器（iOS 27.2）上有 `1` 个，就是 [`currentMode`](currentmode.md)。
- 外接显示器才可能有好几种。

## 示例

```js
application.addEventListener('sceneconnect', (e) => {
  const screen = e.scene.screen;
  console.log(screen.availableModes.length);
});
```

**结果**：在 iPhone Air 模拟器（iOS 27.2）上输出 `1`。

## 对应的 iOS API

`UIScreen.availableModes`。

## 参见

- [`UIScreenMode`](../ui-screen-mode.md)
- [`currentMode`](currentmode.md)
