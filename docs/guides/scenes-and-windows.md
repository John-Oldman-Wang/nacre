# 建窗口和处理场景

这一篇讲 App 的界面从哪里开始：等系统交来场景（[`UIWindowScene`](../api/ui-window-scene.md)），在场景上建窗口（[`UIWindow`](../api/ui-window.md)），以及场景被系统销毁、又重新接入时界面怎么办。

## 推荐的做法

- **建界面的代码都写在 [`sceneconnect`](../api/application/sceneconnect-event.md) 的回调里。** `main.js` 执行时场景还不存在。在顶层做不依赖场景的事：注册监听器、准备数据、发网络请求。
- **不要把场景、窗口、页面保存到 `sceneconnect` 的回调外面。** 运行时已经在保管它们：场景在的时候它们不会被回收，场景被销毁时它们一起被回收。保存在外面的不会被回收，而它们已经不再显示。
- **要保存的是数据。** 把「用户正在看什么」记成数据放在回调外面，每次 `sceneconnect` 都按这份数据从头建一遍界面。这样有两个好处：系统销毁场景时，界面占用的内存确实还了回去，App 在后台占用的内存越少，越不容易被系统整个结束；第一次启动和场景重建走的是同一段代码，不用区分「这是第一次」还是「这是回来了」。
- **回调里的代码要能重复执行。** 场景被系统销毁后，系统会创建新的场景并再派发一次 `sceneconnect`。

```js
// 界面的状态存成数据。场景被销毁时它还在
const state = { title: '首页', visits: 0 };

/** @param {{ title: string, visits: number }} s */
function buildPage(s) {
  const page = new UIViewController();
  page.title = s.title;
  page.view.backgroundColor = 'systemBackground';
  return page;
}

application.addEventListener('sceneconnect', (e) => {
  state.visits += 1;
  const win = new UIWindow(e.scene);
  win.rootViewController = buildPage(state);
  win.makeKeyAndVisible();
});
```

**效果**：App 启动后显示页面。之后场景每被销毁并重建一次，这段回调再执行一次，按 `state` 里的数据重新建出界面，`state.visits` 加一。

重建一个页面的代价很大时，可以把页面对象保存在回调外面，场景重建后把它放进新窗口。比如页面里有一张加载好的网页，或者用户填到一半的长表单。代价是这个页面和它的所有视图一直占着内存。把旧页面放进新窗口后能否正常显示，**未在模拟器验证**。

## 第一个窗口

从空白 App 开始，让屏幕上出现一个窗口和一个有底色的页面。每个 App 都以这几行开头。

```js
// 1. 等系统把场景交过来
application.addEventListener('sceneconnect', (e) => {
  // 2. 在这个场景里建一个窗口
  const win = new UIWindow(e.scene);

  // 3. 建一个页面
  const page = new UIViewController();

  // 4. 给页面设底色
  page.view.backgroundColor = 'systemBackground';

  // 5. 把页面设为窗口的根页面
  win.rootViewController = page;

  // 6. 显示窗口
  win.makeKeyAndVisible();
});
```

**效果**

- 屏幕从黑色变成系统背景色：浅色模式下是白色，深色模式下是黑色。
- 屏幕上没有其他内容。之后的界面都加在 `page.view` 上。

六步各自的作用，以及少了会怎样：

