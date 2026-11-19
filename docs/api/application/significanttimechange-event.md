---
type: reference
native: UIApplicationSignificantTimeChangeNotification
---

# `Application`：`significanttimechange` 事件

**`significanttimechange`** 事件在时间发生大的变化时派发：过了午夜、时区变了、夏令时切换。

## 语法

```
application.addEventListener('significanttimechange', (event) => { })
```

## 事件对象

`Event`。`target` 是 `application`，不能取消。

## 什么时候派发

- 过了午夜、时区变了、夏令时切换时派发。显示「今天」「昨天」这类相对日期的界面在这时刷新。
- 这个事件的派发**未在模拟器验证**。

## 示例

```js
application.addEventListener('significanttimechange', () => {
  console.log('日期变了，刷新界面上的日期');
});
```

**效果**：过了午夜时输出一行。**未在模拟器验证。**

## 对应的 iOS API

`UIApplicationSignificantTimeChangeNotification`。

## 参见

- [`Application`](../application.md#事件)
