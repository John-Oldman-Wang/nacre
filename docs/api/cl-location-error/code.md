---
type: reference
native: NSError.code
---

# `CLLocationError`：`code` 属性

**`code`** 属性是系统给的错误码，原样交出。

## 值

数。

- 系统给的错误是系统的原值，比如没有授权是 1，网络问题是 2，定不出位置是 0。
- 运行时自己给的错误（`'AbortError'`、`'InvalidStateError'`）是 0。
- 运行时在调用系统之前判断出没有授权时，`code` 也是 1，和系统给的一样。

## 示例

```js
const manager = new CLLocationManager();
manager.requestLocation().catch((err) => {
  console.log(err.name, err.code);
});
```

**结果**：没有授权时输出 `NotAllowedError 1`。

## 对应的 iOS API

`NSError.code`，`CLError` 枚举里的值。

## 参见

- [`name`](name.md)：错误的分类。区分错误用它
- [安装 `@nacrejs/core-location`](../cl-location-manager.md#先装上)
