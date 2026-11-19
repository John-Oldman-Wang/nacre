---
type: reference
native: UIPageControl.interactionState
---

# `UIPageControl`：`interactionState` 属性

**`interactionState`** 属性表示最近一次换页是怎么换的：点了一下，还是按住拖过去的。

## 值

字符串，下面三个之一：

| 取值 | 含义 |
| --- | --- |
| `'none'` | 还没有被用户操作过 |
| `'discrete'` | 用户点了一下，换了一页 |
| `'continuous'` | 用户按住这排点拖着换的页 |

- 只读。给它赋值抛 `TypeError`。
- 默认值是 `'none'`。
- 在 [`change`](../ui-control/change-event.md) 的回调里读。拖着换页时一次会经过好几页，可以据此决定内容要不要带动画地滚过去。
- 用户操作之后的取值**未在模拟器验证**。

## 示例

```js
const pages = new UIPageControl();
pages.numberOfPages = 5;
pages.addEventListener('change', () => {
  const animated = pages.interactionState !== 'continuous';
  console.log('第', pages.currentPage, '页，带动画：', animated);
});
```

**效果**：点一下换页时输出「带动画： true」；按住拖着换页时输出「带动画： false」。**未在模拟器验证。**

## 对应的 iOS API

`UIPageControl.interactionState`。`UIPageControlInteractionStateDiscrete` 写成 `'discrete'`，其余同理。

## 参见

- [`allowsContinuousInteraction`](allowscontinuousinteraction.md)：关掉拖着翻页
