---
type: reference
native: UIScreen.isCaptured
---

# `UIScreen`：`isCaptured` 属性

**`isCaptured`** 属性表示屏幕此刻是否正在被录制、投屏或镜像到别的屏幕。

## 值

布尔值。

- 只读。给它赋值抛 `TypeError`。
- `true`：屏幕的内容正在被录屏、隔空播放或镜像。
- `false`：没有。模拟器上没在录屏时读到 `false`。
- 变了派发 [`capturedchange`](capturedchange-event.md) 事件。

它管不到截屏：截屏不会让它变成 `true`。

## 示例

```js
application.addEventListener('sceneconnect', (e) => {
  const screen = e.scene.screen;
  console.log(screen.isCaptured);
});
```

**结果**：没在录屏时输出 `false`。

## 对应的 iOS API

`UIScreen.isCaptured`（ObjC 里属性名是 `captured`，读取方法是 `isCaptured`）。

## 参见

- [`capturedchange`](capturedchange-event.md)：录屏开始和结束时遮住敏感内容的例子
