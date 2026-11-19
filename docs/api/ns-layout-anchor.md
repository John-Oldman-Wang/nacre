---
type: reference
native: NSLayoutAnchor
---

# `NSLayoutAnchor`

**`NSLayoutAnchor`** 表示视图上一个可以被约束引用的位置或尺寸，叫锚点：一条边、一条中心线、文字的基线、宽或高。约束（[`NSLayoutConstraint`](auto-layout.md)）从锚点上创建，写的是两个锚点之间的关系。

`NSLayoutAnchor` 是三个锚点类的基类，自己不会出现。实际拿到的锚点是 [`NSLayoutXAxisAnchor`](ns-layout-x-axis-anchor.md)（水平位置）、[`NSLayoutYAxisAnchor`](ns-layout-y-axis-anchor.md)（垂直位置）或 [`NSLayoutDimension`](ns-layout-dimension.md)（尺寸）。这一页的三个方法三个类都有。锚点没有属性。

**继承关系**：`EventTarget` → `NSObject` → `NSLayoutAnchor`

怎么用锚点建约束，见指南[用约束排版](../guides/auto-layout.md)。

## 构造函数

不能用 `new` 创建。锚点从视图或 [`UILayoutGuide`](ui-layout-guide.md) 的属性上读，比如 [`view.leadingAnchor`](ui-view/leadinganchor.md)。`new` 抛 `TypeError: Illegal constructor: NSLayoutAnchor is created by the runtime, not by new`，其中的类名是实际的类名。锚点类也不能被继承。

## 实例方法

三个方法对应三种关系，都**返回一条新的 `NSLayoutConstraint`，它还没有激活**：

| 方法 | 得到的约束 |
| --- | --- |
| [`constraintEqualToAnchor()`](ns-layout-anchor/constraintequaltoanchor.md) | 这个锚点 = `other` + `constant` |
| [`constraintGreaterThanOrEqualToAnchor()`](ns-layout-anchor/constraintgreaterthanorequaltoanchor.md) | 这个锚点 ≥ `other` + `constant` |
| [`constraintLessThanOrEqualToAnchor()`](ns-layout-anchor/constraintlessthanorequaltoanchor.md) | 这个锚点 ≤ `other` + `constant` |

## 事件

锚点不派发事件。

## 概念

锚点是视图上可以被约束引用的位置或尺寸。每个锚点是视图的一个只读属性：

```
                 centerXAnchor
                       ┆
           ┌───────────┆───────────┐ ← topAnchor
           │           ┆           │
           │   第一行文字 ┄┄┄┄┄┄┄┄┄┄│ ← firstBaselineAnchor
centerY ┄┄┄│┄┄┄┄┄┄┄┄┄┄┄┼┄┄┄┄┄┄┄┄┄┄┄│
Anchor     │   最后一行 ┄┄┄┄┄┄┄┄┄┄┄│ ← lastBaselineAnchor
           │           ┆           │
           └───────────┆───────────┘ ← bottomAnchor
           ↑                       ↑
     leadingAnchor           trailingAnchor
     (leftAnchor)            (rightAnchor)

           ├────── widthAnchor ────┤     heightAnchor 是上边到下边的距离
```

锚点分三种类型，对应三个类：

| 类 | 包含的锚点 | 能和什么建约束 |
| --- | --- | --- |
| [`NSLayoutXAxisAnchor`](ns-layout-x-axis-anchor.md)（水平位置） | `leadingAnchor`、`trailingAnchor`、`leftAnchor`、`rightAnchor`、`centerXAnchor` | 另一个水平位置 |
| [`NSLayoutYAxisAnchor`](ns-layout-y-axis-anchor.md)（垂直位置） | `topAnchor`、`bottomAnchor`、`centerYAnchor`、`firstBaselineAnchor`、`lastBaselineAnchor` | 另一个垂直位置 |
| [`NSLayoutDimension`](ns-layout-dimension.md)（尺寸） | `widthAnchor`、`heightAnchor` | 另一个尺寸，或者一个常数 |

### 三种类型之间不能建约束

