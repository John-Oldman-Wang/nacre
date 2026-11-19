---
type: reference
native: UINavigationItem.leftBarButtonItems
---

# `UINavigationItem`：`leftBarButtonItems` 属性

**`leftBarButtonItems`** 属性是导航条左侧的按钮。

## 值

[`UIBarButtonItem`](../ui-bar-button-item.md) 的数组。

- 可读，可写。
- 默认值是空数组。
- 读出来的是当时的一份快照。往数组里 `push` 不会改变导航条，要整个赋值。读到的每个元素和当初放进去的是同一个对象。
- 数组的第一个最靠左，后面的依次往右排。**排列顺序未在模拟器验证。**
- 有按钮时，返回按钮不显示，左滑返回也不能用，见[左侧按钮和返回](../ui-navigation-item.md#左侧按钮和返回)。**未在模拟器验证。**
- 变化时不派发事件：它只会被代码改变。

左侧按钮适合没有上一页的场合，比如模态呈现的页面左上角的「取消」。导航栈里的页面，按钮优先放右侧。

### 写错时

数组里有不是 `UIBarButtonItem` 的东西：抛 `TypeError: bar button items only accept UIBarButtonItem`。原来的按钮不变。

## 示例

```js
const nav = new UINavigationController(new UIViewController());
const page = new UIViewController();
const back = new UIBarButtonItem({ title: '取消' });
back.addEventListener('click', () => {
  nav.popViewController({ animated: true });
});
page.navigationItem.leftBarButtonItems = [back];
nav.pushViewController(page, { animated: false });
```

**效果**：导航条左侧是「取消」，没有系统的返回按钮。点「取消」返回上一页。**未在模拟器验证。**

## 对应的 iOS API

`UINavigationItem.leftBarButtonItems`。单个的 `leftBarButtonItem` 写成只有一个元素的数组。

## 参见

- [`rightBarButtonItems`](rightbarbuttonitems.md)
- [`hidesBackButton`](hidesbackbutton.md)
