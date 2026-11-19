---
type: reference
native: UIFeedbackGenerator
status: partial
---

# `UIFeedbackGenerator`

**`UIFeedbackGenerator`** 表示一个触感反馈的生成器。触感反馈是手机配合界面变化发出的一次短促震动，比如按钮按下、开关拨动、操作成功或失败。震动的力度和节奏由系统预设，App 只选择用哪一种，不能指定震多久、震多强的波形。

`UIFeedbackGenerator` 是基类，不能直接用。触感反馈由它的三个子类提供，每个类对应一类场合：

| 类 | 表示什么 | 触发的方法 |
| --- | --- | --- |
| [`UIImpactFeedbackGenerator`](ui-impact-feedback-generator.md) | 撞击：两个东西碰到一起 | [`impactOccurred()`](ui-impact-feedback-generator/impactoccurred.md) |
| [`UISelectionFeedbackGenerator`](ui-selection-feedback-generator.md) | 选择变了：从一项换到另一项 | [`selectionChanged()`](ui-selection-feedback-generator/selectionchanged.md) |
| [`UINotificationFeedbackGenerator`](ui-notification-feedback-generator.md) | 通知：一件事成功了、需要注意、失败了 | [`notificationOccurred()`](ui-notification-feedback-generator/notificationoccurred.md) |

生成器只能用子类上的静态方法创建，创建时必须给出一个视图，表示这次反馈和界面上的哪个视图有关。生成器创建之后可以反复触发。调用触发的方法就发出一次震动。方法没有返回值，也没有「震完了」的通知。

**继承关系**：`EventTarget` → `NSObject` → `UIFeedbackGenerator`

按场合选哪个类、什么时候调 `prepare()`，见指南[让手机震一下](../guides/haptics.md)。

## 构造函数

不能用 `new` 创建。`new UIFeedbackGenerator()` 抛 `TypeError: Illegal constructor: UIFeedbackGenerator has no public initializer; use one of its subclasses, e.g. UIImpactFeedbackGenerator.feedbackGeneratorWithStyle(style, { forView: view })`。

用三个子类的静态方法创建。

## 实例方法

还继承 `NSObject` 的方法。

| 方法 | 说明 |
| --- | --- |
| [`prepare()`](ui-feedback-generator/prepare.md) | 让系统的震动部件提前就绪，减小触发时的延迟。可以不调 |

## 什么时候没有震动

以下情况下调用触发的方法不报错，只是没有震动：

- **在模拟器上。** 模拟器没有震动部件。创建生成器、调用各个方法、写错参数时的报错，在模拟器上都和真机一样，只是感受不到震动。
- **用户在系统设置里关掉了触感反馈。** App 查不到这个设置，也不需要查：照常调用即可。这一条**未在模拟器验证**，来自 iOS 的定义。

所以触感反馈只能作为补充。操作的结果必须同时在界面上表现出来，不能只靠震动告诉用户。

这一组页面里描述震感的句子（轻重、节奏的差别）都**未在模拟器验证**：真机（iPhone 14）上核对过的是调用被执行、没有报错，震感本身没有记录。

## 示例

下面的代码从空白 App 开始，在屏幕上放一个按钮。按下时震一下，松手时再给一个「成功」的震动。

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const button = UIButton.buttonWithType('system');
  button.setTitle('提交', { forState: ['normal'] });
  button.frame = new CGRect(40, 120, 200, 44);
  page.view.addSubview(button);

  const tap = UIImpactFeedbackGenerator.feedbackGeneratorWithStyle('medium', { forView: button });
  const done = UINotificationFeedbackGenerator.feedbackGeneratorForView(button);

  button.addEventListener('touchdown', () => {
    tap.impactOccurred();
  });
  button.addEventListener('touchupinside', () => {
    done.notificationOccurred('success');
  });
});
```

**效果**

- 屏幕左上方出现一个文字按钮「提交」。
- 手指按下时，手机短促地震一下。
- 在按钮上松手时，手机按系统给「成功」规定的节奏震动。

这段代码没有作为一个整体在模拟器运行过。在模拟器上运行时按钮照常出现，按下和松手都没有震动。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[UIImpactFeedbackGenerator feedbackGeneratorWithStyle:UIImpactFeedbackStyleMedium forView:view]` | `UIImpactFeedbackGenerator.feedbackGeneratorWithStyle('medium', { forView: view })` |
| `[UISelectionFeedbackGenerator feedbackGeneratorForView:view]` | `UISelectionFeedbackGenerator.feedbackGeneratorForView(view)` |
| `[[UIImpactFeedbackGenerator alloc] initWithStyle:UIImpactFeedbackStyleMedium]` | 没有对应的写法。这个初始化方法已被 Apple 标为将废弃，用上面绑定视图的写法 |
| `[generator prepare]` | `generator.prepare()` |

与浏览器的对照：

| 浏览器 | Nacre |
| --- | --- |
| `navigator.vibrate(200)`，指定震动的毫秒数 | 没有对应。只能从系统预设的几种震感里选 |

## 还不能做的

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 指明震动发生在视图里的哪个位置 | `impactOccurredAtLocation:`、`selectionChangedAtLocation:` 等 |
| 自己编排震动的时长、强度和节奏 | Core Haptics（`CHHapticEngine`） |
| 知道用户有没有关掉触感反馈 | 无。系统不提供这个查询 |

## 参见

- [让手机震一下](../guides/haptics.md)：按场合选类、复用生成器、减小延迟
- [`UIImpactFeedbackGenerator`](ui-impact-feedback-generator.md)、[`UISelectionFeedbackGenerator`](ui-selection-feedback-generator.md)、[`UINotificationFeedbackGenerator`](ui-notification-feedback-generator.md)：三个子类
- [`UIControl`](ui-control.md)：`touchdown`、`touchupinside`，触发震动的时机
