---
type: reference
native: NSError.domain
---

# `CLLocationError`：`domain` 属性

**`domain`** 属性是系统给的错误域。

## 值

字符串。

- 系统给的错误，以及运行时判断出的没有授权，是 `'kCLErrorDomain'`。
- 运行时自己给的 `'AbortError'` 和 `'InvalidStateError'` 是空字符串。

## 示例

```js
const manager = new CLLocationManager();
manager.requestLocation().catch((err) => {
  console.log(err.domain === '' ? '运行时给的' : '系统给的：' + err.domain);
});
```

**结果**：没有授权时输出 `系统给的：kCLErrorDomain`。

## 对应的 iOS API

`NSError.domain`。

## 参见

- [`code`](code.md)
- [安装 `@nacrejs/core-location`](../cl-location-manager.md#先装上)
