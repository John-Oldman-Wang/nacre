---
type: reference
native: UIActivityViewController
status: partial
---

# `UIActivityViewController`

**`UIActivityViewController`** 表示系统的分享面板。App 把要分享的东西（文字、网址、图片）交给它，它从屏幕底部升起来，列出能接收这些东西的去处：别的 App、隔空投送，以及「拷贝」「存到相册」「打印」这类系统动作。用户选一个，系统负责把东西送过去。

面板里出现哪些去处由系统决定，取决于交给它的东西是什么类型、用户装了哪些 App。App 能做的是提供内容，以及排除一部分系统动作。

分享面板是一个[页面](ui-view-controller.md)，用页面的 [`presentViewController()`](ui-view-controller/presentviewcontroller.md) 弹出来。面板结束时派发 [`complete`](ui-activity-view-controller/complete-event.md) 事件，告诉 App 用户有没有分享、选的是哪个去处。

> **注意**：创建、属性的读写和报错在模拟器（iPhone Air，iOS 27.2）的验收里验过。面板在屏幕上的样子、`complete` 事件什么时候来、带什么数据，要有人真的分享一次才验得到，都**未在模拟器验证**。

**继承关系**：`EventTarget` → `NSObject` → `UIResponder` → [`UIViewController`](ui-view-controller.md) → `UIActivityViewController`

怎么弹出分享面板、怎么处理结果，见指南[分享内容](../guides/share.md)。

## 构造函数

[`UIActivityViewController()`](ui-activity-view-controller/constructor.md)

用一组要分享的东西创建分享面板。

## 实例属性

还继承 [`UIViewController`](ui-view-controller.md) 的属性，比如 `title`、`modalPresentationStyle`。

| 属性 | 说明 |
| --- | --- |
| [`excludedActivityTypes`](ui-activity-view-controller/excludedactivitytypes.md) | 不出现在面板里的系统动作 |
| [`excludedActivitySectionTypes`](ui-activity-view-controller/excludedactivitysectiontypes.md) | 整块隐藏的分区，比如顶上那一排推荐的联系人 |
| [`allowsProminentActivity`](ui-activity-view-controller/allowsprominentactivity.md) | 系统能不能把某一个动作放大显示在面板顶部 |

## 实例方法

没有自己的方法。弹出用 [`presentViewController()`](ui-view-controller/presentviewcontroller.md)，用代码关掉用 [`dismissViewController()`](ui-view-controller/dismissviewcontroller.md)，都继承自 [`UIViewController`](ui-view-controller.md)。

## 事件

| 事件 | 什么时候派发 |
| --- | --- |
| [`complete`](ui-activity-view-controller/complete-event.md) | 面板结束了：用户选的动作做完了，或者用户把面板关了 |
| [`beforedismiss`](ui-view-controller/beforedismiss-event.md)、[`dismiss`](ui-view-controller/dismiss-event.md)、[`dismissattempt`](ui-view-controller/dismissattempt-event.md) | 继承自 [`UIViewController`](ui-view-controller.md)：页面的关闭事件 |

监听上表以外的名字不会报错：它被当成自定义事件，只有自己用 `dispatchEvent()` 派发时才会触发。

## 能分享什么

构造时给一个数组，数组里每一项是下面三种之一：

| 给的东西 | 接收方拿到的 |
| --- | --- |
| 字符串 | 一段文字 |
| [`URL`](url.md) 对象 | 一个链接 |
| [`UIImage`](ui-image.md) | 一张图片 |

- 数字、布尔值按字符串处理，`5` 等于 `'5'`。
- 别的东西（`null`、普通对象、视图…）抛 `TypeError`。
- 数组可以是空的，系统不拒绝；这时面板里有什么**未在模拟器验证**。

## 面板什么时候结束

面板有两种结束方式：

- 用户选了一个去处，那个动作做完了（或者失败了）。
- 用户没选，直接把面板关掉：向下拖走，或者点关闭按钮。

两种情况面板都会自己关掉，然后派发一次 `complete`。App 不需要自己关面板。

## 系统动作的名字

