---
type: reference
native: "-[UIView bringSubviewToFront:]"
---

# `UIView`：`bringSubviewToFront()` 方法

**`bringSubviewToFront()`** 方法把一个子视图调到最上层。

## 语法

```
bringSubviewToFront(view)
```

### 参数

**`view`**

调用者的一个子视图。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

参数不是视图（别的原生对象、`null`、数字，或者没传）：`bringSubviewToFront needs a UIView`。

`view` 不是调用者的子视图时的结果，**未在模拟器验证**。

## 示例

```js
const page = new UIView();
const a = new UIView();
a.frame = new CGRect(40, 300, 120, 120);
a.backgroundColor = 'systemRed';
const b = new UIView();
b.frame = new CGRect(100, 360, 120, 120);
b.backgroundColor = 'systemBlue';
page.addSubview(a);
page.addSubview(b);

page.bringSubviewToFront(a);
console.log(page.subviews[1] === a);
```

**效果**：重叠的地方变成显示红色。控制台输出 `true`。屏幕上的效果**未在模拟器验证**。

## 对应的 iOS API

`-[UIView bringSubviewToFront:]`。

## 参见

- [`sendSubviewToBack()`](sendsubviewtoback.md)
- [`insertSubview()`](insertsubview.md)
- [调整叠放顺序](../../guides/views.md#调整叠放顺序)
