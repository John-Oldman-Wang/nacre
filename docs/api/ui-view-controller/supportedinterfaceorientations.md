---
type: reference
native: UIViewController.supportedInterfaceOrientations
---

# `UIViewController`：`supportedInterfaceOrientations` 属性

**`supportedInterfaceOrientations`** 属性是这个页面允许界面转到哪些方向。

## 值

方向名的数组。

| 名字 | 方向 |
| --- | --- |
| `'portrait'` | 竖着，底部横条在下 |
| `'portraitUpsideDown'` | 倒竖着 |
| `'landscapeLeft'` | 横着，手机的顶部朝右 |
| `'landscapeRight'` | 横着，手机的顶部朝左 |
| `'landscape'` | 两种横屏的合称 |
| `'all'` | 四个方向的合称 |
| `'allButUpsideDown'` | 除了倒竖的三个方向 |

- 可读，可写。读出来是单个方向的名字，合称会拆开。
- 不写时是系统的默认值。在 iPhone Air 模拟器（iOS 27.2）上，默认四个方向都允许。
- 写入后运行时马上通知系统重新来问，系统按新的值决定要不要转。
- App 最多允许哪些方向由 `nacre.config.json` 的 [`ios.orientations`](../../guides/project-config.md#声明-app-允许的方向) 决定；这里是在那个范围里再收窄。两者没有交集时，系统会报错。
- 页面在导航控制器里时，系统问的是导航控制器，要设在导航控制器上（实测：窗口的根页面是导航控制器时，设在它上面，转屏的请求按它的值被允许或拒绝）。标签控制器的情况**未在模拟器验证**。

只有用 `new UIViewController()`、`new UINavigationController()`、`new UITabBarController()` 建的页面能写。系统的页面（弹窗、分享面板、选图、拍照）不能写，写了抛 `TypeError`：原生开发时也改不了它们的这一项。

### 写错时

数组里有一个不认识的名字，或者是空数组，整次写入不生效，打一条警告，值保持原样：

```
supportedInterfaceOrientations has no value "sideways"; expected one of: portrait / portraitUpsideDown / landscapeLeft / landscapeRight / landscape / all / allButUpsideDown
```

写的不是数组，抛 `TypeError`：`supportedInterfaceOrientations needs an array of orientation names`。

## 示例

```js
const page = new UIViewController();
page.supportedInterfaceOrientations = ['portrait', 'landscape'];
console.log(page.supportedInterfaceOrientations.join(','));
```

**结果**：输出 `portrait,landscapeLeft,landscapeRight`。

## 对应的 iOS API

`UIViewController.supportedInterfaceOrientations`。原生里它是只读的，要在子类里覆写；这里直接写。

## 参见

- [`requestGeometryUpdateWithPreferences()`](../ui-window-scene/requestgeometryupdatewithpreferences.md)：主动转到某个方向
- [`geometrychange`](../ui-window-scene/geometrychange-event.md)：方向变了
