# 分享内容

这一篇讲怎么用系统的分享面板 [`UIActivityViewController`](../api/ui-activity-view-controller.md) 把文字、链接、图片交给别的 App 或系统动作，以及怎么知道用户分享了没有。

## 推荐的做法

- **每次分享新建一个面板。** 要分享的东西在创建时给，之后不能换。同一个面板弹第二次会怎样**未在模拟器验证**。
- **分享网页时给 [`URL`](../api/url.md) 对象，不要给网址的字符串。** 给字符串，接收方拿到的是一段文字；给 `URL`，接收方知道它是一个链接，「添加到阅读列表」这类只认链接的动作才会出现。**未在模拟器验证。**
- **文字和链接可以一起给。** 接收方各取所需：信息 App 两样都放进去，「拷贝」只拷其中一样。各个去处具体怎么取**未在模拟器验证**。
- **不需要知道结果就不用监听 [`complete`](../api/ui-activity-view-controller/complete-event.md)。** 面板不依赖监听器工作，结束时自己关掉。

## 第一个分享面板

从空白 App 开始，在页面上放一个按钮，点它弹出分享面板。

```js
application.addEventListener('sceneconnect', (e) => {
  // 建窗口和页面。每个 App 都要有这几行
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const button = UIButton.buttonWithType('system');
  button.setTitle('分享', { forState: ['normal'] });
  button.frame = new CGRect(40, 120, 200, 44);
  page.view.addSubview(button);

  button.addEventListener('click', () => {
    // 1. 建面板，交给它一段文字和一个链接
    const sheet = new UIActivityViewController([
      '这篇文章不错',
      new URL('https://example.com/article'),
    ]);

    // 2. 面板结束时看结果
    sheet.addEventListener('complete', (event) => {
      const { completed, activityType } = event;
      console.log(completed ? '分享到了 ' + activityType : '没有分享');
    });

    // 3. 从当前页面弹出来
    page.presentViewController(sheet, { animated: true });
  });
});
```

**效果**（**未在模拟器验证**）

- 页面左上方有一个蓝色文字的按钮「分享」。
- 点它，屏幕底部升起系统的分享面板，上面列着可以分享到的 App 和系统动作。
- 点「拷贝」，面板消失，控制台输出 `分享到了 copyToPasteboard`。
- 不选任何一项、把面板向下拖走，控制台输出 `没有分享`。

下面的例子沿用这里的 `page`。单独试某一节时，先写这几行：

```js
const page = new UIViewController();
```

## 分享一张图片

```js
const photo = UIImage.imageNamed('JS/assets/photo');
if (photo !== null) {
  const sheet = new UIActivityViewController([photo]);
  page.presentViewController(sheet, { animated: true });
}
```

**效果**（**未在模拟器验证**）：分享面板里出现「存储图像」等只对图片有效的动作。

[`UIImage.imageNamed()`](../api/ui-image.md) 找不到图片时返回 `null`，所以先判断。

## 不让某些系统动作出现

```js
/** @type {UIActivityViewController} */
const linkSheet = new UIActivityViewController([new URL('https://example.com')]);
linkSheet.excludedActivityTypes = ['print', 'assignToContact', 'addToReadingList'];
page.presentViewController(linkSheet, { animated: true });
```

**效果**（**未在模拟器验证**）：面板里没有「打印」「指定给联系人」「添加到阅读列表」。

能排除的是[系统动作的名字](../api/ui-activity-view-controller.md#系统动作的名字)里列出的那些。第三方 App 的分享扩展排除不了。见 [`excludedActivityTypes`](../api/ui-activity-view-controller/excludedactivitytypes.md)。

## 隐藏顶上那一排联系人

`linkSheet` 是上一节那个分享链接的面板：

```js
const linkSheet = new UIActivityViewController([new URL('https://example.com')]);
linkSheet.excludedActivitySectionTypes = ['peopleSuggestions'];
page.presentViewController(linkSheet, { animated: true });
```

**效果**（**未在模拟器验证**）：面板顶部不再显示系统推荐的联系人。

## 分享完之后做点什么

还是用分享链接的面板 `linkSheet`，弹出之前监听 `complete`：

```js
const linkSheet = new UIActivityViewController([new URL('https://example.com')]);
linkSheet.addEventListener('complete', (result) => {
  if (result.activityError !== null) {
    console.log('分享出错了：' + result.activityError.message);
  } else if (result.completed) {
    console.log('分享完成，去处是 ' + result.activityType);
  }
});
page.presentViewController(linkSheet, { animated: true });
```

**效果**（**未在模拟器验证**）

- 用户完成分享时输出去处的名字。
- 动作失败时输出错误信息。
- 用户直接关掉面板时什么都不输出。

事件对象是 [`UIActivityViewControllerCompletionEvent`](../api/ui-activity-view-controller-completion-event.md)，三个字段直接读。

- **`complete` 之后，分享出去的东西到没到对方手里，App 不知道。** `completed` 是 `true` 只表示那个动作执行完了，比如信息 App 的发送界面被用户点了发送。
- **用代码关掉面板时派不派发 `complete`，未在模拟器验证。** 调 [`dismissViewController()`](../api/ui-view-controller/dismissviewcontroller.md) 之后要做的事，直接写在那一句后面，不依赖这个事件。

## 参见

- [`UIActivityViewController`](../api/ui-activity-view-controller.md)：分享面板的全部成员
- [`UIViewController`](../api/ui-view-controller.md)：弹出和关闭页面
- [`URL`](../api/url.md)、[`UIImage`](../api/ui-image.md)：能分享的东西
- [剪贴板](../api/ui-pasteboard.md)：只想把文字放进剪贴板时不需要分享面板
