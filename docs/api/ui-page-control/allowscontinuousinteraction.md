---
type: reference
native: UIPageControl.allowsContinuousInteraction
---

# `UIPageControl`：`allowsContinuousInteraction` 属性

**`allowsContinuousInteraction`** 属性决定用户能不能按住这排点左右拖着连续翻页。

## 值

布尔值。

| 取值 | 效果 |
| --- | --- |
| `true` | 按住这排点左右拖，一页一页地换，每换一页派发一次 [`change`](../ui-control/change-event.md) |
| `false` | 拖没有反应。点一下仍然可以翻到相邻的一页 |

- 可读，可写。
- 默认值是 `true`。
- 写入时按 JS 的真假值转换。
- 两种取值的效果和 `change` 的派发次数**未在模拟器验证**。

## 示例

```js
const pages = new UIPageControl();
pages.numberOfPages = 5;
pages.allowsContinuousInteraction = false;
```

**效果**：按住这排点左右拖没有反应，点一下可以翻到相邻的一页。**未在模拟器验证。**

## 对应的 iOS API

`UIPageControl.allowsContinuousInteraction`。

## 参见

- [`interactionState`](interactionstate.md)
