---
type: reference
native: UIStepper.autorepeat
---

# `UIStepper`：`autorepeat` 属性

**`autorepeat`** 属性决定用户按住加号或减号不放时，值是否连续变化。

## 值

布尔值。

| 取值 | 效果 |
| --- | --- |
| `true` | 按住不放时连续加减 |
| `false` | 按一次只变一次，按住不放也只变一次 |

两种取值的效果**未在模拟器验证**。

- 可读，可写。
- 默认值是 `true`。
- 写入按 JS 的真假值转换。

这个属性没有变化通知，只有你的代码会改它。

## 示例

```js
const stepper = new UIStepper();
stepper.autorepeat = false;
```

**效果**：按住加号不放，值只加一次。**未在模拟器验证。**

## 对应的 iOS API

`UIStepper.autorepeat`。

## 参见

- [`isContinuous`](iscontinuous.md)
