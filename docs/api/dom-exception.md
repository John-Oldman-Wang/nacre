---
type: reference
web: DOMException
---

# `DOMException`

**`DOMException`** 表示一个按名字分类的错误。[`name`](dom-exception/name.md) 说是哪一种错误，名字取自 Web 标准，比如 `'AbortError'`（被取消了）、`'NotFoundError'`（找不到）、`'NotAllowedError'`（没有权限）；[`message`](dom-exception/message.md) 是一句说明；[`code`](dom-exception/code.md) 是这个名字在 Web 标准里的老数字码。

运行时的 API 出错时，只要出错的含义在 Web 标准里有名字，抛出的或者 Promise 拒绝的就是 `DOMException`。错误来自 iOS 系统时，系统给的原值挂在 `cause` 上，是一个 [`NSError`](ns-error.md)，见[系统给的原值](#系统给的原值)。

它在核心里，不用装包。App 的代码也可以自己创建 `DOMException`，或者写它的子类。

**继承关系**：`Error` → `DOMException`

## 构造函数

[`DOMException()`](dom-exception/constructor.md)

创建一个错误，给出说明和名字。

## 静态属性

[错误码常量](dom-exception/constants.md)

`DOMException.ABORT_ERR` 等 25 个常量，每个是一个老数字码。实例上也有同样的 25 个。

## 实例属性

还继承 `Error` 的 `stack`（调用栈）和 `cause`（原因）。运行时给出的错误来自 iOS 系统时，`cause` 是系统给的 [`NSError`](ns-error.md)。

| 属性 | 说明 |
| --- | --- |
| [`name`](dom-exception/name.md) <small>只读</small> | 错误的分类，比如 `'AbortError'` |
| [`message`](dom-exception/message.md) <small>只读</small> | 一句说明 |
| [`code`](dom-exception/code.md) <small>只读</small> | 这个名字的老数字码，没有老数字码的名字是 0 |

## 概念

### 运行时抛哪种错误

运行时的 API 出错时，抛出的或者 Promise 拒绝的是下面四种之一：

| 情况 | 抛出的 | 例子 |
| --- | --- | --- |
| 参数的类型不对 | `TypeError` | 该传 `AVCaptureDevice` 的地方传了别的值；网络请求没能完成（`fetch()` 照 Web 标准拒绝成 `TypeError`） |
| 参数的类型对，但超出了允许的范围 | `RangeError` | 摄像头的变焦倍数超出了它能做到的范围 |
| 出错的含义在 Web 标准里有名字 | `DOMException` | 请求被取消、文件不存在、没有权限 |
| 出错的含义是 iOS 特有的 | [`NSError`](ns-error.md) | 面容 ID 失败太多次被锁住、这一刻定不出位置 |

判断出了什么错，看 `name`。四种都是 `Error` 的实例，`name` 都是字符串：`TypeError` 和 `RangeError` 的 `name` 是它们自己的类名，`DOMException` 和 `NSError` 的 `name` 是分类的名字。要分清是哪个类，用 `instanceof DOMException`、`instanceof NSError`。

### 运行时给出的名字

运行时给出的 `DOMException` 只有下面这些名字：

| `name` | `code` | 什么时候出现 |
| --- | --- | --- |
| `'AbortError'` | 20 | 请求被 [`AbortController`](abort-controller.md) 取消；[`AbortSignal`](abort-signal.md) 默认的取消原因；[`CLLocationManager`](cl-location-manager.md) 取一次位置被取消；[`webContents`](web-contents.md) 的加载被停下 |
| `'TimeoutError'` | 23 | [`AbortSignal.timeout()`](abort-signal/timeout.md) 到时间时的取消原因；[`runBackgroundTask()`](application/runbackgroundtask.md) 的时间用完 |
| `'NotFoundError'` | 8 | [`application.fileSystem`](filesystem.md) 找不到文件或目录 |
| `'NotAllowedError'` | 0 | 没有权限：文件读写、[钥匙串](keychain.md)、定位、[存图](ph-photo-library.md)、[通知](un-user-notification-center.md) |
| `'InvalidStateError'` | 11 | 现在这个状态做不了：[`WebSocket`](websocket.md) 没连上就发消息、[`PushEvent`](push-event.md) 派发完了才调 `waitUntil()`、[`AVCaptureDevice`](av-capture-device.md) 没锁就改设置、定位和存图的几种情况 |
| `'NetworkError'` | 19 | 定位遇到网络问题；网页加载失败；`WebSocket` 发送或 `ping()` 时网络出错 |
| `'InvalidModificationError'` | 13 | 文件读写：目标位置已经有文件；钥匙串：条目冲突 |
| `'QuotaExceededError'` | 22 | 设备存储空间已满；[`crypto.getRandomValues()`](crypto/getrandomvalues.md) 一次要的超过 65536 字节 |
| `'NoModificationAllowedError'` | 7 | 文件读写：所在的存储只读 |
| `'TypeMismatchError'` | 17 | 文件读写：文件名不合法；钥匙串：参数不对；`crypto.getRandomValues()` 传了浮点数组或 `DataView` |
| `'SecurityError'` | 18 | 钥匙串：App 缺少访问钥匙串所需的权限声明 |
| `'OperationError'` | 0 | 文件读写、钥匙串里没有更具体的名字可给的失败；系统的随机数来源失败 |
| `'InvalidCharacterError'` | 5 | [`atob()`、`btoa()`](web-globals.md) 遇到不能处理的字符 |
| `'DataCloneError'` | 25 | [`structuredClone()`](web-globals/structuredclone.md) 遇到不能复制的值 |

每个名字具体在哪种情况下出现，以及 `message` 的原文，写在各个 API 的页面上。

### 系统给的原值

错误来自 iOS 系统时，`DOMException` 的 `cause` 是系统给的那个错误，一个 [`NSError`](ns-error.md)。它的 [`domain`](ns-error/domain.md) 是错误域，[`code`](ns-error/code.md) 是这个域里的编号，`message` 是系统给的说明文字，`name` 是 `'NSError'`。

`name` 管的是「出了哪一类错」，大多数情况看它就够了。要分清同一个名字下面的不同原因，或者要把系统的错误码记进日志，读 `cause`。

运行时自己判断出来的错误没有 `cause`，比如请求被 `AbortController` 取消、`WebSocket` 没连上就发消息。读 `cause` 之前先判断它是不是 `NSError`。

## 示例

### 分辨读文件时出的错

```js
/// <reference types="@nacrejs/types" />

async function main() {
  const fs = application.fileSystem;
  try {
    await fs.readText(fs.documents + '/missing.txt');
  } catch (err) {
    if (err instanceof DOMException && err.name === 'NotFoundError') {
      console.log('文件不存在', err.code);
      if (err.cause instanceof NSError) {
        console.log(err.cause.domain, err.cause.code);
      }
    } else {
      throw err;
    }
  }
}
main();
```

**结果**（实测）：

- 第一行输出 `文件不存在 8`。
- 第二行输出 `NSCocoaErrorDomain 260`：系统的错误域和错误码。

### 自己给一个取消的原因

```js
const controller = new AbortController();
controller.abort(new DOMException('用户离开了页面', 'AbortError'));
const reason = controller.signal.reason;
console.log(String(reason), reason instanceof DOMException);
```

**结果**：输出 `AbortError: 用户离开了页面 true`。

## 和 Web 的差别

- 构造函数的 `message` 或 `name` 传 `null` 时得到空串。Web 上得到字符串 `'null'`。
- 运行时给出的错误来自 iOS 系统时带 `cause`。

## 参见

- [`NSError`](ns-error.md)：`cause` 上的系统错误，以及含义是 iOS 特有的那些错误
- [`AbortSignal`](abort-signal.md)：取消的原因默认是 `'AbortError'`，超时是 `'TimeoutError'`
- [`application.fileSystem`](filesystem.md)：文件读写的每种错误
