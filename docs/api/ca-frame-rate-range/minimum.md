---
type: reference
native: CAFrameRateRange.minimum
---

# `CAFrameRateRange`：`minimum` 属性

**`minimum`** 属性是最低帧率。

## 值

数，单位是帧每秒。三个字段都是 0 表示由系统决定。设置之后实际每秒回调多少次，**未在模拟器验证**。

- 只读。给它赋值抛 `TypeError: minimum is read-only: structs are values, assign a whole new one instead`。
- 值在构造时确定，之后不变。

## 示例

```js
const range = new CAFrameRateRange(30, 60, 30);
console.log(range.minimum);
```

**结果**：输出 `30`。

## 对应的 iOS API

C 结构体的字段 `CAFrameRateRange.minimum`。

## 参见

- [`CAFrameRateRange()`](constructor.md)：构造时给出这个字段
- [`CADisplayLink`](../ca-animation.md)：用它的 `preferredFrameRateRange`
- [结构体](../structs.md)：所有结构体共同的规则：字段只读、写入时可以给普通对象、读出来是新对象
