---
type: reference
native: UIScreen.referenceDisplayModeStatus
---

# `UIScreen`：`referenceDisplayModeStatus` 属性

**`referenceDisplayModeStatus`** 属性是这块屏幕的参考显示模式的状态。参考显示模式是一种按标准色彩和亮度准确显示的模式，给调色、看片这类专业用途。

## 值

字符串，取下面四个值之一：

| 值 | 含义 |
| --- | --- |
| `'notSupported'` | 这块屏幕不支持参考显示模式 |
| `'notEnabled'` | 支持，但用户没有打开 |
| `'limited'` | 用户打开了，但此刻做不到准确显示，比如设备过热或电量不足 |
| `'enabled'` | 打开了，并且在准确显示 |

- 只读。给它赋值抛 `TypeError`。
- 在 iPhone Air 模拟器（iOS 27.2）上是 `'notSupported'`。
- 变了派发 [`referencedisplaymodestatuschange`](referencedisplaymodestatuschange-event.md) 事件。

## 示例

```js
application.addEventListener('sceneconnect', (e) => {
  const screen = e.scene.screen;
  console.log(screen.referenceDisplayModeStatus);
});
```

**结果**：在 iPhone Air 模拟器（iOS 27.2）上输出 `notSupported`。

## 对应的 iOS API

`UIScreen.referenceDisplayModeStatus`，取值是 `UIScreenReferenceDisplayModeStatus` 去掉前缀、首字母小写。

## 参见

- [`referencedisplaymodestatuschange`](referencedisplaymodestatuschange-event.md)
