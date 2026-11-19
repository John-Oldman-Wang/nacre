# 让手机震一下

这一篇讲怎么用触感反馈配合界面变化让手机短促地震一下：按钮按下、选中项变了、操作成功或失败。涉及 [`UIImpactFeedbackGenerator`](../api/ui-impact-feedback-generator.md)、[`UISelectionFeedbackGenerator`](../api/ui-selection-feedback-generator.md)、[`UINotificationFeedbackGenerator`](../api/ui-notification-feedback-generator.md) 和它们的基类 [`UIFeedbackGenerator`](../api/ui-feedback-generator.md)。

在模拟器上调用这些方法不报错，但没有震动。下面描述震感的句子都**未在模拟器验证**。

## 推荐的做法

**按场合选类，不按想要的力度选。** 系统给每类场合规定了一致的震感，用户在别的 App 里已经熟悉了它们。场合和类的对应：

| 场合 | 用哪个 |
| --- | --- |
| 按钮按下、卡片落到位、拖动的东西碰到边界 | `UIImpactFeedbackGenerator`，力度按界面元素的大小选：小的用 `'light'`，一般的用 `'medium'`，大的用 `'heavy'` |
| 拖动中，震感要跟着拖动的距离变强 | `UIImpactFeedbackGenerator` 的 [`impactOccurredWithIntensity()`](../api/ui-impact-feedback-generator/impactoccurredwithintensity.md) |
| 滚轮转过一格、滑块经过一个刻度、列表的选中项换了 | `UISelectionFeedbackGenerator` |
| 提交成功、支付完成 | `UINotificationFeedbackGenerator`，`'success'` |
| 余额不足的提醒、需要用户确认的情况 | `UINotificationFeedbackGenerator`，`'warning'` |
| 提交失败、密码错误 | `UINotificationFeedbackGenerator`，`'error'` |

**生成器创建一次，保存下来反复用。** 在建界面时创建，放在事件回调能访问到的变量里。[`prepare()`](../api/ui-feedback-generator/prepare.md) 的准备状态属于调用它的那个生成器，每次触发都新建一个生成器就用不上它。

**震动要对应一次界面变化。** 用户看不到变化却感到震动，会不明白发生了什么。同一个操作只震一次；页面加载完成、定时刷新这类不是用户直接触发的事不要震。

