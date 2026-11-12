---
type: reference
native: UIFeedbackGenerator
status: partial
---

# 触感反馈

触感反馈让手机短促地震一下，配合界面上的变化，比如按钮按下、操作成功。它由三个类提供，每个类对应一种场合：

| 类 | 用在什么时候 |
| --- | --- |
| `UIImpactFeedbackGenerator` | 撞击：按钮按下、东西落到位、拖到了边界 |
| `UISelectionFeedbackGenerator` | 选择变了：滚轮转过一格、滑块经过一个刻度 |
| `UINotificationFeedbackGenerator` | 通知：一件事成功了、需要注意、失败了 |

它相当于浏览器里的 `navigator.vibrate()`。有三点不同：

- **不能指定震多久。** 只能从系统预设的几种里选，每种的力度和节奏是固定的。
- **要先创建一个对象，并且绑定到一个视图上。** 创建时给出和这次反馈相关的视图。
- **用户可以在系统设置里关掉。** 关掉之后调用不报错，也不震。**未验证。**

> **注意**：模拟器不会震动。这一页里所有「震一下」的效果都要在真机上才能感受到，**都未验证**。创建、调用不报错、写错时的报错在模拟器上核对过。

## 完整例子

下面的代码从空白 App 开始，在屏幕上放一个按钮。按下时震一下，松手时再给一个「成功」的震动。

```js
application.addEventListener('sceneconnect', (e) => {
  // 建窗口和页面。每个 App 都要有这几行
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 1. 一个按钮
  const button = UIButton.buttonWithType('system');
  button.setTitle('提交', { forState: ['normal'] });
  button.frame = new CGRect(40, 120, 200, 44);
  page.view.addSubview(button);

  // 2. 创建两个触感反馈对象，都绑定到这个按钮上
  const tap = UIImpactFeedbackGenerator.feedbackGeneratorWithStyle('medium', { forView: button });
  const done = UINotificationFeedbackGenerator.feedbackGeneratorForView(button);

  // 3. 按下时震一下
  button.addEventListener('touchDown', () => {
    tap.impactOccurred();
  });

  // 4. 松手时给「成功」的震动
  button.addEventListener('touchUpInside', () => {
    done.notificationOccurred('success');
  });
});
```

**效果**：

- 屏幕左上方出现一个文字按钮「提交」。
- 手指按下时，手机短促地震一下。
- 在按钮上松手时，手机按系统给「成功」规定的节奏震动。

这段代码没有作为一个整体在模拟器运行过。

触感反馈对象创建一次，之后反复使用。不要每次要震的时候新建一个。

## 常见用法

以下例子都沿用上面的 `page` 和 `button`。

### 换一种力度

创建时的第一个参数是力度，有五种：

```js
const light = UIImpactFeedbackGenerator.feedbackGeneratorWithStyle('light', { forView: button });
const heavy = UIImpactFeedbackGenerator.feedbackGeneratorWithStyle('heavy', { forView: button });

light.impactOccurred();
heavy.impactOccurred();
```

**效果**：先轻轻震一下，紧接着重重震一下。

