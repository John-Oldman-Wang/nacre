# Letting the user pick a date and time

This guide covers how to use [`UIDatePicker`](../api/ui-date-picker.md) to let the user pick a date, a time, or a duration: choosing a style, limiting the range, picking a duration, and changing the date in code. The details of each property and method are on the [`UIDatePicker`](../api/ui-date-picker.md) reference page.

## Recommended approach

- **For a date field in a form, use the default `'compact'` style.** It takes only one line and shows the calendar only when tapped. Use `'inline'` when picking a date is the main content of the page. Only picking a duration and picking a year and month require wheels; see [Which style to choose](#which-style-to-choose).
- **Listen for [`change`](../api/ui-control/change-event.md) and read [`date`](../api/ui-date-picker/date.md) in the callback.** Writing `date` in code does not fire `change`.
- **Compare dates by year, month, and day, not by milliseconds.** `date` is a complete moment, and it carries hours, minutes, and seconds even in the date-only mode. To check whether two dates are the same day, use `getFullYear()`, `getMonth()`, and `getDate()`.
- **To show a date as text, use `toLocaleDateString()` or [`Intl.DateTimeFormat`](../api/intl-date.md).** They use the same time zone and region settings as the picker.

## The first date picker

Starting from a blank app, put a date-only picker whose range is the 30 days from today, with text below showing the selected date.

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 1. Pick a date only
  const picker = new UIDatePicker();
  picker.datePickerMode = 'date';

  // 2. Only today through 30 days from now can be picked
  const today = new Date();
  picker.minimumDate = today;
  picker.maximumDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

  // 3. Show the selected date
  const label = new UILabel();
  label.text = 'Nothing picked yet';

  // 4. Update the text when the user changes the selection
  picker.addEventListener('change', () => {
    label.text = 'Picked ' + picker.date.toLocaleDateString();
  });

  // 5. Arrange them vertically and put them on the page
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

- A small button showing today's date appears near the top left of the screen, with "Nothing picked yet" below it.
- Tapping that button pops up a month calendar. Days before today and more than 30 days later are gray and cannot be tapped.
- Tapping a day in the calendar changes the date on the button, and the text becomes "Picked" followed by that day.
- Tapping outside the calendar closes it.

The next few sections use a newly created `picker`:

```js
const picker = new UIDatePicker();
```

**Effect**: A picker for both date and time, with the current moment selected, not yet added to the page.

## Which style to choose

The style is decided by [`preferredDatePickerStyle`](../api/ui-date-picker/preferreddatepickerstyle.md):

| Style | Appearance | Suits |
| --- | --- | --- |
| `'compact'` | A small button that pops up a calendar when tapped, 36 pt tall | A field in a form. This is the default on iPhone |
| `'inline'` | A whole calendar laid out on the page | Pages whose main content is picking a date |
| `'wheels'` | Several columns of wheels, 320 × 216 pt | Picking a duration, or a year and month (only this style can); or when you want the feel of wheels |

The sizes were measured on iOS 27.2.

## Laying the calendar directly on the page

```js
picker.preferredDatePickerStyle = 'inline';
console.log(picker.datePickerStyle);
```

**Effect**: Prints `inline`. A whole month calendar is shown directly on the page, without tapping to open it (not verified in the simulator).

## Using wheels

```js
picker.preferredDatePickerStyle = 'wheels';
```

**Effect** (not verified in the simulator): The picker becomes several columns of wheels that the user flicks up and down with a finger.

## Picking only a time, in 15-minute steps

```js
picker.datePickerMode = 'time';
picker.minuteInterval = 15;
```

**Effect** (not verified in the simulator): The picker has only hours and minutes, and the minutes offer only four options: 00, 15, 30, and 45.

After `minuteInterval` is written, `date` is immediately rounded to a step, and `date` values written afterward are rounded too. Measured with 15-minute steps: 22:14:02 became 22:00:02; the minutes are rounded down to a step, the seconds are kept, and the milliseconds are dropped. To keep moments written by code from being rounded, set [`roundsToMinuteInterval`](../api/ui-date-picker/roundstominuteinterval.md) to `false`.

## Picking a duration

The `'countDownTimer'` mode picks "some hours and some minutes", not a moment. It only has the wheels style, and it reads and writes [`countDownDuration`](../api/ui-date-picker/countdownduration.md), not `date`.

```js
const timer = new UIDatePicker();
timer.datePickerMode = 'countDownTimer';
timer.countDownDuration = 5 * 60;
timer.addEventListener('change', () => {
  console.log('Picked', timer.countDownDuration / 60, 'minutes');
});
```

**Effect** (not verified in the simulator): Two columns of wheels, "hours" and "minutes", resting at 0 hours 5 minutes. Turning them to 1 hour 30 minutes prints `Picked 90 minutes` to the console.

Three things to watch for:

- **Switch the mode first, then write the duration.** Writing `countDownDuration` outside this mode throws `TypeError`.
- **The duration is in seconds but only accurate to the minute.** Writing 125 reads back as 120.
- **The minimum is 1 minute.** Writing a number from 0 to 59 reads back as 60.

When `picker.preferredDatePickerStyle` is already `'compact'` or `'inline'`, switching to this mode throws `TypeError`. Change the style to `'wheels'` or `'automatic'` first.

## Changing the date in code

```js
picker.preferredDatePickerStyle = 'wheels';
picker.datePickerMode = 'date';
picker.setDate(new Date(2027, 0, 1), { animated: true });
```

**Effect**: The picker shows January 1, 2027, with the wheels turning to it (the turning is not verified in the simulator).

In `new Date(2027, 0, 1)` the month counts from 0, and 0 is January. Without animation, write `picker.date` directly.

Writing a date earlier than `minimumDate` or later than `maximumDate` does not throw; it is changed to the nearest limit.

## See also

- [`UIDatePicker`](../api/ui-date-picker.md): all properties and methods
- [`Intl.DateTimeFormat`](../api/intl-date.md): writing the selected `Date` as text for a region
- [`UIControl`](../api/ui-control.md): control events and disabling
- [`UIStackView`](../api/ui-stack-view.md): arranging the picker together with other controls
