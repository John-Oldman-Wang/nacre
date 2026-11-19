---
type: reference
native: UIWindow.rootViewController
---

# `UIWindow`：`rootViewController` 属性

**`rootViewController`** 属性是窗口的根页面。窗口显示的是它的 `view`，它是窗口内容的唯一入口。

## 值

[`UIViewController`](../ui-view-controller.md)，或者 `null`。

- 可读，可写。
- 默认值是 `null`：窗口没有内容，屏幕是黑的，不报错。**未在模拟器验证。**
- 读出来的是写进去的同一个对象，可以用 `===` 比较。
- 给它赋一个新页面，屏幕内容换成新页面，没有过渡动画。**未在模拟器验证。**
- 原来的根页面不再由窗口保管。没有变量保存它时，它和它的视图被回收。**未在模拟器验证。**
- 写 `null` 清空窗口的内容。**未在模拟器验证。**
- 窗口还没放进场景时访问它抛 `TypeError: rootViewController: this object is not connected to a scene yet, so no native object exists`。
- 变化时不派发事件：它只会被 App 自己的赋值改变。

换根页面适用于整个界面切换的场合，比如从登录界面换成主界面。需要带返回按钮的页面跳转时，用 [`UINavigationController`](../ui-navigation-controller.md) 做根页面；临时盖一个页面用[模态呈现](../ui-view-controller.md#模态呈现)。

### 写错时

- 写入的原生对象不是页面：抛 `TypeError: rootViewController needs a UIViewController or null`。
- 写入的不是原生对象（字符串、数字、普通对象）：抛 `TypeError: rootViewController needs a native object or null, got "home"`（`got` 后面是收到的值）。

出错时属性保持原值。

## 示例

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const next = new UIViewController();
  next.view.backgroundColor = 'systemBlue';
  win.rootViewController = next;
  console.log(win.rootViewController === next);
});
```

**效果**：屏幕显示蓝色的 `next`。控制台输出 `true`。

## 对应的 iOS API

`UIWindow.rootViewController`。

## 参见

- [`UIViewController`](../ui-view-controller.md)
