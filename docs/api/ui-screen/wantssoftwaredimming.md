---
type: reference
native: UIScreen.wantsSoftwareDimming
---

# `UIScreen`：`wantsSoftwareDimming` 属性

**`wantsSoftwareDimming`** 属性决定亮度低于硬件能做到的最低值时，要不要用软件把画面再压暗。

## 值

布尔值。

- 可读，可写。默认 `false`。
- `true`：[`brightness`](brightness.md) 设得比硬件的最低亮度还低时，系统把画面再调暗一些。按 iOS 的说明，这会多耗一点性能。**未在模拟器验证。**
- `false`：亮度最低到硬件的最低值为止。
- 没有变化通知：只有 App 自己会改它。

## 示例

```js
application.addEventListener('sceneconnect', (e) => {
  const screen = e.scene.screen;
  console.log(screen.wantsSoftwareDimming);
});
```

**结果**：输出 `false`。

## 对应的 iOS API

`UIScreen.wantsSoftwareDimming`。

## 参见

- [`brightness`](brightness.md)
