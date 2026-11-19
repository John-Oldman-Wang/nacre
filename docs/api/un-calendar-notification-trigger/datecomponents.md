---
type: reference
native: UNCalendarNotificationTrigger.dateComponents
---

# `UNCalendarNotificationTrigger`：`dateComponents` 属性

**`dateComponents`** 属性是这个触发器要匹配的日期分量。

## 值

普通对象，只有写了的那几个键，分量名见 [`triggerWithDateMatchingComponents()`](triggerwithdatematchingcomponents.md#参数)。

- 只读。给它赋值抛 `TypeError`：`dateComponents is read-only`。
- 对象是冻结的，改它的键抛 `TypeError`。
- 没写的分量没有这个键，读出来是 `undefined`。
- 键的先后固定，和写进去的先后无关。

## 示例

```js
const trigger = UNCalendarNotificationTrigger.triggerWithDateMatchingComponents(
  { minute: 30, hour: 8, day: null });
console.log(JSON.stringify(trigger.dateComponents), trigger.dateComponents.day);
```

**结果**：输出 `{"hour":8,"minute":30} undefined`。

## 对应的 iOS API

`UNCalendarNotificationTrigger.dateComponents`。ObjC 里没写的分量是 `NSDateComponentUndefined`，这里是没有这个键：`c.day == NSDateComponentUndefined` 写成 `trigger.dateComponents.day === undefined`。

## 参见

- [`triggerWithDateMatchingComponents()`](triggerwithdatematchingcomponents.md)
- 这个类属于 `@nacrejs/user-notifications` 包，装法见[要先安装](../un-user-notification-center.md#要先安装)
