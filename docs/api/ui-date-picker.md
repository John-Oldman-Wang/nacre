---
type: reference
native: UIDatePicker
status: partial
---

# UIDatePicker

`UIDatePicker` 表示一个日期选择器：系统提供的、让用户选一个日期、一个时间或者一段时长的控件。年月日的顺序、12 小时还是 24 小时、月份和星期的名字，都由系统按用户的地区设置显示，不用代码处理。

它是 [`UIControl`](ui-control.md) 的子类，所以也是一个视图：用 `new UIDatePicker()` 创建，用 `addSubview` 放到页面上。

选中的时刻读写 `date`，它是一个 JS 的 `Date`。用户改了选择之后，控件派发 `change` 事件。

选择器有两个互相独立的设置：

- **选什么**，由 `datePickerMode` 决定：只选时间、只选日期、日期和时间都选、选一段时长、只选年和月。
- **长什么样**，由 `preferredDatePickerStyle` 决定，有三种：

| 样式 | 样子 | 占多大地方 |
| --- | --- | --- |
| `'compact'` | 一个显示着当前日期的小按钮，点了之后弹出日历 | 一行，实测 iOS 27.2 上高 36 pt（[pt 是什么](units.md)） |
| `'wheels'` | 几列可以上下滚动的滚轮，直接嵌在页面里 | 实测 320 × 216 pt |
| `'inline'` | 一整块日历，直接铺在页面里 | 一个日历的大小 |

默认是 `'automatic'`，由系统选：iPhone 上是 `'compact'`。实际用的是哪一种，读 `datePickerStyle`。

