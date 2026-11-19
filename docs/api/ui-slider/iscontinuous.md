---
type: reference
native: UISlider.continuous
---

# `UISlider`：`isContinuous` 属性

**`isContinuous`** 属性决定用户拖动滑块时，[`change`](../ui-control/change-event.md) 什么时候派发。

## 值

布尔值。

| 取值 | 效果 |
| --- | --- |
| `true` | 拖动途中一直派发 `change`，每移动一次一次 |
| `false` | 拖动途中不派发，松手时派发一次 |

两种取值的效果**未在模拟器验证**。

- 可读，可写。
- 默认值是 `true`。
- 写入按 JS 的真假值转换。

拖动途中只更新界面上的数字时用 `true`。发网络请求、保存这类操作用 `false`，一次拖动只处理一次。

这个属性没有变化通知，只有你的代码会改它。

## 示例

```js
const slider = new UISlider();
slider.maximumValue = 100;
slider.isContinuous = false;
slider.addEventListener('change', () => {
  console.log('选定了', Math.round(slider.value));
});
```

**效果**：拖动途中不输出。松手时输出一次，比如 `选定了 72`。**未在模拟器验证。**

## 对应的 iOS API

`UISlider.continuous`，读取方法是 `isContinuous`。

## 参见

- [`change`](../ui-control/change-event.md) 事件