上边不能和左边对齐，宽度不能和上边相等。但宽和高是同一种类型，可以互相约束，[保持宽高比](../guides/auto-layout.md#保持宽高比)就是这样写的。

类型不对时，TypeScript 在编辑器里报错。运行时抛 `TypeError`：

```js
const card = new UIView();
try {
  // @ts-expect-error 垂直位置不能和水平位置建约束
  card.topAnchor.constraintEqualToAnchor(card.leadingAnchor);
} catch (err) {
  console.log(String(err));
}
```

**效果**：控制台输出 `TypeError: NSLayoutYAxisAnchor cannot be constrained to NSLayoutXAxisAnchor: their units are not compatible`。

### `leading` / `trailing` 和 `left` / `right`

`leading` 是文字开始的那一边，`trailing` 是文字结束的那一边。在中文、英文这类从左往右书写的语言里，`leading` 是左，`trailing` 是右。系统语言是阿拉伯语、希伯来语这类从右往左书写的语言时，两者对调，整个界面左右镜像。`left` 和 `right` 永远是屏幕的左和右。

平常用 `leading` / `trailing`，界面在从右往左的语言里会自动镜像。只有内容确实和书写方向无关时才用 `left` / `right`。从右往左的语言里对调的行为**未在模拟器验证**。

`leading` / `trailing` 和 `left` / `right` 不要在同一条约束里混用。

### 基线

**基线**（baseline）是一行文字里字母底部所在的那条线。`firstBaselineAnchor` 是第一行文字的基线，`lastBaselineAnchor` 是最后一行的。两个字号不同的标签并排时，对齐基线之后两段文字的底部在同一条线上，对齐上下边则不在。

### 锚点从哪里来

锚点不能自己构造，只能从视图或 `UILayoutGuide` 上读。同一个视图的同一个锚点，每次读到的是同一个对象：`card.topAnchor === card.topAnchor` 是 `true`。

### 只保存锚点或约束就够了

代码里只保存了锚点、没有保存视图时，锚点照样能用。只保存了约束时，约束两端的锚点和视图也都还在。不需要为了让约束有效而另外保存视图。

## 示例

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const box = new UIView();
  box.backgroundColor = 'systemGreen';
  box.translatesAutoresizingMaskIntoConstraints = false;
  page.view.addSubview(box);

  const safe = page.view.safeAreaLayoutGuide;
  NSLayoutConstraint.activateConstraints([
    box.topAnchor.constraintEqualToAnchor(safe.topAnchor, { constant: 12 }),
    box.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor, { constant: 16 }),
    box.trailingAnchor.constraintEqualToAnchor(safe.trailingAnchor, { constant: -16 }),
    box.heightAnchor.constraintEqualToConstant(44),
  ]);
});
```

**效果**：一条绿色横条在安全区顶部，离顶边 12 pt，左右各离安全区 16 pt，高 44 pt。左右边距和固定高度的写法在验收用例里断言过，对齐顶边的那一条**未在模拟器验证**。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[a.leadingAnchor constraintEqualToAnchor:b.trailingAnchor]` | `a.leadingAnchor.constraintEqualToAnchor(b.trailingAnchor)` |
| `[a.topAnchor constraintEqualToAnchor:b.bottomAnchor constant:8]` | `a.topAnchor.constraintEqualToAnchor(b.bottomAnchor, { constant: 8 })` |
| `[a.topAnchor constraintGreaterThanOrEqualToAnchor:b.bottomAnchor constant:8]` | `a.topAnchor.constraintGreaterThanOrEqualToAnchor(b.bottomAnchor, { constant: 8 })` |

## 参见

- [`NSLayoutConstraint`](auto-layout.md)：方法返回的约束
- [`NSLayoutXAxisAnchor`](ns-layout-x-axis-anchor.md)、[`NSLayoutYAxisAnchor`](ns-layout-y-axis-anchor.md)、[`NSLayoutDimension`](ns-layout-dimension.md)：三种锚点各自多出的方法
- [用约束排版](../guides/auto-layout.md)
