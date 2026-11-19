---
type: reference
native: UIApplication.protectedDataAvailable
---

# `Application`：`protectedDataAvailable` 属性

**`protectedDataAvailable`** 属性表示加密保护的文件现在能不能读。

## 值

布尔值。

| 取值 | 含义 |
| --- | --- |
| `true` | 加密保护的文件可以读 |
| `false` | 设备已锁屏，这些文件读不了 |

- 只读。给它赋值抛 `TypeError`。
- 变化时派发 [`protecteddataavailable`](protecteddataavailable-event.md)、[`protecteddataunavailable`](protecteddataunavailable-event.md)。
- 读到的具体值**未在模拟器验证**。

## 示例

```js
console.log(application.protectedDataAvailable);
```

**结果**：输出当前能不能读加密保护的文件。

## 对应的 iOS API

`UIApplication.protectedDataAvailable`。

## 参见

- [`protecteddataunavailable`](protecteddataunavailable-event.md)
