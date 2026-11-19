# 让视图动起来

这一篇讲怎么用 [`UIView.animateWithDuration()`](../api/ui-view/animatewithduration.md) 让视图的属性带动画地变化：淡入淡出、移动、缩放、改约束、弹簧效果，以及动画结束后接着做下一件事。参数、选项和出错情况的细节在 [`animateWithDuration()`](../api/ui-view/animatewithduration.md) 的参考页。

## 推荐的做法

- **把改属性的代码放进 `animations` 函数里。** 能带动画的属性有 `alpha`、`frame`、`bounds`、`center`、`transform`、`backgroundColor`。
- **动画结束后要做的事，写在 `await` 后面。** `animateWithDuration()` 返回一个 Promise，动画结束时兑现，不需要回调参数。
- **改约束的动画，在 `animations` 里调 `layoutIfNeeded()`。** 约束的改动本身不带动画。
- 关键帧、沿路径运动、动画组这类更复杂的动画，用 [Core Animation](../api/ca-animation.md)。

## 第一个例子

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const dot = new UIView();
  dot.frame = new CGRect(56, 136, 40, 40);
  dot.backgroundColor = 'systemOrange';
  page.view.addSubview(dot);

  UIView.animateWithDuration(0.3, {
    animations() {
      dot.alpha = 0;
      dot.transform = CGAffineTransform.scale(0.5);
    },
  });
});
```

**效果**：橙色方块在 0.3 秒里一边变透明一边缩小到一半。**屏幕上的样子未在模拟器验证。**

- 第一个参数是动画的时长，单位是秒。
- `animations` 在这次调用里当场执行。调用返回时，`dot.alpha` 读出来已经是 0，屏幕上的变化在之后的 0.3 秒里发生（实测）。

以下各节沿用第一个例子里的 `page` 和 `dot`。另外，`card` 是另一个已经在页面上的视图，`heightConstraint` 是一条已经激活的高度约束，`badge` 是又一个已经在页面上的视图。单独试某一节时，先写这几行：

```js
const page = new UIViewController();
const dot = new UIView();
page.view.addSubview(dot);
const card = new UIView();
card.translatesAutoresizingMaskIntoConstraints = false;
page.view.addSubview(card);
const heightConstraint = card.heightAnchor.constraintEqualToConstant(120);
heightConstraint.isActive = true;
const badge = new UIView();
page.view.addSubview(badge);
```

## 动画结束后做下一件事

`animateWithDuration()` 返回一个 Promise，动画结束时兑现。

```js
async function dismissCard() {
  const finished = await UIView.animateWithDuration(0.3, {
    animations() { card.alpha = 0; },
  });
  if (finished) card.removeFromSuperview();
}
```

**效果**：卡片在 0.3 秒里淡出，淡出结束后从视图树里移除。

- 兑现的值是 `true` 表示动画播完了。
- 动画播到一半被打断时，兑现的值是 `false`。实测对同一个属性再开一个动画，前一个动画以 `false` 兑现。

## 带动画地改约束

改完约束之后，在 `animations` 里调父视图的 `layoutIfNeeded()`。

```js
heightConstraint.constant = 240;
UIView.animateWithDuration(0.25, {
  animations() { page.view.layoutIfNeeded(); },
});
```

**效果**：受这条约束影响的视图在 0.25 秒里移动到新的位置和大小。**未在模拟器验证。**

约束的改动本身不带动画。带动画的是 `layoutIfNeeded()` 引起的 `frame` 变化，所以它要写在 `animations` 里面。

## 做带回弹的动画

同时给 `usingSpringWithDamping` 和 `initialSpringVelocity`，动画按弹簧的方式运动。

```js
UIView.animateWithDuration(0.5, {
  usingSpringWithDamping: 0.6,
  initialSpringVelocity: 0,
  animations() { dot.transform = CGAffineTransform.scale(1.5); },
});
```

**效果**：橙色方块放大到 1.5 倍，超过一点再回来，来回几次后停下。**屏幕上的样子未在模拟器验证。**

`usingSpringWithDamping` 是阻尼，取 0 到 1：1 不回弹，越小回弹越多。

## 个别改动不要动画

在 `animations` 里，大部分改动要动画，个别改动要立刻生效时，把那几行包进 [`UIView.performWithoutAnimation()`](../api/ui-view/performwithoutanimation.md)。

```js
UIView.animateWithDuration(0.3, {
  animations() {
    dot.alpha = 0.5;
    UIView.performWithoutAnimation(() => {
      badge.alpha = 0;
    });
  },
});
```

**效果**：`dot` 在 0.3 秒里变成半透明，`badge` 立刻变成全透明，没有渐变的过程。`badge` 是另一个已经在界面上的视图。实测 `performWithoutAnimation()` 里改的属性生效了，图层上没有因此多出动画。

## 参见

- [`UIView.animateWithDuration()`](../api/ui-view/animatewithduration.md)：全部参数和选项
- [`UIView.performWithoutAnimation()`](../api/ui-view/performwithoutanimation.md)
- [Core Animation](../api/ca-animation.md)：关键帧、沿路径运动、动画组
- [在屏幕上摆放视图](views.md)
