---
type: reference
native: UIWindow.windowLevel
---

# `UIWindow`：`windowLevel` 属性

**`windowLevel`** 属性是同一场景里多个窗口的上下顺序。数值大的显示在上面。

## 值

数，表示层级，没有单位。

- 可读，可写。
- 默认值是 `0`。
- 系统键盘和系统弹窗所在的窗口层级更高。只有一个窗口时不需要设。
- 写入时按 `Number()` 转换。
- 变化时不派发事件：它只会被 App 自己的赋值改变。

同一个场景里可以建多个窗口。它适用于一种情况：要有一层内容始终盖在所有页面之上，包括模态弹出的页面，比如全局的提示条。多个窗口的行为**未在模拟器验证**：验收用例只有一个显示的窗口。

### 写错时

转不出有限的数：抛 `TypeError: windowLevel must be a finite number, got "top"`（`got` 后面是收到的值），原值不变。

## 示例

```js
application.addEventListener('sceneconnect', (e) => {
  const overlay = new UIWindow(e.scene);
  overlay.rootViewController = new UIViewController();
  overlay.windowLevel = 1;
  overlay.isHidden = false;
});
```

**效果**：`overlay` 显示在 `windowLevel` 是 `0` 的窗口上面。它的根视图没有设底色，所以透过它能看到下面的窗口。这里用 `isHidden = false` 而不是 `makeKeyAndVisible()`，所以原来的 key window 不变。**未在模拟器验证。**

## 对应的 iOS API

`UIWindow.windowLevel`。`UIWindowLevelNormal` 写成 `0`。

## 参见

- [`makeKeyWindow()`](makekeywindow.md)
