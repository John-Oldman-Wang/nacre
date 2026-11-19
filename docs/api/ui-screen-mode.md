---
type: reference
native: UIScreenMode
---

# `UIScreenMode`

**`UIScreenMode`** 表示屏幕的一种显示模式：一种分辨率和像素形状。

手机自己的屏幕只有一种显示模式。外接显示器可能支持好几种，从屏幕的 [`availableModes`](ui-screen/availablemodes.md) 读到全部，写 [`currentMode`](ui-screen/currentmode.md) 换一种。

**继承关系**：`EventTarget` → `NSObject` → `UIScreenMode`

## 构造函数

不能用 `new` 创建。`new UIScreenMode()` 抛 `TypeError: Illegal constructor: UIScreenMode is created by the runtime, not by new`。从屏幕的 `availableModes`、`currentMode`、`preferredMode` 读。

## 实例属性

| 属性 | 说明 |
| --- | --- |
| [`size`](ui-screen-mode/size.md) <small>只读</small> | 这种模式的大小，单位是像素 |
| [`pixelAspectRatio`](ui-screen-mode/pixelaspectratio.md) <small>只读</small> | 一个像素的宽高比 |

## 示例

```js
application.addEventListener('sceneconnect', (e) => {
  for (const mode of e.scene.screen.availableModes) {
    console.log(mode.size.width, mode.size.height, mode.pixelAspectRatio);
  }
});
```

**结果**：在 iPhone Air 模拟器（iOS 27.2）上输出一行 `1260 2736 1`。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `screen.availableModes` | `screen.availableModes` |
| `mode.size` | `mode.size` |
| `mode.pixelAspectRatio` | `mode.pixelAspectRatio` |

## 参见

- [`UIScreen`](ui-screen.md)
