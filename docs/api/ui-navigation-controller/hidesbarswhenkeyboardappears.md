---
type: reference
native: UINavigationController.hidesBarsWhenKeyboardAppears
---

# `UINavigationController`：`hidesBarsWhenKeyboardAppears` 属性

**`hidesBarsWhenKeyboardAppears`** 属性决定键盘出现时自动藏起导航条和工具条。

## 值

布尔值。

| 取值 | 效果 |
| --- | --- |
| `true` | 页面里的输入框弹出键盘时，导航条和工具条藏起来。**未在模拟器验证** |
| `false` | 键盘出现不影响导航条 |

- 可读，可写。
- 默认值是 `false`。
- 导航条被系统藏起来时不派发事件，读 [`isNavigationBarHidden`](isnavigationbarhidden.md) 能知道它此刻藏没藏。这一项本身只会被代码改变。

### 写错时

不抛异常。写入的值照 JS 的真假转换：`0`、`''`、`null`、`undefined` 得到 `false`，其余得到 `true`。

## 示例

```js
const nav = new UINavigationController(new UIViewController());
nav.hidesBarsWhenKeyboardAppears = true;
console.log(nav.hidesBarsWhenKeyboardAppears);
```

**效果**：控制台输出 `true`。之后键盘出现时导航条藏起来。**藏起的效果未在模拟器验证。**

## 对应的 iOS API

`UINavigationController.hidesBarsWhenKeyboardAppears`。

## 参见

- [`hidesBarsOnSwipe`](hidesbarsonswipe.md)、[`hidesBarsOnTap`](hidesbarsontap.md)、[`hidesBarsWhenKeyboardAppears`](hidesbarswhenkeyboardappears.md)、[`hidesBarsWhenVerticallyCompact`](hidesbarswhenverticallycompact.md)：其他几种自动藏起导航条的方式
- [`isNavigationBarHidden`](isnavigationbarhidden.md)：导航条此刻藏没藏
