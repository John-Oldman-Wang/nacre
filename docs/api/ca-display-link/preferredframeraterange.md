---
type: reference
native: CADisplayLink.preferredFrameRateRange
---

# `CADisplayLink`：`preferredFrameRateRange` 属性

**`preferredFrameRateRange`** 属性是希望每秒回调多少次。系统在这个范围里决定实际的帧率。

## 值

`CAFrameRateRange`，有三个字段，单位都是帧每秒：

| 字段 | 含义 |
| --- | --- |
| `minimum` | 最低 |
| `maximum` | 最高 |
| `preferred` | 最希望的 |

- 可读，可写。
- 默认值是 `CAFrameRateRange(0, 0, 0)`。三个都是 0 表示由系统决定。
- 写入时可以给 `CAFrameRateRange`，也可以给有这三个字段的普通对象。
- 读出来的是一个新的 `CAFrameRateRange`，字段只读，见[结构体](../structs.md)。
- 设置之后实际每秒回调多少次，**未在模拟器验证**。

## 示例

```js
const link = new CADisplayLink();
link.preferredFrameRateRange = new CAFrameRateRange(30, 60, 30);
console.log(String(link.preferredFrameRateRange));
```

**结果**：控制台输出 `CAFrameRateRange(30, 60, 30)`。

## 对应的 iOS API

`CADisplayLink.preferredFrameRateRange`。`CAFrameRateRangeMake(30, 60, 30)` 写成 `new CAFrameRateRange(30, 60, 30)`。

## 参见

- [结构体](../structs.md)
