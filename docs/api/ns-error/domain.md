---
type: reference
native: NSError.domain
---

# `NSError`：`domain` 属性

**`domain`** 属性是错误域：说明错误来自系统的哪一部分。

## 值

字符串。

- 只读。给它赋值抛 `TypeError`，值不变。
- 是系统给的原值。

各个 API 给出的错误域：

| `domain` | 来自 |
| --- | --- |
| `'NSCocoaErrorDomain'` | 文件读写（[`application.fileSystem`](../filesystem.md)） |
| `'NSOSStatusErrorDomain'` | 钥匙串（[`application.keychain`](../keychain.md)） |
| `'kCLErrorDomain'` | 定位（[`CLLocationManager`](../cl-location-manager.md)） |
| `'com.apple.LocalAuthentication'` | 面容 ID（[`LAContext`](../la-context.md)） |
| `'UNErrorDomain'` | 通知（[`UNUserNotificationCenter`](../un-user-notification-center.md)） |
| `'NSURLErrorDomain'` | 网页加载（[`webContents`](../web-contents.md)） |
| 空串 | `new` [`AVCaptureDeviceInput`](../av-capture-device-input.md)`()` 打不开摄像头 |

上表是一般情况，系统也可能给出表里没有的错误域。按错误码判断时，先比对 `domain`。

## 示例

```js
/// <reference types="@nacrejs/types" />

async function main() {
  const fs = application.fileSystem;
  try {
    await fs.readText(fs.documents + '/missing.txt');
  } catch (err) {
    const cause = err instanceof Error ? err.cause : undefined;
    if (cause instanceof NSError) {
      console.log(cause.domain);
    }
  }
}
main();
```

**结果**：输出 `NSCocoaErrorDomain`（实测）。

## 对应的 iOS API

`NSError.domain`。

## 参见

- [`code`](code.md)：错误域里的编号
