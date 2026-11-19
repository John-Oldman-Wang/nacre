---
type: reference
native: UIDatePicker
status: partial
---

# `UIDatePicker`

**`UIDatePicker`** 表示一个日期选择器：系统提供的、让用户选一个日期、一个时间或者一段时长的控件。年月日的顺序、12 小时还是 24 小时、月份和星期的名字，都由系统按用户的地区设置显示，不用代码处理。

选中的时刻读写 [`date`](ui-date-picker/date.md)，它是一个 JS 的 `Date`。用户改了选择之后，控件派发 [`change`](ui-control/change-event.md) 事件。代码写 `date` 不派发 `change`。

选择器有两个互相独立的设置：

- **选什么**，由 [`datePickerMode`](ui-date-picker/datepickermode.md) 决定：只选时间、只选日期、日期和时间都选、选一段时长、只选年和月。
- **长什么样**，由 [`preferredDatePickerStyle`](ui-date-picker/preferreddatepickerstyle.md) 决定，有三种：

| 样式 | 样子 | 占多大地方 |
| --- | --- | --- |
| `'compact'` | 一个显示着当前日期的小按钮，点了之后弹出日历 | 一行，实测 iOS 27.2 上高 36 [pt](units.md) |
| `'wheels'` | 几列可以上下滚动的滚轮，直接嵌在页面里 | 实测 320 × 216 pt |
| `'inline'` | 一整块日历，直接铺在页面里 | 一个日历的大小 |

默认由系统选，iPhone 上是 `'compact'`。实际用的是哪一种，读 [`datePickerStyle`](ui-date-picker/datepickerstyle.md)。选一段时长和只选年月这两种模式只有滚轮样式。

`date` 是一个时刻，不带时区。选择器按设备的时区显示它，和 `Date` 的 `getHours()`、`toLocaleString()` 用的是同一个时区。只选日期的模式下，`date` 仍然是一个完整的时刻。

日期选择器是[控件](ui-control.md)：禁用、状态和事件来自 `UIControl`。控件又是[视图](ui-view.md)：位置、大小来自 `UIView`。

**继承关系**：`EventTarget` → `NSObject` → `UIResponder` → [`UIView`](ui-view.md) → [`UIControl`](ui-control.md) → `UIDatePicker`

选哪种样式、怎么选时长、怎么限定范围，见指南[让用户选日期和时间](../guides/date-pickers.md)。

## 构造函数

[`UIDatePicker()`](ui-date-picker/constructor.md)

创建一个日期选择器，选中的是创建的那一刻。

## 实例属性

还继承 [`UIControl`](ui-control.md) 和 [`UIView`](ui-view.md) 的属性。日期选择器常用的继承属性是 `isEnabled`、`translatesAutoresizingMaskIntoConstraints`。

日期：

| 属性 | 说明 |
| --- | --- |
| [`date`](ui-date-picker/date.md) | 选中的时刻 |
| [`minimumDate`](ui-date-picker/minimumdate.md) | 能选的最早的时刻 |
| [`maximumDate`](ui-date-picker/maximumdate.md) | 能选的最晚的时刻 |

模式和样式：

| 属性 | 说明 |
| --- | --- |
| [`datePickerMode`](ui-date-picker/datepickermode.md) | 选什么：时间、日期、两样都选、时长、年月 |
| [`preferredDatePickerStyle`](ui-date-picker/preferreddatepickerstyle.md) | 想要的样式 |
| [`datePickerStyle`](ui-date-picker/datepickerstyle.md) <small>只读</small> | 实际用的样式 |

时长和分钟的档位：

| 属性 | 说明 |
| --- | --- |
| [`countDownDuration`](ui-date-picker/countdownduration.md) | 选一段时长的模式下，选中的时长 |
| [`minuteInterval`](ui-date-picker/minuteinterval.md) | 分钟那一栏隔几分钟一档 |
| [`roundsToMinuteInterval`](ui-date-picker/roundstominuteinterval.md) | 代码写进去的日期是否取整到档位上 |

## 实例方法

还继承 [`UIControl`](ui-control.md) 和 [`UIView`](ui-view.md) 的方法。

| 方法 | 说明 |
| --- | --- |
| [`setDate()`](ui-date-picker/setdate.md) | 改选中的时刻，可以带动画 |

## 事件

事件都继承自 [`UIControl`](ui-control.md)，用 `addEventListener()` 监听。日期选择器用到的是：

| 事件 | 什么时候派发 |
| --- | --- |
| [`change`](ui-control/change-event.md) | 用户改了选中的日期、时间或时长 |

## 示例

### 选今天起 30 天内的一天

从空白 App 开始，放一个只选日期的选择器，下面的文字显示选中的日期。

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const picker = new UIDatePicker();
  picker.datePickerMode = 'date';

  const today = new Date();
  picker.minimumDate = today;
  picker.maximumDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

  const label = new UILabel();
  label.text = '还没选';

  picker.addEventListener('change', () => {
    label.text = '选了 ' + picker.date.toLocaleDateString();
  });

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

`safeAreaLayoutGuide` 是页面上不被刘海和圆角遮住的那块区域，见 [Auto Layout](auto-layout.md)。

更多写法见指南[让用户选日期和时间](../guides/date-pickers.md)。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[[UIDatePicker alloc] init]` | `new UIDatePicker()` |
| `picker.date`（`NSDate`） | `picker.date`（`Date`） |
| `[picker setDate:date animated:YES]` | `picker.setDate(date, { animated: true })` |
| `picker.datePickerMode = UIDatePickerModeDate` | `picker.datePickerMode = 'date'` |
| `picker.preferredDatePickerStyle = UIDatePickerStyleWheels` | `picker.preferredDatePickerStyle = 'wheels'` |
| `picker.countDownDuration = 300` | `picker.countDownDuration = 300` |
| `picker.minuteInterval = 15` | `picker.minuteInterval = 15` |
| `[picker addTarget:self action:@selector(changed:) forControlEvents:UIControlEventValueChanged]` | `picker.addEventListener('change', changed)` |

和原生不一样的四处，原生在这些情况下不报错，这里都抛 `TypeError`：

| 情况 | 原生的反应 |
| --- | --- |
| `minuteInterval` 写了不能整除 60 的数 | 不做任何事，属性还是原来的值 |
| 不在倒计时模式下写 `countDownDuration` | 丢掉这个值 |
| `countDownDuration` 超出 0 到 86399 | 改成 60 |
| 倒计时或年月模式配 `compact`、`inline` 样式 | 抛一个 JS 接不住的原生异常 |

## 参见

- [让用户选日期和时间](../guides/date-pickers.md)：选样式、只选时间、选时长、用代码改日期
- [`UIControl`](ui-control.md)：`isEnabled`、全部控件事件
- [`Intl.DateTimeFormat`](intl-date.md)：把选中的 `Date` 按地区写成文字
- [`UIStackView`](ui-stack-view.md)：把选择器和别的控件排在一起
