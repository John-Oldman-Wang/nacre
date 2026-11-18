---
type: reference
native: UIActivityViewController
status: partial
---

# `UIActivityViewController`

**`UIActivityViewController`** 表示系统的分享面板。App 把要分享的东西（文字、网址、图片）交给它，它从屏幕底部升起来，列出能接收这些东西的去处：别的 App、隔空投送，以及「拷贝」「存到相册」「打印」这类系统动作。用户选一个，系统负责把东西送过去。

面板里出现哪些去处由系统决定，取决于交给它的东西是什么类型、用户装了哪些 App。App 能做的是提供内容，以及排除一部分系统动作。

`UIActivityViewController` 是一个[页面](ui-view-controller.md)，用页面的 [`presentViewController()`](ui-view-controller.md#presentviewcontroller) 弹出来。面板结束时它派发 `complete` 事件，告诉 App 用户有没有分享、选的是哪个去处。

> **注意**：创建、属性的读写和报错在模拟器（iPhone Air，iOS 27.2）的验收里验过。面板在屏幕上的样子、`complete` 事件什么时候来、带什么数据，要有人真的分享一次才验得到，都**未在模拟器验证**。

## 面板什么时候结束

面板有两种结束方式：

- 用户选了一个去处，那个动作做完了（或者失败了）。
- 用户没选，直接把面板关掉：向下拖走，或者点关闭按钮。

两种情况面板都会自己关掉，然后派发一次 `complete`。事件对象的 `completed` 区分这两种情况：动作做完了是 `true`，其余是 `false`。

- **App 不需要自己关面板。** 用户选完或者关掉之后，面板已经不在屏幕上了。
- **`complete` 之后，分享出去的东西到没到对方手里，App 不知道。** `completed` 是 `true` 只表示那个动作执行完了，比如信息 App 的发送界面被用户点了发送。
- **用代码关掉面板时派不派发 `complete`，未在模拟器验证。** 调 [`dismissViewController()`](ui-view-controller.md#dismissviewcontroller) 之后要做的事，直接写在那一句后面，不依赖这个事件。

## 推荐的做法

**每次分享新建一个面板。** 要分享的东西在创建时给，之后不能换。同一个面板弹第二次会怎样**未在模拟器验证**。

**分享网页时给 `URL` 对象，不要给网址的字符串。** 给字符串，接收方拿到的是一段文字；给 `URL`，接收方知道它是一个链接，「添加到阅读列表」这类只认链接的动作才会出现。**未在模拟器验证。**

**文字和链接可以一起给。** 接收方各取所需：信息 App 两样都放进去，「拷贝」只拷其中一样。各个去处具体怎么取**未在模拟器验证**。

**不需要知道结果就不用监听 `complete`。** 面板不依赖监听器工作。

## 完整例子

下面的代码从空白 App 开始，在页面上放一个按钮，点它弹出分享面板。

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
      const { completed, activityType } =
        /** @type {UIActivityViewControllerCompletionEvent} */ (event);
      console.log(completed ? '分享到了 ' + activityType : '没有分享');
    });

    // 3. 从当前页面弹出来
    page.presentViewController(sheet, { animated: true });
  });
});
```

**效果**（**未在模拟器验证**）：

- 页面左上方有一个蓝色文字的按钮「分享」。
- 点它，屏幕底部升起系统的分享面板，上面列着可以分享到的 App 和系统动作。
- 点「拷贝」，面板消失，控制台输出 `分享到了 copyToPasteboard`。
- 不选任何一项、把面板向下拖走，控制台输出 `没有分享`。

## 常见用法

下面的例子沿用完整例子里的 `page`。

### 分享一张图片

```js
const photo = UIImage.imageNamed('JS/assets/photo');
if (photo !== null) {
  const sheet = new UIActivityViewController([photo]);
  page.presentViewController(sheet, { animated: true });
}
```

**效果**（**未在模拟器验证**）：分享面板里出现「存储图像」等只对图片有效的动作。

[`UIImage.imageNamed()`](ui-image.md) 找不到图片时返回 `null`，所以先判断。

### 不让某些系统动作出现

```js
const sheet = new UIActivityViewController([new URL('https://example.com')]);
sheet.excludedActivityTypes = ['print', 'assignToContact', 'addToReadingList'];
page.presentViewController(sheet, { animated: true });
```

**效果**（**未在模拟器验证**）：面板里没有「打印」「指定给联系人」「添加到阅读列表」。

能排除的是[系统动作](#系统动作的名字)里列出的那些。第三方 App 的分享扩展排除不了。

### 隐藏顶上那一排联系人

```js
sheet.excludedActivitySectionTypes = ['peopleSuggestions'];
```

**效果**（**未在模拟器验证**）：面板顶部不再显示系统推荐的联系人。

### 分享完之后做点什么

```js
sheet.addEventListener('complete', (event) => {
  const result = /** @type {UIActivityViewControllerCompletionEvent} */ (event);
  if (result.activityError !== null) {
    console.log('分享出错了：' + result.activityError.message);
  } else if (result.completed) {
    console.log('分享完成，去处是 ' + result.activityType);
  }
});
```

**效果**（**未在模拟器验证**）：用户完成分享时输出去处的名字；动作失败时输出错误信息；用户直接关掉面板时什么都不输出。

事件对象的类型要转一下才能读到这三个字段，写法见上。

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

## 成员说明

### 创建

#### `new UIActivityViewController()`

```js
const sheet = new UIActivityViewController(['一段文字', new URL('https://example.com')]);
```

- **参数**：`activityItems`，一个数组，见[能分享什么](#能分享什么)。
- **出错**：
  - 没给，或者给的不是数组：`TypeError: new UIActivityViewController: activityItems must be an array of strings, URLs and UIImages, got undefined`（`got` 后面是实际给的值）
  - 数组里有分享不了的东西：`TypeError: activityItems[0] must be a string, a URL or a UIImage, got an object`（方括号里是第几项）
  - 给了第二个参数 `{ applicationActivities }`：`TypeError: new UIActivityViewController: applicationActivities is not supported yet`

### 属性

| 属性 | 类型 | 可读 | 可写 | 默认值 | 含义 |
| --- | --- | --- | --- | --- | --- |
| `excludedActivityTypes` | `UIActivityType[] \| null` | 是 | 是 | `null` | 不出现在面板里的系统动作。`null` 和空数组都是一个也不排除 |
| `excludedActivitySectionTypes` | `'peopleSuggestions'[]` | 是 | 是 | 空数组 | 整块隐藏的分区。现在只有一个：`'peopleSuggestions'` 是顶上那一排推荐的联系人 |
| `allowsProminentActivity` | `boolean` | 是 | 是 | `true` | `true`：系统可以把某一个动作放大显示在面板顶部，选哪个由系统定。`false`：不允许 |

- 这些属性变化时不派发事件：它们只有 App 自己能改。
- 在弹出之前设好。面板已经在屏幕上之后再改，有没有效果**未在模拟器验证**。
- 写 `excludedActivityTypes` 时，数组里有不在[系统动作的名字](#系统动作的名字)里的名字，不抛异常：整次赋值不生效，属性保持原来的值，控制台输出一条警告 `[Nacre] excludedActivityTypes has no value "<写的名字>"; expected one of: …, ignored`，省略号处是全部可用的名字。给的不是数组也不是 `null` 抛 `TypeError: excludedActivityTypes must be an array of names, got "airDrop"`（`got` 后面是实际给的值），原来的值不变。
- 写 `excludedActivitySectionTypes` 时，数组里有不认识的名字，不抛异常：整次赋值不生效，属性保持原来的值，控制台输出一条警告 `[Nacre] excludedActivitySectionTypes has no value "apps"; expected one of: peopleSuggestions, ignored`。给的不是数组抛 `TypeError`。

标题、弹出方式等继承自 [`UIViewController`](ui-view-controller.md)。

### 弹出和关闭

| 想做的事 | 写法 |
| --- | --- |
| 弹出来 | [`page.presentViewController(sheet, { animated: true })`](ui-view-controller.md#presentviewcontroller) |
| 用代码关掉 | [`sheet.dismissViewController({ animated: true })`](ui-view-controller.md#dismissviewcontroller) |

### 事件

| 事件 | 什么时候派发 |
| --- | --- |
| `complete` | 面板结束了：用户选的动作做完了，或者用户把面板关了 |
| `beforedismiss`、`dismiss`、`dismissattempt` | 继承自页面，见[关闭事件](ui-view-controller.md#关闭事件) |

`complete` 的事件对象带三个字段：

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| `completed` | `boolean` | `true`：用户选的动作做完了。`false`：没做，包括用户直接把面板关掉 |
| `activityType` | `string \| null` | 用户选的去处：[系统动作的名字](#系统动作的名字)，或者第三方扩展的标识符。没选就关掉了是 `null` |
| `activityError` | `Error \| null` | 动作失败时的错误，`message` 是系统给的说明，另外带 `code`（数字）和 `domain`（字符串）。没有错误是 `null` |

- 事件对象的 `type` 是 `'complete'`，`target` 是这个面板。
- 一个面板的 `complete` 只派发一次。
- 事件不能取消，`preventDefault()` 不起作用。
- 监听上表以外的名字不会报错：它被当成自定义事件，只有自己用 `dispatchEvent()` 派发时才会触发。

## 与 iOS 原生写法的对照

如果你在看 Apple 的文档或 iOS 的示例代码，按这张表换成 JS 的写法。

| ObjC | JS |
| --- | --- |
| `[[UIActivityViewController alloc] initWithActivityItems:@[@"文字", url] applicationActivities:nil]` | `new UIActivityViewController(['文字', url])` |
| `sheet.excludedActivityTypes = @[UIActivityTypePrint, UIActivityTypeAirDrop]` | `sheet.excludedActivityTypes = ['print', 'airDrop']` |
| `sheet.excludedActivitySectionTypes = UIActivitySectionTypesPeopleSuggestions` | `sheet.excludedActivitySectionTypes = ['peopleSuggestions']` |
| `sheet.allowsProminentActivity = NO` | `sheet.allowsProminentActivity = false` |
| `sheet.completionWithItemsHandler = ^(UIActivityType type, BOOL completed, NSArray *items, NSError *error) { … }` | `sheet.addEventListener('complete', (e) => { … })`<br>回调的四个参数里，`type`、`completed`、`error` 是事件对象的 `activityType`、`completed`、`activityError` |
| `[self presentViewController:sheet animated:YES completion:nil]` | `page.presentViewController(sheet, { animated: true })` |

## 还不能做的

| 想做的事 | 对应的原生能力 | 状态 |
| --- | --- | --- |
| 往面板里加 App 自己的动作 | `UIActivity` 的子类、`applicationActivities` | 未实现 |
| 排除第三方 App 的分享扩展 | 往 `excludedActivityTypes` 里写扩展的标识符 | 未实现，只收表里的名字 |
| 分享文件、视频、别的类型的数据 | 数组里放 `NSURL`（文件地址）、`NSData`、`NSItemProvider` | 未实现。只收字符串、`URL`、`UIImage` |
| 按去处给不同的内容，定制面板顶上的预览 | `UIActivityItemSource`、`LPLinkMetadata` | 未实现 |
| 拿到去处改过之后送回来的数据 | 完成回调的 `returnedItems` | 未实现 |
| 在 iPad 上弹出（要指定它从哪里弹出来） | `popoverPresentationController` | 未实现。运行时只支持 iPhone |

## 参见

- [`UIViewController`](ui-view-controller.md)：面板的父类。弹出、关闭、谁弹出了谁
- [`URL`](url.md)：链接的类型
- [`UIImage`](ui-image.md)：图片的类型
- [`UIAlertController`](ui-alert-controller.md)：系统弹窗，同一组里的另一个系统页面
- [剪贴板](ui-pasteboard.md)：只想把文字放进剪贴板时不需要分享面板
- [实现原理：系统弹窗和分享面板](../internals/alerts.md)