| 步骤 | 作用 | 少了会怎样 |
| --- | --- | --- |
| 1. 监听 `sceneconnect` | 拿到场景。`main.js` 开始执行时场景还没有接入，`application.scenes` 是空数组 | 没有场景，窗口无法创建 |
| 2. `new UIWindow(e.scene)` | 创建窗口并放进场景。此时窗口是隐藏的，`win.isHidden` 是 `true` | 没有窗口，后面几步都没有对象可用 |
| 3. `new UIViewController()` | 创建一个页面。页面管理一整屏的内容，它的 `view` 属性是这一屏的根视图 | 窗口没有内容可以显示 |
| 4. 设 `backgroundColor` | 给页面的根视图设底色。`'systemBackground'` 是系统背景色，会跟随深色模式变化，见[颜色](../api/ui-color.md) | 页面的根视图是透明的，屏幕仍然是黑的。**未在模拟器验证** |
| 5. 设 `rootViewController` | 把页面交给窗口。根页面是窗口内容的唯一入口，窗口显示的就是它的 `view` | 窗口没有内容，屏幕是黑的。不报错。**未在模拟器验证** |
| 6. `makeKeyAndVisible()` | 显示窗口，并让它成为 [key window](../api/ui-window.md#key-window) | 屏幕全黑。前五步都做对了也一样。不报错 |

> **注意**：第 6 步最容易漏。漏了之后窗口已经在场景里，`rootViewController` 也读得到，`win.isHidden` 是 `true`，屏幕是黑的，没有任何报错。

回调结束后，`win` 和 `page` 两个局部变量不再存在，窗口继续显示。

## 为什么要等 `sceneconnect`

App 启动的顺序是：执行 `main.js` → 系统创建场景并交给 App。所以在 `main.js` 的顶层读 `application.scenes`，得到的是空数组。

```js
console.log(application.scenes.length);

application.addEventListener('sceneconnect', (e) => {
  console.log(application.scenes[0] === e.scene);
});
```

**效果**：第一行输出 `0`。场景接入后，回调里输出 `true`。

在 `main.js` 的顶层注册监听器，一定来得及收到这个事件。不要在顶层读 `application.scenes[0]`：读到的是 `undefined`。

## 数据放在哪里

数据放在哪里，决定它能保留到什么时候：

| 放在哪里 | 场景被销毁后 | App 被系统结束后 |
| --- | --- | --- |
| 回调外面的 JS 变量 | 还在 | 没有了 |
| [`scene.session.userInfo`](../api/ui-scene-session/userinfo.md) | 还在 | 还在。**未在模拟器验证** |
| [`application.storage`](../api/storage.md) | 还在 | 还在 |

## 记住这个场景上次在看什么

每个场景有一个会话对象 [`UISceneSession`](../api/ui-scene-session.md)，通过 `scene.session` 拿到。它的 `userInfo` 用来存放 App 自己的数据。

```js
application.addEventListener('sceneconnect', (e) => {
  const session = e.scene.session;

  // 读上次存的数据
  const info = session.userInfo;
  if (info && info.kind === 'mailDetail') {
    console.log('上次在看邮件', info.mailId);
  } else {
    console.log('没有记录，显示首页');
  }

  // 存这次的数据
  session.userInfo = { kind: 'mailDetail', mailId: 42 };
});
```

**效果**：写入之后在同一次运行里读 `session.userInfo`，读到写入的内容。场景断开再接入、App 被终止后重新打开，`userInfo` 是否还在，**未在模拟器验证**。

## 知道 App 进了后台和回到了前台

「进后台」指用户按 Home 回到桌面，或者切到别的 App。此时界面不再显示，系统随后可能暂停 App 的代码。

```js
application.addEventListener('sceneconnect', (e) => {
  const scene = e.scene;
  scene.addEventListener('inactive', () => {
    console.log('即将离开前台，保存数据');
  });
  scene.addEventListener('background', () => {
    console.log('已经在后台');
  });
  scene.addEventListener('foreground', () => {
    console.log('即将回到前台');
  });
  scene.addEventListener('active', () => {
    console.log('可以交互了，刷新数据');
  });
});
```

**效果**

- 用户按 Home，控制台先输出 `即将离开前台，保存数据`，再输出 `已经在后台`。
- 用户从桌面切回 App，控制台先输出 `即将回到前台`，再输出 `可以交互了，刷新数据`。

两组各自的先后顺序在场景上**未在模拟器验证**。`inactive` 不只在进后台时派发：下拉通知中心、来电这类临时打断也会让场景失去活跃，这时只有 `inactive`，没有 `background`（**未在模拟器验证**）。四个事件见 [`UIWindowScene`](../api/ui-window-scene.md#事件)。

## 在窗口显示出来时执行代码

监听窗口的事件。监听器要在 `makeKeyAndVisible()` 之前注册。

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  win.rootViewController = new UIViewController();

  win.addEventListener('becomevisible', () => {
    console.log('窗口显示了，isHidden =', win.isHidden);
  });
  win.addEventListener('becomekey', () => {
    console.log('窗口成为 key window，isKeyWindow =', win.isKeyWindow);
  });

  win.makeKeyAndVisible();
});
```

**效果**

- 控制台先输出 `窗口显示了，isHidden = false`。
- 然后输出 `窗口成为 key window，isKeyWindow = true`。

> **注意**：如果先调 `makeKeyAndVisible()` 再注册监听器，这两个事件已经派发过了，回调不会执行。

## 先建窗口，之后再放进场景

构造时不传场景，之后给 [`windowScene`](../api/ui-window/windowscene.md) 赋值。

```js
application.addEventListener('sceneconnect', (e) => {
  const later = new UIWindow();
  console.log(later.windowScene);

  later.windowScene = e.scene;
  console.log(later.windowScene === e.scene);
});
```

**效果**

- 控制台依次输出 `null`、`true`。
- 给 `windowScene` 赋值之前，`later` 只是一个 JS 对象，除 `windowScene` 外的成员访问就抛 `TypeError`，见 [`UIWindow()`](../api/ui-window/constructor.md)。
- 赋值之后，`later` 和用 `new UIWindow(e.scene)` 建出来的窗口用法相同。

推荐用 `new UIWindow(e.scene)`：在 `sceneconnect` 的回调里场景总是拿得到的。

## 换掉窗口里的整个页面

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const login = new UIViewController();
  win.rootViewController = login;
  win.makeKeyAndVisible();

  // 登录完成之后
  const main = new UIViewController();
  main.view.backgroundColor = 'systemBlue';
  win.rootViewController = main;
});
```

