# 做开关、滑块和步进器

这一篇讲怎么用三种取值的控件让用户选一个值：[`UISwitch`](../api/ui-switch.md)（开关，两个取值）、[`UISlider`](../api/ui-slider.md)（滑块，在一段连续的范围里取值）、[`UIStepper`](../api/ui-stepper.md)（步进器，一档一档地加减）。每个属性和方法的细节在各自的参考页。

## 推荐的做法

- **用 [`change`](../api/ui-control/change-event.md) 得知值变了。** 三种控件都在用户改了值之后派发 `change`，回调里读到的是改过之后的值。代码写值不派发 `change`，所以恢复保存的设置时直接写，不会触发自己的监听器。「代码写值不派发」验收用例断言过。
- **先设范围，再设值。** 滑块和步进器写进去的值超出范围时不报错，被改成最近的那一头。先写值再改范围，值可能已经被改掉了。
- **要保存或发请求的操作，让一次拖动只处理一次。** 滑块和步进器默认在拖动、按住途中连续派发 `change`。把 `isContinuous` 设成 `false`，只在松手时派发一次。
- **开关和步进器的大小由系统决定**，只给位置的约束。滑块要给宽度。

## 第一个例子

从空白 App 开始，在页面上竖着排一个开关、一个滑块和一个步进器，每个控件变了都在控制台输出当前的值。

```js
application.addEventListener('sceneconnect', (e) => {
  // 建窗口和页面。每个 App 都要有这几行
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 1. 开关
  const sw = new UISwitch();
  sw.addEventListener('change', () => {
    console.log('开关', sw.isOn);
  });

  // 2. 滑块：先设范围，再设值
  const slider = new UISlider();
  slider.maximumValue = 100;
  slider.value = 40;
  slider.addEventListener('change', () => {
    console.log('滑块', Math.round(slider.value));
  });

  // 3. 步进器
  const stepper = new UIStepper();
  stepper.minimumValue = 1;
  stepper.maximumValue = 10;
  stepper.value = 1;
  stepper.addEventListener('change', () => {
    console.log('步进器', stepper.value);
  });

  // 4. 竖着排好放到页面上。滑块被拉到和这一列一样宽
  const column = new UIStackView([sw, slider, stepper]);
  column.axis = 'vertical';
  column.spacing = 20;
  column.alignment = 'leading';
  column.translatesAutoresizingMaskIntoConstraints = false;
  page.view.addSubview(column);
  const safe = page.view.safeAreaLayoutGuide;
  NSLayoutConstraint.activateConstraints([
    column.topAnchor.constraintEqualToAnchor(safe.topAnchor, { constant: 24 }),
    column.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor, { constant: 16 }),
    column.trailingAnchor.constraintEqualToAnchor(safe.trailingAnchor, { constant: -16 }),
    slider.widthAnchor.constraintEqualToAnchor(column.widthAnchor),
  ]);
});
```

**效果**（未在模拟器验证）

- 页面上方从上到下是一个关着的开关、一条横贯页面的滑块、一个步进器。
- 点开关，控制台输出 `开关 true`。
- 拖滑块，控制台连续输出 `滑块 41`、`滑块 42` 这样的行。
- 点步进器的加号，控制台输出 `步进器 2`。

`alignment = 'leading'` 让开关和步进器保持系统给的大小、靠左摆；滑块另外用一条约束拉到和这一列一样宽。下面各节沿用这里的 `sw`、`slider` 和 `stepper`。单独试某一节时，先写这几行：

```js
const page = new UIViewController();
const sw = new UISwitch();
const slider = new UISlider();
const stepper = new UIStepper();
const column = new UIStackView([sw, slider, stepper]);
column.axis = 'vertical';
page.view.addSubview(column);
```

## 开关

### 带动画地切换

```js
sw.setOn(false, { animated: true });
console.log(sw.isOn);
```

**效果**：圆钮滑到左边（未在模拟器验证）。控制台输出 `false`：值在调用返回时就已经变了，不用等动画结束。

`setOn()` 和写 `isOn` 一样不派发 `change`。

### 换开关的颜色

```js
sw.onTintColor = '#5856D6';
sw.thumbTintColor = '#FFFFFF';
```

**效果**（未在模拟器验证）：开着的时候轨道是紫色，圆钮是白色。

两个属性写 `null` 都回到系统默认的颜色。颜色的写法见[颜色](../api/ui-color.md)。

### 让开关不能点

```js
sw.isEnabled = false;
```

**效果**（未在模拟器验证）：开关变淡，点它没有反应，也不派发事件。

