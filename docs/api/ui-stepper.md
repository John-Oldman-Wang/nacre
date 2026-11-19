---
type: reference
native: UIStepper
status: partial
---

# `UIStepper`

**`UIStepper`** 表示一个步进器：并排的一个减号按钮和一个加号按钮，用户点一下，数值减少或增加一档。它用在数量、人数这类「在当前值上加一点减一点」的地方。

步进器只有两个按钮，**不显示数值**。当前的值读写 [`value`](ui-stepper/value.md)，要显示出来就另外放一个 [`UILabel`](ui-label.md)，在 [`change`](ui-control/change-event.md) 事件里更新它。

每点一下变多少由 [`stepValue`](ui-stepper/stepvalue.md) 决定，范围由 [`minimumValue`](ui-stepper/minimumvalue.md) 和 [`maximumValue`](ui-stepper/maximumvalue.md) 决定。到了范围的一头，那一侧的按钮变成不可点。用户按住按钮不放时，数值连续变化。

步进器的大小由系统决定，实测 iOS 27.2 上是 94 × 32 [pt](units.md)。用 Auto Layout 时只给位置的约束。

步进器是[控件](ui-control.md)：禁用、状态和事件来自 `UIControl`。

**继承关系**：`EventTarget` → `NSObject` → `UIResponder` → [`UIView`](ui-view.md) → [`UIControl`](ui-control.md) → `UIStepper`

常见的写法见指南[做开关、滑块和步进器](../guides/switches-sliders-steppers.md)。

## 构造函数

[`UIStepper()`](ui-stepper/constructor.md)

创建一个步进器，范围 0 到 100，每次加减 1。

## 实例属性

还继承 [`UIControl`](ui-control.md) 和 [`UIView`](ui-view.md) 的属性。步进器常用的继承属性是 [`isEnabled`](ui-control/isenabled.md)。

| 属性 | 说明 |
| --- | --- |
| [`value`](ui-stepper/value.md) | 当前的值 |
| [`minimumValue`](ui-stepper/minimumvalue.md) | 范围的下限 |
| [`maximumValue`](ui-stepper/maximumvalue.md) | 范围的上限 |
| [`stepValue`](ui-stepper/stepvalue.md) | 点一下加减多少 |
| [`isContinuous`](ui-stepper/iscontinuous.md) | 按住连续变化时，每变一次都派发 `change`，还是松手后才派发 |
| [`autorepeat`](ui-stepper/autorepeat.md) | 按住不放时是否连续加减 |
| [`wraps`](ui-stepper/wraps.md) | 到了一头再点，是否回到另一头 |

## 实例方法

步进器没有自己的方法。继承 [`UIControl`](ui-control.md) 和 [`UIView`](ui-view.md) 的方法。

## 事件

步进器的事件继承自 [`UIControl`](ui-control.md)，用 `addEventListener()` 监听。步进器用到的是：

| 事件 | 什么时候派发 |
| --- | --- |
| [`change`](ui-control/change-event.md) | 用户点了加号或减号，值变了。代码写 `value` 不派发 |

## 示例

### 选数量

从空白 App 开始，在屏幕上放一行「数量 1」和一个步进器，数量在 1 到 10 之间。

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const label = new UILabel();
  label.text = '数量 1';

  // 先设范围，再设值
  const stepper = new UIStepper();
  stepper.minimumValue = 1;
  stepper.maximumValue = 10;
  stepper.value = 1;

  stepper.addEventListener('change', () => {
    label.text = '数量 ' + stepper.value;
  });

  const row = new UIStackView([label, stepper]);
  row.spacing = 12;
  row.alignment = 'center';
  row.translatesAutoresizingMaskIntoConstraints = false;
  page.view.addSubview(row);
  const safe = page.view.safeAreaLayoutGuide;
  NSLayoutConstraint.activateConstraints([
    row.topAnchor.constraintEqualToAnchor(safe.topAnchor, { constant: 24 }),
    row.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor, { constant: 16 }),
  ]);
});
```

**效果**（未在模拟器验证）

- 屏幕左上方出现「数量 1」，右边是一个带减号和加号的步进器，减号是灰的。
- 点加号，文字变成「数量 2」，减号变成可点。
- 按住加号不放，数字连续增加，到「数量 10」停下，加号变灰。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[[UIStepper alloc] init]` | `new UIStepper()` |
| `stepper.value = 5` | `stepper.value = 5` |
| `stepper.stepValue = 0.5` | `stepper.stepValue = 0.5` |
| `stepper.continuous = NO` | `stepper.isContinuous = false` |
| `stepper.wraps = YES` | `stepper.wraps = true` |
| `[stepper addTarget:self action:@selector(changed:) forControlEvents:UIControlEventValueChanged]` | `stepper.addEventListener('change', fn)` |

## 与浏览器的对照

| 浏览器 | Nacre |
| --- | --- |
| `<input type="number" min max step>`，带输入框和上下箭头 | `new UIStepper()` 只有加减两个按钮，没有输入框，数值要自己显示 |
| `input.stepUp()`、`input.stepDown()` | 没有对应的方法。自己写 `stepper.value += stepper.stepValue` |

## 还不能做的

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 把加号、减号、底图、中间的分隔线换成自己的图 | `setIncrementImage:forState:`、`setDecrementImage:forState:`、`setBackgroundImage:forState:`、`setDividerImage:forLeftSegmentState:rightSegmentState:`。不做：实测 iOS 27.2 上这四个方法设进去的图读不回来（读到的是空） |

## 参见

- [做开关、滑块和步进器](../guides/switches-sliders-steppers.md)：按 0.5 加减、回绕、只在松手后处理
- [`UIControl`](ui-control.md)：`isEnabled`、全部控件事件
- [`UILabel`](ui-label.md)：显示当前的值
- [`UISlider`](ui-slider.md)：范围大、不需要精确到一档时用滑块
- [实现原理](../internals/value-controls.md)：默认值和边界行为是怎么量的
