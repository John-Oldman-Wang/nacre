---
type: reference
native: UINavigationController.hidesBarsOnSwipe
---

# `UINavigationController`：`hidesBarsOnSwipe` 属性

**`hidesBarsOnSwipe`** 属性决定往上划页面时自动藏起导航条和工具条。

## 值

布尔值。

| 取值 | 效果 |
| --- | --- |
| `true` | 往上划页面，导航条和工具条藏起来；往下划，它们再出现。**未在模拟器验证** |
| `false` | 不自动藏起 |

- 可读，可写。
- 默认值是 `false`。
- 藏和显示由 [`barHideOnSwipeGestureRecognizer`](barhideonswipegesturerecognizer.md) 这个手势驱动。
- 导航条被系统藏起来时不派发事件，读 [`isNavigationBarHidden`](isnavigationbarhidden.md) 能知道它此刻藏没藏。这一项本身只会被代码改变。

### 写错时

不抛异常。写入的值照 JS 的真假转换：`0`、`''`、`null`、`undefined` 得到 `false`，其余得到 `true`。

## 示例

```js
const nav = new UINavigationController(new UIViewController());
nav.hidesBarsOnSwipe = true;
console.log(nav.hidesBarsOnSwipe);
```

**效果**：控制台输出 `true`。之后往上划页面，导航条藏起来。**藏起的效果未在模拟器验证。**

## 对应的 iOS API

`UINavigationController.hidesBarsOnSwipe`。

## 参见

- [`hidesBarsOnSwipe`](hidesbarsonswipe.md)、[`hidesBarsOnTap`](hidesbarsontap.md)、[`hidesBarsWhenKeyboardAppears`](hidesbarswhenkeyboardappears.md)、[`hidesBarsWhenVerticallyCompact`](hidesbarswhenverticallycompact.md)：其他几种自动藏起导航条的方式
- [`isNavigationBarHidden`](isnavigationbarhidden.md)：导航条此刻藏没藏