**推荐的做法**：表单里的一个日期字段用默认的 `'compact'`，它只占一行。页面的主要内容就是选日期时用 `'inline'`。只有选时长和选年月必须用滚轮，见[选一段时长](#选一段时长)。

**代码写 `date` 不派发 `change`。** 只有用户的操作才派发。这一条**未在模拟器验证**，来自 iOS 的定义。

**`date` 是一个时刻，不带时区。** 选择器按设备的时区显示它，和 `Date` 的 `getHours()`、`toLocaleString()` 用的是同一个时区。只选日期的模式下，`date` 仍然是一个完整的时刻，取年月日时用 `getFullYear()`、`getMonth()`、`getDate()`，不要拿两个 `date` 的毫秒数直接比较是不是同一天。

> **注意**：这一页里的默认值、读写的结果和报错，在模拟器上用一个不带界面的程序跑过。屏幕上的样子和事件的派发还没有在模拟器上验证，下面在对应的地方标出。

## 完整例子

下面的代码从空白 App 开始，放一个只选日期的选择器，范围是今天起的 30 天，下面的文字显示选中的日期。

```js
application.addEventListener('sceneconnect', (e) => {
  // 建窗口和页面。每个 App 都要有这几行
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

**效果**（未在模拟器验证）：

- 屏幕左上方出现一个小按钮，上面是今天的日期，下面是「还没选」。
- 点那个按钮，弹出一个月历。今天之前的日子和 30 天之后的日子是灰的，点不了。
- 点月历里的一天，按钮上的日期变了，文字变成「选了」加那一天。
- 点月历外面，月历收起。

`safeAreaLayoutGuide` 是页面上不被刘海和圆角遮住的那块区域，见 [Auto Layout](auto-layout.md)。

## 常见用法

以下例子都沿用上面的 `picker`。

### 只选时间，每 15 分钟一档

```js
picker.datePickerMode = 'time';
picker.minuteInterval = 15;
```

**效果**（未在模拟器验证）：选择器只有小时和分钟，分钟只有 00、15、30、45 四个选项。

写了 `minuteInterval` 之后，`date` 立刻被取整到档位上，之后写进去的 `date` 也会被取整。实测 15 分钟一档时，22:14:02 变成 22:00:02：分钟向下取到档位上，秒保留，毫秒去掉。

### 日历直接铺在页面上

```js
picker.preferredDatePickerStyle = 'inline';
console.log(picker.datePickerStyle);
```

**效果**：输出 `inline`。页面上直接显示一整块月历，不用点开（未在模拟器验证）。

### 用滚轮

```js
picker.preferredDatePickerStyle = 'wheels';
```

**效果**（未在模拟器验证）：选择器变成几列滚轮，用手指上下拨。

### 选一段时长

`'countDownTimer'` 模式选的是「几小时几分钟」，不是一个时刻。它只有滚轮样式，并且读写的是 `countDownDuration`，不是 `date`。

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

- **先切模式，再写时长。** 不在这个模式下写 `countDownDuration` 会抛。
- **时长的单位是秒，但只精确到分钟。** 写 125，读回来是 120。
- **最短 1 分钟。** 写 0 到 59 之间的数，读回来是 60。

### 用代码改日期

```js
picker.setDate(new Date(2027, 0, 1), { animated: true });
```

**效果**：选择器显示 2027 年 1 月 1 日。滚轮样式下滚轮转过去（未在模拟器验证）。

`new Date(2027, 0, 1)` 的月份从 0 数，0 是 1 月。

写进去的日期早于 `minimumDate` 或者晚于 `maximumDate` 时不报错，被改成最近的那个界限。

## 成员说明

`UIDatePicker` 继承 [`UIControl`](ui-control.md) 和 [`UIView`](ui-view.md) 的全部成员。下面只列它自己的。

### 构造

```js
const picker = new UIDatePicker();
```

没有参数。创建出来选中的是创建的那一刻。

### 日期

| 属性 | 类型 | 可读 | 可写 | 默认值 | 含义 |
| --- | --- | --- | --- | --- | --- |
| `date` | `Date` | 是 | 是 | 创建的那一刻 | 选中的时刻。精确到毫秒 |
| `minimumDate` | `Date` 或 `null` | 是 | 是 | `null` | 能选的最早的时刻。`null` 是不限 |
| `maximumDate` | `Date` 或 `null` | 是 | 是 | `null` | 能选的最晚的时刻。`null` 是不限 |

每次读得到一个新的 `Date` 对象。改这个对象不会影响选择器，要改选中的日期就写 `date`。

写入只接受 `Date`，不从字符串或时间戳转换。

`minimumDate` 晚于 `maximumDate` 时不报错，两个界限都不起作用。

`date` 变了的通知：用户改了选择时派发 `change`。代码写入不派发。

- **出错**：
  - 给的不是 `Date`：`TypeError: date must be a Date, got "2026-01-01"`
  - 给的是无效的 `Date`（比如 `new Date('abc')`）：`TypeError: date must be a valid Date, got an invalid one`
  - `date` 写 `null`：`TypeError: date must be a Date, got null`

### 模式和样式

| 属性 | 类型 | 可读 | 可写 | 默认值 | 含义 |
| --- | --- | --- | --- | --- | --- |
| `datePickerMode` | `UIDatePickerMode` | 是 | 是 | `'dateAndTime'` | 选什么，见下表 |
| `preferredDatePickerStyle` | `UIDatePickerStyle` | 是 | 是 | `'automatic'` | 想要的样式，见下表 |
| `datePickerStyle` | `'wheels'`、`'compact'` 或 `'inline'` | 是 | 否 | `'compact'` | 实际用的样式 |

`datePickerMode` 的取值：

| 取值 | 选什么 | 能用的样式 |
| --- | --- | --- |
| `'time'` | 小时和分钟 | 三种都行 |
| `'date'` | 年月日 | 三种都行 |
| `'dateAndTime'` | 日期加上小时和分钟 | 三种都行 |
| `'countDownTimer'` | 一段时长：几小时几分钟。读写 `countDownDuration` | 只有 `'wheels'` |
| `'yearAndMonth'` | 年和月 | 只有 `'wheels'` |

`preferredDatePickerStyle` 的取值：

| 取值 | 效果 |
| --- | --- |
| `'automatic'` | 系统选。`'countDownTimer'` 和 `'yearAndMonth'` 模式下是 `'wheels'`，其余模式下是 `'compact'` |
| `'wheels'` | 滚轮 |
| `'compact'` | 一个小按钮，点了弹出日历或滚轮 |
| `'inline'` | 日历直接显示在页面里 |

- `datePickerMode`、`preferredDatePickerStyle` 写了表里没有的值时不抛异常：属性保持原来的值，控制台输出一条警告，比如 `[Nacre] datePickerMode has no value "week"; expected one of: time / date / dateAndTime / countDownTimer / yearAndMonth, ignored`。
- **出错**：
  - 模式和样式配不上，写模式时：`TypeError: datePickerMode "countDownTimer" only works with the wheels style, but preferredDatePickerStyle is "compact"; set it to "wheels" or "automatic" first`
  - 模式和样式配不上，写样式时：`TypeError: preferredDatePickerStyle "inline" does not support datePickerMode "countDownTimer"; that mode only works with "wheels" or "automatic"`

  抛了之后属性保持原来的值。

### 时长和分钟的档位

| 属性 | 类型 | 可读 | 可写 | 默认值 | 含义 |
| --- | --- | --- | --- | --- | --- |
| `countDownDuration` | `number` | 是 | 是 | 见下 | `'countDownTimer'` 模式下选中的时长，秒。只能在这个模式下写，范围 0 到 86399（23 小时 59 分） |
| `minuteInterval` | `number` | 是 | 是 | 1 | 分钟那一栏隔几分钟一档。必须能整除 60，并且在 1 到 30 之间：1、2、3、4、5、6、10、12、15、20、30 |
| `roundsToMinuteInterval` | `boolean` | 是 | 是 | `true` | `true`：`date` 总是被取整到 `minuteInterval` 的档位上。`false`：代码写进去的 `date` 不取整 |

`countDownDuration` 在一个没进过 `'countDownTimer'` 模式的选择器上读出来是 0；切到这个模式之后是 60。

- **出错**：
  - 不在倒计时模式下写时长：`TypeError: countDownDuration can only be set while datePickerMode is "countDownTimer"; it is "dateAndTime"`
  - 时长超出范围：`TypeError: countDownDuration must be between 0 and 86399 seconds, got 86400`
  - 档位不合法：`TypeError: minuteInterval must divide 60 evenly and be between 1 and 30, got 7`

### 方法

| 方法 | 作用 |
| --- | --- |
| `setDate(date, options?)` | 把选中的时刻改成 `date`。`options.animated` 为 `true` 时带动画。没有返回值 |

- **出错**：`TypeError: setDate must be a Date, got 1700000000000`

### 事件

事件是 [`UIControl`](ui-control.md#事件) 的那 16 个。日期选择器用到的是：

| 事件 | 什么时候派发 |
| --- | --- |
| `change` | 用户改了选中的日期、时间或时长 |

## 与 iOS 原生写法的对照

| ObjC | JS |
| --- | --- |
| `[[UIDatePicker alloc] init]` | `new UIDatePicker()` |
| `picker.date`（`NSDate`） | `picker.date`（`Date`） |
| `[picker setDate:date animated:YES]` | `picker.setDate(date, { animated: true })` |
| `picker.datePickerMode = UIDatePickerModeDate` | `picker.datePickerMode = 'date'` |
| `picker.preferredDatePickerStyle = UIDatePickerStyleWheels` | `picker.preferredDatePickerStyle = 'wheels'` |
| `picker.countDownDuration = 300` | `picker.countDownDuration = 300` |
| `picker.minuteInterval = 15` | `picker.minuteInterval = 15` |

和原生不一样的四处，原生在这些情况下不报错，这里都抛 `TypeError`：

| 情况 | 原生的反应 |
| --- | --- |
| `minuteInterval` 写了不能整除 60 的数 | 不做任何事，属性还是原来的值 |
| 不在倒计时模式下写 `countDownDuration` | 丢掉这个值 |
| `countDownDuration` 超出 0 到 86399 | 改成 60 |
| 倒计时或年月模式配 `compact`、`inline` 样式 | 抛一个 JS 接不住的原生异常 |

## 与浏览器的对照

| 浏览器 | Nacre |
| --- | --- |
| `<input type="date">` | `datePickerMode = 'date'` |
| `<input type="time" step="900">` | `datePickerMode = 'time'`，`minuteInterval = 15` |
| `<input type="datetime-local">` | `datePickerMode = 'dateAndTime'` |
| `<input type="month">` | `datePickerMode = 'yearAndMonth'` |
| `input.valueAsDate` | `picker.date` |
| `input.min`、`input.max`（字符串） | `picker.minimumDate`、`picker.maximumDate`（`Date`） |
| `change` 事件 | `change` |

## 还不能做的

| 想做的事 | 对应的原生能力 | 状态 |
| --- | --- | --- |
| 让选择器用另一种语言或地区的格式显示 | `locale` | 未实现 |
| 让选择器按另一个时区显示 | `timeZone` | 未实现 |
| 换一种历法（农历、佛历） | `calendar` | 未实现 |

## 参见

- [`UIControl`](ui-control.md)：`isEnabled`、16 个控件事件
- [`Intl.DateTimeFormat`](intl-date.md)：把选中的 `Date` 按地区写成文字
- [`UIStackView`](ui-stack-view.md)：把选择器和别的控件排在一起
- [实现原理](../internals/value-controls.md)：默认值和边界行为是怎么量的
