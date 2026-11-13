---
type: reference
native: UIFeedbackGenerator
status: partial
---

# 触感反馈

**触感反馈**是手机配合界面变化发出的一次短促震动，比如按钮按下、开关拨动、操作成功或失败。震动的力度和节奏由系统预设，App 只选择用哪一种，不能指定震多久、震多强的波形。

触感反馈由三个类提供，每个类对应一类场合。这三个类的对象叫生成器：

| 类 | 表示什么 | 触发的方法 |
| --- | --- | --- |
| `UIImpactFeedbackGenerator` | 撞击：两个东西碰到一起 | `impactOccurred()` |
| `UISelectionFeedbackGenerator` | 选择变了：从一项换到另一项 | `selectionChanged()` |
| `UINotificationFeedbackGenerator` | 通知：一件事成功了、需要注意、失败了 | `notificationOccurred(type)` |

生成器不能用 `new` 创建，只能用类上的方法创建，创建时必须给出一个视图，表示这次反馈和界面上的哪个视图有关。通常给触发反馈的那个控件；没有明确的控件时给页面的根视图 `page.view`。生成器创建之后可以反复触发。

调用触发的方法就发出一次震动。方法没有返回值，也没有「震完了」的通知。

## 什么时候没有震动

以下情况下调用不报错，只是没有震动：

- **在模拟器上。** 模拟器没有震动部件。创建生成器、调用各个方法、写错参数时的报错，在模拟器上都和真机一样，只是感受不到震动。
- **用户在系统设置里关掉了触感反馈。** App 查不到这个设置，也不需要查：照常调用即可。这一条**未在模拟器验证**，来自 iOS 的定义。

所以触感反馈只能作为补充。操作的结果必须同时在界面上表现出来，不能只靠震动告诉用户。

这一页里描述震感的句子（轻重、节奏的差别）都**未在模拟器验证**：真机（iPhone 14）上核对过的是调用被执行、没有报错，震感本身没有记录。

## 推荐的做法

**按场合选类，不按想要的力度选。** 系统给每类场合规定了一致的震感，用户在别的 App 里已经熟悉了它们。场合和类的对应：

| 场合 | 用哪个 |
| --- | --- |
| 按钮按下、卡片落到位、拖动的东西碰到边界 | `UIImpactFeedbackGenerator`，力度按界面元素的大小选：小的用 `'light'`，一般的用 `'medium'`，大的用 `'heavy'` |
| 拖动中，震感要跟着拖动的距离变强 | `UIImpactFeedbackGenerator` 的 `impactOccurredWithIntensity()` |
| 滚轮转过一格、滑块经过一个刻度、列表的选中项换了 | `UISelectionFeedbackGenerator` |
| 提交成功、支付完成 | `UINotificationFeedbackGenerator`，`'success'` |
| 余额不足的提醒、需要用户确认的情况 | `UINotificationFeedbackGenerator`，`'warning'` |
| 提交失败、密码错误 | `UINotificationFeedbackGenerator`，`'error'` |

**生成器创建一次，保存下来反复用。** 在建界面时创建，放在事件回调能访问到的变量里。`prepare()` 的准备状态属于调用它的那个生成器，每次触发都新建一个生成器就用不上它。

**震动要对应一次界面变化。** 用户看不到变化却感到震动，会不明白发生了什么。同一个操作只震一次；页面加载完成、定时刷新这类不是用户直接触发的事不要震。

