---
type: reference
native: UIApplication.supportsMultipleScenes
---

# `Application`：`supportsMultipleScenes` 属性

**`supportsMultipleScenes`** 属性表示 App 能不能同时有多个场景。

## 值

布尔值。

| 取值 | 含义 |
| --- | --- |
| `true` | 可以同时有多个场景 |
| `false` | 只有一个 |

- 只读。给它赋值抛 `TypeError`。
- 这个值是「Info.plist 里声明了支持」并且「当前设备允许」的结果。只想读声明值，从 `application.info.UIApplicationSceneManifest` 里取 `UIApplicationSupportsMultipleScenes`。
- 没有变化事件：iOS 不提供对应的通知。

## 示例

```js
if (application.supportsMultipleScenes) {
  console.log('可以开多个窗口');
} else {
  console.log('只有一个窗口');
}
```

**结果**：验收用的 App 输出 `只有一个窗口`。

## 对应的 iOS API

`UIApplication.supportsMultipleScenes`。

## 参见

- [场景的数量](../ui-window-scene.md#场景的数量)
