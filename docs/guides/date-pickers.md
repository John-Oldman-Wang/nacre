# 让用户选日期和时间

这一篇讲怎么用 [`UIDatePicker`](../api/ui-date-picker.md) 让用户选一个日期、一个时间或者一段时长：选样式、限定范围、选时长、用代码改日期。每个属性和方法的细节在 [`UIDatePicker`](../api/ui-date-picker.md) 的参考页。

## 推荐的做法

- **表单里的一个日期字段，用默认的 `'compact'` 样式。** 它只占一行，点开才显示日历。页面的主要内容就是选日期时用 `'inline'`。只有选时长和选年月必须用滚轮，见[选哪种样式](#选哪种样式)。
- **监听 [`change`](../api/ui-control/change-event.md)，在回调里读 [`date`](../api/ui-date-picker/date.md)。** 代码写 `date` 不派发 `change`。
- **按年月日比较日期，不比较毫秒数。** `date` 是一个完整的时刻，只选日期的模式下也带着时分秒。判断是不是同一天，用 `getFullYear()`、`getMonth()`、`getDate()`。
- **把日期显示成文字，用 `toLocaleDateString()` 或 [`Intl.DateTimeFormat`](../api/intl-date.md)。** 它们和选择器用的是同一个时区和地区设置。

## 第一个日期选择器

从空白 App 开始，放一个只选日期的选择器，范围是今天起的 30 天，下面的文字显示选中的日期。

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 1. 只选日期
  const picker = new UIDatePicker();
  picker.datePickerMode = 'date';

  // 2. 只能选今天到 30 天后
  const today = new Date();
  picker.minimumDate = today;
  picker.maximumDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

  // 3. 显示选中的日期
  const label = new UILabel();
  label.text = '还没选';

  // 4. 用户改了选择时更新文字
  picker.addEventListener('change', () => {
    label.text = '选了 ' + picker.date.toLocaleDateString();
  });

  // 5. 竖着排好放到页面上
  const column = new UIStackView([picker, label]);
  column.axis = 'vertical';
  column.alignment = 'leading';
  column.spacing = 12;
  column.translatesAutoresizingMaskIntoConstraints = false;
  page.view.addSubview(column);
  const safe = page.view.safeAreaLayoutGuide;
  NSLayoutConstraint.activateConstraints([
    column.topAnchor.constraintEqualToAnchor(safe.topAnchor, { constant: 24 }),
    column.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor, { constant: 16 }),
  ]);
});
```

**效果**（未在模拟器验证）

- 屏幕左上方出现一个小按钮，上面是今天的日期，下面是「还没选」。
- 点那个按钮，弹出一个月历。今天之前的日子和 30 天之后的日子是灰的，点不了。
- 点月历里的一天，按钮上的日期变了，文字变成「选了」加那一天。
- 点月历外面，月历收起。

下面几节用一个新建的 `picker`：

```js
const picker = new UIDatePicker();
```

**效果**：一个日期和时间都选的选择器，选中的是此刻，还没有加到页面上。

## 选哪种样式

样式由 [`preferredDatePickerStyle`](../api/ui-date-picker/preferreddatepickerstyle.md) 决定：

| 样式 | 样子 | 适合 |
| --- | --- | --- |
| `'compact'` | 一个小按钮，点了弹出日历，高 36 pt | 表单里的一个字段。iPhone 上默认就是它 |
| `'inline'` | 一整块日历铺在页面里 | 页面的主要内容就是选日期 |
| `'wheels'` | 几列滚轮，320 × 216 pt | 选时长、选年月（只能用它）；或者想要滚轮的手感 |

尺寸是 iOS 27.2 上的实测值。

## 日历直接铺在页面上

```js
picker.preferredDatePickerStyle = 'inline';
console.log(picker.datePickerStyle);
```

**效果**：输出 `inline`。页面上直接显示一整块月历，不用点开（未在模拟器验证）。

## 用滚轮

```js
picker.preferredDatePickerStyle = 'wheels';
```

**效果**（未在模拟器验证）：选择器变成几列滚轮，用手指上下拨。

## 只选时间，每 15 分钟一档

```js
picker.datePickerMode = 'time';
picker.minuteInterval = 15;
```

**效果**（未在模拟器验证）：选择器只有小时和分钟，分钟只有 00、15、30、45 四个选项。

写了 `minuteInterval` 之后，`date` 立刻被取整到档位上，之后写进去的 `date` 也会被取整。实测 15 分钟一档时，22:14:02 变成 22:00:02：分钟向下取到档位上，秒保留，毫秒去掉。不想让代码写进去的时刻被取整，把 [`roundsToMinuteInterval`](../api/ui-date-picker/roundstominuteinterval.md) 设成 `false`。

## 选一段时长

`'countDownTimer'` 模式选的是「几小时几分钟」，不是一个时刻。它只有滚轮样式，并且读写的是 [`countDownDuration`](../api/ui-date-picker/countdownduration.md)，不是 `date`。

```js
const timer = new UIDatePicker();
timer.datePickerMode = 'countDownTimer';
timer.countDownDuration = 5 * 60;
timer.addEventListener('change', () => {
  console.log('选了', timer.countDownDuration / 60, '分钟');
});
```

**效果**（未在模拟器验证）：两列滚轮，「小时」和「分钟」，停在 0 小时 5 分钟。拨到 1 小时 30 分钟，控制台输出 `选了 90 分钟`。

三件要注意的事：

- **先切模式，再写时长。** 不在这个模式下写 `countDownDuration` 会抛 `TypeError`。
- **时长的单位是秒，但只精确到分钟。** 写 125，读回来是 120。
- **最短 1 分钟。** 写 0 到 59 之间的数，读回来是 60。

`picker.preferredDatePickerStyle` 已经是 `'compact'` 或 `'inline'` 时，切到这个模式会抛 `TypeError`。先把样式改成 `'wheels'` 或 `'automatic'`。

## 用代码改日期

```js
picker.preferredDatePickerStyle = 'wheels';
picker.datePickerMode = 'date';
picker.setDate(new Date(2027, 0, 1), { animated: true });
```

**效果**：选择器显示 2027 年 1 月 1 日，滚轮转过去（转动未在模拟器验证）。

`new Date(2027, 0, 1)` 的月份从 0 数，0 是 1 月。不要动画时直接写 `picker.date`。

写进去的日期早于 `minimumDate` 或者晚于 `maximumDate` 时不报错，被改成最近的那个界限。

## 参见

- [`UIDatePicker`](../api/ui-date-picker.md)：全部属性和方法
- [`Intl.DateTimeFormat`](../api/intl-date.md)：把选中的 `Date` 按地区写成文字
- [`UIControl`](../api/ui-control.md)：控件事件和禁用
- [`UIStackView`](../api/ui-stack-view.md)：把选择器和别的控件排在一起