**效果**：屏幕内容从原来的页面换成蓝色的新页面，没有过渡动画。**未在模拟器验证。**

原来的根页面不再由窗口保管，没有变量保存它时被回收。换根页面适用于整个界面切换的场合，比如从登录界面换成主界面。需要带返回按钮的页面跳转时，用 [`UINavigationController`](../api/ui-navigation-controller.md) 做根页面；临时盖一个页面用[模态呈现](modal-pages.md)。

## 隐藏窗口

窗口是视图，用视图的 `isHidden` 属性。

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  win.rootViewController = new UIViewController();
  win.makeKeyAndVisible();

  win.addEventListener('becomehidden', () => {
    console.log('窗口隐藏了');
  });
  win.isHidden = true;
});
```

**效果**：窗口和里面的所有内容从屏幕上消失，控制台输出 `窗口隐藏了`。把 `isHidden` 设回 `false` 重新显示，派发 `becomevisible`。**这个例子未在模拟器验证。**

## 让一个窗口显示在另一个窗口上面

要有一层内容始终盖在所有页面之上，包括模态弹出的页面，比如全局的提示条，就在同一个场景里再建一个窗口。[`windowLevel`](../api/ui-window/windowlevel.md) 大的显示在上面。

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  win.rootViewController = new UIViewController();
  win.makeKeyAndVisible();

  const overlay = new UIWindow(e.scene);
  const overlayPage = new UIViewController();
  overlay.rootViewController = overlayPage;
  overlay.windowLevel = 1;
  overlay.isHidden = false;
});
```

**效果**

- `overlay` 显示在 `win` 上面。`win` 的 `windowLevel` 是默认值 `0`。
- `overlayPage.view` 没有设底色，所以透过它能看到下面的 `win`。
- 这里用 `isHidden = false` 而不是 `makeKeyAndVisible()`，所以 `win` 仍然是 key window。

**这个例子未在模拟器验证。**

场景上列出全部窗口的属性还没有提供。窗口都是 App 的代码创建的，需要时在创建时自己记下来；不记下来窗口也不会消失。

## 参见

- [`UIWindowScene`](../api/ui-window-scene.md)：场景的全部成员
- [`UIWindow`](../api/ui-window.md)：窗口的全部成员
- [`UISceneSession`](../api/ui-scene-session.md)：场景的会话
- [`application`](../api/application.md)：`sceneconnect` / `scenedisconnect` 事件
- [做一个页面](pages.md)