`isEnabled` 继承自 [`UIControl`](../api/ui-control.md)。禁用之后代码仍然可以写 `isOn`。

### 保存失败时把开关改回去

```js
/** @param {boolean} on @returns {Promise<void>} */
async function save(on) {
  // 把设置发给服务器
}

sw.addEventListener('change', async () => {
  const wanted = sw.isOn;
  try {
    await save(wanted);
  } catch (err) {
    sw.setOn(!wanted, { animated: true });
  }
});
```

**效果**（未在模拟器验证）：用户切换后开关立刻变过去；保存失败时开关滑回原来的位置。

改回去用的是 `setOn()`，它不派发 `change`，所以不会再触发一次保存。

## 滑块

### 只在松手时处理

```js
slider.isContinuous = false;
slider.addEventListener('change', () => {
  console.log('选定了', Math.round(slider.value));
});
```

**效果**（未在模拟器验证）：拖动途中不输出。松手时输出一次，比如 `选定了 72`。

### 让滑块按固定的档位取值

滑块本身不分档。在回调里把值取整之后写回去，圆钮就停在档位上：

```js
slider.addEventListener('change', () => {
  const step = 10;
  slider.value = Math.round(slider.value / step) * step;
  console.log('音量', slider.value);
});
```

**效果**（未在模拟器验证）：拖动时圆钮每 10 一档地跳，控制台只出现 0、10、20 这样的数。

回调里写 `value` 不会再派发 `change`，所以不会循环。

### 显示滑块的值

滑块的三个数值是单精度浮点数：写 0.3 读回来是 0.30000001192092896。显示之前先取整或者保留固定的小数位：

```js
slider.maximumValue = 1;
slider.value = 0.3;
console.log(slider.value.toFixed(2));
```

**效果**：控制台输出 `0.30`。

比较两个值时也不要用 `===` 比小数。

### 带动画地改滑块的值

```js
slider.maximumValue = 100;
slider.setValue(80, { animated: true });
console.log(slider.value);
```

**效果**：圆钮滑到 80 的位置（未在模拟器验证）。控制台输出 `80`：值在调用返回时就已经变了。

### 换滑块的颜色

```js
slider.minimumTrackTintColor = '#FF9500';
slider.maximumTrackTintColor = 'systemGray';
slider.thumbTintColor = '#FFFFFF';
```

**效果**（未在模拟器验证）：圆钮左边那一段轨道是橙色，右边那一段是灰色，圆钮是白色。

三个属性写 `null` 都回到系统默认的颜色。

### 在轨道两头放图标

```js
slider.minimumValueImage = UIImage.systemImageNamed('speaker.fill');
slider.maximumValueImage = UIImage.systemImageNamed('speaker.wave.3.fill');
```

**效果**（未在模拟器验证）：轨道左头外面是一个小喇叭，右头外面是一个带声波的喇叭。轨道相应变短。

`systemImageNamed()` 取的是 SF Symbols，系统自带的一套图标，见 [`UIImage`](../api/ui-image.md)。

### 让一个气泡跟着圆钮走

[`thumbRectForBounds()`](../api/ui-slider/thumbrectforbounds.md) 给出圆钮画在滑块里的哪个位置。拿它去定另一个视图的位置：

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

## 步进器

### 每次加减 0.5

```js
stepper.stepValue = 0.5;
```

**效果**（未在模拟器验证）：点一下加号，值从 1 变成 1.5。

步进器不会把值对齐到 `stepValue` 的倍数：代码写 `stepper.value = 1.3`，之后点加号得到 1.8（未在模拟器验证）。

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

### 把步进器的值显示出来

步进器不显示数值。旁边放一个 [`UILabel`](../api/ui-label.md)，在 `change` 里更新：

```js
const count = new UILabel();
count.text = '数量 ' + stepper.value;
stepper.addEventListener('change', () => {
  count.text = '数量 ' + stepper.value;
});
```

**效果**：每点一下加号或减号，文字跟着变。`count` 还要放到页面上，写法见 [`UIStepper`](../api/ui-stepper.md) 的示例。

## 参见

- [`UISwitch`](../api/ui-switch.md)、[`UISlider`](../api/ui-slider.md)、[`UIStepper`](../api/ui-stepper.md)：全部属性和方法
- [`UIControl`](../api/ui-control.md)：`isEnabled`、全部控件事件
- [`UIStackView`](../api/ui-stack-view.md)：把控件排成一行或一列
- [颜色](../api/ui-color.md)：颜色字符串的写法
