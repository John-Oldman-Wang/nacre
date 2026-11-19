---
type: reference
native: UIPageControl.hidesForSinglePage
---

# `UIPageControl`：`hidesForSinglePage` 属性

**`hidesForSinglePage`** 属性决定只有一页时页码是否不显示。

## 值

布尔值。

| 取值 | 效果 |
| --- | --- |
| `true` | [`numberOfPages`](numberofpages.md) 是 1 时不显示。页数改成 2 以上又出现 |
| `false` | 只有一页时也显示一个点 |

- 可读，可写。
- 默认值是 `false`。
- 写入时按 JS 的真假值转换。
- 两种取值在屏幕上的效果**未在模拟器验证**。

## 示例

```js
const pages = new UIPageControl();
pages.hidesForSinglePage = true;
pages.numberOfPages = 1;
```

**效果**：页码不显示。把 `numberOfPages` 改成 2，它又出现。**未在模拟器验证。**

## 对应的 iOS API

`UIPageControl.hidesForSinglePage`。

## 参见

- [`numberOfPages`](numberofpages.md)
