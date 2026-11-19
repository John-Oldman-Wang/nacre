---
type: reference
native: UISlider
status: partial
---

# `UISlider`

**`UISlider`** 表示一个滑块：一条横着的轨道上有一个圆钮，用户拖动圆钮在一个范围里选一个数。它用在音量、亮度、播放进度这类「在一段连续的范围里取值」的地方。

范围由 [`minimumValue`](ui-slider/minimumvalue.md) 和 [`maximumValue`](ui-slider/maximumvalue.md) 决定，默认是 0 到 1。当前的值读写 [`value`](ui-slider/value.md)。用户拖动时，滑块派发 [`change`](ui-control/change-event.md) 事件；拖动途中默认连续派发很多次，[`isContinuous`](ui-slider/iscontinuous.md) 设成 `false` 时只在松手时派发一次。

滑块的高度由系统决定，实测 iOS 27.2 上是 34 [pt](units.md)。滑块没有自己的宽度：宽度要由代码给，写 `frame` 或者给宽度的约束。不给宽度时它的宽是 0，屏幕上看不到。

三个数值是单精度浮点数：写 0.3 读回来是 0.30000001192092896。

滑块是[控件](ui-control.md)：禁用、状态和事件来自 `UIControl`。

**继承关系**：`EventTarget` → `NSObject` → `UIResponder` → [`UIView`](ui-view.md) → [`UIControl`](ui-control.md) → `UISlider`

常见的写法见指南[做开关、滑块和步进器](../guides/switches-sliders-steppers.md)。

## 构造函数

[`UISlider()`](ui-slider/constructor.md)

创建一个范围 0 到 1、值为 0 的滑块。

## 实例属性

还继承 [`UIControl`](ui-control.md) 和 [`UIView`](ui-view.md) 的属性。滑块常用的继承属性是 [`isEnabled`](ui-control/isenabled.md)、`frame`。

数值：

| 属性 | 说明 |
| --- | --- |
| [`value`](ui-slider/value.md) | 当前的值 |
| [`minimumValue`](ui-slider/minimumvalue.md) | 范围的下限 |
| [`maximumValue`](ui-slider/maximumvalue.md) | 范围的上限 |
| [`isContinuous`](ui-slider/iscontinuous.md) | 拖动途中是否一直派发 `change` |

外观：

| 属性 | 说明 |
| --- | --- |
| [`sliderStyle`](ui-slider/sliderstyle.md) | 有没有圆钮 |
| [`minimumTrackTintColor`](ui-slider/minimumtracktintcolor.md) | 圆钮左边那一段轨道的颜色 |
| [`maximumTrackTintColor`](ui-slider/maximumtracktintcolor.md) | 圆钮右边那一段轨道的颜色 |
| [`thumbTintColor`](ui-slider/thumbtintcolor.md) | 圆钮的颜色 |
| [`minimumValueImage`](ui-slider/minimumvalueimage.md) | 轨道左头外面的图 |
| [`maximumValueImage`](ui-slider/maximumvalueimage.md) | 轨道右头外面的图 |
| [`currentThumbImage`](ui-slider/currentthumbimage.md) <small>只读</small> | 当前状态下圆钮用的图 |
| [`currentMinimumTrackImage`](ui-slider/currentminimumtrackimage.md) <small>只读</small> | 当前状态下左段轨道用的图 |
| [`currentMaximumTrackImage`](ui-slider/currentmaximumtrackimage.md) <small>只读</small> | 当前状态下右段轨道用的图 |

## 实例方法

还继承 [`UIControl`](ui-control.md) 和 [`UIView`](ui-view.md) 的方法。

| 方法 | 说明 |
| --- | --- |
| [`setValue()`](ui-slider/setvalue.md) | 改值，可以带动画 |

把圆钮和轨道换成图，按[状态](ui-control.md#状态)分别设：

| 方法 | 说明 |
| --- | --- |
| [`setThumbImage()`](ui-slider/setthumbimage.md) | 设圆钮的图 |
| [`setMinimumTrackImage()`](ui-slider/setminimumtrackimage.md) | 设左段轨道的图 |
| [`setMaximumTrackImage()`](ui-slider/setmaximumtrackimage.md) | 设右段轨道的图 |
| [`thumbImageForState()`](ui-slider/thumbimageforstate.md) | 某个状态下圆钮的图 |
| [`minimumTrackImageForState()`](ui-slider/minimumtrackimageforstate.md) | 某个状态下左段轨道的图 |
| [`maximumTrackImageForState()`](ui-slider/maximumtrackimageforstate.md) | 某个状态下右段轨道的图 |

各部分画在滑块里的哪个位置：

| 方法 | 说明 |
| --- | --- |
| [`trackRectForBounds()`](ui-slider/trackrectforbounds.md) | 轨道的位置 |
| [`thumbRectForBounds()`](ui-slider/thumbrectforbounds.md) | 值是某个数时圆钮的位置 |
| [`minimumValueImageRectForBounds()`](ui-slider/minimumvalueimagerectforbounds.md) | 左头那张图的位置 |
| [`maximumValueImageRectForBounds()`](ui-slider/maximumvalueimagerectforbounds.md) | 右头那张图的位置 |

## 事件

滑块的事件继承自 [`UIControl`](ui-control.md)，用 `addEventListener()` 监听。滑块用到的是：

| 事件 | 什么时候派发 |
| --- | --- |
| [`change`](ui-control/change-event.md) | 用户拖动改了值。`isContinuous` 为 `true` 时拖动途中连续派发，为 `false` 时松手派发一次。代码写 `value` 不派发 |
| [`touchdown`](ui-control/touchdown-event.md) | 手指按到滑块上 |
| [`touchupinside`](ui-control/touchupinside-event.md)、[`touchupoutside`](ui-control/touchupoutside-event.md) | 手指松开 |

## 示例

### 音量滑块

从空白 App 开始，在屏幕上放一个 0 到 100 的滑块，上方的文字跟着显示当前的值。

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const label = new UILabel();
  label.text = '音量 40';

  // 先设范围，再设值
  const slider = new UISlider();
  slider.maximumValue = 100;
  slider.value = 40;

  slider.addEventListener('change', () => {
    label.text = '音量 ' + Math.round(slider.value);
  });

  // 纵向的 UIStackView 把滑块拉到和自己一样宽
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

**效果**（未在模拟器验证）

- 屏幕上方出现「音量 40」，下面是一条横贯屏幕的滑块，圆钮在偏左的位置。
- 拖动圆钮，文字里的数字跟着变。
- 拖到最右边，文字是「音量 100」。

## 对应的 iOS API

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
| `<input type="range" min max step>` | `new UISlider()`，`minimumValue`、`maximumValue`。没有 `step`，见[按固定的档位取值](../guides/switches-sliders-steppers.md#让滑块按固定的档位取值) |
| `input` 事件（拖动途中） | `change`，`isContinuous` 为 `true` |
| `change` 事件（松手时） | `change`，`isContinuous` 为 `false` |

## 参见

- [做开关、滑块和步进器](../guides/switches-sliders-steppers.md)：只在松手时处理、按档位取值、跟着圆钮走的气泡
- [`UIControl`](ui-control.md)：控件状态、全部控件事件
- [`UIImage`](ui-image.md)：取 SF Symbols 和自己的图
- [颜色](ui-color.md)：颜色字符串的写法
- [结构体](structs.md)：`CGRect`
