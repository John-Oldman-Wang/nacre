---
type: reference
native: UISlider
status: partial
---

# UISlider

`UISlider` 表示一个滑块：一条横着的轨道上有一个圆钮，用户拖动圆钮在一个范围里选一个数。它用在音量、亮度、播放进度这类「在一段连续的范围里取值」的地方。

它是 [`UIControl`](ui-control.md) 的子类，所以也是一个视图：用 `new UISlider()` 创建，用 `addSubview` 放到页面上。

范围由 `minimumValue` 和 `maximumValue` 决定，默认是 0 到 1。当前的值读写 `value`。用户拖动时，滑块派发 `change` 事件。

**拖动途中 `change` 会连续派发很多次。** 每次只更新界面上的数字没有问题。要发网络请求、要保存的操作，把 `isContinuous` 设成 `false`，这样只在松手时派发一次。

**代码写 `value` 不派发 `change`。** 只有用户的操作才派发。这一条**未在模拟器验证**，来自 iOS 的定义。

**写进去的值超出范围时不报错，被改成最近的那一头。** 写 5 而范围是 0 到 1，读回来是 1。所以要先设范围，再设值。

**滑块没有自己的宽度。** 高度由系统决定（实测 iOS 27.2 上是 34 pt，[pt 是什么](units.md)），宽度要由代码给：写 `frame`，或者给宽度的约束。不给宽度时它的宽是 0，屏幕上看不到。

**三个数值是单精度浮点数。** 写 0.3 读回来是 0.30000001192092896。显示之前先取整或者保留固定的小数位；比较两个值时不要用 `===` 比小数。

> **注意**：这一页里的默认值、读写的结果和报错，在模拟器上用一个不带界面的程序跑过。屏幕上的样子和事件的派发还没有在模拟器上验证，下面在对应的地方标出。

## 完整例子

下面的代码从空白 App 开始，在屏幕上放一个 0 到 100 的滑块，上方的文字跟着显示当前的值。

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
  label.text = '音量 40';

  // 2. 滑块：先设范围，再设值
  const slider = new UISlider();
  slider.maximumValue = 100;
  slider.value = 40;

  // 3. 拖动时更新文字
  slider.addEventListener('change', () => {
    label.text = '音量 ' + Math.round(slider.value);
  });

  // 4. 竖着排好放到页面上，左右各留 16 pt
  const column = new UIStackView([label, slider]);
  column.axis = 'vertical';
  column.spacing = 12;
  column.translatesAutoresizingMaskIntoConstraints = false;
  page.view.addSubview(column);
  const safe = page.view.safeAreaLayoutGuide;
  NSLayoutConstraint.activateConstraints([
    column.topAnchor.constraintEqualToAnchor(safe.topAnchor, { constant: 24 }),
    column.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor, { constant: 16 }),
    column.trailingAnchor.constraintEqualToAnchor(safe.trailingAnchor, { constant: -16 }),
  ]);
});
```

**效果**（未在模拟器验证）：

- 屏幕上方出现「音量 40」，下面是一条横贯屏幕的滑块，圆钮在偏左的位置。
- 拖动圆钮，文字里的数字跟着变。
- 拖到最右边，文字是「音量 100」。

`safeAreaLayoutGuide` 是页面上不被刘海和圆角遮住的那块区域，见 [Auto Layout](auto-layout.md)。纵向的 [`UIStackView`](ui-stack-view.md) 会把滑块拉到和自己一样宽，所以这里不用单独给滑块宽度。

## 常见用法

以下例子都沿用上面的 `slider` 和 `label`。

### 只在松手时处理

```js
slider.isContinuous = false;
slider.addEventListener('change', () => {
  console.log('选定了', Math.round(slider.value));
});
```

**效果**（未在模拟器验证）：拖动途中不输出。松手时输出一次，比如 `选定了 72`。

### 只取整数，或者按固定的档位取值

滑块本身不分档。在回调里把值取整之后写回去，圆钮就停在档位上：

```js
slider.addEventListener('change', () => {
  const step = 10;
  slider.value = Math.round(slider.value / step) * step;
  label.text = '音量 ' + slider.value;
});
```

**效果**（未在模拟器验证）：拖动时圆钮每 10 一档地跳，文字只出现 0、10、20 这样的数。

回调里写 `value` 不会再派发 `change`，所以不会循环。

### 带动画地改值

```js
slider.setValue(80, { animated: true });
console.log(slider.value);
```

**效果**：圆钮滑到 80 的位置（未在模拟器验证）。控制台输出 `80`：值在调用返回时就已经变了。

### 换颜色

```js
slider.minimumTrackTintColor = '#FF9500';
slider.maximumTrackTintColor = 'systemGray';
slider.thumbTintColor = '#FFFFFF';
```

**效果**（未在模拟器验证）：圆钮左边那一段轨道是橙色，右边那一段是灰色，圆钮是白色。

三个属性写 `null` 都是回到系统默认的颜色。颜色的写法见[颜色](ui-color.md)。

### 在轨道两头放图标

```js
slider.minimumValueImage = UIImage.systemImageNamed('speaker.fill');
slider.maximumValueImage = UIImage.systemImageNamed('speaker.wave.3.fill');
```

**效果**（未在模拟器验证）：轨道左头外面是一个小喇叭，右头外面是一个带声波的喇叭。轨道相应变短。

`systemImageNamed` 取的是 SF Symbols，系统自带的一套图标，见 [`UIImage`](ui-image.md)。

### 让一个气泡跟着圆钮走

`thumbRectForBounds` 给出圆钮画在滑块里的哪个位置。拿它去定另一个视图的位置：

```js
const bubble = new UILabel();
bubble.textAlignment = 'center';
slider.addSubview(bubble);