**操作的结果要同时在界面上表现出来。** 用户可能关掉了触感反馈，见[什么时候没有震动](../api/ui-feedback-generator.md#什么时候没有震动)。

**`prepare()` 可以不调。** 它只在震动必须和动作贴得很紧时才有用，见[减小震动的延迟](#减小震动的延迟)。

## 第一个例子

从空白 App 开始，在屏幕上放一个按钮。按下时震一下，松手时再给一个「成功」的震动。

```js
/** @type {UIViewController} */
let page;
/** @type {UIButton} */
let button;

application.addEventListener('sceneconnect', (e) => {
  // 建窗口和页面。每个 App 都要有这几行
  const win = new UIWindow(e.scene);
  page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 1. 一个按钮
  button = UIButton.buttonWithType('system');
  button.setTitle('提交', { forState: ['normal'] });
  button.frame = new CGRect(40, 120, 200, 44);
  page.view.addSubview(button);

  // 2. 创建两个生成器，都绑定到这个按钮上
  const tap = UIImpactFeedbackGenerator.feedbackGeneratorWithStyle('medium', { forView: button });
  const done = UINotificationFeedbackGenerator.feedbackGeneratorForView(button);

  // 3. 按下时震一下
  button.addEventListener('touchdown', () => {
    tap.impactOccurred();
  });

  // 4. 松手时给「成功」的震动
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

两个生成器在建界面时创建一次，两个回调里反复使用。下面各节沿用这里的 `page` 和 `button`，代码写在 `sceneconnect` 的回调里、`page` 和 `button` 建好之后。

## 换一种力度

创建时的第一个参数是力度，有五种，见 [`feedbackGeneratorWithStyle()`](../api/ui-impact-feedback-generator/feedbackgeneratorwithstyle.md)：

```js
function lightThenHeavy() {
  const light = UIImpactFeedbackGenerator.feedbackGeneratorWithStyle('light', { forView: button });
  const heavy = UIImpactFeedbackGenerator.feedbackGeneratorWithStyle('heavy', { forView: button });

  light.impactOccurred();
  heavy.impactOccurred();
}
```

**效果**：调用时先轻轻震一下，紧接着重重震一下。

力度在创建时确定，之后不能改。要用几种力度，就创建几个生成器。

## 让同一种力度震得弱一些

```js
function softHeavy() {
  const tap = UIImpactFeedbackGenerator.feedbackGeneratorWithStyle('heavy', { forView: button });
  tap.impactOccurredWithIntensity(0.3);
}
```

**效果**：震一下，质感是 `heavy` 的，强度只有满强度的 30%。

## 震感跟着拖动的距离变化

`intensity` 超出 0 到 1 会抛 `TypeError`，不会自动截到范围内，所以由计算得到的值要先限制范围：

```js
function setUpDrag() {
  const pull = UIImpactFeedbackGenerator.feedbackGeneratorWithStyle('medium', { forView: button });

  /** @param {number} distance 拖动的距离，单位 pt */
  function onDrag(distance) {
    const intensity = Math.min(1, Math.max(0, distance / 200));
    pull.impactOccurredWithIntensity(intensity);
  }

  onDrag(50);
  onDrag(400);
}
```

**效果**：震两下。第一下的强度是满强度的 25%，第二下是满强度：400 pt 算出来是 2，被限制到 1。

## 列表选中项变了

```js
function setUpSelection() {
  const tick = UISelectionFeedbackGenerator.feedbackGeneratorForView(page.view);

  /** @param {number} index */
  function onSelect(index) {
    tick.selectionChanged();
    console.log('选中了第 ' + index + ' 项');
  }

  onSelect(2);
}
```

**效果**：很轻地震一下，控制台输出 `选中了第 2 项`。

## 提示操作失败

```js
function showFailure() {
  const alarm = UINotificationFeedbackGenerator.feedbackGeneratorForView(page.view);
  alarm.notificationOccurred('error');
}
```

**效果**：手机按系统给「失败」规定的节奏震动，和「成功」的节奏不同。

## 减小震动的延迟

[`prepare()`](../api/ui-feedback-generator/prepare.md) 让系统的震动部件提前进入就绪状态。Apple 对它的说明是：这样做能减小触发震动时的延迟。知道马上要震的时候先调它，比如手指按下时准备、松手时触发：

```js
function setUpPrepared() {
  const tap = UIImpactFeedbackGenerator.feedbackGeneratorWithStyle('medium', { forView: button });

  button.addEventListener('touchdown', () => {
    tap.prepare();   // 手指按下：很可能马上要震，先准备
  });
  button.addEventListener('touchupinside', () => {
    tap.impactOccurred();
  });
}
```

**效果**：松手时震一下。

不调 `prepare()` 也能震，验收用例里两种写法都执行过，都不报错。调与不调的延迟差多少没有测量过，**未在模拟器验证**。按 Apple 的说明，就绪状态只保持很短的时间，所以要在马上要震之前调，不要在建界面时调一次了事。

## 参见

- [`UIFeedbackGenerator`](../api/ui-feedback-generator.md)：基类，什么时候没有震动
- [`UIImpactFeedbackGenerator`](../api/ui-impact-feedback-generator.md)、[`UISelectionFeedbackGenerator`](../api/ui-selection-feedback-generator.md)、[`UINotificationFeedbackGenerator`](../api/ui-notification-feedback-generator.md)
- [`UIControl`](../api/ui-control.md)：`touchdown`、`touchupinside`
