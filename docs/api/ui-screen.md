---
type: reference
native: UIScreen
status: partial
---

# `UIScreen`

**`UIScreen`** 表示一块屏幕：它的大小、像素密度、亮度、刷新率，以及此刻有没有被录制。

屏幕从场景读：[`scene.screen`](ui-window-scene/screen.md)。iPhone 上只有一块屏幕，所有场景读到的是它。接了外接显示器时，显示在那块显示器上的场景读到的是另一块屏幕。**外接显示器未在模拟器验证。**

屏幕的大小是整块屏幕的范围，包括状态栏和底部横条占住的地方。摆放内容用视图的安全区，不用屏幕的大小去算。

**继承关系**：`EventTarget` → `NSObject` → `UIScreen`

## 构造函数

不能用 `new` 创建。`new UIScreen()` 抛 `TypeError: Illegal constructor: UIScreen is created by the runtime, not by new`。屏幕从场景的 [`screen`](ui-window-scene/screen.md) 读。

## 实例属性

还继承 `NSObject` 的属性。

大小和像素密度：

| 属性 | 说明 |
| --- | --- |
| [`bounds`](ui-screen/bounds.md) <small>只读</small> | 整块屏幕的范围，单位 pt |
| [`scale`](ui-screen/scale.md) <small>只读</small> | 一个 pt 对应几个像素 |
| [`nativeBounds`](ui-screen/nativebounds.md) <small>只读</small> | 物理屏幕的范围，单位是像素 |
| [`nativeScale`](ui-screen/nativescale.md) <small>只读</small> | 物理屏幕上一个 pt 对应几个像素 |
| [`traitCollection`](ui-screen/traitcollection.md) <small>只读</small> | 屏幕的外观特征 |

亮度：

| 属性 | 说明 |
| --- | --- |
| [`brightness`](ui-screen/brightness.md) | 屏幕亮度，`0` 到 `1` |
| [`wantsSoftwareDimming`](ui-screen/wantssoftwaredimming.md) | 亮度低于硬件下限时，要不要用软件再压暗 |

刷新和显示：

| 属性 | 说明 |
| --- | --- |
| [`maximumFramesPerSecond`](ui-screen/maximumframespersecond.md) <small>只读</small> | 每秒最多刷新几帧 |
| [`calibratedLatency`](ui-screen/calibratedlatency.md) <small>只读</small> | 显示硬件的延迟，单位秒 |
| [`currentEDRHeadroom`](ui-screen/currentedrheadroom.md) <small>只读</small> | 此刻能显示的最亮白色比普通白色亮几倍 |
| [`potentialEDRHeadroom`](ui-screen/potentialedrheadroom.md) <small>只读</small> | 最多能显示的最亮白色比普通白色亮几倍 |
| [`referenceDisplayModeStatus`](ui-screen/referencedisplaymodestatus.md) <small>只读</small> | 参考显示模式的状态 |

录屏和镜像：

| 属性 | 说明 |
| --- | --- |
| [`isCaptured`](ui-screen/iscaptured.md) <small>只读</small> | 此刻是否正在被录屏、投屏或镜像 |
| [`mirroredScreen`](ui-screen/mirroredscreen.md) <small>只读</small> | 这块屏幕在镜像哪块屏幕 |

显示模式（外接显示器用）：

| 属性 | 说明 |
| --- | --- |
| [`availableModes`](ui-screen/availablemodes.md) <small>只读</small> | 支持的全部显示模式 |
| [`preferredMode`](ui-screen/preferredmode.md) <small>只读</small> | 最合适的显示模式 |
| [`currentMode`](ui-screen/currentmode.md) | 此刻用的显示模式 |

## 实例方法

| 方法 | 说明 |
| --- | --- |
| [`snapshotViewAfterScreenUpdates()`](ui-screen/snapshotviewafterscreenupdates.md) | 把屏幕此刻的内容拍成一个视图 |

## 事件

| 事件 | 什么时候派发 |
| --- | --- |
| [`brightnesschange`](ui-screen/brightnesschange-event.md) | 屏幕亮度变了 |
| [`capturedchange`](ui-screen/capturedchange-event.md) | 开始或停止被录屏、投屏、镜像 |
| [`modechange`](ui-screen/modechange-event.md) | 显示模式变了 |
| [`referencedisplaymodestatuschange`](ui-screen/referencedisplaymodestatuschange-event.md) | 参考显示模式的状态变了 |
| [`keyboardshow`](ui-screen/keyboardshow-event.md) | 键盘要弹出 |
| [`keyboardhide`](ui-screen/keyboardhide-event.md) | 键盘要收起 |
| [`keyboardchange`](ui-screen/keyboardchange-event.md) | 键盘的位置或大小要变：弹出、收起、换输入法 |

- 事件不能取消。
- 前四个事件的回调不是在变化的那一刻同步执行，而是稍后执行，见[运行时怎么工作](how-it-works.md#事件)。
- 键盘的三个事件是当场派发的：监听器在键盘的动画里执行，这时候改的布局跟着键盘一起动。
- 屏幕上也可以监听和派发自定义名字的事件。

## 示例

### 读屏幕的大小

```js
application.addEventListener('sceneconnect', (e) => {
  const screen = e.scene.screen;
  console.log(screen.bounds.width, screen.bounds.height, screen.scale);
  console.log(screen.nativeBounds.width, screen.nativeBounds.height);
});
```

**结果**：在 iPhone Air 模拟器（iOS 27.2）上输出两行：

```
420 912 3
1260 2736
```

### 出示二维码时调到最亮

```js
application.addEventListener('sceneconnect', (e) => {
  const screen = e.scene.screen;
  const before = screen.brightness;
  screen.brightness = 1;
  // 离开这个页面时写回去
  // screen.brightness = before;
  console.log(before);
});
```

**效果**：屏幕调到最亮，控制台输出原来的亮度。按 iOS 的说明，锁屏之后亮度恢复成系统的设置。屏幕变亮**未在模拟器验证**。

录屏时遮住敏感内容的例子在 [`capturedchange`](ui-screen/capturedchange-event.md)。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `UIScreen.mainScreen` | `scene.screen` |
| `view.window.windowScene.screen` | `view.window.windowScene.screen` |
| `screen.bounds.size.width` | `screen.bounds.width` |
| `screen.brightness = 1.0` | `screen.brightness = 1` |
| `screen.isCaptured` | `screen.isCaptured` |
| `UIScreenCapturedDidChangeNotification` | `screen.addEventListener('capturedchange', …)` |
| `UIScreenBrightnessDidChangeNotification` | `screen.addEventListener('brightnesschange', …)` |
| `UIScreenModeDidChangeNotification` | `screen.addEventListener('modechange', …)` |
| `UIScreenReferenceDisplayModeStatusDidChangeNotification` | `screen.addEventListener('referencedisplaymodestatuschange', …)` |
| `UIKeyboardWillShowNotification` | `screen.addEventListener('keyboardshow', …)` |
| `UIKeyboardWillHideNotification` | `screen.addEventListener('keyboardhide', …)` |
| `UIKeyboardWillChangeFrameNotification` | `screen.addEventListener('keyboardchange', …)` |

## 参见

- [`UIWindowScene`](ui-window-scene.md)：屏幕从场景读
- [`UIScreenMode`](ui-screen-mode.md)：显示模式
- [外观特征](ui-trait-collection.md)：深色还是浅色、几倍屏
- [单位](units.md)：pt 和像素
- [`UIDevice`](ui-device.md)：设备和系统的信息