slider.addEventListener('change', () => {
  const track = slider.trackRectForBounds(slider.bounds);
  const thumb = slider.thumbRectForBounds(slider.bounds, { trackRect: track, value: slider.value });
  bubble.text = String(Math.round(slider.value));
  bubble.frame = new CGRect(thumb.x, thumb.y - 28, thumb.width, 24);
});
```

**效果**（未在模拟器验证）：拖动时，圆钮正上方有一个数字跟着移动。

实测一条 300 × 34 pt、没有两头图标的滑块：轨道是 `(0, 14, 300, 6)`；值在最小时圆钮是 `(0, 5, 37, 24)`，值在最大时是 `(263, 5, 37, 24)`。

### 不要圆钮

```js
slider.sliderStyle = 'thumbless';
```

**效果**（未在模拟器验证）：滑块上没有圆钮，只剩一条填了一部分的轨道。一般用来显示播放进度。

## 成员说明

`UISlider` 继承 [`UIControl`](ui-control.md) 和 [`UIView`](ui-view.md) 的全部成员。下面只列它自己的。

### 构造

```js
const slider = new UISlider();
```

没有参数。

### 数值

| 属性 | 类型 | 可读 | 可写 | 默认值 | 含义 |
| --- | --- | --- | --- | --- | --- |
| `value` | `number` | 是 | 是 | 0 | 当前的值，没有单位。超出范围的值被改成最近的那一头 |
| `minimumValue` | `number` | 是 | 是 | 0 | 范围的下限。写入后 `value` 低于它时，`value` 变成它 |
| `maximumValue` | `number` | 是 | 是 | 1 | 范围的上限。写入后 `value` 高于它时，`value` 变成它 |
| `isContinuous` | `boolean` | 是 | 是 | `true` | `true`：拖动途中一直派发 `change`。`false`：只在松手时派发一次 |

三个数值写入时，能转成数的值都接受，比如 `'0.25'`。

下限写得比上限大时不报错：实测上限被改成和下限一样，`value` 也是这个数。

`value` 变了的通知：用户拖动时派发 `change`。代码写入不派发。

- **出错**：转不成数时抛，比如 `TypeError: value must be a finite number, got "half"`。属性保持原来的值。

### 外观

| 属性 | 类型 | 可读 | 可写 | 默认值 | 含义 |
| --- | --- | --- | --- | --- | --- |
| `minimumTrackTintColor` | 颜色字符串或 `null` | 是 | 是 | `null` | 圆钮左边那一段轨道的颜色。`null` 是系统默认 |
| `maximumTrackTintColor` | 颜色字符串或 `null` | 是 | 是 | `null` | 圆钮右边那一段轨道的颜色 |
| `thumbTintColor` | 颜色字符串或 `null` | 是 | 是 | `null` | 圆钮的颜色 |
| `minimumValueImage` | `UIImage` 或 `null` | 是 | 是 | `null` | 轨道左头外面的图 |
| `maximumValueImage` | `UIImage` 或 `null` | 是 | 是 | `null` | 轨道右头外面的图 |
| `sliderStyle` | `UISliderStyle` | 是 | 是 | `'default'` | 见下表 |

颜色写入时也接受 `UIColor` 对象。写了不合法的颜色字符串时不抛，运行时打一条警告，属性保持原来的值。

`sliderStyle` 的取值：

| 取值 | 效果 |
| --- | --- |
| `'default'` | 有圆钮 |
| `'thumbless'` | 没有圆钮 |

- `sliderStyle` 写了表里没有的值时不抛异常：属性保持原来的值，控制台输出一条警告 `[Nacre] sliderStyle has no value "round"; expected one of: default / thumbless, ignored`。
- **出错**：图给的不是 `UIImage`：`TypeError: minimumValueImage needs a UIImage or null`

### 把圆钮和轨道换成图

圆钮、左段轨道、右段轨道各可以换成一张图，并且按控件状态分别设。控件状态是 `normal`、`highlighted`（手指按着）、`disabled` 这几种，见 [`UIControl`](ui-control.md)。

| 方法 | 作用 |
| --- | --- |
| `setThumbImage(image, { forState })` | 设圆钮的图 |
| `setMinimumTrackImage(image, { forState })` | 设左段轨道的图 |
| `setMaximumTrackImage(image, { forState })` | 设右段轨道的图 |
| `thumbImageForState(state)` | 取圆钮在这个状态下的图 |
| `minimumTrackImageForState(state)` | 取左段轨道的图 |
| `maximumTrackImageForState(state)` | 取右段轨道的图 |

设的三个方法：`image` 是 `UIImage` 或 `null`（`null` 是去掉），`forState` 是状态名的数组，一般写 `['normal']`。没有返回值。

取的三个方法：`state` 是一个状态名。返回 `UIImage` 或 `null`。某个状态没单独设过时，返回 `normal` 那张；`normal` 也没设过时返回 `null`。

```js
const dot = UIImage.systemImageNamed('circle.fill');
slider.setThumbImage(dot, { forState: ['normal'] });
console.log(slider.thumbImageForState('normal') === dot);
console.log(slider.thumbImageForState('highlighted') === dot);
```

**效果**：输出两次 `true`。圆钮显示成这张图（未在模拟器验证）。

| 属性 | 类型 | 可读 | 可写 | 含义 |
| --- | --- | --- | --- | --- |
| `currentThumbImage` | `UIImage` 或 `null` | 是 | 否 | 当前状态下圆钮用的图。没换过图时是 `null` |
| `currentMinimumTrackImage` | `UIImage` 或 `null` | 是 | 否 | 当前状态下左段轨道用的图 |
| `currentMaximumTrackImage` | `UIImage` 或 `null` | 是 | 否 | 当前状态下右段轨道用的图 |

`currentThumbImage` 在设过圆钮的图之后读到什么**未在模拟器验证**：实测有时是设进去的那张，有时是 `null`。要知道设的是哪张，用 `thumbImageForState`。

- **出错**：
  - 缺 `forState`：`TypeError: setThumbImage needs { forState }`
  - 状态名不认识：`TypeError: forState has no value "pressed"; expected one of: normal / highlighted / disabled / selected / focused`
  - 给的不是图：`TypeError: setThumbImage needs a UIImage or null`

### 各部分的位置

四个方法都返回一个 [`CGRect`](structs.md)，坐标在滑块自己的坐标系里，单位 pt。`bounds` 是一个矩形，一般传 `slider.bounds`。

| 方法 | 返回什么 |
| --- | --- |
| `trackRectForBounds(bounds)` | 轨道的位置 |
| `thumbRectForBounds(bounds, { trackRect, value })` | 值是 `value` 时圆钮的位置。`trackRect` 传上一个方法的结果 |
| `minimumValueImageRectForBounds(bounds)` | 左头那张图的位置。没设图时宽和高都是 0 |
| `maximumValueImageRectForBounds(bounds)` | 右头那张图的位置。没设图时宽和高都是 0 |

- **出错**：
  - `bounds` 不是矩形：`TypeError: trackRectForBounds needs an object with all of: x, y, width, height`
  - 缺选项：`TypeError: thumbRectForBounds needs { trackRect }`、`TypeError: thumbRectForBounds needs { value }`

### 方法

| 方法 | 作用 |
| --- | --- |
| `setValue(value, options?)` | 把值改成 `value`。`options.animated` 为 `true` 时带动画。超出范围的值同样被改成最近的那一头。没有返回值 |

- **出错**：`TypeError: setValue must be a finite number, got "max"`

### 事件

事件是 [`UIControl`](ui-control.md#事件) 的那 16 个。滑块用到的是：

| 事件 | 什么时候派发 |
| --- | --- |
| `change` | 用户拖动改了值。`isContinuous` 为 `true` 时拖动途中连续派发 |
| `touchdown` | 手指按到滑块上 |
| `touchupinside`、`touchupoutside` | 手指松开 |

## 与 iOS 原生写法的对照

| ObjC | JS |
| --- | --- |
| `[[UISlider alloc] init]` | `new UISlider()` |
| `slider.value = 0.5f` | `slider.value = 0.5` |
| `[slider setValue:0.5f animated:YES]` | `slider.setValue(0.5, { animated: true })` |
| `slider.continuous = NO` | `slider.isContinuous = false` |
| `slider.minimumTrackTintColor = UIColor.orangeColor` | `slider.minimumTrackTintColor = 'orange'` |
| `[slider setThumbImage:image forState:UIControlStateNormal]` | `slider.setThumbImage(image, { forState: ['normal'] })` |
| `[slider thumbImageForState:UIControlStateNormal]` | `slider.thumbImageForState('normal')` |
| `[slider thumbRectForBounds:b trackRect:t value:v]` | `slider.thumbRectForBounds(b, { trackRect: t, value: v })` |
| `slider.sliderStyle = UISliderStyleThumbless` | `slider.sliderStyle = 'thumbless'` |

## 与浏览器的对照

| 浏览器 | Nacre |
| --- | --- |
| `<input type="range" min max step>` | `new UISlider()`，`minimumValue`、`maximumValue`。没有 `step`，见[按固定的档位取值](#只取整数或者按固定的档位取值) |
| `input` 事件（拖动途中） | `change`，`isContinuous` 为 `true` |
| `change` 事件（松手时） | `change`，`isContinuous` 为 `false` |

## 还不能做的

| 想做的事 | 对应的原生能力 | 状态 |
| --- | --- | --- |
| 在轨道上画刻度，让圆钮只能停在刻度上 | `trackConfiguration`（`UISliderTrackConfiguration`、`UISliderTick`） | 未实现 |
| 改变轨道和圆钮的画法 | 覆写 `trackRectForBounds:` 等 | 未实现。原生类还不能继承，见[原生类](native-classes.md) |
| 竖着的滑块 | 无。系统没有这个选项 | 用 [`transform`](ui-view.md) 把滑块转 90° |

## 参见

- [`UIControl`](ui-control.md)：控件状态、16 个控件事件
- [`UIImage`](ui-image.md)：取 SF Symbols 和自己的图
- [颜色](ui-color.md)：颜色字符串的写法
- [结构体](structs.md)：`CGRect`
- [实现原理](../internals/value-controls.md)：默认值和边界行为是怎么量的
