---
type: reference
native: UIViewController.view
---

# `UIViewController`：`view` 属性

**`view`** 属性是页面的根视图。这一屏的界面内容都放在它里面。

## 值

[`UIView`](../ui-view.md)。

- 只读。给它赋值抛 `TypeError`。
- 永远有值。
- **第一次读取时才创建。** `new UIViewController()` 之后还没有视图，第一次读 `page.view` 时系统才创建它。之后每次读到的是同一个对象。任何时候都可以往里加内容，包括页面显示之前。
- **大小由系统决定。** 页面是窗口的根页面时，`view` 占满整个窗口；在导航栈里、被模态呈现时，由导航控制器和系统设定。不需要自己设 `frame`。只有自己加的子控制器，它的 `view` 的位置和大小由 App 的代码给出。
- **不能换成别的视图。** 要用滚动视图做一屏的内容，把滚动视图加成 `page.view` 的子视图并让它铺满。
- **默认没有底色，是透明的。** 根页面不设底色时屏幕是黑的；模态页不设底色时能透过它看到下面的内容。**两条都未在模拟器验证。**
- **页面还没显示时，大小和安全区不是最终值。** 实测：还没进窗口的页面，`view.safeAreaInsets` 四边都是 0 pt。用约束定位的内容不受影响，布局时自动到位。

## 示例

```js
const page = new UIViewController();
page.view.backgroundColor = 'systemBackground';

const label = new UILabel();
label.text = '你好';
label.translatesAutoresizingMaskIntoConstraints = false;
page.view.addSubview(label);

const safe = page.view.safeAreaLayoutGuide;
NSLayoutConstraint.activateConstraints([
  label.topAnchor.constraintEqualToAnchor(safe.topAnchor, { constant: 16 }),
  label.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor, { constant: 16 }),
]);
console.log(page.view === page.view);
```

**效果**

- 页面显示出来时，左上角出现「你好」两个字，距离安全区的上边和左边各 16 [pt](../units.md)。
- 页面底色在浅色模式下是白色，在深色模式下是黑色。
- 控制台输出 `true`。

## 对应的 iOS API

`UIViewController.view`。ObjC 里可以写 `view`，这里只读。

## 参见

- [页面和视图](../ui-view-controller.md#页面和视图)
- [`UIView`](../ui-view.md)
- [Auto Layout](../auto-layout.md)：`safeAreaLayoutGuide` 的用法
