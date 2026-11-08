# `UIWindow`

视图树的**根**，直接挂在场景上。

```js
const win = new UIWindow(scene);
win.rootViewController = vc;
win.makeKeyAndVisible();
```

布局不在这一层——窗口的 `frame` 由系统跟着场景走，真正写布局是在 `UIViewController` 和 [`UIView`](ui-view.md) 里。

## 继承关系

```
EventTarget → NSObject → UIResponder → UIView → UIWindow
```

## 构造

`scene` 参数**可选**，两种用法：

```js
const win = new UIWindow(scene);   // 立刻创建原生对象
```

```js
const win = new UIWindow();        // JS 对象先存在，原生对象还没建
win.windowScene = scene;           // ← 这时才创建
```

原生对象还没建时，除了 `windowScene`（返回 `null`），**其余访问全抛 `TypeError`**：

```js
const lazy = new UIWindow();
lazy.makeKeyAndVisible();   // TypeError: … not connected to a scene yet …
```

> `init` 和 `initWithFrame:` 在 iOS 26 已废弃，没有暴露。只能走 `initWithWindowScene:` 这条路。

## 让窗口显示出来：三步缺一不可

```js
const win = new UIWindow(scene);   // 1. 自动进入 scene.windows，但此时 isHidden = true
win.rootViewController = vc;       // 2. 不设就没内容
win.makeKeyAndVisible();           // 3. ★ 没这步屏幕全黑
```

**第 3 步最容易漏。** 程序创建的窗口默认是隐藏的，前两步做完所有属性看着都对——绑了场景、在 `scene.windows` 里、`rootViewController` 也设了——屏幕依然全黑。

**不用自己保持引用。** 绑定场景的那一刻场景就持有了这个窗口，窗口、根控制器、整棵视图树都不会因为你没留变量而被回收。

## 实例属性

| 属性 | 类型 | 默认值 | 效果 |
| --- | --- | --- | --- |
| `windowScene` | [`UIWindowScene`](ui-window-scene.md) \| `null` 读写 | | 换场景就是换显示目标。首次赋值兼做创建原生对象的时机 |
| `rootViewController` | `UIViewController` \| `null` 读写 | `null` | 窗口唯一的内容入口 |
| `windowLevel` | `number` 读写 | `0` | 多窗口的叠放顺序。键盘、alert 都是 level 更高的窗口 |
| `isKeyWindow` | `boolean` 只读 | | 是不是当前接收键盘输入的窗口 |
| `canBecomeKeyWindow` | `boolean` 只读 | | |

从 [`UIView`](ui-view.md) 继承的成员都能用。

## 实例方法

| 方法 | 效果 |
| --- | --- |
| `makeKeyAndVisible()` | 成为 key 并显示出来 |
| `makeKeyWindow()` | 只成为 key，不改可见性 |

> `becomeKeyWindow` / `resignKeyWindow` **不暴露**：它们在 ObjC 里不是命令而是通知方法——系统调它们告诉窗口「你成为/失去了 key」。要主动成为 key 用 `makeKeyWindow()`。

## 事件

四个事件，对应 `isKeyWindow` 和 `isHidden` 的变化：

| 事件 | 什么时候 |
| --- | --- |
| `becomekey` | 成为 key window（开始接收键盘等输入） |
| `resignkey` | 不再是 key window |
| `becomevisible` | 变为可见 |
| `becomehidden` | 变为隐藏 |

```js
win.addEventListener('becomekey', (e) => {
  e.target.isKeyWindow;   // true
});
win.makeKeyAndVisible();  // 先 becomevisible，后 becomekey
```

两条要注意的：

- **监听器要在 `makeKeyAndVisible()` 之前注册**，否则事件已经发过了
- **回调里读到的是「此刻」的值，不是事件发生那一刻的值。** 实测 `becomevisible` 的回调里 `isKeyWindow` 已经是 `true`——因为那一刻 `becomekey` 也已经发生过了

这些事件的 `cancelable` 都是 `false`，`preventDefault()` 不起作用。

## `scene.windows` 里不只有你的窗口

键盘、alert 这些系统浮层也是独立的 `UIWindow`（level 更高）。**不能假设 `scene.windows[0]` 就是自己建的那个。**

## 和原生的对照

| ObjC | JS |
| --- | --- |
| `[[UIWindow alloc] initWithWindowScene:scene]` | `new UIWindow(scene)` |
| `win.windowScene = scene` | `win.windowScene = scene` |
| `win.rootViewController = vc` | `win.rootViewController = vc` |
| `[win makeKeyAndVisible]` | `win.makeKeyAndVisible()` |
| `win.isKeyWindow` | `win.isKeyWindow` |
| `UIWindowDidBecomeKeyNotification` | `win.addEventListener('becomekey', …)` |
| `UIWindowDidBecomeVisibleNotification` | `win.addEventListener('becomevisible', …)` |

## 还没做

| | |
| --- | --- |
| `screen` | 要 `UIScreen` 类 |
| `sendEvent:` | 底层事件分发，**不打算暴露** |

---

设计理由见[项目说明](../internals/wrapper.md)。

← 返回 [API 文档](README.md) ・ [`UIWindowScene`](ui-window-scene.md)
