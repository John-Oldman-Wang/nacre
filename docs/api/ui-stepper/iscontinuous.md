---
type: reference
native: UIStepper.continuous
---

# `UIStepper`：`isContinuous` 属性

**`isContinuous`** 属性决定用户按住按钮、值连续变化时，[`change`](../ui-control/change-event.md) 什么时候派发。

## 值

布尔值。

| 取值 | 效果 |
| --- | --- |
| `true` | 按住连续变化时，每变一次都派发一次 `change` |
| `false` | 按住期间值照样变化，但不派发；松手后派发一次 |

两种取值的效果**未在模拟器验证**。

- 可读，可写。
- 默认值是 `true`。
- 写入按 JS 的真假值转换。
- 只在 [`autorepeat`](autorepeat.md) 为 `true` 时有区别。

这个属性没有变化通知，只有你的代码会改它。

## 示例

```js
const stepper = new UIStepper();
stepper.isContinuous = false;
stepper.addEventListener('change', () => {
  console.log('定了', stepper.value);
});
```

**效果**：按住加号时值在连续增加，但不输出。松手后输出一次。**未在模拟器验证。**

## 对应的 iOS API

`UIStepper.continuous`，读取方法是 `isContinuous`。

## 参见

- [`autorepeat`](autorepeat.md)
