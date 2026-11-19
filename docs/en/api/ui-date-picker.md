---
type: reference
native: UIDatePicker
status: partial
---

# `UIDatePicker`

**`UIDatePicker`** represents a date picker: a system-provided control that lets the user choose a date, a time, or a duration. The order of year, month, and day, 12-hour versus 24-hour time, and the names of months and weekdays are all displayed by the system according to the user's region settings; your code doesn't handle them.

Read and write the selected moment through [`date`](ui-date-picker/date.md), which is a JS `Date`. After the user changes the selection, the control fires the [`change`](ui-control/change-event.md) event. Writing `date` in code doesn't fire `change`.

The picker has two independent settings:

- **What to choose**, decided by [`datePickerMode`](ui-date-picker/datepickermode.md): only a time, only a date, both date and time, a duration, or only a year and month.
- **What it looks like**, decided by [`preferredDatePickerStyle`](ui-date-picker/preferreddatepickerstyle.md), which has three options:

| Style | Appearance | Space taken |
| --- | --- | --- |
| `'compact'` | A small button showing the current date; tapping it pops up a calendar | One line; measured at 36 [pt](units.md) high on iOS 27.2 |
| `'wheels'` | Several columns of wheels that scroll up and down, embedded directly in the view controller | Measured at 320 × 216 pt |
| `'inline'` | A full calendar laid out directly in the view controller | The size of a calendar |

By default the system chooses; on iPhone it is `'compact'`. To see which one is actually used, read [`datePickerStyle`](ui-date-picker/datepickerstyle.md). The duration and year-and-month modes only have the wheels style.

`date` is a moment in time with no time zone. The picker displays it in the device's time zone, the same time zone used by `Date`'s `getHours()` and `toLocaleString()`. In the date-only mode, `date` is still a complete moment.

A date picker is a [control](ui-control.md): disabling, state, and events come from `UIControl`. A control is in turn a [view](ui-view.md): position and size come from `UIView`.

**Inheritance**: `EventTarget` → `NSObject` → `UIResponder` → [`UIView`](ui-view.md) → [`UIControl`](ui-control.md) → `UIDatePicker`

For which style to choose, how to choose a duration, and how to limit the range, see the guide [Letting the user pick a date and time](../guides/date-pickers.md).

## Constructor

[`UIDatePicker()`](ui-date-picker/constructor.md)

Creates a date picker with the moment of creation selected.

## Instance properties

Also inherits the properties of [`UIControl`](ui-control.md) and [`UIView`](ui-view.md). The inherited properties most often used on a date picker are `isEnabled` and `translatesAutoresizingMaskIntoConstraints`.

Dates:

| Property | Description |
| --- | --- |
| [`date`](ui-date-picker/date.md) | The selected moment |
| [`minimumDate`](ui-date-picker/minimumdate.md) | The earliest moment that can be chosen |
| [`maximumDate`](ui-date-picker/maximumdate.md) | The latest moment that can be chosen |

Mode and style:

| Property | Description |
| --- | --- |
| [`datePickerMode`](ui-date-picker/datepickermode.md) | What to choose: time, date, both, duration, or year and month |
| [`preferredDatePickerStyle`](ui-date-picker/preferreddatepickerstyle.md) | The desired style |
| [`datePickerStyle`](ui-date-picker/datepickerstyle.md) <small>read-only</small> | The style actually used |

Duration and minute steps:

| Property | Description |
| --- | --- |
| [`countDownDuration`](ui-date-picker/countdownduration.md) | The selected duration, in the duration mode |
| [`minuteInterval`](ui-date-picker/minuteinterval.md) | How many minutes apart the steps in the minute column are |
| [`roundsToMinuteInterval`](ui-date-picker/roundstominuteinterval.md) | Whether dates written by code are rounded to a step |

## Instance methods

Also inherits the methods of [`UIControl`](ui-control.md) and [`UIView`](ui-view.md).

| Method | Description |
| --- | --- |
| [`setDate()`](ui-date-picker/setdate.md) | Changes the selected moment, optionally animated |

## Events

All events are inherited from [`UIControl`](ui-control.md); listen with `addEventListener()`. The one a date picker uses is:

| Event | When it fires |
| --- | --- |
| [`change`](ui-control/change-event.md) | The user changes the selected date, time, or duration |

## Examples

### Choosing a day within 30 days from today

Starting from a blank app, add a date-only picker, with text below it showing the selected date.

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
  label.text = 'Nothing chosen yet';

  picker.addEventListener('change', () => {
    label.text = 'Chose ' + picker.date.toLocaleDateString();
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

**Effect** (not verified in the simulator)

- A small button showing today's date appears near the top left of the screen, with "Nothing chosen yet" below it.
- Tap the button and a month calendar pops up. Days before today and days more than 30 days out are gray and can't be tapped.
- Tap a day in the calendar; the date on the button changes, and the text becomes "Chose" followed by that day.
- Tap outside the calendar and it closes.

`safeAreaLayoutGuide` is the area of the view controller not covered by the notch and rounded corners; see [Auto Layout](auto-layout.md).

For more techniques, see the guide [Letting the user pick a date and time](../guides/date-pickers.md).

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[[UIDatePicker alloc] init]` | `new UIDatePicker()` |
| `picker.date` (`NSDate`) | `picker.date` (`Date`) |
| `[picker setDate:date animated:YES]` | `picker.setDate(date, { animated: true })` |
| `picker.datePickerMode = UIDatePickerModeDate` | `picker.datePickerMode = 'date'` |
| `picker.preferredDatePickerStyle = UIDatePickerStyleWheels` | `picker.preferredDatePickerStyle = 'wheels'` |
| `picker.countDownDuration = 300` | `picker.countDownDuration = 300` |
| `picker.minuteInterval = 15` | `picker.minuteInterval = 15` |
| `[picker addTarget:self action:@selector(changed:) forControlEvents:UIControlEventValueChanged]` | `picker.addEventListener('change', changed)` |

Four differences from native: native doesn't throw in these cases, but here they all throw `TypeError`:

| Case | Native behavior |
| --- | --- |
| `minuteInterval` written with a number that doesn't divide 60 evenly | Does nothing; the property keeps its old value |
| `countDownDuration` written when not in countdown mode | Discards the value |
| `countDownDuration` outside 0 to 86399 | Changes it to 60 |
| Countdown or year-and-month mode combined with the `compact` or `inline` style | Throws a native exception JS can't catch |

## See also

- [Letting the user pick a date and time](../guides/date-pickers.md): choosing a style, choosing only a time, choosing a duration, changing the date from code
- [`UIControl`](ui-control.md): `isEnabled` and all control events
- [`Intl.DateTimeFormat`](intl-date.md): format the selected `Date` as text for a region
- [`UIStackView`](ui-stack-view.md): arrange the picker with other controls
