---
type: reference
native: UINavigationController.hidesBarsWhenVerticallyCompact
---

# `UINavigationController`：`hidesBarsWhenVerticallyCompact` 属性

**`hidesBarsWhenVerticallyCompact`** 属性决定屏幕高度紧张时自动藏起导航条和工具条。高度紧张指的是外观特征里竖直方向是 `compact`，比如 iPhone 横过来的时候。

## 值

布尔值。

| 取值 | 效果 |
| --- | --- |
| `true` | 高度紧张时导航条和工具条藏起来，高度恢复时再出现。**未在模拟器验证** |
| `false` | 不因屏幕高度藏起 |

- 可读，可写。
- 默认值是 `false`。
- 导航条被系统藏起来时不派发事件，读 [`isNavigationBarHidden`](isnavigationbarhidden.md) 能知道它此刻藏没藏。这一项本身只会被代码改变。

### 写错时

不抛异常。写入的值照 JS 的真假转换：`0`、`''`、`null`、`undefined` 得到 `false`，其余得到 `true`。

## 示例

```js
const nav = new UINavigationController(new UIViewController());
nav.hidesBarsWhenVerticallyCompact = true;
console.log(nav.hidesBarsWhenVerticallyCompact);
```

**效果**：控制台输出 `true`。**藏起的效果未在模拟器验证。**

## 对应的 iOS API

`UINavigationController.hidesBarsWhenVerticallyCompact`。

## 参见

- [`hidesBarsOnSwipe`](hidesbarsonswipe.md)、[`hidesBarsOnTap`](hidesbarsontap.md)、[`hidesBarsWhenKeyboardAppears`](hidesbarswhenkeyboardappears.md)、[`hidesBarsWhenVerticallyCompact`](hidesbarswhenverticallycompact.md)：其他几种自动藏起导航条的方式
- [`isNavigationBarHidden`](isnavigationbarhidden.md)：导航条此刻藏没藏
