---
type: reference
native: UINavigationController.navigationBarHidden
---

# `UINavigationController`：`isNavigationBarHidden` 属性

**`isNavigationBarHidden`** 属性决定导航条藏不藏。

## 值

布尔值。

| 取值 | 效果 |
| --- | --- |
| `true` | 导航条藏起来，页面的内容占满原来导航条的位置。没有返回按钮 |
| `false` | 显示导航条 |

- 可读，可写。
- 默认值是 `false`。
- 写入时没有动画，导航条立刻消失或出现。要动画用 [`setNavigationBarHidden()`](setnavigationbarhidden.md)。
- 导航条藏起之后左滑返回是否还能用，**未在模拟器验证**。
- 变化时不派发事件：它只会被代码改变。

## 示例

```js
const nav = new UINavigationController(new UIViewController());
nav.isNavigationBarHidden = true;
console.log(nav.isNavigationBarHidden);
```

**结果**：导航条立刻消失。控制台输出 `true`。

## 对应的 iOS API

`UINavigationController.navigationBarHidden`。JS 里叫 `isNavigationBarHidden`。

## 参见

- [`setNavigationBarHidden()`](setnavigationbarhidden.md)