`excludedActivityTypes` 里写的、`complete` 事件的 `activityType` 里读到的，是下面这些名字：

| 名字 | 动作 |
| --- | --- |
| `'copyToPasteboard'` | 拷贝 |
| `'airDrop'` | 隔空投送 |
| `'message'` | 信息 |
| `'mail'` | 邮件 |
| `'print'` | 打印 |
| `'saveToCameraRoll'` | 存到相册 |
| `'assignToContact'` | 指定给联系人 |
| `'addToReadingList'` | 添加到 Safari 的阅读列表 |
| `'openInIBooks'` | 在「图书」里打开 |
| `'markupAsPDF'` | 标记成 PDF |
| `'sharePlay'` | 同播共享 |
| `'addToHomeScreen'` | 添加到主屏幕 |
| `'collaborationInviteWithLink'`、`'collaborationCopyLink'` | 协作：用链接邀请、拷贝协作链接 |
| `'postToFacebook'`、`'postToTwitter'`、`'postToWeibo'`、`'postToTencentWeibo'`、`'postToFlickr'`、`'postToVimeo'` | 发到对应的社交网站。这几个是系统早年内置的，现在的系统里还出不出现**未在模拟器验证** |

表里的中文是这些动作在中文系统里通常的叫法，**未在模拟器验证**。

用户选的是第三方 App 的分享扩展时，`activityType` 是那个扩展自己的标识符，一个带点的字符串，不在这张表里。

## 示例

### 点按钮弹出分享面板

从空白 App 开始，在页面上放一个按钮，点它弹出分享面板。

```js
application.addEventListener('sceneconnect', (e) => {
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
    const sheet = new UIActivityViewController([
      '这篇文章不错',
      new URL('https://example.com/article'),
    ]);
    sheet.addEventListener('complete', (event) => {
      const { completed, activityType } =
        /** @type {UIActivityViewControllerCompletionEvent} */ (event);
      console.log(completed ? '分享到了 ' + activityType : '没有分享');
    });
    page.presentViewController(sheet, { animated: true });
  });
});
```

**效果**（**未在模拟器验证**）

- 页面左上方有一个蓝色文字的按钮「分享」。
- 点它，屏幕底部升起系统的分享面板，上面列着可以分享到的 App 和系统动作。
- 点「拷贝」，面板消失，控制台输出 `分享到了 copyToPasteboard`。
- 不选任何一项、把面板向下拖走，控制台输出 `没有分享`。

更多写法见指南[分享内容](../guides/share.md)。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[[UIActivityViewController alloc] initWithActivityItems:@[@"文字", url] applicationActivities:nil]` | `new UIActivityViewController(['文字', url])` |
| `sheet.excludedActivityTypes = @[UIActivityTypePrint, UIActivityTypeAirDrop]` | `sheet.excludedActivityTypes = ['print', 'airDrop']` |
| `sheet.excludedActivitySectionTypes = UIActivitySectionTypesPeopleSuggestions` | `sheet.excludedActivitySectionTypes = ['peopleSuggestions']` |
| `sheet.allowsProminentActivity = NO` | `sheet.allowsProminentActivity = false` |
| `sheet.completionWithItemsHandler = ^(UIActivityType type, BOOL completed, NSArray *items, NSError *error) { … }` | `sheet.addEventListener('complete', (e) => { … })`<br>回调的四个参数里，`type`、`completed`、`error` 是事件对象的 `activityType`、`completed`、`activityError` |
| `[self presentViewController:sheet animated:YES completion:nil]` | `page.presentViewController(sheet, { animated: true })` |

## 参见

- [分享内容](../guides/share.md)：分享图片、排除动作、处理结果
- [`UIViewController`](ui-view-controller.md)：面板的父类。弹出、关闭、谁弹出了谁
- [`URL`](url.md)：链接的类型
- [`UIImage`](ui-image.md)：图片的类型
- [`UIAlertController`](ui-alert-controller.md)：系统弹窗，同一组里的另一个系统页面
- [剪贴板](ui-pasteboard.md)：只想把文字放进剪贴板时不需要分享面板
