---
type: reference
native: "-[UIViewController presentViewController:animated:completion:]"
---

# `UIViewController`：`presentViewController()` 方法

**`presentViewController()`** 方法把另一个页面模态呈现出来，盖在当前页面上面。

## 语法

```
presentViewController(viewController)
presentViewController(viewController, { animated })
```

### 参数

**`viewController`**

要弹出的页面，`UIViewController`。呈现的样式和动画由**这个页面**上的 [`modalPresentationStyle`](modalpresentationstyle.md) 和 [`modalTransitionStyle`](modaltransitionstyle.md) 决定，要在调用之前设好。

**`options.animated`**

布尔值，可选。`true`：有进入动画。`false` 或省略：直接出现。按 `Boolean()` 转换。

### 返回值

`Promise<boolean>`。进入动画结束后兑现为 `true`。

调用之后 [`presentedViewController`](presentedviewcontroller.md) 立刻就是被弹出的页面，不用等 Promise 兑现。

### 异常

**`TypeError`**

第一个参数是还没有绑定场景的窗口（`new UIWindow()` 不传参数得到的对象）：`presentViewController: UIWindow has no native object yet, so it cannot be passed as an argument`。

下面几种情况的结果**未在模拟器验证**，不要依赖它：

- 第一个参数传别的值（`null`、数字、普通对象、不是页面的原生对象）。
- 被弹出的页面已经显示在别处，比如它是窗口的根页面，或者已经被弹出。
- 这个页面已经弹出了一个模态页，还没关闭就再弹一个。

## 说明

- 弹出期间被弹出的页面由调用者保管，不需要为了让它存活而保存变量。
- 同一个页面同一时刻只能弹出一个模态页。要在模态页上面再盖一层，在那个模态页上调 `presentViewController()`。**这种写法未在模拟器验证。**
- 页面在导航栈里时，系统把呈现交给导航控制器，见 [`presentingViewController`](presentingviewcontroller.md)。

## 示例

```js
const page = new UIViewController();
const sheet = new UIViewController();
sheet.view.backgroundColor = 'systemBackground';

async function openSheet() {
  await page.presentViewController(sheet, { animated: true });
  console.log(page.presentedViewController === sheet);
}
openSheet();
```

**效果**：`page` 是窗口的根页面时，`sheet` 从屏幕底部向上滑入，盖在 `page` 上面。动画结束后控制台输出 `true`。

## 对应的 iOS API

`-[UIViewController presentViewController:animated:completion:]`。`completion` 回调换成返回的 Promise。

## 参见

- [`dismissViewController()`](dismissviewcontroller.md)
- [模态呈现](../ui-view-controller.md#模态呈现)
- [弹出一个模态页](../../guides/modal-pages.md)
