---
type: reference
native: UINavigationController.toolbarHidden
---

# `UINavigationController`：`isToolbarHidden` 属性

**`isToolbarHidden`** 属性决定屏幕底部的工具条藏不藏。工具条是导航控制器自己管的那一条，见 [`toolbar`](toolbar.md)。

## 值

布尔值。

| 取值 | 效果 |
| --- | --- |
| `true` | 工具条藏起来 |
| `false` | 屏幕底部显示工具条。**未在模拟器验证** |

- 可读，可写。
- 默认值是 `true`：新建的导航控制器没有工具条。
- 写入时没有动画。要动画用 [`setToolbarHidden()`](settoolbarhidden.md)。
- 变化时不派发事件。代码改它不需要通知；打开了 [`hidesBarsOnSwipe`](hidesbarsonswipe.md) 这一类时，系统也会藏起工具条，那时同样没有事件。

### 写错时

不抛异常。写入的值照 JS 的真假转换：`0`、`''`、`null`、`undefined` 得到 `false`，其余得到 `true`。

## 示例

```js
const nav = new UINavigationController(new UIViewController());
nav.isToolbarHidden = false;
console.log(nav.isToolbarHidden);
```

**效果**：屏幕底部出现工具条。控制台输出 `false`。**工具条出现的效果未在模拟器验证。**

## 对应的 iOS API

`UINavigationController.toolbarHidden`。JS 里叫 `isToolbarHidden`。

## 参见

- [`setToolbarHidden()`](settoolbarhidden.md)
- [`toolbar`](toolbar.md)
