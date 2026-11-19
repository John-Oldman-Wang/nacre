---
type: reference
native: "-[UIView insertSubview:atIndex:]"
---

# `UIView`：`insertSubview()` 方法

**`insertSubview()`** 方法把一个视图加为子视图，并指定它在叠放顺序里的位置。

## 语法

```
insertSubview(view, { atIndex })
insertSubview(view, { belowSubview })
insertSubview(view, { aboveSubview })
```

### 参数

**`view`**

要加入的 `UIView`。

**`options.atIndex`**

放在 [`subviews`](subviews.md) 的第几位。从 0 开始的整数，0 是最下层。按整数转换：`'0'` 得到 0，小数向零取整。

**`options.belowSubview`**

一个子视图。`view` 放在它的下面一层。

**`options.aboveSubview`**

一个子视图。`view` 放在它的上面一层。

三个键选一个。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

- `options` 里三个键都没有：`insertSubview needs one of { atIndex } / { belowSubview } / { aboveSubview }`。
- `atIndex` 转不出有限的数：`atIndex must be a finite number, got NaN`，`got` 后面是收到的值。
- 参数不是视图（别的原生对象、`null`、数字，或者没传）：`insertSubview needs a UIView`。
- 其余情况和 [`addSubview()`](addsubview.md) 相同。

出错时视图树不变。

## 说明

`view` 已经有父视图时，先从原来的父视图里移除。**未在模拟器验证。**

## 示例

```js
const page = new UIView();
const a = new UIView();
a.frame = new CGRect(40, 300, 120, 120);
a.backgroundColor = 'systemRed';
page.addSubview(a);

const c = new UIView();
c.frame = new CGRect(70, 330, 120, 120);
c.backgroundColor = 'systemOrange';
page.insertSubview(c, { belowSubview: a });
console.log(page.subviews[0] === c);
```

**效果**：橙色方块加入到红色方块的下面一层，两者重叠的地方显示红色。控制台输出 `true`。

## 对应的 iOS API

`-[UIView insertSubview:atIndex:]`、`insertSubview:belowSubview:`、`insertSubview:aboveSubview:` 在 JS 里是同一个方法，第二段写成 options 的键。

## 参见

- [`addSubview()`](addsubview.md)
- [`bringSubviewToFront()`](bringsubviewtofront.md)、[`sendSubviewToBack()`](sendsubviewtoback.md)
