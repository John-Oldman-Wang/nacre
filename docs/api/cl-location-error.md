---
type: reference
native: NSError (kCLErrorDomain)
---

# `CLLocationError`

**`CLLocationError`** 是定位出错时得到的 `Error` 对象。[`requestLocation()`](cl-location-manager/requestlocation.md) 和 [`requestWhenInUseAuthorization()`](cl-location-manager/requestwheninuseauthorization.md) 的 Promise 被拒绝时得到它，[`locationerror`](cl-location-manager/locationerror-event.md) 事件的 `error` 字段也是它。

`CLLocationError` 是类型定义里的名字，不是全局上的类：全局没有 `CLLocationError`，不能用 `instanceof CLLocationError` 判断。它是一个普通的 `Error`，`err instanceof Error` 是 `true`，多出 `code` 和 `domain` 两个字段。区分错误的种类看 `name`。

要先装 `@nacrejs/core-location`，装法见 [`CLLocationManager`](cl-location-manager.md#先装上)，也可以看[核心和能力包](capabilities.md)。

**继承关系**：`Error` → `CLLocationError`

## 构造函数

不能创建。错误由运行时在定位出错时给出。

## 实例属性

还继承 `Error` 的 `message`：一句说明。系统给的错误是系统的文字，跟随系统语言。

| 属性 | 说明 |
| --- | --- |
| [`name`](cl-location-error/name.md) | 错误的分类，比如 `'NotAllowedError'` |
| [`code`](cl-location-error/code.md) | 系统的错误码 |
| [`domain`](cl-location-error/domain.md) | 系统的错误域，`'kCLErrorDomain'` 或空字符串 |

## 示例

```js
const manager = new CLLocationManager();
manager.requestLocation().catch((err) => {
  console.log(err.name, err.code, err.domain);
});
```

**结果**：没有授权时输出 `NotAllowedError 1 kCLErrorDomain`。

## 对应的 iOS API

`NSError`，错误域是 `kCLErrorDomain`。`error.code == kCLErrorDenied` 写成 `error.name === 'NotAllowedError'`。

## 参见

- [`CLLocationManager`](cl-location-manager.md)：哪些方法和事件会给出它
- [取用户的位置](../guides/get-location.md#处理出错)：出错之后该怎么办
