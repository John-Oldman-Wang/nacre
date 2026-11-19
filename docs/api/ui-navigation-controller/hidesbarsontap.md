---
type: reference
native: UINavigationController.hidesBarsOnTap
---

# `UINavigationController`：`hidesBarsOnTap` 属性

**`hidesBarsOnTap`** 属性决定点一下页面就切换导航条和工具条的显示。

## 值

布尔值。

| 取值 | 效果 |
| --- | --- |
| `true` | 点一下页面，导航条和工具条藏起来；再点一下，它们再出现。**未在模拟器验证** |
| `false` | 点页面不影响导航条 |

- 可读，可写。
- 默认值是 `false`。
- 切换由 [`barHideOnTapGestureRecognizer`](barhideontapgesturerecognizer.md) 这个手势驱动。
- 导航条被系统藏起来时不派发事件，读 [`isNavigationBarHidden`](isnavigationbarhidden.md) 能知道它此刻藏没藏。这一项本身只会被代码改变。

### 写错时

不抛异常。写入的值照 JS 的真假转换：`0`、`''`、`null`、`undefined` 得到 `false`，其余得到 `true`。

## 示例

```js
const nav = new UINavigationController(new UIViewController());
nav.hidesBarsOnTap = true;
console.log(nav.hidesBarsOnTap);
```

**效果**：控制台输出 `true`。之后点一下页面，导航条藏起来。**藏起的效果未在模拟器验证。**

## 对应的 iOS API

`UINavigationController.hidesBarsOnTap`。

## 参见

- [`hidesBarsOnSwipe`](hidesbarsonswipe.md)、[`hidesBarsOnTap`](hidesbarsontap.md)、[`hidesBarsWhenKeyboardAppears`](hidesbarswhenkeyboardappears.md)、[`hidesBarsWhenVerticallyCompact`](hidesbarswhenverticallycompact.md)：其他几种自动藏起导航条的方式
- [`isNavigationBarHidden`](isnavigationbarhidden.md)：导航条此刻藏没藏
