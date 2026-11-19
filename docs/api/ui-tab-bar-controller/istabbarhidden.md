---
type: reference
native: UITabBarController.tabBarHidden
---

# `UITabBarController`：`isTabBarHidden` 属性

**`isTabBarHidden`** 属性决定标签栏藏不藏。

## 值

布尔值。

| 取值 | 效果 |
| --- | --- |
| `true` | 标签栏藏起来 |
| `false` | 显示 |

- 可读，可写。
- 默认值是 `false`。
- 写入时没有动画，标签栏立刻消失或出现。要动画用 [`setTabBarHidden()`](settabbarhidden.md)。
- 变化时不派发事件：它只会被代码改变。

## 示例

```js
const tabs = new UITabBarController();
tabs.isTabBarHidden = true;
console.log(tabs.isTabBarHidden);
```

**效果**：标签栏立刻消失。控制台输出 `true`。

## 对应的 iOS API

`UITabBarController.tabBarHidden`。JS 里叫 `isTabBarHidden`。

## 参见

- [`setTabBarHidden()`](settabbarhidden.md)
