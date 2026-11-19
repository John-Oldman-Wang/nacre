---
type: reference
native: UIKeyboardLayoutGuide
---

# `UIKeyboardLayoutGuide`

**`UIKeyboardLayoutGuide`** 表示键盘所占区域的 layout guide。每个视图有一个，从 [`view.keyboardLayoutGuide`](ui-view/keyboardlayoutguide.md) 读。

键盘收起时，它的上边在安全区的底边；键盘弹出时，它的上边在键盘的顶边。把内容的底边约束到它的 `topAnchor`，一条约束同时适用于两种情况，不需要监听键盘事件，也不需要计算键盘的高度。

**继承关系**：`EventTarget` → `NSObject` → [`UILayoutGuide`](ui-layout-guide.md) → `UITrackingLayoutGuide` → `UIKeyboardLayoutGuide`

`UITrackingLayoutGuide` 没有自己的成员。键盘和输入框一起怎么用，见[输入框和键盘](ui-text-field.md)。

## 构造函数

不能用 `new` 创建。从视图的 [`keyboardLayoutGuide`](ui-view/keyboardlayoutguide.md) 读。

## 实例属性

还继承 [`UILayoutGuide`](ui-layout-guide.md) 的属性：锚点、`layoutFrame`、`owningView`、`identifier`。

| 属性 | 说明 |
| --- | --- |
| [`followsUndockedKeyboard`](ui-keyboard-layout-guide/followsundockedkeyboard.md) | 键盘离开屏幕底部时是否还跟随它。只和 iPad 的浮动、拆分键盘有关 |
| [`keyboardDismissPadding`](ui-keyboard-layout-guide/keyboarddismisspadding.md) | 用户拖动收起键盘时，手指离键盘顶边多远就开始收起，pt |

两个属性的读写和默认值在验收用例里断言过。它们对界面的实际影响**未在模拟器验证**。

## 事件

不派发事件。

## 示例

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const bar = new UIView();
  bar.backgroundColor = 'systemGreen';
  bar.translatesAutoresizingMaskIntoConstraints = false;
  page.view.addSubview(bar);

  const safe = page.view.safeAreaLayoutGuide;
  NSLayoutConstraint.activateConstraints([
    bar.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor, { constant: 16 }),
    bar.trailingAnchor.constraintEqualToAnchor(safe.trailingAnchor, { constant: -16 }),
    bar.heightAnchor.constraintEqualToConstant(44),
    bar.bottomAnchor.constraintEqualToAnchor(
      page.view.keyboardLayoutGuide.topAnchor, { constant: -16 }),
  ]);
});
```

**效果**

- 没有键盘时，`bar` 在安全区底边上方 16 pt。这一条在验收用例里断言过。
- 页面上的输入框获得焦点、键盘弹出时，`bar` 跟着键盘一起上移，停在键盘上方 16 pt。键盘收起时它回到原位。键盘弹出时的位置**未在模拟器验证**。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `view.keyboardLayoutGuide.topAnchor` | `view.keyboardLayoutGuide.topAnchor` |
| `guide.followsUndockedKeyboard = YES` | `guide.followsUndockedKeyboard = true` |

## 参见

- [`UILayoutGuide`](ui-layout-guide.md)
- [输入框和键盘](ui-text-field.md)
- [跟随键盘](../guides/auto-layout.md#跟随键盘)
