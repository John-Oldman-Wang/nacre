---
type: reference
native: "-[UIView addSubview:]"
---

# `UIView`：`addSubview()` 方法

**`addSubview()`** 方法把一个视图加为子视图，排在最后，也就是最上层。

## 语法

```
addSubview(view)
```

### 参数

**`view`**

要加入的 `UIView`。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

- 把视图加成它自己的子视图：`addSubview: raised NSInvalidArgumentException: Can't add self as subview`。
- 参数不是视图（别的原生对象、`null`、数字，或者没传）：`addSubview needs a UIView`。
- 参数是一个还没有绑定场景的窗口（`new UIWindow()` 不传参数得到的对象）：`addSubview:: UIWindow has no native object yet, so it cannot be passed as an argument`。

出错时视图树不变，这个视图之后照常可用。

## 说明

- `view` 已经有父视图时，先从原来的父视图里移除，不会出现在两处。**未在模拟器验证。** 所以要把视图从一个父视图移到另一个，不需要先移除。
- `view` 已经是调用者的子视图时再加一次的结果，**未在模拟器验证**。
- 视图树不能成环。把视图加到它自己的后代上（比如 `dot.addSubview(card)`，而 `dot` 是 `card` 的子视图）会怎样，**未在模拟器验证**。可以先用 [`isDescendantOfView()`](isdescendantofview.md) 判断。
- 加到视图树上之后由父视图保管，不需要保存在变量里，见[视图由谁保管](../../guides/views.md#视图由谁保管)。

## 示例

```js
const card = new UIView();
card.frame = new CGRect(40, 120, 200, 120);
card.backgroundColor = 'systemIndigo';

const dot = new UIView();
dot.frame = new CGRect(16, 16, 40, 40);
dot.backgroundColor = 'systemOrange';
card.addSubview(dot);
```

**效果**：`card` 加到视图树上显示之后，它的左上角里面有一个 40 × 40 pt 的橙色方块，距 `card` 的左边和上边各 16 pt。子视图的坐标相对父视图的左上角。

## 对应的 iOS API

`-[UIView addSubview:]`。

## 参见

- [`insertSubview()`](insertsubview.md)：加到指定的位置
- [`removeFromSuperview()`](removefromsuperview.md)
- [视图树和叠放顺序](../ui-view.md#视图树和叠放顺序)
