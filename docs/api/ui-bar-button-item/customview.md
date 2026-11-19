---
type: reference
native: UIBarButtonItem.customView
---

# `UIBarButtonItem`：`customView` 属性

**`customView`** 属性是代替系统画的按钮显示在导航条上的视图。

## 值

[`UIView`](../ui-view.md)，或者 `null`。

- 可读，可写。
- 默认值是 `null`，按钮由系统画。
- 设了视图之后，画什么完全由这个视图决定，[`title`](../ui-bar-item/title.md)、[`image`](../ui-bar-item/image.md)、[`style`](style.md) 不再起作用。
- 用户点它时是否派发 [`click`](click-event.md)，**未在模拟器验证**。要响应点击，把一个 [`UIButton`](../ui-button.md) 当作 `customView`，在那个按钮上监听。
- 变化时不派发事件：它只会被代码改变。

### 写错时

写入的不是视图：抛 `TypeError: customView needs a UIView or null`。

## 示例

```js
const page = new UIViewController();
const badge = new UILabel();
badge.text = '草稿';
badge.textColor = 'systemOrange';

const item = new UIBarButtonItem({ customView: badge });
page.navigationItem.rightBarButtonItems = [item];
console.log(item.customView === badge);
```

**结果**：控制台输出 `true`。页面在导航栈顶时，导航条右侧显示橙色的「草稿」，**样子未在模拟器验证**。

## 对应的 iOS API

`UIBarButtonItem.customView`，以及 `-[UIBarButtonItem initWithCustomView:]`（这里写成构造参数 `{ customView }`）。

## 参见

- [`UIBarButtonItem()`](constructor.md)
- [`titleView`](../ui-navigation-item/titleview.md)：把自己的视图放在导航条正中
