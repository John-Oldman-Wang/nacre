---
type: reference
native: CAFrameRateRange
---

# `CAFrameRateRange`

**`CAFrameRateRange`** 表示一个帧率区间：`minimum`（最低）、`maximum`（最高）、`preferred`（最希望的），单位都是帧每秒。它是 [`CADisplayLink`](ca-animation.md) 的 `preferredFrameRateRange` 属性的值。三个数都是 0 表示由系统决定。

字段只读，要改就整体换一个新的；写入接受结构体的地方时也可以给字段齐全的普通对象；每次读属性得到一个新对象。这几条对所有结构体都成立，见[结构体](structs.md)。

**继承关系**：没有。`CAFrameRateRange` 是普通的 JS 类，不继承 `NSObject`，也不是 `EventTarget`。

## 构造函数

[`CAFrameRateRange()`](ca-frame-rate-range/constructor.md)

用最低、最高、最希望的帧率创建一个区间。`preferred` 可以不给，不给时是 0。

## 实例属性

| 属性 | 说明 |
| --- | --- |
| [`minimum`](ca-frame-rate-range/minimum.md) <small>只读</small> | 最低帧率，帧每秒 |
| [`maximum`](ca-frame-rate-range/maximum.md) <small>只读</small> | 最高帧率，帧每秒 |
| [`preferred`](ca-frame-rate-range/preferred.md) <small>只读</small> | 最希望的帧率，帧每秒 |

## 示例

```js
const range = new CAFrameRateRange(30, 60, 30);
console.log(String(range));
```

**结果**：输出 `CAFrameRateRange(30, 60, 30)`。把它赋给 `CADisplayLink` 的 `preferredFrameRateRange` 之后实际每秒回调多少次，**未在模拟器验证**。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `CAFrameRateRangeMake(30, 60, 30)` | `new CAFrameRateRange(30, 60, 30)` |
| `CAFrameRateRangeDefault` | `new CAFrameRateRange(0, 0, 0)` |

## 参见

- [结构体](structs.md)：所有结构体共同的规则，以及转成字符串和 JSON
- [`CADisplayLink`](ca-animation.md)：`preferredFrameRateRange` 用它