**`prepare()` 可以不调。** 它只在震动必须和动作贴得很紧时才有用，见[减小震动的延迟](#减小震动的延迟)。

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

  // 2. 创建两个生成器，都绑定到这个按钮上
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

这段代码没有作为一个整体在模拟器运行过。在模拟器上运行时按钮照常出现，按下和松手都没有震动。

两个生成器在建界面时创建一次，两个回调里反复使用。

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

力度在创建时确定，之后不能改。要用几种力度，就创建几个生成器。五种力度的差别见[成员说明](#uiimpactfeedbackgenerator)。

### 让同一种力度震得弱一些

```js
const tap = UIImpactFeedbackGenerator.feedbackGeneratorWithStyle('heavy', { forView: button });
tap.impactOccurredWithIntensity(0.3);
```

**效果**：震一下，质感是 `heavy` 的，强度只有满强度的 30%。

`intensity` 是 0 到 1 之间的比例，1 是这种力度的满强度，0 和 1 都可以写。超出这个范围会抛 `TypeError`，不会自动截到范围内，所以由计算得到的值要先限制范围：

```js
const pull = UIImpactFeedbackGenerator.feedbackGeneratorWithStyle('medium', { forView: button });

/** @param {number} distance 拖动的距离，单位 pt */
function onDrag(distance) {
  const intensity = Math.min(1, Math.max(0, distance / 200));
  pull.impactOccurredWithIntensity(intensity);
}

onDrag(50);
onDrag(400);
```

**效果**：震两下。第一下的强度是满强度的 25%，第二下是满强度：400 pt 算出来是 2，被限制到 1。

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

### 减小震动的延迟

`prepare()` 让系统的震动部件提前进入就绪状态。Apple 对它的说明是：这样做能减小触发震动时的延迟。知道马上要震的时候先调它，比如手指按下时准备、松手时触发：

```js
const tap = UIImpactFeedbackGenerator.feedbackGeneratorWithStyle('medium', { forView: button });

button.addEventListener('touchDown', () => {
  tap.prepare();   // 手指按下：很可能马上要震，先准备
});
button.addEventListener('touchUpInside', () => {
  tap.impactOccurred();
});
```

**效果**：松手时震一下。

不调 `prepare()` 也能震，验收用例里两种写法都执行过，都不报错。调与不调的延迟差多少没有测量过，**未在模拟器验证**。按 Apple 的说明，就绪状态只保持很短的时间，所以要在马上要震之前调，不要在建界面时调一次了事。

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

三个类都**不能用 `new`**，只能用类上的方法创建。创建时要给一个视图，表示这次反馈和哪个视图有关。验收用例里给的都是已经显示在屏幕上的视图；给一个还没加到界面上的视图时是否有震动，**未在模拟器验证**。

| 写法 | 返回 |
| --- | --- |
| `UIImpactFeedbackGenerator.feedbackGeneratorWithStyle(style, { forView })` | `UIImpactFeedbackGenerator` |
| `UISelectionFeedbackGenerator.feedbackGeneratorForView(view)` | `UISelectionFeedbackGenerator` |
| `UINotificationFeedbackGenerator.feedbackGeneratorForView(view)` | `UINotificationFeedbackGenerator` |

- `style`：力度，字符串，取值见下面的表。创建之后不能改。
- `forView`、`view`：一个 [`UIView`](ui-view.md) 或它的子类的对象，必填，不能是 `null`。
- 每次调用得到一个新的对象。
- **出错**：
  - 用 `new`：`TypeError: Illegal constructor: UIImpactFeedbackGenerator has no public initializer; use UIImpactFeedbackGenerator.feedbackGeneratorWithStyle(style, { forView: view })`
  - `style` 不认识：`TypeError: style has no value "strong"; expected one of: light / medium / heavy / soft / rigid`
  - 没给 `forView`：`TypeError: feedbackGeneratorWithStyle needs { forView }`
  - `forView` 给的不是视图：`TypeError: forView needs a UIView`
  - `feedbackGeneratorForView()` 给的不是视图：`TypeError: feedbackGeneratorForView needs a UIView`
  - `new UIFeedbackGenerator()`：`TypeError: Illegal constructor: UIFeedbackGenerator has no public initializer; use one of its subclasses, e.g. UIImpactFeedbackGenerator.feedbackGeneratorWithStyle(style, { forView: view })`

### `prepare()`

三个类都有。让系统的震动部件提前就绪。没有参数，没有返回值，自己不产生震动。可以不调，见[减小震动的延迟](#减小震动的延迟)。

### `UIImpactFeedbackGenerator`

| 方法 | 作用 |
| --- | --- |
| `impactOccurred()` | 震一下，力度是创建时给的那一种，满强度 |
| `impactOccurredWithIntensity(intensity)` | 震一下。`intensity` 是 0 到 1 之间的比例，1 是满强度。能转成数的值都接受，比如 `'0.5'` |

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
| `selectionChanged()` | 很轻地震一下。没有参数，没有返回值。它只发出震动，不知道界面上选中了什么；选中项变了的时候由代码调用它 |

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

三种的震动节奏不同。

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

## 与浏览器的对照

| 浏览器 | Nacre |
| --- | --- |
| `navigator.vibrate(200)`，指定震动的毫秒数 | 没有对应。只能从系统预设的几种震感里选 |
| 没有对应 | 三个生成器类 |

## 还不能做的

| 想做的事 | 对应的原生能力 | 状态 |
| --- | --- | --- |
| 指明震动发生在视图里的哪个位置 | `impactOccurredAtLocation:`、`selectionChangedAtLocation:` 等 | 未实现 |
| 自己编排震动的时长、强度和节奏 | Core Haptics（`CHHapticEngine`） | 未实现 |
| 知道用户有没有关掉触感反馈 | 无。系统不提供这个查询 | 做不到 |

## 参见

- [`UIControl`](ui-control.md)：`touchDown`、`touchUpInside`，触发震动的时机
- [`UIView`](ui-view.md)：创建时绑定的视图
