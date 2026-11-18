---
type: reference
native: UIStepper
status: partial
---

# UIStepper

`UIStepper` 表示一个步进器：并排的一个减号按钮和一个加号按钮，用户点一下，数值减少或增加一档。它用在数量、人数这类「在当前值上加一点减一点」的地方。

它是 [`UIControl`](ui-control.md) 的子类，所以也是一个视图：用 `new UIStepper()` 创建，用 `addSubview` 放到页面上。

步进器只有两个按钮，**不显示数值**。当前的值读写 `value`，要显示出来就另外放一个 [`UILabel`](ui-label.md)，在 `change` 事件里更新它。

每点一下变多少由 `stepValue` 决定，默认是 1。范围由 `minimumValue` 和 `maximumValue` 决定，默认是 0 到 100。到了范围的一头，那一侧的按钮变成不可点。

用户按住按钮不放时，数值会连续变化，每变一次派发一次 `change`。

**代码写 `value` 不派发 `change`。** 只有用户的操作才派发。这一条**未在模拟器验证**，来自 iOS 的定义。

**步进器的大小由系统决定。** 实测 iOS 27.2 上是 94 × 32 pt（[pt 是什么](units.md)）。用 Auto Layout 时只给位置的约束。

> **注意**：这一页里的默认值、读写的结果和报错，在模拟器上用一个不带界面的程序跑过。屏幕上的样子和事件的派发还没有在模拟器上验证，下面在对应的地方标出。

## 完整例子

下面的代码从空白 App 开始，在屏幕上放一行「数量 1」和一个步进器，数量在 1 到 10 之间。

```js
application.addEventListener('sceneconnect', (e) => {
  // 建窗口和页面。每个 App 都要有这几行
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 1. 显示数值的文字
  const label = new UILabel();
  label.text = '数量 1';

  // 2. 步进器：先设范围，再设值
  const stepper = new UIStepper();
  stepper.minimumValue = 1;
  stepper.maximumValue = 10;
  stepper.value = 1;

  // 3. 点加号减号时更新文字
  stepper.addEventListener('change', () => {
    label.text = '数量 ' + stepper.value;
  });

  // 4. 文字在左、步进器在右，排成一行放到页面上
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

**效果**（未在模拟器验证）：

- 屏幕左上方出现「数量 1」，右边是一个带减号和加号的步进器，减号是灰的。
- 点加号，文字变成「数量 2」，减号变成可点。
- 按住加号不放，数字连续增加，到「数量 10」停下，加号变灰。

`safeAreaLayoutGuide` 是页面上不被刘海和圆角遮住的那块区域，见 [Auto Layout](auto-layout.md)。

## 常见用法

以下例子都沿用上面的 `stepper` 和 `label`。

### 每次加减 0.5

```js
stepper.stepValue = 0.5;
```

**效果**（未在模拟器验证）：点一下加号，值从 1 变成 1.5。

`value` 是双精度浮点数。步进器不会把值对齐到 `stepValue` 的倍数：代码写 `stepper.value = 0.3`，读回来就是 0.3，之后点加号得到 0.8。

### 加到头之后回到最小值

```js
stepper.wraps = true;
```

**效果**（未在模拟器验证）：值是 10 时点加号，变成 1；值是 1 时点减号，变成 10。两个按钮一直可点。

`wraps` 只影响用户点按钮。代码写超出范围的值时，值仍然被改成最近的那一头：实测开着 `wraps` 写 500，读回来是上限。

### 按住时不要连续变化

```js
stepper.autorepeat = false;
```

**效果**（未在模拟器验证）：按住加号不放，值只加一次。

### 按住连加时，只在松手后处理一次

```js
stepper.isContinuous = false;
stepper.addEventListener('change', () => {
  console.log('定了', stepper.value);
});
```

**效果**（未在模拟器验证）：按住加号时值在连续增加，但不输出。松手后输出一次。

## 成员说明

`UIStepper` 继承 [`UIControl`](ui-control.md) 和 [`UIView`](ui-view.md) 的全部成员。下面只列它自己的。

### 构造

```js
const stepper = new UIStepper();
```

没有参数。

### 属性

| 属性 | 类型 | 可读 | 可写 | 默认值 | 含义 |
| --- | --- | --- | --- | --- | --- |
| `value` | `number` | 是 | 是 | 0 | 当前的值，没有单位。超出范围的值被改成最近的那一头 |
| `minimumValue` | `number` | 是 | 是 | 0 | 范围的下限。写入后 `value` 低于它时，`value` 变成它 |
| `maximumValue` | `number` | 是 | 是 | 100 | 范围的上限。写入后 `value` 高于它时，`value` 变成它 |
| `stepValue` | `number` | 是 | 是 | 1 | 点一下加减多少。必须大于 0 |
| `isContinuous` | `boolean` | 是 | 是 | `true` | `true`：按住连续变化时每变一次都派发 `change`。`false`：松手后才派发一次 |
| `autorepeat` | `boolean` | 是 | 是 | `true` | `true`：按住不放时连续加减。`false`：按一次只变一次 |
| `wraps` | `boolean` | 是 | 是 | `false` | `true`：到了一头再点，回到另一头。`false`：到了一头那一侧的按钮不可点 |

数值写入时，能转成数的值都接受，比如 `'5'`。

下限写得比上限大时不报错：实测上限被改成和下限一样，`value` 也是这个数。

`value` 变了的通知：用户点按钮时派发 `change`。代码写入不派发。

- **出错**：
  - `stepValue` 是 0 或负数：`TypeError: stepValue must be greater than 0, got 0`。属性保持原来的值
  - 转不成数：`TypeError: value must be a finite number, got "many"`

### 事件

事件是 [`UIControl`](ui-control.md#事件) 的那 16 个。步进器用到的是：

| 事件 | 什么时候派发 |
| --- | --- |
| `change` | 用户点了加号或减号，值变了 |

## 与 iOS 原生写法的对照

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

| 想做的事 | 对应的原生能力 | 状态 |
| --- | --- | --- |
| 把加号、减号、底图、中间的分隔线换成自己的图 | `setIncrementImage:forState:`、`setDecrementImage:forState:`、`setBackgroundImage:forState:`、`setDividerImage:forLeftSegmentState:rightSegmentState:` | 不做。实测 iOS 27.2 上这四个方法设进去的图读不回来（读到的是空） |

## 参见

- [`UIControl`](ui-control.md)：`isEnabled`、16 个控件事件
- [`UILabel`](ui-label.md)：显示当前的值
- [`UISlider`](ui-slider.md)：范围大、不需要精确到一档时用滑块
- [实现原理](../internals/value-controls.md)：默认值和边界行为是怎么量的
