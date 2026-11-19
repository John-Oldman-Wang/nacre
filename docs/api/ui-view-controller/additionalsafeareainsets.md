---
type: reference
native: UIViewController.additionalSafeAreaInsets
---

# `UIViewController`：`additionalSafeAreaInsets` 属性

**`additionalSafeAreaInsets`** 属性是在系统的安全区之外，这个页面再让出的边距。「安全区」是屏幕上不被刘海、状态栏、底部横条遮挡的区域。父页面在子页面上面盖了东西（比如自己画的一排标签按钮）时，用它告诉子页面这一截不能放内容。

## 值

[`UIEdgeInsets`](../structs.md)，四边的单位都是 [pt](../units.md)。

- 可读，可写。
- 默认值是四边都是 0。
- 写入之后这个页面的 `view.safeAreaInsets` 和 `safeAreaLayoutGuide` 跟着变。
- 页面还没显示到屏幕上时，`view.safeAreaInsets` 读到的四边都是 0，写了这个属性也一样。页面显示出来、布局过一次之后才是对的（实测）。约束到 `safeAreaLayoutGuide` 的内容不受影响，它会在布局时自动到位。
- 变化时不派发事件：它只能被 App 的代码修改。

### 写错时

- 给的不是对象：抛 `TypeError: additionalSafeAreaInsets needs an object with all of: top, left, bottom, right`。
- 缺字段，或字段转不出有限的数：抛 `TypeError: additionalSafeAreaInsets is missing bottom, or it is not a finite number`。

## 示例

```js
const panel = new UIViewController();
panel.additionalSafeAreaInsets = new UIEdgeInsets(0, 0, 44, 0);

const label = new UILabel();
label.text = '贴着安全区的底边';
label.translatesAutoresizingMaskIntoConstraints = false;
panel.view.addSubview(label);
const safe = panel.view.safeAreaLayoutGuide;
NSLayoutConstraint.activateConstraints([
  label.centerXAnchor.constraintEqualToAnchor(safe.centerXAnchor),
  label.bottomAnchor.constraintEqualToAnchor(safe.bottomAnchor, { constant: -8 }),
]);
```

**效果**：`panel` 显示出来后，它的安全区底边比它的视图底边高 44 pt。那行字的底边离 `panel` 的视图底边 52 pt（44 加上约束里的 8），下面空出来的 44 pt 留给父页面盖东西。

## 对应的 iOS API

`UIViewController.additionalSafeAreaInsets`。`UIEdgeInsetsMake(0, 0, 44, 0)` 写成 `new UIEdgeInsets(0, 0, 44, 0)`。

## 参见

- [结构体](../structs.md)：`UIEdgeInsets`
- [Auto Layout](../auto-layout.md)：`safeAreaLayoutGuide`
