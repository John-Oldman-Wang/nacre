# `UIWindow`

视图树的**根**，也是事件分发的入口。它是 `UIView` 的子类，但有特殊地位：直接挂在场景上。

布局不在这一层——window 的 frame 由系统跟随场景的几何设定，真正写布局是在 `UIViewController` 和 `UIView` 里。

## 继承关系

```
EventTarget
└─ UIResponder
   └─ UIView
      └─ UIWindow
```

## 构造

**`scene` 参数可选**，两种用法：

```js
const win = new UIWindow(scene);   // 参数齐全 → 立刻创建原生对象
```

```js
const win = new UIWindow();        // JS 对象先存在，原生对象还没建
win.windowScene = scene;           // ← 这时才创建
```

后者让「构造」和「绑定」解耦。**没有发明新 API**：`windowScene` 本来就是 ObjC 的可写属性，而且「没有 scene 的 window」在 ObjC 里本来就是合法状态（它是 nullable）——我们只是把「首次有了 scene」当作创建原生对象的时机。

原生对象还没创建时，除 `windowScene`（返回 `null`）外的所有访问都抛 `TypeError`。与其返回一个编出来的值，不如直接报错。

> 只暴露 `initWithWindowScene:` 这条路。`init` 和 `initWithFrame:` 在 iOS 26 已废弃，不包进来。

## 让窗口显示出来：四步缺一不可

```js
const win = new UIWindow(scene);         // 1. 自动进入 scene.windows，但 hidden = YES
win.rootViewController = vc;             // 2. 不设就没内容
win.makeKeyAndVisible();                 // 3. ★ 没这步屏幕全黑
mainWindow = win;                        // 4. 必须保持引用，见下
```

第 3 步最容易漏——前三步做完所有属性看着都对，但程序创建的 `UIWindow` 默认 `hidden = YES`，`makeKeyAndVisible` 才翻过来。这一点实测验证过：注释掉它，window 已绑定场景、已在 `scene.windows` 里、`rootViewController` 也设了，屏幕依然全黑。

第 4 步是 JS 侧的要求：**window 是 JS 创建的，JS 就是所有者**。包装对象被 GC 后运行时会 `CFRelease`，所以必须留一个引用。这和系统给的 `UIWindowScene` 相反——那个由系统持有。

## 实例属性

| 属性 | 类型 | 说明 | 状态 |
| --- | --- | --- | --- |
| `windowScene` | [`UIWindowScene`](ui-window-scene.md)，**可写** | 换 scene 就是换显示目标。典型 App 一绑到死；需要改的场景是把窗口移到外接显示器（`setScreen:` 废弃后的替代品就是它）。首次赋值还兼做创建原生对象的触发点 | 已实现 |
| `rootViewController` | `UIViewController`，**可写** | 窗口唯一的内容入口，默认 `null` | 已实现 |
| `windowLevel` | number，**可写** | 多窗口的叠放顺序，默认 0。键盘、alert 都是 level 更高的窗口 | 已实现 |
| `isKeyWindow` | boolean | | 已实现 |
| `canBecomeKeyWindow` | boolean | | 已实现 |
| `screen` | | 要 `UIScreen` 类 | 待做 |
| 从 `UIView` 继承的一切 | | `backgroundColor`、`frame`、`addSubview` 等 | 待做 |

## 实例方法

| 方法 | 说明 | 状态 |
| --- | --- | --- |
| `makeKeyAndVisible()` | 成为 key 并显示出来 | 已实现 |
| `makeKeyWindow()` | 只成为 key，不改可见性 | 已实现 |
| `convertPoint/Rect(...)` | 坐标转换，要结构体支持 | 待做 |
| `sendEvent(...)` | 底层事件分发，**不打算暴露** | 不做 |

> `becomeKeyWindow` / `resignKeyWindow` **不暴露**：它们在 ObjC 里不是命令而是**通知方法**——系统调它们告诉窗口「你成为/失去了 key」，子类可以重写。要主动成为 key 用 `makeKeyWindow()`。

## 事件

`UIWindow` 继承 `EventTarget`。四个事件对应 `isKeyWindow` 和 `isHidden` 的变化：

| 事件 | 什么时候 |
| --- | --- |
| `becomekey` | 成为 key window（开始接收键盘等输入） |
| `resignkey` | 不再是 key window |
| `becomevisible` | 变为可见 |
| `becomehidden` | 变为隐藏 |

```js
win.addEventListener('becomekey', (e) => {
  console.log(e.target.isKeyWindow);   // true
});
win.makeKeyAndVisible();               // 先 becomevisible，后 becomekey
```

按[原则 10](../project.md#原则)，`isKeyWindow` 和 `isHidden` 可读，就必须有变化通知——否则 JS 只能轮询，而我们连定时器都没有，等于完全不可观测。

**事件名为什么不照搬场景那边的风格。** 场景用的是状态名（`active`、`foreground`…），因为 `activationState` 本来就是个枚举，状态名现成；窗口这边 key 和 visible 是两个独立的布尔，没有状态名可用，所以用动作名。

**读到的是「此刻」的值，不是事件发生那一刻的值。** 原生通知派发到 JS 时刻意延后了一轮（避免在 UIKit 操作中途重入 JS）。实测 `makeKeyAndVisible()` 之后，`becomevisible` 的回调里 `isKeyWindow` 已经是 `true`——因为那一刻 `becomekey` 也已经发生过。这类事件 `cancelable` 一律是 `false`，原因见[项目说明的事件模型](../project.md)。

> 监听器要在 `makeKeyAndVisible()` **之前**注册，否则事件已经发过了。

## `scene.windows` 里不只有你的窗口

键盘、alert 这些系统浮层也是独立的 `UIWindow`（level 更高）。所以不能假设 `scene.windows[0]` 就是自己建的那个，要自己记住引用。

---

← 返回 [API 总览](README.md) ・ [`UIWindowScene`](ui-window-scene.md)
