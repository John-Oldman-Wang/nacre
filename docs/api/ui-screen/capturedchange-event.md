---
type: reference
native: UIScreenCapturedDidChangeNotification
---

# `UIScreen`：`capturedchange` 事件

**`capturedchange`** 事件在屏幕开始或停止被录制、投屏、镜像时派发。

## 语法

```
screen.addEventListener('capturedchange', (event) => { })
```

## 事件对象

`Event`。`type` 是 `'capturedchange'`，`target` 是这块屏幕。事件对象不带新的值，在回调里读屏幕的属性。不能取消，`event.cancelable` 是 `false`。

## 什么时候派发

[`isCaptured`](iscaptured.md) 变了时派发：用户开始录屏、停止录屏、开始或停止隔空播放和镜像。**未在模拟器验证。** 截屏不派发。

- 回调不是在变化的那一刻同步执行，而是稍后执行，见[运行时怎么工作](../how-it-works.md#事件)。
- 没有监听器时没有开销。

## 示例

```js
application.addEventListener('sceneconnect', (e) => {
  const screen = e.scene.screen;
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 盖在内容上的一层，录屏时显示
  const cover = new UIView();
  cover.backgroundColor = 'systemBackground';
  cover.frame = screen.bounds;
  cover.isHidden = !screen.isCaptured;
  page.view.addSubview(cover);

  screen.addEventListener('capturedchange', () => {
    cover.isHidden = !screen.isCaptured;
  });
});
```

**效果**：
- 没在录屏时，`cover` 隐藏，页面照常显示。
- 用户从控制中心开始录屏后，`cover` 显示出来，盖住页面的内容。录下来的画面里看不到内容。**未在模拟器验证。**
- 停止录屏后，`cover` 又隐藏。**未在模拟器验证。**

启动时先按 `isCaptured` 设一次：App 启动之前就在录屏的话，不会再派发 `capturedchange`。

## 对应的 iOS API

`UIScreenCapturedDidChangeNotification`。

## 参见

- [`isCaptured`](iscaptured.md)
