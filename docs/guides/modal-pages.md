# 弹出一个模态页

这一篇讲怎么把一个页面模态呈现出来、怎么关掉它、怎么知道用户把它拖走了。模态呈现是把一个新页面盖在当前页面上面，用来临时打断当前的事，比如「登录」「新建」。用到的方法和事件都在 [`UIViewController`](../api/ui-view-controller.md) 上。

## 推荐的做法

- **新页面是一件独立的事、做完或取消后回到原处时，用模态呈现；新页面是当前内容的下一层、用户会想「返回」时，用[导航栈](../api/ui-navigation-controller.md)。** 两者的区别见[模态呈现](../api/ui-view-controller.md#模态呈现)。
- **把「打开一个模态页」写成一个函数，每次调用新建一个页面。** 弹出期间它由呈现者保管；关闭之后没有变量保存它，它和它的视图、按钮、监听一起被回收。下一次打开是一个新的页面，不会带着上一次的输入内容。
- **代码关闭和用户拖走走同一段收尾。** 代码关闭不派发 [`dismiss`](../api/ui-view-controller/dismiss-event.md)，用户拖走不经过你的按钮回调。只写其中一处，另一条途径就没有收尾。写法见[模态页的打开和关闭怎么组织](#模态页的打开和关闭怎么组织)。
- **结果用数据传回。** 模态页要把结果交给外面时，把值作为回调的参数传出去，不让外面去读模态页上的视图。

另一种写法是建一个模态页，保存起来反复弹出。它适用于重建代价大、或者要保留上一次状态的页面。代价是这个页面关闭之后仍然占着内存。

## 第一个模态页

从空白 App 开始，做两个页面。第一个页面上有一个「打开」按钮，点了以后第二个页面从底部弹出。第二个页面上有一个「关闭」按钮。

```js
application.addEventListener('sceneconnect', (e) => {
  // 建窗口和页面。每个 App 都要有这几行
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 1. 创建第二个页面。这时它还没有显示
  const sheet = new UIViewController();
  sheet.view.backgroundColor = 'systemBackground';
  sheet.modalPresentationStyle = 'pageSheet';

  // 2. 在第二个页面正中放一个「关闭」按钮
  const close = UIButton.buttonWithType('system');
  close.setTitle('关闭', { forState: ['normal'] });
  close.translatesAutoresizingMaskIntoConstraints = false;
  sheet.view.addSubview(close);
  NSLayoutConstraint.activateConstraints([
    close.centerXAnchor.constraintEqualToAnchor(sheet.view.centerXAnchor),
    close.centerYAnchor.constraintEqualToAnchor(sheet.view.centerYAnchor),
  ]);

  // 3. 点「关闭」时，关掉第二个页面
  close.addEventListener('click', () => {
    sheet.dismissViewController({ animated: true });
  });

  // 4. 在第一个页面正中放一个「打开」按钮
  const open = UIButton.buttonWithType('system');
  open.setTitle('打开', { forState: ['normal'] });
  open.translatesAutoresizingMaskIntoConstraints = false;
  page.view.addSubview(open);
  NSLayoutConstraint.activateConstraints([
    open.centerXAnchor.constraintEqualToAnchor(page.view.centerXAnchor),
    open.centerYAnchor.constraintEqualToAnchor(page.view.centerYAnchor),
  ]);

  // 5. 点「打开」时，把第二个页面弹出来
  open.addEventListener('click', async () => {
    await page.presentViewController(sheet, { animated: true });
    console.log('第二个页面已经完全显示');
  });
});
```

**效果**

- 启动后屏幕正中是蓝色的「打开」两个字。
- 点「打开」，第二个页面从屏幕底部向上滑入，以卡片的形式盖在第一个页面上面。
- 滑入动画结束后，控制台输出 `第二个页面已经完全显示`。
- 点「关闭」，卡片向下滑出，回到第一个页面。
- 不点「关闭」，按住卡片向下拖，也能把它关掉。

这段代码没有作为一个整体在模拟器运行过。其中用到的每个 API 都在验收用例里运行过。

这个例子在一开始就建好 `sheet` 并一直引用它，所以它关闭之后不会被回收，再点「打开」弹出的是同一个页面。下面的例子沿用这里的 `page` 和 `sheet`。单独试某一节时，先写这几行：

```js
const page = new UIViewController();
const sheet = new UIViewController();
```

## 等弹出动画结束

[`presentViewController()`](../api/ui-view-controller/presentviewcontroller.md) 返回 Promise，弹出动画结束后兑现。

```js
async function openSheet() {
  await page.presentViewController(sheet, { animated: true });
  console.log(page.presentedViewController === sheet);
}
```

**效果**：调 `openSheet()`，`sheet` 从屏幕底部向上滑入，盖在 `page` 上面。动画结束后控制台输出 `true`。

`animated` 省略时是 `false`：页面直接出现，没有滑入动画。

## 关闭模态页

在被弹出的那个页面上调 [`dismissViewController()`](../api/ui-view-controller/dismissviewcontroller.md)。它也返回 Promise，关闭动画结束后兑现。

```js
async function closeSheet() {
  await sheet.dismissViewController({ animated: true });
  console.log(page.presentedViewController);
}
```

**效果**：`sheet` 向下滑出屏幕，露出 `page`。动画结束后控制台输出 `null`。

> **注意**：用代码关闭时，不派发 `beforedismiss`、`dismiss` 等任何事件。清理工作要写在调 `dismissViewController()` 的地方。

## 不让用户下拉关闭

卡片式的模态页默认可以被用户向下拖走。填了一半的表单不希望这样被关掉时，设 [`isModalInPresentation`](../api/ui-view-controller/ismodalinpresentation.md)。

```js
sheet.isModalInPresentation = true;
sheet.addEventListener('dismissattempt', () => {
  console.log('用户想关闭，但被拦住了');
});
```

**效果**：用户向下拖卡片，卡片不会关闭，控制台每次输出一行。只能通过页面上的按钮关闭。

这个属性可以在页面弹出之后随时改，比如表单被修改后设成 `true`，保存后设回 `false`。

## 知道模态页被用户拖走了

用户向下拖走卡片时，App 的代码没有调过 `dismissViewController()`，所以没有 Promise 可以等。要得知这件事，监听被弹出页面上的 [`dismiss`](../api/ui-view-controller/dismiss-event.md)。

```js
sheet.addEventListener('beforedismiss', () => {
  console.log('即将关闭');
});
sheet.addEventListener('dismiss', () => {
  console.log('已经关闭');
});
```

**效果**：用户把卡片向下拖走，控制台依次输出 `即将关闭`、`已经关闭`。

用户拖到一半又放回去时，卡片没有关闭，`dismiss` 不派发；这时 `beforedismiss` 是否派发**未在模拟器验证**。所以收尾工作写在 `dismiss` 里，不写在 `beforedismiss` 里。

## 模态页的打开和关闭怎么组织

把「打开一个模态页」写成一个函数：每次调用新建一个页面，关闭之后的收尾写成一个只执行一次的函数，代码关闭和用户拖走都调它。

```js
/**
 * @param {UIViewController} host
 * @param {() => void} onClosed
 */
function openEditor(host, onClosed) {
  const editor = new UIViewController();
  editor.view.backgroundColor = 'systemBackground';
  editor.modalPresentationStyle = 'pageSheet';

  // 收尾只执行一次，不管页面是怎样关闭的
  let closed = false;
  function finish() {
    if (closed) return;
    closed = true;
    onClosed();
  }

  // 途径一：用户向下拖走
  editor.addEventListener('dismiss', finish);

  // 途径二：点「完成」，由代码关闭
  const done = UIButton.buttonWithType('system');
  done.setTitle('完成', { forState: ['normal'] });
  done.translatesAutoresizingMaskIntoConstraints = false;
  editor.view.addSubview(done);
  NSLayoutConstraint.activateConstraints([
    done.centerXAnchor.constraintEqualToAnchor(editor.view.centerXAnchor),
    done.centerYAnchor.constraintEqualToAnchor(editor.view.centerYAnchor),
  ]);
  done.addEventListener('click', async () => {
    await editor.dismissViewController({ animated: true });
    finish();
  });

  return host.presentViewController(editor, { animated: true });
}

openEditor(page, () => {
  console.log('编辑页关闭了');
});
```

**效果**：一张卡片从底部滑入，正中有「完成」两个字。点「完成」或者把卡片向下拖走，卡片关闭，控制台都输出一行 `编辑页关闭了`。**这段代码没有作为一个整体在模拟器运行过。**

`editor` 是函数里的局部变量，不用保存。

## 全屏呈现

默认的呈现方式是卡片。要让模态页占满整个屏幕，在弹出之前设 [`modalPresentationStyle`](../api/ui-view-controller/modalpresentationstyle.md)。

```js
sheet.modalPresentationStyle = 'fullScreen';
page.presentViewController(sheet, { animated: true });
```

**效果**：`sheet` 从底部滑入，占满整个屏幕，完全盖住 `page`。**未在模拟器验证。**

全屏的模态页用户不能向下拖走，所以页面上必须有一个关闭按钮，否则用户没有办法离开这个页面。

## 换一种进出动画

```js
sheet.modalTransitionStyle = 'crossDissolve';
page.presentViewController(sheet, { animated: true });
```

**效果**：`sheet` 不从底部滑入，而是原地淡入。关闭时淡出。**未在模拟器验证。**

各种取值见 [`modalTransitionStyle`](../api/ui-view-controller/modaltransitionstyle.md)。

## 参见

- [`UIViewController`](../api/ui-view-controller.md)：页面的全部成员
- [做一个页面](pages.md)
- [弹出提示框和菜单](alerts.md)：系统弹窗也是一种模态页
- [`UINavigationController`](../api/ui-navigation-controller.md)：另一种显示新页面的方式
