---
type: reference
native: "-[UILayoutGuide init]"
---

# `UILayoutGuide()` 构造函数

**`UILayoutGuide()`** 构造函数创建一个 layout guide：一个只参与布局、不显示的矩形。

## 语法

```
new UILayoutGuide()
```

### 参数

无。

### 返回值

新建的 `UILayoutGuide`。它还不属于任何视图，[`owningView`](owningview.md) 是 `null`。要先用视图的 [`addLayoutGuide()`](../ui-view/addlayoutguide.md) 加到一个视图上，才能和它建约束。

### 异常

**`TypeError`**

`UILayoutGuide` 不能被继承：`class X extends UILayoutGuide {}` 之后 `new X()` 抛错，见[原生类](../native-classes.md)。

## 示例

```js
const card = new UIView();
const guide = new UILayoutGuide();
card.addLayoutGuide(guide);
console.log(guide.owningView === card);
```

**结果**：输出 `true`。

## 对应的 iOS API

`[[UILayoutGuide alloc] init]`。

## 参见

- [`addLayoutGuide()`](../ui-view/addlayoutguide.md)