五种力度的差别见[成员说明](#uiimpactfeedbackgenerator)。

### 让同一种力度震得弱一些

```js
const tap = UIImpactFeedbackGenerator.feedbackGeneratorWithStyle('heavy', { forView: button });
tap.impactOccurredWithIntensity(0.3);
```

**效果**：震一下，质感是 `heavy` 的，强度只有满强度的 30%。

`intensity` 是 0 到 1 之间的比例。适合跟着一个连续变化的量走，比如拖得越远震得越强。

### 列表选中项变了

```js
const tick = UISelectionFeedbackGenerator.feedbackGeneratorForView(page.view);

/** @param {number} index */
function onSelect(index) {
  tick.selectionChanged();
  console.log('选中了第 ' + index + ' 项');
}

onSelect(2);
```

**效果**：很轻地震一下，控制台输出 `选中了第 2 项`。

### 提示操作失败

```js
const alarm = UINotificationFeedbackGenerator.feedbackGeneratorForView(page.view);
alarm.notificationOccurred('error');
```

**效果**：手机按系统给「失败」规定的节奏震动，和「成功」的节奏不同。

### 减少震动的延迟

触感引擎平时是休眠的，第一次触发前要先启动，所以第一下可能慢一点。知道马上要震的时候，先调 `prepare()`：

```js
const tap = UIImpactFeedbackGenerator.feedbackGeneratorWithStyle('medium', { forView: button });

button.addEventListener('touchDown', () => {
  tap.prepare();   // 手指按下：很可能马上要震，先准备
});
button.addEventListener('touchUpInside', () => {
  tap.impactOccurred();
});
```

**效果**：松手时的震动和手指的动作贴得更紧。

准备好的状态只保持很短的时间，所以在马上要震之前调。不调它也能震，只是可能慢一点。

## 成员说明

### 继承关系

```
EventTarget
  └─ NSObject
       └─ UIFeedbackGenerator
            ├─ UIImpactFeedbackGenerator
            ├─ UISelectionFeedbackGenerator
            └─ UINotificationFeedbackGenerator
```

### 创建

三个类都**不能用 `new`**，只能用类上的方法创建。创建时要给一个视图，表示这次反馈和哪个视图有关。

| 写法 | 返回 |
| --- | --- |
| `UIImpactFeedbackGenerator.feedbackGeneratorWithStyle(style, { forView })` | `UIImpactFeedbackGenerator` |
| `UISelectionFeedbackGenerator.feedbackGeneratorForView(view)` | `UISelectionFeedbackGenerator` |
| `UINotificationFeedbackGenerator.feedbackGeneratorForView(view)` | `UINotificationFeedbackGenerator` |

- `style`：力度，字符串，取值见下面的表。
- `forView`、`view`：一个 [`UIView`](ui-view.md)。
- 每次调用得到一个新的对象。
- **出错**：
  - 用 `new`：`TypeError: Illegal constructor: UIImpactFeedbackGenerator has no public initializer; use UIImpactFeedbackGenerator.feedbackGeneratorWithStyle(style, { forView: view })`
  - `style` 不认识：`TypeError: style has no value "strong"; expected one of: light / medium / heavy / soft / rigid`
  - 没给 `forView`：`TypeError: feedbackGeneratorWithStyle needs { forView }`
  - 给的不是视图：`TypeError: feedbackGeneratorForView needs a UIView`

### `prepare()`

三个类都有。让触感引擎提前就绪，减少真正触发时的延迟。没有参数，没有返回值。

### `UIImpactFeedbackGenerator`

| 方法 | 作用 |
| --- | --- |
| `impactOccurred()` | 震一下，力度是创建时给的那一种，满强度 |
| `impactOccurredWithIntensity(intensity)` | 震一下。`intensity` 是 0 到 1 之间的比例，1 是满强度 |

两个方法都没有返回值。

`style` 的取值。「感觉」一栏是 Apple 文档里的描述：

| 取值 | 感觉 |
| --- | --- |
| `'light'` | 轻。小的、轻的界面元素 |
| `'medium'` | 中等 |
| `'heavy'` | 重。大的、重的界面元素 |
| `'soft'` | 发闷，像碰到软的东西 |
| `'rigid'` | 发脆，像碰到硬的东西 |

- **出错**：
  - `intensity` 超出 0 到 1：`TypeError: intensity must be a number between 0 and 1`
  - `intensity` 转不成数：`TypeError: intensity must be a finite number, got "max"`

### `UISelectionFeedbackGenerator`

| 方法 | 作用 |
| --- | --- |
| `selectionChanged()` | 很轻地震一下。没有参数，没有返回值 |

### `UINotificationFeedbackGenerator`

| 方法 | 作用 |
| --- | --- |
| `notificationOccurred(type)` | 按 `type` 对应的节奏震。没有返回值 |

`type` 的取值：

| 取值 | 含义 |
| --- | --- |
| `'success'` | 一件事成功完成 |
| `'warning'` | 需要用户注意 |
| `'error'` | 失败 |

- **出错**：`type` 不认识：`TypeError: notificationOccurred has no value "info"; expected one of: success / warning / error`

## 与 iOS 原生写法的对照

| ObjC | JS |
| --- | --- |
| `[UIImpactFeedbackGenerator feedbackGeneratorWithStyle:UIImpactFeedbackStyleMedium forView:view]` | `UIImpactFeedbackGenerator.feedbackGeneratorWithStyle('medium', { forView: view })` |
| `[UISelectionFeedbackGenerator feedbackGeneratorForView:view]` | `UISelectionFeedbackGenerator.feedbackGeneratorForView(view)` |
| `[[UIImpactFeedbackGenerator alloc] initWithStyle:UIImpactFeedbackStyleMedium]` | 没有对应的写法。这个初始化方法已被 Apple 标为将废弃，用上面绑定视图的写法 |
| `[generator prepare]` | `generator.prepare()` |
| `[generator impactOccurred]` | `generator.impactOccurred()` |
| `[generator impactOccurredWithIntensity:0.5]` | `generator.impactOccurredWithIntensity(0.5)` |
| `[generator selectionChanged]` | `generator.selectionChanged()` |
| `[generator notificationOccurred:UINotificationFeedbackTypeSuccess]` | `generator.notificationOccurred('success')` |

## 还不能做的

| 想做的事 | 对应的原生能力 | 状态 |
| --- | --- | --- |
| 指明震动发生在视图里的哪个位置 | `impactOccurredAtLocation:`、`selectionChangedAtLocation:` 等 | 未实现 |
| 自己编排震动的时长、强度和节奏 | Core Haptics（`CHHapticEngine`） | 未实现 |
| 知道用户有没有关掉触感反馈 | 无。系统不提供这个查询 | 做不到 |

## 参见

- [`UIControl`](ui-control.md)：`touchDown`、`touchUpInside`，触发震动的时机
- [`UIView`](ui-view.md)：创建时绑定的视图
