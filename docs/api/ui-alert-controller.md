---
type: reference
native: UIAlertController
status: partial
---

# `UIAlertController`

**`UIAlertController`** 表示一个系统弹窗：一段标题、一段说明文字，加上若干个按钮。弹窗盖在当前界面上面，用户点了其中一个按钮之后它才消失。弹窗有两种[样式](#两种样式)，创建时选定：屏幕中间的提示框，和从屏幕底部升起来的菜单。

弹窗上的每个按钮是一个 [`UIAlertAction`](ui-alert-action.md)。用户点了哪个按钮，哪个按钮派发 [`click`](ui-alert-action/click-event.md) 事件；弹窗自己没有事件。

弹窗是一个[页面](ui-view-controller.md)。它没有自己的「显示」方法，用页面的 [`presentViewController()`](ui-view-controller/presentviewcontroller.md) 弹出来。弹窗的外观由系统决定，App 只提供文字和按钮。

> **注意**：创建、属性的读写和报错在模拟器（iPhone Air，iOS 27.2）的验收里验过。屏幕上的样子、点按钮之后发生的事，要有人真的点一下才验得到，都**未在模拟器验证**。

**继承关系**：`EventTarget` → `NSObject` → `UIResponder` → [`UIViewController`](ui-view-controller.md) → `UIAlertController`

怎么做提示框、底部菜单和带输入框的弹窗，见指南[弹出提示框和菜单](../guides/alerts.md)。

## 构造函数

不能用 `new` 创建。`new UIAlertController()` 抛 `TypeError: Illegal constructor: UIAlertController has no public initializer; use UIAlertController.alertControllerWithTitle(title, { message, preferredStyle })`。用下面的静态方法创建。

## 静态方法

[`UIAlertController.alertControllerWithTitle()`](ui-alert-controller/alertcontrollerwithtitle.md)

创建一个弹窗，给出标题、说明文字和样式。

## 实例属性

还继承 [`UIViewController`](ui-view-controller.md) 的属性。弹窗的标题就是继承来的 [`title`](ui-view-controller/title.md)。

| 属性 | 说明 |
| --- | --- |
| [`message`](ui-alert-controller/message.md) | 标题下面的说明文字 |
| [`preferredStyle`](ui-alert-controller/preferredstyle.md) <small>只读</small> | 样式：提示框或底部菜单 |
| [`severity`](ui-alert-controller/severity.md) | 严重程度 |
| [`actions`](ui-alert-controller/actions.md) <small>只读</small> | 加进来的全部按钮 |
| [`preferredAction`](ui-alert-controller/preferredaction.md) | 提示框里加粗显示的那个按钮 |
| [`textFields`](ui-alert-controller/textfields.md) <small>只读</small> | 加进来的全部输入框 |

## 实例方法

还继承 [`UIViewController`](ui-view-controller.md) 的方法。用代码关掉弹窗用继承来的 [`dismissViewController()`](ui-view-controller/dismissviewcontroller.md)。

| 方法 | 说明 |
| --- | --- |
| [`addAction()`](ui-alert-controller/addaction.md) | 加一个按钮 |
| [`addTextField()`](ui-alert-controller/addtextfield.md) | 加一个输入框，只有提示框能加 |

## 事件

弹窗没有自己的事件。用户点了哪个按钮，在那个按钮上监听 [`click`](ui-alert-action/click-event.md)。

| 事件 | 什么时候派发 |
| --- | --- |
| `traitchange` | 继承自 [`UIViewController`](ui-view-controller.md)：[外观特征](ui-trait-collection.md)变了。在弹窗上**未在模拟器验证** |

页面的关闭事件 [`beforedismiss`](ui-view-controller/beforedismiss-event.md)、[`dismiss`](ui-view-controller/dismiss-event.md)、[`dismissattempt`](ui-view-controller/dismissattempt-event.md) 在弹窗上不会派发，两种样式都是：系统不让弹窗报告自己被关掉。监听它们不会报错，它们被当成自定义事件，只有自己用 `dispatchEvent()` 派发时才会触发。

## 两种样式

| `preferredStyle` | 出现在哪 | 能带输入框吗 | 适合 |
| --- | --- | --- | --- |
| `'alert'` | 屏幕中间 | 能 | 告知一件事；让用户确认；让用户输入一小段文字 |
| `'actionSheet'` | 从屏幕底部升起来 | 不能，调 `addTextField()` 抛 `TypeError` | 在几个操作里选一个 |

样式在创建时给，之后不能改。

## 弹窗什么时候关

用户点弹窗上的任何一个按钮，系统都会把弹窗关掉。App 不能让某个按钮「点了不关」。

- 被点的那个按钮在弹窗关掉之后派发一次 `click`，其余的按钮什么都不派发。**未在模拟器验证。**
- 没有监听器的按钮也能点，点了只是把弹窗关掉。
- 禁用的按钮点不动：点它弹窗不关，也不派发事件。**未在模拟器验证。**
- 用代码 [`dismissViewController()`](ui-view-controller/dismissviewcontroller.md) 关掉弹窗不算点了按钮，没有按钮派发事件。**未在模拟器验证。**
- 底部菜单可以点菜单外面关掉。这等于点了取消样式的那个按钮，那个按钮派发事件。**未在模拟器验证。**
- 提示框点外面关不掉。一个按钮都没有的提示框，用户没有办法关掉它，只能由代码关。**未在模拟器验证。**
- 弹窗关掉之后，`textFields` 里的输入框还在，`text` 是用户输入的内容。

## 示例

### 问用户要不要删除

从空白 App 开始，在页面上放一个按钮。点它弹出一个提示框，问用户要不要删除。

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const button = UIButton.buttonWithType('system');
  button.setTitle('删除照片', { forState: ['normal'] });
  button.frame = new CGRect(40, 120, 200, 44);
  page.view.addSubview(button);

  button.addEventListener('click', () => {
    const alert = UIAlertController.alertControllerWithTitle('删除这张照片？', {
      message: '删除之后不能恢复。',
      preferredStyle: 'alert',
    });
    const cancel = UIAlertAction.actionWithTitle('取消', { style: 'cancel' });
    const remove = UIAlertAction.actionWithTitle('删除', { style: 'destructive' });
    remove.addEventListener('click', () => {
      console.log('照片删掉了');
    });
    alert.addAction(cancel);
    alert.addAction(remove);
    page.presentViewController(alert, { animated: true });
  });
});
```

**效果**（**未在模拟器验证**）

- 页面左上方有一个蓝色文字的按钮「删除照片」。
- 点它，屏幕中间出现一个提示框，标题是「删除这张照片？」，下面一行说明，底下两个按钮「取消」和红色的「删除」。
- 点「删除」，提示框消失，控制台输出 `照片删掉了`。
- 点「取消」，提示框消失，控制台没有输出。

更多写法见指南[弹出提示框和菜单](../guides/alerts.md)。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[UIAlertController alertControllerWithTitle:@"标题" message:@"说明" preferredStyle:UIAlertControllerStyleAlert]` | `UIAlertController.alertControllerWithTitle('标题', { message: '说明', preferredStyle: 'alert' })` |
| `[UIAlertAction actionWithTitle:@"好" style:UIAlertActionStyleDefault handler:^(UIAlertAction *a) { … }]` | `const a = UIAlertAction.actionWithTitle('好', { style: 'default' });`<br>`a.addEventListener('click', () => { … })` |
| `[alert addAction:action]` | `alert.addAction(action)` |
| `[alert addTextFieldWithConfigurationHandler:^(UITextField *f) { f.placeholder = @"名字"; }]` | `const f = alert.addTextField();`<br>`f.placeholder = '名字'` |
| `alert.textFields.firstObject.text` | `alert.textFields[0].text` |
| `alert.preferredAction = action` | `alert.preferredAction = action` |
| `action.enabled = NO` | `action.isEnabled = false` |
| `[self presentViewController:alert animated:YES completion:nil]` | `page.presentViewController(alert, { animated: true })` |

## 还不能做的

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 在 iPad 上弹底部菜单（要指定它从哪里弹出来） | `popoverPresentationController`。运行时只支持 iPhone |
| 点了按钮不关弹窗 | 系统不提供 |
| 改弹窗的颜色、字体，往里放自己的视图 | 系统没有公开接口。要自定义外观，用一个自己的页面[模态弹出](ui-view-controller/presentviewcontroller.md) |
| 在弹窗上监听 `dismiss` 一组关闭事件 | `UIAdaptivePresentationControllerDelegate`。系统不允许给提示框设置这个委托 |

## 参见

- [弹出提示框和菜单](../guides/alerts.md)：提示一句话、等用户选、输入文字、禁用按钮
- [`UIAlertAction`](ui-alert-action.md)：弹窗上的按钮
- [`UIViewController`](ui-view-controller.md)：弹窗的父类。弹出、关闭、谁弹出了谁
- [`UITextField`](ui-text-field.md)：弹窗里输入框的类型
- [`UIActivityViewController`](ui-activity-view-controller.md)：系统分享面板，同一组里的另一个系统页面
- [枚举](enums.md)：枚举为什么是字符串，写错了会怎样
- [实现原理：系统弹窗和分享面板](../internals/alerts.md)
