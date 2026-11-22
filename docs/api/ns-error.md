---
type: reference
native: NSError
---

# `NSError`

**`NSError`** 表示 iOS 系统给出的一个错误。[`domain`](ns-error/domain.md)（错误域）说明错误来自系统的哪一部分，比如文件系统、定位、面容 ID；[`code`](ns-error/code.md) 是这个错误域里的编号；`message` 是系统给的说明文字。

它出现在两处：

- **出错的含义是 iOS 特有的**，比如面容 ID 失败太多次被锁住：抛出的或者 Promise 拒绝的就是 `NSError`。[`name`](ns-error/name.md) 是运行时给的分类名字，比如 `'BiometryLockoutError'`；没有分类可给时是 `'NSError'`，这时看 `domain` 和 `code`。
- **出错的含义在 Web 标准里有名字**，比如没有权限：抛出的是 [`DOMException`](dom-exception.md)，系统的 `NSError` 挂在它的 `cause` 上。这时 `NSError` 的 `name` 是 `'NSError'`。

全局上有 `NSError`，可以用 `err instanceof NSError` 判断。运行时会抛哪几种错误，见[运行时抛哪种错误](dom-exception.md#运行时抛哪种错误)。

**继承关系**：`Error` → `NSError`

## 构造函数

不能用 `new` 创建，写了抛 `TypeError`：`NSError cannot be constructed; the runtime creates it from a system error`。`NSError` 只由运行时在系统出错时给出。

## 实例属性

还继承 `Error` 的 `message`（系统给的说明文字）和 `stack`（调用栈）。`message` 的语言跟着 App 的语言走，见[配置 App](../guides/project-config.md)。

| 属性 | 说明 |
| --- | --- |
| [`name`](ns-error/name.md) <small>只读</small> | 错误的分类，比如 `'BiometryLockoutError'`；没有分类时是 `'NSError'` |
| [`domain`](ns-error/domain.md) <small>只读</small> | 错误域，比如 `'NSCocoaErrorDomain'` |
| [`code`](ns-error/code.md) <small>只读</small> | 错误域里的编号 |

## 概念

### 哪些 API 给出 NSError

直接抛出或者拒绝成 `NSError` 的：

| API | `name` | `domain` |
| --- | --- | --- |
| [`LAContext`](la-context.md) 的 `evaluatePolicy()` 被拒绝、`canEvaluatePolicyError()` 的返回值 | 十一个分类名字之一，或者 `'NSError'`，见[认证没通过的原因](la-context.md#认证没通过的原因) | `'com.apple.LocalAuthentication'` |
| [`CLLocationManager`](cl-location-manager.md) 定位出错 | `'LocationUnknownError'` 或 `'NSError'`，见 [`CLLocationError`](cl-location-error.md) | `'kCLErrorDomain'` |
| [`PHPhotoLibrary`](ph-photo-library.md) 存图失败，除了没有权限和工程里没写说明 | `'NSError'` | 系统给的错误域 |
| [`UNUserNotificationCenter`](un-user-notification-center.md) 出错，除了没有权限 | `'NSError'` | 一般是 `'UNErrorDomain'` |
| [`AVCaptureDevice`](av-capture-device.md) 的 `lockForConfiguration()` 拿不到锁 | `'NSError'` | 系统给的错误域 |
| `new` [`AVCaptureDeviceInput`](av-capture-device-input.md)`()` 打不开摄像头 | `'NSError'` | 空串，`code` 是 0 |
| [`UIWindowScene`](ui-window-scene.md) 的 `requestGeometryUpdateWithPreferences()` 被系统拒绝 | `'NSError'` | 系统给的错误域 |
| [`UIActivityViewController`](ui-activity-view-controller.md) 的 `complete` 事件里的 `activityError` | `'NSError'` | 系统给的错误域 |

挂在 [`DOMException`](dom-exception.md) 的 `cause` 上的：文件读写、钥匙串、定位、存图、通知、网页加载这些 API 给出的 `DOMException`，错误来自系统时都带着它，`name` 是 `'NSError'`。

## 示例

### 读出系统的错误码

```js
/// <reference types="@nacrejs/types" />

async function main() {
  const fs = application.fileSystem;
  try {
    await fs.readText(fs.documents + '/missing.txt');
  } catch (err) {
    const cause = err instanceof Error ? err.cause : undefined;
    if (cause instanceof NSError) {
      console.log(cause.name, cause.domain, cause.code);
      console.log(cause.message);
    }
  }
}
main();
```

**结果**（实测）：

- 第一行输出 `NSError NSCocoaErrorDomain 260`。读不存在的文件，拒绝的是 `name` 为 `'NotFoundError'` 的 `DOMException`，系统的错误挂在它的 `cause` 上。
- 第二行输出系统给的说明文字，说这个文件不存在。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `error.domain` | `err.domain` |
| `error.code` | `err.code` |
| `error.localizedDescription` | `err.message` |
| `error.userInfo` | JS 里不提供 |
| 方法的 `NSError **` 出参、回调的 `NSError *` 参数 | 方法抛出的错误，或者 Promise 拒绝的值 |

## 参见

- [`DOMException`](dom-exception.md)：含义在 Web 标准里有名字的错误，系统的 `NSError` 挂在它的 `cause` 上
- [`LAContext`](la-context.md)：面容 ID 认证没通过的各种原因
- [`CLLocationError`](cl-location-error.md)：定位出错时的错误
